create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,

  reservation_confirmations boolean not null default true,
  reservation_reminders boolean not null default true,
  reservation_updates boolean not null default true,
  general_notifications boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


insert into public.notification_preferences (
  user_id,
  reservation_confirmations,
  reservation_reminders,
  reservation_updates,
  general_notifications
)
select
  id,
  true,
  true,
  true,
  true
from auth.users
on conflict (user_id) do nothing;


create or replace function public.handle_new_user_notification_preferences()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notification_preferences (
    user_id,
    reservation_confirmations,
    reservation_reminders,
    reservation_updates,
    general_notifications
  )
  values (
    new.id,
    true,
    true,
    true,
    true
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;


drop trigger if exists on_auth_user_created_notification_preferences
on auth.users;


create trigger on_auth_user_created_notification_preferences
after insert on auth.users
for each row
execute function public.handle_new_user_notification_preferences();


alter table public.notification_preferences
enable row level security;


drop policy if exists
"Users can read own notification preferences"
on public.notification_preferences;

create policy
"Users can read own notification preferences"
on public.notification_preferences
for select
using (auth.uid() = user_id);


drop policy if exists
"Users can update own notification preferences"
on public.notification_preferences;

create policy
"Users can update own notification preferences"
on public.notification_preferences
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


alter table public.notifications
enable row level security;


drop policy if exists
"Users can read own notifications"
on public.notifications;

create policy
"Users can read own notifications"
on public.notifications
for select
using (auth.uid() = user_id);


drop policy if exists
"Users can update own notifications"
on public.notifications;

create policy
"Users can update own notifications"
on public.notifications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


drop policy if exists
"Users can insert own notifications"
on public.notifications;

create policy
"Users can insert own notifications"
on public.notifications
for insert
with check (auth.uid() = user_id);


create or replace function public.create_app_notification(
  p_title text,
  p_message text,
  p_type text
)
returns public.notifications
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_allowed boolean;
  v_notification public.notifications;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'User is not authenticated';
  end if;

  select
    case p_type
      when 'reservation_confirmation'
        then reservation_confirmations
      when 'reservation_reminder'
        then reservation_reminders
      when 'reservation_update'
        then reservation_updates
      when 'general'
        then general_notifications
      else true
    end
  into v_allowed
  from public.notification_preferences
  where user_id = v_user_id;

  if v_allowed is null then
    v_allowed := true;
  end if;

  if v_allowed = false then
    return null;
  end if;

  insert into public.notifications (
    user_id,
    title,
    message,
    notification_type
  )
  values (
    v_user_id,
    p_title,
    p_message,
    p_type
  )
  returning *
  into v_notification;

  return v_notification;
end;
$$;