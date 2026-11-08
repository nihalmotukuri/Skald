create table public.assistant_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'New chat'
    check (char_length(btrim(title)) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assistant_conversations_id_user_id_unique unique (id, user_id)
);

create index assistant_conversations_user_updated_idx
  on public.assistant_conversations (user_id, updated_at desc);

create table public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) <= 8000),
  attachments jsonb not null default '[]'::jsonb
    check (jsonb_typeof(attachments) = 'array'),
  proposals jsonb not null default '[]'::jsonb
    check (jsonb_typeof(proposals) = 'array'),
  created_at timestamptz not null default now(),
  constraint assistant_messages_conversation_owner_fk
    foreign key (conversation_id, user_id)
    references public.assistant_conversations (id, user_id)
    on delete cascade
);

create index assistant_messages_conversation_created_idx
  on public.assistant_messages (conversation_id, created_at);

create index assistant_messages_user_content_search_idx
  on public.assistant_messages using gin (to_tsvector('simple', content));

alter table public.assistant_conversations enable row level security;
alter table public.assistant_messages enable row level security;

revoke all on table public.assistant_conversations, public.assistant_messages
  from anon, authenticated;

grant select, insert, update, delete
  on table public.assistant_conversations, public.assistant_messages
  to authenticated;

create policy "Users can manage their own assistant conversations"
  on public.assistant_conversations for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can manage their own assistant messages"
  on public.assistant_messages for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.touch_assistant_conversation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.assistant_conversations
  set updated_at = now()
  where id = new.conversation_id
    and user_id = new.user_id;
  return new;
end;
$$;

revoke all on function public.touch_assistant_conversation() from public, anon, authenticated;

create trigger assistant_messages_touch_conversation
  after insert on public.assistant_messages
  for each row execute function public.touch_assistant_conversation();

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'assistant-attachments',
  'assistant-attachments',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain', 'text/markdown', 'text/csv']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Users can view their own assistant attachments"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'assistant-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can upload their own assistant attachments"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'assistant-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete their own assistant attachments"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'assistant-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
