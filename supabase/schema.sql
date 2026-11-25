-- LERRY ANIMASI: owner-scoped production history.
-- Run this once in Supabase Dashboard > SQL Editor.
create table if not exists public.lerry_productions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  working_title text not null default 'Untitled Short',
  original_story text not null,
  production jsonb not null,
  status text not null default 'storyboard',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lerry_productions_status_check
    check (status in ('storyboard', 'rendering', 'rendered', 'approved', 'archived'))
);

create index if not exists lerry_productions_owner_created_idx
  on public.lerry_productions (owner_id, created_at desc);

alter table public.lerry_productions enable row level security;

drop policy if exists "Owner reads own Lerry productions" on public.lerry_productions;
create policy "Owner reads own Lerry productions"
  on public.lerry_productions for select to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "Owner inserts own Lerry productions" on public.lerry_productions;
create policy "Owner inserts own Lerry productions"
  on public.lerry_productions for insert to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Owner updates own Lerry productions" on public.lerry_productions;
create policy "Owner updates own Lerry productions"
  on public.lerry_productions for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Owner deletes own Lerry productions" on public.lerry_productions;
create policy "Owner deletes own Lerry productions"
  on public.lerry_productions for delete to authenticated
  using ((select auth.uid()) = owner_id);

grant select, insert, update, delete on public.lerry_productions to authenticated;

-- Private file bucket reserved for approved production assets.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lerry-assets', 'lerry-assets', false, 104857600,
  array['image/png','image/jpeg','image/webp','audio/wav','audio/mpeg','video/mp4'])
on conflict (id) do nothing;

drop policy if exists "Owner manages own Lerry assets" on storage.objects;
create policy "Owner manages own Lerry assets"
  on storage.objects for all to authenticated
  using (bucket_id = 'lerry-assets' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'lerry-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
