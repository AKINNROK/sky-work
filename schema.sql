-- ============================================================
-- Sky Work · Supabase schema  (รันได้ซ้ำ ไม่พัง)
-- Supabase Dashboard → SQL Editor → New query → วางทั้งหมด → Run
-- ต้องขึ้นตารางผลลัพธ์บรรทัดสุดท้ายว่า  setup_ok = true
-- ============================================================

create table if not exists public.rows (
  id          text primary key,
  uid         uuid not null default auth.uid(),
  kind        text not null,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

create index if not exists rows_uid_kind_idx on public.rows (uid, kind);

alter table public.rows enable row level security;

drop policy if exists "own rows" on public.rows;
create policy "own rows" on public.rows
  for all
  to authenticated
  using (auth.uid() = uid)
  with check (auth.uid() = uid);

-- สิทธิ์ให้ผู้ใช้ที่ล็อกอินแล้วเข้าถึงผ่าน API ได้
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.rows to authenticated;

-- เปิด Realtime (ข้ามถ้าเปิดอยู่แล้ว)
alter table public.rows replica identity full;
do $$
begin
  execute 'alter publication supabase_realtime add table public.rows';
exception when others then null;
end $$;

-- บังคับให้ API รู้จักตารางใหม่ทันที (แก้ error: schema cache)
notify pgrst, 'reload schema';

-- ---------- ตรวจผล ----------
select
  (to_regclass('public.rows') is not null)                                as table_created,
  (select count(*) from pg_policies
     where schemaname='public' and tablename='rows') > 0                  as policy_created,
  (to_regclass('public.rows') is not null
   and (select count(*) from pg_policies
          where schemaname='public' and tablename='rows') > 0)            as setup_ok;
