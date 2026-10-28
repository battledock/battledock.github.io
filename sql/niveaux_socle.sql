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

-- =====================================================================
-- ETAPE : L'ELAN, LES TROIS ZONES, LA TENSION PARTAGEE  2026-10-27-2110
-- =====================================================================
--
-- LE REPROCHE : « il n'y a aucune strategie ». Exact, et la raison est
-- simple : toutes les actions etaient du meme type — pousser plus fort
-- a un endroit — et aucune ne demandait d'arbitrage. Chaque ordre fort
-- avait sa propre recharge, ou rien du tout. La seule question etait
-- « quand le minuteur se termine-t-il ».
--
-- ---- UNE JAUGE COMMUNE ----
-- L'ELAN cote cortege, LES MOYENS cote police : le meme chiffre, deux
-- mots. Elle remonte de 2,6 points la seconde jusqu'a 80 ; un coup fort
-- en coute 34, soit treize secondes, et deux d'affilee vident la
-- reserve. Depenser pour une chose, c'est ne pas l'avoir pour une
-- autre : gazer maintenant, c'est ne pas pouvoir arroser dans cinq
-- secondes. C'est la premiere vraie decision du jeu.
--   MESURE qui a fixe les chiffres : a 4,2 points la seconde et un
-- plafond de cent, on repassait de quinze a plein en vingt secondes —
-- autant dire que la jauge ne limitait rien.
--   La recharge fixe des cocktails a disparu : vingt-deux secondes
-- imposees ne demandaient aucun choix, trente-quatre points si.
--   DEUX DETAILS : on paie au TIR et pas a l'armement, parce que viser
-- puis changer d'avis ne doit rien couter ; et le prix est ecrit sur
-- chaque bouton, sinon on apprend le cout en appuyant, c'est-a-dire en
-- le payant.
--   La jauge EST le lisere de la barre. Pas un cadran de plus a
-- regarder : la ligne qui separe la rue des boutons se remplit.
--
-- ---- TROIS ZONES QUI NE SE VALENT PAS ----
-- Un seul compteur de passages, c'etait une seule chose a faire. Trois
-- zones en font trois, et comme elles donnent des avantages differents,
-- en choisir une c'est renoncer aux autres :
--   LE PASSAGE, entre les barrieres, rend l'elan plus vite — la zone
--     qu'on se dispute vraiment, puisqu'elle finance tout le reste.
--   LA PERCEE, la rue nord-sud, donne deux renforts toutes les six
--     secondes. Loin du contact : il faut detacher du monde.
--   LA FONTAINE, au centre, fait retomber la tension. La zone de ceux
--     qui veulent calmer le jeu plutot que l'ouvrir.
-- Une zone appartient au camp qui a QUATRE corps de plus, pas un : a
-- egalite elle reste a personne, sinon elle changerait de main a chaque
-- pas de chaque passant. Elles sont peintes au SOL, sous les corps : ce
-- sont des marques de terrain, pas des panneaux.
--
-- ---- LA TENSION, PARTAGEE ----
-- Au-dela de 0,55 elle assouplit les lignes — TOUTES les lignes, y
-- compris celles de celui qui l'a fait monter. Au-dela de 0,85 pendant
-- quatre secondes, une bousculade part toute seule a l'endroit le plus
-- tendu : personne ne l'a commandee, et on ne l'empeche qu'en faisant
-- retomber la tension AVANT. C'est la seule ressource du jeu qu'on
-- partage avec l'adversaire.
--
-- ---- RECALIBRAGE ----
-- Les zones donnent des renforts, la tension ouvre les lignes : le flux
-- a double. Mesure sur trois graines et quatre scenarios, les seuils
-- sont passes a 58 toleres et 22 a faire passer. Resultat : trois
-- victoires de chaque cote sur douze parties, et surtout le score du
-- joueur actif depasse nettement celui du joueur passif — ce qui
-- n'etait pas le cas avant.

-- =====================================================================
-- ETAPE : LES ACTIONS DU CORTEGE                        2026-10-27-2220
-- =====================================================================
--
-- TROIS STYLES, choisis au menu. Ils ne changent pas les regles : ils
-- changent QUI compose la foule, et le reste suit.
--   PACIFIQUE : sept banderoles en tete au lieu de trois, des street
--     medics, un temperament a 0,66 et une tension qui monte a 0,74.
--   DETERMINE : le cortege d'avant, inchange.
--   RADICAL : quatorze pour cent de casseurs, plus rapides, plus
--     lourds, plus nerveux, et une tension a 1,34.
-- Trois boutons, un seul geste : c'est la decision qu'on prend AVANT la
-- partie et qui pese sur les deux minutes trente suivantes. Des
-- curseurs auraient demande trois gestes pour le meme resultat.
--
-- LA BANDEROLE EST UN BOUCLIER. Un tissu tendu sur deux hampes, c'est
-- ce que la tete d'un cortege oppose a un canon a eau. Le porteur
-- encaisse le tiers et protege ceux qui sont a une tuile et demie
-- derriere lui. Rien a activer : il suffit de les mettre devant.
--   Le calcul de « qui est abrite » se fait UNE FOIS par pas, dans la
-- simulation, et marque les corps pour une demi-seconde — pas dans la
-- boucle de l'eau, qui tourne pour chaque jet et chaque corps.
--
-- LA FEINTE. Le passage fait treize tuiles pour une ligne qui en couvre
-- huit : il y a toujours un cote degarni, encore faut-il que la police
-- regarde ailleurs. Un bloc en feinte se jette en avant huit secondes,
-- et l'IA envoie sa reserve au bruit. C'est la premiere action du jeu
-- qui ne sert a rien toute seule.
--
-- LA BARRICADE ENFLAMMEE. Pas de bouton de plus : un cocktail a moins
-- d'une tuile et demie d'une barricade debout y met un feu plus gros et
-- plus long. C'est la rencontre de deux actions qu'on avait deja, et
-- c'est au joueur de la voir.
--
-- ---- DEUX DEFAUTS TROUVES EN MESURANT ----
--
-- 1. L'IA NE PAYAIT PAS. La jauge d'elan ne s'appliquait qu'au joueur :
--    la machine gazait en boucle pendant qu'on comptait ses coups, et
--    on mesurait CENT QUARANTE-CINQ manifestants en fuite a la
--    vingt-cinquieme seconde. Une regle qui ne vaut que pour un camp
--    n'est pas une regle, c'est un handicap. L'IA a maintenant sa
--    propre jauge, aux memes chiffres.
--
-- 2. LES UNITES DE L'IA NE SE DEPLACAIENT PAS. majUnites ne parcourait
--    que s.unites, c'est-a-dire les unites DU JOUEUR. L'IA mordait a la
--    feinte, calculait son chemin, posait son ordre — et sa reserve
--    restait sur place. Exactement le meme defaut que celui du cortege
--    corrige plus tot, mais du cote de la machine, donc invisible : il
--    a fallu instrumenter l'IA pour le voir. C'est la lecon de cette
--    etape : un bogue cote IA ne se signale jamais tout seul.
--
-- ---- L'EQUILIBRE, APRES ----
-- 56 toleres, 52 a faire passer. Sur trois graines et quatre
-- scenarios : quatre victoires de chaque cote, les parties vont au
-- bout, et surtout le joueur actif gagne 3 fois sur 3 cote cortege
-- contre 1 fois sur 3 pour le passif, avec des scores du simple au
-- double (1408 contre 602). Jouer paie, enfin.

-- =====================================================================
-- ETAPE : LES TROIS ORDRES DE MAINTIEN                  2026-10-27-2320
-- =====================================================================
--
-- La police avait la force — gaz, eau, charge — et rien d'autre. Or
-- tenir une place, ce n'est pas seulement frapper : c'est annoncer,
-- encercler, et retirer celui qui entraine les autres.
--
-- LES SOMMATIONS (8). Elles ne dispersent personne par elles-memes :
-- elles font reculer ceux qui hesitaient deja, et surtout elles
-- COUVRENT les vingt secondes suivantes. Gazer sans avoir somme devant
-- les cameras est une faute ; apres sommation, non. C'est le seul ordre
-- du jeu dont l'interet est de rendre un AUTRE ordre moins cher.
--   MESURE : a 0,34 de seuil et 0,16 de stress ajoute, CENT QUARANTE
-- personnes decrochaient d'un coup et la moitie passait en panique. Une
-- sommation n'est pas une grenade : seuil 0,48, ajout 0,09, et on en
-- touche une trentaine.
--
-- LA NASSE (30). Fer a cheval sur la foule la plus proche ; ceux qui
-- sont dedans n'avancent plus qu'au cinquieme et NE COMPTENT PLUS comme
-- passages — ils sont derriere la ligne, peut-etre, mais ils sont
-- tenus, pas passes. En contrepartie la tension monte de 0,12 d'un
-- coup, et une rue tendue fait ceder TOUTES les lignes, y compris la
-- sienne.
--   MESURE : a trois tuiles de rayon on encerclait cent trente
-- personnes d'un seul ordre. Deux et demie : une nasse est
-- chirurgicale, pas une rafle.
--
-- L'INTERPELLATION (22). Le meneur retire, la cohesion du bloc est
-- divisee par quatre pendant vingt secondes : il s'etale, il pousse
-- moins, et il se remet tout seul.
--   UN DEFAUT CORRIGE : on cherchait le bloc dont le CENTRE est proche.
-- Un bloc de soixante-dix personnes a son centre a dix tuiles alors que
-- sa tete est au contact — « aucun meneur a portee », toujours. On
-- cherche maintenant le manifestant le plus proche et on remonte a son
-- groupe.
--
-- GROUPE A SAUTE cote police : une ligne de maintien ne se regroupe
-- pas, elle tient une figure. C'etait le seul bouton dont on ne se
-- servait jamais, et neuf ordres tiennent encore a quarante-trois
-- points d'ecran la ou dix tombaient a trente-neuf.

-- =====================================================================
-- ETAPE : LE PONT, ET DES TERRAINS                      2026-10-28-0030
-- =====================================================================
--
-- AV et RU etaient des constantes : une seule place, pour toujours. Ce
-- sont maintenant des objets qu'on REECRIT au demarrage sans jamais les
-- remplacer — tout le fichier en garde la reference, et il n'y a pas
-- une ligne a changer ailleurs. Le reste du jeu — les ordres, la jauge,
-- les camps, l'IA — ne sait pas sur quelle carte il tourne, et c'est ce
-- qui permet d'en ajouter une sans rien casser.
--
-- LE PONT. Onze tuiles de tablier entre deux parapets de pierre, de
-- l'eau des deux cotes, un ministere qui barre le fond. Aucun
-- contournement : le cortege force ou ne passe pas. Mais il n'y a PAS
-- D'ECHAPPATOIRE, et une panique sur un pont ne va nulle part : la
-- tension y est l'arme et le danger des deux camps.
--   L'eau est un type de sol de plus, qui bloque comme un mur et se
-- dessine autrement. C'est la seule difference, et c'est ce qui permet
-- d'ajouter un fleuve sans toucher a la navigation.
--   Les parapets sont des objets poses case par case : sans eux on lit
-- une rue bordee de vide, pas un pont.
--
-- LES SEUILS SUIVENT LE TERRAIN. Mesure : le pont laisse passer cinq
-- fois moins de monde que la place. 56 toleres / 52 a faire passer sur
-- la place, 16 / 13 sur le pont. Un seuil unique aurait rendu la
-- mission injouable d'un cote ou gagnee d'avance de l'autre.
--
-- LE ZOOM DE DEPART AUSSI. A 1,35 sur le pont on ne voyait que le
-- tablier et la carte ressemblait a une rue : il faut voir le fleuve
-- des la premiere image pour comprendre qu'il n'y a nulle part ou
-- aller. Le pont demarre a 1,00.
--
-- UN DEFAUT TROUVE PAR LE TEST DE MISSION : sur un pont il n'y a pas de
-- devanture, donc M.ciblee valait null, l'evenement « casseurs »
-- partait quand meme et les casseurs n'avaient nulle part ou aller.
-- L'objectif ne pouvait ni se gagner ni se perdre. Un evenement qui ne
-- peut pas aboutir est une fausse menace : sur un terrain sans vitrine,
-- il est remplace par une poussee, qui se voit.
--
-- POURQUOI UNE HEURE DE DIAGNOSTIC SUR LE RENDU. Les captures en jeu
-- montraient une rue entre des immeubles, jamais le fleuve, et j'ai
-- cherche un bogue de peinture qui n'existait pas. Exporter le CALQUE
-- DE SOL entier a tranche en une capture : le pont etait parfait depuis
-- le debut, c'etait le cadrage de la camera qui ne montrait que le
-- tablier. Quand une image ne dit pas ce qu'on attend, regarder la
-- source avant de soupconner le dessin.

-- =====================================================================
-- ETAPE : ON VOIT, ET ON A LE TEMPS DE VOIR          2026-10-28-0130
-- =====================================================================
--
-- Trois reproches sur une seule capture d'ecran, et les trois etaient
-- justes.
--
-- 1. « ON VOIT RIEN ». Un immeuble occupait les deux tiers de l'ecran
--    pendant que la partie se jouait derriere. En isometrie, un volume
--    place au sud-est de la foule est DEVANT elle : il se dessine
--    par-dessus, et aucun angle de camera ne sauve la vue.
--    La regle : un volume qui se dessine APRES des corps et dont le
--    rectangle recouvre ces corps passe a trente pour cent. On ne le
--    cache pas — il faut continuer a lire la ville — on le rend
--    translucide. Le test porte sur les corps DEJA DESSINES, donc
--    derriere, ce qui suffit et ne coute qu'une comparaison de boites.
--    MESURE : une milliseconde de dessin en plus, pour trois a neuf
--    batiments voiles selon la position. C'est payé.
--
-- 2. « C'EST TROP RAPIDE ». On aurait pu ralentir les vitesses et
--    allonger la duree, mais chaque reglage ainsi touche demande de
--    recalibrer tous les seuils, et on l'a deja fait trop de fois dans
--    cette session. On ralentit donc le TEMPS lui-meme : la simulation,
--    la mission, les recharges et le chrono recoivent le meme dt reduit
--    a 72 %. Rien ne change dans les rapports entre les choses, tout
--    prend un tiers de temps en plus. Un seul point de changement,
--    aucun equilibrage a refaire.
--
-- 3. LES LIBELLES DEBORDAIENT. Neuf ordres sur un telephone, ce sont
--    des boutons de vingt et un points : AVANT, ARRIERE et FORME se
--    touchaient et se lisaient « AVANTARRIEREFORME ». On mesure
--    maintenant le texte et on retrecit la police jusqu'a ce qu'il
--    rentre, avec un plancher a quatre points et demi — en-dessous ce
--    n'est plus du texte.

-- =====================================================================
-- ETAPE : LES QUARANTE SECONDES D'AVANT               2026-10-28-0230
-- =====================================================================
--
-- « On s'ennuie. » Le jeu commencait par un briefing qu'on lit pendant
-- que la partie tourne deja : aucune decision avant le contact, et le
-- premier choix arrivait quand il etait trop tard pour qu'il compte.
--
-- QUARANTE SECONDES AVANT QUE LE CORTEGE ARRIVE. La rue vit — les corps
-- respirent au sixieme de l'allure, on voit que c'est vivant — mais
-- rien n'avance : ni le front, ni la mission, ni le chrono.
--
-- ON PLACE SES UNITES, et le geste est celui du jeu : on tape un jeton,
-- on tape une case. Pas de glisser-deposer a inventer, pas de second
-- vocabulaire a apprendre — la seule difference est que l'unite s'y
-- trouve TOUT DE SUITE, ses hommes avec elle, parce qu'on dispose, on
-- ne commande pas encore.
--   Mesure qui justifie l'etape : au depart, L1 est a 34, L2 a 35,3 et
-- L3 a 36,6 — les trois lignes EMPILEES sur la meme tuile, pour treize
-- tuiles de passage. Les etaler est deja une decision, et jusqu'ici le
-- jeu ne la proposait pas.
--
-- ON S'EQUIPE, quatre articles par camp et un budget de quarante-deux.
-- CE QU'ON NE DEPENSE PAS DEVIENT DE L'ELAN, et le temps qu'on ne prend
-- pas aussi : tout acheter, c'est commencer a sec ; PRET a la dixieme
-- seconde avec la moitie du budget, c'est entrer la jauge pleine.
-- Savoir ce qu'on veut doit payer, et c'est la tout le dessin de cette
-- phase : chaque ligne du rayon est un arbitrage contre la jauge.
--
-- DEUX DETAILS D'ECRAN. Le HUD du haut se tait pendant la prepa : deux
-- bandeaux superposes et on ne lisait ni l'un ni l'autre. Et la ligne
-- de pied « ce qu'on garde devient de l'elan » a ete retiree — elle
-- passait derriere les cartes, l'ecran n'a pas la place, et le briefing
-- le dit deja.
--
-- TRENTE-NEUF SCRIPTS DE TEST ONT DU SAUTER LA PREPA. Ils demarraient
-- et tapaient un bouton d'ordre dans la foulee ; il a suffi d'une ligne
-- apres chaque demarrage. C'est le prix d'une phase qui s'intercale, et
-- il valait mieux le payer dans les tests que dans le jeu.

-- =====================================================================
-- ETAPE : LE FEU BRULE, ET IL EST BEAU                2026-10-28-0330
-- =====================================================================
--
-- LE BOGUE, ET IL ETAIT GROS. La boucle qui applique les effets aux
-- corps commencait par « if(ag.camp!=='manif')continue; » — elle
-- sautait donc TOUS les policiers, et la boucle des feux etait dedans.
-- Resultat : un cocktail tombe en plein sur le cordon ne lui faisait
-- absolument rien. Le seul moyen qu'avait le cortege d'ouvrir une
-- breche ne marchait pas, et personne ne pouvait le voir autrement
-- qu'en jouant.
--   La boucle des feux est remontee AVANT le filtre de camp. Le gaz et
-- l'eau restent reserves au cortege — les CRS ont un masque et ne
-- s'arrosent pas — mais les flammes brulent tout le monde.
--
-- ET ELLES BRULENT POUR DE BON. Qui est dans les quatre cinquiemes du
-- rayon prend feu : quatre secondes en etat FUIT, hors de toute
-- formation et sourd a tous les ordres, avec trois petites langues
-- accrochees au corps pour qu'on le repere au milieu de la ligne.
-- Mesure : un foyer de 2,2 tuiles pose sur une ligne de 46 hommes en
-- met 9 en feu et fait tomber de 46 a 6 le nombre de ceux qui restent a
-- portee. Dix secondes plus tard la ligne s'est recomposee.
--
-- LE FEU ETAIT LAID, ET VOICI POURQUOI. Il empilait trois gouttes
-- lissees avec des degrades : de loin trois taches orange, de pres un
-- flou dans un jeu qui n'a pas un seul pixel flou ailleurs.
--   Les langues sont maintenant peintes CASE PAR CASE sur une grille de
-- douze par vingt, en quatre teintes franches — coeur blanc, jaune,
-- orange, rouge sombre — avec une pente qui s'applique au CARRE de la
-- hauteur (droite a la base, couchee a la pointe), un second coup de
-- vent, une pointe qui se delite et une encoche de temps en temps.
-- Huit langues tirees d'une graine fixe, plus un vacillement propre a
-- chacune.
--   MESURE DE CADRAGE : a 0,55 de pente toutes les langues sortaient
-- droites et on voyait huit fois le meme triangle. A 1,9, elles se
-- tordent.
--   Et un TAPIS DE BRAISES sous les langues : un feu commence par une
-- surface qui rougeoie, les flammes poussent dessus. A vingt cases de
-- large on voyait une grille de gros carres rouges posee sur le pave ;
-- a quarante, avec des braises plus sombres que les flammes, c'est un
-- sol qui rougeoie.
--
-- CE QUE CA COUTE. Trois langues toutes les 80 ms faisaient passer
-- quatre foyers de 5 a 9 ms de dessin en plus. Les gros foyers gardent
-- leurs trois langues — ce sont eux qu'on regarde — les petits se
-- contentent de deux, et l'emission revient a 95 ms : 10,8 ms a quatre
-- foyers contre 10,7 sans feu. Le feu ne coute plus rien.

-- =====================================================================
-- ETAPE : ÊTRE DANS LA FOULE                          2026-10-28-0430
-- =====================================================================
--
-- « Je veux une vraie experience de jeu, la c'est nul. » Le reproche
-- etait juste et il portait plus bas que tout ce qu'on avait corrige
-- jusque-la : on avait ajoute des systemes autour d'un noyau qui ne
-- donnait rien a FAIRE. Taper un jeton, taper la carte, attendre dix
-- secondes qu'un bloc arrive, appuyer sur GAZ, regarder un compteur :
-- un tableur anime vu du ciel.
--
-- ON EST QUELQU'UN, MAINTENANT. Un agent de la simulation porte la
-- marque « moi ». La manche gauche le fait marcher, la camera le suit,
-- son bloc le suit lui. Tout le reste du moteur continue sans savoir
-- qu'un joueur existe — la foule pousse, les murs arretent, le feu
-- brule, la panique emporte — et c'est exactement ce qu'on voulait :
-- etre DANS la foule et non au-dessus.
--   Le seul endroit du moteur qui sache qu'un joueur existe tient en
-- trois lignes dans foule.js : si a.moi, la destination vient du pouce
-- au lieu du champ. Trois lignes valent mieux qu'un systeme de controle
-- parallele.
--
-- TOUT ETAIT DEJA LA. Le shell a deux manches tactiles completes,
-- ecrites pour d'autres bornes, avec capture du pointeur et origine qui
-- suit le pouce. Il a suffi de declarer manches:'une'.
--
-- TROIS REGLAGES, TROIS MESURES.
--   1. L'avatar etait le premier membre de la liste, c'est-a-dire au
--      COEUR du bloc : neuf voisins au contact, on poussait un mur de
--      cinquante-quatre corps a chaque pas. Il est maintenant l'homme
--      le plus avance — trois voisins, et la place d'un meneur.
--   2. A la vitesse d'un passant on faisait vingt-cinq centimetres en
--      une seconde et demie. On se faufile : la distance exigee des
--      voisins est reduite de moitie, plutot que d'augmenter la force,
--      ce qui l'aurait fait traverser la foule comme un char.
--   3. Le bloc collait au meneur a un dixieme par milliseconde : on
--      emmenait cinquante-quatre personnes a chaque pas et on avancait
--      a LEUR vitesse. A deux millemes, on peut courir devant.
--
-- DEUX PIEGES D'INTERFACE, tous deux de recouvrement :
--   - la zone de prise de la manche est en z-index 3, donc PAR-DESSUS
--     le canvas. Descendue jusqu'en bas, elle avalait les tapes des
--     jetons et des ordres : plus aucun bouton du coin gauche ne
--     repondait. Elle s'arrete maintenant a cent dix-huit points du
--     bas.
--   - le shell posait la largeur de cette zone EN DUR, ce qui ecrasait
--     la feuille de style : Le Cordon demandait un quart et recevait
--     l'ecran entier. On ne la pose plus que pour les bornes qui n'ont
--     pas de regle a elles.

-- =====================================================================
-- ETAPE : L'ARCADE N'A PLUS QU'UNE BORNE              2026-10-28-0530
-- =====================================================================
--
-- Le joueur a demande de n'y garder que les zombies. L'arcade en
-- portait deux ; Le Cordon est sorti.
--
-- CE QUE LA SUPPRESSION A EMPORTE, verifie avant de couper :
--   - la borne dans BORNES, et BORNES_BIENTOT (Le Grutier annonce : une
--     case grisee qui promet depuis des mois dit surtout qu'il ne se
--     passe rien) ;
--   - cent trente lignes de menu — choix du camp, banderole, style de
--     cortege, apercu anime, horloge de l'apercu ;
--   - cent neuf lignes de feuille de style (#mnu.cdn, .cdnj) ;
--   - les branches « cordon » dans mnuMaj, mnuHaut, mnuOuvrir,
--     ouvrirBorne, mettreEnPause et la largeur de la zone de manche ;
--   - les sept fichiers de la rue isometrique.
--
-- CE QU'ON N'A PAS TOUCHE, et pourquoi : MOTEUR.ferme. Il n'est pas
-- dans BORNES, il a sa propre page ferme.html avec son ferme.js, et
-- fmBoutons est appele depuis fermerBorne. Le retirer aurait risque de
-- casser une page pour zero benefice visible.
--
-- UNE ERREUR DE TEST, PAS UNE REGRESSION. Le scenario d'arcade levait
-- « Cannot read properties of undefined » dans MOTEUR.hangar.pas : il
-- force S.phase='jeu' sans passer par prendreJeton, donc la liste des
-- zombies n'existe pas. Verifie sur une copie de l'etat PRECEDENT :
-- la meme erreur s'y produisait. Quand un test casse apres une
-- suppression, le rejouer sur l'avant coute deux minutes et evite une
-- heure de chasse.
--
-- Le code du Cordon reste dans l'historique git, et LE-CORDON.md garde
-- la trace de ce qui a ete construit.

/* =====================================================================
   ETAPE : UNE BORNE LEGERE DANS LA SALLE — LE PORTIQUE   2026-10-28-0700
   =====================================================================

   CE QU'ON CHERCHAIT. Une partie de trente secondes, un seul pouce, une
   mort nette et l'envie immediate de recommencer. Le Hangar demande
   qu'on s'installe ; il manquait la borne qu'on prend en entrant.

   LE JEU. On est a la grue. Le chariot va et vient, le conteneur se
   balance au bout du cable, un tap le lache. Toute la difficulte tient
   dans la vitesse qu'il emporte au moment du lacher.

   POURQUOI LE PENCHANT ET PAS LA DECOUPE. Les jeux d'empilage coupent ce
   qui depasse : la cible retrecit jusqu'a disparaitre, et la partie se
   termine parce qu'il n'y a plus rien a viser. Ici le conteneur garde sa
   taille et chaque decalage ajoute du couple. On VOIT le danger monter —
   et on peut le rattraper : un conteneur pose dans l'axe, un « carreau »,
   redresse la pile de moitie. Il existe donc une facon de se sortir d'une
   mauvaise serie, et c'est ce qui fait relancer.

   ---------------------------------------------------------------------
   TROIS CHOSES MESUREES, TROIS CORRECTIONS
   ---------------------------------------------------------------------

   LE REPERE MONTRAIT L'APLOMB, PAS L'ARRIVEE. Un robot qui visait
   l'aplomb du conteneur pendu au pixel pres a pose quatorze conteneurs
   sans obtenir un seul carreau. Le conteneur emporte la vitesse du
   chariot : il derive d'une dizaine de pixels pendant sa chute, plus de
   la moitie de sa demi-largeur. Viser juste etait donc PUNI. Le repere
   calcule maintenant le point d'arrivee (meme fonction que le lacher,
   ils ne peuvent plus se contredire), et le meme robot fait huit a neuf
   carreaux sur onze poses. La difficulte n'a pas baisse : le point
   d'arrivee file sur le cote pendant que le chariot roule, il faut
   toujours anticiper — mais on voit ce qu'on vise.

   LA DERIVE DU PENCHANT ETAIT QUADRATIQUE. Le premier reglage accumulait
   une vitesse de penchant : une pile a 0,44 — un seul conteneur pose de
   travers — s'ecroulait en moins d'une seconde. Remplacee par une
   croissance proportionnelle au penchant lui-meme : elle double en douze
   secondes depuis la moitie, et laisse encore deux secondes pour placer
   le carreau qui sauve quand on frole le bord. Avec une zone morte sous
   un huitieme, sans quoi une pile presque droite tombait toute seule au
   bout de deux minutes sans que le joueur puisse comprendre pourquoi.

   LA PILE SORTAIT DE L'ECRAN. Deux causes qui s'additionnaient : la
   camera ne suivait que la hauteur, alors que chaque pose decale un peu
   la pile — trente pixels de serpentin au bout de dix etages ; et
   l'inclinaison pivotait autour du PREMIER bloc, si bien qu'a cinquante
   etages un penchant de cinq degres emportait le sommet a plusieurs
   largeurs de conteneur. La camera suit desormais aussi le cote (plus
   lentement que la hauteur : un recadrage aussi vif qu'on pose donne le
   mal de mer), et le pivot est le douzieme bloc sous le sommet — bras de
   levier constant, inclinaison lisible, pile toujours dans le cadre.

   ---------------------------------------------------------------------
   LE BOGUE DU SHELL QUE CETTE BORNE A REVELE
   ---------------------------------------------------------------------

   ouvrirBorne faisait :
       var deux=(BORNE.manches && BORNE.manches!=='une');
       ...classList.toggle('on', deux);

   Pour une borne SANS manche du tout, cette expression rend undefined —
   et classList.toggle, quand son second argument n'est pas un booleen,
   l'ignore et BASCULE la classe. La zone de manche droite s'allumait
   donc toute seule ; comme elle couvre la moitie de l'ecran en z-index 3,
   elle avalait toutes les tapes destinees au canvas et la borne ne
   repondait plus au doigt. Le Hangar ne l'avait jamais montre : son
   manches:'une' rend deja un booleen. Un double point d'exclamation
   suffit, mais il a fallu demander au navigateur QUI etait sous le doigt
   (elementFromPoint) pour le voir — l'evenement n'arrivait jamais, donc
   aucune trace cote moteur. Un evenement qui ne parvient pas ne se
   signale pas tout seul.

   ---------------------------------------------------------------------
   COTE BASE : voir sql/arcade_portique.sql. Deux fonctions seulement,
   la liste blanche des bornes et le plafond de vraisemblance.
   ===================================================================== */

/* =====================================================================
   ETAPE : UN TOUR DE QUALIFICATION — LA POLE          2026-10-28-0820
   =====================================================================

   LE JEU TIENT DANS UN GESTE. Doigt pose : le frein. Doigt leve : plein
   gaz. Pas de volant, pas de rapport. Ce n'est pas un appauvrissement,
   c'est le sujet : en qualification, ce qui separe deux pilotes tient
   presque entierement dans le point de freinage, et une direction au
   pouce sur un telephone ne produit qu'une voiture qui zigzague pendant
   que le joueur corrige sa propre imprecision au lieu de lire la piste.

   LA TRAJECTOIRE EST TENUE PAR LA VOITURE — tant qu'elle en a les
   moyens. Arriver trop vite dans un virage ne fait pas « tourner moins
   bien » : elle ELARGIT, visiblement, vers l'exterieur, et c'est au
   joueur de lever le pied pour la ramener. La faute se voit venir et se
   rattrape ; seule la sortie franche annule le tour.

   LE DELTA EST LE JEU. On note, pour chaque segment du circuit,
   l'instant ou on l'a atteint ; le meilleur tour laisse son ruban, et la
   difference se lit en permanence a l'ecran. Un chrono seul ne dit rien
   pendant qu'on roule. Le delta, lui, transforme chaque erreur en
   information immediate, et on sait toujours, a deux virages de
   l'arrivee, si le record va tomber. Le ruban est garde d'une partie a
   l'autre : c'est contre soi-meme qu'on joue d'abord.

   LE CIRCUIT NE CHANGE JAMAIS. Un trace tire au sort rendrait les
   chronos incomparables, donc le tableau du port absurde et le delta
   impossible. Dix-neuf morceaux, onze virages nommes — l'Estaque,
   l'epingle du Phare, la Corniche, le Crochet — et une courbure qui
   s'ouvre et se referme sur un quart de chaque morceau : un virage pose
   d'un coup se lit comme un mur.

   ---------------------------------------------------------------------
   TROIS ERREURS, MESUREES PUIS CORRIGEES
   ---------------------------------------------------------------------

   LA PISTE NE SE DESSINAIT PAS DU TOUT. Un aplat vert sous un ciel. La
   projection portait des divisions par PL_ROUTE et PL_CAMH ajoutees
   « pour ajuster » : elles annulaient exactement l'echelle. La forme
   juste est celle de tous les jeux de route en fausse 3D, et il n'y a
   rien a regler dedans :
       echelle      = profondeur / distance
       x ecran      = L/2 * (1 + echelle * ecart lateral)
       y ecran      = H/2 * (1 - echelle * ecart vertical)
       demi-largeur = echelle * demi-route * L/2
   L'horizon se place alors tout seul a mi-hauteur : c'est la que la
   projection envoie un point infiniment loin. Le poser ailleurs — il
   etait a 40 % — fait flotter la piste au-dessus du ciel.

   LE TABLEAU DE BORD MENTAIT DANS LES VIRAGES. prochain() renvoyait le
   PREMIER segment courbe devant soi. Comme un virage s'ouvre
   progressivement, ses premiers segments ont une courbure faible et donc
   une vitesse limite elevee : a l'approche de l'epingle du Phare,
   l'ecran annoncait paisiblement 220 km/h alors qu'il fallait deja etre
   a 90 trente metres plus loin. Le pilote-robot sortait systematiquement
   au meme endroit — et un joueur aurait fait pareil en se croyant trahi.
   On cherche desormais, sur toute la fenetre visible, le segment qui
   contraint le plus MAINTENANT : pour chacun, la vitesse maximale qu'on
   peut encore avoir ici est racine(v_limite^2 + 2 * frein * distance),
   et on garde la plus petite. C'est ce que fait un pilote quand il
   regarde loin dans le virage au lieu de regarder son capot.

   ON PILOTAIT UNE VOITURE CACHEE DERRIERE SON TABLEAU DE BORD. Le bloc
   « prochain virage », la pedale et les secteurs occupaient trois etages
   du bas de l'ecran, c'est-a-dire exactement la place de la monoplace.
   Le bas appartient desormais a la voiture, le haut a l'information, et
   tout le chrome du bas tient dans une bande de vingt-deux pixels.

   ---------------------------------------------------------------------
   CE QUE LE SHELL A GAGNE
   ---------------------------------------------------------------------

   tape() ne dit que l'instant du contact. Une borne ou l'on MAINTIENT —
   le pied sur le frein — a besoin de savoir quand ca commence et quand
   ca finit. Deux points d'entree ont donc ete ajoutes, presse() et
   leve(), separes de tape() a dessein : sans quoi un tap bref passerait
   pour un appui long, et un doigt qui bouge d'un pixel pendant qu'on
   freine laisserait le frein colle au plancher. leve() est appele au
   lever du doigt, a l'annulation du contact par le systeme (un appel qui
   arrive, l'ecran qui tourne) et a la perte de focus de la fenetre : un
   frein reste coince est pire qu'un frein qui ne repond pas.

   ---------------------------------------------------------------------
   COTE BASE : voir sql/arcade_pole.sql.
   ===================================================================== */

/* =====================================================================
   ETAPE : VUE DE DESSUS, ON TOURNE — LE CIRCUIT        2026-10-28-0940
   =====================================================================

   CE QU'ON VIENT CHERCHER : rouler. Pas un chrono deguise, pas une
   gestion de course — tenir une monoplace sur un trace et tourner.

   LE VOLANT TIENT DANS DEUX POUCES. Moitie gauche de l'ecran : braque a
   gauche. Moitie droite : braque a droite. Les deux ensemble : frein. Et
   rien du tout veut dire plein gaz. Aucun glissement a doser, aucun
   bouton a viser — on joue d'une main dans le metro et a deux mains
   quand on veut etre precis. C'est le schema des jeux de course vus de
   dessus depuis toujours, et il n'a pas ete ameliore depuis.

   DEUX VECTEURS, PAS UN. Faire avancer la voiture dans la direction ou
   elle pointe donne un jouet sur rail : rien ne derape, il n'y a plus
   rien a piloter. On garde donc SEPAREMENT l'orientation du chassis et
   le vecteur vitesse, et l'adherence ne fait que rapprocher le second de
   la premiere. Trop de vitesse en virage, et l'ecart ne se resorbe plus
   assez vite : le nez pointe a l'interieur pendant que la voiture part a
   l'exterieur. Le coefficient d'adherence est tout le caractere de la
   voiture, et il tombe de moitie sur l'herbe.

   LE CIRCUIT EST PEINT UNE FOIS dans une image hors ecran, et on en
   decoupe ce qu'on voit. Repeindre huit cent quarante points de trace a
   chaque image coute cher pour un decor immobile, et surtout cela
   interdit les details — vibreurs, bacs a sable, bandes de tonte,
   tribunes — qui font qu'on reconnait un endroit du circuit.

   LE FANTOME EST LA RECOMPENSE : une voiture translucide rejoue le
   meilleur tour, et on la double ou on la perd de vue. C'est plus
   parlant qu'un delta chiffre — on voit son retard sous la forme d'une
   voiture qui s'eloigne.

   ---------------------------------------------------------------------
   LE BOGUE QUI A COUTE LE PLUS DE TEMPS : LE MUR DE GLU
   ---------------------------------------------------------------------

   Une limite entourait le trace, loin derriere l'herbe, pour empecher
   une voiture egaree de partir a l'autre bout du monde. Elle replacait
   le chassis sur le cercle limite ET multipliait toute la vitesse par
   0,35 — a chaque image. Une voiture qui poussait dedans perdait donc
   soixante-cinq pour cent de son elan soixante fois par seconde.

   LA MESURE : apres une sortie, la voiture restait a 0,0014 pixel par
   milliseconde pendant douze secondes. Plaquee, sans aucun moyen de
   repartir. Le pilote-robot ne bouclait pas un seul tour en
   quatre-vingt-seize secondes, et rien dans les chiffres ne disait
   pourquoi — il fallait regarder la vitesse ET la position hors piste
   ensemble pour comprendre.

   LA CORRECTION : on ne tue plus que ce qui POUSSE VERS LE DEHORS. La
   composante le long de la limite est conservee, donc la voiture glisse
   contre le bord au lieu de s'y coller, et braquer vers l'interieur
   suffit a s'en degager. C'est ce que fait un rail de securite ; un mur
   de glu n'existe nulle part. L'herbe a ete adoucie dans le meme
   mouvement — a 0,42 de couple et sept pour cent de frottement par
   image, une voiture sortie ne revenait plus jamais sur la piste.

   ---------------------------------------------------------------------
   DEUX VERIFICATIONS QUI ONT EVITE DES BOGUES SILENCIEUX
   ---------------------------------------------------------------------

   LE TRACE SE CROISE-T-IL ? Le mini-plan dessine une forme en sablier,
   et deux portions de piste superposees auraient rendu la detection de
   sortie incoherente sans jamais lever d'erreur. Verifie par le calcul
   plutot que suppose : les deux portions les plus eloignees LE LONG du
   trace mais les plus proches dans l'espace sont a 149 pixels l'une de
   l'autre, pour une piste large de 46. Aucun chevauchement.

   LE PILOTE-ROBOT EST PASSE DANS LA PAGE. Pilote depuis le script de
   test, chaque commande coutait un aller-retour : le robot reagissait
   avec un retard de plusieurs images et ne tenait pas la route, ce qui
   donnait l'illusion d'un jeu injouable. Greffe sur pas(), il est
   cadence par la boucle du jeu elle-meme et boucle ses tours. Un test
   trop lent pour le jeu qu'il mesure ne mesure que lui-meme.

   ---------------------------------------------------------------------
   TROIS TOURS, PAS CINQ. Un tour demande vingt-huit secondes a un robot
   prudent, une vingtaine a qui sait ou freiner. Cinq tours faisaient une
   partie de deux minutes et demie : c'est une course, pas une borne.

   LES LIVREES SONT INVENTEES, et les noms aussi — le Mistral, la
   Calanque, le J4, le Mole, la Criee. Reproduire les couleurs d'une
   ecurie reelle, c'est reproduire sa marque. Le style est celui de la
   planche de reference ; les voitures sont a nous.

   CE QUE LE SHELL A GAGNE : doigts(). presse() et leve() ne parlent que
   d'un contact a la fois ; une borne qui commande a gauche et a droite
   en meme temps ne peut rien en faire. Le shell passe desormais la liste
   complete des doigts poses a chaque changement, y compris quand un
   doigt glisse d'un camp a l'autre, et la vide a la perte de focus —
   sans quoi un telephone qui recoit un appel pendant qu'on braque
   revient avec le volant bloque.

   COTE BASE : voir sql/arcade_circuit.sql.
   ===================================================================== */

/* =====================================================================
   ETAPE : LE VOLANT DEVIENT ANALOGIQUE — LE CIRCUIT    2026-10-28-1050
   =====================================================================

   LE PROBLEME, DIT SIMPLEMENT : on ne pouvait pas PLACER la voiture. Le
   braquage ne connaissait que trois etats — a fond a gauche, a fond a
   droite, tout droit — si bien qu'on jetait la monoplace d'un bord a
   l'autre et qu'on passait son temps a corriger la correction
   precedente. Ce qui manquait n'etait pas de la precision de doigt,
   c'etait une COMMANDE PROGRESSIVE.

   ---------------------------------------------------------------------
   CE QUI A CHANGE
   ---------------------------------------------------------------------

   LE BRAQUAGE SUIT LA POSITION DU POUCE. Chaque doigt vaut desormais sa
   distance au milieu de l'ecran : pres du centre, une touche de volant ;
   contre le bord, braquage complet. Une zone morte de treize pour cent
   au milieu empeche un pouce pose la par hasard de faire devier la
   voiture. Verifie au doigt, pouce par pouce : x=120 donne -0,29,
   x=60 donne -0,65, x=8 donne -0,95.

   ON FAIT LA SOMME DES DOIGTS, et c'est ce qui rend le frein utilisable
   en virage. Deux pouces symetriques s'annulent — frein tout droit —
   tandis qu'un pouce au bord gauche et un autre juste a droite du centre
   donnent une consigne de -0,81 AVEC le frein : on freine en tournant,
   sans rien de plus a apprendre.

   LE VOLANT TOURNE, IL NE SAUTE PAS. Un angle qui passe de zero au
   maximum en une image donne une voiture sans poids ou la moindre
   pression devient une embardee. Le volant rejoint sa consigne en un
   dixieme de seconde, et il se REDRESSE plus vite qu'il ne braque —
   comme un vrai volant qu'on lache, et parce que c'est ce qui sauve d'un
   tete-a-queue quand on panique et qu'on retire les pouces.

   LE FREIN CHARGE L'AVANT. Freiner en entree de virage fait mordre les
   roues directrices : l'efficacite du braquage monte de trente-huit pour
   cent et l'adherence avec. C'est la seule chose que fait un pilote et
   qu'un jeu oublie presque toujours de rendre, et c'est pourtant elle
   qui donne envie de refaire le virage.

   LE CONTRE-BRAQUAGE RATTRAPE. Quand le volant pointe a l'oppose de la
   derive, les roues reprennent quarante pour cent de prise. Sans cette
   ligne, un derapage etait une condamnation, et le joueur n'avait qu'une
   seule chose a faire : ne jamais glisser, c'est-a-dire ne jamais
   attaquer.

   LA CAMERA REGARDE PLUS LOIN QUAND ON VA VITE. A distance fixe, on
   arrivait sur les virages rapides sans les avoir vus.

   LES GOMMES. Deux traces noires derriere les roues arriere quand ca
   glisse, qui restent trois secondes au sol. C'est le seul retour qui
   apprenne vraiment a doser, parce qu'on le lit au tour suivant.

   ---------------------------------------------------------------------
   LA MESURE
   ---------------------------------------------------------------------

   Le meme pilote-robot, sur le meme trace, avec pour seule difference
   qu'il DOSE au lieu de braquer a fond :

       avant   28,02  27,83  27,83   —  meilleur 27,832 s  —  3 042 pts
       apres   26,30  26,00  26,02   —  meilleur 25,999 s  —  3 500 pts

   Une seconde huit par tour, six virgule six pour cent. Et c'est le
   plancher du gain : un robot applique une regle, un joueur sent le
   point ou la voiture commence a glisser et joue avec. Le dosage lui est
   desormais accessible ; il ne l'etait pas du tout avant.

   ---------------------------------------------------------------------
   DEUX LECONS DE METHODE
   ---------------------------------------------------------------------

   LE BANDEAU DOIT DIRE QUE LA COMMANDE EST GRADUEE. Deux moities qui
   s'allument en bloc laissaient croire a un braquage tout ou rien — et
   un joueur qui croit ca pose son pouce n'importe ou dans la moitie,
   donc toujours au maximum. Des graduations qui grandissent vers le bord
   et s'eclairent une a une montrent la gradation sans un mot. Elles
   restent visibles AU REPOS : a sept pour cent de blanc elles
   disparaissaient sur l'herbe claire, et le bandeau ne disait plus rien
   tant qu'on n'avait pas deja le doigt dessus.

   UN SCRIPT DE TEST PERIME MENT COMME UN BOGUE. Le script de capture
   pilotait encore en posant s.gauche et s.droite ; avec le volant
   analogique, la consigne restait a zero et la voiture allait tout
   droit. Pendant une minute, le jeu a eu l'air casse alors que seul le
   robot l'etait. Quand la commande change, les robots changent avec.
   ===================================================================== */

/* =====================================================================
   ETAPE : CINQ TRACES, DOUZE MONOPLACES — LE CIRCUIT   2026-10-28-1210
   =====================================================================

   ---------------------------------------------------------------------
   POURQUOI DOUZE LIVREES ET NON DOUZE COULEURS
   ---------------------------------------------------------------------
   Repeindre la meme carrosserie en douze teintes ne donne pas douze
   voitures : a trente pixels de haut et vue de dessus, l'oeil ne retient
   qu'une tache coloree, et deux ecuries de bleu voisin sont la meme
   voiture. Chaque livree porte donc un MOTIF — bande centrale, chevrons
   sur le nez, damier sur les pontons, fleche, diagonale, pois, cercles,
   bicolore avant-arriere — applique au sprite pixel par pixel par une
   fonction qui repond, pour chaque point de carrosserie : es-tu du
   motif ? C'est la forme qui distingue ; la couleur ne fait que
   confirmer.

   LES LIVREES SONT INVENTEES, et les noms aussi — le Mistral, la
   Calanque, le J4, le Phoceen, le Bora, le Mole, Saint-Jean, la Criee,
   Endoume, le Frioul, Panier, Sormiou. Reproduire les couleurs d'une
   ecurie reelle, c'est reproduire sa marque.

   ---------------------------------------------------------------------
   POURQUOI CINQ TERRAINS ET NON CINQ BOUCLES
   ---------------------------------------------------------------------
   Cinq traces sur le meme fond vert sont cinq fois le meme circuit : on
   ne reconnait pas ou on est, donc on n'apprend rien, donc on ne
   progresse pas. Chacun a son sol, ses obstacles et ses vibreurs :
   l'herbe et le sable du Port, la mer et les palmiers de la Corniche,
   la roche et les falaises des Calanques, le beton, les conteneurs et
   les vibreurs jaunes de la Friche, les pins sombres de la Pinede.
   Reconnaitre un endroit est la condition pour y freiner au bon moment.

   LES TRACES ONT ETE VERIFIES AVANT D'ETRE DESSINES. Deux portions de
   piste superposees rendraient la detection de sortie incoherente sans
   jamais lever d'erreur. Les cinq sont passes au calcul : le plus serre
   laisse 149 pixels entre deux portions eloignees le long du trace, pour
   une piste large de 46, et tous tiennent dans leur cadre.

   ---------------------------------------------------------------------
   LE SCORE EST NORMALISE PAR TRACE
   ---------------------------------------------------------------------
   C'est la correction la moins visible et la plus necessaire. Mesure
   faite, le meme pilote-robot boucle :

       LA CORNICHE    19,92 s     LA FRICHE      21,90 s
       LES CALANQUES  22,68 s     LA PINEDE      24,72 s
       LE PORT        26,00 s

   Avec l'ancienne formule — (40 000 - chrono) / 4 — ce meme pilote
   marquait 5 021 points sur la Corniche et 3 500 sur le Port : quarante-
   trois pour cent d'ecart pour le seul choix du trace. Le tableau du
   port aurait recompense le circuit le plus court au lieu du meilleur
   pilotage, tout le monde aurait couru la Corniche, et les quatre autres
   n'auraient plus servi a rien.

   Chaque trace porte donc son temps de reference, et le chrono est
   ramene a l'echelle du Port avant d'etre compte. Verifie : le meme
   pilote marque 3 500 partout, et un pilote vingt pour cent plus rapide
   marque 4 800 partout. On choisit son circuit pour celui qu'on aime,
   pas pour celui qui paie.

   COTE BASE : le plafond de vraisemblance passe de 130 a 180 points par
   seconde — un pilote quarante pour cent plus rapide que la reference
   atteindrait 6 100 points en une quarantaine de secondes.

   ---------------------------------------------------------------------
   L'ECRAN DE CHOIX VIENT APRES LE JETON
   ---------------------------------------------------------------------
   Et c'est voulu : dans une salle d'arcade on met la piece, puis on
   choisit sa machine — c'est le moment ou l'on prend le temps de
   regarder, parce qu'on a deja paye. Le mettre avant obligerait a
   decider a vide, sans savoir si on va jouer. Le trace et la monoplace
   choisis sont gardes d'une partie a l'autre, et le record est garde PAR
   TRACE, avec son fantome.

   DEUX LECONS DE MISE EN PAGE :

   LES POSITIONS SE CALCULENT DEPUIS LE BAS. Elles etaient des fractions
   d'une hauteur supposee de 422 pixels ; la scene en fait 318 sur un
   telephone ordinaire. Le resume et le bouton remontaient dans la
   derniere rangee de voitures, et trois lignes de texte se retrouvaient
   ecrites par-dessus des monoplaces. Le bouton, le resume et les grilles
   s'empilent desormais a partir du bas, ou tout doit tenir.

   LE NOM SE POSE SOUS LA VIGNETTE, pas dessus : ecrit par-dessus le
   trace, il etait illisible sur la roche claire comme sur l'herbe
   sombre — et c'est pourtant le seul endroit ou l'on apprend comment
   s'appelle le circuit qu'on regarde.

   ET UNE DE DESSIN : dessinerSprite tourne deja le sprite. Une rotation
   posee en plus sur le contexte les additionnait, et les monoplaces de
   la banniere roulaient de travers.
   ===================================================================== */

/* =====================================================================
   ETAPE : LE MENU DEVIENT UN PADDOCK — LE CIRCUIT      2026-10-28-1420
   =====================================================================

   CE QU'ON REGARDE DANS UN JEU DE COURSE, c'est sa voiture. L'ancien
   menu en montrait douze a la taille d'un timbre dans une grille de
   quatre colonnes : on voyait douze taches colorees, pas douze
   monoplaces, et le choix se faisait au hasard. La voiture choisie
   occupe desormais le milieu de l'ecran a quatre fois sa taille, sous un
   projecteur, avec son ombre portee et un reflet qui balaye lentement sa
   carrosserie — trois lignes de code pour qu'elle cesse d'etre une image
   collee et devienne un objet pose sous une lampe.

   LES DEUX VOISINES RESTENT VISIBLES de chaque cote, en retrait et a
   seize pour cent d'opacite : on sait qu'il y en a d'autres sans
   qu'elles volent l'attention. Sans elles, rien ne dit qu'on peut
   defiler.

   QUATRE FACONS DE CHANGER, parce qu'un menu ou l'on ne devine pas le
   geste est un menu ferme : les fleches sur les cotes, le bandeau ou la
   scene touches a gauche ou a droite de leur milieu, les pastilles pour
   aller directement, et le GLISSEMENT — qui est le geste qu'on essaie
   d'abord devant une rangee d'objets, et qui ne coute que quelques
   lignes. Viser une fleche de huit pixels au pouce est une epreuve ; on
   accepte donc le bandeau entier, puisque rien d'autre ne s'y trouve.

   L'ECHELLE DE LA MONOPLACE SE DEDUIT DE LA PLACE. A quatre fois sa
   taille en dur, elle debordait sur les petits ecrans : le facteur se
   calcule maintenant a partir de la hauteur de scene disponible et de la
   largeur, et il descend a deux si besoin.

   ---------------------------------------------------------------------
   LE PIEGE QUI A FAIT PERDRE LE PLUS DE TEMPS
   ---------------------------------------------------------------------

   REMPLACER UNE METHODE SANS SUPPRIMER L'ANCIENNE NE REMPLACE RIEN. Le
   nouveau ecranChoix a ete insere plus haut dans l'objet litteral, et
   l'ancien est reste en place quelques dizaines de lignes plus bas.
   En JavaScript, dans un objet litteral, c'est la DERNIERE definition
   d'une cle qui gagne : le menu dessine etait donc l'ancien, qui
   cherchait des zones (z.cir, z.ecu) que la nouvelle mise en page ne
   produit plus — « Cannot read properties of undefined ».

   Et le piege est sournois : tous les tests de commande passaient. Les
   fleches, les pastilles, le glissement, le bouton EN PISTE repondaient
   parfaitement, parce que zones() et tape(), eux, etaient bien les
   nouveaux. Seul le DESSIN etait l'ancien. Un test qui ne verifie que
   les reponses d'un ecran peut le declarer bon alors qu'il ne s'affiche
   pas du tout — c'est la trace d'erreur JS, pas le resultat des tapes,
   qui a trahi la chose.
   ===================================================================== */

/* =====================================================================
   CORRECTION : DEUX BOUTONS A LA FOIS                 2026-10-28-1510
   =====================================================================

   CE QUE LE JOUEUR VOYAIT : le paddock, son bouton EN PISTE, et
   juste en dessous le bandeau du shell avec « Un jeton, et c'est
   parti » et COMMENCER. Deux boutons, dont un seul marchait.

   DEUX CAUSES, QUI S'ADDITIONNAIENT.

   1. LE PADDOCK S'AFFICHAIT AVANT LE JETON. La condition de dessin
      disait « si la phase est prep OU BIEN s'il n'y a pas encore
      d'image » — or il n'y a pas d'image avant le jeton. Le second
      terme etait un filet pose pour le cas ou le circuit ne serait pas
      charge ; il attrapait en realite tout l'ecran d'accueil. La phase
      de preparation a maintenant son ecran, et l'avant-jeton le sien.

   2. LE PLEIN ECRAN NE COUVRAIT QUE LA PHASE DE JEU. majPlein() posait
      la classe « plein » sur la seule phase 'jeu' : pendant la
      preparation, le bandeau du shell — message, boutons, tableau de la
      borne — restait sous le canvas. Une borne qui dessine un ecran
      entier avant de partir compte desormais comme du jeu.

   L'ECRAN D'AVANT-JETON EST A PART, et ne depend d'aucun circuit
   charge : la version precedente passait par chrome(), lequel lit le
   nom du trace choisi — qui n'existe pas encore a ce moment-la. Il
   montre une monoplace sous le projecteur, qui change toute seule
   toutes les secondes et demie : l'ecran d'attente montre ce qu'il y a
   dedans au lieu de le raconter.

   LA VERIFICATION PORTE SUR CE QUE LE JOUEUR VOIT, pas sur l'etat
   interne : pour chaque phase, on lit la classe « plein », le texte du
   message, la liste des boutons du DOM et la visibilite du tableau.

       avant le jeton   plein non   COMMENCER            tableau visible
       pendant le choix plein OUI   aucun bouton         tableau cache
       en course        plein OUI   aucun bouton         tableau cache
       a l'arrivee      plein non   LE MENU / ENCORE     tableau visible
   ===================================================================== */

/* =====================================================================
   ETAPE : LE CO-PILOTE ET LES SURFACES — LE CIRCUIT   2026-10-28-1640
   =====================================================================

   Deux emprunts a Rush Rally Origins, le meilleur jeu de course vu de
   dessus pense pour le pouce.

   ---------------------------------------------------------------------
   LE CO-PILOTE
   ---------------------------------------------------------------------
   Il annonce la SEVERITE du virage suivant, pas seulement sa distance.
   Dans un jeu ou l'on apprend un trace pour gratter des dixiemes, cela
   change tout le rythme : on attaque au lieu de decouvrir.

   LA FLECHE EST L'INFORMATION, le reste est du confort. Son rayon dit la
   severite — plus le virage est serre, plus elle est repliee — et c'est
   elle qu'on lit du coin de l'oeil a pleine vitesse. Le chiffre et le
   mot servent a apprendre le vocabulaire, la couleur a trancher entre
   « leve le pied » et « passe ». L'enchainement est annonce en petit
   quand un second virage suit de pres : c'est lui qui permet de preparer
   la sortie du premier en fonction du second.

   IL PARLE DEUX SECONDES ET DEMIE AVANT, a la vitesse du moment : la
   fenetre se deplace donc quand on va plus vite, comme un vrai co-pilote
   qui anticipe davantage dans les lignes droites.

   LE CARNET EST MESURE, PAS ECRIT A LA MAIN. Cinq traces font
   quarante-et-un virages ; les annoter a la main, c'est quarante-et-une
   occasions de se tromper, et tout est a refaire des qu'un point de
   controle bouge. On mesure de combien le cap tourne sur six points, on
   groupe les plages au-dessus d'un seuil, on fusionne ce qui s'enchaine,
   et le maximum de chaque plage donne la note.

   ET LES SEUILS AUSSI SONT MESURES. Premiere version calibree a vue :
   les Calanques rendaient NEUF VIRAGES SUR NEUF notes « epingle »,
   c'est-a-dire aucune information. On a releve la courbure maximale des
   quarante-et-un virages, puis coupe en six parts de taille voisine.
   Les rayons qui en decoulent sont parlants pour une piste large de 38 a
   52 pixels : note 1 sous 39 px de rayon — plus serre que la piste n'est
   large — puis 46, 60, 86, 218. Le profil obtenu colle enfin a ce que
   chaque trace annonce :

       LE PORT        2 epingles, 3 moyens, 2 longs, 2 legers
       LA CORNICHE    aucune epingle, 1 serre, 3 longs   (« rapide »)
       LES CALANQUES  2 epingles, 5 tres serres, 2 serres, rien d'ouvert
       LA FRICHE      reparti sur les six notes
       LA PINEDE      reparti sur les six notes

   ---------------------------------------------------------------------
   LES SURFACES
   ---------------------------------------------------------------------
   Une piste d'une seule matiere se conduit partout pareil, et un trace
   n'a alors de caractere que sa forme. Cinq matieres, chacune avec son
   adherence : asphalte 100 %, paves 90 %, terre 74 %, mouille 68 %,
   gravier 60 %. Le couple moteur passe moins bien aussi, et les paves
   comme le gravier font trembler.

   ELLES DOIVENT SE VOIR DE LOIN. Une nuance de gris ne previent
   personne : on arrive dessus a pleine vitesse sans comprendre pourquoi
   la voiture part. Chaque matiere a donc sa teinte franche et son grain
   — cailloux du gravier, sillons de la terre, joints des paves, reflets
   du mouille — et une LIGNE DE TRANSITION en damier marque l'entree et
   la sortie de chaque portion.

   Le co-pilote annonce la matiere et son adherence, a gauche sous le nom
   de l'ecurie : le milieu de l'ecran lui appartient deja, et deux textes
   superposes ne se lisent ni l'un ni l'autre.

   ---------------------------------------------------------------------
   DEUX LECONS
   ---------------------------------------------------------------------

   UNE FLECHE SE DESSINE D'UN SEUL CENTRE. La premiere version calculait
   le centre de l'arc d'un cote et la pointe de l'autre : les deux
   morceaux ne se rejoignaient pas, et la fleche ressemblait a deux
   signes poses cote a cote.

   UN TEST MAL ECRIT DECLARE DES ANOMALIES QUI N'EXISTENT QUE DANS LUI.
   Le controle des surfaces cherchait le premier et le dernier index
   d'une matiere pour se placer au milieu — mais deux portions separees
   d'une meme matiere donnent un milieu situe ENTRE elles, donc sur une
   autre matiere. Le test annoncait « terre lue comme asphalte » sur une
   portion parfaitement correcte. On prend desormais la premiere portion
   contigue.
   ===================================================================== */

/* =====================================================================
   ETAPE : LE PIXEL FIN — LE CIRCUIT                   2026-10-28-1830
   =====================================================================

   LE VERROU N'ETAIT PAS LE DESSIN, C'ETAIT LA RESOLUTION. On avait
   travaille le decor, les livrees, les surfaces — et chaque amelioration
   butait sur le meme plafond : cent-quatre-vingt-quinze pixels de scene.
   A cette taille, une monoplace en fait dix-huit, et il n'y a pas la
   place d'y mettre autre chose qu'une silhouette.

   cadrer() imposait un plancher de DEUX POINTS PAR PIXEL. C'etait un
   choix — le gros pixel fait le style de la salle — mais applique a
   toutes les bornes sans exception. Une borne peut desormais demander le
   pixel fin (echMin:1) ; les autres gardent le plancher et ne voient
   aucune difference, ce qui a ete verifie sur Le Portique.

   LE CIRCUIT PASSE DONC A 390 x 844, soit QUATRE FOIS PLUS DE PIXELS.
   Pour garder exactement le meme cadrage — la meme portion de piste
   visible, la meme sensation de vitesse — tout le monde est double : la
   longueur des traces, la largeur de piste, la taille de la voiture, les
   vitesses. Rien ne change pour le joueur sinon la finesse.

   ---------------------------------------------------------------------
   CE QUE LES PIXELS EN PLUS PERMETTENT
   ---------------------------------------------------------------------

   LA MONOPLACE EN 36 x 62. On ne la dessine plus ligne par ligne : on
   decrit la LARGEUR de la carrosserie a chaque hauteur, et le contour,
   le degrade et les creux se deduisent. Le volume vient du degrade
   lateral — clair au sommet de la courbe, sombre pres des aretes — et
   c'est la seule chose qui separe une decoupe de papier d'un objet pose
   sous une lumiere. Une monoplace n'est pas une goutte : c'est un nez
   tres fin, une RUPTURE nette au cockpit, puis des pontons presque
   paralleles. Un profil regulier donnait une poire. Et les bras de
   suspension, deux pixels chacun, transforment quatre rectangles gris en
   train roulant.

   LE SOL EN CINQ TONS TRAMES. Deux tons alternes par bandes donnaient
   des rayures de pres et un aplat de loin. On ecrit maintenant les
   pixels directement — cinq millions de fillRect prendraient des
   secondes, un seul ImageData prend le dixieme — avec un bruit
   deterministe a trois sinus et le tramage de Bayer pour trancher entre
   deux tons voisins.

   LA PISTE SE PEINT AU TRAIT. Elle etait faite de disques poses tous les
   huit pixels : espaces de huit et larges de dix, ils ne se recouvraient
   qu'a peine et la bordure ressemblait a un collier de perles. Un seul
   chemin ferme, trace avec une epaisseur et des bouts ronds, donne une
   bande continue — et coute moins cher que huit cents disques. Le bitume
   est fait de six traits concentriques, du plus large et sombre au plus
   etroit et clair : un degrade lateral sans lire un seul pixel.

   ET TOUTES LES OMBRES VONT DANS LE MEME SENS. C'est l'unite de
   direction qui fait croire a une lumiere ; trois arbres eclaires chacun
   de son cote donnent un decor en papier decoupe.

   LE COUT, MESURE : la peinture d'un trace passe de 550 a 350
   millisecondes, une seule fois au chargement, pour un canvas de 18 a 22
   Mo. La cadence reste a 60 images par seconde malgre les quatre fois
   plus de pixels a afficher.

   ---------------------------------------------------------------------
   TROIS PIEGES
   ---------------------------------------------------------------------

   UN NOM DE VARIABLE REUTILISE DANS UNE FONCTION LONGUE NE PREVIENT
   JAMAIS. La boucle des trois tons de vibreur s'appelait « cv » — comme
   le canvas du circuit declare cent lignes plus haut. var etant porte
   par toute la fonction, la troisieme dent remplacait l'image par le
   nombre 3. La peinture se terminait sans erreur, et c'est drawImage qui
   se plaignait, trois cents lignes plus loin, de recevoir un nombre.

   LE CHROME SE DESSINE DANS SON PROPRE REPERE. Tous ses textes sont
   dimensionnes en pixels : au pixel fin, ils ont ete divises par deux et
   sont devenus illisibles. Plutot que de multiplier une centaine de
   tailles une a une — et d'en oublier —, on met le repere a l'echelle
   avant de l'appeler. Le chrome continue de croire qu'il travaille sur
   195 par 422, et il a raison : c'est sa vraie unite. Les zones tactiles
   suivent le meme repere, sans quoi le doigt tombe ailleurs que le
   bouton dessine.

   LES TOUFFES D'HERBE NE SE POSENT PAS SUR UNE GRILLE. Parcourir le sol
   de trois en trois les alignait en quadrillage : de loin on ne voyait
   plus l'herbe, on voyait le pas de la boucle.
   ===================================================================== */
