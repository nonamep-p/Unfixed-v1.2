import { Player, PlayerClass, PlayerStats, Equipment, Item, MiraculousPath } from './types';
import { RARITY_INFO, getItemEmoji } from './items';

// XP and leveling functions
export function calculateXPToNextLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.1, level - 1));
}

export function calculateTotalXPForLevel(level: number): number {
    let totalXP = 0;
    for (let i = 1; i < level; i++) {
        totalXP += calculateXPToNextLevel(i);
    }
    return totalXP;
}

export function calculateLevelFromXP(xp: number): number {
    let level = 1;
    let totalXPNeeded = 0;
    
    while (totalXPNeeded <= xp) {
        totalXPNeeded += calculateXPToNextLevel(level);
        if (totalXPNeeded <= xp) {
            level++;
        }
    }
    
    return level;
}

// Stat calculation functions
export function calculateEffectiveStats(player: Player): PlayerStats & {
    attack: number;
    defense: number;
    maxHealth: number;
    maxMana: number;
    critChance: number;
    critDamage: number;
} {
    const base = { ...player.stats };
    let attack = base.strength * 2;
    let defense = base.vitality * 1.5;
    let maxHealth = base.vitality * 10 + 50;
    let maxMana = base.intelligence * 5 + 25;
    let critChance = base.dexterity * 0.5;
    let critDamage = 150; // Base 150%

    // Add equipment bonuses
    Object.values(player.equipment).forEach(item => {
        if (item && item.stats) {
            attack += item.stats.attack || 0;
            defense += item.stats.defense || 0;
            maxHealth += item.stats.health || 0;
            maxMana += item.stats.mana || 0;
            critChance += item.stats.critChance || 0;
            critDamage += item.stats.critDamage || 0;
            
            // Add stat bonuses
            base.strength += item.stats.strength || 0;
            base.intelligence += item.stats.intelligence || 0;
            base.dexterity += item.stats.dexterity || 0;
            base.vitality += item.stats.vitality || 0;
        }
    });

    // Apply Miraculous Path bonuses
    switch (player.miraculousPath) {
        case 'Destruction':
            critDamage += 20;
            attack *= 1.1;
            break;
        case 'Preservation':
            defense *= 1.15;
            maxHealth *= 1.1;
            break;
        case 'Abundance':
            maxMana *= 1.2;
            maxHealth *= 1.05;
            break;
        case 'The Hunt':
            critChance += 10;
            attack *= 1.05;
            break;
    }

    // Apply class bonuses
    switch (player.playerClass) {
        case 'Warrior':
            attack *= 1.2;
            defense *= 1.3;
            break;
        case 'Mage':
            maxMana *= 1.4;
            base.intelligence *= 1.2;
            break;
        case 'Rogue':
            critChance += 15;
            critDamage += 25;
            break;
        case 'Archer':
            critChance += 10;
            attack *= 1.1;
            break;
        case 'Healer':
            maxMana *= 1.3;
            maxHealth *= 1.2;
            break;
        case 'Battlemage':
            attack *= 1.1;
            maxMana *= 1.2;
            break;
        case 'Chrono Knight':
            // Hidden class with powerful bonuses
            attack *= 1.3;
            defense *= 1.2;
            maxMana *= 1.3;
            critChance += 20;
            break;
    }

    return {
        ...base,
        attack: Math.floor(attack),
        defense: Math.floor(defense),
        maxHealth: Math.floor(maxHealth),
        maxMana: Math.floor(maxMana),
        critChance: Math.min(critChance, 95), // Cap at 95%
        critDamage: Math.floor(critDamage)
    };
}

// Combat utility functions
export function calculateDamage(
    attacker: { attack: number; critChance: number; critDamage: number },
    defender: { defense: number },
    skillMultiplier: number = 1,
    element?: string
): { damage: number; isCritical: boolean } {
    const baseDamage = Math.max(1, attacker.attack * skillMultiplier - defender.defense * 0.5);
    const isCritical = Math.random() * 100 < attacker.critChance;
    
    let damage = baseDamage;
    if (isCritical) {
        damage = damage * (attacker.critDamage / 100);
    }
    
    // Add some randomness
    damage = damage * (0.85 + Math.random() * 0.3);
    
    return {
        damage: Math.floor(damage),
        isCritical
    };
}

// Progress bar generation
export function createProgressBar(current: number, max: number, length: number = 10): string {
    const percentage = Math.max(0, Math.min(1, current / max));
    const filled = Math.floor(percentage * length);
    const empty = length - filled;
    
    return `${'█'.repeat(filled)}${'░'.repeat(empty)}`;
}

// Format numbers with proper suffixes
export function formatNumber(num: number): string {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Time formatting
export function formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

// Cooldown functions
export function getRemainingCooldown(lastAction: number, cooldownMs: number): number {
    const now = Date.now();
    const elapsed = now - lastAction;
    return Math.max(0, cooldownMs - elapsed);
}

export function isOnCooldown(lastAction: number, cooldownMs: number): boolean {
    return getRemainingCooldown(lastAction, cooldownMs) > 0;
}

// Item utility functions
export function canEquipItem(player: Player, item: Item): { canEquip: boolean; reason?: string } {
    if (!['Weapon', 'Helmet', 'Chestplate', 'Leggings', 'Boots'].includes(item.type)) {
        return { canEquip: false, reason: 'This item cannot be equipped' };
    }
    
    if (item.level && player.level < item.level) {
        return { canEquip: false, reason: `You need to be level ${item.level} to equip this item` };
    }
    
    return { canEquip: true };
}

export function getEquipmentSlot(itemType: string): keyof Equipment {
    switch (itemType) {
        case 'Weapon': return 'weapon';
        case 'Helmet': return 'helmet';
        case 'Chestplate': return 'chestplate';
        case 'Leggings': return 'leggings';
        case 'Boots': return 'boots';
        default: throw new Error('Invalid equipment type');
    }
}

// Class information
export const CLASS_INFO = {
    'Warrior': {
        name: 'Warrior',
        description: 'A sturdy frontline fighter with high defense and protective abilities.',
        emoji: '🛡️',
        startingStats: { strength: 8, intelligence: 3, dexterity: 5, vitality: 9 },
        statGrowth: { strength: 3, intelligence: 1, dexterity: 2, vitality: 3 },
        skills: ['shield_bash', 'taunt', 'defensive_stance'],
        plaggComment: 'A tank, huh? All brawn, no brains. Perfect for blocking things... like intelligent conversation.'
    },
    'Mage': {
        name: 'Mage',
        description: 'A powerful spellcaster with devastating magical abilities and area effects.',
        emoji: '🔮',
        startingStats: { strength: 3, intelligence: 10, dexterity: 4, vitality: 6 },
        statGrowth: { strength: 1, intelligence: 4, dexterity: 2, vitality: 2 },
        skills: ['fireball', 'ice_shard', 'magic_missile'],
        plaggComment: 'Ah, a mage! Finally, someone who appreciates the finer things... like magical cheese transformation.'
    },
    'Rogue': {
        name: 'Rogue',
        description: 'A sneaky assassin with high critical hit chance and stealth abilities.',
        emoji: '🗡️',
        startingStats: { strength: 6, intelligence: 5, dexterity: 10, vitality: 4 },
        statGrowth: { strength: 2, intelligence: 2, dexterity: 4, vitality: 1 },
        skills: ['stealth', 'backstab', 'poison_blade'],
        plaggComment: 'Sneaky and underhanded... I like your style! You remind me of myself, but with less charm.'
    },
    'Archer': {
        name: 'Archer',
        description: 'A precise ranged fighter with excellent accuracy and hunting skills.',
        emoji: '🏹',
        startingStats: { strength: 5, intelligence: 4, dexterity: 9, vitality: 7 },
        statGrowth: { strength: 2, intelligence: 1, dexterity: 4, vitality: 2 },
        skills: ['precise_shot', 'multishot', 'hunters_mark'],
        plaggComment: 'Good choice! Nothing says "precision" like shooting things from far away. Very un-destructive of you.'
    },
    'Healer': {
        name: 'Healer',
        description: 'A support specialist with powerful healing abilities and team buffs.',
        emoji: '❤️',
        startingStats: { strength: 4, intelligence: 8, dexterity: 5, vitality: 8 },
        statGrowth: { strength: 1, intelligence: 3, dexterity: 2, vitality: 3 },
        skills: ['heal', 'group_heal', 'blessing'],
        plaggComment: 'A healer? Ugh, so... helpful. I guess someone has to fix what I break. How boring.'
    },
    'Battlemage': {
        name: 'Battlemage',
        description: 'A hybrid warrior-mage combining melee combat with magical prowess.',
        emoji: '⚔️',
        startingStats: { strength: 7, intelligence: 7, dexterity: 5, vitality: 6 },
        statGrowth: { strength: 3, intelligence: 3, dexterity: 2, vitality: 2 },
        skills: ['flame_strike', 'mana_burn', 'spell_sword'],
        plaggComment: 'Can\'t decide between hitting things or zapping things? Why not both! Indecisive, but effective.'
    },
    'Chrono Knight': {
        name: 'Chrono Knight',
        description: 'A legendary time manipulator with reality-bending abilities.',
        emoji: '⏰',
        startingStats: { strength: 8, intelligence: 9, dexterity: 8, vitality: 8 },
        statGrowth: { strength: 3, intelligence: 4, dexterity: 3, vitality: 3 },
        skills: ['time_strike', 'temporal_shield', 'chronos_wrath'],
        plaggComment: 'Time magic? Now THAT\'S what I\'m talking about! Finally, someone with some real destructive potential!'
    }
};

// Path information
export const PATH_INFO = {
    'Destruction': {
        name: 'Path of Destruction',
        description: 'Embrace chaos and devastation. +20% critical damage, enhanced follow-up attacks.',
        emoji: '💥',
        bonuses: ['Critical damage +20%', 'Follow-up attack chance +25%', 'Skill damage +10%'],
        plaggComment: 'NOW we\'re talking! Finally embracing your inner destructive potential!'
    },
    'Preservation': {
        name: 'Path of Preservation',
        description: 'Master defensive techniques and protection. +15% damage reduction, shield abilities.',
        emoji: '🛡️',
        bonuses: ['Damage reduction +15%', 'Max health +10%', 'Shield generation +25%'],
        plaggComment: 'Playing it safe, I see. Boring, but effective. I guess someone needs to preserve the cheese.'
    },
    'Abundance': {
        name: 'Path of Abundance',
        description: 'Excel in support and healing. +25% healing effectiveness, team buffs.',
        emoji: '❤️‍🩹',
        bonuses: ['Healing +25%', 'Mana efficiency +20%', 'Buff duration +50%'],
        plaggComment: 'More helping people... *sigh*. At least you\'re abundant in something other than common sense.'
    },
    'The Hunt': {
        name: 'Path of The Hunt',
        description: 'Perfect precision and execution abilities. Enhanced accuracy and critical strikes.',
        emoji: '🎯',
        bonuses: ['Critical chance +10%', 'Accuracy +15%', 'Execution abilities unlocked'],
        plaggComment: 'A hunter, eh? Good! Hunt down some premium aged cheddar while you\'re at it.'
    }
};

// Random Plagg quotes for various situations
export const PLAGG_QUOTES = {
    combat: [
        "Cataclysm! Wait, that's not how this works...",
        "This is almost as exciting as finding moldy cheese!",
        "Fight! Fight! Fight! This is better than reality TV!",
        "Ooh, violence! My favorite kind of chaos!",
        "Can we hurry this up? I have cheese to attend to."
    ],
    victory: [
        "Not bad! You're almost as destructive as me!",
        "Victory tastes sweet... but not as sweet as Camembert.",
        "You won! Time to celebrate with some cheese!",
        "Excellent! Now let's destroy something else!",
        "That was fun! Do it again, but with more explosions next time."
    ],
    defeat: [
        "Oops! That didn't go as planned. Maybe try hitting things harder?",
        "Well, that was embarrassing. Good thing I wasn't really trying.",
        "Defeat builds character! Or so I've heard. I wouldn't know.",
        "Don't worry, everyone loses sometimes. Even me! Well, actually, no, never mind.",
        "That monster clearly cheated. Nobody beats a Kwami's chosen fairly!"
    ],
    levelup: [
        "Level up! You're getting stronger! Still not as strong as cheese cravings though.",
        "Ooh, fancy! More power means more potential for chaos!",
        "Another level! You're climbing faster than I climb cheese wheels!",
        "Level up! Time to allocate those stat points wisely... or just randomly, whatever.",
        "Getting stronger! Soon you'll be worthy of the finest aged Brie!"
    ],
    lowHealth: [
        "You're looking a bit rough there, champ. Maybe use a potion?",
        "Health getting low! Time to panic! Or heal. Healing works too.",
        "Uh oh, you're in the danger zone! This is where it gets interesting!",
        "Low health means high stakes! My favorite kind of situation!",
        "You need healing! Unfortunately, I only know how to break things, not fix them."
    ]
};

export function getRandomPlaggQuote(category: keyof typeof PLAGG_QUOTES): string {
    const quotes = PLAGG_QUOTES[category];
    return quotes[Math.floor(Math.random() * quotes.length)];
}
