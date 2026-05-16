// =====================================================
// BATTLE DOCK - MODULE XP CLIENT
// Gestion de l'expérience côté frontend
// =====================================================

class XPManager {
  constructor(supabaseClient, userId) {
    this.supabase = supabaseClient;
    this.userId = userId;
  }

  /**
   * Ajouter de l'XP à un joueur
   * @param {string} actionType - Type d'action (ex: 'container_processed')
   * @param {number} multiplier - Multiplicateur d'XP (défaut: 1.0)
   * @returns {Promise<Object>} Résultat avec xp_gained, level_up, etc.
   */
  async addXP(actionType, multiplier = 1.0) {
    try {
      const { data, error } = await this.supabase.rpc('add_xp', {
        p_user_id: this.userId,
        p_action_type: actionType,
        p_multiplier: multiplier
      });

      if (error) throw error;

      const result = data[0];
      
      // Si montée de niveau, afficher notification
      if (result.level_up) {
        await this.showLevelUpNotification(result);
      }

      return result;
    } catch (error) {
      console.error('Erreur ajout XP:', error);
      return null;
    }
  }

  /**
   * Gérer le streak de connexion quotidienne
   * @returns {Promise<Object>} Info sur le streak
   */
  async handleLoginStreak() {
    try {
      const { data, error } = await this.supabase.rpc('handle_login_streak', {
        p_user_id: this.userId
      });

      if (error) throw error;

      const result = data[0];

      // Afficher notification de streak si milestone
      if (result.streak_milestone) {
        this.showStreakNotification(result.current_streak);
      }

      return result;
    } catch (error) {
      console.error('Erreur streak:', error);
      return null;
    }
  }

  /**
   * Obtenir la progression vers le prochain niveau
   * @returns {Promise<Object>} Progression actuelle
   */
  async getLevelProgress() {
    try {
      const { data, error } = await this.supabase.rpc('get_level_progress', {
        p_user_id: this.userId
      });

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erreur progression:', error);
      return null;
    }
  }

  /**
   * Obtenir l'XP total du joueur
   * @returns {Promise<number>} XP total
   */
  async getTotalXP() {
    try {
      const { data, error } = await this.supabase.rpc('get_total_xp', {
        p_user_id: this.userId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur XP total:', error);
      return 0;
    }
  }

  /**
   * Obtenir l'historique XP récent
   * @param {number} hours - Nombre d'heures à remonter (défaut: 24)
   * @returns {Promise<Array>} Historique XP
   */
  async getXPHistory(hours = 24) {
    try {
      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - hours);

      const { data, error } = await this.supabase
        .from('xp_history')
        .select('*')
        .eq('user_id', this.userId)
        .gte('created_at', cutoff.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur historique XP:', error);
      return [];
    }
  }

  /**
   * Obtenir les infos d'un niveau spécifique
   * @param {number} level - Numéro du niveau
   * @returns {Promise<Object>} Infos du niveau
   */
  async getLevelInfo(level) {
    try {
      const { data, error } = await this.supabase
        .from('levels')
        .select('*')
        .eq('level', level)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur info niveau:', error);
      return null;
    }
  }

  /**
   * Obtenir tous les déblocages du joueur
   * @returns {Promise<Array>} Liste des fonctionnalités débloquées
   */
  async getUnlocks() {
    try {
      // Récupérer le niveau actuel
      const { data: progress, error: progressError } = await this.supabase
        .from('game_progress')
        .select('level')
        .eq('user_id', this.userId)
        .single();

      if (progressError) throw progressError;

      // Récupérer tous les déblocages jusqu'au niveau actuel
      const { data: levels, error: levelsError } = await this.supabase
        .from('levels')
        .select('unlocks')
        .lte('level', progress.level);

      if (levelsError) throw levelsError;

      // Fusionner tous les déblocages
      const unlocks = new Set();
      levels.forEach(level => {
        if (level.unlocks) {
          level.unlocks.forEach(unlock => unlocks.add(unlock));
        }
      });

      return Array.from(unlocks);
    } catch (error) {
      console.error('Erreur déblocages:', error);
      return [];
    }
  }

  /**
   * Vérifier si une fonctionnalité est débloquée
   * @param {string} feature - Nom de la fonctionnalité
   * @returns {Promise<boolean>} True si débloquée
   */
  async isUnlocked(feature) {
    const unlocks = await this.getUnlocks();
    return unlocks.includes(feature);
  }

  /**
   * Afficher une notification de montée de niveau
   * @param {Object} result - Résultat de add_xp
   */
  async showLevelUpNotification(result) {
    const levelInfo = await this.getLevelInfo(result.new_level);
    
    let message = `🎉 NIVEAU ${result.new_level} !\n\n`;
    message += `👑 ${levelInfo.title}\n\n`;
    
    if (result.bonus_money > 0) {
      message += `💰 Bonus : ${result.bonus_money.toLocaleString()}€\n`;
    }
    
    if (levelInfo.unlocks && levelInfo.unlocks.length > 0) {
      message += `\n✨ Déblocages :\n`;
      levelInfo.unlocks.forEach(unlock => {
        message += `• ${this.formatUnlock(unlock)}\n`;
      });
    }

    if (levelInfo.skin) {
      message += `\n🎨 Skin débloqué : ${levelInfo.skin}`;
    }

    if (levelInfo.badge) {
      message += `\n🏆 Badge obtenu : ${levelInfo.badge}`;
    }

    alert(message);
  }

  /**
   * Afficher une notification de streak
   * @param {number} streak - Nombre de jours consécutifs
   */
  showStreakNotification(streak) {
    let message = `🔥 SÉRIE DE ${streak} JOURS !\n\n`;
    
    if (streak === 7) {
      message += `🎁 Bonus 7 jours : +100 XP\n`;
      message += `Continue comme ça !`;
    } else if (streak === 30) {
      message += `🏆 SÉRIE LÉGENDAIRE !\n`;
      message += `🎁 Bonus 30 jours : +500 XP\n`;
      message += `Tu es incroyable !`;
    }

    alert(message);
  }

  /**
   * Formater le nom d'un déblocage pour l'affichage
   * @param {string} unlock - Nom technique du déblocage
   * @returns {string} Nom formaté
   */
  formatUnlock(unlock) {
    const unlockNames = {
      'zone_travail': 'Zone de Travail',
      'missions_quotidiennes': 'Missions Quotidiennes',
      'missions_hebdomadaires': 'Missions Hebdomadaires',
      'shop': 'Boutique',
      'social': 'Hub Social',
      'amis': 'Système d\'Amis',
      'chat': 'Chat Global',
      'duels': 'Duels PVP',
      'casino': 'Casino',
      'compagnies': 'Compagnies',
      'cadeaux': 'Cadeaux',
      'mariage': 'Mariage',
      'tournois': 'Tournois',
      'poker': 'Poker',
      'guerres': 'Guerres de Compagnies',
      'des': 'Jeu de Dés',
      'annonces': 'Annonces Publiques',
      'syndicat': 'Syndicat',
      'marche_noir': 'Marché Noir',
      'evenements': 'Événements',
      'divorce': 'Divorce',
      'tournois_premium': 'Tournois Premium',
      'zone_premium': 'Zone Premium',
      'statut_vip': 'Statut VIP',
      'zone_premium_2': 'Zone Premium 2',
      'quartier_general': 'Quartier Général',
      'commerce_international': 'Commerce International',
      'casino_vip': 'Casino VIP',
      'bureau_personnel': 'Bureau Personnel',
      'mode_divin': 'Mode Divin',
      'marche_noir_vip': 'Marché Noir VIP',
      'energie_illimitee': 'Énergie Illimitée',
      'statue_personnelle': 'Statue Personnelle'
    };

    return unlockNames[unlock] || unlock;
  }

  /**
   * Afficher la barre de progression XP
   * @param {string} containerId - ID du container HTML
   */
  async renderProgressBar(containerId) {
    const progress = await this.getLevelProgress();
    if (!progress) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    const percentage = Math.min(progress.progress_percentage, 100);

    container.innerHTML = `
      <div style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-family: 'Fredoka', sans-serif; font-size: 14px; font-weight: 700;">
          Niveau ${progress.current_level}
        </span>
        <span style="font-size: 12px; color: #64748b;">
          ${progress.current_xp} / ${progress.xp_required} XP
        </span>
      </div>
      <div style="width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
        <div style="
          width: ${percentage}%;
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #1d4ed8);
          transition: width 0.3s ease;
        "></div>
      </div>
      <div style="margin-top: 4px; font-size: 11px; color: #94a3b8; text-align: center;">
        Prochain niveau : ${progress.next_level_title}
      </div>
    `;
  }
}

// =====================================================
// EXEMPLES D'UTILISATION
// =====================================================

/*
// Initialiser le gestionnaire XP
const xpManager = new XPManager(supabaseClient, userId);

// Au chargement de la page, gérer le streak
await xpManager.handleLoginStreak();

// Quand le joueur traite un conteneur
const result = await xpManager.addXP('container_processed');
console.log('XP gagné:', result.xp_gained);

// Avec multiplicateur (événement x2)
await xpManager.addXP('duel_won', 2.0);

// Afficher la barre de progression
await xpManager.renderProgressBar('xp-progress-container');

// Vérifier si une fonctionnalité est débloquée
const canUseCasino = await xpManager.isUnlocked('casino');
if (canUseCasino) {
  // Afficher le bouton casino
}

// Obtenir l'historique XP des dernières 24h
const history = await xpManager.getXPHistory(24);
console.log('Actions récentes:', history);
*/

// Exporter la classe
if (typeof module !== 'undefined' && module.exports) {
  module.exports = XPManager;
}