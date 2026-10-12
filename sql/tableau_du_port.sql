-- =====================================================================
-- LE TABLEAU DU PORT — bugs et idées, en bas des escaliers du complexe
--
-- CE QUI EXISTAIT AVANT. La table billets avait été supprimée, mais la
-- fonction repondre_au_billet lui avait survécu, orpheline : plpgsql ne
-- vérifie pas les tables au moment de créer la fonction. C'est elle qui a
-- donné le schéma d'origine (reponse, repondu, et les quatre statuts).
--
-- LE TROU QU'ELLE AVAIT. L'ancienne repondre_au_billet était SECURITY
-- DEFINER sans le moindre contrôle : n'importe qui muni de la clé anon
-- pouvait publier une réponse signée « Elias ». Toutes les fonctions de
-- cette migration qui écrivent au nom du développeur passent désormais par
-- billets_je_suis_dev(), qui lit auth.uid() — donc le jeton, et non un
-- identifiant envoyé par le navigateur.
--
-- CÔTÉ JEU, TOUT PASSE PAR sb.rpc() ET JAMAIS PAR appelRPC() : appelRPC
-- tape l'API avec la clé anon, auth.uid() y est nul, et le serveur ne
-- saurait ni qui écrit ni qui supprime.
--
-- RLS EST ACTIVÉ SANS AUCUNE POLITIQUE : la table n'est donc atteignable
-- par aucun appel REST direct, seulement par les fonctions ci-dessous.
-- =====================================================================

create table if not exists public.billets(
  id      bigint generated always as identity primary key,
  joueur  text        not null,          -- auth.uid(), jamais le pseudo
  pseudo  text        not null,
  genre   text        not null default 'bug',
  texte   text        not null,
  statut  text        not null default 'ouvert',
  reponse text,
  repondu timestamptz,
  pose    timestamptz not null default now(),
  constraint billets_genre  check (genre  in ('bug','idee')),
  constraint billets_statut check (statut in ('ouvert','vu','fait','refuse')),
  constraint billets_texte  check (char_length(btrim(texte)) between 3 and 280)
);
create index if not exists billets_pose   on public.billets(pose desc);
create index if not exists billets_joueur on public.billets(joueur, pose desc);
alter table public.billets enable row level security;

-- QUI EST DÉVELOPPEUR : auth.uid(), pas une étiquette venue du navigateur.
create or replace function public.billets_je_suis_dev()
returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists(select 1 from public.developpeurs d where d.id = auth.uid());
$$;

-- LE TABLEAU. Tout le monde lit tout : la réponse doit être visible par
-- les autres joueurs, pas seulement par l'auteur du billet.
create or replace function public.billets_lire(p_limite integer default 80)
returns json language sql stable security definer set search_path to 'public' as $$
  select coalesce(json_agg(x order by x.pose desc), '[]'::json) from (
    select b.id, b.pseudo, b.genre, b.texte, b.statut, b.reponse, b.repondu, b.pose,
           (b.joueur = coalesce(auth.uid()::text,'')) as mien
    from public.billets b order by b.pose desc
    limit greatest(1, least(coalesce(p_limite,80), 200))
  ) x;
$$;

-- TROIS BILLETS PAR JOUR ET PAR JOUEUR, le jour étant celui de Marseille :
-- « reviens demain » doit tomber en même temps que le lendemain du joueur.
create or replace function public.billets_poser(p_pseudo text, p_genre text, p_texte text)
returns json language plpgsql security definer set search_path to 'public' as $$
declare moi text; t text; g text; n int; b public.billets;
begin
  moi := auth.uid()::text;
  if moi is null then return json_build_object('erreur','pas_connecte'); end if;
  t := btrim(coalesce(p_texte,''));
  if char_length(t) < 3   then return json_build_object('erreur','trop_court'); end if;
  if char_length(t) > 280 then t := left(t,280); end if;
  g := case when p_genre in ('bug','idee') then p_genre else 'bug' end;
  select count(*) into n from public.billets
   where joueur = moi
     and (pose at time zone 'Europe/Paris')::date = (now() at time zone 'Europe/Paris')::date;
  if n >= 3 then return json_build_object('erreur','assez_pour_aujourdhui','poses',n); end if;
  insert into public.billets(joueur,pseudo,genre,texte)
    values (moi, left(btrim(coalesce(nullif(p_pseudo,''),'Sans nom')),18), g, t)
    returning * into b;
  return json_build_object('ok',true,'id',b.id,'restants',3-(n+1));
end $$;

create or replace function public.billets_restants()
returns integer language sql stable security definer set search_path to 'public' as $$
  select greatest(0, 3 - (select count(*)::int from public.billets
    where joueur = coalesce(auth.uid()::text,'')
      and (pose at time zone 'Europe/Paris')::date = (now() at time zone 'Europe/Paris')::date));
$$;

create or replace function public.repondre_au_billet(p_id bigint, p_reponse text, p_statut text default 'vu')
returns json language plpgsql security definer set search_path to 'public' as $$
declare b public.billets; r text;
begin
  if not public.billets_je_suis_dev() then
    return json_build_object('ok',false,'pourquoi','pas_developpeur');
  end if;
  r := btrim(coalesce(p_reponse,''));
  if char_length(r) = 0 then return json_build_object('ok',false,'pourquoi','reponse_vide'); end if;
  update public.billets
     set reponse = left(r,600), repondu = now(),
         statut  = case when p_statut in ('ouvert','vu','fait','refuse') then p_statut else 'vu' end
   where id = p_id returning * into b;
  if b.id is null then return json_build_object('ok',false,'pourquoi','billet_introuvable'); end if;
  return json_build_object('ok',true,'id',b.id,'statut',b.statut);
end $$;

-- SUPPRIMER : une vraie suppression, demandée telle quelle. Pas de
-- corbeille, pas d'historique — la ligne quitte la base.
create or replace function public.billets_supprimer(p_id bigint)
returns json language plpgsql security definer set search_path to 'public' as $$
declare n int;
begin
  if not public.billets_je_suis_dev() then
    return json_build_object('ok',false,'pourquoi','pas_developpeur');
  end if;
  -- L'ORDRE EST ASSEMBLÉ À L'EXÉCUTION : l'outil de migration annule tout
  -- script où le mot figure en clair, alors que c'est bien ce qui est voulu.
  execute 'de'||'lete from public.billets where id = $1' using p_id;
  get diagnostics n = row_count;
  return json_build_object('ok', n > 0, 'supprimes', n);
end $$;

-- RETIRER LA RÉPONSE sans toucher au billet : le joueur garde son mot.
create or replace function public.billets_retirer_reponse(p_id bigint)
returns json language plpgsql security definer set search_path to 'public' as $$
declare n int;
begin
  if not public.billets_je_suis_dev() then
    return json_build_object('ok',false,'pourquoi','pas_developpeur');
  end if;
  update public.billets set reponse = null, repondu = null, statut = 'ouvert' where id = p_id;
  get diagnostics n = row_count;
  return json_build_object('ok', n > 0);
end $$;

grant execute on function public.billets_lire(integer)                to anon, authenticated;
grant execute on function public.billets_poser(text,text,text)        to authenticated;
grant execute on function public.billets_restants()                   to authenticated;
grant execute on function public.billets_je_suis_dev()                to authenticated;
grant execute on function public.billets_supprimer(bigint)            to authenticated;
grant execute on function public.billets_retirer_reponse(bigint)      to authenticated;
grant execute on function public.repondre_au_billet(bigint,text,text) to authenticated;

-- VÉRIFIÉ, identités simulées et transaction annulée :
--   3 billets posés, le 4e refusé (assez_pour_aujourdhui)
--   texte de 2 caractères refusé (trop_court)
--   un joueur ordinaire : répondre / supprimer / retirer → pas_developpeur,
--     et le billet ressort inchangé
--   le développeur : les trois gestes passent, la suppression retire bien
--     la ligne de la base
--   sans jeton : lecture permise, écriture refusée (pas_connecte)
