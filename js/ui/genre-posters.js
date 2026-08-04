/* ============================================================
   AFFICHES VECTORIELLES
   Une scène dessinée par genre du catalogue. Aucune image :
   chaque film reçoit son affiche automatiquement, sans qu'il
   faille en produire ni en héberger une seule.
   Format 140 × 210, découpé en 2/3 par preserveAspectRatio.
   ============================================================ */

const A = {};

/* ---------- DRAME ---------- */
A["Drame"] = ()=>`<svg viewBox="0 0 140 210" preserveAspectRatio="xMidYMid slice">
  <defs><linearGradient id="drF" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#6a5a68"/><stop offset=".5" stop-color="#3e3244"/>
    <stop offset="1" stop-color="#181420"/></linearGradient></defs>
  <rect width="140" height="210" fill="url(#drF)"/>
  <!-- fenêtre et pluie -->
  <rect x="26" y="30" width="88" height="106" fill="#2a2434" stroke="#8a7c88" stroke-width="2"/>
  <path d="M70 30 L70 136 M26 83 L114 83" stroke="#8a7c88" stroke-width="2"/>
  <g stroke="#b9c8d8" stroke-width="1" opacity=".45">
    ${[...Array(22)].map((_,i)=>{const x=28+(i*29)%84,y=32+(i*41)%98;
      return `<path d="M${x} ${y} l-3 9"/>`;}).join("")}
  </g>
  <!-- silhouette de dos -->
  <g fill="#120e18">
    <circle cx="70" cy="128" r="14"/>
    <path d="M46 210 q0 -52 24 -52 q24 0 24 52 Z"/>
  </g>
  <path d="M0 196 L140 196 L140 210 L0 210 Z" fill="#0c0a12"/>
</svg>`;

/* ---------- AVENTURE ---------- */
A["Aventure"] = ()=>`<svg viewBox="0 0 140 210" preserveAspectRatio="xMidYMid slice">
  <defs><linearGradient id="avF" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2a6a9a"/><stop offset=".45" stop-color="#154a72"/>
    <stop offset="1" stop-color="#07223a"/></linearGradient>
    <radialGradient id="avR" cx=".5" cy="0" r=".9">
      <stop offset="0" stop-color="#9fd4ee" stop-opacity=".5"/>
      <stop offset="1" stop-color="#9fd4ee" stop-opacity="0"/></radialGradient></defs>
  <rect width="140" height="210" fill="url(#avF)"/>
  <g opacity=".5"><path d="M30 0 L46 0 L70 210 L40 210 Z" fill="url(#avR)"/>
    <path d="M78 0 L88 0 L104 210 L86 210 Z" fill="url(#avR)"/></g>
  <g fill="#bfe3f5" opacity=".35">
    ${[...Array(14)].map((_,i)=>{const x=12+(i*37)%116,y=30+(i*53)%120;
      return `<path d="M${x} ${y} l5 -2 l0 4 Z"/>`;}).join("")}</g>
  <g fill="#0d2a3e" opacity=".92">
    <path d="M18 78 q28 -22 62 -8 q18 8 34 4 q-10 12 -30 14 q-30 12 -58 -2 Z"/>
    <path d="M52 62 l10 -20 l6 22 Z"/>
    <path d="M18 78 l-12 -12 l4 16 l-6 12 l14 -10 Z"/>
    <path d="M58 86 l-6 16 l14 -12 Z"/>
    <circle cx="72" cy="74" r="2.4" fill="#7fc4e4"/></g>
  <path d="M0 170 q22 -18 44 -6 q20 -14 42 -2 q26 -12 54 4 L140 210 L0 210 Z" fill="#04182a"/>
  <g fill="#031320"><circle cx="46" cy="150" r="9"/>
    <path d="M38 158 q8 -4 16 0 l3 22 l-22 0 Z"/>
    <path d="M36 164 l-12 10 l4 4 l12 -8 Z"/><path d="M56 164 l12 6 l-2 5 l-12 -4 Z"/>
    <path d="M36 180 l-6 18 l6 2 l6 -18 Z M50 180 l8 16 l-5 4 l-9 -16 Z"/></g>
  <g opacity=".55" fill="#bfe3f5"><circle cx="58" cy="138" r="2.4"/>
    <circle cx="64" cy="126" r="1.8"/><circle cx="60" cy="114" r="1.2"/></g>
</svg>`;

/* ---------- ANIMATION ---------- */
A["Animation"] = ()=>`<svg viewBox="0 0 140 210" preserveAspectRatio="xMidYMid slice">
  <defs><linearGradient id="anF" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#7fd4e8"/><stop offset=".5" stop-color="#a8e0c0"/>
    <stop offset="1" stop-color="#f6d98a"/></linearGradient></defs>
  <rect width="140" height="210" fill="url(#anF)"/>
  <circle cx="106" cy="36" r="20" fill="#fff3b8"/>
  <g fill="#fff" opacity=".7">
    <ellipse cx="34" cy="46" rx="22" ry="10"/><ellipse cx="50" cy="40" rx="14" ry="8"/>
    <ellipse cx="96" cy="72" rx="18" ry="7"/></g>
  <!-- collines -->
  <path d="M0 132 q26 -26 54 -6 q28 -22 56 -2 q18 -12 30 -2 L140 210 L0 210 Z" fill="#57b87a"/>
  <path d="M0 162 q34 -20 68 -4 q34 -16 72 0 L140 210 L0 210 Z" fill="#3d9660"/>
  <!-- personnage rond -->
  <g><ellipse cx="58" cy="164" rx="20" ry="19" fill="#f0a03a"/>
    <ellipse cx="58" cy="146" rx="15" ry="14" fill="#f7b95a"/>
    <circle cx="52" cy="144" r="3.4" fill="#2a1c10"/><circle cx="64" cy="144" r="3.4" fill="#2a1c10"/>
    <circle cx="53" cy="143" r="1.2" fill="#fff"/><circle cx="65" cy="143" r="1.2" fill="#fff"/>
    <path d="M52 152 q6 5 12 0" stroke="#2a1c10" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M46 134 q-6 -12 2 -14 q4 6 4 12 Z" fill="#f7b95a"/>
    <path d="M70 134 q6 -12 -2 -14 q-4 6 -4 12 Z" fill="#f7b95a"/>
    <ellipse cx="42" cy="168" rx="7" ry="5" fill="#f0a03a"/>
    <ellipse cx="74" cy="168" rx="7" ry="5" fill="#f0a03a"/></g>
  <!-- papillon -->
  <g transform="translate(100 120)"><path d="M0 0 q-9 -8 -3 -12 q6 -2 3 12" fill="#e8607a"/>
    <path d="M0 0 q9 -8 3 -12 q-6 -2 -3 12" fill="#e8607a"/></g>
</svg>`;

/* ---------- DOCUMENTAIRE ---------- */
A["Documentaire"] = ()=>`<svg viewBox="0 0 140 210" preserveAspectRatio="xMidYMid slice">
  <defs><linearGradient id="doF" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#d8cdb4"/><stop offset=".6" stop-color="#a89880"/>
    <stop offset="1" stop-color="#6a5c48"/></linearGradient></defs>
  <rect width="140" height="210" fill="url(#doF)"/>
  <circle cx="70" cy="72" r="44" fill="none" stroke="#4a4234" stroke-width="1.6" opacity=".5"/>
  <circle cx="70" cy="72" r="30" fill="none" stroke="#4a4234" stroke-width="1" opacity=".4"/>
  <!-- montagnes -->
  <path d="M0 138 L34 88 L58 124 L84 74 L116 130 L140 106 L140 210 L0 210 Z" fill="#5a5040"/>
  <path d="M34 88 L44 102 L24 102 Z M84 74 L96 92 L72 92 Z" fill="#e8e0cc" opacity=".7"/>
  <path d="M0 164 q30 -14 62 -2 q34 -12 78 2 L140 210 L0 210 Z" fill="#3e3628"/>
  <!-- oiseaux -->
  <g stroke="#3e3628" stroke-width="1.6" fill="none" opacity=".7">
    <path d="M24 46 q5 -4 10 0 q5 -4 10 0"/><path d="M96 34 q4 -3 8 0 q4 -3 8 0"/></g>
  <!-- objectif -->
  <g transform="translate(70 168)">
    <rect x="-24" y="-10" width="48" height="26" rx="4" fill="#241e16"/>
    <circle cx="0" cy="3" r="11" fill="#0d0a06" stroke="#8a7c60" stroke-width="2"/>
    <circle cx="0" cy="3" r="5" fill="#4a6a7a"/>
    <circle cx="-3" cy="0" r="2" fill="#c8dae4" opacity=".7"/>
    <rect x="-14" y="-15" width="12" height="6" rx="2" fill="#241e16"/></g>
</svg>`;

/* ---------- THRILLER FAMILIAL ---------- */
A["Thriller familial"] = ()=>`<svg viewBox="0 0 140 210" preserveAspectRatio="xMidYMid slice">
  <defs><linearGradient id="thF" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#1a2a48"/><stop offset=".55" stop-color="#101c34"/>
    <stop offset="1" stop-color="#070c18"/></linearGradient></defs>
  <rect width="140" height="210" fill="url(#thF)"/>
  <circle cx="104" cy="38" r="17" fill="#cfd8e8" opacity=".6"/>
  <circle cx="98" cy="34" r="15" fill="#141f38"/>
  <g fill="#22304e" opacity=".7"><ellipse cx="60" cy="44" rx="46" ry="6"/>
    <ellipse cx="102" cy="58" rx="34" ry="5"/></g>
  <g stroke="#0a1120" stroke-width="2.4" fill="none" stroke-linecap="round">
    <path d="M14 210 L14 130 M14 160 l-10 -14 M14 146 l10 -16"/>
    <path d="M128 210 L128 142 M128 168 l10 -12 M128 154 l-9 -14"/></g>
  <g fill="#0c1424">
    <path d="M38 210 L38 122 L70 100 L102 122 L102 210 Z"/>
    <path d="M34 124 L70 96 L106 124 L102 124 L70 102 L38 124 Z" fill="#060b16"/>
    <path d="M52 122 L52 88 L62 88 L62 116 Z"/><path d="M50 90 L57 78 L64 90 Z" fill="#060b16"/></g>
  <g fill="#e8a83a">
    <rect x="46" y="136" width="9" height="12" rx="1" opacity=".9"/>
    <rect x="66" y="136" width="9" height="12" rx="1" opacity=".55"/>
    <rect x="85" y="134" width="8" height="10" rx="1" opacity=".8"/>
    <path d="M64 182 l12 0 l0 28 l-12 0 Z" opacity=".7"/></g>
  <g fill="#4a5a7a" opacity=".22"><ellipse cx="40" cy="200" rx="60" ry="12"/>
    <ellipse cx="110" cy="206" rx="54" ry="10"/></g>
</svg>`;

/* ---------- COMÉDIE ---------- */
A["Comédie"] = ()=>`<svg viewBox="0 0 140 210" preserveAspectRatio="xMidYMid slice">
  <defs><linearGradient id="coF" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f7c948"/><stop offset=".55" stop-color="#e8913a"/>
    <stop offset="1" stop-color="#c05a2a"/></linearGradient></defs>
  <rect width="140" height="210" fill="url(#coF)"/>
  <g stroke="#fff" stroke-width="7" opacity=".16">
    ${[...Array(9)].map((_,i)=>`<path d="M${-40+i*26} 210 L${20+i*26} 0"/>`).join("")}</g>
  <!-- deux masques -->
  <g transform="translate(46 92)">
    <ellipse cx="0" cy="0" rx="30" ry="36" fill="#fdf3d2"/>
    <path d="M-30 -6 q30 -22 60 0 q-30 -34 -60 0" fill="#e8b84b" opacity=".4"/>
    <path d="M-16 -8 q6 -8 12 0" stroke="#2e1c10" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M4 -8 q6 -8 12 0" stroke="#2e1c10" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M-16 12 q16 20 32 0 q-16 8 -32 0" fill="#2e1c10"/></g>
  <g transform="translate(96 128)">
    <ellipse cx="0" cy="0" rx="24" ry="29" fill="#c9a8b8" opacity=".9"/>
    <path d="M-12 -8 q5 6 10 0" stroke="#2e1c10" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M2 -8 q5 6 10 0" stroke="#2e1c10" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M-12 16 q12 -16 24 0 q-12 -6 -24 0" fill="#2e1c10"/></g>
  <!-- confettis -->
  <g>${[...Array(16)].map((_,i)=>{const x=6+(i*43)%128,y=8+(i*59)%190;
    const c=["#fff","#a83a5c","#3d9660","#2e5c8a"][i%4];
    return `<rect x="${x}" y="${y}" width="4" height="6" rx="1" fill="${c}" opacity=".6"
      transform="rotate(${i*37} ${x} ${y})"/>`;}).join("")}</g>
</svg>`;

/* ---------- ROMANCE ---------- */
A["Romance"] = ()=>`<svg viewBox="0 0 140 210" preserveAspectRatio="xMidYMid slice">
  <defs><linearGradient id="roF" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f0c8b0"/><stop offset=".4" stop-color="#d99a92"/>
    <stop offset="1" stop-color="#8c4a58"/></linearGradient></defs>
  <rect width="140" height="210" fill="url(#roF)"/>
  <circle cx="70" cy="66" r="40" fill="#fbe0c8" opacity=".5"/>
  <g fill="#a83a5c" opacity=".3">
    ${[...Array(11)].map((_,i)=>{const x=8+(i*47)%124,y=14+(i*61)%150;
      return `<ellipse cx="${x}" cy="${y}" rx="3.4" ry="2" transform="rotate(${i*33} ${x} ${y})"/>`;
    }).join("")}</g>
  <g fill="#5a2434">
    <path d="M46 210 L46 140 q0 -18 -8 -26 q-6 -7 -2 -18 q4 -12 16 -12 q13 0 16 13
             q2 10 -4 16 q-7 8 -6 22 l0 65 Z"/></g>
  <g fill="#3e1a26">
    <path d="M96 210 L96 142 q0 -18 8 -27 q6 -7 2 -18 q-5 -12 -17 -12 q-13 0 -16 13
             q-2 10 4 17 q7 8 6 22 l0 65 Z"/></g>
  <path d="M70 122 q-3 8 0 14 q3 -6 0 -14" fill="#fbe0c8" opacity=".5"/>
</svg>`;

/* ---------- FILM NOIR ---------- */
A["Film noir"] = ()=>`<svg viewBox="0 0 140 210" preserveAspectRatio="xMidYMid slice">
  <rect width="140" height="210" fill="#12100e"/>
  <!-- store vénitien : bandes de lumière -->
  <g fill="#d8cfae" opacity=".2">
    ${[...Array(9)].map((_,i)=>`<path d="M0 ${16+i*22} L140 ${4+i*22} L140 ${14+i*22} L0 ${26+i*22} Z"/>`).join("")}</g>
  <!-- flaque de lumière au sol -->
  <ellipse cx="70" cy="192" rx="52" ry="16" fill="#d8cfae" opacity=".14"/>
  <!-- silhouette au chapeau -->
  <g fill="#050403">
    <path d="M52 210 L52 122 q0 -12 18 -12 q18 0 18 12 l0 88 Z"/>
    <circle cx="70" cy="96" r="14"/>
    <path d="M48 92 L92 92 L92 87 q-22 -12 -44 0 Z"/>
    <rect x="58" y="74" width="24" height="16" rx="2"/>
    <path d="M88 130 l16 30 l-7 4 l-15 -28 Z"/></g>
  <!-- fumée de cigarette -->
  <path d="M56 108 q-8 -18 2 -30 q6 -10 0 -20" stroke="#d8cfae" stroke-width="1.4"
    fill="none" opacity=".3"/>
  <circle cx="58" cy="106" r="1.6" fill="#e8843a"/>
</svg>`;

/* ---------- WESTERN ---------- */
A["Western"] = ()=>`<svg viewBox="0 0 140 210" preserveAspectRatio="xMidYMid slice">
  <defs><linearGradient id="weF" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f4b45a"/><stop offset=".38" stop-color="#e07a3a"/>
    <stop offset=".72" stop-color="#a8482e"/><stop offset="1" stop-color="#4a2418"/></linearGradient></defs>
  <rect width="140" height="210" fill="url(#weF)"/>
  <circle cx="70" cy="82" r="34" fill="#ffe08a" opacity=".85"/>
  <!-- mesas -->
  <g fill="#7a3a24" opacity=".9">
    <path d="M0 118 L0 96 L26 96 L26 118 Z"/><path d="M104 122 L104 88 L134 88 L134 122 Z"/></g>
  <path d="M0 130 L140 130 L140 210 L0 210 Z" fill="#8a4a2a"/>
  <path d="M0 152 q34 -12 70 -2 q36 -10 70 2 L140 210 L0 210 Z" fill="#5a2e1c"/>
  <!-- cavalier -->
  <g fill="#1c0e08">
    <path d="M40 168 q10 -12 26 -10 q16 2 22 12 l-4 16 l-42 0 Z"/>
    <path d="M44 184 l-2 20 l6 0 l3 -18 Z M56 186 l-1 18 l6 0 l2 -18 Z
             M74 186 l2 18 l6 0 l-2 -18 Z M84 182 l4 22 l6 0 l-4 -22 Z"/>
    <path d="M86 168 l10 -10 l6 4 l-8 10 Z"/>
    <path d="M60 160 l4 -22 l8 0 l2 22 Z"/>
    <circle cx="67" cy="132" r="7"/>
    <path d="M52 130 L82 130 L82 126 q-15 -8 -30 0 Z"/>
    <rect x="60" y="118" width="14" height="10" rx="2"/></g>
  <!-- buisson -->
  <g fill="#4a2e18"><circle cx="20" cy="182" r="8"/><circle cx="28" cy="186" r="6"/></g>
</svg>`;

/* ---------- MUSICAL ---------- */
A["Musical"] = ()=>`<svg viewBox="0 0 140 210" preserveAspectRatio="xMidYMid slice">
  <defs><linearGradient id="muF" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#8c2f6a"/><stop offset=".5" stop-color="#5a1c4a"/>
    <stop offset="1" stop-color="#1e0a1c"/></linearGradient>
    <radialGradient id="muP" cx=".5" cy="0" r=".8">
      <stop offset="0" stop-color="#ffe08a" stop-opacity=".55"/>
      <stop offset="1" stop-color="#ffe08a" stop-opacity="0"/></radialGradient></defs>
  <rect width="140" height="210" fill="url(#muF)"/>
  <!-- poursuites -->
  <path d="M20 0 L44 0 L86 210 L14 210 Z" fill="url(#muP)"/>
  <path d="M104 0 L124 0 L136 210 L82 210 Z" fill="url(#muP)" opacity=".7"/>
  <!-- rideau haut -->
  <path d="M0 0 L140 0 L140 24 q-35 16 -70 0 q-35 16 -70 0 Z" fill="#7c1424"/>
  <!-- danseurs -->
  <g fill="#140812">
    <g transform="translate(52 150)">
      <circle cx="0" cy="-34" r="8"/>
      <path d="M-7 -26 q7 -4 14 0 l3 22 l-20 0 Z"/>
      <path d="M-7 -22 l-16 -12 l-3 6 l17 14 Z"/><path d="M7 -22 l18 -18 l4 5 l-19 19 Z"/>
      <path d="M-5 -4 l-10 32 l7 2 l9 -30 Z"/><path d="M6 -4 l12 28 l-6 4 l-13 -28 Z"/></g>
    <g transform="translate(94 158)">
      <circle cx="0" cy="-32" r="7"/>
      <path d="M-9 -25 q9 -4 18 0 l-2 12 l-14 0 Z"/>
      <path d="M-9 -13 q9 -3 18 0 l6 20 l-30 0 Z"/>
      <path d="M-8 -22 l-15 8 l3 6 l16 -8 Z"/><path d="M8 -22 l14 -14 l4 5 l-15 15 Z"/>
      <path d="M-6 7 l-6 24 l6 2 l6 -24 Z"/><path d="M6 7 l8 22 l-6 3 l-8 -23 Z"/></g></g>
  <!-- notes -->
  <g fill="#f7dd9a" opacity=".8">
    <g transform="translate(24 56)"><ellipse cx="0" cy="0" rx="5" ry="3.6" transform="rotate(-20)"/>
      <path d="M4 -1 L5 -16 L9 -15" stroke="#f7dd9a" stroke-width="1.8" fill="none"/></g>
    <g transform="translate(114 88) scale(.8)"><ellipse cx="0" cy="0" rx="5" ry="3.6" transform="rotate(-20)"/>
      <path d="M4 -1 L5 -16 L9 -15" stroke="#f7dd9a" stroke-width="2.2" fill="none"/></g></g>
  <path d="M0 194 L140 194 L140 210 L0 210 Z" fill="#0e0510"/>
</svg>`;

/* ---------- FANTASTIQUE ---------- */
A["Fantastique"] = ()=>`<svg viewBox="0 0 140 210" preserveAspectRatio="xMidYMid slice">
  <defs><linearGradient id="faF" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2a1a5c"/><stop offset=".5" stop-color="#4a2a7a"/>
    <stop offset="1" stop-color="#120a28"/></linearGradient>
    <radialGradient id="faL" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#a8e8f0" stop-opacity=".9"/>
      <stop offset="1" stop-color="#a8e8f0" stop-opacity="0"/></radialGradient></defs>
  <rect width="140" height="210" fill="url(#faF)"/>
  <g fill="#fff">${[...Array(30)].map((_,i)=>{const x=(i*53)%140,y=(i*37)%150;
    return `<circle cx="${x}" cy="${y}" r="${.7+(i%3)*.5}" opacity="${.3+(i%4)*.17}"/>`;}).join("")}</g>
  <!-- planète -->
  <circle cx="104" cy="44" r="22" fill="#7a5ab8" opacity=".8"/>
  <ellipse cx="104" cy="44" rx="34" ry="7" fill="none" stroke="#c8a8e8" stroke-width="2.4" opacity=".7"/>
  <!-- portail lumineux -->
  <ellipse cx="60" cy="118" rx="30" ry="42" fill="url(#faL)"/>
  <ellipse cx="60" cy="118" rx="24" ry="36" fill="none" stroke="#d8f4fa" stroke-width="2" opacity=".8"/>
  <!-- silhouette qui entre -->
  <g fill="#0a0618"><circle cx="60" cy="126" r="8"/>
    <path d="M52 134 q8 -4 16 0 l4 34 l-24 0 Z"/>
    <path d="M52 138 l-12 16 l4 4 l12 -14 Z"/><path d="M68 138 l12 16 l-4 4 l-12 -14 Z"/></g>
  <!-- rochers flottants -->
  <g fill="#2a1a4a"><path d="M14 150 l16 -6 l6 8 l-14 8 Z"/>
    <path d="M110 140 l14 -5 l5 7 l-13 6 Z"/></g>
  <path d="M0 178 q30 -14 62 -4 q34 -12 78 4 L140 210 L0 210 Z" fill="#0c0620"/>
</svg>`;

/* ---------- CULTE ---------- */
A["Culte"] = ()=>`<svg viewBox="0 0 140 210" preserveAspectRatio="xMidYMid slice">
  <rect width="140" height="210" fill="#141210"/>
  <!-- amorce de pellicule -->
  <circle cx="70" cy="92" r="56" fill="none" stroke="#8a7c60" stroke-width="1.6" opacity=".5"/>
  <circle cx="70" cy="92" r="38" fill="none" stroke="#8a7c60" stroke-width="1.2" opacity=".4"/>
  <path d="M70 36 L70 148 M14 92 L126 92" stroke="#8a7c60" stroke-width="1.2" opacity=".4"/>
  <path d="M70 92 L70 36 A56 56 0 0 1 126 92 Z" fill="#e8dcc4" opacity=".12"/>
  <text x="70" y="112" text-anchor="middle" font-family="Georgia" font-size="52"
    fill="#e8dcc4" opacity=".8">3</text>
  <!-- perforations latérales -->
  <g fill="#2a2620">${[...Array(9)].map((_,i)=>
    `<rect x="4" y="${8+i*23}" width="9" height="13" rx="2"/>
     <rect x="127" y="${8+i*23}" width="9" height="13" rx="2"/>`).join("")}</g>
  <g fill="#c9982f" opacity=".9">
    <path d="M70 168 l4.4 9 l10 1.4 l-7.2 7 l1.7 9.8 L70 190.4 l-8.9 3.8 l1.7 -9.8 l-7.2 -7 l10 -1.4 Z"/></g>
</svg>`;

function afficheDeGenre(g){ return (A[g] || A["Drame"])(); }
const GENRES_AFFICHES = Object.keys(A);

/* le genre d'un film, avec repli sur le Drame pour un genre inconnu */
function genreConnu(g){ return A[g] ? g : "Drame"; }

/* ---- exports ---- */
export {
  A,
  GENRES_AFFICHES,
  afficheDeGenre,
  genreConnu
};
