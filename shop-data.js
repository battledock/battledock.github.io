const supabaseUrl = 'https://drtsuhnbclhmgfjiykap.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydHN1aG5iY2xobWdmaml5a2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NDIzODksImV4cCI6MjA5NDQxODM4OX0.68cvRa8xhrSDt2nnEEp7pagL7NT5ugRtOhKLGX2CQJg';
const { createClient } = supabase;
const sb = createClient(supabaseUrl, supabaseKey);

let currentUser = null;
let currentTab = 'lootboxes';
let userInventory = [];

// DONNÉES DU SHOP
const shopData = {
  lootboxes: [
    {
      id: 'lootbox_bronze',
      name: 'Coffre Bronze',
      icon: '📦',
      price: 1000,
      currency: 'money',
      class: 'lootbox-bronze',
      odds: {
        common: 70,
        rare: 25,
        epic: 5,
        legendary: 0
      }
    },
    {
      id: 'lootbox_silver',
      name: 'Coffre Diamant',
      icon: '💎',
      price: 30,
      currency: 'diamonds',
      class: 'lootbox-silver',
      odds: {
        common: 0,
        rare: 50,
        epic: 40,
        legendary: 10
      }
    },
    {
      id: 'lootbox_gold',
      name: 'Coffre Légendaire',
      icon: '👑',
      price: 5,
      currency: 'trophies',
      class: 'lootbox-gold',
      odds: {
        common: 0,
        rare: 0,
        epic: 0,
        legendary: 100
      }
    }
  ],

  frames: [
    // COMMUNS
    { id: 'frame_simple', name: 'Cadre Simple', price: 500, currency: 'money', rarity: 'common', color: '#9ca3af' },
    { id: 'frame_wood', name: 'Cadre Bois', price: 800, currency: 'money', rarity: 'common', color: '#92400e' },
    
    // RARES
    { id: 'frame_blue', name: 'Cadre Bleu', price: 15, currency: 'diamonds', rarity: 'rare', color: '#3b82f6' },
    { id: 'frame_green', name: 'Cadre Vert', price: 15, currency: 'diamonds', rarity: 'rare', color: '#10b981' },
    { id: 'frame_purple', name: 'Cadre Violet', price: 20, currency: 'diamonds', rarity: 'rare', color: '#a855f7' },
    
    // ÉPIQUES
    { id: 'frame_diamond', name: 'Cadre Diamant', price: 40, currency: 'diamonds', rarity: 'epic', color: '#06b6d4', style: 'double' },
    { id: 'frame_fire', name: 'Cadre Flammes', price: 45, currency: 'diamonds', rarity: 'epic', color: '#ef4444', animated: true },
    
    // LÉGENDAIRES
    { id: 'frame_gold', name: 'Cadre Royal', price: 8, currency: 'trophies', rarity: 'legendary', color: '#fbbf24', style: 'double', animated: true },
    { id: 'frame_rainbow', name: 'Cadre Arc-en-ciel', price: 12, currency: 'trophies', rarity: 'legendary', color: 'rainbow', animated: true }
  ],

  titles: [
    // COMMUNS
    { id: 'title_docker', name: 'Le Docker', price: 500, currency: 'money', rarity: 'common' },
    { id: 'title_worker', name: 'Le Travailleur', price: 800, currency: 'money', rarity: 'common' },
    { id: 'title_fast', name: 'Le Rapide', price: 1000, currency: 'money', rarity: 'common' },
    
    // RARES
    { id: 'title_captain', name: 'Capitaine du Port', price: 18, currency: 'diamonds', rarity: 'rare' },
    { id: 'title_expert', name: 'Expert Docker', price: 20, currency: 'diamonds', rarity: 'rare' },
    { id: 'title_master', name: 'Maître Docker', price: 25, currency: 'diamonds', rarity: 'rare' },
    
    // ÉPIQUES
    { id: 'title_lord', name: 'Seigneur des Docks', price: 45, currency: 'diamonds', rarity: 'epic' },
    { id: 'title_legend', name: 'Légende Portuaire', price: 50, currency: 'diamonds', rarity: 'epic' },
    
    // LÉGENDAIRES
    { id: 'title_king', name: 'Roi du Port', price: 10, currency: 'trophies', rarity: 'legendary' },
    { id: 'title_god', name: 'Dieu du Docker', price: 15, currency: 'trophies', rarity: 'legendary' }
  ],

  avatars: [
    { id: 'avatar_1', icon: '👷', name: 'Docker Casque', price: 500, currency: 'money', rarity: 'common' },
    { id: 'avatar_2', icon: '👨‍🔧', name: 'Docker Pro', price: 800, currency: 'money', rarity: 'common' },
    { id: 'avatar_5', icon: '🌊', name: 'Docker Océan', price: 15, currency: 'diamonds', rarity: 'rare' },
    { id: 'avatar_9', icon: '🌟', name: 'Docker Étoile', price: 40, currency: 'diamonds', rarity: 'epic' },
    { id: 'avatar_11', icon: '👑', name: 'Roi du Dock', price: 5, currency: 'trophies', rarity: 'legendary' }
  ],

  couleurs: [
    { id: 'color_green', name: 'Vert', price: 800, currency: 'money', rarity: 'common', color: '#10b981' },
    { id: 'color_purple', name: 'Violet', price: 12, currency: 'diamonds', rarity: 'rare', color: '#a855f7' },
    { id: 'color_black', name: 'Noir', price: 35, currency: 'diamonds', rarity: 'epic', color: '#1a1a1a' },
    { id: 'color_gold', name: 'Or', price: 8, currency: 'trophies', rarity: 'legendary', color: '#fbbf24' }
  ]
};

async function init() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    window.location.href = 'index.html';
    return;
  }
  
  currentUser = session.user;
  await loadCurrencies();
  await loadInventory();
  renderShop();
}

async function loadCurrencies() {
  const { data: profile } = await sb
    .from('profiles')
    .select('diamonds, trophies')
    .eq('user_id', currentUser.id)
    .single();

  const { data: stats } = await sb
    .from('game_stats')
    .select('money')
    .eq('user_id', currentUser.id)
    .single();

  document.getElementById('userMoney').textContent = (stats?.money || 0).toLocaleString('fr-FR') + '€';
  document.getElementById('userDiamonds').textContent = profile?.diamonds || 0;
  document.getElementById('userTrophies').textContent = profile?.trophies || 0;
}

async function loadInventory() {
  const { data } = await sb
    .from('user_inventory')
    .select('item_id, item_type')
    .eq('user_id', currentUser.id);
  
  userInventory = data || [];
}

function switchTab(e, tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  e.target.classList.add('active');
  renderShop();
}

function renderShop() {
  const content = document.getElementById('shopContent');
  
  if (currentTab === 'lootboxes') {
    renderLootboxes(content);
  } else {
    renderItems(content);
  }
}

function renderLootboxes(content) {
  const items = shopData.lootboxes;
  
  content.innerHTML = `
    <div class="section-title">🎰 Coffres Mystères</div>
    <div class="shop-grid">
      ${items.map(box => `
        <div class="lootbox-item ${box.class}" onclick="openLootbox('${box.id}', ${box.price}, '${box.currency}')">
          <div class="lootbox-icon">${box.icon}</div>
          <div class="lootbox-name">${box.name}</div>
          <div class="lootbox-odds">
            ${box.odds.common > 0 ? `Commun: ${box.odds.common}%<br>` : ''}
            ${box.odds.rare > 0 ? `Rare: ${box.odds.rare}%<br>` : ''}
            ${box.odds.epic > 0 ? `Épique: ${box.odds.epic}%<br>` : ''}
            ${box.odds.legendary > 0 ? `Légendaire: ${box.odds.legendary}%` : ''}
          </div>
          <div class="shop-item-price ${box.currency === 'money' ? 'price-money' : box.currency === 'diamonds' ? 'price-diamonds' : 'price-trophies'}">
            <span>${box.currency === 'money' ? '💰' : box.currency === 'diamonds' ? '💎' : '🏆'}</span>
            <span>${box.price.toLocaleString('fr-FR')}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderItems(content) {
  const items = shopData[currentTab];
  const rarityGroups = {
    legendary: items.filter(i => i.rarity === 'legendary'),
    epic: items.filter(i => i.rarity === 'epic'),
    rare: items.filter(i => i.rarity === 'rare'),
    common: items.filter(i => i.rarity === 'common')
  };

  let html = '';
  
  const rarityLabels = {
    legendary: { title: '✨ Légendaire', badge: 'Ultra Rare' },
    epic: { title: '💜 Épique', badge: 'Rare' },
    rare: { title: '💎 Rare', badge: 'Peu Commun' },
    common: { title: '⚪ Commun', badge: '' }
  };

  for (const [rarity, items] of Object.entries(rarityGroups)) {
    if (items.length === 0) continue;
    
    const label = rarityLabels[rarity];
    html += `
      <div class="section-title">
        ${label.title}
        ${label.badge ? `<span class="rarity-badge rarity-${rarity}">${label.badge}</span>` : ''}
      </div>
      <div class="shop-grid">
        ${items.map(item => renderItem(item)).join('')}
      </div>
    `;
  }

  content.innerHTML = html;
}

function renderItem(item) {
  const owned = userInventory.some(i => i.item_id === item.id);
  const priceIcon = item.currency === 'money' ? '💰' : item.currency === 'diamonds' ? '💎' : '🏆';
  const priceClass = item.currency === 'money' ? 'price-money' : item.currency === 'diamonds' ? 'price-diamonds' : 'price-trophies';
  
  if (currentTab === 'frames') {
    return `
      <div class="shop-item ${item.rarity} ${owned ? 'owned' : ''}" onclick="${owned ? '' : `buyItem('${item.id}', ${item.price}, '${item.currency}', 'frame')`}">
        <div class="frame-preview">
          <div class="frame-border" style="border-color: ${item.color}; ${item.style === 'double' ? 'border-width: 6px;' : ''}"></div>
          <div class="frame-avatar">👤</div>
        </div>
        <div class="shop-item-name">${item.name}</div>
        <div class="shop-item-price ${priceClass}">
          <span>${priceIcon}</span>
          <span>${item.price.toLocaleString('fr-FR')}</span>
        </div>
      </div>
    `;
  }

  if (currentTab === 'titles') {
    return `
      <div class="shop-item ${item.rarity} ${owned ? 'owned' : ''}" onclick="${owned ? '' : `buyItem('${item.id}', ${item.price}, '${item.currency}', 'title')`}">
        <div class="shop-item-icon">📛</div>
        <div class="shop-item-name">${item.name}</div>
        <div class="shop-item-price ${priceClass}">
          <span>${priceIcon}</span>
          <span>${item.price.toLocaleString('fr-FR')}</span>
        </div>
      </div>
    `;
  }

  if (currentTab === 'couleurs') {
    return `
      <div class="shop-item ${item.rarity} ${owned ? 'owned' : ''}" onclick="${owned ? '' : `buyItem('${item.id}', ${item.price}, '${item.currency}', 'color')`}">
        <div class="shop-item-icon" style="color: ${item.color}">⬤</div>
        <div class="shop-item-name">${item.name}</div>
        <div class="shop-item-price ${priceClass}">
          <span>${priceIcon}</span>
          <span>${item.price.toLocaleString('fr-FR')}</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="shop-item ${item.rarity} ${owned ? 'owned' : ''}" onclick="${owned ? '' : `buyItem('${item.id}', ${item.price}, '${item.currency}', 'avatar')`}">
      <div class="shop-item-icon">${item.icon}</div>
      <div class="shop-item-name">${item.name}</div>
      <div class="shop-item-price ${priceClass}">
        <span>${priceIcon}</span>
        <span>${item.price.toLocaleString('fr-FR')}</span>
      </div>
    </div>
  `;
}

async function buyItem(itemId, price, currency, itemType) {
  try {
    // Vérifier monnaie
    const { data: profile } = await sb.from('profiles').select('diamonds, trophies').eq('user_id', currentUser.id).single();
    const { data: stats } = await sb.from('game_stats').select('money').eq('user_id', currentUser.id).single();

    const userMoney = currency === 'money' ? stats.money : currency === 'diamonds' ? profile.diamonds : profile.trophies;

    if (userMoney < price) {
      alert('Pas assez de ' + (currency === 'money' ? 'euros' : currency === 'diamonds' ? 'diamants' : 'trophées') + ' !');
      return;
    }

    // Déduire le prix
    if (currency === 'money') {
      await sb.from('game_stats').update({ money: stats.money - price }).eq('user_id', currentUser.id);
    } else if (currency === 'diamonds') {
      await sb.from('profiles').update({ diamonds: profile.diamonds - price }).eq('user_id', currentUser.id);
    } else {
      await sb.from('profiles').update({ trophies: profile.trophies - price }).eq('user_id', currentUser.id);
    }

    // Ajouter à l'inventaire
    await sb.from('user_inventory').insert({
      user_id: currentUser.id,
      item_id: itemId,
      item_type: itemType
    });

    alert('✅ Acheté avec succès !');
    await loadCurrencies();
    await loadInventory();
    renderShop();
  } catch (error) {
    console.error(error);
    alert('Erreur lors de l\'achat');
  }
}

async function openLootbox(boxId, price, currency) {
  const box = shopData.lootboxes.find(b => b.id === boxId);
  if (!box) return;

  try {
    // Vérifier monnaie
    const { data: profile } = await sb.from('profiles').select('diamonds, trophies').eq('user_id', currentUser.id).single();
    const { data: stats } = await sb.from('game_stats').select('money').eq('user_id', currentUser.id).single();

    const userMoney = currency === 'money' ? stats.money : currency === 'diamonds' ? profile.diamonds : profile.trophies;

    if (userMoney < price) {
      alert('Pas assez de ' + (currency === 'money' ? 'euros' : currency === 'diamonds' ? 'diamants' : 'trophées') + ' !');
      return;
    }

    // Déduire le prix
    if (currency === 'money') {
      await sb.from('game_stats').update({ money: stats.money - price }).eq('user_id', currentUser.id);
    } else if (currency === 'diamonds') {
      await sb.from('profiles').update({ diamonds: profile.diamonds - price }).eq('user_id', currentUser.id);
    } else {
      await sb.from('profiles').update({ trophies: profile.trophies - price }).eq('user_id', currentUser.id);
    }

    // Tirer au sort
    const rarity = rollRarity(box.odds);
    const allItems = [...shopData.frames, ...shopData.titles, ...shopData.avatars].filter(i => i.rarity === rarity);
    const wonItem = allItems[Math.floor(Math.random() * allItems.length)];

    // Ajouter à l'inventaire
    await sb.from('user_inventory').insert({
      user_id: currentUser.id,
      item_id: wonItem.id,
      item_type: wonItem.icon ? 'avatar' : wonItem.color ? 'frame' : 'title'
    });

    alert(`🎉 Vous avez gagné :\n${wonItem.name} (${rarity.toUpperCase()}) !`);
    
    await loadCurrencies();
    await loadInventory();
    renderShop();
  } catch (error) {
    console.error(error);
    alert('Erreur : ' + error.message);
  }
}

function rollRarity(odds) {
  const roll = Math.random() * 100;
  let cumulative = 0;
  
  for (const [rarity, chance] of Object.entries(odds)) {
    cumulative += chance;
    if (roll < cumulative) return rarity;
  }
  
  return 'common';
}

init();
