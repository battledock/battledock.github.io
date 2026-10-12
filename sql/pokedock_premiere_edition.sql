-- =====================================================================
-- POKÉDOCK — LA PREMIÈRE ÉDITION
--
-- À coller tel quel dans Supabase → SQL Editor → Run.
--
-- Cent cartes, numérotées de 1 à 100 dans l'ordre des raretés :
--   1-40 communes · 41-62 rares · 63-76 ultra · 77-85 epic
--   86-91 légendaires · 92-95 EX · 96-98 full art · 99-100 secrètes
--
-- LE TIRAGE SE FAIT ICI, PAS DANS LE NAVIGATEUR. Un paquet coûte six
-- euros : si le client tirait ses propres cartes, il suffirait d'ouvrir
-- la console pour se donner la série entière.
-- =====================================================================

create table if not exists public.pokedock_collection(
  joueur    text        not null,
  numero    smallint    not null check (numero between 1 and 100),
  quantite  integer     not null default 1,
  edition   text        not null default '1re',
  premiere  timestamptz not null default now(),
  primary key (joueur, numero)
);

create table if not exists public.pokedock_paquets(
  id      bigserial primary key,
  joueur  text        not null,
  cartes  smallint[]  not null,
  edition text        not null default '1re',
  cree    timestamptz not null default now()
);
create index if not exists pokedock_paquets_joueur_jour
  on public.pokedock_paquets(joueur, cree desc);

alter table public.pokedock_collection enable row level security;
alter table public.pokedock_paquets    enable row level security;

-- CHACUN NE VOIT QUE SA COLLECTION. L'écriture ne passe que par les
-- fonctions ci-dessous, qui sont en SECURITY DEFINER.
drop policy if exists pokedock_collection_lecture on public.pokedock_collection;
create policy pokedock_collection_lecture on public.pokedock_collection
  for select using (joueur = auth.uid()::text);

drop policy if exists pokedock_paquets_lecture on public.pokedock_paquets;
create policy pokedock_paquets_lecture on public.pokedock_paquets
  for select using (joueur = auth.uid()::text);

-- ---------------------------------------------------------------------
-- UN TIRAGE, SELON LES TAUX DE POKÉMON TCG POCKET.
-- p_slot vaut 4 ou 5 : le cinquième emplacement est quatre fois plus
-- généreux que le quatrième, et c'est de là que vient toute la tension.
-- ---------------------------------------------------------------------
create or replace function public.pokedock_tirer(p_slot int)
returns smallint
language plpgsql
as $$
declare t numeric := random()*100; bas int; haut int;
begin
  if p_slot = 4 then
    if    t < 89.000 then bas:=41; haut:=62;
    elsif t < 93.952 then bas:=63; haut:=76;
    elsif t < 97.238 then bas:=77; haut:=85;
    elsif t < 98.904 then bas:=86; haut:=91;
    elsif t < 99.737 then bas:=92; haut:=95;
    elsif t < 99.959 then bas:=96; haut:=98;
    else                  bas:=99; haut:=100;
    end if;
  else
    if    t < 56.756 then bas:=41; haut:=62;
    elsif t < 75.797 then bas:=63; haut:=76;
    elsif t < 88.942 then bas:=77; haut:=85;
    elsif t < 95.606 then bas:=86; haut:=91;
    elsif t < 98.939 then bas:=92; haut:=95;
    elsif t < 99.827 then bas:=96; haut:=98;
    else                  bas:=99; haut:=100;
    end if;
  end if;
  return (bas + floor(random()*(haut-bas+1)))::smallint;
end $$;

-- ---------------------------------------------------------------------
-- OUVRIR UN PAQUET : six euros, dix cartes.
-- Six communes, deux tirages « quatrième » et deux tirages « cinquième »,
-- rendus du moins rare au plus rare pour que la dernière soit la bonne.
-- ---------------------------------------------------------------------
create or replace function public.pokedock_ouvrir()
returns json
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  uid    text := auth.uid()::text;
  solde  bigint;
  n_jour int;
  c      smallint;
  i      int;
  q      int;
  tir    smallint[] := '{}';
  extra  smallint[] := '{}';
  nouv   smallint[] := '{}';
  total  int;
begin
  if uid is null then
    return json_build_object('erreur','Connecte-toi pour acheter un paquet.');
  end if;

  select count(*) into n_jour from public.pokedock_paquets
   where joueur = uid
     and (cree at time zone 'Europe/Paris')::date = (now() at time zone 'Europe/Paris')::date;
  if n_jour >= 30 then
    return json_build_object('erreur','Trente paquets par jour, pas un de plus. Reviens demain.');
  end if;

  perform public.compte(uid);
  select euros_cents into solde from public.comptes where id = uid for update;
  if solde is null or solde < 600 then
    return json_build_object('erreur','Il faut 6 € pour un paquet.');
  end if;
  update public.comptes set euros_cents = euros_cents - 600
   where id = uid returning euros_cents into solde;

  -- six communes, toutes différentes
  for i in 1..6 loop
    loop
      c := (1 + floor(random()*40))::smallint;
      exit when not (c = any(tir));
    end loop;
    tir := tir || c;
  end loop;

  -- les quatre tirages, rangés du moins rare au plus rare
  for i in 1..2 loop extra := extra || public.pokedock_tirer(4); end loop;
  for i in 1..2 loop extra := extra || public.pokedock_tirer(5); end loop;
  select array_agg(x order by x) into extra from unnest(extra) as x;
  tir := tir || extra;

  insert into public.pokedock_paquets(joueur,cartes) values (uid,tir);

  -- la collection : on compte les doubles, on retient les premières fois
  foreach c in array tir loop
    insert into public.pokedock_collection(joueur,numero,quantite)
      values (uid,c,1)
      on conflict (joueur,numero) do update
        set quantite = public.pokedock_collection.quantite + 1
      returning quantite into q;
    if q = 1 and not (c = any(nouv)) then nouv := nouv || c; end if;
  end loop;

  select count(*) into total from public.pokedock_collection where joueur = uid;

  return json_build_object(
    'ok',        true,
    'cartes',    tir,
    'nouvelles', nouv,
    'euros',     solde,
    'total',     total,
    'paquets',   n_jour + 1,
    'edition',   '1re'
  );
end $$;

-- ---------------------------------------------------------------------
-- MA COLLECTION, pour l'écran du classeur.
-- ---------------------------------------------------------------------
create or replace function public.pokedock_ma_collection()
returns json
language plpgsql
security definer
set search_path to 'public'
as $$
declare uid text := auth.uid()::text; j json; n int; p int;
begin
  if uid is null then
    return json_build_object('cartes','[]'::json,'total',0,'paquets',0);
  end if;
  select coalesce(json_agg(json_build_object('n',numero,'q',quantite) order by numero),'[]'::json)
    into j from public.pokedock_collection where joueur = uid;
  select count(*) into n from public.pokedock_collection where joueur = uid;
  select count(*) into p from public.pokedock_paquets    where joueur = uid;
  return json_build_object('cartes',j,'total',n,'paquets',p);
end $$;

grant execute on function public.pokedock_ouvrir()        to anon, authenticated;
grant execute on function public.pokedock_ma_collection() to anon, authenticated;

-- CONTRÔLE : doit renvoyer 2 tables et 3 fonctions.
select 'table '||table_name as objet from information_schema.tables
 where table_schema='public' and table_name like 'pokedock%'
union all
select 'fonction '||p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.proname like 'pokedock%'
order by 1;
