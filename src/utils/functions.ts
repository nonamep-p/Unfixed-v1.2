// Utility functions for Plagg Bot
// Calculations, formatters, and helper functions

import { Player, Item, Monster, PlayerStats } from '../types';
import { config } from '../config';

/**
 * Calculate XP required for next level
 * Formula: floor(100 * (1.2)^(level-1))
 */
export function calculateXPRequired(level: number): number {
    return Math.floor(100 * Math.pow(1.2, level - 1));
}

/**
 * Calculate total XP needed to reach a specific level
 */
export function calculateTotalXP(targetLevel: number): number {
    let totalXP = 0;
    for (let i = 1; i < targetLevel; i++) {
        totalXP += calculateXPRequired(i);
    }
    return totalXP;
}

/**
 * Calculate level from total XP
 */
export function calculateLevelFromXP(totalXP: number): number {
    let level = 1;
    let currentXP = 0;
    
    while (currentXP <= totalXP) {
        currentXP += calculateXPRequired(level);
        if (currentXP <= totalXP) {
            level++;
        }
    }
    
    return level;
}

/**
 * Calculate effective stats with equipment bonuses
 */
export function calculateEffectiveStats(player: Player): PlayerStats & {
    attack: number;
    defense: number;
    health: number;
    mana: number;
    critChance: number;
    critDamage: number;
} {
    let stats = { ...player.stats };
    let bonusStats = {
        attack: 0,
        defense: 0,
        health: 0,
        mana: 0,
        critChance: 0,
        critDamage: 0
    };

    // Calculate equipment bonuses
    Object.values(player.equipment).forEach(item => {
        if (item?.stats) {
            if (item.stats.strength) stats.strength += item.stats.strength;
            if (item.stats.intelligence) stats.intelligence += item.stats.intelligence;
            if (item.stats.dexterity) stats.dexterity += item.stats.dexterity;
            if (item.stats.vitality) stats.vitality += item.stats.vitality;
            
            if (item.stats.attack) bonusStats.attack += item.stats.attack;
            if (item.stats.defense) bonusStats.defense += item.stats.defense;
            if (item.stats.health) bonusStats.health += item.stats.health;
            if (item.stats.mana) bonusStats.mana += item.stats.mana;
            if (item.stats.critChance) bonusStats.critChance += item.stats.critChance;
            if (item.stats.critDamage) bonusStats.critDamage += item.stats.critDamage;
        }
    });

    // Calculate derived stats
    const attack = Math.floor(stats.strength * 0.5) + bonusStats.attack;
    const defense = Math.floor(stats.vitality * 0.3) + bonusStats.defense;
    const health = stats.vitality * 15 + bonusStats.health;
    const mana = stats.intelligence * 10 + bonusStats.mana;
    const critChance = Math.floor(stats.dexterity * 0.2) + bonusStats.critChance;
    const critDamage = Math.floor(stats.strength * 0.1) + bonusStats.critDamage;

    return {
        ...stats,
        attack,
        defense,
        health,
        mana,
        critChance,
        critDamage
    };
}

/**
 * Calculate combat damage
 */
export function calculateDamage(
    attacker: { attack: number; critChance: number; critDamage: number },
    defender: { defense: number },
    skillMultiplier: number = 1.0
): { damage: number; critical: boolean } {
    
    const baseDamage = Math.max(1, attacker.attack - defender.defense);
    const scaledDamage = baseDamage * skillMultiplier;
    
    // Check for critical hit
    const critical = Math.random() * 100 < attacker.critChance;
    const critMultiplier = critical ? (1.5 + attacker.critDamage / 100) : 1;
    
    const finalDamage = Math.floor(scaledDamage * critMultiplier);
    
    return { damage: Math.max(1, finalDamage), critical };
}

/**
 * Generate progress bar
 */
export function generateProgressBar(current: number, max: number, length: number = 10): string {
    const percentage = Math.max(0, Math.min(1, current / max));
    const filled = Math.floor(percentage * length);
    const empty = length - filled;
    
    return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format time duration
 */
export function formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

/**
 * Get rarity color for embeds
 */
export function getRarityColor(rarity: string): number {
    const colors: { [key: string]: number } = {
        'Common': 0x808080,
        'Uncommon': 0x00FF00,
        'Rare': 0x0099FF,
        'Epic': 0x9966FF,
        'Legendary': 0xFFD700,
        'Mythical': 0xFF6600,
        'Divine': 0xFF69B4,
        'Cosmic': 0xFF1493
    };
    
    return colors[rarity] || colors['Common'];
}

/**
 * Get rarity emoji
 */
export function getRarityEmoji(rarity: string): string {
    const emojis: { [key: string]: string } = {
        'Common': '⚪',
        'Uncommon': '🟢', 
        'Rare': '🔵',
        'Epic': '🟣',
        'Legendary': '🟡',
        'Mythical': '🟠',
        'Divine': '💖',
        'Cosmic': '🌌'
    };
    
    return emojis[rarity] || emojis['Common'];
}

/**
 * Generate random number between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Weighted random selection
 */
export function weightedRandom<T>(items: Array<{ item: T; weight: number }>): T | null {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    if (totalWeight === 0) return null;
    
    let randomWeight = Math.random() * totalWeight;
    
    for (const { item, weight } of items) {
        randomWeight -= weight;
        if (randomWeight <= 0) {
            return item;
        }
    }
    
    return items[items.length - 1]?.item || null;
}

/**
 * Check if player can afford something
 */
export function canAfford(player: Player, cost: number): boolean {
    return player.gold >= cost;
}

/**
 * Apply item effects to player
 */
export function applyItemEffect(player: Player, item: Item): { success: boolean; message: string } {
    if (!item.effect) {
        return { success: false, message: 'This item has no effect!' };
    }

    let message = '';
    let success = true;

    if (item.effect.healAmount) {
        const healAmount = Math.min(item.effect.healAmount, player.maxHealth - player.currentHealth);
        if (healAmount > 0) {
            player.currentHealth += healAmount;
            message += `Restored ${formatNumber(healAmount)} HP! `;
        } else {
            return { success: false, message: 'You are already at full health!' };
        }
    }

    if (item.effect.manaAmount) {
        const manaAmount = Math.min(item.effect.manaAmount, player.maxMana - player.currentMana);
        if (manaAmount > 0) {
            player.currentMana += manaAmount;
            message += `Restored ${formatNumber(manaAmount)} MP! `;
        } else if (!item.effect.healAmount) {
            return { success: false, message: 'You are already at full mana!' };
        }
    }

    return { success, message: message.trim() };
}

/**
 * Calculate sell price for an item
 */
export function calculateSellPrice(item: Item): number {
    return Math.floor(item.buyPrice * config.vendorSellMultiplier);
}

/**
 * Generate unique ID
 */
export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Check if enough time has passed (for cooldowns)
 */
export function isCooldownReady(lastUsed: number, cooldownMs: number): boolean {
    return Date.now() - lastUsed >= cooldownMs;
}

/**
 * Get remaining cooldown time
 */
export function getRemainingCooldown(lastUsed: number, cooldownMs: number): number {
    const remaining = cooldownMs - (Date.now() - lastUsed);
    return Math.max(0, remaining);
}

export default {
    calculateXPRequired,
    calculateTotalXP,
    calculateLevelFromXP,
    calculateEffectiveStats,
    calculateDamage,
    generateProgressBar,
    formatNumber,
    formatDuration,
    getRarityColor,
    getRarityEmoji,
    randomInt,
    weightedRandom,
    canAfford,
    applyItemEffect,
    calculateSellPrice,
    generateId,
    isCooldownReady,
    getRemainingCooldown
};