begin;

-- Requires the original booking migration and its overlap constraints.
create or replace function public.booking_update_seat(
  p_id uuid,
  p_start timestamptz,
  p_end timestamptz
)
returns public.booking_reservations
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.booking_reservations;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;

  select * into result from public.booking_reservations
  where id = p_id and user_id = auth.uid()
  for update;

  if not found or result.kind <> 'seat' then
    raise exception 'Seat reservation not found.';
  end if;
  if result.status <> 'reserved' or result.start_at <= clock_timestamp() then
    raise exception 'Only future reservations that have not been checked in can be updated.';
  end if;

  perform public.booking_validate_slot(p_start, p_end);
  perform 1 from public.booking_seat_resources
  where id = result.resource_id and enabled for share;
  if not found then raise exception 'Seat is unavailable.'; end if;

  -- Existing exclusion constraints prevent seat and student double booking,
  -- including concurrent reservations. Failure rolls this update back.
  update public.booking_reservations
  set start_at = p_start, end_at = p_end
  where id = result.id
  returning * into result;
  return result;
exception when exclusion_violation then
  raise exception 'Seat unavailable, or you already have a booking during this time. Your reservation was not changed.';
end;
$$;

revoke all on function public.booking_update_seat(uuid,timestamptz,timestamptz)
from public, anon, authenticated;
grant execute on function public.booking_update_seat(uuid,timestamptz,timestamptz)
to authenticated;

notify pgrst, 'reload schema';
commit;
