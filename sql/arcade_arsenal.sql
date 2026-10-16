-- Battle Dock : arsenal de l'arcade (Le Hangar).
--
-- 1. Gains généreux : jusqu'à 20 € et 100 points par partie, 100 € et 500 points par jour.
-- 2. Équipement de départ : arcade_demarrer valide l'arme choisie contre l'arsenal.
-- 3. Boutique : quatre armes payées en euros, achats gardés en base.
-- 4. L'arsenal = pistolet + armes débloquées au score + armes achetées.
--    Les seuils de déblocage sont ceux de HG_DEBLOQUE dans arcade.html : à garder en accord.

alter table public.arcade_parties add column if not exists arme text not null default 'pistolet';

create table if not exists public.arcade_achats (
  joueur text not null,
  arme   text not null,
  quand  timestamptz not null default now(),
  primary key (joueur, arme)
);
alter table public.arcade_achats enable row level security;
-- aucune politique : on ne lit ces achats qu'à travers les fonctions ci-dessous

create or replace function public.arcade_prix(p_arme text)
returns bigint
language sql
immutable
as $function$
  select case p_arme
    when 'fusil'   then 1500
    when 'minigun' then 2500
    when 'plasma'  then 3500
    when 'railgun' then 5000
    else null end
$function$;

create or replace function public.arcade_arsenal_de(p_joueur text)
returns text[]
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
declare
  mx int; r text[];
begin
  select coalesce(max(score),0) into mx from public.arcade_parties
   where joueur = p_joueur and borne = 'hangar' and fini;
  r := array['pistolet'];
  r := r || array(
    select v.a from (values
      ('pompe',0),('mitraillette',1500),('clouteuse',4000),('revolver',9000),
      ('scie',15000),('harpon',24000),('flammes',36000),('foudroyeur',55000),
      ('mortier',80000),('napalm',115000),('laser',160000)
    ) as v(a, s) where mx >= v.s);
  r := r || array(select a.arme from public.arcade_achats a where a.joueur = p_joueur);
  return r;
end
$function$;

create or replace function public.arcade_mon_arsenal()
returns json
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
declare
  uid text := auth.uid()::text; own text[];
begin
  if uid is null then return json_build_object('erreur','Connecte-toi pour jouer.'); end if;
  own := public.arcade_arsenal_de(uid);
  return json_build_object(
    'possedees', to_json(own),
    'boutique', (select json_agg(json_build_object(
                   'arme', b.a, 'prix', public.arcade_prix(b.a),
                   'possede', (b.a = any(own))) order by b.n)
                 from (values ('fusil',1),('minigun',2),('plasma',3),('railgun',4)) as b(a, n)));
end
$function$;

create or replace function public.arcade_acheter_arme(p_arme text)
returns json
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  uid text := auth.uid()::text;
  prix bigint := public.arcade_prix(p_arme);
  solde bigint;
begin
  if uid is null then return json_build_object('erreur','Connecte-toi pour jouer.'); end if;
  if prix is null then return json_build_object('erreur','Cette arme ne se vend pas.'); end if;
  if p_arme = any(public.arcade_arsenal_de(uid)) then
    return json_build_object('erreur','Tu l''as déjà.');
  end if;
  perform public.compte(uid);
  select euros_cents into solde from public.comptes where id = uid for update;
  if solde is null or solde < prix then
    return json_build_object('erreur','Il te manque de quoi l''acheter.');
  end if;
  update public.comptes set euros_cents = euros_cents - prix
   where id = uid returning euros_cents into solde;
  insert into public.arcade_achats(joueur, arme) values (uid, p_arme);
  return json_build_object('ok',true,'arme',p_arme,'euros',solde);
end
$function$;

create or replace function public.arcade_demarrer(p_borne text, p_arme text)
returns json
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  uid text := auth.uid()::text;
  v_arme text := coalesce(nullif(p_arme,''),'pistolet');
  r jsonb;
begin
  if uid is null then return json_build_object('erreur','Connecte-toi pour jouer.'); end if;
  if not (v_arme = any(public.arcade_arsenal_de(uid))) then
    return json_build_object('erreur','Cette arme n''est pas à toi.');
  end if;
  r := public.arcade_jeton(p_borne)::jsonb;
  if r->>'erreur' is not null then return r::json; end if;
  update public.arcade_parties set arme = v_arme where id = (r->>'partie')::uuid;
  return (r || jsonb_build_object('arme', v_arme))::json;
end
$function$;

-- Gains généreux : 100 centimes + 1 cent par 5 points, plafonné à 20 € par partie.
-- Points : 1 + 1 par 50 points, plafonnés à 100 par partie.
-- Plafonds par 24 h : 100 € et 500 points.
create or replace function public.arcade_score(p_partie uuid, p_score integer)
returns json
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  uid text := auth.uid()::text;
  p record; sc int := greatest(0, coalesce(p_score,0));
  PLAF jsonb := '{"hangar":400000}'::jsonb;
  cap int; rang int; record_perso int;
  pts int; gn bigint; jour_e bigint; jour_p bigint; solde bigint;
begin
  if uid is null then return json_build_object('erreur','Connecte-toi pour jouer.'); end if;
  select * into p from public.arcade_parties
   where id = p_partie and joueur = uid for update;
  if not found then return json_build_object('erreur','Cette partie n''existe plus.'); end if;
  if p.fini then return json_build_object('erreur','Ce score est déjà posé.'); end if;
  cap := coalesce((PLAF->>p.borne)::int, 100000);
  if sc > cap then sc := cap; end if;

  pts := least(100, 1 + sc / 50);
  gn  := least(2000, 100 + sc / 5);

  select coalesce(sum(gain),0), coalesce(sum(points),0) into jour_e, jour_p
    from public.arcade_parties
   where joueur = uid and fini and quand > now() - interval '24 hours';
  gn  := least(gn,  greatest(0, 10000 - jour_e));
  pts := least(pts, greatest(0, 500 - jour_p))::int;

  update public.arcade_parties
     set score = sc, fini = true, gain = gn, points = pts
   where id = p_partie;

  perform public.compte(uid);
  if gn > 0 then
    update public.comptes set euros_cents = euros_cents + gn where id = uid
     returning euros_cents into solde;
  else
    select euros_cents into solde from public.comptes where id = uid;
  end if;
  if pts > 0 then perform public.noter_la_recolte(uid, pts); end if;

  select count(*)+1 into rang from public.arcade_parties
   where borne = p.borne and fini and score > sc;
  select max(score) into record_perso from public.arcade_parties
   where borne = p.borne and joueur = uid and fini;
  return json_build_object('ok',true,'score',sc,'borne',p.borne,
                           'rang',rang,'record',record_perso,
                           'gain',gn,'points',pts,'euros',solde);
end
$function$;
