# 🎰 DERNIERS GAINS - INSTRUCTIONS D'INTÉGRATION

## ✅ CE QUI A ÉTÉ FAIT

1. **Table Supabase créée** : `casino_wins`
2. **SQL fourni** : `SQL_CASINO_WINS.sql`
3. **Casino.html modifié** : Charge les vrais gains au lieu du feed statique

---

## 📝 CE QU'IL FAUT FAIRE

### **ÉTAPE 1 : Exécuter le SQL dans Supabase**

1. Ouvre Supabase → SQL Editor
2. Copie-colle le contenu de `SQL_CASINO_WINS.sql`
3. Exécute le script
4. Vérifie que la table `casino_wins` existe

---

### **ÉTAPE 2 : Ajouter le code dans CHAQUE jeu**

Dans **chaque fichier de jeu** (roulette.html, blackjack.html, slots.html, crash.html, higher-lower.html), ajoute cette fonction APRÈS la fonction `updateMoney` :

```javascript
async function saveWin(gameName, amountWon) {
  if (amountWon <= 0) return; // Ne sauvegarder que les vrais gains
  
  try {
    // Récupérer le pseudo de l'utilisateur
    const { data: { user } } = await sb.auth.getUser();
    const userName = user.email.split('@')[0]; // Utilise la partie avant @
    
    await sb.from('casino_wins').insert({
      user_id: user.id,
      user_name: userName,
      game_name: gameName,
      amount_won: amountWon
    });
  } catch (error) {
    console.log('Erreur sauvegarde gain:', error);
  }
}
```

---

### **ÉTAPE 3 : Appeler saveWin quand le joueur gagne**

**ROULETTE** - Ligne ~530 après `await updateMoney(currentMoney + win)` :
```javascript
if (win > 0) {
  await updateMoney(currentMoney + win);
  await saveWin('Roulette', win); // ← AJOUTER ICI
}
```

**BLACKJACK** - Ligne ~570 après les gains :
```javascript
if (win > 0) {
  await updateMoney(currentMoney + win);
  await saveWin('Blackjack', win); // ← AJOUTER ICI
}
```

**SLOTS** - Ligne ~440 après le gain :
```javascript
const win = bet * mult;
await updateMoney(currentMoney + win);
await saveWin('Slots', win); // ← AJOUTER ICI
```

**CRASH** - Ligne ~360 après cashout :
```javascript
await updateMoney(currentMoney + win);
await saveWin('Crash', win); // ← AJOUTER ICI
```

**HIGHER/LOWER** - Ligne ~380 après le gain :
```javascript
await updateMoney(currentMoney + win);
await saveWin('Higher/Lower', win); // ← AJOUTER ICI
```

---

## 🎯 RÉSULTAT FINAL

Après intégration, le feed "DERNIERS GAINS" affichera :
- ✅ Les **VRAIS pseudos** des joueurs (partie avant @)
- ✅ Les **VRAIS gains** (montants réels)
- ✅ Le **bon jeu** (Roulette, Blackjack, etc.)
- ✅ En **temps réel** (les 10 derniers gains)

**Exemple d'affichage :**
```
🎡 john.doe a gagné 1,200€ à la Roulette !
♠️ alice a gagné 3,500€ au Blackjack !
🎰 bob a gagné 800€ au Slots !
```

---

## ⚠️ NOTES IMPORTANTES

- Les gains sont **publics** (tout le monde peut les voir)
- Seuls les **vrais gains > 0** sont enregistrés
- Les **100 derniers gains** sont conservés (nettoyage auto)
- Le **pseudo** vient de l'email de l'utilisateur

