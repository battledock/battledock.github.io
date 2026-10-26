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
| But | tenir le passage 2 min 30, 56 passages tolérés | faire passer 52 des siens |
| Ordres | TENIR, AVANT, ARRIÈRE, FORME, **SOMM.**, **NASSE**, **INTERP.**, GAZ, EAU | POUSSER, RECULER, CASSER, BARRICADE, MOLOTOV, GROUPE, **FEINTE**, DISPERSER |

Les ordres tiennent sur **une seule rangée** de gros pictogrammes ; un
ordre qu'on ne peut pas donner (cocktails en recharge, eau demandée à
des hommes à pied) est grisé avant qu'on le touche. Les unités sont des
**jetons ronds** posés par-dessus la scène, au-dessus de la barre : ils
ne prennent pas de hauteur de rue, et l'avancement d'un ordre fait le
tour du jeton. Taper un jeton **amène la caméra** sur l'unité, et le
suivi automatique reprend quatre secondes plus tard.
| Unités | 3 lignes, une réserve, deux camions | 4 blocs de cortège, les casseurs, les mobiles |

**Déplacer un bloc du cortège.** On tape sa pastille, puis la case visée :
le bloc quitte la marche automatique et s'y rend par le chemin le plus
court. `GROUPE` avec un seul bloc sélectionné le remet dans le rang.
Tant qu'il est parti, le reste du cortège continue d'avancer sans lui.

## Le style du cortège

Côté cortège, le menu propose trois façons de jouer. Ça ne change pas
les règles : ça change **qui compose la foule**, et le reste suit.

| Style | Ce qu'il y a dedans | Ce que ça donne |
|---|---|---|
| **PACIFIQUE** | sept banderoles en tête, des street medics | encaisse l'eau, panique peu, tension lente. Pousse moins |
| **DÉTERMINÉ** | un cortège ordinaire | rien de marqué dans un sens ni dans l'autre |
| **RADICAL** | des casseurs en tête | pousse fort et casse vite. Panique plus, tension rapide |

- Un porteur de **banderole** n'encaisse qu'un tiers du jet d'eau, et
  protège ceux qui sont à une tuile et demie derrière lui. Rien à
  activer : il suffit de les mettre devant.
- Un **street medic** double la détente du stress autour de lui — assez
  pour récupérer quelqu'un qu'on aurait perdu à la panique.
- Un **casseur** est plus rapide, plus lourd, et plus nerveux.

## Les trois ordres de maintien

La police avait la force — gaz, eau, charge — et rien d'autre. Or tenir
une place, ce n'est pas seulement frapper.

**SOMM.** (8) — les sommations ne dispersent personne par elles-mêmes :
elles font reculer ceux qui hésitaient déjà (~30 personnes), et surtout
elles **couvrent** les vingt secondes qui suivent. Gazer sans avoir
sommé devant les caméras compte comme une faute ; après sommation, non.
C'est le seul ordre du jeu dont l'intérêt est de rendre un *autre*
ordre moins cher.

**NASSE** (30) — les unités choisies se referment en fer à cheval sur
la foule la plus proche. Ceux qui sont dedans (rayon 2,5 tuiles)
n'avancent plus qu'au cinquième et **ne comptent plus** comme passages.
Mais la tension monte de 0,12 d'un coup — et une rue tendue fait céder
toutes les lignes, y compris la vôtre.

**INTERP.** (22) — chaque bloc a un meneur. Le retirer divise la
cohésion du bloc par quatre pendant vingt secondes : il s'étale, il
pousse moins. Il faut être au contact (quatre tuiles), et le bloc se
remet tout seul.

## Les actions qui ne servent à rien toutes seules

**FEINTE** (16 d'élan) — un bloc se jette en avant de façon ostensible
pendant huit secondes, et l'IA adverse y envoie sa réserve. Le passage
fait treize tuiles pour une ligne qui en couvre huit : il y a toujours
un côté dégarni, encore faut-il que la police regarde ailleurs. La
feinte ne vaut que par ce qu'on fait pendant.

**La barricade enflammée** — un cocktail qui tombe à moins d'une tuile
et demie d'une barricade debout y met un feu plus gros et plus long
qu'ailleurs. Tant qu'elle brûle, personne ne s'en approche. Pas de
bouton pour ça : c'est la rencontre de deux actions qu'on avait déjà,
et c'est au joueur de la voir.

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

## L'élan, et les trois zones

**Chaque ordre coûte.** Une jauge commune — **L'ÉLAN** côté cortège, **LES
MOYENS** côté police — remonte de 2,6 points la seconde jusqu'à 80. Un
coup fort (cocktails, grenade : 34) se paie treize secondes ; deux
d'affilée vident la réserve. Le prix est écrit sur chaque bouton, et la
jauge est le liseré qui sépare la rue des boutons — rien de plus à
regarder. On paie au tir, pas à l'armement : viser puis changer d'avis
ne coûte rien.

**Trois zones à tenir**, et elles ne se valent pas :

| Zone | Où | Ce qu'elle donne |
|---|---|---|
| **LE PASSAGE** | entre les barrières | +2 d'élan la seconde |
| **LA PERCÉE** | la rue nord-sud | deux renforts toutes les six secondes |
| **LA FONTAINE** | le centre de la place | la tension retombe |

Une zone est tenue par le camp qui y a **quatre corps de plus** que
l'autre ; à moins, elle n'est à personne. Chaque seconde tenue vaut 2
points au score.

**La tension coupe des deux côtés.** Au-delà de 0,55 elle assouplit les
lignes — toutes les lignes, y compris les vôtres. Au-delà de 0,85
pendant quatre secondes, une bousculade part toute seule à l'endroit le
plus tendu : personne ne l'a commandée et on ne l'empêche qu'en faisant
retomber la tension avant.

**La place est tactique, pas un bras de fer.** Le passage des barrières
fait **treize tuiles** pour un cordon qui en couvre huit : la police
choisit où tenir, le cortège où pousser. Les quatre blocs du cortège
attaquent quatre bandes différentes. Une ligne de police **plie** quand
la pression dépasse son seuil — jusqu'à trois tuiles et demie — puis
reprend son terrain quand la poussée retombe. Un cocktail peut tomber
**sur** la ligne (jusqu'à une tuile au-delà du premier rang) : un homme
dans les flammes cède, même si on lui a dit de tenir. C'est le seul
moyen d'ouvrir une brèche à la demande.

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
