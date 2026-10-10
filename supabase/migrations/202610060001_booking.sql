-- New, separate booking module. Does not modify existing seats/reservations tables.
-- Run once in Supabase SQL Editor. Server timestamps use Asia/Colombo opening hours.
begin;
create extension if not exists btree_gist with schema extensions;
set local search_path = public, extensions;

create table public.booking_seat_resources (
  id text primary key,
  label text not null,
  floor integer not null check (floor between 1 and 3),
  table_number integer not null check (table_number in (1,2)),
  charging boolean not null default false,
  enabled boolean not null default true
);
insert into public.booking_seat_resources (id, label, floor, table_number, charging)
select 'F'||f||'-'||p||n, p||n, f, case when p='A' then 1 else 2 end, n % 2 = 0
from generate_series(1,3) f cross join (values ('A'),('B')) prefix(p) cross join generate_series(1,10) n;

create table public.booking_room_resources (
  id text primary key,
  label text not null,
  floor integer not null,
  capacity integer not null check (capacity between 2 and 8),
  enabled boolean not null default true
);
insert into public.booking_room_resources values
('ROOM-201','Study Room 201',2,8,true), ('ROOM-202','Study Room 202',2,6,true), ('ROOM-301','Study Room 301',3,4,true);

create table public.booking_reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('seat','room')),
  resource_id text not null default '',
  resource_label text not null,
  floor integer not null default 0,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null check (status in ('reserved','checked_in','pending','approved','rejected','cancelled')),
  purpose text not null default '',
  student_ids text[] not null default '{}',
  preference text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  check (end_at > start_at),
  check ((kind='seat' and status in ('reserved','checked_in','cancelled')) or (kind='room' and status in ('pending','approved','rejected','cancelled'))),
  constraint booking_resource_overlap exclude using gist
    (resource_id with =, tstzrange(start_at,end_at,'[)') with &&)
    where (resource_id <> '' and status in ('reserved','checked_in','approved')),
  constraint booking_student_overlap exclude using gist
    (user_id with =, tstzrange(start_at,end_at,'[)') with &&)
    where (status in ('reserved','checked_in','pending','approved'))
);
create index booking_user_created on public.booking_reservations(user_id,created_at desc);
alter table public.booking_seat_resources enable row level security;
alter table public.booking_room_resources enable row level security;
alter table public.booking_reservations enable row level security;
create policy booking_read_seats on public.booking_seat_resources for select to authenticated using (true);
create policy booking_read_rooms on public.booking_room_resources for select to authenticated using (true);
create policy booking_read_own on public.booking_reservations for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.booking_seat_resources, public.booking_room_resources, public.booking_reservations from anon, authenticated;
grant select on public.booking_seat_resources, public.booking_room_resources, public.booking_reservations to authenticated;
grant all on public.booking_seat_resources, public.booking_room_resources, public.booking_reservations to service_role;

create function public.booking_validate_slot(p_start timestamptz, p_end timestamptz)
returns void language plpgsql set search_path = '' as $$
declare local_start timestamp := p_start at time zone 'Asia/Colombo';
begin
  if p_start is null or p_end is null or p_start <= now() or p_start > now() + interval '30 days' then
    raise exception 'Choose a future time slot within 30 days.';
  end if;
  if p_end <> p_start + interval '2 hours' or extract(hour from local_start) not in (9,11,13,15)
    or extract(minute from local_start) <> 0 or extract(second from local_start) <> 0 then
    raise exception 'Select one of the library two-hour time slots (Sri Lanka time).';
  end if;
end $$;

create function public.booking_occupied_seats(p_start timestamptz, p_end timestamptz, p_floor integer)
returns table(resource_id text) language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  perform public.booking_validate_slot(p_start,p_end);
  return query select b.resource_id from public.booking_reservations b
    where b.kind='seat' and b.floor=p_floor and b.status in ('reserved','checked_in')
      and b.start_at < p_end and b.end_at > p_start
    union select s.id from public.booking_seat_resources s where s.floor=p_floor and not s.enabled;
end $$;

create function public.booking_reserve_seat(p_resource text, p_start timestamptz, p_end timestamptz)
returns public.booking_reservations language plpgsql security definer set search_path = '' as $$
declare seat public.booking_seat_resources; result public.booking_reservations;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  perform public.booking_validate_slot(p_start,p_end);
  select * into seat from public.booking_seat_resources where id=p_resource and enabled for share;
  if not found then raise exception 'Seat is unavailable.'; end if;
  insert into public.booking_reservations(user_id,kind,resource_id,resource_label,floor,start_at,end_at,status)
  values(auth.uid(),'seat',seat.id,'Seat '||seat.label,seat.floor,p_start,p_end,'reserved') returning * into result;
  return result;
exception when exclusion_violation then raise exception 'Seat unavailable, or you already have a booking during this time.';
end $$;

create function public.booking_request_room(p_start timestamptz, p_end timestamptz, p_purpose text, p_students text[], p_preference text, p_notes text)
returns public.booking_reservations language plpgsql security definer set search_path = '' as $$
declare result public.booking_reservations; ids text[];
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  perform public.booking_validate_slot(p_start,p_end);
  if p_purpose is null or length(trim(p_purpose)) not between 3 and 200 then raise exception 'Enter a purpose between 3 and 200 characters.'; end if;
  if p_students is null or cardinality(p_students) not between 2 and 8 then raise exception 'Enter 2-8 students.'; end if;
  select array_agg(upper(trim(s))) into ids from unnest(p_students) s;
  if exists(select 1 from unnest(ids) s where s is null or s !~ '^[A-Z0-9-]{4,30}$')
    or (select count(distinct s) from unnest(ids) s) <> cardinality(ids) then raise exception 'Enter valid, unique student IDs.'; end if;
  if p_preference is null or p_preference not in ('Any available room','Quiet study room','Discussion room') then raise exception 'Select a room preference.'; end if;
  if length(coalesce(p_notes,'')) > 1000 then raise exception 'Notes are too long.'; end if;
  insert into public.booking_reservations(user_id,kind,resource_label,start_at,end_at,status,purpose,student_ids,preference,notes)
  values(auth.uid(),'room','Room awaiting allocation',p_start,p_end,'pending',trim(p_purpose),ids,p_preference,trim(coalesce(p_notes,''))) returning * into result;
  return result;
exception when exclusion_violation then raise exception 'You already have a booking during this time.';
end $$;

create function public.booking_change_status(p_id uuid, p_action text)
returns public.booking_reservations language plpgsql security definer set search_path = '' as $$
declare result public.booking_reservations;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  select * into result from public.booking_reservations where id=p_id and user_id=auth.uid() for update;
  if not found then raise exception 'Booking not found.'; end if;
  if result.status not in ('reserved','checked_in','pending','approved') or result.end_at <= now() then raise exception 'Booking is no longer active.'; end if;
  if p_action='checkin' then
    if result.kind<>'seat' or result.status<>'reserved' then raise exception 'Only reserved seats can be checked in.'; end if;
    if now() < result.start_at - interval '15 minutes' or now() > result.start_at + interval '30 minutes' then
      raise exception 'Check in from 15 minutes before to 30 minutes after the booking starts.';
    end if;
    update public.booking_reservations set status='checked_in' where id=p_id returning * into result;
  elsif p_action='cancel' then
    update public.booking_reservations set status='cancelled' where id=p_id returning * into result;
  else raise exception 'Unsupported action.';
  end if;
  return result;
end $$;

-- Server/admin-only endpoint. Never call with a service-role key from a mobile app.
create function public.booking_admin_decide(p_id uuid, p_approve boolean, p_room text default null)
returns public.booking_reservations language plpgsql security definer set search_path = '' as $$
declare result public.booking_reservations; room public.booking_room_resources;
begin
  if p_approve is null then raise exception 'Specify approve or reject.'; end if;
  select * into result from public.booking_reservations where id=p_id and kind='room' and status='pending' for update;
  if not found then raise exception 'Pending room request not found.'; end if;
  if result.start_at <= now() then raise exception 'This request has expired.'; end if;
  if p_approve then
    select * into room from public.booking_room_resources where id=p_room and enabled for share;
    if not found then raise exception 'Choose an available room.'; end if;
    if room.capacity < cardinality(result.student_ids) then raise exception 'Room capacity is too small.'; end if;
    update public.booking_reservations set status='approved', resource_id=room.id, resource_label=room.label, floor=room.floor where id=p_id returning * into result;
  else
    update public.booking_reservations set status='rejected' where id=p_id returning * into result;
  end if;
  return result;
exception when exclusion_violation then raise exception 'The selected room is already allocated during this time.';
end $$;

revoke all on function public.booking_validate_slot(timestamptz,timestamptz) from public,anon,authenticated;
revoke all on function public.booking_occupied_seats(timestamptz,timestamptz,integer) from public,anon,authenticated;
revoke all on function public.booking_reserve_seat(text,timestamptz,timestamptz) from public,anon,authenticated;
revoke all on function public.booking_request_room(timestamptz,timestamptz,text,text[],text,text) from public,anon,authenticated;
revoke all on function public.booking_change_status(uuid,text) from public,anon,authenticated;
revoke all on function public.booking_admin_decide(uuid,boolean,text) from public,anon,authenticated;
grant execute on function public.booking_occupied_seats(timestamptz,timestamptz,integer) to authenticated;
grant execute on function public.booking_reserve_seat(text,timestamptz,timestamptz) to authenticated;
grant execute on function public.booking_request_room(timestamptz,timestamptz,text,text[],text,text) to authenticated;
grant execute on function public.booking_change_status(uuid,text) to authenticated;
grant execute on function public.booking_admin_decide(uuid,boolean,text) to service_role;
commit;
