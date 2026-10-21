-- ==============================================================================
-- Verisett AI — Community Feedback & Testimonials Schema Migration
-- ==============================================================================

create table if not exists public.feedback (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role_title text,
  company text,
  rating integer default 5 check (rating >= 1 and rating <= 5),
  message text not null,
  category text default 'Protocol Feedback',
  is_approved boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index if not exists idx_feedback_approved on public.feedback(is_approved);
create index if not exists idx_feedback_created_at on public.feedback(created_at desc);
create index if not exists idx_feedback_category on public.feedback(category);

-- Enable RLS
alter table public.feedback enable row level security;

-- Drop existing policies if any to avoid errors on re-run
drop policy if exists "Public can read approved feedback" on public.feedback;
drop policy if exists "Public can submit feedback" on public.feedback;

-- Allow anyone to read approved feedback
create policy "Public can read approved feedback"
  on public.feedback for select
  using (is_approved = true);

-- Allow anyone to submit new feedback
create policy "Public can submit feedback"
  on public.feedback for insert
  with check (true);
