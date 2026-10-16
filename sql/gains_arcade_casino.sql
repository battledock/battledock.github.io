-- Battle Dock : points du classement général et euros de l'arcade.
--
-- 1. L'arcade rapporte des euros (selon le score) et des points de classement.
--    Le score vient du client : les plafonds PAR JOUR bornent ce qu'un
--    tricheur peut en tirer (2000 centimes et 300 points par 24 h).
-- 2. Chaque coup de casino rapporte 1 point de classement, au plus 200 par jour.
--    Le déclencheur s'appuie sur casino_coups : aucune fonction de casino n'est réécrite.

alter table public.arcade_parties add column if not exists gain bigint not null default 0;
alter table public.arcade_parties add column if not exists points int not null default 0;

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

  pts := least(50, 1 + sc / 100);
  gn  := least(500, 100 + sc / 20);

  select coalesce(sum(gain),0), coalesce(sum(points),0) into jour_e, jour_p
    from public.arcade_parties
   where joueur = uid and fini and quand > now() - interval '24 hours';
  gn  := least(gn,  greatest(0, 2000 - jour_e));
  pts := least(pts, greatest(0, 300 - jour_p))::int;

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
end $function$;

create or replace function public.casino_points_coup()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if new.jeu <> 'cagnotte' and new.joueur is not null
     and (select count(*) from public.casino_coups
           where joueur = new.joueur and jeu <> 'cagnotte'
             and quand > now() - interval '24 hours') <= 200 then
    perform public.noter_la_recolte(new.joueur, 1);
  end if;
  return new;
end $function$;

create or replace trigger casino_points_apres_coup
  after insert on public.casino_coups
  for each row execute function public.casino_points_coup();
