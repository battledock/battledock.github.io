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
| `GAZ` | une grenade devant chaque unité sélectionnée |
| `DIAG` | afficher l'état, la destination et le stress de chaque corps |

Perdre le focus met le jeu en pause ; un doigt reprend.

## Les cinq fichiers, et ce que chacun ignore

| Fichier | Rôle | N'a aucune connaissance de |
|---|---|---|
| `foule.js` | la simulation : forces, états, navigation | l'existence d'images |
| `acteurs.js` | l'atlas de sprites et leur rendu | l'existence de forces |
| `mission.js` | objectifs, événements, score | le rendu et la simulation (il *lit*) |
| `sons.js` | son synthétisé, aucun fichier | le reste du jeu |
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

Mesurer la performance dans un conteneur sans GPU ne prédit pas Android :
canvas 2D y est accéléré. Les chiffres de `final_t.js` sont un plancher,
pas une prévision.

## Ce qui n'est pas fini

- **L'équilibrage.** Ne rien faire gagne encore environ une fois sur deux
  selon la graine.
- **Les ordres de maintien** : lance à eau, nasse effective, dialogue.
  Seuls `GAZ`, `AVANT` et `ARRIÈRE` agissent sur la foule.
- **Une seule mission.**
- **Le rendu sur un vrai téléphone** n'a pas été mesuré.
