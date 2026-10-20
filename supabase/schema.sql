-- Sibilia sohbet: Supabase panelinde SQL Editor'e yapıştırıp bir kez çalıştır.

-- 👤 Profiller: kayıt olunca otomatik oluşur
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_.]{3,20}$'),
  display_name text not null check (char_length(display_name) between 1 and 40),
  avatar text not null default '🦊',
  created_at timestamptz not null default now()
);

-- 💬 Sohbetler (birebir ya da grup), üyeleri ve mesajları
create table public.chats (
  id uuid primary key default gen_random_uuid(),
  is_group boolean not null default false,
  title text,
  created_by uuid references public.profiles on delete set null,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table public.chat_members (
  chat_id uuid not null references public.chats on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (chat_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats on delete cascade,
  sender_id uuid not null default auth.uid() references public.profiles on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  kind text not null default 'text' check (kind in ('text', 'progress')),
  meta jsonb,
  created_at timestamptz not null default now()
);

create index messages_chat_time on public.messages (chat_id, created_at desc);
create index chat_members_user on public.chat_members (user_id);

-- Yeni kullanıcıya profil aç
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name, avatar)
  values (
    new.id,
    lower(new.raw_user_meta_data ->> 'username'),
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), new.raw_user_meta_data ->> 'username'),
    coalesce(nullif(new.raw_user_meta_data ->> 'avatar', ''), '🦊')
  );
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Yeni mesaj gelince sohbet listede üste çıksın
create function public.touch_chat() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.chats set last_message_at = new.created_at where id = new.chat_id;
  return new;
end $$;

create trigger on_message_sent after insert on public.messages
  for each row execute function public.touch_chat();

-- 🔒 Güvenlik: herkes yalnızca üyesi olduğu sohbetleri görür
create function public.is_member(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.chat_members where chat_id = c and user_id = auth.uid());
$$;

alter table public.profiles enable row level security;
alter table public.chats enable row level security;
alter table public.chat_members enable row level security;
alter table public.messages enable row level security;

create policy "profiles: giriş yapan herkes görür" on public.profiles for select to authenticated using (true);
create policy "profiles: kendini düzenle" on public.profiles for update to authenticated using (id = auth.uid());

create policy "chats: üyeler görür" on public.chats for select to authenticated using (public.is_member(id));

create policy "members: üyeler görür" on public.chat_members for select to authenticated using (public.is_member(chat_id));

create policy "messages: üyeler okur" on public.messages for select to authenticated using (public.is_member(chat_id));
create policy "messages: üyeler yazar" on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and public.is_member(chat_id));

-- Birebir sohbet aç (varsa olanı döndür)
create function public.start_direct_chat(other uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare found uuid;
begin
  if auth.uid() is null or other = auth.uid() then raise exception 'geçersiz kişi'; end if;
  select c.id into found from public.chats c
    where not c.is_group
      and exists (select 1 from public.chat_members where chat_id = c.id and user_id = auth.uid())
      and exists (select 1 from public.chat_members where chat_id = c.id and user_id = other)
    limit 1;
  if found is not null then return found; end if;
  insert into public.chats (is_group, created_by) values (false, auth.uid()) returning id into found;
  insert into public.chat_members (chat_id, user_id) values (found, auth.uid()), (found, other);
  return found;
end $$;

-- Grup kur
create function public.create_group(group_title text, member_ids uuid[]) returns uuid
language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  if auth.uid() is null then raise exception 'giriş gerekli'; end if;
  insert into public.chats (is_group, title, created_by) values (true, left(trim(group_title), 40), auth.uid()) returning id into new_id;
  insert into public.chat_members (chat_id, user_id)
    select new_id, u from unnest(array_append(member_ids, auth.uid())) as u
    where exists (select 1 from public.profiles where id = u)
    on conflict do nothing;
  return new_id;
end $$;

-- Sohbeti okundu say (mavi tikler)
create function public.mark_read(c uuid) returns void
language sql security definer set search_path = public as $$
  update public.chat_members set last_read_at = now() where chat_id = c and user_id = auth.uid();
$$;

-- Sohbet listesi: son mesaj ve okunmamış sayısıyla
create function public.my_chats()
returns table (id uuid, is_group boolean, title text, last_message_at timestamptz,
               last_body text, last_kind text, last_sender uuid, unread int)
language sql stable security invoker set search_path = public as $$
  select c.id, c.is_group, c.title, c.last_message_at, lm.body, lm.kind, lm.sender_id,
    (select count(*) from public.messages m
      where m.chat_id = c.id and m.sender_id <> auth.uid() and m.created_at > me.last_read_at)::int
  from public.chats c
  join public.chat_members me on me.chat_id = c.id and me.user_id = auth.uid()
  left join lateral (
    select body, kind, sender_id from public.messages m where m.chat_id = c.id order by created_at desc limit 1
  ) lm on true
  order by c.last_message_at desc;
$$;

-- ⚡ Canlı güncellemeler
alter publication supabase_realtime add table public.messages, public.chat_members;
