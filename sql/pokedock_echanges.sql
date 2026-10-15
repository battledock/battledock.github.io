-- =====================================================================
-- POKÉDOCK — LA SALLE D'ÉCHANGE
--
-- À coller tel quel dans Supabase → SQL Editor → Run, APRÈS
-- pokedock_premiere_edition.sql (elle lit pokedock_collection).
--
-- Une carte double contre une carte précise, validée par l'autre joueur.
-- AUCUN EURO NE BOUGE : la valeur reste dans les mains des joueurs, donc
-- rien ne se crée. Le marché (vente contre euros) est une autre affaire.
-- =====================================================================

create table if not exists public.pokedock_echanges(
  id              bigserial primary key,
  proposeur       text        not null,
  offre           smallint    not null check (offre between 1 and 100),
  demande         smallint    not null check (demande between 1 and 100),
  statut          text        not null default 'ouverte'
                  check (statut in ('ouverte','conclue','annulee')),
  cree            timestamptz not null default now(),
  accepteur       text,
  conclue         timestamptz,
  check (offre <> demande)
);
create index if not exists pokedock_echanges_ouvertes
  on public.pokedock_echanges(statut, demande);
alter table public.pokedock_echanges enable row level security;

-- ---------------------------------------------------------------------
-- LA LISTE DES OFFRES OUVERTES (7 jours). Chacun voit les offres des
-- autres, sans savoir qui les a faites : seulement « mien » si c'est la sienne.
-- ---------------------------------------------------------------------
create or replace function public.pokedock_echanges_liste()
returns json language plpgsql security definer set search_path to 'public'
as $$
declare uid text := auth.uid()::text; j json;
begin
  select coalesce(json_agg(json_build_object(
           'id',e.id,'offre',e.offre,'demande',e.demande,
           'mien',(e.proposeur = uid),'cree',e.cree) order by e.cree desc),'[]'::json)
    into j
    from public.pokedock_echanges e
   where e.statut = 'ouverte' and e.cree > now() - interval '7 days';
  return json_build_object('ouvertes',j);
end $$;

-- ---------------------------------------------------------------------
-- PROPOSER : le double est retiré de la collection tout de suite, pour
-- qu'il ne puisse pas être vendu ou échangé deux fois pendant l'offre.
-- ---------------------------------------------------------------------
create or replace function public.pokedock_echange_proposer(p_offre int, p_demande int)
returns json language plpgsql security definer set search_path to 'public'
as $$
declare uid text := auth.uid()::text; q int; n_ouv int; id_e bigint;
begin
  if uid is null then return json_build_object('erreur','Connecte-toi.'); end if;
  if p_offre is null or p_demande is null or p_offre not between 1 and 100
     or p_demande not between 1 and 100 then
    return json_build_object('erreur','Cette carte n''existe pas.'); end if;
  if p_offre = p_demande then
    return json_build_object('erreur','Il faut deux cartes différentes.'); end if;

  select count(*) into n_ouv from public.pokedock_echanges
   where proposeur = uid and statut = 'ouverte';
  if n_ouv >= 5 then
    return json_build_object('erreur','Cinq échanges à la fois, pas plus.'); end if;

  select quantite into q from public.pokedock_collection
   where joueur = uid and numero = p_offre for update;
  if q is null or q < 2 then
    return json_build_object('erreur','Tu ne peux échanger qu''un double : il t''en faut deux.');
  end if;

  update public.pokedock_collection set quantite = quantite - 1
   where joueur = uid and numero = p_offre;
  insert into public.pokedock_echanges(proposeur,offre,demande)
   values (uid,p_offre,p_demande) returning id into id_e;

  return json_build_object('ok',true,'id',id_e,'offre',p_offre,'demande',p_demande);
end $$;

-- ---------------------------------------------------------------------
-- ACCEPTER : verrou sur l'offre (deux acceptants à la même seconde ne
-- peuvent pas la conclure deux fois), puis échange des deux cartes.
-- ---------------------------------------------------------------------
create or replace function public.pokedock_echange_accepter(p_id bigint)
returns json language plpgsql security definer set search_path to 'public'
as $$
declare uid text := auth.uid()::text; e record; q int;
begin
  if uid is null then return json_build_object('erreur','Connecte-toi.'); end if;

  select * into e from public.pokedock_echanges
   where id = p_id and statut = 'ouverte' for update;
  if e is null then return json_build_object('erreur','Trop tard : l''échange est fermé.'); end if;
  if e.proposeur = uid then
    return json_build_object('erreur','C''est ta propre offre.'); end if;

  select quantite into q from public.pokedock_collection
   where joueur = uid and numero = e.demande for update;
  if q is null or q < 1 then
    return json_build_object('erreur','Il te manque la carte demandée.'); end if;

  update public.pokedock_collection set quantite = quantite - 1
   where joueur = uid and numero = e.demande;
  insert into public.pokedock_collection(joueur,numero,quantite) values (uid,e.offre,1)
    on conflict (joueur,numero) do update
      set quantite = public.pokedock_collection.quantite + 1;
  insert into public.pokedock_collection(joueur,numero,quantite) values (e.proposeur,e.demande,1)
    on conflict (joueur,numero) do update
      set quantite = public.pokedock_collection.quantite + 1;

  update public.pokedock_echanges
     set statut='conclue', accepteur=uid, conclue=now() where id = p_id;

  return json_build_object('ok',true,'recue',e.offre,'donnee',e.demande);
end $$;

-- ---------------------------------------------------------------------
-- ANNULER : seul le proposeur, et seulement si l'offre est encore ouverte.
-- Le double revient dans son classeur.
-- ---------------------------------------------------------------------
create or replace function public.pokedock_echange_annuler(p_id bigint)
returns json language plpgsql security definer set search_path to 'public'
as $$
declare uid text := auth.uid()::text; e record;
begin
  if uid is null then return json_build_object('erreur','Connecte-toi.'); end if;
  select * into e from public.pokedock_echanges
   where id = p_id and statut = 'ouverte' and proposeur = uid for update;
  if e is null then return json_build_object('erreur','Cette offre n''est plus à toi.'); end if;

  update public.pokedock_collection set quantite = quantite + 1
   where joueur = uid and numero = e.offre;
  update public.pokedock_echanges set statut='annulee' where id = p_id;

  return json_build_object('ok',true,'numero',e.offre);
end $$;

grant execute on function public.pokedock_echanges_liste()          to anon, authenticated;
grant execute on function public.pokedock_echange_proposer(int,int) to anon, authenticated;
grant execute on function public.pokedock_echange_accepter(bigint)  to anon, authenticated;
grant execute on function public.pokedock_echange_annuler(bigint)   to anon, authenticated;
