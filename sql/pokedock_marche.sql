-- =====================================================================
-- POKÉDOCK — LE MARCHÉ, LA REPRISE ET LA COTE
--
-- À coller tel quel dans Supabase → SQL Editor → Run, APRÈS
-- pokedock_premiere_edition.sql. Fonctions, politiques et droits repris
-- de la base en production. Les tables sont reconstruites à partir des
-- colonnes : les contraintes exactes n'ont pas été relues ligne à ligne.
--
-- Dépendances hors de ce fichier (déjà en base, à ne pas toucher ici) :
-- public.compte(text), public.comptes, public.joueurs,
-- public.mondial_palmares, public.cosmetiques.
--
-- LA COTE EST ENTRE JOUEURS : l'argent change de poche, il ne se crée pas.
-- LA REPRISE CRÉE DE L'ARGENT : elle est ancrée au tarif de la maison,
-- plafonnée par jour, et jamais calculée à la cote.
-- =====================================================================

create table if not exists public.pokedock_annonces(
  id        bigserial   primary key,
  vendeur   text        not null,
  numero    smallint    not null check (numero between 1 and 100),
  prix      bigint      not null check (prix >= 100 and prix <= 100000000),
  statut    text        not null default 'ouverte',
  acheteur  text,
  cree      timestamptz not null default now(),
  expire    timestamptz not null default (now() + interval '7 days'),
  conclue   timestamptz
);
create index if not exists pokedock_annonces_ouvertes
  on public.pokedock_annonces(statut, numero);
create index if not exists pokedock_annonces_vendues
  on public.pokedock_annonces(numero, conclue desc) where statut = 'vendue';

create table if not exists public.pokedock_reprises(
  id      bigserial   primary key,
  joueur  text        not null,
  numero  smallint    not null,
  combien integer     not null,
  cents   bigint      not null,
  quand   timestamptz not null default now()
);
create index if not exists pokedock_reprises_jour
  on public.pokedock_reprises(joueur, quand desc);

alter table public.pokedock_annonces enable row level security;
alter table public.pokedock_reprises enable row level security;

-- LES ANNONCES SONT PUBLIQUES (on voit les prix), LES REPRISES NE LE SONT PAS.
drop policy if exists pokedock_annonces_lecture on public.pokedock_annonces;
create policy pokedock_annonces_lecture on public.pokedock_annonces
  for select using (true);

-- ---------------------------------------------------------------------
-- LE TARIF DE LA MAISON (reprise) : une seule table, ici, côté serveur.
-- ---------------------------------------------------------------------
create or replace function public.pokedock_reprise(p_numero integer)
returns bigint language sql immutable
as $function$
  select case
    when p_numero between  1 and  40 then     5::bigint   /* commune    0,05 € */
    when p_numero between 41 and  62 then    12::bigint   /* rare       0,12 € */
    when p_numero between 63 and  76 then    30::bigint   /* ultra      0,30 € */
    when p_numero between 77 and  85 then    75::bigint   /* epique     0,75 € */
    when p_numero between 86 and  91 then   190::bigint   /* legendaire 1,90 € */
    when p_numero between 92 and  95 then   460::bigint   /* EX         4,60 € */
    when p_numero between 96 and  98 then  1200::bigint   /* full art     12 € */
    when p_numero between 99 and 100 then  4000::bigint   /* secrete      40 € */
    else 0::bigint end;
$function$;

-- ---------------------------------------------------------------------
-- LA COTE DE DÉPART : tant qu'une carte n'a pas été vendue cinq fois,
-- on affiche ce prix-là, pour qu'une cote ne soit jamais inventée.
-- ---------------------------------------------------------------------
create or replace function public.pokedock_cote_depart(p_numero integer)
returns bigint language sql immutable
as $function$
  select case
    when p_numero between  1 and  40 then     300::bigint   /* commune     3 € */
    when p_numero between 41 and  62 then    1500::bigint   /* rare       15 € */
    when p_numero between 63 and  76 then    7000::bigint   /* ultra      70 € */
    when p_numero between 77 and  85 then   18000::bigint   /* epic      180 € */
    when p_numero between 86 and  91 then   50000::bigint   /* legendaire 500 € */
    when p_numero between 92 and  95 then  120000::bigint   /* EX       1 200 € */
    when p_numero between 96 and  98 then  400000::bigint   /* full art 4 000 € */
    else                                   1800000::bigint  /* secrete 18 000 € */
  end;
$function$;

create or replace function public.pokedock_cote(p_numero integer)
returns json language plpgsql stable security definer set search_path to 'public'
as $function$
declare n int; m bigint; der bigint;
begin
  select count(*) into n from public.pokedock_annonces
    where numero=p_numero and statut='vendue';
  if n >= 5 then
    select round(avg(prix))::bigint into m from (
      select prix from public.pokedock_annonces
       where numero=p_numero and statut='vendue'
       order by conclue desc limit 5) t;
  else
    m := public.pokedock_cote_depart(p_numero);
  end if;
  select prix into der from public.pokedock_annonces
    where numero=p_numero and statut='vendue' order by conclue desc limit 1;
  return json_build_object('cote',m,'ventes',n,'derniere',der,'reelle',(n>=5));
end $function$;

-- ---------------------------------------------------------------------
-- BALAYAGE : une annonce expirée rend sa carte à son vendeur.
-- ---------------------------------------------------------------------
create or replace function public.pokedock_balayer()
returns void language plpgsql security definer set search_path to 'public'
as $function$
declare a record;
begin
  for a in select id, vendeur, numero from public.pokedock_annonces
            where statut='ouverte' and expire < now() for update
  loop
    update public.pokedock_annonces set statut='expiree', conclue=now() where id=a.id;
    insert into public.pokedock_collection(joueur,numero,quantite)
      values (a.vendeur,a.numero,1)
      on conflict (joueur,numero) do update
        set quantite = public.pokedock_collection.quantite + 1;
  end loop;
end $function$;

create or replace function public.pokedock_reprise_jour(p_joueur text)
returns bigint language sql stable security definer set search_path to 'public'
as $function$
  select coalesce(sum(cents),0)::bigint from public.pokedock_reprises
   where joueur = p_joueur
     and (quand at time zone 'Europe/Paris')::date = (now() at time zone 'Europe/Paris')::date;
$function$;

-- ---------------------------------------------------------------------
-- LE MARCHÉ : annonces ouvertes, mes annonces, mes doubles au tarif de
-- la maison. Le serveur renvoie le solde à chaque fois.
-- ---------------------------------------------------------------------
create or replace function public.pokedock_marche()
returns json language plpgsql security definer set search_path to 'public'
as $function$
declare uid text := auth.uid()::text; j json; m json; sol bigint; dbl json;
        rj bigint := 0;
begin
  perform public.pokedock_balayer();

  select coalesce(json_agg(x order by (x->>'prix')::bigint),'[]'::json) into j from (
    select json_build_object(
      'id',a.id,'n',a.numero,'prix',a.prix,
      'vendeur',coalesce(nullif(p.nom,''),'un docker'),
      'mien',(a.vendeur = coalesce(uid,'')),
      'cote',(public.pokedock_cote(a.numero)->>'cote')::bigint,
      'reelle',(public.pokedock_cote(a.numero)->>'reelle')::boolean
    ) as x
    from public.pokedock_annonces a
    left join public.mondial_palmares p on p.id = a.vendeur
    where a.statut='ouverte'
  ) t;

  if uid is null then
    return json_build_object('annonces',j,'miennes','[]'::json,'euros',0,
                             'doubles','[]'::json,'commission',8,
                             'reprise_jour',0,'reprise_plafond',5000);
  end if;

  select coalesce(json_agg(json_build_object('id',id,'n',numero,'prix',prix,
           'expire',expire) order by cree desc),'[]'::json) into m
    from public.pokedock_annonces where vendeur = uid and statut='ouverte';

  perform public.compte(uid);
  select euros_cents into sol from public.comptes where id = uid;

  /* LE TARIF DE LA MAISON VOYAGE AVEC LA COTE. La page n'a pas sa propre
     table de prix : deux tables finissent toujours par diverger, et
     c'est le serveur qui paie. */
  select coalesce(json_agg(json_build_object('n',numero,'q',quantite,
           'cote',(public.pokedock_cote(numero)->>'cote')::bigint,
           'reprise',public.pokedock_reprise(numero)) order by numero),'[]'::json)
    into dbl from public.pokedock_collection
   where joueur = uid and quantite >= 2;

  rj := public.pokedock_reprise_jour(uid);

  return json_build_object('annonces',j,'miennes',m,'euros',coalesce(sol,0),
                           'doubles',dbl,'commission',8,
                           'reprise_jour',rj,'reprise_plafond',5000);
end $function$;

-- ---------------------------------------------------------------------
-- VENDRE : le double part en vitrine. Prix minimum 1 €, maximum 1 M€.
-- Dix annonces ouvertes au plus par joueur.
-- ---------------------------------------------------------------------
create or replace function public.pokedock_vendre(p_numero integer, p_prix bigint)
returns json language plpgsql security definer set search_path to 'public'
as $function$
declare uid text := auth.uid()::text; q int; n_ouv int; id_a bigint;
begin
  if uid is null then return json_build_object('erreur','Connecte-toi.'); end if;
  if p_numero < 1 or p_numero > 100 then
    return json_build_object('erreur','Cette carte n''existe pas.'); end if;
  if p_prix is null or p_prix < 100 then
    return json_build_object('erreur','Le prix minimum est de 1 €.'); end if;
  if p_prix > 100000000 then
    return json_build_object('erreur','Un million d''euros, c''est le plafond.'); end if;

  select count(*) into n_ouv from public.pokedock_annonces
   where vendeur = uid and statut = 'ouverte';
  if n_ouv >= 10 then
    return json_build_object('erreur','Dix annonces à la fois, pas plus.'); end if;

  select quantite into q from public.pokedock_collection
   where joueur = uid and numero = p_numero for update;
  if q is null or q < 2 then
    return json_build_object('erreur','Tu ne peux vendre qu''un double : il t''en faut deux.');
  end if;

  update public.pokedock_collection set quantite = quantite - 1
   where joueur = uid and numero = p_numero;
  insert into public.pokedock_annonces(vendeur,numero,prix)
   values (uid,p_numero,p_prix) returning id into id_a;

  return json_build_object('ok',true,'id',id_a,'numero',p_numero,'prix',p_prix);
end $function$;

-- ---------------------------------------------------------------------
-- ACHETER UNE ANNONCE : verrou sur l'annonce avant de toucher à l'argent.
-- Commission de 8 % prélevée sur la vente, versée au vendeur le reste.
-- ---------------------------------------------------------------------
create or replace function public.pokedock_acheter(p_id bigint)
returns json language plpgsql security definer set search_path to 'public'
as $function$
declare uid text := auth.uid()::text; a record;
        solde bigint; net bigint; com bigint;
        COMMISSION numeric := 0.08;
begin
  if uid is null then return json_build_object('erreur','Connecte-toi.'); end if;
  perform public.pokedock_balayer();

  select * into a from public.pokedock_annonces
   where id = p_id and statut = 'ouverte' for update;
  if a is null then return json_build_object('erreur','Trop tard : elle est partie.'); end if;
  if a.expire < now() then return json_build_object('erreur','Cette annonce a expiré.'); end if;
  if a.vendeur = uid then
    return json_build_object('erreur','C''est ta propre annonce.'); end if;

  perform public.compte(uid);
  select euros_cents into solde from public.comptes where id = uid for update;
  if solde is null or solde < a.prix then
    return json_build_object('erreur','Tu n''as pas de quoi.');
  end if;

  com := round(a.prix * COMMISSION);
  net := a.prix - com;

  update public.comptes set euros_cents = euros_cents - a.prix, maj = now()
   where id = uid returning euros_cents into solde;
  perform public.compte(a.vendeur);
  update public.comptes set euros_cents = euros_cents + net, maj = now()
   where id = a.vendeur;

  update public.pokedock_annonces
     set statut='vendue', acheteur=uid, conclue=now() where id = p_id;

  insert into public.pokedock_collection(joueur,numero,quantite)
    values (uid,a.numero,1)
    on conflict (joueur,numero) do update
      set quantite = public.pokedock_collection.quantite + 1;

  return json_build_object('ok',true,'numero',a.numero,'prix',a.prix,
                           'commission',com,'euros',solde);
end $function$;

-- ---------------------------------------------------------------------
-- RETIRER UNE ANNONCE : seul le vendeur, la carte revient dans son classeur.
-- ---------------------------------------------------------------------
create or replace function public.pokedock_retirer(p_id bigint)
returns json language plpgsql security definer set search_path to 'public'
as $function$
declare uid text := auth.uid()::text; a record;
begin
  if uid is null then return json_build_object('erreur','Connecte-toi.'); end if;
  select * into a from public.pokedock_annonces
   where id = p_id and vendeur = uid and statut = 'ouverte' for update;
  if a is null then return json_build_object('erreur','Cette annonce n''est plus là.'); end if;
  update public.pokedock_annonces set statut='retiree', conclue=now() where id = p_id;
  insert into public.pokedock_collection(joueur,numero,quantite)
    values (uid,a.numero,1)
    on conflict (joueur,numero) do update
      set quantite = public.pokedock_collection.quantite + 1;
  return json_build_object('ok',true,'numero',a.numero);
end $function$;

-- ---------------------------------------------------------------------
-- LA REPRISE : le marchand rachète des doubles au tarif de la maison.
-- Il en laisse toujours un. Plafond de 50 € par jour (Europe/Paris).
-- ---------------------------------------------------------------------
create or replace function public.pokedock_reprendre(p_numero integer, p_combien integer)
returns json language plpgsql security definer set search_path to 'public'
as $function$
declare
  uid     text := auth.uid()::text;
  PLAFOND bigint := 5000;
  q       int;
  prix    bigint;
  total   bigint;
  deja    bigint;
  solde   bigint;
begin
  if uid is null then return json_build_object('erreur','Connecte-toi.'); end if;
  if p_numero is null or p_numero < 1 or p_numero > 100 then
    return json_build_object('erreur','Cette carte n''existe pas.'); end if;
  if p_combien is null or p_combien < 1 or p_combien > 200 then
    return json_build_object('erreur','Un nombre de cartes, entre 1 et 200.'); end if;

  prix := public.pokedock_reprise(p_numero);
  if prix <= 0 then return json_build_object('erreur','Le marchand n''en veut pas.'); end if;

  select quantite into q from public.pokedock_collection
   where joueur = uid and numero = p_numero for update;
  if q is null or q < 2 then
    return json_build_object('erreur','Il faut en avoir deux pour en vendre une.'); end if;
  if p_combien > q - 1 then
    return json_build_object('erreur','Il doit t''en rester une : tu peux en vendre '||(q-1)||'.'); end if;

  total := prix * p_combien;
  deja  := public.pokedock_reprise_jour(uid);
  if deja + total > PLAFOND then
    return json_build_object('erreur',
      'Le marchand a fait sa caisse : '||round((PLAFOND-deja)/100.0,2)||' € encore aujourd''hui.',
      'reste', PLAFOND - deja);
  end if;

  update public.pokedock_collection set quantite = quantite - p_combien
   where joueur = uid and numero = p_numero;
  perform public.compte(uid);
  update public.comptes set euros_cents = euros_cents + total, maj = now()
   where id = uid returning euros_cents into solde;
  insert into public.pokedock_reprises(joueur,numero,combien,cents)
   values (uid,p_numero,p_combien,total);

  return json_build_object('ok',true,'numero',p_numero,'combien',p_combien,
    'gagne',total,'euros',solde,'reste',q - p_combien,
    'jour', deja + total, 'plafond', PLAFOND);
end $function$;

-- LA REPRISE EN UNE FOIS : tous les doubles des cartes 1 à 62 (communes
-- et rares), dans la limite du plafond du jour.
create or replace function public.pokedock_reprendre_tout()
returns json language plpgsql security definer set search_path to 'public'
as $function$
declare
  uid     text := auth.uid()::text;
  PLAFOND bigint := 5000;
  r       record;
  prix    bigint;
  k       int;
  total   bigint := 0;
  cartes  int := 0;
  deja    bigint;
  solde   bigint;
  reste   bigint;
begin
  if uid is null then return json_build_object('erreur','Connecte-toi.'); end if;
  deja  := public.pokedock_reprise_jour(uid);
  reste := PLAFOND - deja;
  if reste <= 0 then
    return json_build_object('erreur','Le marchand a fait sa caisse. Reviens demain.'); end if;

  for r in select numero, quantite from public.pokedock_collection
            where joueur = uid and quantite >= 2 and numero between 1 and 62
            order by numero for update
  loop
    prix := public.pokedock_reprise(r.numero);
    k := r.quantite - 1;
    if prix * k > reste then k := (reste / prix)::int; end if;
    if k <= 0 then continue; end if;
    update public.pokedock_collection set quantite = quantite - k
     where joueur = uid and numero = r.numero;
    insert into public.pokedock_reprises(joueur,numero,combien,cents)
     values (uid,r.numero,k,prix*k);
    total  := total + prix*k;
    reste  := reste - prix*k;
    cartes := cartes + k;
  end loop;

  if cartes = 0 then
    return json_build_object('erreur','Rien à reprendre : pas de double commun ni rare.'); end if;

  perform public.compte(uid);
  update public.comptes set euros_cents = euros_cents + total, maj = now()
   where id = uid returning euros_cents into solde;

  return json_build_object('ok',true,'cartes',cartes,'gagne',total,'euros',solde,
    'jour', deja + total, 'plafond', PLAFOND);
end $function$;

-- ---------------------------------------------------------------------
-- LES REPRISES NE SONT LISIBLES QUE PAR LES FONCTIONS CI-DESSUS (RLS
-- activé, aucune politique). Les reprises ne sont donc jamais exposées.
-- ---------------------------------------------------------------------
grant execute on function public.pokedock_marche()                 to anon, authenticated;
grant execute on function public.pokedock_vendre(int,bigint)       to anon, authenticated;
grant execute on function public.pokedock_acheter(bigint)          to anon, authenticated;
grant execute on function public.pokedock_retirer(bigint)          to anon, authenticated;
grant execute on function public.pokedock_reprendre(int,int)       to authenticated;
grant execute on function public.pokedock_reprendre_tout()         to authenticated;
grant execute on function public.pokedock_cote(int)                to anon, authenticated;
