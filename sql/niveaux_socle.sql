-- ============================================================
-- LES NIVEAUX — ÉTAPE 1 : LE SOCLE SERVEUR (21/10/2026)
-- XP = le score du classement juste (progres.recolte, rempli par
-- noter_points : forêt, légumes, fruits, pêche).
-- Rien n'est encore visible dans le jeu : l'interface vient aux étapes 2-5.
-- ============================================================

-- la courbe : 100,180,260,350,450,560,680,810,950 puis +150,+160,+170…
create or replace function public.niveau_cout(n int) returns int language sql immutable as $f$
  select case when n<=9 then (array[100,180,260,350,450,560,680,810,950])[n]
              else 950 + (n-9)*150 + ((n-9)*(n-10)/2)*10 end $f$;

create or replace function public.niveau_de(p_xp bigint) returns json language plpgsql immutable as $f$
declare n int := 1; debut bigint := 0; c int;
begin
  loop c := public.niveau_cout(n); exit when debut + c > coalesce(p_xp,0) or n >= 200; debut := debut + c; n := n + 1; end loop;
  return json_build_object('niveau',n,'xp',coalesce(p_xp,0),'dans',coalesce(p_xp,0)-debut,'pour',c,'debut',debut);
end $f$;

create table if not exists public.niveaux_paliers(niveau int primary key, nom text not null, recompenses jsonb not null default '[]', coffre text);
create table if not exists public.niveaux_reclames(joueur text not null, niveau int not null, quand timestamptz not null default now(), donne jsonb, primary key(joueur,niveau));
create table if not exists public.inventaire_niveau(joueur text not null, cle text not null, n int not null default 0, maj timestamptz not null default now(), primary key(joueur,cle));
create table if not exists public.coffres_joueur(joueur text not null, coffre text not null, n int not null default 0, primary key(joueur,coffre));
create table if not exists public.profil_niveau(joueur text primary key, titre text, maj timestamptz not null default now());
create table if not exists public.graines_offertes(joueur text not null, cult text not null, n int not null default 0, primary key(joueur,cult));
-- (RLS activée sur toutes ces tables ; on n'y accède que par les fonctions)

-- les 30 paliers : voir la table niveaux_paliers en base (données insérées le 21/10/2026).
-- Types de récompense : euros, graines, sac, titre (actifs tout de suite) ;
-- kart, vitrines, bonus, glace, deblocage, cadre, recette, emote, parcelles, tenue, etoile
-- (gardés dans inventaire_niveau, activés quand la fonctionnalité arrivera) ; coffre.

-- mon_niveau()            : niveau, titre, niveaux réclamés, coffres, paliers (auth.uid())
-- niveau_reclamer(niveau) : donne la récompense une seule fois, si le niveau est atteint
-- champ_geste            : prend d'abord une graine offerte avant de faire payer la graine
