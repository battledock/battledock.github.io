# AVATARS BD - GUIDE D'UTILISATION

## 📦 Fichier CSS
`avatars-bd.css` - À inclure dans chaque page HTML

## 🎨 10 Avatars Disponibles

1. **avatar-capitaine** 👨‍✈️ - Casquette bleue + barbe blanche
2. **avatar-balafre** 😠 - Cicatrice + yeux plissés  
3. **avatar-moussaillon** 😊 - Sourire + dents blanches
4. **avatar-ancien** 👴 - Cheveux gris + moustache guidon
5. **avatar-pirate** 🏴‍☠️ - Bandana rouge + nœud
6. **avatar-cool** 😎 - Lunettes noires
7. **avatar-casque** ⛑️ - Casque jaune sécurité
8. **avatar-barbu** 🧔 - Barbe noire épaisse
9. **avatar-roux** 👨‍🦰 - Cheveux roux ébouriffés
10. **avatar-muscle** 💪 - Peau bronzée + sourcils épais

---

## 📝 UTILISATION DE BASE

### Dans le HTML (header)
```html
<link rel="stylesheet" href="avatars-bd.css">
```

### Avatar simple
```html
<div class="avatar-bd avatar-capitaine"></div>
```

---

## 🎯 TAILLES DISPONIBLES

### Small (50px)
```html
<div class="avatar-bd small avatar-pirate"></div>
```

### Medium (60px) - par défaut
```html
<div class="avatar-bd medium avatar-cool"></div>
```

### Normal (80px) - par défaut sans classe
```html
<div class="avatar-bd avatar-barbu"></div>
```

### Large (100px)
```html
<div class="avatar-bd large avatar-ancien"></div>
```

### XLarge (120px)
```html
<div class="avatar-bd xlarge avatar-muscle"></div>
```

---

## 💎 VARIANTES STYLISÉES

### Avec label en dessous
```html
<div class="avatar-with-label">
  <div class="avatar-bd avatar-moussaillon"></div>
  <div class="avatar-label">Moussaillon</div>
</div>
```

### Dans un cadre BD
```html
<div class="avatar-frame">
  <div class="avatar-bd avatar-capitaine"></div>
</div>
```

### Avec effet hover
```html
<div class="avatar-bd avatar-roux hoverable"></div>
```

### État sélectionné
```html
<div class="avatar-bd avatar-cool selected"></div>
```

---

## 🎮 EXEMPLE GAME.HTML

### Afficher l'avatar du joueur
```html
<!-- Dans le header du jeu -->
<div class="player-avatar">
  <div class="avatar-bd medium avatar-capitaine"></div>
  <span class="player-name">@Docker_du_13</span>
</div>
```

### CSS associé
```css
.player-avatar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: white;
  border: 3px solid #000;
  border-radius: 12px;
}

.player-name {
  font-family: 'Bangers', cursive;
  font-size: 18px;
}
```

---

## 👤 EXEMPLE PROFIL.HTML

### Section profil avec grand avatar
```html
<div class="profile-header">
  <div class="avatar-frame">
    <div class="avatar-bd xlarge avatar-pirate"></div>
  </div>
  <div class="profile-info">
    <h2>Docker_Pirate</h2>
    <p>Niveau 15 - Contremaître</p>
  </div>
</div>
```

### CSS associé
```css
.profile-header {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border: 4px solid #000;
  border-radius: 16px;
}

.profile-info h2 {
  font-family: 'Bangers', cursive;
  font-size: 32px;
  margin-bottom: 8px;
}
```

---

## 🏆 EXEMPLE LEADERBOARD

### Liste de joueurs avec avatars
```html
<div class="leaderboard">
  <div class="leaderboard-item">
    <span class="rank">1</span>
    <div class="avatar-bd small avatar-muscle"></div>
    <span class="username">@Le_Costaud</span>
    <span class="score">15,420 pts</span>
  </div>
  
  <div class="leaderboard-item">
    <span class="rank">2</span>
    <div class="avatar-bd small avatar-cool"></div>
    <span class="username">@Cool_Docker</span>
    <span class="score">12,890 pts</span>
  </div>
</div>
```

### CSS associé
```css
.leaderboard-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 3px solid #000;
  border-radius: 8px;
  margin-bottom: 8px;
}

.rank {
  font-family: 'Bangers', cursive;
  font-size: 24px;
  width: 40px;
  text-align: center;
}
```

---

## 🎨 MAPPING EMOJI → CLASS

Pour convertir l'emoji stocké en BDD vers la classe CSS :

```javascript
const avatarMap = {
  '👨‍✈️': 'avatar-capitaine',
  '😠': 'avatar-balafre',
  '😊': 'avatar-moussaillon',
  '👴': 'avatar-ancien',
  '🏴‍☠️': 'avatar-pirate',
  '😎': 'avatar-cool',
  '⛑️': 'avatar-casque',
  '🧔': 'avatar-barbu',
  '👨‍🦰': 'avatar-roux',
  '💪': 'avatar-muscle'
};

// Utilisation
const userAvatar = '👨‍✈️'; // Depuis Supabase
const avatarClass = avatarMap[userAvatar];

// Créer l'élément
const avatarDiv = document.createElement('div');
avatarDiv.className = `avatar-bd ${avatarClass}`;
```

---

## 📋 EXEMPLE COMPLET - GAME.HTML

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Battle Dock - Jeu</title>
  <link rel="stylesheet" href="avatars-bd.css">
  <style>
    .game-header {
      display: flex;
      justify-content: space-between;
      padding: 15px;
      background: white;
      border: 4px solid #000;
    }
    
    .player-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  </style>
</head>
<body>
  <div class="game-header">
    <div class="player-info">
      <div class="avatar-bd medium avatar-capitaine"></div>
      <div>
        <div class="username">@Docker_du_13</div>
        <div class="level">Niveau 5</div>
      </div>
    </div>
    <div class="player-stats">
      <div>💰 1,250€</div>
      <div>⚡ 45/50</div>
    </div>
  </div>
  
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/dist/umd/supabase.min.js"></script>
  <script>
    const supabaseUrl = 'https://drtsuhnbclhmgfjiykap.supabase.co';
    const supabaseKey = 'YOUR_KEY_HERE';
    const { createClient } = supabase;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    
    const avatarMap = {
      '👨‍✈️': 'avatar-capitaine',
      '😠': 'avatar-balafre',
      '😊': 'avatar-moussaillon',
      '👴': 'avatar-ancien',
      '🏴‍☠️': 'avatar-pirate',
      '😎': 'avatar-cool',
      '⛑️': 'avatar-casque',
      '🧔': 'avatar-barbu',
      '👨‍🦰': 'avatar-roux',
      '💪': 'avatar-muscle'
    };
    
    async function loadUserProfile() {
      const userId = localStorage.getItem('userId');
      
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('username, avatar')
        .eq('user_id', userId)
        .single();
      
      if (data) {
        // Afficher le username
        document.querySelector('.username').textContent = '@' + data.username;
        
        // Afficher l'avatar BD
        const avatarEl = document.querySelector('.avatar-bd');
        const avatarClass = avatarMap[data.avatar];
        avatarEl.className = `avatar-bd medium ${avatarClass}`;
      }
    }
    
    loadUserProfile();
  </script>
</body>
</html>
```

---

## 🎯 CHECKLIST INTÉGRATION

### Pour chaque page (game.html, profil.html, leaderboard.html) :

1. ✅ Ajouter `<link rel="stylesheet" href="avatars-bd.css">`
2. ✅ Créer le mapping emoji → class CSS
3. ✅ Charger l'avatar depuis Supabase
4. ✅ Convertir emoji en classe CSS
5. ✅ Créer l'élément avec la bonne classe
6. ✅ Appliquer la taille (small/medium/large)
7. ✅ Ajouter les styles BD (border, shadow)

---

## 🚀 PROCHAINES ÉTAPES

### Fichiers à modifier :
- ✅ `creer-badge.html` - Déjà fait !
- 🔲 `game.html` - Ajouter avatar dans header
- 🔲 `profil.html` - Grand avatar + infos
- 🔲 `leaderboard.html` - Liste avec petits avatars
- 🔲 `shop.html` - Avatar du vendeur Ferretti

### Colonnes BDD :
- `profiles.avatar` → Emoji (ex: '👨‍✈️')
- Affichage → Converti en classe CSS ('avatar-capitaine')

---

**LES AVATARS BD SONT MAINTENANT PRÊTS POUR TOUTES LES PAGES ! 🎨✨**
