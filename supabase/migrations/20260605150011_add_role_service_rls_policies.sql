create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin'::public.profile_role, 'professional'::public.profile_role)
  );
$$;

create or replace function public.has_specialty(required_specialty public.professional_specialty)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.professional_profiles pp
    join public.profiles p on p.id = pp.profile_id
    where pp.profile_id = auth.uid()
      and p.role in ('admin'::public.profile_role, 'professional'::public.profile_role)
      and (
        pp.specialty = required_specialty
        or pp.specialty = 'both'::public.professional_specialty
      )
  );
$$;

create or replace function public.is_client_assigned_to_current_professional(client_profile_id uuid, area public.service_area)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.client_profiles cp
    where cp.profile_id = client_profile_id
      and (
        (area = 'nutrition'::public.service_area and cp.assigned_nutritionist_id = auth.uid())
        or
        (area = 'training'::public.service_area and cp.assigned_trainer_id = auth.uid())
        or
        (area = 'general'::public.service_area and (
          cp.assigned_nutritionist_id = auth.uid()
          or cp.assigned_trainer_id = auth.uid()
        ))
      )
  );
$$;

drop policy if exists "Professionals can read professional profiles" on public.professional_profiles;
drop policy if exists "Admins manage professional profiles" on public.professional_profiles;

create policy "Professionals can read professional profiles"
on public.professional_profiles
for select
to authenticated
using (public.is_admin() or profile_id = auth.uid());

create policy "Admins manage professional profiles"
on public.professional_profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Clients and assigned professionals read client profiles" on public.client_profiles;
drop policy if exists "Admins manage client profiles" on public.client_profiles;
drop policy if exists "Clients update own client profile" on public.client_profiles;

create policy "Clients and assigned professionals read client profiles"
on public.client_profiles
for select
to authenticated
using (
  profile_id = auth.uid()
  or public.is_admin()
  or assigned_nutritionist_id = auth.uid()
  or assigned_trainer_id = auth.uid()
);

create policy "Admins manage client profiles"
on public.client_profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clients update own client profile"
on public.client_profiles
for update
to authenticated
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

drop policy if exists "Diet plans visible to client nutritionist and admins" on public.diet_plans;
drop policy if exists "Nutrition admins manage diet plans" on public.diet_plans;

create policy "Diet plans visible to client nutritionist and admins"
on public.diet_plans
for select
to authenticated
using (
  client_id = auth.uid()
  or nutritionist_id = auth.uid()
  or public.is_admin()
);

create policy "Nutrition admins manage diet plans"
on public.diet_plans
for all
to authenticated
using (
  public.has_specialty('nutrition'::public.professional_specialty)
  and nutritionist_id = auth.uid()
)
with check (
  public.has_specialty('nutrition'::public.professional_specialty)
  and nutritionist_id = auth.uid()
);

drop policy if exists "Workout plans visible to client trainer and admins" on public.workout_plans;
drop policy if exists "Training admins manage workout plans" on public.workout_plans;

create policy "Workout plans visible to client trainer and admins"
on public.workout_plans
for select
to authenticated
using (
  client_id = auth.uid()
  or trainer_id = auth.uid()
  or public.is_admin()
);

create policy "Training admins manage workout plans"
on public.workout_plans
for all
to authenticated
using (
  public.has_specialty('training'::public.professional_specialty)
  and trainer_id = auth.uid()
)
with check (
  public.has_specialty('training'::public.professional_specialty)
  and trainer_id = auth.uid()
);

drop policy if exists "Resources visible to related users and admins" on public.resources;
drop policy if exists "Admins manage resources" on public.resources;
drop policy if exists "Assigned professionals manage client resources" on public.resources;

create policy "Resources visible to related users and admins"
on public.resources
for select
to authenticated
using (
  uploaded_by = auth.uid()
  or client_id = auth.uid()
  or public.is_admin()
  or (client_id is not null and public.is_client_assigned_to_current_professional(client_id, area))
);

create policy "Admins manage resources"
on public.resources
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Assigned professionals manage client resources"
on public.resources
for all
to authenticated
using (
  uploaded_by = auth.uid()
  and client_id is not null
  and public.is_client_assigned_to_current_professional(client_id, area)
)
with check (
  uploaded_by = auth.uid()
  and client_id is not null
  and public.is_client_assigned_to_current_professional(client_id, area)
);
