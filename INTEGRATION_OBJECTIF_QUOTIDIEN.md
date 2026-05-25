# INTÉGRATION OBJECTIF QUOTIDIEN DANS LES MINI-JEUX

## 📋 FICHIERS À MODIFIER
- docker-sifflet.html
- charger-camions.html
- tetris-portuaire.html

---

## 🔧 CODE À AJOUTER

### DANS LA FONCTION QUI SAUVEGARDE LE RÉSULTAT DU JEU

Chercher la fonction qui sauvegarde le score/résultat (généralement après `saveGameResults` ou similaire).

**AJOUTER CE CODE APRÈS LA SAUVEGARDE :**

```javascript
// Incrémenter le compteur quotidien
try {
  const supabaseUrl = 'https://drtsuhnbclhmgfjiykap.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydHN1aG5iY2xobWdmaml5a2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NDIzODksImV4cCI6MjA5NDQxODM4OX0.68cvRa8xhrSDt2nnEEp7pagL7NT5ugRtOhKLGX2CQJg';
  const { createClient } = supabase;
  const sb = createClient(supabaseUrl, supabaseKey);
  
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: profile } = await sb
      .from('profiles')
      .select('daily_contracts_count, daily_contracts_date')
      .eq('id', session.user.id)
      .single();

    let newCount = 1;
    
    if (profile?.daily_contracts_date === today) {
      newCount = (profile.daily_contracts_count || 0) + 1;
    }

    await sb
      .from('profiles')
      .update({ 
        daily_contracts_count: newCount,
        daily_contracts_date: today
      })
      .eq('id', session.user.id);

    console.log('✅ Objectif quotidien mis à jour:', newCount, '/3');
  }
} catch (error) {
  console.error('❌ Erreur objectif quotidien:', error);
}
```

---

## 📍 EXEMPLE D'INTÉGRATION

**AVANT :**
```javascript
async function endGame() {
  const score = calculateScore();
  await saveGameResults(score, money, xp);
  
  // Rediriger vers game.html
  window.location.href = 'game.html';
}
```

**APRÈS :**
```javascript
async function endGame() {
  const score = calculateScore();
  await saveGameResults(score, money, xp);
  
  // ✨ INCRÉMENTER OBJECTIF QUOTIDIEN
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: { session } } = await sb.auth.getSession();
    
    if (session) {
      const { data: profile } = await sb
        .from('profiles')
        .select('daily_contracts_count, daily_contracts_date')
        .eq('id', session.user.id)
        .single();

      let newCount = 1;
      if (profile?.daily_contracts_date === today) {
        newCount = (profile.daily_contracts_count || 0) + 1;
      }

      await sb
        .from('profiles')
        .update({ 
          daily_contracts_count: newCount,
          daily_contracts_date: today
        })
        .eq('id', session.user.id);
    }
  } catch (error) {
    console.error('Erreur objectif quotidien:', error);
  }
  
  // Rediriger vers game.html
  window.location.href = 'game.html';
}
```

---

## ✅ VÉRIFICATION

Pour vérifier que ça fonctionne :

1. Jouer à un mini-jeu
2. Retourner sur menutravailler.html
3. Vérifier que le compteur a augmenté : "1/3"
4. Jouer 2 autres mini-jeux
5. Le compteur devrait afficher "3/3" et donner le bonus de 500€

---

## 🎯 RÉSULTAT ATTENDU

- Après chaque partie terminée → compteur +1
- Compteur reset automatiquement chaque jour
- À 3/3 → popup "🎉 Objectif complété ! +500€"
- Bonus donné une seule fois par jour
