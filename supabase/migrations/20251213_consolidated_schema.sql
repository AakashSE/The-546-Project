-- 1. PROFILES (User Roles and Details)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  role text default 'user', -- 'admin' or 'user'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- 2. PRODUCTS (Inventory)
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric not null,
  category text, -- 'apparel', 'accessories', etc.
  stock_status text default 'in_stock', -- 'in_stock', 'out_of_stock', 'pre_order'
  images jsonb, -- { "front": "url", "back": "url", "gallery": [] }
  features jsonb, -- ["Graphene Mesh", "Thermal Layer"]
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Products
alter table public.products enable row level security;
create policy "Products are viewable by everyone." on public.products for select using (true);
create policy "Only Admins can insert products." on public.products for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Only Admins can update products." on public.products for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Only Admins can delete products." on public.products for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 3. ORDERS (Transactions)
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users, -- Nullable for guest checkout if needed
  total_amount numeric not null,
  status text default 'pending', -- 'pending', 'paid', 'shipped', 'delivered', 'cancelled'
  stripe_session_id text, -- Used for Razorpay Order ID too
  shipping_address jsonb, -- { "line1": "...", "city": "..." }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Orders
alter table public.orders enable row level security;
create policy "Users can view their own orders." on public.orders for select using (auth.uid() = user_id);
create policy "Admins can view all orders." on public.orders for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Service Role can insert orders." on public.orders for insert with check (true); -- Usually handled by backend with Admin Key

-- 4. ORDER ITEMS (Line Items)
create table if not exists public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders on delete cascade not null,
  product_id uuid references public.products,
  product_name text not null,
  quantity integer default 1,
  price_at_purchase numeric not null,
  selected_color text,
  selected_size text,
  image_url text
);

-- RLS for Order Items
alter table public.order_items enable row level security;
create policy "Users can view their own order items." on public.order_items for select using (
  exists (select 1 from public.orders where id = order_items.order_id and user_id = auth.uid())
);
create policy "Admins can view all items." on public.order_items for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 5. REVIEWS (Product Feedback)
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products on delete cascade not null,
  user_id uuid references auth.users not null, -- Verified reviewers only
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Reviews
alter table public.reviews enable row level security;
create policy "Reviews are viewable by everyone." on public.reviews for select using (true);
create policy "Authenticated users can create reviews." on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users can delete their own reviews." on public.reviews for delete using (auth.uid() = user_id);
