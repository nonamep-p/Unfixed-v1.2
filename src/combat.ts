import { Player, Monster, CombatSession, CombatEffect, Skill } from './types';
import { calculateDamage, getRandomPlaggQuote } from './utils';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle } from 'discord.js';

// Monster database
export const MONSTERS: { [key: string]: Monster } = {
    'goblin': {
        id: 'goblin',
        name: 'Goblin Warrior',
        level: 3,
        health: 45,
        maxHealth: 45,
        attack: 12,
        defense: 8,
        element: 'Physical',
        weakness: 'Fire',
        skills: ['club_smash', 'wild_swing'],
        xpReward: 25,
        goldReward: 15,
        dropTable: [
            { itemId: 'leather_scraps', chance: 60, minQuantity: 1, maxQuantity: 3 },
            { itemId: 'iron_ore', chance: 30, minQuantity: 1, maxQuantity: 2 },
            { itemId: 'health_potion', chance: 20, minQuantity: 1, maxQuantity: 1 }
        ],
        description: 'A crude goblin wielding a wooden club.',
        breakBar: 3,
        maxBreakBar: 3,
        stunned: false,
        type: 'Common'
    },
    'orc': {
        id: 'orc',
        name: 'Orc Brute',
        level: 8,
        health: 95,
        maxHealth: 95,
        attack: 22,
        defense: 15,
        element: 'Physical',
        weakness: 'Light',
        skills: ['crushing_blow', 'intimidate', 'rage'],
        xpReward: 65,
        goldReward: 35,
        dropTable: [
            { itemId: 'iron_ore', chance: 70, minQuantity: 2, maxQuantity: 4 },
            { itemId: 'iron_sword', chance: 25, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'health_potion', chance: 40, minQuantity: 1, maxQuantity: 2 }
        ],
        description: 'A hulking orc with massive strength.',
        breakBar: 5,
        maxBreakBar: 5,
        stunned: false,
        type: 'Elite'
    },
    'fire_elemental': {
        id: 'fire_elemental',
        name: 'Fire Elemental',
        level: 12,
        health: 120,
        maxHealth: 120,
        attack: 35,
        defense: 18,
        element: 'Fire',
        weakness: 'Water',
        skills: ['flame_burst', 'fire_shield', 'inferno'],
        xpReward: 95,
        goldReward: 55,
        dropTable: [
            { itemId: 'flame_sword', chance: 15, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'greater_health_potion', chance: 50, minQuantity: 1, maxQuantity: 2 },
            { itemId: 'mana_potion', chance: 60, minQuantity: 2, maxQuantity: 4 }
        ],
        description: 'A being of pure flame and destruction.',
        breakBar: 4,
        maxBreakBar: 4,
        stunned: false,
        type: 'Rare'
    }
};

// Skill database
export const SKILLS: { [key: string]: Skill } = {
    // Basic attack skills
    'basic_attack': {
        id: 'basic_attack',
        name: 'Basic Attack',
        description: 'A standard physical attack.',
        manaCost: 0,
        damage: 1.0,
        element: 'Physical',
        cooldown: 0,
        requiredLevel: 1
    },
    
    // Warrior skills
    'shield_bash': {
        id: 'shield_bash',
        name: 'Shield Bash',
        description: 'Strike with your shield, dealing damage and potentially stunning.',
        manaCost: 10,
        damage: 0.8,
        element: 'Physical',
        cooldown: 2,
        effects: ['stun_chance_25'],
        requiredLevel: 5,
        requiredClass: ['Warrior']
    },
    
    // Mage skills
    'fireball': {
        id: 'fireball',
        name: 'Fireball',
        description: 'Launch a ball of fire at your enemy.',
        manaCost: 15,
        damage: 1.4,
        element: 'Fire',
        cooldown: 1,
        requiredLevel: 3,
        requiredClass: ['Mage', 'Battlemage']
    },
    'ice_shard': {
        id: 'ice_shard',
        name: 'Ice Shard',
        description: 'Fire sharp ice projectiles that may slow the enemy.',
        manaCost: 12,
        damage: 1.2,
        element: 'Water',
        cooldown: 1,
        effects: ['slow'],
        requiredLevel: 5,
        requiredClass: ['Mage']
    },
    
    // Rogue skills
    'backstab': {
        id: 'backstab',
        name: 'Backstab',
        description: 'A sneaky attack with high critical hit chance.',
        manaCost: 8,
        damage: 1.1,
        element: 'Physical',
        cooldown: 2,
        effects: ['crit_chance_50'],
        requiredLevel: 4,
        requiredClass: ['Rogue']
    },
    
    // Archer skills
    'precise_shot': {
        id: 'precise_shot',
        name: 'Precise Shot',
        description: 'A carefully aimed shot that always hits critically.',
        manaCost: 12,
        damage: 1.3,
        element: 'Physical',
        cooldown: 3,
        effects: ['guaranteed_crit'],
        requiredLevel: 6,
        requiredClass: ['Archer']
    },
    
    // Healer skills
    'heal': {
        id: 'heal',
        name: 'Heal',
        description: 'Restore health to yourself.',
        manaCost: 15,
        damage: 0,
        element: 'Light',
        cooldown: 1,
        effects: ['heal_30_percent'],
        requiredLevel: 2,
        requiredClass: ['Healer']
    }
};

// Monster skills
export const MONSTER_SKILLS: { [key: string]: Skill } = {
    'club_smash': {
        id: 'club_smash',
        name: 'Club Smash',
        description: 'A heavy blow with a wooden club.',
        manaCost: 0,
        damage: 1.2,
        element: 'Physical',
        cooldown: 0,
        requiredLevel: 1
    },
    'crushing_blow': {
        id: 'crushing_blow',
        name: 'Crushing Blow',
        description: 'A devastating attack that reduces defense.',
        manaCost: 0,
        damage: 1.5,
        element: 'Physical',
        cooldown: 2,
        effects: ['reduce_defense'],
        requiredLevel: 1
    },
    'flame_burst': {
        id: 'flame_burst',
        name: 'Flame Burst',
        description: 'Explodes in flames, dealing fire damage.',
        manaCost: 0,
        damage: 1.4,
        element: 'Fire',
        cooldown: 1,
        requiredLevel: 1
    }
};

// Get monster by level range
export function getRandomMonster(playerLevel: number): Monster {
    const availableMonsters = Object.values(MONSTERS).filter(monster => 
        monster.level >= playerLevel - 2 && monster.level <= playerLevel + 3
    );
    
    if (availableMonsters.length === 0) {
        return { ...MONSTERS.goblin }; // Fallback to goblin
    }
    
    const monster = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
    return { ...monster, health: monster.maxHealth }; // Reset health
}

// Create combat embed
export function createCombatEmbed(session: CombatSession, player: any): EmbedBuilder {
    const monster = session.monster;
    
    // Calculate health percentages
    const playerHealthPercent = (player.currentHealth / player.maxHealth) * 100;
    const monsterHealthPercent = (monster.health / monster.maxHealth) * 100;
    
    // Create health bars
    const playerHealthBar = createHealthBar(player.currentHealth, player.maxHealth);
    const monsterHealthBar = createHealthBar(monster.health, monster.maxHealth);
    
    // Determine embed color based on health
    let color = 0x00ff00; // Green
    if (playerHealthPercent < 50) color = 0xffff00; // Yellow
    if (playerHealthPercent < 25) color = 0xff0000; // Red
    
    const embed = new EmbedBuilder()
        .setTitle(`⚔️ Combat: ${player.playerClass} vs ${monster.name}`)
        .setColor(color)
        .setDescription(`Turn ${session.turnCount} - ${session.playerTurn ? "Your turn!" : "Enemy turn..."}`)
        .addFields(
            {
                name: `❤️ Your Health (${player.currentHealth}/${player.maxHealth})`,
                value: playerHealthBar,
                inline: true
            },
            {
                name: `💙 Your Mana (${player.currentMana}/${player.maxMana})`,
                value: createHealthBar(player.currentMana, player.maxMana, '💧', '⚫'),
                inline: true
            },
            {
                name: '\u200b',
                value: '\u200b',
                inline: true
            },
            {
                name: `🏹 ${monster.name} (Level ${monster.level})`,
                value: monsterHealthBar,
                inline: false
            }
        );
    
    // Add break bar if applicable
    if (monster.maxBreakBar > 0) {
        const breakBar = createHealthBar(monster.breakBar, monster.maxBreakBar, '🟡', '⚫');
        embed.addFields({
            name: '🔥 Weakness Bar',
            value: breakBar,
            inline: false
        });
    }
    
    // Add status effects
    const statusEffects = [];
    if (monster.stunned) statusEffects.push('😵 Stunned');
    if (session.playerBuffs.length > 0) statusEffects.push(`🟢 ${session.playerBuffs.length} buff(s)`);
    if (session.playerDebuffs.length > 0) statusEffects.push(`🔴 ${session.playerDebuffs.length} debuff(s)`);
    
    if (statusEffects.length > 0) {
        embed.addFields({
            name: '✨ Status Effects',
            value: statusEffects.join(' | '),
            inline: false
        });
    }
    
    // Add recent action
    if (session.lastPlayerAction) {
        embed.addFields({
            name: '📜 Recent Action',
            value: session.lastPlayerAction,
            inline: false
        });
    }
    
    embed.setFooter({ text: getRandomPlaggQuote('combat') });
    
    return embed;
}

// Create health bar visualization
function createHealthBar(current: number, max: number, fullChar: string = '❤️', emptyChar: string = '🖤'): string {
    const percentage = Math.max(0, current / max);
    const barLength = 10;
    const filled = Math.floor(percentage * barLength);
    const empty = barLength - filled;
    
    return `${fullChar.repeat(filled)}${emptyChar.repeat(empty)} ${current}/${max}`;
}

// Create combat action buttons
export function createCombatButtons(session: CombatSession): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('battle_attack')
                .setLabel('⚔️ Basic Attack')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('battle_skills')
                .setLabel('✨ Skills')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('battle_inventory')
                .setLabel('🎒 Items')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('battle_flee')
                .setLabel('💨 Flee')
                .setStyle(ButtonStyle.Danger)
        );
}

// Create skills dropdown
export function createSkillsDropdown(playerSkills: string[]): ActionRowBuilder<StringSelectMenuBuilder> {
    const availableSkills = playerSkills
        .map(skillId => SKILLS[skillId])
        .filter(skill => skill)
        .slice(0, 25); // Discord limit
    
    const dropdown = new StringSelectMenuBuilder()
        .setCustomId('battle_skill_select')
        .setPlaceholder('Choose a skill to use')
        .addOptions(
            availableSkills.map(skill => ({
                label: `${skill.name} (${skill.manaCost} MP)`,
                description: skill.description,
                value: skill.id,
                emoji: getSkillEmoji(skill.element)
            }))
        );
    
    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(dropdown);
}

// Get emoji for skill element
function getSkillEmoji(element: string): string {
    const emojis: { [key: string]: string } = {
        'Fire': '🔥',
        'Water': '💧',
        'Earth': '🌍',
        'Air': '💨',
        'Light': '✨',
        'Dark': '🌑',
        'Physical': '⚔️',
        'None': '⚫'
    };
    return emojis[element] || '⚫';
}

// Process player attack
export function processPlayerAttack(session: CombatSession, player: any, skillId?: string): string {
    const skill = skillId ? SKILLS[skillId] : SKILLS.basic_attack;
    if (!skill) return "Invalid skill selected!";
    
    // Check mana cost
    if (player.currentMana < skill.manaCost) {
        return "Not enough mana to use that skill!";
    }
    
    // Deduct mana
    player.currentMana -= skill.manaCost;
    
    // Calculate damage
    const playerStats = {
        attack: player.attack || 10,
        critChance: player.critChance || 5,
        critDamage: player.critDamage || 150
    };
    
    const monsterStats = {
        defense: session.monster.defense
    };
    
    // Check for weakness exploitation
    let skillMultiplier = skill.damage;
    let extraEffects = [];
    
    if (skill.element === session.monster.weakness && session.monster.breakBar > 0) {
        session.monster.breakBar -= 1;
        skillMultiplier *= 1.5;
        extraEffects.push("Weakness exploited!");
        
        if (session.monster.breakBar <= 0) {
            session.monster.stunned = true;
            extraEffects.push("Enemy stunned!");
        }
    }
    
    const { damage, isCritical } = calculateDamage(playerStats, monsterStats, skillMultiplier);
    
    // Apply damage
    session.monster.health = Math.max(0, session.monster.health - damage);
    
    // Check for follow-up attack (25% chance on crit for Destruction path)
    let followUpDamage = 0;
    if (isCritical && Math.random() < 0.25) {
        const followUp = calculateDamage(playerStats, monsterStats, 0.5);
        followUpDamage = followUp.damage;
        session.monster.health = Math.max(0, session.monster.health - followUpDamage);
        extraEffects.push("Follow-up attack!");
    }
    
    // Create action description
    let actionText = `You used ${skill.name}! `;
    actionText += `Dealt ${damage} damage${isCritical ? ' (CRITICAL!)' : ''}`;
    
    if (followUpDamage > 0) {
        actionText += ` + ${followUpDamage} follow-up damage`;
    }
    
    if (extraEffects.length > 0) {
        actionText += ` (${extraEffects.join(', ')})`;
    }
    
    return actionText;
}

// Process monster turn
export function processMonsterTurn(session: CombatSession, player: any): string {
    const monster = session.monster;
    
    // Check if stunned
    if (monster.stunned) {
        monster.stunned = false; // Stun lasts 1 turn
        return `${monster.name} is stunned and loses their turn!`;
    }
    
    // Choose monster action
    const availableSkills = monster.skills.map(id => MONSTER_SKILLS[id]).filter(skill => skill);
    const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)] || MONSTER_SKILLS.club_smash;
    
    // Calculate damage
    const monsterStats = {
        attack: monster.attack,
        critChance: 10, // Base 10% for monsters
        critDamage: 140 // Base 140% for monsters
    };
    
    const playerStats = {
        defense: player.defense || 5
    };
    
    const { damage, isCritical } = calculateDamage(monsterStats, playerStats, skill.damage);
    
    // Apply damage
    player.currentHealth = Math.max(0, player.currentHealth - damage);
    
    let actionText = `${monster.name} used ${skill.name}! `;
    actionText += `You took ${damage} damage${isCritical ? ' (CRITICAL!)' : ''}`;
    
    return actionText;
}

// Check combat end conditions
export function checkCombatEnd(session: CombatSession, player: any): 'victory' | 'defeat' | 'ongoing' {
    if (session.monster.health <= 0) {
        return 'victory';
    }
    if (player.currentHealth <= 0) {
        return 'defeat';
    }
    return 'ongoing';
}

// Calculate combat rewards
export function calculateCombatRewards(monster: Monster, playerLevel: number) {
    const baseXP = monster.xpReward;
    const baseGold = monster.goldReward;
    
    // Level difference bonus/penalty
    const levelDiff = monster.level - playerLevel;
    const diffMultiplier = Math.max(0.5, 1 + (levelDiff * 0.1));
    
    const xpGained = Math.floor(baseXP * diffMultiplier);
    const goldGained = Math.floor(baseGold * diffMultiplier);
    
    // Roll for item drops
    const itemsDropped = [];
    for (const drop of monster.dropTable) {
        if (Math.random() * 100 < drop.chance) {
            const quantity = Math.floor(Math.random() * (drop.maxQuantity - drop.minQuantity + 1)) + drop.minQuantity;
            itemsDropped.push({ itemId: drop.itemId, quantity });
        }
    }
    
    return {
        xp: xpGained,
        gold: goldGained,
        items: itemsDropped
    };
}
