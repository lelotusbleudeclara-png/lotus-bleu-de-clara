-- Le Lotus Bleu de Clara — schéma de base de données Supabase
-- À exécuter dans Supabase > SQL Editor > New query

-- 1. Catégories de bijoux (colliers, bracelets, etc.)
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- 2. Produits (bijoux)
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null,
  in_stock boolean not null default true,
  published boolean not null default false, -- visible publiquement seulement après validation parentale
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Photos produits (plusieurs photos par produit, chacune avec son propre statut de validation)
create table if not exists product_photos (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null, -- chemin dans le bucket Supabase Storage
  position int not null default 0,
  approved boolean not null default false, -- validée par l'adulte référent
  created_at timestamptz not null default now()
);

-- 4. Présélections (panier envoyé depuis le formulaire public)
create table if not exists preselections (
  id uuid primary key default gen_random_uuid(),
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text,
  is_minor boolean not null default false,
  parent_email text,
  parent_phone text,
  items jsonb not null, -- [{product_id, name, price}, ...]
  total numeric(10,2) not null,
  status text not null default 'nouvelle', -- nouvelle | en_attente_parent | confirmee | annulee
  created_at timestamptz not null default now()
);

-- 5. Transactions (remise en main propre, avec photo de preuve)
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  preselection_id uuid references preselections(id) on delete set null,
  buyer_name text not null,
  buyer_email text not null,
  is_minor boolean not null default false,
  parent_email text,
  items jsonb not null,
  total numeric(10,2) not null,
  proof_photo_path text not null, -- chemin dans le bucket Storage
  location text,
  transacted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Row Level Security : activée automatiquement par Supabase à la création des tables (option cochée).
-- Lecture publique des catégories et produits PUBLIÉS uniquement.
alter table categories enable row level security;
alter table products enable row level security;
alter table product_photos enable row level security;
alter table preselections enable row level security;
alter table transactions enable row level security;

create policy "Lecture publique des catégories" on categories
  for select using (true);

create policy "Lecture publique des produits publiés" on products
  for select using (published = true);

create policy "Lecture publique des photos approuvées" on product_photos
  for select using (approved = true);

create policy "Création publique d'une présélection" on preselections
  for insert with check (true);

-- Les tables produits/photos/présélections/transactions ne sont modifiables
-- que depuis l'interface vendeur (authentifiée), via des policies à affiner
-- lors du développement de la PWA vendeur (tâche #18).
