-- Battle Dock : le billet pour Tokyo (24 000 centimes, soit 240 €).
-- prendre_billet fixe le prix côté serveur ; p_cents envoyé par le navigateur est ignoré.
create or replace function public.prendre_billet(p_joueur text, p_dest text, p_cents bigint)
 returns json
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare solde bigint; prix bigint;
begin
  prix := case p_dest when 'marseille' then 500 when 'tokyo' then 24000 else null end;
  if prix is null then return json_build_object('erreur','ferme'); end if;
  select euros_cents into solde from public.comptes where id = p_joueur for update;
  if solde is null then return json_build_object('erreur','compte'); end if;
  if solde < prix then
    return json_build_object('erreur','pas_assez','euros',solde);
  end if;
  update public.comptes set euros_cents = euros_cents - prix where id = p_joueur
    returning euros_cents into solde;
  insert into public.voyages(joueur,destination,paye_cents,depart,arrivee)
    values (p_joueur,p_dest,prix,now(),now()+interval '10 seconds')
  on conflict (joueur) do update
    set destination=excluded.destination, paye_cents=excluded.paye_cents,
        depart=now(), arrivee=now()+interval '10 seconds', retour=null;
  return json_build_object('euros',solde,'destination',p_dest,'duree',10);
end $function$;
