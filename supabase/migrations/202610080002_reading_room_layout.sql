begin;

-- Keeps existing booking rows and the original 20 seat IDs on each floor.
-- Do not rerun the original booking table-creation migration.
alter table public.booking_seat_resources
  drop constraint if exists booking_seat_resources_table_number_check,
  drop constraint if exists booking_seat_table_number_positive,
  drop constraint if exists booking_seat_role_check,
  drop constraint if exists booking_seat_chair_positive;

alter table public.booking_seat_resources
  add column if not exists allowed_role text not null default 'student',
  add column if not exists chair_number integer not null default 1;

alter table public.booking_seat_resources
  add constraint booking_seat_table_number_positive check (table_number > 0),
  add constraint booking_seat_role_check check (allowed_role in ('student','lecturer')),
  add constraint booking_seat_chair_positive check (chair_number > 0);

-- The selected role is stored by your existing saveRole() in user metadata.
-- This follows the current self-selection flow; it is not lecturer verification.
create or replace function public.booking_selected_role()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare selected_role text;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  select u.raw_user_meta_data ->> 'role' into selected_role
  from auth.users u where u.id = auth.uid();
  if selected_role is null or selected_role not in ('student','lecturer') then
    raise exception 'Select Student or Lecturer before booking a seat.';
  end if;
  return selected_role;
end;
$$;
revoke all on function public.booking_selected_role() from public, anon, authenticated;
grant execute on function public.booking_selected_role() to authenticated;

with tables as (
  select 'student'::text as role, 1 as floor, t as table_number, 8 as chairs
  from generate_series(1,20) t
  union all
  select 'student', 2, t, case when t <= 12 then 3 else 8 end
  from generate_series(1,20) t
  union all
  select 'student', 3, t, case when t <= 3 then 5 else 10 end
  from generate_series(1,13) t
  union all
  select 'lecturer', f, t, 8
  from generate_series(1,2) f cross join generate_series(1,2) t
), numbered as (
  select role, floor, table_number, c as chair_number,
    row_number() over (partition by role, floor order by table_number, c)::integer as ordinal
  from tables cross join lateral generate_series(1,chairs) c
), labelled as (
  select *,
    case when role='student' then 'S' else 'L' end || '-T' ||
    lpad(table_number::text,2,'0') || '-C' || lpad(chair_number::text,2,'0') as label
  from numbered
)
insert into public.booking_seat_resources
  (id,label,floor,table_number,chair_number,allowed_role,charging,enabled)
select
  case when role='student' and ordinal <= 20
    then 'F' || floor || '-' || case when ordinal <= 10 then 'A' || ordinal else 'B' || (ordinal-10) end
    else 'F' || floor || '-' || label
  end,
  label,floor,table_number,chair_number,role,
  (role='student' and ordinal <= 20 and ordinal % 2 = 0),true
from labelled
on conflict (id) do update set
  label=excluded.label,
  floor=excluded.floor,
  table_number=excluded.table_number,
  chair_number=excluded.chair_number,
  allowed_role=excluded.allowed_role;
-- Preserve existing enabled/charging settings on conflict.

drop policy if exists booking_read_seats on public.booking_seat_resources;
create policy booking_read_seats on public.booking_seat_resources
for select to authenticated
using (allowed_role = (select public.booking_selected_role()));

create or replace function public.booking_occupied_seats(
  p_start timestamptz,p_end timestamptz,p_floor integer
)
returns table(resource_id text)
language plpgsql security definer set search_path = ''
as $$
declare selected_role text;
begin
  selected_role := public.booking_selected_role();
  perform public.booking_validate_slot(p_start,p_end);
  if not exists (
    select 1 from public.booking_seat_resources s
    where s.floor=p_floor and s.allowed_role=selected_role
  ) then raise exception 'This floor has no seats for your account role.'; end if;
  return query
  select b.resource_id from public.booking_reservations b
  join public.booking_seat_resources s on s.id=b.resource_id
  where b.kind='seat' and s.floor=p_floor and s.allowed_role=selected_role
    and b.status in ('reserved','checked_in')
    and b.start_at < p_end and b.end_at > p_start
  union
  select s.id from public.booking_seat_resources s
  where s.floor=p_floor and s.allowed_role=selected_role and not s.enabled;
end;
$$;

create or replace function public.booking_reserve_seat(
  p_resource text,p_start timestamptz,p_end timestamptz
)
returns public.booking_reservations
language plpgsql security definer set search_path = ''
as $$
declare
  selected_role text;
  seat public.booking_seat_resources;
  result public.booking_reservations;
begin
  selected_role := public.booking_selected_role();
  perform public.booking_validate_slot(p_start,p_end);
  select * into seat from public.booking_seat_resources
  where id=p_resource and enabled and allowed_role=selected_role for share;
  if not found then raise exception 'Seat is unavailable for your account role.'; end if;
  insert into public.booking_reservations
    (user_id,kind,resource_id,resource_label,floor,start_at,end_at,status)
  values
    (auth.uid(),'seat',seat.id,'Seat '||seat.label,seat.floor,p_start,p_end,'reserved')
  returning * into result;
  return result;
exception when exclusion_violation then
  raise exception 'Seat unavailable, or you already have a booking during this time.';
end;
$$;

-- Retains the date/time update feature with a role check on the same seat.
create or replace function public.booking_update_seat(
  p_id uuid,p_start timestamptz,p_end timestamptz
)
returns public.booking_reservations
language plpgsql security definer set search_path = ''
as $$
declare
  selected_role text;
  result public.booking_reservations;
begin
  selected_role := public.booking_selected_role();
  select * into result from public.booking_reservations
  where id=p_id and user_id=auth.uid() for update;
  if not found or result.kind <> 'seat' then raise exception 'Seat reservation not found.'; end if;
  if result.status <> 'reserved' or result.start_at <= clock_timestamp() then
    raise exception 'Only future reservations that have not been checked in can be updated.';
  end if;
  perform public.booking_validate_slot(p_start,p_end);
  perform 1 from public.booking_seat_resources
  where id=result.resource_id and enabled and allowed_role=selected_role for share;
  if not found then raise exception 'Seat is unavailable for your current account role.'; end if;
  update public.booking_reservations set start_at=p_start,end_at=p_end
  where id=result.id returning * into result;
  return result;
exception when exclusion_violation then
  raise exception 'Seat unavailable, or you already have a booking during this time. Your reservation was not changed.';
end;
$$;

revoke all on function public.booking_occupied_seats(timestamptz,timestamptz,integer) from public,anon,authenticated;
revoke all on function public.booking_reserve_seat(text,timestamptz,timestamptz) from public,anon,authenticated;
revoke all on function public.booking_update_seat(uuid,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.booking_occupied_seats(timestamptz,timestamptz,integer) to authenticated;
grant execute on function public.booking_reserve_seat(text,timestamptz,timestamptz) to authenticated;
grant execute on function public.booking_update_seat(uuid,timestamptz,timestamptz) to authenticated;

notify pgrst, 'reload schema';
commit;
