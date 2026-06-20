set lock_timeout = '5s';
set statement_timeout = '30s';

create or replace function private.enrich_routine_snapshot_multimedia(
  snapshot jsonb
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when snapshot is null
      or jsonb_typeof(snapshot->'exercises') <> 'array' then snapshot
    else jsonb_set(
      snapshot,
      '{exercises}',
      coalesce((
        select jsonb_agg(
          jsonb_set(
            snapshot_item.value,
            '{exercise,multimediaUrls}',
            coalesce(
              snapshot_item.value #> '{exercise,multimediaUrls}',
              to_jsonb(catalog.multimedia_urls),
              case
                when nullif(
                  snapshot_item.value #>> '{exercise,multimediaUrl}',
                  ''
                ) is not null then jsonb_build_array(
                  snapshot_item.value #>> '{exercise,multimediaUrl}'
                )
                else '[]'::jsonb
              end
            ),
            true
          )
          order by snapshot_item.ordinality
        )
        from jsonb_array_elements(
          snapshot->'exercises'
        ) with ordinality as snapshot_item(value, ordinality)
        left join public.exercises catalog
          on catalog.id::text =
            snapshot_item.value #>> '{exercise,id}'
      ), '[]'::jsonb),
      true
    )
  end
$$;

create or replace function private.enrich_template_snapshot_multimedia(
  snapshot jsonb
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when snapshot is null
      or jsonb_typeof(snapshot->'days') <> 'array' then snapshot
    else jsonb_set(
      snapshot,
      '{days}',
      coalesce((
        select jsonb_agg(
          jsonb_set(
            snapshot_day.value,
            '{routine,exercises}',
            coalesce((
              select jsonb_agg(
                jsonb_set(
                  snapshot_item.value,
                  '{exercise,multimediaUrls}',
                  coalesce(
                    snapshot_item.value #> '{exercise,multimediaUrls}',
                    to_jsonb(catalog.multimedia_urls),
                    case
                      when nullif(
                        snapshot_item.value #>> '{exercise,multimediaUrl}',
                        ''
                      ) is not null then jsonb_build_array(
                        snapshot_item.value #>> '{exercise,multimediaUrl}'
                      )
                      else '[]'::jsonb
                    end
                  ),
                  true
                )
                order by snapshot_item.ordinality
              )
              from jsonb_array_elements(
                snapshot_day.value #> '{routine,exercises}'
              ) with ordinality as snapshot_item(value, ordinality)
              left join public.exercises catalog
                on catalog.id::text =
                  snapshot_item.value #>> '{exercise,id}'
            ), '[]'::jsonb),
            true
          )
          order by snapshot_day.ordinality
        )
        from jsonb_array_elements(
          snapshot->'days'
        ) with ordinality as snapshot_day(value, ordinality)
      ), '[]'::jsonb),
      true
    )
  end
$$;

revoke all on function private.enrich_routine_snapshot_multimedia(jsonb)
  from public, anon, authenticated;
revoke all on function private.enrich_template_snapshot_multimedia(jsonb)
  from public, anon, authenticated;

create or replace function private.enrich_workout_plan_snapshot_multimedia()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.routine_snapshot :=
    private.enrich_routine_snapshot_multimedia(new.routine_snapshot);
  new.template_snapshot :=
    private.enrich_template_snapshot_multimedia(new.template_snapshot);

  return new;
end;
$$;

revoke all on function private.enrich_workout_plan_snapshot_multimedia()
  from public, anon, authenticated;

drop trigger if exists enrich_workout_plan_snapshot_multimedia
  on public.workout_plans;
create trigger enrich_workout_plan_snapshot_multimedia
before insert on public.workout_plans
for each row
execute function private.enrich_workout_plan_snapshot_multimedia();

drop trigger if exists prevent_routine_snapshot_changes
  on public.workout_plans;

update public.workout_plans
set routine_snapshot =
  private.enrich_routine_snapshot_multimedia(routine_snapshot)
where routine_snapshot is not null;

create trigger prevent_routine_snapshot_changes
before update of routine_snapshot on public.workout_plans
for each row
execute function private.prevent_routine_snapshot_changes();

update public.workout_plans
set template_snapshot =
  private.enrich_template_snapshot_multimedia(template_snapshot)
where template_snapshot is not null;

notify pgrst, 'reload schema';
