# Le Rex du Quartier

Jeu de gestion de cinéma. HTML, CSS et JavaScript sans outil de construction,
modules ES natifs, Supabase pour les données.

## Arborescence

```
/
├── *.html                 13 pages, ~2 Ko chacune
├── css/
│   ├── base.css           importe le socle commun
│   ├── variables.css      couleurs, espacements, zones sûres
│   ├── header.css         le bandeau clair
│   ├── navigation.css     les cinq onglets du bas
│   ├── components.css     cartes, boutons, panneaux, Bob
│   ├── animations.css     toutes les images-clés
│   └── <page>.css         une feuille par page
├── js/
│   ├── config.js          URL Supabase, clés de stockage, seuils
│   ├── supabase-client.js requêtes, RPC, session, erreurs typées
│   ├── api.js             la seule porte vers le serveur
│   ├── auth.js            garde de page, déconnexion
│   ├── game-state.js      l'état courant et ses chargements
│   ├── navigation.js      header et nav basse
│   ├── transitions.js     fondus entre les pages
│   ├── ambiance.js        décors de lieu, narration
│   ├── progression.js     niveaux, XP, missions
│   ├── cinema.js          l'accueil
│   ├── screenings.js      la programmation
│   ├── rooms.js           les salles
│   ├── studio.js          le studio
│   ├── social.js          réactions, abonnements, amitiés
│   ├── data/              catalogues : films, améliorations, personnalisation
│   ├── engine/            simulation et déroulement de la journée
│   ├── facade/            la façade évolutive et la vie de la rue
│   ├── ui/                composants visuels réutilisables
│   └── pages/             un point d'entrée par page, plus /parts
└── sql/                   migrations, à exécuter dans l'ordre
```

## Règles

Une page ne contient que sa structure. Aucun style en ligne, aucun script en ligne.

```html
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/screenings.css">
<script type="module" src="js/pages/programmation.js"></script>
```

Les pages ne parlent jamais à Supabase directement : elles passent par `api.js`.
Les valeurs sensibles (argent, XP, scores) sont calculées côté serveur ; le client
ne fait que les afficher.

## Mise en service

Les modules ES exigent un serveur HTTP — `file://` ne fonctionne pas.

```
python3 -m http.server 8000
```

Sur GitHub Pages, déposer la racine telle quelle.
