# Le Cordon — comment le lancer, comment le tester

Borne de la salle d'arcade de Battle Dock. Une rue isométrique, une foule
simulée, un cordon à commander.

## Lancer

**En ligne** — battledock.fr → Le Complexe → Salle d'arcade → LE CORDON → JOUER.

**En local** — aucun outil de construction, aucune dépendance à installer :

```
cd battledock.github.io
python3 -m http.server 8897
```

puis `http://127.0.0.1:8897/arcade.html` dans un navigateur, de préférence
en mode téléphone (390 × 844) avec le tactile activé.

## Choisir son camp

Le menu de la borne ouvre sur deux cartes — **LA POLICE** ou **LE CORTÈGE** —
qu'on bascule d'une tape. Le camp choisi est gardé d'une partie à l'autre.
Les objectifs, le briefing, les ordres et le bouton de départ changent avec
lui ; l'autre camp est tenu par l'IA.

| | La police | Le cortège |
|---|---|---|
| But | tenir le passage 2 min 30, 18 passages tolérés | faire passer 12 des siens |
| Ordres | TENIR, AVANT, ARRIÈRE, FORME, GROUPE, GAZ, EAU | POUSSER, RECULER, CASSER, BARRICADE, MOLOTOV, GROUPE, DISPERSER |
| Unités | 3 lignes, une réserve, deux camions | 4 blocs de cortège, les casseurs, les mobiles |

**Déplacer un bloc du cortège.** On tape sa pastille, puis la case visée :
le bloc quitte la marche automatique et s'y rend par le chemin le plus
court. `GROUPE` avec un seul bloc sélectionné le remet dans le rang.
Tant qu'il est parti, le reste du cortège continue d'avancer sans lui.

**La banderole.** Côté cortège, le menu de la borne contient un champ de
saisie, six slogans tout faits et six couleurs de tissu. Le texte est
découpé en mots : chaque banderole du cortège en porte un, et on lit la
phrase en balayant la foule. Les pancartes portent le mot le plus court.
Vingt et un pixels de tissu, c'est cinq caractères — les mots plus longs
sont coupés. Le choix est gardé d'une partie à l'autre.

**Viser.** `MOLOTOV`, `GAZ` et `EAU` ne partent pas au toucher du bouton :
ils **arment la visée**. Un cercle pointillé montre alors la portée de
chaque unité sélectionnée. Ensuite, au choix :

- **taper** une case — ça part là ;
- **poser le doigt et glisser** — une ligne de tir et un réticule suivent
  le pouce, et ça part au relâchement. Le réticule passe à l'orange quand
  la cible est hors de portée : le tir est alors raccourci sur la même
  direction, jamais refusé.

Re-taper le bouton annule. Pendant la visée le glissé vise au lieu de
déplacer la caméra ; le panoramique revient dès que le tir est parti.
Portées : cocktails 7,5 tuiles, grenade 6,5, lance à eau 5,5.

**Les cocktails Molotov.** Un bloc sélectionné en lance trois, à cent
millisecondes d'intervalle, en éventail autour de la direction visée et
jamais au-delà du cordon. Vingt-deux secondes de recharge. Côté score :
+60 par salve pour le cortège, −90 par incendie pour la police.

La bouteille est un sprite peint en huit angles — verre vert, essence au
fond, chiffon enflammé — qui **tourne** en vol, sème des braises et une
fumée derrière elle, et porte une ombre au sol qui rétrécit quand elle
monte : c'est l'ombre, pas la hauteur du dessin, qui dit où elle va
tomber. L'impact se joue en quatre couches : un flash d'un dixième de
seconde en lumière ajoutée, une gerbe de flammes vers le haut, des
éclats de verre qui filent à plat, et une nappe d'essence basse et large
qui s'éteint la première. Plus un bris de verre au son.

**Le feu.** Un foyer brûle trente-quatre secondes, repousse les corps
dans un rayon d'une tuile et demie, et **ne se traverse pas** — ni par
les manifestants, ni par la police. Il tend la rue tant qu'il brûle, pour
les deux camps. Deux foyers voisins fusionnent ; au-delà de huit, le plus
vieux s'éteint. L'événement `ÇA BRÛLE AU MILIEU` allume une benne sur
l'esplanade, à l'écart de l'axe du cortège pour qu'elle gêne sans barrer
le passage.

**Les barricades** : quatre corps sur place pendant six secondes. La police
peut les déloger avant qu'elles tiennent ; une fois debout, la case est
bloquée pour tout le monde.

**L'IA vise aussi** : elle envoie grenade et jet sur le point le plus
chargé de la foule à sa portée, pas droit devant sa formation.

**L'IA** décide sur des règles lisibles, pas sur un minuteur — charger une
barricade en construction, envoyer la réserve sur une devanture qui tombe,
arroser avant de gazer, se replier quand elle est percée, reprendre du
terrain quand la place se dégage. Elle réévalue quatre fois par seconde,
jamais à chaque image.

## Jouer

| Geste | Effet |
|---|---|
| glisser à un doigt | déplacer la caméra |
| pincer à deux doigts | zoomer (s'aimante sur un cran net au relâchement) |
| taper une pastille d'unité | la sélectionner ; une seconde tape la retire |
| `TOUTES` | tout sélectionner |
| taper la carte | y envoyer les unités sélectionnées, en éventail |
| `TENIR` | annuler tout ordre, tenir la position actuelle |
| `AVANT` / `ARRIÈRE` | décaler la figure vers la foule ou en arrière |
| `FORME` | ligne → coin → colonne → nasse |
| `GROUPE` | faire converger les unités sélectionnées |
| `GAZ` | une grenade devant chaque unité sélectionnée : un nuage qui tient 9 s |
| `EAU` | les camions arrosent : le jet pousse les corps qu'il touche |
| `DIAG` | afficher l'état, la destination et le stress de chaque corps |

Perdre le focus met le jeu en pause ; un doigt reprend.

## Les cinq fichiers, et ce que chacun ignore

| Fichier | Rôle | N'a aucune connaissance de |
|---|---|---|
| `foule.js` | la simulation : forces, états, navigation | l'existence d'images |
| `acteurs.js` | l'atlas de sprites et leur rendu | l'existence de forces |
| `mission.js` | objectifs, événements, score | le rendu et la simulation (il *lit*) |
| `sons.js` | son synthétisé, aucun fichier | le reste du jeu |
| `fumee.js` | nuages de gaz et jets d'eau — zones qui agissent | la mission |
| `ia.js` | le camp que le joueur ne joue pas | le rendu (il passe par les mêmes ordres) |
| `cordon.js` | le décor, la caméra, le commandement, l'interface | — |

Le seul pont entre la simulation et le rendu est l'agent, qui porte
`x, y, dir, anim`. Remplacer les sprites temporaires revient à remplir
`ACTEURS.atlas[type][variante][vue][pose]` avec `{cv, ox, oy}` ; aucune
ligne de simulation ne bouge.

## Tester

Les tests sont des scripts Playwright dans le bac à sable de développement.
Ils pilotent un navigateur **tactile** (`hasTouch`, `isMobile`), jamais la
souris. Le serveur local doit tourner.

| Script | Ce qu'il vérifie |
|---|---|
| `charge_t.js` | chargement, chemins des ressources, actualisation en pleine partie |
| `bloc_t.js` | 1200 pas sans rendu : états atteints, transitions, corps bloqués, enfermement |
| `cmd_t.js` | chaque commande tactile, une par une |
| `mis_t.js` | la mission de bout en bout, victoire et défaite |
| `strat_t.js` | huit graines jouées sans intervention |
| `son_t.js` | création du contexte audio, effets, pause |
| `final_t.js` | performance, médiane de cinq séries |
| `feu_t.js` | banderole au menu et en jeu, molotov au doigt, incendie, feu-obstacle |
| `perf_t.js` | coût de dessin avec et sans foyers, médiane de sept séries |

Mesurer la performance dans un conteneur sans GPU ne prédit pas Android :
canvas 2D y est accéléré. Les chiffres de `final_t.js` sont un plancher,
pas une prévision.

## Ce qui n'est pas fini

- **L'équilibrage.** Mesuré sur trois graines, les deux camps gagnent
  environ une fois sur trois, et jouer activement ne change pas encore le
  résultat de façon fiable. C'est la limite la plus visible du jeu.
- **Le coût du feu.** Quatre foyers ajoutent environ 5 ms de dessin par
  image dans un conteneur sans GPU (11 ms → 16 ms, 380 corps, portrait).
  Le budget de particules a été divisé par deux pour y arriver.
- **Les ordres de maintien restants** : nasse effective, dialogue.
  `GAZ`, `EAU`, `AVANT` et `ARRIÈRE` agissent réellement sur la foule.
- **Une seule mission.**
- **Le rendu sur un vrai téléphone** n'a pas été mesuré.
