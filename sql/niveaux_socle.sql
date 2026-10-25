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

-- ============================================================
-- ÉTAPE 4 : LES COFFRES (21/10/2026)
-- coffre_ouvrir(coffre) : tirage serveur. bois 3 objets, malle 4 (un rare
-- garanti), bonne 5 (un légendaire garanti), legendaire 5 (deux légendaires).
-- Raretés par objet : légendaire 0,5 % (+0,1 tous les 10 niveaux), épique
-- 4,5 % (+0,5), rare 25 %, le reste commun. Quantités × (1 + niveau/10).
-- Garanties : un épique au plus tard tous les 10 objets, un légendaire au
-- plus tard tous les 30 coffres (table coffres_pitie). Journal : coffres_ouverts.
-- coffre_objet(uid, rareté, facteur) donne vraiment l'objet :
--   commun     : euros 200–800 € ×f · graines offertes (cultures débloquées)
--   rare       : glace 10 min · paquet Pokédock · engrais · graines rares (lavande, safran)
--   épique     : bourse 2 000–5 000 € ×f · 3 paquets Pokédock · 3 fragments
--   légendaire : sac +5 pour toujours · trésor 10 000–20 000 € ×f · 10 fragments
-- pokedock_paquet_offert(uid) : un paquet sans le payer (réservé au serveur).
-- ============================================================

-- ============================================================
-- ÉTAPE 5 : LE RATTRAPAGE DES ANCIENS (21/10/2026)
-- niveaux_rattrapage(joueur, niveau, coffres, pris) : photo du niveau de
-- chaque joueur au lancement ; un coffre par tranche de 5 niveaux
-- (tranche impaire = caisse en bois, paire = malle du marin).
-- niveau_rattrapage() : donne ces coffres une seule fois.
-- mon_niveau() renvoie 'rattrapage' tant qu'il n'est pas pris.
-- Le jeu affiche « Cadeau des anciens » et TOUT RÉCUPÉRER réclame en plus
-- toutes les récompenses de niveau déjà gagnées.
-- ============================================================

-- ============================================================
-- ÉTAPE 6 (1re partie) : LES RÉCOMPENSES QUI MARCHENT (21/10/2026)
-- niv_bonus(uid, cle) lit inventaire_niveau. mon_niveau renvoie 'inv' et 'glaces'.
-- Actives : ventes +3 % (vendre_au_comptoir, vendre_poisson) · verger +1 fruit
-- (verger_cueillir) · enclos +1 (betes_acheter, betes_etat) · parcelles
-- (+4 cases par parcelle sur champ_joueur.max, dès la réclamation) · glaces
-- offertes (glacier_acheter, glacier_etat 'offertes') · côté jeu : hache -1 coup,
-- pêche qui mord 3 % plus vite, kart Bleu nuit, turbo de départ +0,2 s en
-- course libre, cadre Cordage sur la plaque.
-- fragments_echanger('sac'|'tresor'|'bonne') : 10 fragments = un légendaire.
-- Restent pour plus tard : vitrines, ruche, cabanon, recettes, emote, circuit
-- Le Panier, pêche de nuit / au large, bateau, tenue, VIP, aquarium, étoile, statue.
-- ============================================================

-- ============================================================
-- PAQUETS POKÉDOCK GAGNÉS ET GRAINES OFFERTES VISIBLES (21/10/2026)
-- pokedock_paquet_offert(uid) ajoute un paquet fermé (inventaire_niveau
-- 'pokedock_offert') ; pokedock_ouvrir le prend avant de faire payer (hors
-- limite de 30/jour) et renvoie 'offerts' ; pokedock_ma_collection aussi.
-- Les 3 paquets d'Eliasse ouverts tout seuls ont été repris (cartes retirées,
-- paquets 232-234 renommés 'annule:…') et rendus fermés.
-- champ_etat renvoie 'offertes' (graines offertes par culture).
-- ============================================================

-- ============================================================
-- ÉTAPE 6 (2e partie, début) : LE RUCHER ET LE CABANON (21/10/2026)
-- ruche_joueur · ruche_etat() / ruche_recolter() : 3 ruches, 3 pots de miel
--   toutes les 4 h (6 au plus), +3 pts « fruits » par pot ; miel 15 € chez
--   Madeleine (prix_ferme). Ouvert si inventaire 'deblocage:ruche' (niveau 8).
-- cabanon_quai · cabanon_quai_etat() / cabanon_quai_ranger(type, nb, 'poser'|'prendre') :
--   60 places à l'abri, sur le quai devant le glacier. Ouvert avec
--   'deblocage:cabanon' (niveau 10). (L'ancien cabanon du Vallon, table
--   cabanon / cabanon_etat(p_joueur), n'est pas touché.)
-- ============================================================
-- Niveau 12 (22/10/2026) : la recette de bouillabaisse est remplacée par 10 doses d'engrais (niveau_reclamer, type 'engrais').
-- Niveau 13 (22/10/2026) : l'emote « Pétanque » marche (niveau_reclamer active le type 'emote'). Côté jeu : bouton boule à côté du menu, geste 'petanque' (jeu.html + personnage.js), la boule vole et roule.
-- Émotes (22/10/2026) : niveau 22 = emote « Santé ! » ; coffre_objet (rare, 15 %) donne une émote manquante parmi danse, bravo, rire, salut, disco. Coucou est offerte à tous. Menu « Émotes » dans le menu du jeu.
-- Corrections (22/10/2026) : noter_points(text,text,double precision) (la récolte du champ plantait) ; champ_geste (graines offertes, colonne ambiguë) ;
-- sac_bonus_niv(uid) ajouté au palier dans agrandir_sac et acheter_amelioration (les +places des niveaux et coffres ne sont plus rabotées) ;
-- prix_ferme : laine 3 €, truffe 38 € (vendues chez Madeleine) ; niveau 5 : 3 paquets Pokédock à la place des vitrines ;
-- le cabanon est à la ferme (1430, 640), plus sur le quai.
-- Classement (22/10/2026) : classement_general renvoie le score = progres.recolte (l'XP) et le titre choisi ; trié par XP. Écran « modèle A » (podium + cartes, en ligne / vu il y a…).
-- Classements Pêche et Pokédock au style du carnet (22/10/2026) : records_peche renvoie id, apparence et maj des pêcheurs (40 au plus).

-- ============================================================
-- 2026-10-22 · VÉRIFICATION CHEZ MADELEINE
-- ============================================================
-- Le facteur de marché sortait de power(0.5, h/2) sans arrondi : il était
-- stocké tel quel dans marche.facteur et renvoyé dans chaque vente. Une
-- réponse de vendre_au_comptoir faisait 18 Ko de décimales. Six décimales
-- suffisent, et cela vaut pour tous ses appelants (comptoir, étal, criée).
create or replace function public.marche_facteur(p_type text)
returns numeric language plpgsql security definer set search_path to 'public'
as $$
declare f numeric; m timestamptz; h numeric;
begin
  insert into marche(produit) values (p_type) on conflict do nothing;
  select facteur, maj into f, m from marche where produit=p_type;
  h := extract(epoch from (now()-m))/3600.0;
  /* retour à la normale : moitié du chemin toutes les deux heures */
  f := 1 + (f-1) * power(0.5, h/2.0);
  f := round(greatest(0.45, least(1.60, f)), 6);   /* six décimales suffisent */
  update marche set facteur=f, maj=now() where produit=p_type;
  return f;
end $$;

update public.marche set facteur = round(facteur,6) where scale(facteur) > 6;

-- ============================================================
-- 2026-10-22 · LE CHAMP AU-DELÀ DE QUARANTE PARCELLES
-- ============================================================
-- champ_agrandir n'avait que six paliers (jusqu'à 160 tuiles, soit
-- quarante parcelles). Les récompenses de niveau poussent le champ plus
-- loin : passé là, la boutique affichait « Au max » devant un champ qui
-- n'était pas plein. Douze paliers, et le vrai maximum au bout (280
-- tuiles, soixante-dix parcelles).
do $d$
declare src text; neuf text;
begin
  select pg_get_functiondef(p.oid) into src from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and p.proname='champ_agrandir';
  neuf := replace(src,
    'PRIX bigint[] := array[150000,400000,900000,1800000,3000000,5000000];',
    'PRIX bigint[] := array[150000,400000,900000,1800000,3000000,5000000,8000000,12000000,18000000,26000000,36000000,50000000];');
  if neuf = src then raise exception 'motif introuvable'; end if;
  execute neuf;
end $d$;

-- ============================================================
-- 2026-10-22 · ÉTAPE 6, SUITE : LES RÉCOMPENSES QUI DORMAIENT
-- ============================================================
-- Deux paliers rendaient « BIENTÔT » : le client lit simplement le
-- drapeau actif que renvoie niveau_reclamer.

-- PALIER 18 · LA PÊCHE DE NUIT
-- Elle existait déjà pour tout le monde — pecher_touche a ses espèces de
-- nuit depuis toujours. La verrouiller aurait retiré quelque chose. Le
-- palier donne donc un avantage : la nuit, ce qui est rare mord bien
-- plus. L'ancienne clé « deblocage:peche_nuit » est acceptée, pour ceux
-- qui ont réclamé le palier avant ce changement.
update niveaux_paliers
set nom = 'La pêche de nuit',
    recompenses = '[{"t":"bonus","k":"peche_nuit","n":1,"nom":"La nuit, le rare mord bien plus"}]'::jsonb
where niveau = 18;

-- dans pecher_touche, juste avant la glace au chocolat :
--   if h = 'nuit' and (niv_bonus(p_joueur,'bonus:peche_nuit')
--                    + niv_bonus(p_joueur,'deblocage:peche_nuit')) > 0 then
--     update _esp set poids = poids*2.2 where poids < 3 and id not in (<les détritus>);
--   end if;

-- PALIER 29 · L'ÉTOILE DORÉE
update niveaux_paliers
set recompenses = '[{"t":"etoile","nom":"Étoile dorée à côté de ton nom"}]'::jsonb
where niveau = 29;

-- niveau_reclamer : 'etoile' rejoint les types actifs
--   in ('bonus','kart','cadre','glace','parcelles','emote','etoile')

-- et le classement l'expose, pour que les autres la voient :
--   exists(select 1 from inventaire_niveau iv
--          where iv.joueur=j.id and iv.cle='etoile:' and iv.n>0) etoile

/* ============ 2026-10-22 · étape 6, suite : le palier 15 ============
   « Le Panier » — le troisième circuit de karting.

   Serveur
   -------
   - niveau_reclamer : la clé 'circuit_panier' rejoint ('ruche','cabanon'),
     le palier 15 rend donc actif:true et pose
     inventaire_niveau(joueur,'deblocage:circuit_panier',1).
   - course_debut : accepte le jeu 'karting_panier' et refuse
     {"erreur":"Ce circuit ouvre au niveau 15."} tant que
     niv_bonus(uid,'deblocage:circuit_panier') vaut 0.
   - course_fin et course_classement sont génériques (ils prennent le jeu
     en texte) : rien à y changer.

   Vérifié le 2026-10-22, joueur d'essai, le tout annulé par rollback :
     bonus avant : 0  → course_debut = {"erreur":"Ce circuit ouvre au niveau 15."}
     bonus après : 1  → course_debut = {"id":…,"euros":…,"restant":11}

   Client (courses.js)
   -------------------
   - CIRCUITS.panier : jeu 'karting_panier', eau:0, niv 'deblocage:circuit_panier',
     31 points de contrôle ; ORDRE_C = quai, corniche, panier.
   - eau:0 appris au générateur : riveDe rend -9999, dansLEau rend faux,
     le sol devient une calade (un éventail de pavés par placette), les
     maisons du Panier (toit de tuiles, mur ocre, volets, linge tendu),
     les escaliers, les lanternes le long de la piste.
   - Circuit fermé : une carte « NIV. 15 » remplace les trois boutons de
     course tant que le palier n'est pas pris.
*/

/* ========= 2026-10-22 · étape 6, suite : les paliers 19 et 20 =========
   « Ton bateau » (19) et « La pêche au large » (20) vont ensemble :
   le bateau ouvre la rade, la rade ouvre quatre coins de pêche.

   Serveur
   -------
   - niveau_reclamer : les clés 'bateau' et 'peche_large' rejoignent
     ('ruche','cabanon','circuit_panier'). Les paliers 19 et 20 rendent
     donc actif:true et posent inventaire_niveau(joueur,'deblocage:…',1).
   - pecher_touche accepte quatre lieux de plus — 'digue', 'frioul',
     'calanques', 'planier' — gardés par niv_bonus('deblocage:peche_large').
     Chacun a sa table d'espèces ; les tables du port ne s'y mêlent plus
     (la ligne dorade/bogue n'était gardée par aucun lieu), et Halloween
     y pèse 0,35 fois son poids du port.
   - large_etat() : {bateau, large, euros} pour l'écran de la rade.
   - large_partir(coin) : vérifie les deux paliers et encaisse le gasoil
     — digue 0 €, Frioul 3 €, calanques 6 €, Planier 10 €.
   - cours_poisson_large(cle) et points_poisson : les dix espèces neuves
     (castagnole 1,20 € … raie manta 260 €), ajoutées aussi à
     especes_comptees pour qu'elles comptent au carnet.

   Vérifié le 2026-10-22 sur le joueur d'essai, le tout annulé :
     sans palier  → {"erreur":"Ton bateau arrive au niveau 19."}
                    {"erreur":"La pêche au large ouvre au niveau 20."}
     avec palier  → large_partir rend {"ok":true,"cout":1000,…}
     14 touches au Planier : liche, palamide, thon, denti, coryphène…
      8 touches à la digue : sar, pageot, dorade, serran…

   Client
   ------
   - port.js : graverTonBateau() — le pointu amarré au bout du ponton de
     l'est (ouvre:'bateau'). Il se voit même sans le palier : la plaque
     dit alors « il arrive au niveau 19 ».
   - moteur.js : l'écran de la rade (carte marine, quatre épingles, le
     gasoil, « Mettre le cap »), puis la carte 'large' — un monde de
     760 x 1180 où l'on ne marche que sur le pont du bateau, la mer
     partout, la couleur de l'eau et le décor changeant avec le coin.
     On y pêche par-dessus bord ; lieuDePeche rend le coin comme lieu.
   - Les dix espèces du large : silhouette, combat, sac, carnet, et une
     troisième jauge « LE LARGE » à la page de garde du carnet.
   - Retour au port par la barre : jeu.html?carte=extramar&de=large,
     et poserAuPort débarque au bout du ponton.
*/

/* 2026-10-22 · correctif : la rade restait bloquée sur « Niveau 20 ».
   large_etat et large_partir s'appuient sur auth.uid(), mais le jeu les
   appelait par appelRPC, qui n'envoie que la clé anonyme : auth.uid()
   y est vide et les deux répondaient « Connecte-toi ». Elles passent
   maintenant par le client Supabase (rpcRade), qui porte la session,
   comme le font déjà les courses. En plus, tant que le serveur n'a pas
   répondu, l'écran se fie aux clés de palier déjà chargées par
   mon_niveau — le départ reste gardé côté serveur. */

/* ===== 2026-10-22 · le large devient navigable (côté jeu seulement) =====
   Le bateau ne mouille plus à un point fixe : la carte 'large' fait
   2400 x 2400, le pointu y est un objet qui tourne et avance, et les
   quatre coins y vivent ensemble — la digue et le port en bas à droite,
   le Frioul en haut à gauche, les calanques le long du bord est, le sec
   du Planier seul en bas à gauche.

   - majNavigation(dt,joyX,joyY) prend la main comme le fait l'essai de
     voiture à Tokyo : à la barre, le joystick tient le cap (il vise un
     cap, le bateau y vient à 1,9 rad/s) et le marin ne marche pas.
   - Hors barre, majDerive continue le mouvement et emmène le joueur avec
     la coque : il garde ses coordonnées locales, pas les mondiales.
   - terreLarge(x,y) rejoue en géométrie les formes peintes dans le sol ;
     coqueÀTerre teste l'étrave, les deux joues et le tableau. On racle,
     on ne traverse pas.
   - lieuDePeche rend le coin où l'on mouille, et rien du tout en pleine
     eau ou en route : c'est le coin qui décide de ce qui mord.
   - La caméra recule au large (ECH plafonné à dpr) : un point de jeu
     vaut un point d'écran, sinon on navigue sans voir devant soi.
   Rien ne change côté serveur : pecher_touche reçoit toujours le coin.
*/

/* 2026-10-22 · le large, commandes simplifiées (côté jeu seulement).
   Deux modes pour un bateau vide, c'était un de trop : on ne marche
   plus sur le pont. Le joystick EST la barre, en permanence, et la
   plaque d'action ne sert qu'à lancer la ligne. Elle dit « Mets le
   cap » (inerte) tant qu'on n'est sur aucun coin, « Lancer la ligne ·
   LE COIN » dès qu'on y mouille. Jeter la ligne coupe le moteur, et
   tant que la ligne est à l'eau le joystick ne pilote plus. */

/* ============ 2026-10-22 · les cinquante espèces du large ============
   Serveur
   -------
   - Nouvelle table large_especes(cle, coin, poids, mn, mx, canne, moment).
     pecher_touche ne contient plus une ligne par poisson : au large, il
     lit cette table. On règle l'abondance sans toucher à la fonction.
     114 lignes pour 50 espèces réparties sur les quatre coins.
   - cours_poisson_large et points_poisson_large : prix et XP des 50,
     chaînés dans cours_poisson et points_poisson. De la mendole à 1,10 €
     à la baleine bleue à 2 600 €.
   - Les espèces du port ne débordent plus au large : dorade, bogue, sar,
     lotte et mérou étaient ajoutés sans garde de lieu. La ferraille et
     les citrouilles d'Halloween y pèsent 0,3 et 0,22 fois leur poids du
     port — on ne paie pas dix euros de gasoil pour une chaussette.

   Jeu
   ---
   - Huit silhouettes neuves dans dessinerPoisson : baleine (corps plein,
     caudale à plat, évent qui souffle), dauphin, tortue, méduse, crabe,
     oursin, poisson plat et voilier (rostre + grande voile dorsale).
   - Les 50 ont leur entrée dans FORMES_POISSON, ESP_PECHE, OBJETS et
     CARNET_ORDRE, et leur allure de combat dans ALLURE.
   - Le poisson qui jaillit est dessiné à sa vraie silhouette, deux fois
     plus grand au large pour compenser l'échelle de la carte.
*/

/* ===== 2026-10-22 · l'embarcation, l'amarrage et la barre (jeu seul) =====
   - peindreCoque() : une seule peinture pour le port et le large. Bordé
     blanc, liseré bleu, lisse foncée, pont de bois verni à membrures,
     étrave claire, deux bancs, moteur et barre franche, caisse, seau,
     cordage lové, bouée couronne et deux pare-battages.
   - Le pointu était posé SUR le ponton : sa vignette monte depuis son
     point d'ancrage, et l'ancre était à peine au-delà du tablier. Il est
     maintenant à 118 px du bout, dans l'eau libre, avec ses amarres.
   - PLUS DE JOYSTICK AU LARGE (window.TK_SANS_JOY). On touche l'eau, le
     bateau met le cap dessus, ralentit en arrivant et s'arrête seul ; on
     touche la coque, il stoppe ; on touche un coin sur la carte, il y
     file en se rangeant à l'entrée de la zone, pas sur le rocher.
   - Les quatre points d'arrivée pointaient l'étrave vers le coin : elle
     se plantait dans la roche et le bateau refusait tout cap. On arrive
     désormais face à l'eau libre, le coin dans le dos.
*/

/* ====== 2026-10-22 · LA MARÉE NE VENDAIT PLUS LES PRISES DU LARGE ======
   Cause : PRIX_POISSON, côté téléphone, était une liste écrite à la
   main. Les 50 espèces ajoutées en base n'y étaient pas, donc elles
   valaient 0 € : elles ne s'affichaient pas à La Marée et le bouton
   « Vendre » restait sur « Rien de choisi ».

   Correction de fond, pour que ça ne puisse plus arriver :
   - prix_des_prises(text[]) : le serveur rend le cours de n'importe
     quelle clé. À l'ouverture de La Marée, le téléphone demande le prix
     de ce qu'il a dans le sac et ne connaît pas, puis redessine.
   - icoDepuisPoisson() : l'icône se tire de la silhouette du poisson.
     completerLesIcones en fabrique une pour toute entrée de
     FORMES_POISSON qui n'en a pas. Plus de liste d'icônes à tenir.
   Une espèce ajoutée en base arrive désormais seule dans la boutique.

   Et un filet : outils/ronde.js ouvre les 37 écrans des trois cartes
   dans un téléphone simulé et vérifie qu'ils répondent. À lancer avant
   chaque déploiement.
*/

/* ======= 2026-10-23 · l'XP des bêtes, et l'étal qui ne vendait plus =======
   1. RÉCOLTER UNE BÊTE RAPPORTE DE L'XP. Le champ, le verger, la ruche et
      la pêche en donnaient ; les œufs, la laine, les truffes et le lait
      n'en donnaient aucun. score_parts gagne une colonne « betes »,
      noter_points la connaît, classement_general la renvoie, et la fiche
      du joueur l'affiche (🐑) à côté des quatre autres.
        - poul_ramasser : 2 points par œuf, 20 par œuf d'or
        - betes_tondre  : 4 points par toison
        - betes_truffe  : 10 points par truffe trouvée
        - etable_traire : 2 points par litre
      Vérifié : tonte de 5 + une truffe + 7 œufs + 4 L = 52 points.

   2. ON NE POUVAIT PLUS ACHETER DE BÊTE. ouvrirLeMarcheAuxBetes se fiait
      à ETB, que l'étable chargeait de son côté — et l'étal s'ouvrait
      70 ms après elle. Sur un téléphone la réponse n'était pas revenue :
      ETB valait null, aucun prix, toutes les pancartes sur « au
      complet ». L'étal demande maintenant betes_etat lui-même, en même
      temps que betes_cours, avant de se dessiner.
*/

/* ============ 2026-10-23 · LA BASSE-COUR, DANS LA MAISON ============
   La longère de la ferme n'était que du décor. Sa porte ouvre maintenant
   un seul endroit où l'on achète les trois bêtes : poules, moutons,
   cochons. Le marché de Lucien garde la vente (lait, laine, truffes).

   - bassecour_etat(joueur) : un seul appel rend tout ce dont l'écran a
     besoin — l'argent, le niveau du poulailler, le nombre de poules et
     leur plafond, les moutons et les cochons avec leurs prix du moment
     (null = au complet). L'écran ne dépend d'aucun autre.
   - L'achat passe par les fonctions qui existaient déjà :
     poul_acheter(joueur,'poule') et betes_acheter(joueur,'mouton'|'cochon').
   - Côté jeu : DECOR x_fePorte posé sur la porte de la longère
     (ouvre:'bassecour'). Le semeur tourne avant le chargement de
     ferme.js, il refait donc son calcul de position au lieu de s'y fier.
*/

/* 2026-10-23 · la basse-cour, deuxième version (jeu seulement).
   Trois bandes illustrées plein écran — le poulailler, le pré, la soue —
   au lieu de trois lignes de liste. Chaque bande peint son décor et
   JUSQU'À TROIS BÊTES RÉELLES, tirées du compte du joueur : on voit son
   cheptel, pas une vignette. La toile prend la forme exacte de sa bande
   (hauteur calculée au moment de peindre) pour ne pas étirer les pixels.
   Bande grisée et « au complet » quand l'enclos est plein ; « fermé »
   et « il faut d'abord bâtir le poulailler » tant qu'il n'est pas là. */

/* ============ 2026-10-23 · LE FUMIER : l'enclos nourrit le champ ============
   L'élevage et la culture étaient deux boucles qui ne se parlaient pas.
   Elles se tiennent maintenant par le fumier.

   - etable_joueur.fumier_maj ; fumier_pret(joueur) : une bête donne un
     seau toutes les six heures, les poules comptent pour un tiers,
     plafonné à 24 seaux (deux jours d'avance).
   - betes_curer(joueur)  : ramasse les seaux dans le sac (2 XP « bêtes »
     par seau), remet le compteur à zéro.
   - composter(joueur,nb) : quatre seaux = une dose d'engrais dans
     potager_joueur.engrais (3 XP « légumes » par dose). L'engrais
     existait déjà : une dose sur trois fait pousser une parcelle
     moitié plus vite (champ_geste).
   - betes_etat rend fumier_pret et engrais, l'écran de l'enclos n'a
     donc rien d'autre à demander.
   Vérifié : 2 vaches + 5 moutons + 3 cochons + 6 poules sur 26 h =
   24 seaux → 6 doses, XP bêtes +48 et légumes +18.

   Côté jeu : section « LE TAS DE FUMIER » dans l'enclos (curer,
   composter, le compte de doses), le fumier au sac avec son icône, et
   « Tout ramasser » le prend aussi. Le fumier ne se vend pas : il sert.
*/

/* ====== 2026-10-23 · UNE EMPREINTE PAR FICHIER (déploiement) ======
   Toutes les adresses portaient le même numéro de version : corriger
   une ligne de courses.js le changeait partout, et le téléphone
   retéléchargeait le jeu entier — 1 176 Ko compressés.

   outils/empreintes.js calcule une empreinte de huit caractères sur le
   CONTENU de chaque .js et .css, la pose dans les ?v= de toutes les
   pages, et dépose la table dans tete.js (window.EMPREINTES) pour que
   chargerMorceau s'en serve aussi. Un fichier inchangé garde son
   adresse, donc son cache.

   À LANCER APRÈS LE CHANGEMENT DE VERSION, AVANT LE COMMIT :
     sed -i "s/<ancienne>/<nouvelle>/g" tete.js version.json *.html
     node outils/empreintes.js
   Le numéro de version ne vit plus QUE dans tete.js, version.json et
   les pages autonomes — ne jamais le réécrire dans les .js, sinon
   toutes les empreintes changent et le gain disparaît.

   Mesuré : en ne touchant que courses.js, 16 fichiers sur 18 restent en
   cache ; on retélécharge 37 Ko au lieu de 1 176.

   POIDS RÉELS (gzip) : moteur.js 697 Ko, ferme.js 91, tokyo.js 82,
   personnage.js 77, port.js 60, pokedock.js 43, courses.js 37,
   moteur.css 35 — 1 176 Ko en tout. Sans les commentaires, moteur.js
   tomberait à 544 Ko : on garde les commentaires, ils sont la mémoire
   du projet, et le cache règle le vrai problème.
*/

/* ============================================================
   PALIER 23 — LA TENUE « CAPITAINE »                23/10/2026
   ============================================================
   Le palier 23 donnait {"t":"tenue","k":"capitaine"} mais
   niveau_reclamer n'avait aucune branche « tenue » : la
   récompense tombait dans le « else » fourre-tout, rangée dans
   l'inventaire avec actif=false, et le joueur ne pouvait jamais
   la porter.

   Les costumes vivent dans cosmetiques(joueur,piece,paye) sous
   la clé 'costume_<k>' — c'est ce que lit mes_tenues() et ce
   qu'écrit déjà tenue_jackpot pour le smoking du casino. La
   branche ajoutée fait la même chose, et garde en plus une
   trace dans inventaire_niveau pour l'historique des paliers.

   Patch appliqué sur la fonction en place (pas de migration :
   on relit pg_get_functiondef, on insère la branche avant la
   ligne des 'bonus/kart/cadre/...', on réexécute) :

     elsif r->>'t'='tenue' then
       insert into cosmetiques(joueur,piece,paye)
         values (uid,'costume_'||(r->>'k'),0)
         on conflict (joueur,piece) do nothing;
       insert into inventaire_niveau(joueur,cle,n)
         values (uid,'tenue:'||(r->>'k'),1)
         on conflict (joueur,cle) do update
           set n=inventaire_niveau.n+1, maj=now();

   Vérifié sur le joueur de test : donne=[{capitaine,tenue,
   actif:true}], cosmetiques=1 ligne, inv['tenue:capitaine']=1.

   CÔTÉ CLIENT
   - appliquerDeguisement : cas 'capitaine' — vareuse #17233a,
     pantalon blanc #e6ecf2 (bas=0, pantalon long : avec bas=1
     c'est un short et les mollets restaient nus), souliers
     noirs, _motif='capitaine', _casquette=true.
   - _casquette remis à null en tête de appliquerDeguisement ET
     dans RAZ(), pour qu'aucune autre tenue ne l'hérite.
   - La casquette est dessinée dans la chaîne des chapeaux, à
     côté de _chapeauVert et _paille — DANS LES DEUX CRAYONS :
     moteur.js et personnage.js. L'écusson doré n'est dessiné
     que de face (if(!dos)).
   - La vareuse est un _motif, à côté de 'forestier', là aussi
     dans les deux fichiers.
   - TENUES : {k:'capitaine', lieu:'Récompense du niveau 23'}.
   - reclamerNiveaux ouvre le cadenas tout de suite :
     recu.filter(r=>r.t==='tenue').forEach(...e.cos['costume_'+k]=true)
     — sans ça il fallait recharger la page pour pouvoir
     l'enfiler.

   Reste inerte après 23 : 25 (kayak du Frioul), 27 (table VIP),
   28 (aquarium du cabanon), 30 (la statue sur le quai).
*/

/* ============================================================
   PALIER 25 — LA DESCENTE DU FRIOUL                23/10/2026
   ============================================================
   Pas de nouvelle boutique : le kayak du Frioul s'ajoute DANS
   la location de kayaks qui existe déjà sur le quai. Le menu
   du kayak prend le carrousel du karting — ‹ parcours 1 / 2 ›
   avec vignette, record, et la carte grisée « NIV. 25 » tant
   que le palier n'est pas pris.

   SERVEUR
   - course_debut accepte 'kayak_frioul' et le refuse tant que
     niv_bonus(uid,'deblocage:kayak_frioul')=0 — même garde que
     karting_panier au niveau 15. Vérifié : sans le palier
     « Ce parcours ouvre au niveau 25. », avec le palier la
     course démarre et les 5 € sont débités.
   - course_mes_records : restant_kayak compte maintenant
     jeu like 'kayak%' — les deux descentes partagent le même
     quota de 12 courses payantes par jour (course_debut les
     regroupait déjà par split_part(jeu,'_',1)).
   - niveau_reclamer : 'kayak_frioul' ajouté à la liste des
     déblocages actifs, sinon la récompense arrivait inerte.
     Vérifié : palier 25 donne titre Capitaine + déblocage
     actif + coffre malle.
   - course_fin et course_classement étaient déjà génériques
     (ils lisent c.jeu / p_jeu) : rien à toucher.

   CLIENT — courses.js
   Tout ce qui distingue un parcours est rassemblé dans PK :
   longueur, largeur du chenal, palettes (eau, roche, végétal),
   densité et taille de la végétation, espacement des portes,
   scintillement de l'eau, largeur du monde et houle. « batir »
   ne connaît plus un décor unique, il lit P.

     Les Calanques  3400 px · chenal 58±32 · portes /250 ·
                    turquoise, pins, pas de houle · monde 195
     Le Frioul      4400 px · chenal 74±38 · portes /300 ·
                    bleu profond, calcaire blanc, garrigue
                    rase · houle 42 · monde 250

   LA HOULE est la vraie différence de jeu : un courant de
   travers qui change le long du chenal
     houle(y)=42*(sin(y/195+a)+0,55*sin(y/73+b))
   ajouté à k.vl à chaque image. Le rythme ne suffit plus, il
   faut corriger. Les pagayeurs machine l'anticipent à hauteur
   de leur skill, sinon ils finissaient tous dans la falaise.

   LA CAMÉRA SUIT DE CÔTÉ quand le monde est plus large que
   l'écran (camX), sinon le Frioul dépassait du cadre à droite.
   Sur les Calanques MW=AW : camX reste à 0, rien ne change.

   Le parcours choisi est gardé dans localStorage bdl.kart
   (clé 'kayak'), comme le circuit du karting.

   Vérifié en tactile : les Calanques se descendent exactement
   comme avant (13 portes, turquoise, pas de houle), le Frioul
   se descend avec ses 14 portes et sa houle, aucune erreur JS,
   la ronde des 38 écrans passe sur les trois cartes.

   Reste inerte après 25 : 27 (table VIP), 28 (aquarium du
   cabanon), 30 (la statue sur le quai).
*/

/* ============================================================
   LA BORNE « LE DÉBARQUEMENT »                      24/10/2026
   ============================================================
   Une borne d'arcade de tactique, en solo. Elle ne coûte rien
   au serveur : tout tourne sur le téléphone, et Supabase ne
   voit que deux appels, le jeton au départ et le score à
   l'arrivée (arcade_demarrer / arcade_score, comme le Hangar).

   SERVEUR
   - arcade_jeton : 'debarquement' ajouté à la liste des bornes
     branchées. Vérifié : le jeton passe, le score se pose, le
     classement répond.
   - Rien d'autre. Pas de table, pas de Realtime.

   LE PARTI PRIS DE JEU, en trois règles
   1. On ne commande pas des hommes, on commande des SECTIONS :
      cinq cibles grosses comme un pouce, jamais trente.
   2. Pas de chemin libre : une section ne va que d'un ABRI
      marqué à un autre. Rien ne se coince dans un mur, et
      chaque mouvement a l'air décidé. C'est ce qui rend un jeu
      de troupes jouable au pouce.
   3. Le tir est AUTOMATIQUE. Le joueur choisit où et quand,
      jamais vers quoi.

   Quatre ordres, pas un de plus : AVANCER · TENIR · FUMIGÈNE ·
   MORTIER. La mitrailleuse CLOUE plus qu'elle ne tue (elle
   monte la jauge de clouage ; au-delà de 0,85 la section ne
   peut plus bouger) : c'est elle qui oblige à fumer ou à
   contourner au lieu d'encaisser.

   TROIS SECTEURS d'affilée — la Joliette, le fort Saint-Jean,
   la Bonne Mère — et les hommes PERSISTENT d'un secteur à
   l'autre. Ils ont des noms d'ici, ils montent en grade, et
   quand ils tombent ils ne reviennent pas. L'écran entre deux
   secteurs ne montre pas un score : il montre la liste de ceux
   qui sont restés.

   DEUX PIÈGES ÉVITÉS
   - Le sol du quai était repeint pixel par pixel à chaque
     image : cinquante mille rectangles par frame. Il est
     maintenant gravé une fois par secteur dans un canvas
     (dbSol) et seulement recollé. 60 images/s, p95 à 16,7 ms.
   - Sans position d'assaut contre le blockhaus, aucune section
     ne pouvait tenir l'objectif : le secteur ne se prenait
     jamais. Deux abris de sacs sont posés à ±16 px devant lui,
     et le rayon de garde est passé à 26.

   ÉQUILIBRAGE, mesuré et pas deviné
   Première version : 24 hommes perdus en 30 secondes pour 3
   ennemis abattus — injouable. Après réglage (infanterie
   ennemie à 2 s de cadence et 5 % de létalité, protection des
   abris qui compte vraiment, cadence amie à 620 ms), une
   partie pilotée automatiquement, qui n'utilise ni fumigène ni
   mortier, prend DEUX secteurs sur trois et finit à 12 928
   points. Une section à couvert qui tient est presque
   intouchable ; une section à découvert paie. C'est la leçon
   que le jeu doit apprendre, et il l'apprend tout seul.
*/

/* ============================================================
   LA SALLE D'ARCADE : LA CONQUÊTE RETIRÉE,
   LE DÉBARQUEMENT RENDU LISIBLE                     24/10/2026
   ============================================================
   LA CONQUÊTE est retirée : la borne, son moteur (environ 800
   lignes), ses trois branchements dans la salle, et 'france'
   sorti de la liste des bornes branchées dans arcade_jeton.
   Les scores déjà posés restent en base, ils ne gênent rien.

   LE DÉBARQUEMENT — première passe : on n'y comprenait rien.
   Le diagnostic n'était pas le game design, c'était la taille
   et le vocabulaire visuel.

   1. TOUT EST PLUS GROS. vise passe de 190 à 128 : sur un
      téléphone de 390 px, l'échelle passe de 2 à 3, donc la
      carte fait 130 unités de large au lieu de 195 et chaque
      chose est dessinée une fois et demie plus grande. Toutes
      les distances ont suivi (portée 86→58, vitesse, rayon du
      mortier, de la fumée, de la garde) et la carte est passée
      de cinq rangs d'abris à quatre, sinon elle ne tenait plus.

   2. ON DISTINGUE ENFIN LES SIENS DES AUTRES. Chaque homme a
      un cerne noir — sans lui tout se noyait dans le gris du
      quai. L'ennemi a sa propre silhouette et un losange rouge
      sous les pieds.

   3. ON VOIT OÙ L'ON PEUT ALLER. Chaque abri porte un cercle
      pointillé discret en permanence ; ceux à un bond de la
      section tenue en main s'allument en jaune, pulsent, et
      portent un chevron. Avant, rien ne disait qu'il y avait
      des places.

   4. ON LIT L'EFFECTIF SANS COMPTER : six encoches autour de
      l'anneau de chaque section, éteintes au fur et à mesure.

   5. « CLOUÉE » EST ÉCRIT EN TOUTES LETTRES, en rouge, sur la
      section. C'est l'information qui explique pourquoi elle
      ne répond plus aux ordres.

   6. LA CONSIGNE. Une ligne, toujours présente au-dessus des
      pastilles, qui ne dit qu'une chose et change avec la
      situation : « TAPE UNE SECTION EN BAS », « TAPE UN CERCLE
      JAUNE », « CLOUÉE · FUME LE NID », « RESTE LÀ, ÇA SE
      PREND ». C'est elle qui manquait le plus.

   7. LE COMBAT SE VOIT : traçantes deux fois plus épaisses et
      deux fois plus longues, départ de coup lumineux à la
      bouche, et l'écran qui tremble quand un homme tombe.

   8. L'OBJECTIF est désigné en permanence par une étiquette
      rouge, et la barre de prise dit « ON TIENT… ».

   Les bandeaux ont été refaits pour la nouvelle largeur : les
   textes se chevauchaient. Ordres raccourcis en FUMÉE et OBUS,
   secteurs renommés court (LA JOLIETTE, SAINT-JEAN).

   Équilibrage : à la nouvelle échelle la carte est plus
   ramassée, donc on reste plus longtemps au contact. Cadence
   de l'infanterie ennemie 2 s → 2,4 s, létalité à découvert
   1,6 → 1,45, deux ennemis de moins aux secteurs 2 et 3, et
   trois fumigènes et trois obus au départ au lieu de deux,
   plus deux fumigènes et un obus à chaque secteur pris.

   Reste à faire, dans les passes suivantes : un vrai tutoriel
   au premier secteur, le son, et des cartes qui ne soient pas
   seulement quatre rangs d'abris tirés au hasard.
*/

/* ============================================================
   LE DÉBARQUEMENT — DE VRAIES TROUPES ET TROIS CARTES
                                                     25/10/2026
   ============================================================
   LES TROUPES. Première tentative : définir le soldat comme un
   assemblage d'ellipses et l'échantillonner sous l'angle voulu,
   comme le kayak des Calanques. Résultat : de la bouillie. À
   cette taille, un casque fait six pixels — il n'a plus de
   forme à faire tourner.

   Ce qui marche : on DESSINE le soldat à la main, pixel par
   pixel, vu de dessus, dans une matrice de caractères (onze sur
   onze). Une image vers le nord, une vers le nord-est, et les
   six autres directions par rotations d'un quart de tour, qui
   ne perdent aucun pixel. Casque, vareuse à la couleur de la
   section, sac, fusil pointé devant, et son ombre.

   L'ENNEMI a ses propres matrices : casque plus large à bord
   plat, vareuse terre. On le reconnaît à la silhouette avant
   même de voir la couleur, et il garde son losange rouge.

   TROIS FIGURANTS PAR SECTION, pas six : six soldats de onze
   pixels dans un anneau de quinze, c'était un tas. L'effectif
   exact se lit aux six encoches autour de l'anneau. L'anneau a
   grandi (11 → 15) et la zone de tape avec (15 → 19).

   LES TROIS CARTES, une par secteur, et la campagne raconte
   enfin quelque chose :
     1. LES CATALANS — on débarque. Sable, galets, traces de
        chenilles qui montent de l'eau, frange d'écume qui
        bouge, barges échouées. Abris : hérissons tchèques,
        pieux minés, rouleaux de barbelés, trous d'obus.
     2. LA JOLIETTE — on remonte le port. Dalles, deux voies
        ferrées en travers, flaques de mazout. Abris :
        conteneurs, caisses, bittes, cratères.
     3. LA BONNE MÈRE — on monte au plateau. Terre retournée,
        souches calcinées, deux lignes de tranchée gravées avec
        leur parapet, et la basilique en silhouette sur la
        crête. Abris : tranchées, sacs, souches, cratères.

   Chaque sorte d'abri a sa protection : conteneur 0,66,
   tranchée 0,70, hérisson 0,30, barbelé 0,18. Le décor n'est
   plus un papier peint, il décide où l'on survit.

   Tout le décor propre à une carte est GRAVÉ dans le sol une
   fois par secteur (rails, tranchées, galets, traces), jamais
   repeint par image.

   UN VRAI DÉFAUT TROUVÉ PAR LA PARTIE AUTOMATIQUE : secteur
   nettoyé, huit ennemis abattus, vingt-deux hommes debout — et
   partie perdue au chrono, parce que personne n'était monté
   tenir l'objectif. Désormais, quand il ne reste plus un
   ennemi, l'objectif se prend de plus loin (38 au lieu de 22)
   et presque trois fois plus vite (1,4 s au lieu de 3,8), et le
   jeu le dit : « SECTEUR NETTOYÉ · MONTE À L'OBJECTIF ».

   Mesuré après : la partie automatique, qui n'utilise ni
   fumigène ni mortier, prend les deux premiers secteurs et
   tombe au plateau. 13 836 points, 22 ennemis abattus,
   60 images par seconde.
*/

/* ============================================================
   LE DÉBARQUEMENT — LES SOLDATS PASSENT EN VUE TROIS-QUARTS
                                                     25/10/2026
   ============================================================
   Le problème n'était pas le niveau de détail, c'était la VUE.
   Vu strictement du dessus, un homme n'est qu'un casque et deux
   épaules : il n'y a rien à dessiner, et aucun détail n'y
   changera quoi que ce soit. Les jeux de tactique en pixel art
   — Advance Wars, Door Kickers — gardent un terrain vu de
   dessus et dessinent les hommes DEBOUT, de trois quarts.

   Les soldats font maintenant 13 pixels sur 16. Cinq poses
   dessinées à la main dans des matrices de caractères : de dos,
   de dos trois-quarts, de profil, de face trois-quarts, de
   face. Les trois directions qui manquent sont les miroirs des
   trois obliques — huit directions pour cinq dessins.

   Chaque homme a : un casque avec son reflet et son bord, un
   visage avec les yeux, une vareuse à la couleur de sa section
   dont le côté à l'ombre est calculé depuis cette couleur
   (dbOmbrer, 58 %), un ceinturon et ses bretelles, un sac à dos
   sur les poses de dos, un fusil avec son canon et le bois de
   la crosse, un pantalon, des bottes, et une ombre portée au
   sol.

   L'ENNEMI a ses dix propres matrices, pas une teinte
   différente : casque nettement plus large à bord plat. On le
   reconnaît à la silhouette avant d'avoir vu la couleur, et il
   garde son losange rouge aux pieds.

   TROIS FIGURANTS par section (deux de deux à quatre hommes, un
   seul à la fin), l'anneau est passé de 15 à 17 pour les
   contenir, la zone de tape de 19 à 21, et les encoches
   d'effectif de 18 à 20.

   Ce qui a été jeté en chemin : une première version qui
   échantillonnait une forme mathématique sous l'angle voulu,
   comme le kayak des Calanques. À six pixels, un casque n'a
   plus de forme à faire tourner — ça ne donnait que de la
   bouillie. Les matrices à la main, tournées par quarts et
   miroitées, ne perdent pas un pixel.

   Mesuré : la partie automatique atteint le troisième secteur
   avec onze hommes debout, 29 ennemis abattus, 16 900 points —
   la meilleure manche depuis le début — à 60 images par
   seconde. Ronde verte sur les trois cartes.
*/

/* ============================================================
   LE DÉBARQUEMENT — LE FEU ET LE MOUVEMENT    25/10/2026
   ============================================================
   DEUX PROBLÈMES VUS SUR LE VRAI TÉLÉPHONE, pas sur l'écran
   simulé : c'était trop gros, et ce n'était pas clair.

   TROP GROS. La carte ne comptait que 130 unités de large : un
   soldat de 13 unités en faisait un dixième, quatre sections la
   remplissaient d'un bord à l'autre, et la barre du bas (84
   unités à l'échelle 3) mangeait un tiers de la hauteur. Il ne
   restait plus de terrain, donc plus de manoeuvre. vise passe
   de 128 à 200 : l'échelle tombe à 2, la carte compte 195
   unités, et toutes les distances de jeu ont suivi (portée
   58→90, vitesse, mortier, fumée, rayon de garde). Cinq rangs
   d'abris au lieu de quatre, trois ou quatre par rang.

   PAS CLAIR. Le « 1/3 » passait sous la flèche de retour du
   navigateur : le bandeau commence maintenant à 30 unités. Le
   compteur de nids doublait l'étiquette de l'objectif :
   supprimé. L'écran d'attente débordait des deux côtés : il
   tient sur deux lignes. L'écran entre deux secteurs laissait
   voir la barre du dessous : il est passé opaque. Les
   pastilles du bas étaient coupées : le rond et l'effectif sont
   maintenant sur une ligne, loin du bord.

   LE GAMEPLAY, LUI, A CHANGÉ DE NATURE.

   1. LE TIR AMI CLOUE. Chaque coup, touché ou non, monte la
      suppression de l'ennemi. Au-delà de 0,75 il se couche et
      ne tire plus DU TOUT, et on le voit (sprite tassé, jauge
      rouge). TENIR devient une vraie base de feu : +30 % de
      suppression, et un bandeau « BASE DE FEU » au-dessus de la
      section. C'est la fenêtre qui permet de faire bondir une
      autre section. Le jeu n'est plus « avance et encaisse »,
      c'est « cloue, puis contourne ».

   2. LES ABRIS NE PROTÈGENT QUE D'UN CÔTÉ. Chaque abri et
      chaque ennemi porte une orientation. De face l'abri joue à
      plein, de biais à moitié (au-delà de 1,15 radian), de
      flanc plus du tout (au-delà de 1,95). Des deux côtés : tes
      sacs de sable ne te couvrent pas si on te prend de côté.
      Un arc vert montre d'où la section choisie est couverte,
      et la traçante devient dorée et épaisse quand le coup part
      d'un angle où l'ennemi n'a rien pour lui.

   3. L'OBJECTIF SE PREND EN DEUX TEMPS. Tant qu'un nid de
      mitrailleuse tient, l'objectif est VERROUILLÉ. Ça oblige à
      apprendre le vrai geste au lieu de foncer, et le jeu
      annonce « PLUS UN NID · L'OBJECTIF EST OUVERT ».

   MESURÉ. Une partie pilotée qui joue la manoeuvre — deux
   sections en base de feu, deux qui bondissent — prend le
   premier secteur en perdant UN SEUL HOMME pour huit ennemis,
   puis le deuxième, et atteint le troisième avec douze hommes
   debout et 25 ennemis abattus, 16 680 points. La même IA, en
   fonçant, en perdait vingt-quatre. Jouer juste coûte deux fois
   moins cher : c'est exactement ce qu'une couche de stratégie
   doit produire. 60 images par seconde, ronde verte.
*/

/* =====================================================================
   LA BORNE « LE CORDON » — le maintien de l'ordre comme jeu de calme
   (2026-10-25)

   LE PARI. On joue les CRS, et le jeu ne récompense pas la force. Une
   jauge de TENSION tient toute la borne : chaque geste brutal marche
   tout de suite et se paie trois minutes plus tard, parce que c'est la
   tension — et rien d'autre — qui fabrique les casseurs. Le joueur
   découvre ça en perdant une première partie au gaz.

     GAZ     +24 % de tension, disperse, fait lâcher les cibles
     NASSE   +14 % (+1 % par interpellé), retire les casseurs,
             et fait basculer les passants pris dedans
     REPLI   −7 %   un pas en arrière
     PARLER  −19 %  un officier se détache 9 s et calme 26 personnes
     TENIR   ne coûte rien devant une vitrine, cher en travers de la rue
             (la tension monte avec le NOMBRE de gens bloqués)

   LES TROIS MOYENS RECHARGENT (34 s / 26 s / 21 s) au lieu d'être un
   stock : trois clics puis deux minutes sans rien à décider, ce n'était
   pas un jeu.

   CE QUI A ÉTÉ CORRIGÉ EN CHEMIN, et qui vaut pour les prochaines bornes
   - TENIR annulait le déplacement en cours : un cordon envoyé devant une
     vitrine n'y allait jamais. Un ORDRE D'ATTITUDE ne doit pas toucher à
     la destination.
   - Souple freinait presque autant que tenir : la rue bouchait toute
     seule et ne rien faire perdait la partie. Souple laisse passer.
   - Sans casseurs de fond, ne rien faire GAGNAIT. Il faut une menace qui
     ne dépend pas du joueur, sinon il n'y a pas de jeu.
   - Onze vitrines pour cinq cordons n'était pas un choix difficile,
     c'était une défaite écrite. Sept commerces, cinq cordons.
   - Le nombre de casseurs est PLAFONNÉ (2 + tension×7) : le joueur doit
     pouvoir les compter des yeux et savoir s'il perd la rue.

   ON PERD quand la tension atteint 100 % ou quand la PHARMACIE tombe.
   ON GAGNE quand le cortège est passé. Les autres commerces sont du
   score, pas une condition : 400 points la devanture debout, 18 points
   par personne passée tranquille, 2 500 × le calme final, 3 000 de
   bonus. Une rue finie à 10 % de tension vaut plus qu'une rue finie
   à 80 %.

   CÔTÉ SERVEUR : 'cordon' ajouté au tableau BORNES de arcade_jeton.
   Le reste (arcade_demarrer / arcade_score / arcade_classement /
   arcade_record) marche sans rien changer.

   À SUIVRE : le côté manifestants, qui jouera la même rue à l'envers.
   ===================================================================== */

/* =====================================================================
   LE CORDON v2 — un vrai parcours de manifestation (2026-10-25)

   LA RUE EST DEVENUE UN ITINÉRAIRE. Sept tronçons bout à bout, 1 500
   pixels de haut, cinq écrans : boulevard planté de platanes, place
   avec fontaine et kiosque, rue étroite avec voitures garées,
   carrefour à bouches latérales. Le bâti est peint dessus — toitures,
   cours, lucarnes — parce qu'un trottoir sans immeuble est une bande
   sans échelle. Quatorze commerces nommés (BOULANGERIE, TABAC,
   OPTIQUE…) et deux sensibles, PHARMACIE et BANQUE, dont la perte
   termine la partie.

   LA CAMÉRA. Le doigt glisse pour suivre le cortège, la bande de
   droite montre tout le parcours d'un coup d'œil — commerces, casseurs,
   cordons, camions, et le cadre de ce qu'on regarde. Le shell des
   bornes a gagné un crochet `glisse(s,x,y,dx,dy)` et distingue
   maintenant une tape d'un glissement : toute borne qui tient dans un
   monde plus grand que l'écran peut s'en servir.

   LA NOTE DE SERVICE, avant la partie. Le climat est annoncé (CALME /
   TENDUE / À HAUT RISQUE) et on dote dans un budget : grenades,
   camions, effectifs, officiers de liaison. Doter lourd pour une manif
   calme coûte du crédit au rapport AVANT d'avoir commencé — c'est la
   première décision du jeu.

   LES CAMIONS. Garés le long du trottoir, ils laissent passer ; posés
   dans la rue, ils barrent pour de bon et réapprovisionnent en
   lacrymogène le cordon qui vient s'y coller.

   LA DOCTRINE, la deuxième jauge. Elle ne juge pas QUE tu emploies la
   force, elle juge SUR QUI : à chaque gaz et à chaque nasse, on compte
   la proportion de casseurs dans le rayon et le verdict s'affiche à
   l'endroit du geste. Doctrine sous 22 %, la préfecture coupe le gaz et
   la nasse ; à 5 %, relevé de tes fonctions. La note finale est
   multipliée par elle.

   TROIS BUGS DE FOND, trouvés en simulant des parties entières
   - Le vecteur de marche des casseurs se figeait sous y=44 : tous
     finissaient agglutinés dans le coin haut-gauche et PAS UNE vitre
     n'était cassée de toute la partie. Le seuil ne devait porter que
     sur le CHOIX de la cible, jamais sur la marche.
   - Un camion garé au milieu de la chaussée barrait la sortie du
     cortège dès le départ : la tension montait toute seule, sans que
     le joueur ait rien fait.
   - Un cordon posé contre une devanture comptait comme un barrage de
     rue. Le jeu punissait exactement le geste qu'il réclame. Seul un
     cordon au milieu de la chaussée (34 px des bords) barre vraiment.
   - Et protéger sans faire passer payait comme une victoire : le score
     des devantures est maintenant au prorata du cortège écoulé.

   L'ÉQUILIBRE, mesuré sur neuf parties (3 styles × 3 climats) :
     ne rien faire   → perd partout (la PHARMACIE tombe)
     jouer mesuré    → gagne partout, ~17 000 points
     tout gazer      → perd partout (relevé, ou la rue part en vrille)

   À SUIVRE : le côté manifestants, qui jouera le même parcours à
   l'envers.
   ===================================================================== */
