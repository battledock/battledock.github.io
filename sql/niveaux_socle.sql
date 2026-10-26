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

/* =====================================================================
   LE CORDON — la passe graphique (2026-10-25)

   Le reproche était juste : on ne comprenait pas ce qui se passait.

   LES SILHOUETTES sont passées de 7×10 à 9×12, avec DEUX POSES de
   marche (la cadence suit la distance parcourue, pas l'horloge : un
   manifestant qu'on bloque arrête de marcher) et TROIS TENUES par
   humeur. Une foule d'un seul vert n'est pas une foule, c'est une
   texture.

   UN CASSEUR SE VOIT MAINTENANT : cagoule, barre à la main, cercle
   rouge au sol et chevron au-dessus de la tête. Et quand il s'en prend
   à une devanture hors écran, une FLÈCHE DE BORD le dit, avec le nom
   du commerce.

   LE CORDON EST UN MUR. Treize silhouettes côte à côte se mangeaient
   entre elles ; on dessine maintenant la ligne de boucliers d'un seul
   trait, avec les joints entre plaques (on compte les hommes d'un coup
   d'œil), un reflet qui court sur le plexi, et les casques derrière.

   LA LUMIÈRE : les enseignes s'allument et projettent leur couleur sur
   le trottoir, un voile froid tombe sur la rue, les bords
   s'assombrissent pour que l'œil aille au milieu.

   DES EFFETS : secousse d'écran et éclats de verre à chaque coup,
   flash et onde à la grenade, cercle qui se referme sur la nasse.
   Jauges en relief avec graduations, boutons avec leur recharge
   dessinée dessus, consigne sur une plaque.

   LA PERFORMANCE, parce que tout ça coûte. Mesuré, puis corrigé :
   - le SOL de 184×1500 était recopié EN ENTIER à chaque image pour
     n'en montrer qu'un cinquième → on ne tire que la tranche visible ;
   - les deux dégradés d'ambiance plein écran, recalculés 60 fois par
     seconde → peints une fois dans un canevas ;
   - 14 disques translucides par nuage de gaz et par image → un nuage
     peint une fois, tourné et dilaté ;
   - un dégradé radial par devanture et par image → un halo par couleur,
     gardé en mémoire ;
   - le fond de la bande de droite → peint une fois, et la couche des
     casseurs rafraîchie une image sur trois.
   De 51 fps (p95 29 ms) à 60 fps (p95 19,5 ms) avec 274 manifestants,
   cinq cordons en ligne, trois camions et trois nuages de gaz.
   ===================================================================== */

/* =====================================================================
   LE CORDON — passage en VUE DE PROFIL, façon RIOT (2026-10-26)

   Changement de perspective complet. La vue de dessus ne montrait que
   des points de couleur ; de profil, on voit deux masses se faire face,
   et c'est ça le sujet.

   LE DÉCOR. Une rue de nuit de 1 150 pixels, peinte une fois : façades
   à fenêtres allumées, rideaux de fer, graffitis, lampadaires dont les
   cônes repassent PAR-DESSUS la foule (c'est eux qui lui donnent du
   relief), barrières, débris, et la préfecture au bout — ce qu'on
   défend.

   LES SILHOUETTES font 12×18, de profil, avec deux poses de marche,
   douze tenues et dix couvre-chefs. Les casseurs ont la cagoule et une
   pierre à la main ; les CRS, un bouclier de trois colonnes (bord
   clair, plexi, cadre) qui fait lire un rang comme un mur.

   LA PHYSIQUE DE FOULE. C'est le cœur :
   - une DENSITÉ MAXIMALE par tranche de 4 pixels. On n'avance pas dans
     quelqu'un : quand c'est plein devant, on s'arrête, et la masse
     s'étire vers l'arrière. Sans cette règle, deux cent cinquante
     personnes tenaient sur huit pixels — une file indienne écrasée.
   - une BOUSCULADE latérale et en profondeur entre voisins.
   - des POUSSÉES toutes les ~25 s : le cortège s'ébranle d'un coup,
     la pression double, et c'est là qu'il faut décider.

   TROIS JAUGES. LA PRESSION (ce qui pousse contre les boucliers, au
   contact plus le cortège derrière, amplifié par la colère et par la
   poussée en cours), LA TENSION (qui fabrique casseurs et projectiles),
   LE RAPPORT (qui juge sur QUI, pas sur combien).

   CE QUI A ÉTÉ CORRIGÉ EN CHEMIN
   - Les boucliers étaient retournés : le mur faisait face à la
     préfecture au lieu de la foule.
   - Le recul de ligne se décidait sur le nombre de gens au contact et
     non sur la pression calculée : on pouvait lire « 294 % » sur la
     jauge sans perdre un pixel de terrain.
   - La charge et la lance à eau étaient jugées comme le gaz. Repousser
     une foule avec des boucliers, c'est le métier ; ce sont les armes
     qui frappent sans choisir qu'on juge sur la proportion. Elles se
     paient maintenant en TENSION, pas au rapport.
   - Chaque coup de barre sur une vitrine ajoutait deux millièmes de
     tension : avec dix casseurs, plus que tout le reste réuni, et la
     rue basculait sans qu'on sache pourquoi.
   - Il manquait la boucle centrale : UNE FOULE QU'ON BLOQUE S'ÉNERVE.
     Sans elle, ne rien faire gardait la rue calme toute la soirée.
   - Et une rue ne bascule pas en sept secondes : la montée de tension
     est plafonnée, et à 100 % on a six secondes pour reculer ou faire
     parler avant que ce soit perdu.

   RESTE À FAIRE : l'équilibrage. Jouer brutalement perd à coup sûr
   (relevé de ses fonctions), mais ne rien faire gagne encore trop
   souvent — il faut que la pression de fond morde davantage.
   ===================================================================== */

/* =====================================================================
   LE CORDON — les écrans (2026-10-26)

   LA NOTE DE SERVICE est devenue un document de préfecture posé sur la
   rue qu'on va descendre : fond d'immeubles en ombre chinoise et halos
   de lampadaires, en-tête « PRÉFECTURE DE POLICE » avec la date, titre
   du climat frappé d'une ombre, trois pastilles de menace, et quatre
   lignes de dotation avec leurs ICÔNES dessinées en pixels (grenade,
   camion à eau, casque à visière, mégaphone). Le budget se lit en
   jetons, pas en chiffre.

   L'ÉCRAN DE FIN est devenu un RAPPORT DE SERVICE : six lignes de
   bilan avec points de conduite et barres de remplissage, un TAMPON en
   biais (TENU / ÉCHEC) et la note finale en bas. Après trois minutes de
   partie, un écran de fin doit raconter ce qui s'est passé, pas
   afficher un nombre.

   LA VIGNETTE DE LA BORNE montrait encore la vue de dessus : elle est
   refaite de profil, et le menu de la borne la reprend en fond de
   bandeau (tout canvas marqué data-ban reçoit la vignette de la borne
   nommée — le crochet servira aux suivantes).

   UNE MISE EN PAGE SE DÉDUIT DE L'ÉCRAN. Première version avec des
   hauteurs en dur : l'avis tombait sur la dernière ligne dès que le
   téléphone changeait de proportions. Les lignes se répartissent
   maintenant entre l'en-tête et le bouton, et tout le reste se cale
   sur elles.

   ET UN PIÈGE ÉVITÉ DE JUSTESSE, le même qu'au kayak : un s[a:b] dont
   les bornes étaient dans le désordre rend une chaîne vide, et
   s.replace('', x) insère x ENTRE CHAQUE CARACTÈRE du fichier. Les
   remplacements de bloc vérifient maintenant que b > a et que la
   tranche a la taille attendue avant d'écrire.
   ===================================================================== */

/* =====================================================================
   LE CORDON — passe de douceur sur les écrans (2026-10-26)

   « Plus beaux, plus doux ». Des angles droits partout et des traits
   noirs d'un pixel : c'était net, ce n'était pas agréable.

   QUATRE OUTILS, et tout le reste en découle :
     coArrondi  un rectangle à coins arrondis
     coPan/coPanG  un panneau plein ou en dégradé
     coOmbre    une ombre qui FOND (quatre passes décroissantes) au lieu
                d'un rectangle noir décalé
     coLustre   un liseré de lumière en haut, qui décolle le panneau du
                fond

   Appliqué partout : le document de la note de service et le rapport
   de fin (panneaux arrondis, bandeau de couleur clippé, lueur diffuse
   du climat derrière le titre), les boutons + et − devenus ronds et
   moelleux, les boutons d'ordre en jeu, les trois jauges devenues des
   capsules avec un reflet sur la moitié haute, les pastilles de ligne,
   la consigne posée sur une pastille teintée, le cadre du ruban.

   La palette a été relevée : on passe du quasi-noir (#13171e) à des
   bleus-gris plus doux (#1d2430) avec une lueur chaude diffuse, et les
   séparations dures ont été remplacées par des fondus.

   CÔTÉ CSS, le menu de la borne : rayons de 14 à 18 et de 20 à 24,
   bordures de 2 px opaques remplacées par 1 px translucide, ombres
   portées douces plutôt que les blocs pleins, et la vignette de la rue
   en fond de bandeau avec un dégradé radial au lieu d'un voile plat.

   ET UNE RÈGLE qui revient à chaque passe : un texte ne doit jamais
   mordre sur ce qui est à côté. Le nom d'une ligne de dotation prend
   la place qui reste jusqu'aux jetons et rétrécit si besoin, au lieu
   de passer dessous.
   ===================================================================== */

/* =====================================================================
   LE CORDON — l'heure de la manif (2026-10-26)

   Une manif de 14 h n'a pas la tête d'une manif de 22 h. Trois moments,
   tirés au sort à chaque partie et annoncés sur la note de service :

     14 H 00 · plein jour      ciel bleu et nuages hauts, façades
                               claires avec un côté dans l'ombre
                               (le soleil vient de la droite), fenêtres
                               éteintes et vitrées, lampadaires éteints,
                               bitume clair, voile presque nul
     19 H 30 · fin de journée  ciel violet-orangé, murs chauds,
                               lampadaires à mi-régime
     22 H 10 · nuit noire      ce qu'on avait

   Tout bascule ensemble : ciel, lueur au bout de la rue, palette des
   murs et des toits, densité et couleur des fenêtres, trottoir,
   chaussée, intensité des lampadaires et de leurs cônes, halo des
   enseignes, voile d'ambiance, et jusqu'à l'ombre portée des gens —
   plus dure à midi, plus diffuse la nuit — et l'assombrissement des
   rangs du fond, qui n'a aucune raison d'être le même en plein jour.

   L'heure est écrite sur la note de service à côté de la date, et sa
   ligne dit ce qu'elle change pour celui qui tient la rue : « En plein
   jour : tout se voit, et tout se filme. »
   ===================================================================== */

/* =====================================================================
   LE CORDON — sprites, décor et menus d'actions (2026-10-26)

   LES SILHOUETTES, deuxième génération. De 12×18 à 14×22 pour la foule,
   16×22 pour les cordons. Tête plus petite, épaules plus étroites,
   jambes plus longues : une foule de grosses têtes rondes ne fait pas
   une manifestation. Chaque vêtement a trois tons (clair, base, ombre)
   et il y a dix couvre-chefs, donc la foule ne se répète pas.

   ET DES RÔLES DANS LE CORTÈGE : un sur dix porte une pancarte, un sur
   quinze filme avec son téléphone, un sur dix crie bras levé. C'est ça
   qui fait qu'une foule n'est pas un bloc.

   LE CRS a sa propre palette, en dur : il n'emprunte plus les couleurs
   de la foule (il héritait d'un casque bordeaux ou vert selon le
   tirage). Casque à visière, épaulières, ceinturon, jambières,
   matraque, et le bouclier en trois colonnes.

   LE DÉCOR a gagné ce qui lui manquait pour ressembler à une rue :
   antennes, cheminées et climatiseurs sur les toits ; enseignes
   verticales lumineuses sur une façade sur trois ; platanes avec leur
   grille au pied ; feux tricolores ; et des flaques qui attrapent la
   couleur du ciel — une chaussée sans reflet est un aplat gris.

   LES MENUS D'ACTIONS ont des PICTOGRAMMES dessinés : bouclier de face
   pour TENIR, trois chevrons pour CHARGE, un pas en arrière pour
   REPLI, la grenade et ses volutes pour GAZ, le mégaphone pour PARLER,
   le cercle qui se referme pour NASSE, le jet pour la LANCE, le
   fourgon pour CAMION. Un bouton qui ne porte qu'un mot se lit en
   entier à chaque fois ; un pictogramme se reconnaît du coin de l'œil,
   et c'est exactement ce qu'on fait quand la ligne recule. Les
   pourcentages ont quitté les boutons (ils sont dans le menu) ; il ne
   reste que ce qui change : le stock et le compte à rebours, en
   pastille dans le coin.

   UN BUG DE L'HEURE : les lampadaires restaient allumés en plein jour.
   Le dégradé du cône remettait globalAlpha à une valeur fixe et
   écrasait l'extinction générale posée avant la boucle.
   ===================================================================== */

/* =====================================================================
   LE DÉBARQUEMENT EST RETIRÉ (2026-10-26)

   La borne sort de la salle : moteur, sprites, cartes, menu, vignette,
   crochets du shell — soixante-cinq mille octets en moins dans
   arcade.html — et 'debarquement' quitte le tableau BORNES de
   arcade_jeton côté serveur. Les scores déjà posés restent en base ;
   rien ne les lit plus.

   UN PIÈGE EN RETIRANT UN BLOC : coMenu() vivait juste avant dbMenu()
   et a été emporté avec lui. L'assertion vérifiait que le bloc
   contenait bien dbMenu et pas fmMenu — elle ne disait rien de ce
   qu'il contenait D'AUTRE. Récupéré depuis git. Pour la prochaine
   fois : une suppression de bloc se vérifie sur ce qu'elle emporte,
   pas seulement sur ses bornes.

   LA SUITE : on reprend Le Cordon de zéro, petit à petit, en
   commençant par le menu de la borne.
   ===================================================================== */

-- ============================================================
-- LE CORDON — LE MENU DE LA BORNE, REFAIT (2026-10-26-2320)
-- ============================================================
-- Le menu precedent etait noir, gris, en Courier, avec des tampons :
-- j'avais copie l'ambiance du JEU (une rue de nuit) dans le MENU, puis
-- derive vers le « document de prefecture ». Un menu n'a aucune raison
-- d'etre sombre : il doit s'inscrire dans la direction artistique de
-- Battle Dock, pas dans celle de la partie qu'il annonce.
--
-- QUATRE DIRECTIONS ont ete montrees : BLEU MAISON (le langage du
-- Hangar a l'identique), L'AFFICHE (rouge, titre enorme, medaillon
-- encadre d'or), LE JOUR (fond clair, cartes blanches), LE NEON
-- (noir mais vif). Choix : L'AFFICHE.
--
-- CE QUE CA DONNE (#mnu.cdn dans arcade.html)
--   - fond rouge raye horizontal, en place du bleu raye de la salle
--   - surtitre « SALLE D'ARCADE », titre LE CORDON en 54px Lilita One
--   - medaillon de la rue, borde de 4px d'or, ombre portee de 8px
--   - trois cartes creme I/II/III : PRESSION, TENSION, RAPPORT
--   - un encadre en pointilles : ce qu'on demande au joueur
--   - bouton JOUER jaune, carre (rayon 12) et non plus arrondi
--
-- DEUX PIEGES RENCONTRES
--   1. banniere() dessinait sa « jauge de tension » decorative en haut
--      de la vignette. Pensee pour la petite vignette de la salle
--      (180x59), elle devenait une barre noire en travers du grand
--      medaillon. banniere(cv,cle,grand) : la jauge ne sort plus que
--      sur la petite. Le grand medaillon recoit en echange une foule
--      de 260 (au lieu de 140) et 55 boucliers (au lieu de 34).
--   2. Le canvas du medaillon est en 175x88 etire x2, pas en 350x176 :
--      a resolution native les silhouettes faisaient 2px de large et
--      se noyaient dans la nuit.
--
-- REGRESSION EVITEE : l'onglet SCORES reutilise .fiche, dont le texte
-- est bleu fonce — illisible sur le rouge. Repeint en creme sur
-- #mnu.cdn. Une classe posee sur le conteneur repeint tout ce qu'il
-- contient : il faut regarder CHAQUE onglet, pas seulement celui
-- qu'on dessinait.

-- ============================================================
-- LE CORDON — LA RUE PASSE EN ISOMÉTRIQUE (2026-10-27-0120)
-- ============================================================
-- Tout le jeu est reparti de zero, dans cordon.js. arcade.html ne lui
-- demande plus que MOTEUR.cordon : 88 Ko sont sortis du fichier
-- monolithique, et une correction de rue ne peut plus casser une
-- vitrine ailleurs.
--
-- LA PROJECTION. Tuile 32x16 (rapport 2:1, le seul qui donne des
-- diagonales propres en pixel art) :
--     ecran.x = (gx-gy)*16 + OX     ecran.y = (gx+gy)*8
-- gx file vers la droite-bas, gy vers la gauche-bas. Un objet est
-- devant un autre quand gx+gy est plus grand : c'est TOUTE la regle de
-- tri. Un immeuble prend la profondeur de son coin avant (x1+1,y1+1).
--
-- CE QUI EST LA : chaussee, trottoirs avec bordure en relief, caniveaux,
-- passages cloutes, une avenue est-ouest et une rue nord-sud avec une
-- vraie intersection ; une trentaine d'immeubles mitoyens en volume
-- (deux faces, toit, corniche, soubassement, travees de fenetres avec
-- appui et reflet, balcons, vitrines, stores rayes, enseignes,
-- cheminees, antennes, ombre portee) ; lampadaires, arbres, bancs,
-- poubelles, feux, abribus, barrieres Vauban, plots, panneaux ;
-- voitures, camionnettes et fourgons en stationnement ; un personnage
-- en quatre directions qui marche a l'A*.
--
-- TROIS CHOSES APPRISES
--
-- 1. BORNER UNE CAMERA SUR UNE CARTE ISO N'EST PAS UN CLAMP EN X ET Y.
--    La carte est un losange ; ses cotes sont a 45 degres. Clamper x
--    puis y laisse voir le vide aux quatre coins. Ce qu'il faut
--    clamper, ce sont la SOMME gx+gy et la DIFFERENCE gx-gy — les deux
--    axes que la projection lit deja. Avec ca, le bord de carte n'est
--    jamais a l'ecran.
--
-- 2. UNE VUE DE TELEPHONE EN PORTRAIT EST PLUS HAUTE QUE LARGE, donc
--    elle mange beaucoup de tuiles en profondeur : 844 points a 16 de
--    haut par tuile, cela fait 53 tuiles. La condition pour qu'un
--    rectangle d'ecran tienne dans le losange est
--        (demi-hauteur en tuiles) + (demi-largeur en tuiles) <= min(GW,GH)
--    C'est elle qui a fixe la carte a 48x48 et le plancher de zoom a
--    0,75 — pas un reglage a l'oeil.
--
-- 3. L'AIMANTATION DU ZOOM SE FAIT AU DEMI-PIXEL, pas au pixel. Au
--    pixel entier, 0,75 n'etait sur aucun cran : le doigt descendait au
--    plus large et l'aimant le renvoyait a 1. On ne pouvait jamais
--    rester dezoome.
--
-- LE SHELL A GAGNE DEUX DOIGTS. arcade.html ne suivait qu'un pointeur :
-- aucune borne ne pouvait zoomer. Il tient maintenant le registre des
-- doigts poses et appelle BORNE.pince(rapport, milieu) quand la borne
-- le declare. Les autres bornes ne voient aucune difference.
--
-- MESURE : 60 images par seconde, 40 tapes au hasard sans une seule
-- traversee d'obstacle, camera stable apres 120 glissements, meme
-- agrandissement (x2) en portrait et en paysage.
--
-- CE QUI N'EST PAS ENCORE LA, et ne doit pas etre raconte comme fait :
-- la foule, le cordon de CRS, les ordres, les jauges, le rapport de fin.
-- Cette etape livre une rue explorable, rien de plus.

-- ============================================================
-- LE CORDON — LA FOULE (2026-10-27-0320)
-- ============================================================
-- DEUX FICHIERS QUI NE SE PARLENT PAS.
--   foule.js   : la simulation. Des nombres. Elle ignore qu'il existe
--                des images. On peut la faire tourner mille pas dans
--                une boucle pour l'equilibrer, sans ouvrir un canvas.
--   acteurs.js : les images. Un atlas, et une fonction qui pose le bon
--                dessin. Elle ignore qu'il existe des forces.
-- Le seul pont est l'agent, qui porte x, y, dir et anim. Remplacer les
-- sprites temporaires par de vrais ne touchera pas une ligne de
-- simulation ; changer la simulation ne touchera pas un pixel.
--
-- LE MODELE. Pour chaque corps et a chaque pas : arrivee sur sa place
-- (on freine en approchant, sinon on oscille comme un ressort),
-- separation des voisins au contact, cohesion avec les siens,
-- repulsion des murs, et un grain de bruit. Les forces sont TOUTES
-- calculees sur les positions du debut du pas, puis tout le monde bouge
-- ensemble : deplacer au fur et a mesure donne un avantage aux premiers
-- de la liste et la foule derive vers un coin sans qu'on sache pourquoi.
--
-- LA GRILLE DE VOISINAGE. Comparer trois cents corps deux a deux, c'est
-- quatre-vingt-dix mille distances par image. Range par case d'une
-- tuile, chacun n'en regarde qu'une dizaine. MESURE : le cout est
-- lineaire — 190 corps 0,10 ms par pas, 354 : 0,21, 504 : 0,36,
-- 654 : 0,53. C'est le DESSIN qui pese, pas la simulation.
--
-- LES GROUPES. On ne place pas trois cents individus : on place quatre
-- blocs de cortege, trois lignes, une reserve, une navette et la
-- presse. Un agent organise vise SA PLACE dans la figure de son groupe
-- (ligne, coin, colonne, nasse) ; un agent de foule vise la position de
-- son bloc plus son ecart propre, fixe une fois pour toutes — c'est cet
-- ecart fixe qui fait un cortege et non un essaim.
--
-- CE QUI EMPECHE LA PHOTOGRAPHIE. Une foule dont tout le monde a atteint
-- sa place est immobile. Trois mecaniques, toutes deterministes :
--   - des poussees : toutes les huit secondes la tete gagne une tuile
--     d'un coup, puis reflue ;
--   - une respiration : chaque bloc roule lentement d'un bord de la
--     chaussee a l'autre ;
--   - une navette : quatorze manifestants font l'aller-retour entre la
--     queue et la tete. Un trajet, pas une errance : on peut dire a tout
--     moment ou ils vont.
-- Et le cordon repond : au-dela de vingt-quatre corps au contact, les
-- lignes cedent du terrain, et le reprennent quand ca retombe.
--
-- QUATRE CHOSES APPRISES
--  1. Une ligne doit BARRER la rue. Neuf hommes par rang a 0,78 d'ecart
--     font trois tuiles ; l'avenue en fait six. Douze par rang a 0,66 :
--     dix hommes tiennent six tuiles.
--  2. Vingt-neuf points de haut, c'etait trop. Deux cents corps au coude
--     a coude formaient une bouillie ou l'on ne distinguait plus une
--     pancarte d'une tete. Vingt-deux : on lit la foule, et chaque
--     sprite coute un tiers de surface en moins.
--  3. Les marques de selection se posaient apres tout le decor : une
--     unite derriere un immeuble montrait ses cercles sur le toit. Elles
--     vont au sol, sous les volumes.
--  4. La repulsion des murs suffit presque toujours. Presque, c'est ce
--     qui fait qu'on voit un manifestant dans une vitrine une fois toutes
--     les deux minutes. Il faut la sortie de secours : quand les quatre
--     cases voisines sont prises, on renvoie le corps vers la case libre
--     la plus proche. Sans elle il restait sur un toit pour la partie.
--
-- MESURE : 354 corps, 60 images par seconde en portrait, 55 en paysage,
-- zero corps dans un mur sur trois passes, zero empilement, 347 corps en
-- mouvement sur 354 (les sept arretes sont le cordon, qui tient).
--
-- PAS ENCORE LA : les ordres de maintien (gaz, eau, charge), les jauges,
-- le rapport de fin, le score. Les deux boutons UNITE et FORMATION ne
-- servent qu'a regarder les groupes manoeuvrer.

-- ============================================================
-- LE CORDON — L'IA ET LES ETATS (2026-10-27-0520)
-- ============================================================
-- TREIZE ETATS NOMMES, et aucun changement qui ne vienne d'une regle.
--   cortege : MARCHE ATTEND HESITE POUSSE RECULE PANIQUE FUIT CALME
--   cordon  : TIENT VERS FORME AVANCE CEDE
-- Un etat ne dit que deux choses — ou aller, et a quelle fraction de sa
-- vitesse — et les transitions sont groupees dans UNE fonction par camp,
-- pour qu'on les lise a la suite comme un reglement. On peut donc
-- toujours repondre a « pourquoi celui-la recule ? » par une phrase :
-- parce que son stress a passe 0,56 alors qu'il hesitait. Chaque agent
-- garde d'ailleurs la cause de son dernier changement.
--
-- LA REGLE DE CONCEPTION DU STRESS : SANS EVENEMENT, PERSONNE NE PANIQUE.
-- Quatre causes, toutes visibles a l'ecran — on est serre, on est au
-- contact, un voisin craque, quelque chose explose a cote. Et deux
-- PLAFONDS : la densite ne tend que jusqu'a 0,45, le face-a-face
-- jusqu'a 0,62. De quoi pousser, hesiter, reculer, rien de plus.
-- Au-dela il faut qu'il se soit passe quelque chose. Une foule qui
-- craque toute seule parce qu'elle attend est un bogue.
--
-- QUATRE CALIBRAGES RATES, ET CE QU'ILS ONT APPRIS
--  1. La densite comptait des quatre voisins, a 0,055 par voisin et par
--     seconde. Un cortege serre en a douze — c'est ce qu'est un cortege.
--     Toute la rue fuyait avant d'avoir vu un policier.
--  2. La contagion a 0,30 par seconde : UN voisin paniqué suffisait a
--     faire craquer le suivant. La panique prenait la rue entiere en
--     vingt secondes et ne retombait jamais. A 0,12, il en faut TROIS au
--     contact pour depasser la detente : ca se propage dans le coeur
--     dense et ca s'arrete au bord.
--  3. Pas de decharge apres la panique : on en sortait au meme stress
--     qu'on y etait entre, on repassait le seuil a l'image suivante, on
--     y retournait. Deux cent cinquante paniqués perpetuels. Courir
--     evacue : le stress tombe de moitie en sortant de PANIQUE.
--  4. On sortait d'une fuite quand le stress retombait sous 0,34. Les
--     fuyards se massaient a la bouche de rue, la densite les maintenait
--     tendus, et trois cents corps restaient en fuite pour toujours.
--     ATTEINDRE la sortie est l'evenement qui termine la fuite.
--
-- DEUX BOGUES DE SIGNE. Une place (u,v) se pose en (ax+u·cos−v·sin,
-- ay+u·sin+v·cos) : u court le long de la figure, v vers l'ARRIERE, et
-- le vecteur « devant » vaut (−sin,+cos). Le decalage etant SOUSTRAIT a
-- v, avancer demande un decalage NEGATIF. Les deux signes etaient
-- inverses : les lignes etaient retournees et la grenade tombait
-- derriere le cordon, si bien que le bouton ne faisait rien.
--
-- LA NAVIGATION : UN CHAMP, PAS DES CHEMINS. Un A* par individu, c'est
-- trois cents chemins a entretenir, et le premier bouscule n'y revient
-- jamais. On calcule UN champ par destination — une vague partie de
-- l'arrivee qui remplit la carte en comptant les pas — et chaque corps
-- descend vers sa plus petite voisine. Il ne peut pas perdre son chemin
-- puisqu'il n'en a pas. Trois champs : la police (qui donne distMenace a
-- tout le monde sans que personne ne cherche un policier), les sorties,
-- et un par unite en deplacement. Recalcul quatre fois par seconde.
--
-- NE PAS RESTER BLOQUE, en trois temps : une seconde et demie
-- d'insistance, puis une poussee laterale toujours du meme cote pour le
-- meme corps (sinon deux corps face a face se decalent ensemble a
-- l'infini), puis a quatre secondes on le pose sur la case libre la plus
-- proche. Et une regle d'etat : MARCHE qui n'avance plus depuis une
-- seconde et demie passe en ATTEND — ce que fait quelqu'un dans une
-- foule quand il ne peut plus avancer. Mesure de l'intention, pas de la
-- distance : un fuyard, dont la cible est restee au cortege, etait
-- compte bloque en permanence — mille deux cents deblocages pour rien.
--
-- LE DIAGNOSTIC (bouton DIAG) : etat en trois lettres au-dessus de
-- chaque corps, barre de stress, trait vers la destination, couleur par
-- groupe, marque au sol pour chaque groupe. Temporaire et assume : il
-- sert a repondre a « pourquoi celui-la fait ca ».
--
-- MESURE (1200 pas sans rendu, deux grenades) : 11 etats atteints, 23
-- transitions distinctes observees, zero corps dans un mur. Vingt corps
-- enfermes dans une impasse a une seule issue : vingt sortis en onze
-- secondes. Et la chaine complete se lit dans les transitions :
-- RECULE→PANIQUE→FUIT→CALME→MARCHE.

-- ============================================================
-- LE CORDON — LE COMMANDEMENT (2026-10-27-0720)
-- ============================================================
-- LA REGLE : UN ORDRE N'EST PAS UN TEXTE. Chacun pose quelque chose que
-- la simulation lit — un champ de navigation, un decalage de figure, une
-- place tenue. Si on retirait tout l'affichage, les unites obeiraient
-- pareil. Rien ici ne se contente de changer un libelle.
--
-- CE QU'ON PEUT FAIRE
--   tape sur une pastille  : choisir une unite ; une seconde tape la
--                            retire. C'est la seule multi-selection qui
--                            tienne au pouce — pas de cadre a tracer,
--                            pas de doigt a maintenir.
--   TOUTES                 : les quatre d'un coup
--   tape sur la carte      : y envoyer tout ce qui est choisi, en
--                            eventail pour que deux unites ne visent pas
--                            la meme case
--   TENIR (priorite 4)     : annule tout, la place tenue devient celle
--                            d'ou l'on tient — pas le point de depart
--   AVANT / ARRIERE (2)    : decaler la figure vers la foule ou en
--                            arriere
--   FORME                  : ligne, coin, colonne, nasse
--   GROUPE                 : les unites choisies convergent vers leur
--                            barycentre, chemins calcules, ordres poses
--   GAZ                    : un evenement devant chaque unite choisie
--
-- LA BARRE EST DESSINEE DANS LA SCENE, pas en HTML : un bouton HTML ne
-- sait pas montrer l'effectif d'une unite, son etat et l'avancement de
-- son ordre. Mais SA TAILLE EST PHYSIQUE : une rangee fait 42 points
-- d'ECRAN divises par l'agrandissement de la borne, donc la cible sous
-- le pouce fait toujours les memes millimetres. Deux rangees en
-- portrait, une seule des que l'ecran est large : dans les deux cas la
-- barre prend 10 a 11 % de la hauteur.
--
-- LES RETOURS : couleur propre a chaque unite, la meme sur la pastille,
-- sous les pieds de ses hommes, sur son chemin et sur son marqueur de
-- destination — c'est le seul moyen de savoir laquelle on vient
-- d'envoyer quand on en commande trois a la fois. Une etiquette au-dessus
-- du chef dit le nom et l'ordre en cours. La pastille se remplit a
-- mesure que la route avance.
--
-- TROIS CORRECTIONS DE SIMULATION, trouvees en testant les ordres
--  1. LA MASSE MANQUAIT DANS LA SEPARATION. Un homme en tenue
--     d'intervention etait repousse autant qu'il repoussait : une ligne
--     a qui on ordonnait d'avancer gagnait QUATORZE CENTIEMES de tuile
--     en trois secondes, et l'ordre ne se voyait pas. Avec le rapport
--     des masses, elle en gagne 1,12 — huit fois plus. C'est tout ce qui
--     separe un cordon d'une file d'attente.
--  2. SEPT PLACES DE FORMATION SUR TRENTE-SIX TOMBAIENT DANS UN MUR.
--     Une ligne de dix hommes fait six tuiles et demie, l'avenue en fait
--     six : les hommes des extremites poussaient contre une facade en
--     permanence et on mesurait six tuiles d'ecart a la formation. Une
--     place bloquee est maintenant ramenee sur la case libre la plus
--     proche — la ligne se tasse au lieu de deborder. Zero sur
--     trente-six, et l'ecart maximal tombe de 5,95 a 2,06 tuiles.
--  3. LE REGROUPEMENT serrait les unites a 1,9 tuile : leurs figures se
--     chevauchaient et un homme sur deux ne pouvait plus atteindre sa
--     place. 2,6.
--
-- MESURE, chaque commande touchee au doigt dans un navigateur tactile :
-- selection simple et multiple, quatre unites envoyees ensemble et
-- arrivant par des chemins differents, TENIR qui annule un deplacement
-- en cours, AVANT qui gagne 1,12 tuile et ARRIERE qui en rend 1,83,
-- changement de figure (etendue mesuree differente), regroupement qui
-- ramene l'ecart maximal de 10,4 a 7,1 tuiles, et le gaz qui fait
-- paniquer. Les unites non choisies ne bougent pas : 0,05 tuile.

-- ============================================================
-- LE CORDON — PREMIERE MISSION (2026-10-27-0920)
-- ============================================================
-- QUATRIEME FICHIER, mission.js, et il ne parle ni a la simulation ni
-- au rendu : il LIT la rue. Aucun objectif n'est declare atteint par
-- l'interface — chacun porte une fonction qui regarde l'etat des corps
-- et renvoie un chiffre. Si on supprimait tout l'affichage, la partie se
-- gagnerait ou se perdrait pareil.
--
-- « AVENUE DE LA REPUBLIQUE » : tenir 2 min 30. Objectif principal, 12
-- passages toleres ; secondaires, les devantures intactes et la tension
-- sous 80 %. Briefing en quatre lignes QUI LISENT LA MISSION, affiche
-- pendant que la rue tourne deja et qu'une tape referme. Pas d'ecran de
-- preparation : la partie commence a la seconde zero.
--
-- SIX EVENEMENTS tires par graine (ordre melange, minutes a plus ou
-- moins huit secondes) : deux poussees, les casseurs sur une vitrine
-- tiree parmi trois, la presse qui colle au cortege, un renfort de
-- soixante manifestants, un renfort de six policiers. Meme graine, meme
-- mission — on peut rejouer un bogue. Graine differente, autre mission.
--
-- DES CONSEQUENCES REELLES : la vitrine ne casse que si quatre casseurs
-- restent dessus cinq secondes, et seulement si on ne les deloge pas ;
-- gazer ou charger pendant que les cameras tournent coute 120 points par
-- fois ; la tension maximale coute jusqu'a 320.
--
-- CINQ CHOSES QUI RENDAIENT LA MISSION INJOUABLE, trouvees en la jouant
--  1. LE CORTEGE S'ARRETAIT A UNE TUILE ET DEMIE DU POLICIER LE PLUS
--     AVANCE. Il ne pouvait donc PAS deborder le cordon, meme en
--     retirant tous les hommes : on gagnait sans rien faire et la
--     defaite etait injouable. Il vise maintenant la prefecture, et son
--     front colle a sa propre tete : si le cordon tient, la tete
--     n'avance pas, donc le front non plus.
--  2. LES BARRIERES FERMAIENT LA CHAUSSEE ET LAISSAIENT LES TROTTOIRS
--     OUVERTS — exactement l'inverse de ce qu'il faut. Le cortege
--     contournait par les cotes.
--  3. A 1,6 tuile par seconde, le cortege traversait l'avenue en sept
--     secondes : la mission se jouait avant d'avoir commence. 0,55.
--  4. LA POUSSEE SE TRANSMETTAIT SANS PERTE. Trois cent cinquante corps
--     alignes, c'est la somme de tous ceux de derriere sur le premier
--     rang : aucun cordon ne pouvait tenir. Une poussee se dissipe de
--     proche en proche ; on plafonne ce qu'un corps peut recevoir.
--  5. LE CORDON AVAIT DES TROUS. Rayon 0,33 pour 0,70 d'ecart entre deux
--     places : des interstices larges comme un homme. A 0,45 ils se
--     touchent. Et tenir sa place fait peser deux fois et demie son
--     poids — qu'on perd des qu'on se deplace.
--
-- UN EVENEMENT RETIRE, ET POURQUOI C'EST BIEN : le contournement par la
-- transversale. Sur cette carte elle croise l'avenue A L'OUEST du
-- cordon : le bloc n'avait aucun debouche et tournait en rond. Un
-- evenement qui ne peut pas aboutir est une fausse menace. Remplace par
-- un renfort de cortege, qui lui se voit.
--
-- MESURE, huit graines jouees jusqu'au bout sans toucher a l'ecran :
-- quatre defaites, quatre victoires — et dans TOUS les cas passifs la
-- devanture est brisee. Avec des ordres, deux des trois graines perdues
-- deviennent des victoires a plus de 900 points. La troisieme reste
-- perdue parce que la strategie de test charge onze fois : charger sans
-- discernement DOIT perdre. L'equilibrage n'est pas fini — ne rien faire
-- gagne encore une fois sur deux — et c'est le prochain chantier.

-- ============================================================
-- LE CORDON — FINITION (2026-10-27-1120)
-- ============================================================
-- LA LECON DE CETTE PASSE : J'AI OPTIMISE DEUX FOIS DANS LE BRUIT.
-- Premiere mesure : « le dessin coute 16 ms ». J'ai remplace des
-- ellipses par des sprites, supprime des allocations — et la mesure
-- suivante donnait 12 ms sans qu'aucun de ces changements n'ait ete
-- ecrit (un patch avait echoue). Le conteneur de test partage son
-- processeur : une mesure isolee ne veut rien dire. Tout est desormais
-- mesure en MEDIANE DE CINQ SERIES, et la boucle de dessin porte des
-- jalons (s.prof) qui disent ou va le temps, section par section.
--
-- ET CES JALONS ONT DIT QUELQUE CHOSE D'UTILE : la section la plus
-- chere CHANGE d'une execution a l'autre (scene 11,7 ms une fois,
-- chrome 11,1 ms la suivante). Ce n'est pas du JavaScript, c'est
-- l'attente du compositeur : la derniere operation de l'image absorbe
-- le temps de composition du canvas. Dans ce conteneur il n'y a pas de
-- GPU et canvas 2D est fait en logiciel. CES CHIFFRES NE PREDISENT DONC
-- PAS ANDROID, ou canvas 2D est accelere. Il faut un vrai telephone.
--
-- CE QUI A QUAND MEME ETE CORRIGE, et pourquoi c'est juste
--  - m2e rendait un objet {x,y}. Appele pour trois cents corps et
--    quatre-vingt-dix objets par image, cela faisait vingt-trois mille
--    objets par seconde a ramasser. mx() et my() ne rendent qu'un
--    nombre.
--  - La position et la boite de chaque element STATIQUE sont calculees
--    une fois a la preparation : un lampadaire ne bouge pas.
--  - Les anneaux de selection etaient des ellipses tracees sous
--    transformation d'echelle, douze par image. Peints une fois par
--    couleur, recopies ensuite.
--  - La brume du fond etait un degrade etale sur les deux tiers de
--    l'ecran a chaque image : plus d'un million de points de degrade par
--    image sur un ecran a deux points par pixel. Peinte une fois dans
--    une bande de huit points qu'on etire.
--  - measureText appele quatre fois par image pour une dizaine de
--    textes possibles : mis en cache.
--
-- LA PAUSE. Un telephone qui recoit un appel : l'animation s'arrete
-- d'elle-meme, mais au retour le joueur reprenait une rue qui avait
-- bouge sans lui. Une borne qui declare pausable se fige sur perte de
-- focus ou passage en arriere-plan, continue a DESSINER (sinon l'ecran
-- reste fige sans dire pourquoi), coupe le son, et ne repart qu'au
-- doigt. L'orientation est recadree sur resize ET sur
-- orientationchange, deux fois apres coup : certains Android changent
-- l'orientation avant les dimensions.
--
-- LE SON : AUCUN FICHIER. Tout est synthetise — rumeur de bruit filtre
-- dont le volume vient du nombre de corps au contact et la couleur de
-- la tension, impacts, sifflets. Un jeu qui se charge en 153 ms ne peut
-- pas attendre trois cents kilo-octets de MP3, et un chemin casse est
-- un silence qu'on ne remarque qu'en production. Le contexte n'est cree
-- qu'au premier doigt : aucun navigateur mobile n'en laisse sortir
-- avant un geste.
--
-- UNE REGRESSION TROUVEE PAR LES TESTS EXISTANTS : le rayon des hommes
-- du cordon, passe a 0,45 pour rendre la ligne etanche, les faisait se
-- chasser entre eux (0,90 de diametre pour 0,70 d'ecart entre deux
-- places). L'ecart a la formation est passe de 2 a 7,4 tuiles. Deux
-- hommes de la MEME ligne se serrent maintenant epaule contre epaule
-- (rayon x0,62 entre eux), et le rayon reste entier face a la foule.
-- Retour a 0,75 - 3,8 tuiles.
--
-- MESURE FINALE, mediane de cinq series, portrait 390x844 :
--     378 corps (livre) : simulation 0,48 ms, dessin 11,9, image 12,5
--     453 corps         : 0,84 / 15,1 / 15,8
--     603 corps         : 1,13 / 16,1 / 16,3
-- La simulation reste sous 1,2 ms meme a six cents corps : c'est le
-- dessin qui plafonne, et c'est lui qu'un GPU accelere.

-- ============================================================
-- LE CORDON — LA PLACE, L'EAU ET LA FUMEE (2026-10-27-1320)
-- ============================================================
-- UNE PLACE, PAS UNE RUE. En isometrique, tout ce qui est au sud et a
-- l'est est DEVANT : une avenue de six tuiles entre deux rangees
-- d'immeubles de cent points, c'etait un couloir dont le premier plan
-- mangeait la moitie de l'ecran. L'esplanade fait vingt-quatre tuiles,
-- le bati est repousse sur les bords, et SA HAUTEUR DEPEND DE SA
-- PROFONDEUR : vingt a quarante points au sud ou il masquerait, jusqu'a
-- cent trente au nord ou il fait le fond. C'est la seule regle a retenir
-- pour poser un decor isometrique.
-- Au centre : une fontaine, deux alignements d'arbres, des bancs, un
-- kiosque, une rose de pierre. Chaque piece bloque une case.
--
-- LA FUMEE EST UNE ZONE, PAS UN EFFET. Le gaz etait un evenement
-- instantane et un cercle jaune qui s'agrandissait. C'est maintenant un
-- nuage qui tient neuf secondes, derive, et prend tous ceux qui entrent
-- dedans tant qu'il est la : il TIENT du terrain, et le degager coute
-- quelque chose. Les bouffees sont pre-peintes une fois et recopiees ;
-- un degrade radial calcule par bouffee et par image, a quarante
-- bouffees, couterait plus que toute la foule.
--
-- LES CAMIONS A EAU sont une unite comme une autre : on les choisit, on
-- les deplace, et leur ordre EAU arrose vraiment — le jet pousse les
-- corps qu'il touche, mesure a 1,4 a 2,3 tuiles de recul. Ils tendent
-- moins qu'une grenade, et c'est tout leur interet : douze points au
-- rapport contre trente-cinq.
--
-- CINQ CHOSES APPRISES, toutes par la mesure
--  1. LA CAMERA NE SUIVAIT PAS. Posee une fois au depart, elle laissait
--     le contact sortir de l'ecran au bout de trente secondes : les
--     nuages de gaz tombaient hors champ et je les ai crus invisibles
--     avant de compter les particules (32 dans le champ, 0 hors). Elle
--     recentre maintenant d'elle-meme, mais cinq secondes apres le
--     dernier geste — une camera qui reprend la main pendant qu'on
--     regarde ailleurs est pire que pas de suivi.
--  2. UNE DIAGONALE DE BARRIERES EST UN ESCALIER, et on passe entre deux
--     marches. Le premier entonnoir fuyait de partout. Ligne droite,
--     deux rangs, un seul passage.
--  3. UN PASSAGE PLUS LARGE QUE LA LIGNE QUI LE TIENT N'EST PAS UN
--     PASSAGE, C'EST UNE BRECHE. Neuf tuiles pour un rang de onze
--     hommes a 0,70 d'ecart, soit 7,7 tuiles : sept.
--  4. SUR UNE PLACE, L'ETANCHEITE N'EST PAS LE SUJET. A douze passages
--     toleres la mission etait perdue dans les huit graines quoi qu'on
--     fasse. Dix-huit, et la penalite ramenee de 45 a 12 points — sinon
--     on tenait la place et on finissait a zero.
--  5. MES SCRIPTS DE CORRECTION « TOUT OU RIEN » M'ONT FAIT PERDRE
--     QUATRE PATCHS ENTIERS dans cette session : une assertion ratee en
--     fin de script annulait tout ce qui precedait, sans que rien ne le
--     signale. Les corrections s'appliquent maintenant une par une, et
--     le script dit lesquelles ont rate.
--
-- MESURE : 380 corps, simulation 0,55 ms, dessin 11,6, image 13,6.
-- Six graines jouees sans toucher a l'ecran : deux victoires, quatre
-- defaites tombant entre 79 et 148 secondes sur une mission de 150.

-- ============================================================
-- LE CORDON — LES DEUX CAMPS (2026-10-27-1520)
-- ============================================================
-- ON CHOISIT SON CAMP AU MENU : deux cartes qu'on bascule d'une tape,
-- et tout suit — les objectifs, le briefing, les ordres, le bouton de
-- depart, et l'IA qui prend l'autre bord. Le choix est garde d'une
-- partie a l'autre : on rejoue rarement l'autre cote juste apres.
--
-- CHAQUE CAMP A SES ORDRES, et c'est voulu : un manifestant ne lance pas
-- de grenade, un policier ne monte pas de barricade. Afficher un bouton
-- qui ne fait rien serait exactement la fausse fonctionnalite qu'on
-- s'interdit depuis le debut.
--   police  : TENIR AVANT ARRIERE FORME GROUPE GAZ EAU
--   cortege : POUSSER RECULER CASSER BARRICADE GROUPE DISPERSER
--
-- LES BARRICADES ne sortent pas de terre : quatre corps sur place
-- pendant six secondes, et le cordon peut les deloger entre-temps. Une
-- fois debout, la case est bloquee POUR TOUT LE MONDE — et les champs
-- de navigation sont recalcules, donc la foule et la police la
-- contournent vraiment.
--
-- L'IA : DES REGLES, PAS DES SCRIPTS. Chaque decision se lit a voix
-- haute : « une barricade se monte et la charge est rechargee, on charge
-- dessus » ; « une devanture tombe, la reserve y va, elle ne tient aucun
-- front » ; « l'eau avant le gaz, elle disperse sans enflammer » ; « le
-- gaz seulement si la pression tient ET que la tension n'est pas deja au
-- plafond — gazer une rue au bord de l'emeute, c'est l'emeute ». Elle
-- passe par LES MEMES COMMANDES que le joueur : si un ordre marche pour
-- l'un il marche pour l'autre, et un bogue d'ordre se voit deux fois
-- plus vite.
-- Elle ne decide que quatre fois par seconde. Une IA qui reevalue a
-- chaque image donne des ordres contradictoires et ses unites tremblent
-- sur place.
--
-- TROIS CHOSES APPRISES
--  1. DEUX SEUILS, PAS UN. La police tolere dix-huit passages ; au
--     debut le cortege devait en faire passer dix-huit aussi, donc il
--     lui fallait faire MIEUX que ce que la police avait le droit de
--     laisser : ingagnable. Douze.
--  2. UNE BARRICADE SE MONTE LA OU SONT LES CORPS, pas sur le point de
--     ralliement du groupe : celui-ci peut etre a dix tuiles devant, et
--     on posait un chantier que personne n'atteignait jamais.
--  3. UN BLOC DE CORTEGE N'A PAS DE FIGURE. Le bandeau lisait
--     U.form.toUpperCase() a chaque image : du cote manifestant, il
--     levait une exception soixante fois par seconde et tuait la boucle.
--
-- MESURE, trois graines de chaque cote. Cortege : sans rien faire,
-- perdu 3 fois sur 3 (six a onze passes sur douze) ; en jouant, gagne 2
-- fois sur 3 avec des scores de 348 a 1098 — l'ecart entre les deux est
-- exactement ce qu'on cherchait. Police : l'equilibrage reste flou, ne
-- rien faire gagne encore environ une fois sur trois.

-- =====================================================================
-- ETAPE : LA BANDEROLE, LES MOLOTOVS, LE FEU          2026-10-27-1720
-- =====================================================================
--
-- CE QU'ON VOULAIT. Que le joueur ecrive son slogan, qu'il puisse
-- lancer des cocktails, et qu'un incendie brule au milieu de la place.
--
-- LA BANDEROLE. Le menu de la borne, cote cortege, recoit un champ de
-- saisie, six slogans tout faits, six couleurs de tissu et un apercu
-- anime dessine avec les VRAIS sprites du jeu — pas une approximation.
-- ACTEURS.ecrire() repeint l'atlas une seule fois au depart : le rendu
-- ne sait toujours rien du texte.
--   Le tissu fait vingt et un pixels : cinq caracteres. Afficher le
-- slogan tronque donnait « ON LA ». On le decoupe donc en MOTS, et
-- chaque banderole porte le suivant : on lit la phrase en balayant le
-- cortege, comme dans une vraie manif. La pancarte prend le mot le
-- plus court.
--   DEUX DEFAUTS TROUVES PAR LA CAPTURE D'ECRAN, pas par un test :
--   - la micro-police ecrivait OK pour ON (le glyphe N etait faux) ;
--   - ACTEURS.dessine miroite les directions 1 et 2 pour economiser la
--     moitie de l'atlas — et retournait donc les lettres. Un porteur de
--     texte ne se miroite plus : une silhouette de trois pixels tournee
--     du mauvais cote se voit moins qu'un slogan a l'envers.
--
-- LES MOLOTOVS. Trois bouteilles par salve, en arc, jamais au-dela du
-- cordon, vingt-deux secondes de recharge. Le feu nait a l'impact :
-- on voit la bouteille partir et on sait d'ou.
--
-- LE FEU EST UN OBSTACLE, pas un decor. La premiere version repoussait
-- a 0,000165 : deux cents corps qui avancent traversaient le brasier
-- sans ralentir. Desormais la poussee est triplee ET le coeur du foyer
-- repose sur son bord les corps qui y entrent, en annulant la vitesse
-- rentrante. Mesure : zero corps dans le rayon apres trois secondes.
--
-- CE QUE LE DESSIN A COUTE. Quatre foyers faisaient passer l'image de
-- 11 ms a 23 ms — un doublement. Deux causes, mesurees separement :
--   - un degrade radial reconstruit a chaque image et a chaque foyer :
--     remplace par deux vignettes peintes une fois et etirees ;
--   - 35 particules par foyer, chacune un blit etire avec transparence :
--     budget divise par deux (flammes toutes les 95 ms au lieu de 70,
--     fumee toutes les 300 ms au lieu de 150, mais plus grosse).
-- Resultat : 16 ms au lieu de 23. Le halo a aussi ete resserre de
-- f.r*26 a f.r*15 — a l'ancienne taille il couvrait un tiers de l'ecran
-- et effacait le pave.
--
-- L'INCENDIE DE LA PLACE. Septieme evenement de mission, une benne qui
-- brule deux minutes a l'est de la fontaine. DEUX ERREURS CORRIGEES :
--   - pose sur l'axe du cortege, il barrait le passage a ceux-la memes
--     qui l'allument : decale de cinq tuiles au nord ;
--   - ajouter un septieme creneau en redistribuant tout le calendrier
--     avancait le renfort du cortege de quatre secondes, assez pour que
--     la police ne tienne plus une partie. Le creneau s'INSERE
--     maintenant entre les anciens, qui n'ont pas bouge.
--
-- CE QUE LA MESURE A DIT SUR L'EQUILIBRAGE. En comparant la version
-- publiee et celle-ci sur les memes trois graines : les deux camps
-- gagnent environ une fois sur trois, AVANT comme APRES. Le
-- desequilibre n'est donc pas une regression de cette etape — mais il
-- reste la limite la plus visible du jeu.

-- =====================================================================
-- CORRECTIF : LE CORTEGE N'OBEISSAIT PAS                2026-10-27-1730
-- =====================================================================
--
-- LE SYMPTOME, rapporte par le joueur : cote manifestant, impossible de
-- deplacer un bloc. Le message « EN MARCHE » s'affichait, le chemin se
-- dessinait, l'anneau de destination apparaissait — et rien ne bougeait.
--
-- LA CAUSE. majCortege() repose a CHAQUE IMAGE la position de
-- ralliement de chaque bloc : G.ax = front - base, G.ay = axe de
-- l'avenue. L'ordre partait bien, le champ de navigation se calculait
-- bien, et une milliseconde plus tard le bloc etait ramene sur l'axe.
-- Cote police les unites ne sont pilotees par rien : c'est pour ca que
-- le meme ordre marchait d'un cote et pas de l'autre.
--
-- LE CORRECTIF. cmdAller pose U.libre sur les blocs commandes, et
-- majCortege les saute — blocs de cortege, casseurs et mobiles. Le
-- front du cortege continue d'etre calcule sur la tete : si le joueur
-- l'emmene ailleurs, le reste suit sa nouvelle position, ce qui est
-- exactement ce qu'on veut.
--
-- ET LE RETOUR. Un bloc parti n'avait aucun moyen de revenir dans le
-- rang : le cortege se serait vide partie apres partie. GROUPE, qui
-- refusait jusqu'ici une selection d'une seule unite, la rend
-- maintenant au cortege.

-- =====================================================================
-- ETAPE : VISER                                         2026-10-27-1800
-- =====================================================================
--
-- LE SYMPTOME, rapporte par le joueur : les molotovs « partent pas dans
-- la bonne direction ». Exact, et c'etait pire que ca.
--   - cmdMolotov visait sx+3,4 : TOUJOURS vers l'est, quoi qu'il arrive.
--   - cmdGaz et cmdEau visaient FOULE.devant(U), le cap de la formation.
-- Trois ordres sur lesquels le joueur n'avait aucune prise.
--
-- LE SYSTEME. Le bouton n'execute plus : il ARME. Ensuite deux gestes
-- mènent au meme endroit, parce qu'on ne sait pas lequel un pouce
-- choisira :
--   - taper une case : ca part la ;
--   - poser et glisser : une ligne de tir et un reticule suivent le
--     doigt, et ca part au relachement.
-- Le second a demande un point d'entree de plus dans le shell :
-- BORNE.relache(S,x,y), appele sur pointerup quand le doigt A bouge.
-- Sans lui la visee se reglait et ne partait jamais. Les autres bornes
-- n'ont pas ce point d'entree et ne voient aucune difference.
--
-- CE QU'ON VOIT PENDANT LA VISEE. Un cercle pointille de portee autour
-- de chaque unite selectionnee — en projection isometrique, donc une
-- ellipse deux fois plus large que haute — peint en deux traits, un
-- lisere sombre puis la couleur de l'unite : a un seul trait fin il se
-- perdait dans la foule. Et, tant que le doigt est pose, la ligne et le
-- reticule, qui passent a l'orange hors de portee.
--
-- HORS DE PORTEE : ON RACCOURCIT, ON NE REFUSE PAS. borner() ramene la
-- cible sur la meme direction et le message le dit. Un refus sec au
-- doigt est une commande qui ne marche pas ; un tir raccourci se voit
-- et s'apprend en une fois.
--
-- ARMER VERIFIE AVANT D'ALLUMER. Viser trois secondes pour s'entendre
-- dire qu'il n'y a pas de bouteille est pire que de l'apprendre tout de
-- suite : armer() refuse une selection vide, une recharge en cours, le
-- gaz demande aux camions et l'eau demandee a des hommes a pied.
--
-- ET L'IA VISE AUSSI. Maintenant que la cible est un parametre, il
-- serait absurde que la machine lance droit devant pendant que le
-- joueur choisit : iaCible() lui donne le barycentre des manifestants a
-- portee, et elle y envoie grenade et jet.

-- =====================================================================
-- ETAPE : LA QUALITE DES COCKTAILS                      2026-10-27-1840
-- =====================================================================
--
-- CE QU'IL Y AVAIT. Trois fillRect empiles : on voyait un point orange
-- traverser la place, sans savoir ce que c'etait ni ou ca tombait.
--
-- LA BOUTEILLE. Huit vignettes de 16x16 peintes au premier lancer et
-- plus rien a calculer ensuite : lisere sombre — sans lui un objet de
-- six pixels disparait au-dessus de deux cents personnes —, verre vert
-- avec son reflet, essence ambree au fond, goulot, chiffon et flamme.
-- Elle TOURNE en vol : un objet lance sur quinze metres qui garde la
-- meme orientation ne vole pas, il glisse.
--   UN BOGUE D'ARRONDI VU A LA CAPTURE : (rot/0.7854)|0 renvoyait 0 a
-- l'angle exact de 45 degres, parce que le quotient vaut 0,99999. Deux
-- angles sur huit etaient identiques. Math.round, pas de troncature.
--
-- L'OMBRE AU SOL, a la verticale de l'objet, qui retrecit quand il
-- monte. C'est elle qui dit ou la bouteille va tomber — la hauteur du
-- dessin ne le dit pas, en isometrie.
--
-- LA TRAINEE. Le chiffon brule pendant tout le vol : une braise toutes
-- les 55 ms, une fumee une fois sur deux. C'est ce qui fait qu'on SUIT
-- la bouteille des yeux au lieu de la retrouver a l'arrivee.
--
-- L'IMPACT, EN QUATRE COUCHES. Le flash d'abord, un dixieme de seconde
-- en composition « lighter », dessine APRES les particules pour
-- eclairer la gerbe et pas passer dessous : sans lui l'impact commence
-- mollement. Puis la gerbe de flammes vers le haut, les eclats de verre
-- — un trait clair oriente par la vitesse, pas une bouffee — qui filent
-- a plat et retombent en une demi-seconde, et la nappe d'essence, large
-- et ecrasee, qui colle au pave et s'eteint la premiere.
--
-- LA SALVE. Les trois bouteilles partent a 110 ms d'intervalle. A la
-- milliseconde pres elles faisaient une figure geometrique ; decalees,
-- elles font une salve.
--
-- CE QUE CA COUTE. Mesure sur sept series : 4 foyers etablis, 14,3 ms
-- de dessin contre 8,8 sans feu — inchange par rapport a l'etape
-- precedente, les nouvelles particules etant toutes breves. Le pic a
-- l'impact dure une demi-seconde.

-- =====================================================================
-- ETAPE : LES CONTROLES, ET POURQUOI CE N'ETAIT PAS AMUSANT
--                                                      2026-10-27-1930
-- =====================================================================
--
-- LE REPROCHE : « pas assez fun, et les controles pas fonctionnels ».
-- Deux choses differentes, mesurees separement.
--
-- ---- LES CONTROLES ----
-- Mesure au depart : quatorze boutons sur TROIS rangees occupant un
-- sixieme de la hauteur, et une camera au zoom MINIMUM qui montrait
-- surtout des arbres et des trottoirs avec la foule en petit tas.
--   - La camera commence a 1,35 au lieu du plancher. Le premier regard
--     tombe sur le contact entre le cortege et le cordon.
--   - Taper une pastille amene la camera sur l'unite, en glissant et
--     non en sautant : selectionner un bloc qu'on ne voit pas, c'est
--     commander a l'aveugle.
--   - La troisieme rangee existait parce qu'un libelle de sept lettres
--     ne tient pas dans vingt-sept points. Les ordres portent un
--     pictogramme de seize pixels : deux rangees suffisent, et la
--     cible sous le pouce est passee de 38 a 46 points CSS.
--   - Un ordre indisponible est grise AVANT qu'on le touche.
--   - DIAG, bouton de developpement, sort de la barre du joueur.
--
-- ---- POURQUOI CE N'ETAIT PAS AMUSANT ----
-- La mesure qui a tout explique : PENDANT CENT QUARANTE SECONDES, PAS
-- UN SEUL manifestant ne depassait le cordon. Les trois rangs gardaient
-- leur abscisse a la decimale pres, 33,3, du debut a la fin. Le
-- compteur restait a 0/12 pendant deux minutes vingt, puis un evenement
-- de fin de partie forcait le verrou et la moitie passait d'un coup.
-- Pousser ne servait a rien. Aucun des deux camps n'avait de decision a
-- prendre.
--
-- QUATRE CAUSES, corrigees dans l'ordre ou on les a trouvees :
--   1. Le passage des barrieres faisait SEPT tuiles, exactement la
--      largeur du cordon. Tout passait par la et le cordon couvrait
--      tout. Il en fait treize pour une ligne qui en couvre huit.
--   2. Les quatre blocs visaient le MEME axe : ils arrivaient en file
--      sur le point le mieux tenu et se bousculaient entre eux. Ils
--      attaquent maintenant quatre bandes.
--   3. Une ligne de police ne reculait jamais. Elle plie desormais
--      sous la pression, jusqu'a 3,5 tuiles, et reprend son terrain.
--      Le seuil de flexion est a 55 % du seuil de rupture : la mesure
--      montrait une pression plafonnant a 2,1 pour un seuil de 2,6,
--      autrement dit une ligne qui n'aurait jamais plie d'un pouce.
--   4. Le cocktail etait interdit a 1,3 tuile EN DECA du cordon : la
--      seule arme capable d'ouvrir une breche ne pouvait pas la
--      toucher. Il porte jusqu'a une tuile au-dela du premier rang, et
--      un homme dans les flammes cede meme s'il a ordre de tenir.
--
-- CE QUE CA DONNE, mesure. Premier passage : 16 s au lieu de 130 s.
-- Flux passif sur trois graines : 35 a 57 passages repartis sur la
-- partie, au lieu de 0 puis tout d'un coup. Les seuils ont ete
-- recalibres SUR CETTE MESURE : la police en tolere 45 (moins que le
-- flux passif, donc ne rien faire est perdant), le cortege doit en
-- faire passer 24 (plus que ce que l'IA policiere laisse filtrer). Les
-- points par passage sont passes de 12 a 8 des deux cotes, sinon une
-- partie gagnee de justesse finissait sous zero.

-- =====================================================================
-- ETAPE : LA BARRE, VERSION « JETONS »                  2026-10-27-2010
-- =====================================================================
--
-- Quatre maquettes ont ete dessinees sur la MEME scene et comparees
-- cote a cote avant de choisir. La retenue : une seule rangee d'ordres
-- en gros pictogrammes, et les unites en jetons ronds qui FLOTTENT
-- par-dessus la scene, sur une barrette sombre arrondie.
--
-- CE QUE CA CHANGE. Les jetons ne comptent plus dans s.hbar : la rue
-- regagne toute leur hauteur (50 points d'ecran contre 30). Les ordres,
-- ce qu'on touche le plus souvent, deviennent la plus grosse cible.
--
-- TROIS DETAILS QUI COMPTENT :
--   - un jeton se touche EN ROND, avec trois points de marge : un carre
--     autour d'un rond vole les taps de ses voisins ;
--   - l'avancement d'un ordre fait le TOUR du jeton — un arc se lit sur
--     un rond, une barre de progression non ;
--   - le rayon se DEDUIT de la place disponible, jamais l'inverse : sur
--     un ecran etroit les jetons retrecissent au lieu de se chevaucher,
--     avec un plancher a quatorze points d'ecran.
--
-- Et le glissement de camera s'arrete a la barrette, pas a la barre :
-- un doigt pose sur un jeton commande, il ne deplace pas la rue.
