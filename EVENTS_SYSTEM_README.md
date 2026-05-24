# SYSTÈME D'ÉVÉNEMENTS EXCLUSIFS - INSTRUCTIONS

## 🎯 OBJECTIF
Rendre les avatars d'événements VRAIMENT exclusifs et limités dans le temps.

## 📋 ÉTAPE 1 : AJOUTER LA COLONNE EN DB

### Via Supabase Dashboard :
1. Ouvre Supabase Dashboard
2. Va dans "SQL Editor"
3. Copie-colle le contenu de `add_events_claimed_column.sql`
4. Clique sur "Run"
5. Vérifie que ça affiche : "Success. No rows returned"

### Ou via ligne de commande :
```bash
psql -h db.xxx.supabase.co -U postgres -d postgres -f add_events_claimed_column.sql
```

## ✅ VÉRIFICATION

Après avoir exécuté le SQL, vérifie que la colonne existe :

```sql
SELECT * FROM game_stats LIMIT 1;
```

Tu devrais voir une nouvelle colonne `events_claimed` avec la valeur `{}` (tableau vide).

## 🎮 FONCTIONNEMENT

### Événement "Semaine de Lancement"
- **ID**: `launch-week`
- **Date fin**: 31 Mai 2026 23:59:59
- **Mission**: Atteindre niveau 5
- **Récompenses**: 5,000€ + Avatar exclusif

### États possibles :

#### 1️⃣ Avant le 31 Mai - Niveau < 5
```
Message : "⏳ Atteins le niveau 5 pour récupérer tes récompenses (X jours restants)"
```

#### 2️⃣ Avant le 31 Mai - Niveau ≥ 5 - Pas encore récupéré
```
Bouton : "🎁 Récupérer mes récompenses"
```

Au clic :
- Ajoute 5,000€
- Ajoute 'launch-week' au tableau events_claimed
- Débloque l'avatar dans le profil

#### 3️⃣ Avant le 31 Mai - Déjà récupéré
```
Message : "✓ Récompenses récupérées !"
```

#### 4️⃣ Après le 31 Mai - Pas récupéré
```
Message : "❌ Événement terminé - Avatar non récupéré"
```
L'avatar reste VERROUILLÉ à jamais.

#### 5️⃣ Après le 31 Mai - Récupéré
```
Message : "✓ Récompenses récupérées !"
```
L'avatar reste DÉBLOQUÉ.

## 🔒 EXCLUSIVITÉ

### Dans la DB :
```sql
-- Joueur qui a récupéré
events_claimed: ['launch-week']

-- Joueur qui n'a PAS récupéré
events_claimed: []
```

### Dans profil.html :
```javascript
// Avatar débloqué UNIQUEMENT si dans le tableau
condition: () => eventsClaimed.includes('launch-week')
```

**Résultat :**
- ✅ Si tu as claim avant le 31 Mai → Avatar débloqué
- ❌ Si tu n'as PAS claim avant le 31 Mai → Avatar JAMAIS débloqué

## 🚀 FUTURS ÉVÉNEMENTS

Pour ajouter un nouvel événement, il suffit d'ajouter un nouveau ID :

```javascript
// Événement Halloween
events_claimed: ['launch-week', 'halloween-2026']

// Événement Noël
events_claimed: ['launch-week', 'halloween-2026', 'noel-2026']
```

Scalable à l'infini !

## 📊 QUERIES UTILES

### Voir qui a récupéré l'événement :
```sql
SELECT user_id, events_claimed 
FROM game_stats 
WHERE 'launch-week' = ANY(events_claimed);
```

### Compter les récupérations :
```sql
SELECT COUNT(*) 
FROM game_stats 
WHERE 'launch-week' = ANY(events_claimed);
```

### Voir tous les événements récupérés par un joueur :
```sql
SELECT events_claimed 
FROM game_stats 
WHERE user_id = 'xxx';
```

## 🎉 RÉSULTAT FINAL

**L'avatar "Lancement" devient VRAIMENT exclusif :**
- Limité dans le temps (jusqu'au 31 Mai 2026)
- Impossible à obtenir après
- Badge de prestige pour les joueurs présents au lancement
- Collection qui a de la valeur

**Les joueurs qui rejoignent en Juin 2026 verront l'avatar grisé avec 🔒 et ne pourront JAMAIS le débloquer !**
