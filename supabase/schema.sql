-- ============================================================
-- Sky Work · Supabase schema
-- วิธีใช้: Supabase Dashboard → SQL Editor → New query
--          วางไฟล์นี้ทั้งหมด → กด Run (ครั้งเดียวพอ)
-- ============================================================

-- ตารางเดียวเก็บทุกอย่าง: งาน / รายการเงิน / การตั้งค่า
create table if not exists public.rows (
  id          text primary key,
  uid         uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind        text not null check (kind in ('items','ledger','meta')),
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

create index if not exists rows_uid_kind_idx on public.rows (uid, kind);

-- เปิด Row Level Security: เห็นเฉพาะข้อมูลของบัญชีตัวเอง
alter table public.rows enable row level security;

drop policy if exists "own rows" on public.rows;
create policy "own rows" on public.rows
  for all
  using (auth.uid() = uid)
  with check (auth.uid() = uid);

-- เปิด Realtime เพื่อให้ซิงก์ข้ามเครื่องทันที
alter table public.rows replica identity full;
do $$
begin
  alter publication supabase_realtime add table public.rows;
exception when duplicate_object then null;
end $$;
