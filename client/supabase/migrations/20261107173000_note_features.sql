alter table public.notes
  add column if not exists is_pinned boolean not null default false,
  add column if not exists color text not null default 'default',
  add column if not exists font_family text not null default 'sans',
  add column if not exists reminder_at timestamptz,
  add column if not exists archived_at timestamptz,
  add column if not exists image_attachments jsonb not null default '[]'::jsonb;

update public.notes
set is_pinned = false
where is_pinned is null;

update public.notes
set color = 'default'
where color is null;

update public.notes
set font_family = 'sans'
where font_family is null;

update public.notes
set image_attachments = '[]'::jsonb
where image_attachments is null;

alter table public.notes
  alter column is_pinned set default false,
  alter column is_pinned set not null,
  alter column color set default 'default',
  alter column color set not null,
  alter column font_family set default 'sans',
  alter column font_family set not null,
  alter column image_attachments set default '[]'::jsonb,
  alter column image_attachments set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.notes'::regclass
      and conname = 'notes_color_check'
  ) then
    alter table public.notes
      add constraint notes_color_check
      check (color in ('default', 'rose', 'amber', 'sage', 'blue', 'violet'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.notes'::regclass
      and conname = 'notes_font_family_check'
  ) then
    alter table public.notes
      add constraint notes_font_family_check
      check (font_family in ('sans', 'serif', 'mono'));
  end if;
end
$$;

update public.notes
set image_attachments = case
      when image_attachments @> jsonb_build_array(jsonb_build_object('path', image_path))
        then image_attachments
      else image_attachments || jsonb_build_array(jsonb_build_object(
        'id', 'legacy',
        'path', image_path,
        'width', 100
      ))
    end,
    body = case
      when coalesce(body, '') like '%skald-image:legacy%'
        then body
      else concat_ws(
        E'\n\n',
        nullif(body, ''),
        '![Attached image](skald-image:legacy "width=100")'
      )
    end
where image_path is not null;

alter table public.notes
  alter column image_path drop not null;

update public.notes
set image_path = null
where image_path is not null;

create index if not exists notes_user_pinned_created_at_idx
  on public.notes (user_id, is_pinned desc, created_at desc);
