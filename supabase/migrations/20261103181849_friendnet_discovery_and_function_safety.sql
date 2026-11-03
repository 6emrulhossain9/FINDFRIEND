-- Expose shared interests only for profiles already visible in discovery.
create policy "user_interests_select_active_profiles"
  on public.user_interests
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles_public as visible_profile
      where visible_profile.id = user_interests.user_id
    )
  );

-- age_bracket uses the current date and is therefore STABLE, not IMMUTABLE.
create or replace function public.age_bracket(date_of_birth date)
returns text
language sql
stable
set search_path = ''
as $$
  select
    case
      when date_of_birth is null then null
      when extract(year from age(now(), date_of_birth))::int < 13 then '13-15'
      when extract(year from age(now(), date_of_birth))::int < 16 then '16-18'
      when extract(year from age(now(), date_of_birth))::int < 21 then '18-20'
      when extract(year from age(now(), date_of_birth))::int < 26 then '21-25'
      when extract(year from age(now(), date_of_birth))::int < 31 then '26-30'
      when extract(year from age(now(), date_of_birth))::int < 41 then '31-40'
      when extract(year from age(now(), date_of_birth))::int < 51 then '41-50'
      else '50+'
    end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Keep the filtered public profile projection behind a security barrier.
create or replace view public.profiles_public
with (security_barrier = true)
as
select
  id,
  display_name,
  public.age_bracket(date_of_birth) as age_bracket,
  avatar_url,
  bio,
  onboarding_state,
  created_at
from public.profiles
where deleted_at is null
  and onboarding_state = 'active';

alter view public.profiles_public owner to postgres;

-- This event-trigger helper is not intended to be callable through the API.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
