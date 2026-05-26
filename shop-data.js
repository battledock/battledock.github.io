const SUPABASE_URL = 'https://drtsuhnbclhmgfjiykap.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydHN1aG5iY2xobWdmaml5a2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NDIzODksImV4cCI6MjA5NDQxODM4OX0.68cvRa8xhrSDt2nnEEp7pagL7NT5ugRtOhKLGX2CQJg';
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
let userProfile = null;

// DONNÉES DU SHOP
const SHOP_DATA = {
  lootboxes: [
    {
      id: 'bronze',
      name: 'Coffre Bronze',
      icon: '📦',
      price: { money: 100 },
      rarity: 'common',
      odds: '🎰 1-5 Diamants'
    },
    {
      id: 'silver',
      name: 'Coffre Argent',
      icon: '🎁',
      price: { money: 500 },
      rarity: 'rare',
      odds: '🎰 5-15 Diamants'
    },
    {
      id: 'gold',
      name: 'Coffre Or',
      icon: '⭐',
      price: { diamonds: 50 },
      rarity: 'legendary',
      odds: '🎰 20-50 Diamants'
    }
  ],
  frames: [
    {
      id: 'frame_gold',
      name: 'Cadre Or',
      icon: '🟨',
      color: '#fbbf24',
      price: { diamonds: 25 },
      rarity: 'rare'
    },
    {
      id: 'frame_purple',
      name: 'Cadre Violet',
      icon: '🟪',
      color: '#a855f7',
      price: { diamonds: 35 },
      rarity: 'epic'
    },
    {
      id: 'frame_rainbow',
      name: 'Cadre Arc-en-ciel',
      icon: '🌈',
      color: 'linear-gradient(90deg, #ff0000, #00ff00, #0000ff)',
      price: { diamonds: 100 },
      rarity: 'legendary'
    }
  ],
  titles: [
    {
      id: 'title_docker',
      name: 'Docker Elite',
      icon: '⚓',
      price: { trophies: 10 },
      rarity: 'rare'
    },
    {
      id: 'title_captain',
      name: 'Capitaine',
      icon: '🧑‍✈️',
      price: { trophies: 25 },
      rarity: 'epic'
    },
    {
      id: 'title_legend',
      name: 'Légende du Port',
      icon: '👑',
      price: { trophies: 50 },
      rarity: 'legendary'
    }
  ],
  avatars: [
    {
      id: 'avatar_pirate',
      name: 'Pirate',
      icon: '🏴‍☠️',
      price: { diamonds: 20 },
      rarity: 'rare'
    },
    {
      id: 'avatar_sailor',
      name: 'Marin',
      icon: '⛵',
      price: { diamonds: 20 },
      rarity: 'rare'
    },
    {
      id: 'avatar_captain',
      name: 'Commandant',
      icon: '👨‍⚓',
      price: { diamonds: 50 },
      rarity: 'epic'
    }
  ],
  couleurs: [
    {
      id: 'color_blue',
      name: 'Bleu',
      icon: '🔵',
      color: '#3b82f6',
      price: { money: 50 },
      rarity: 'common'
    },
    {
      id: 'color_purple',
      name: 'Violet',
      icon: '🟣',
      color: '#a855f7',
      price: { money: 100 },
      rarity: 'rare'
    },
    {
      id: 'color_gold',
      name: 'Or',
      icon: '🟨',
      color: '#fbbf24',
      price: { diamonds: 25 },
      rarity: 'epic'
    }
  ]
};

async function init() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    window.location.href = 'index.html';
    return;
  }
  
  currentUser = session.user;
  
  // Charger le profil
  const { data: profile } = await sb
    .from('profiles')
    .select('*')
    .eq('id', currentUser.id)
    .single();
  
  userProfile = profile;
  
  updateDisplay();
  switchTab(null, 'lootboxes');
}

function updateDisplay() {
  document.getElementById('userMoney').textContent = (userProfile?.money || 0).toLocaleString('fr-FR') + '€';
  document.getElementById('userDiamonds').textContent = userProfile?.diamonds || 0;
  document.getElementById('userTrophies').textContent = userProfile?.trophies || 0;
}

function switchTab(event, tab) {
  // Mettre à jour les boutons
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  if (event) event.target.classList.add('active');
  else document.querySelector(`.tab[onclick*="'${tab}'"]`)?.classList.add('active');
  
  // Afficher le contenu
  const content = document.getElementById('shopContent');
  const items = SHOP_DATA[tab] || [];
  
  if (tab === 'lootboxes') {
    content.innerHTML = `
      <div class="section-title">🎰 Coffres à Ouvrir</div>
      <div class="shop-grid">
        ${items.map(item => `
          <div class="lootbox-item lootbox-${item.id.split('_')[1]}">
            <div class="lootbox-icon">${item.icon}</div>
            <div class="lootbox-name">${item.name}</div>
            <div class="lootbox-odds">${item.odds}</div>
            <div class="shop-item-price">
              ${item.price.money ? `<span class="price-money">${item.price.money}€</span>` : ''}
              ${item.price.diamonds ? `<span class="price-diamonds">💎${item.price.diamonds}</span>` : ''}
            </div>
            <button onclick="buyItem('${item.id}', '${tab}')" style="width: 100%; margin-top: 12px; padding: 8px; border: none; border-radius: 8px; background: #10b981; color: white; cursor: pointer; font-weight: 600;">Acheter</button>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    content.innerHTML = `
      <div class="section-title">${['🖼️ Cadres', '📛 Titres', '👤 Avatars', '🎨 Couleurs'][['frames', 'titles', 'avatars', 'couleurs'].indexOf(tab)]}</div>
      <div class="shop-grid">
        ${items.map(item => `
          <div class="shop-item ${item.rarity} ${isOwned(item.id) ? 'owned' : ''}" onclick="buyItem('${item.id}', '${tab}')">
            <div class="shop-item-icon">${item.icon}</div>
            <div class="shop-item-name">${item.name}</div>
            <span class="rarity-badge rarity-${item.rarity}"></span>
            <div class="shop-item-price" style="margin-top: 8px;">
              ${item.price.money ? `<span class="price-money">${item.price.money}€</span>` : ''}
              ${item.price.diamonds ? `<span class="price-diamonds">💎${item.price.diamonds}</span>` : ''}
              ${item.price.trophies ? `<span class="price-trophies">🏆${item.price.trophies}</span>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

function isOwned(itemId) {
  // À implémenter : vérifier si l'utilisateur possède l'item
  return false;
}

async function buyItem(itemId, category) {
  const item = SHOP_DATA[category].find(i => i.id === itemId);
  if (!item) return;
  
  const price = item.price;
  
  // Vérifier si on a assez de ressources
  if (price.money && userProfile.money < price.money) {
    alert('❌ Pas assez d\'argent!');
    return;
  }
  if (price.diamonds && userProfile.diamonds < price.diamonds) {
    alert('❌ Pas assez de diamants!');
    return;
  }
  if (price.trophies && userProfile.trophies < price.trophies) {
    alert('❌ Pas assez de trophées!');
    return;
  }
  
  try {
    // Déduire les ressources
    const newMoney = userProfile.money - (price.money || 0);
    const newDiamonds = userProfile.diamonds - (price.diamonds || 0);
    const newTrophies = userProfile.trophies - (price.trophies || 0);
    
    // Mettre à jour le profil
    await sb
      .from('profiles')
      .update({
        money: newMoney,
        diamonds: newDiamonds,
        trophies: newTrophies
      })
      .eq('id', currentUser.id);
    
    // Mettre à jour localement
    userProfile.money = newMoney;
    userProfile.diamonds = newDiamonds;
    userProfile.trophies = newTrophies;
    
    updateDisplay();
    alert(`✅ Achat réussi! ${item.name}`);
    
  } catch (error) {
    console.error('Erreur achat:', error);
    alert('❌ Erreur lors de l\'achat');
  }
}

// Initialiser au chargement
init();
