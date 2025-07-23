import { Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle, ButtonInteraction, StringSelectMenuInteraction } from 'discord.js';
import { getPlayer, updatePlayer, saveCombatSession, getCombatSession, deleteCombatSession } from '../../src/database';
import { Player, CombatSession, Item } from '../../src/types';
import { calculateEffectiveStats, calculateLevelFromXP, calculateXPToNextLevel, formatNumber, getRandomPlaggQuote } from '../../src/utils';
import { getRandomMonster, createCombatEmbed, createCombatButtons, createSkillsDropdown, processPlayerAttack, processMonsterTurn, checkCombatEnd, calculateCombatRewards, SKILLS } from '../../src/combat';
import { getRandomItem } from '../../src/items';

export async function execute(message: Message, args: string[]) {
    const userId = message.author.id;
    
    const player = await getPlayer(userId);
    if (!player) {
        const embed = new EmbedBuilder()
            .setTitle('🧀 No Character Found')
            .setDescription('You don\'t have a character yet! Use `$startrpg` to create one and start your combat training!')
            .setColor('#FF6B6B')
            .setFooter({ text: 'Plagg refuses to fight alongside non-existent humans' });
        
        return message.reply({ embeds: [embed] });
    }
    
    // Check if player is already in combat
    const existingSession = await getCombatSession(userId);
    if (existingSession) {
        return message.reply({
            content: '🧀 You\'re already in combat! Finish your current battle first, or are you trying to multitask like a confused Kwami?'
        });
    }
    
    // Check if player has enough health
    if (player.currentHealth <= 0) {
        const embed = new EmbedBuilder()
            .setTitle('💀 You\'re Too Weak!')
            .setDescription('You need to heal before entering combat! Use a health potion or rest up.')
            .setColor('#FF0000')
            .setFooter({ text: 'Even I won\'t fight when I\'m this weak' });
        
        return message.reply({ embeds: [embed] });
    }
    
    await startCombat(message, player);
}

async function startCombat(message: Message, player: Player) {
    const userId = message.author.id;
    const effectiveStats = calculateEffectiveStats(player);
    
    // Update player's combat stats
    player.currentHealth = Math.min(player.currentHealth, effectiveStats.maxHealth);
    player.currentMana = Math.min(player.currentMana, effectiveStats.maxMana);
    player.maxHealth = effectiveStats.maxHealth;
    player.maxMana = effectiveStats.maxMana;
    
    // Get random monster based on player level
    const monster = getRandomMonster(player.level);
    
    // Create combat session
    const session: CombatSession = {
        playerId: userId,
        monster: monster,
        playerTurn: true,
        turnCount: 1,
        messageId: '',
        channelId: message.channel.id,
        startTime: Date.now(),
        playerBuffs: [],
        playerDebuffs: [],
        monsterBuffs: [],
        monsterDebuffs: [],
        combatLog: [],
        lastPlayerAction: '',
        actionHistory: []
    };
    
    // Create combat embed and send initial message
    const embed = createCombatEmbed(session, {
        ...player,
        ...effectiveStats,
        playerClass: player.playerClass
    });
    
    const buttons = createCombatButtons(session);
    
    const combatMessage = await message.reply({
        embeds: [embed],
        components: [buttons]
    });
    
    session.messageId = combatMessage.id;
    
    // Save combat session
    await saveCombatSession(userId, session);
    
    // Update player stats
    player.totalBattles += 1;
    player.lastBattle = Date.now();
    await updatePlayer(userId, player);
}

export async function handleButton(interaction: ButtonInteraction, action: string, params: string[]) {
    const userId = interaction.user.id;
    const session = await getCombatSession(userId);
    
    if (!session) {
        return interaction.reply({
            content: '🧀 No active combat session found!',
            ephemeral: true
        });
    }
    
    const player = await getPlayer(userId);
    if (!player) {
        return interaction.reply({
            content: '🧀 Player not found!',
            ephemeral: true
        });
    }
    
    // Check if it's player's turn
    if (!session.playerTurn) {
        return interaction.reply({
            content: '🧀 It\'s not your turn! Wait for the monster to act.',
            ephemeral: true
        });
    }
    
    const effectiveStats = calculateEffectiveStats(player);
    const playerCombatStats = {
        ...player,
        ...effectiveStats
    };
    
    if (action === 'attack') {
        await handleAttack(interaction, session, playerCombatStats);
    } else if (action === 'skills') {
        await handleSkillsMenu(interaction, session, player);
    } else if (action === 'inventory') {
        await handleInventoryMenu(interaction, session, player);
    } else if (action === 'flee') {
        await handleFlee(interaction, session, player);
    } else if (action === 'back') {
        await updateCombatDisplay(interaction, session, playerCombatStats);
    }
}

export async function handleSelectMenu(interaction: StringSelectMenuInteraction, action: string, params: string[]) {
    const userId = interaction.user.id;
    const session = await getCombatSession(userId);
    
    if (!session) {
        return interaction.reply({
            content: '🧀 No active combat session found!',
            ephemeral: true
        });
    }
    
    const player = await getPlayer(userId);
    if (!player) {
        return interaction.reply({
            content: '🧀 Player not found!',
            ephemeral: true
        });
    }
    
    if (!session.playerTurn) {
        return interaction.reply({
            content: '🧀 It\'s not your turn!',
            ephemeral: true
        });
    }
    
    const effectiveStats = calculateEffectiveStats(player);
    const playerCombatStats = {
        ...player,
        ...effectiveStats
    };
    
    if (action === 'skill' && params[0] === 'select') {
        const skillId = interaction.values[0];
        await handleSkillUse(interaction, session, playerCombatStats, skillId);
    } else if (action === 'item' && params[0] === 'use') {
        const itemIndex = parseInt(interaction.values[0]);
        await handleItemUse(interaction, session, player, itemIndex);
    }
}

async function handleAttack(interaction: ButtonInteraction, session: CombatSession, player: any) {
    // Process basic attack
    const actionResult = processPlayerAttack(session, player);
    session.lastPlayerAction = actionResult;
    session.actionHistory.push(actionResult);
    session.playerTurn = false;
    
    // Check if combat ended
    const combatResult = checkCombatEnd(session, player);
    if (combatResult === 'victory') {
        await handleCombatVictory(interaction, session, player);
        return;
    } else if (combatResult === 'defeat') {
        await handleCombatDefeat(interaction, session, player);
        return;
    }
    
    // Save session and continue to monster turn
    await saveCombatSession(interaction.user.id, session);
    await updateCombatDisplay(interaction, session, player);
    
    // Process monster turn after a delay
    setTimeout(async () => {
        await processMonsterTurnAndUpdate(interaction, session, player);
    }, 2000);
}

async function handleSkillsMenu(interaction: ButtonInteraction, session: CombatSession, player: Player) {
    // Show skills dropdown
    const skillsDropdown = createSkillsDropdown(player.skills);
    
    const backButton = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('battle_back')
                .setLabel('🔙 Back')
                .setStyle(ButtonStyle.Secondary)
        );
    
    const embed = new EmbedBuilder()
        .setTitle('✨ Choose Your Skill')
        .setDescription('Select a skill to unleash your power! Each skill costs mana and has different effects.')
        .setColor('#9400D3')
        .addFields({
            name: '💙 Current Mana',
            value: `${player.currentMana}/${player.maxMana}`,
            inline: true
        });
    
    await interaction.update({
        embeds: [embed],
        components: [skillsDropdown, backButton]
    });
}

async function handleSkillUse(interaction: StringSelectMenuInteraction, session: CombatSession, player: any, skillId: string) {
    const skill = SKILLS[skillId];
    if (!skill) {
        return interaction.reply({
            content: '🧀 Invalid skill selected!',
            ephemeral: true
        });
    }
    
    if (player.currentMana < skill.manaCost) {
        return interaction.reply({
            content: `🧀 Not enough mana! You need ${skill.manaCost} MP but only have ${player.currentMana} MP.`,
            ephemeral: true
        });
    }
    
    // Process skill attack
    const actionResult = processPlayerAttack(session, player, skillId);
    session.lastPlayerAction = actionResult;
    session.actionHistory.push(actionResult);
    session.playerTurn = false;
    
    // Update player mana
    const userId = interaction.user.id;
    const updatedPlayer = await getPlayer(userId);
    if (updatedPlayer) {
        updatedPlayer.currentMana = player.currentMana;
        await updatePlayer(userId, updatedPlayer);
    }
    
    // Check if combat ended
    const combatResult = checkCombatEnd(session, player);
    if (combatResult === 'victory') {
        await handleCombatVictory(interaction, session, player);
        return;
    } else if (combatResult === 'defeat') {
        await handleCombatDefeat(interaction, session, player);
        return;
    }
    
    // Save session and continue
    await saveCombatSession(userId, session);
    await updateCombatDisplay(interaction, session, player);
    
    // Process monster turn after delay
    setTimeout(async () => {
        await processMonsterTurnAndUpdate(interaction, session, player);
    }, 2000);
}

async function handleInventoryMenu(interaction: ButtonInteraction, session: CombatSession, player: Player) {
    // Show consumable items only
    const consumables = player.inventory.filter(item => item.type === 'Consumable');
    
    if (consumables.length === 0) {
        return interaction.reply({
            content: '🧀 You don\'t have any consumable items! Maybe buy some potions next time?',
            ephemeral: true
        });
    }
    
    const itemDropdown = new StringSelectMenuBuilder()
        .setCustomId('battle_item_use')
        .setPlaceholder('Choose an item to use')
        .addOptions(
            consumables.slice(0, 25).map((item, index) => {
                const actualIndex = player.inventory.findIndex(invItem => invItem === item);
                return {
                    label: item.name,
                    description: `${item.effect?.healAmount ? `Heals ${item.effect.healAmount} HP` : ''}${item.effect?.manaAmount ? `Restores ${item.effect.manaAmount} MP` : ''}`,
                    value: actualIndex.toString(),
                    emoji: '🧪'
                };
            })
        );
    
    const backButton = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('battle_back')
                .setLabel('🔙 Back')
                .setStyle(ButtonStyle.Secondary)
        );
    
    const embed = new EmbedBuilder()
        .setTitle('🎒 Combat Items')
        .setDescription('Select an item to use during combat. Using an item costs your turn!')
        .setColor('#8B4513')
        .addFields(
            {
                name: '❤️ Current Health',
                value: `${player.currentHealth}/${player.maxHealth}`,
                inline: true
            },
            {
                name: '💙 Current Mana',
                value: `${player.currentMana}/${player.maxMana}`,
                inline: true
            }
        );
    
    await interaction.update({
        embeds: [embed],
        components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(itemDropdown), backButton]
    });
}

async function handleItemUse(interaction: StringSelectMenuInteraction, session: CombatSession, player: Player, itemIndex: number) {
    if (itemIndex < 0 || itemIndex >= player.inventory.length) {
        return interaction.reply({
            content: '🧀 Invalid item selection!',
            ephemeral: true
        });
    }
    
    const item = player.inventory[itemIndex];
    
    if (item.type !== 'Consumable' || !item.effect) {
        return interaction.reply({
            content: '🧀 This item cannot be used in combat!',
            ephemeral: true
        });
    }
    
    let effectText = '';
    let used = false;
    
    // Apply healing
    if (item.effect.healAmount && player.currentHealth < player.maxHealth) {
        const healAmount = Math.min(item.effect.healAmount, player.maxHealth - player.currentHealth);
        player.currentHealth += healAmount;
        effectText += `Restored ${healAmount} HP! `;
        used = true;
    }
    
    // Apply mana restoration
    if (item.effect.manaAmount && player.currentMana < player.maxMana) {
        const manaAmount = Math.min(item.effect.manaAmount, player.maxMana - player.currentMana);
        player.currentMana += manaAmount;
        effectText += `Restored ${manaAmount} MP! `;
        used = true;
    }
    
    if (!used) {
        return interaction.reply({
            content: '🧀 You don\'t need to use that right now! (Health and mana are full)',
            ephemeral: true
        });
    }
    
    // Remove item from inventory
    player.inventory.splice(itemIndex, 1);
    
    // Update player
    const userId = interaction.user.id;
    await updatePlayer(userId, player);
    
    // Set action and end turn
    session.lastPlayerAction = `Used ${item.name}! ${effectText}`;
    session.actionHistory.push(session.lastPlayerAction);
    session.playerTurn = false;
    
    // Save session
    await saveCombatSession(userId, session);
    
    const effectiveStats = calculateEffectiveStats(player);
    const playerCombatStats = {
        ...player,
        ...effectiveStats
    };
    
    await updateCombatDisplay(interaction, session, playerCombatStats);
    
    // Process monster turn after delay
    setTimeout(async () => {
        await processMonsterTurnAndUpdate(interaction, session, playerCombatStats);
    }, 2000);
}

async function handleFlee(interaction: ButtonInteraction, session: CombatSession, player: Player) {
    // 75% chance to flee successfully
    const fleeChance = 0.75;
    const fleeSuccessful = Math.random() < fleeChance;
    
    if (fleeSuccessful) {
        // Clean up combat session
        await deleteCombatSession(interaction.user.id);
        
        const embed = new EmbedBuilder()
            .setTitle('💨 Fled Successfully!')
            .setDescription('You managed to escape from combat! Sometimes discretion is the better part of valor.')
            .setColor('#FFD700')
            .setFooter({ text: getRandomPlaggQuote('defeat') });
        
        await interaction.update({
            embeds: [embed],
            components: []
        });
    } else {
        // Failed to flee, monster gets a free attack
        session.lastPlayerAction = 'Attempted to flee but failed!';
        session.actionHistory.push(session.lastPlayerAction);
        session.playerTurn = false;
        
        await saveCombatSession(interaction.user.id, session);
        
        const effectiveStats = calculateEffectiveStats(player);
        const playerCombatStats = {
            ...player,
            ...effectiveStats
        };
        
        await updateCombatDisplay(interaction, session, playerCombatStats);
        
        // Monster gets free attack
        setTimeout(async () => {
            await processMonsterTurnAndUpdate(interaction, session, playerCombatStats);
        }, 2000);
    }
}

async function updateCombatDisplay(interaction: ButtonInteraction | StringSelectMenuInteraction, session: CombatSession, player: any) {
    const embed = createCombatEmbed(session, player);
    const buttons = createCombatButtons(session);
    
    // Disable buttons if not player's turn
    if (!session.playerTurn) {
        buttons.components.forEach(button => {
            if (button instanceof ButtonBuilder) {
                button.setDisabled(true);
            }
        });
    }
    
    await interaction.update({
        embeds: [embed],
        components: [buttons]
    });
}

async function processMonsterTurnAndUpdate(interaction: ButtonInteraction | StringSelectMenuInteraction, session: CombatSession, player: any) {
    // Process monster turn
    const monsterAction = processMonsterTurn(session, player);
    session.lastPlayerAction = monsterAction;
    session.actionHistory.push(monsterAction);
    session.playerTurn = true;
    session.turnCount += 1;
    
    // Update player in database
    const userId = interaction.user.id;
    const playerData = await getPlayer(userId);
    if (playerData) {
        playerData.currentHealth = player.currentHealth;
        playerData.currentMana = player.currentMana;
        await updatePlayer(userId, playerData);
    }
    
    // Check if combat ended
    const combatResult = checkCombatEnd(session, player);
    if (combatResult === 'victory') {
        await handleCombatVictory(interaction, session, player);
        return;
    } else if (combatResult === 'defeat') {
        await handleCombatDefeat(interaction, session, player);
        return;
    }
    
    // Save session and update display
    await saveCombatSession(userId, session);
    
    const embed = createCombatEmbed(session, player);
    const buttons = createCombatButtons(session);
    
    await interaction.editReply({
        embeds: [embed],
        components: [buttons]
    });
}

async function handleCombatVictory(interaction: ButtonInteraction | StringSelectMenuInteraction, session: CombatSession, player: any) {
    const userId = interaction.user.id;
    const playerData = await getPlayer(userId);
    
    if (!playerData) return;
    
    // Calculate rewards
    const rewards = calculateCombatRewards(session.monster, playerData.level);
    
    // Apply rewards
    playerData.xp += rewards.xp;
    playerData.gold += rewards.gold;
    playerData.totalVictories += 1;
    playerData.monstersKilled += 1;
    
    // Add items to inventory
    for (const itemDrop of rewards.items) {
        const item = getRandomItem(playerData.level - 2, playerData.level + 2);
        for (let i = 0; i < itemDrop.quantity; i++) {
            playerData.inventory.push(item);
        }
    }
    
    // Check for level up
    const oldLevel = playerData.level;
    let leveledUp = false;
    
    while (playerData.xp >= playerData.xpToNextLevel) {
        playerData.xp -= playerData.xpToNextLevel;
        playerData.level += 1;
        playerData.statPointsAvailable += 3;
        playerData.xpToNextLevel = calculateXPToNextLevel(playerData.level);
        leveledUp = true;
    }
    
    // Update health/mana for current combat
    playerData.currentHealth = player.currentHealth;
    playerData.currentMana = player.currentMana;
    
    await updatePlayer(userId, playerData);
    
    // Clean up combat session
    await deleteCombatSession(userId);
    
    // Create victory embed
    const embed = new EmbedBuilder()
        .setTitle('🎉 Victory!')
        .setDescription(`You defeated the ${session.monster.name}! ${getRandomPlaggQuote('victory')}`)
        .setColor('#00FF00')
        .addFields(
            {
                name: '🏆 Rewards',
                value: `**XP:** +${formatNumber(rewards.xp)}\n**Gold:** +${formatNumber(rewards.gold)}\n**Items:** ${rewards.items.length > 0 ? rewards.items.map(item => `${item.quantity}x item`).join(', ') : 'None'}`,
                inline: false
            }
        );
    
    if (leveledUp) {
        embed.addFields({
            name: '⭐ Level Up!',
            value: `Congratulations! You reached level ${playerData.level}!\nYou gained ${playerData.level - oldLevel} levels and ${(playerData.level - oldLevel) * 3} stat points!`,
            inline: false
        });
        embed.setFooter({ text: getRandomPlaggQuote('levelup') });
    } else {
        embed.setFooter({ text: `XP Progress: ${formatNumber(playerData.xp)}/${formatNumber(playerData.xpToNextLevel)}` });
    }
    
    await interaction.update({
        embeds: [embed],
        components: []
    });
}

async function handleCombatDefeat(interaction: ButtonInteraction | StringSelectMenuInteraction, session: CombatSession, player: any) {
    const userId = interaction.user.id;
    const playerData = await getPlayer(userId);
    
    if (!playerData) return;
    
    // Apply defeat penalties
    const goldLoss = Math.min(playerData.gold, Math.floor(playerData.gold * 0.1)); // Lose 10% gold
    playerData.gold -= goldLoss;
    playerData.totalDeaths += 1;
    playerData.currentHealth = 1; // Set to 1 HP instead of 0
    
    await updatePlayer(userId, playerData);
    
    // Clean up combat session
    await deleteCombatSession(userId);
    
    // Create defeat embed
    const embed = new EmbedBuilder()
        .setTitle('💀 Defeat!')
        .setDescription(`The ${session.monster.name} has defeated you! ${getRandomPlaggQuote('defeat')}`)
        .setColor('#FF0000')
        .addFields({
            name: '💸 Penalties',
            value: `**Gold Lost:** ${formatNumber(goldLoss)}\n**Health:** Set to 1 HP\n\n*Use healing items to recover before your next battle!*`,
            inline: false
        })
        .setFooter({ text: 'Don\'t give up! Every defeat makes you stronger!' });
    
    await interaction.update({
        embeds: [embed],
        components: []
    });
}

export { handleButton, handleSelectMenu };
