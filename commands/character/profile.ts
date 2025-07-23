import { Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonStyle, ButtonInteraction, ModalSubmitInteraction } from 'discord.js';
import { getPlayer, updatePlayer } from '../../src/database';
import { Player } from '../../src/types';
import { calculateEffectiveStats, createProgressBar, formatNumber, CLASS_INFO, PATH_INFO } from '../../src/utils';
import { getItemEmoji } from '../../src/items';

export async function execute(message: Message, args: string[]) {
    const userId = message.author.id;

    const player = await getPlayer(userId);
    if (!player) {
        const embed = new EmbedBuilder()
            .setTitle('🧀 No Character Found')
            .setDescription('You don\'t have a character yet! Use `$startrpg` to create one and start causing chaos with me!')
            .setColor('#FF6B6B')
            .setFooter({ text: 'Plagg is waiting... impatiently' });

        return message.reply({ embeds: [embed] });
    }

    await displayProfile(message, player);
}

async function displayProfile(message: Message, player: Player) {
    const userId = message.author.id;
    const effectiveStats = calculateEffectiveStats(player);

    // Create main profile embed
    const embed = new EmbedBuilder()
        .setTitle(`${message.author.username}'s Profile`)
        .setDescription(`**${player.currentTitle ? `[${player.currentTitle}] ` : ''}Level ${player.level} ${player.playerClass}**${player.miraculousPath !== 'None' ? `\n🌟 *${PATH_INFO[player.miraculousPath]?.name}*` : ''}`)
        .setColor(getProfileColor(player.level))
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .addFields(
            {
                name: '📊 Experience',
                value: `${createProgressBar(player.xp - calculateTotalXPForLevel(player.level), player.xpToNextLevel)} ${formatNumber(player.xp)}/${formatNumber(player.xp + player.xpToNextLevel)} XP`,
                inline: false
            },
            {
                name: '💰 Wealth',
                value: `**Gold:** ${formatNumber(player.gold)}\n**Gladiator Tokens:** ${player.gladiatorTokens}\n**Miraculous Energy:** ${player.miraculousEnergy}`,
                inline: true
            },
            {
                name: '⚡ Core Stats',
                value: `**STR:** ${player.stats.strength} (+${effectiveStats.strength - player.stats.strength})\n**INT:** ${player.stats.intelligence} (+${effectiveStats.intelligence - player.stats.intelligence})\n**DEX:** ${player.stats.dexterity} (+${effectiveStats.dexterity - player.stats.dexterity})\n**VIT:** ${player.stats.vitality} (+${effectiveStats.vitality - player.stats.vitality})`,
                inline: true
            },
            {
                name: '⚔️ Combat Stats',
                value: `**Attack:** ${effectiveStats.attack}\n**Defense:** ${effectiveStats.defense}\n**Crit Chance:** ${effectiveStats.critChance.toFixed(1)}%\n**Crit Damage:** ${effectiveStats.critDamage}%`,
                inline: true
            },
            {
                name: '❤️ Health & Resources',
                value: `**HP:** ${createProgressBar(player.currentHealth, player.maxHealth, '❤️', '🖤')} ${player.currentHealth}/${player.maxHealth}\n**MP:** ${createProgressBar(player.currentMana, player.maxMana, '💙', '🖤')} ${player.currentMana}/${player.maxMana}`,
                inline: false
            }
        );

    // Add equipment section
    const equipment = player.equipment;
    const equipmentText = [
        `**Weapon:** ${equipment.weapon ? `${getItemEmoji(equipment.weapon.rarity)} ${equipment.weapon.name}` : 'Empty'}`,
        `**Helmet:** ${equipment.helmet ? `${getItemEmoji(equipment.helmet.rarity)} ${equipment.helmet.name}` : 'Empty'}`,
        `**Chestplate:** ${equipment.chestplate ? `${getItemEmoji(equipment.chestplate.rarity)} ${equipment.chestplate.name}` : 'Empty'}`,
        `**Leggings:** ${equipment.leggings ? `${getItemEmoji(equipment.leggings.rarity)} ${equipment.leggings.name}` : 'Empty'}`,
        `**Boots:** ${equipment.boots ? `${getItemEmoji(equipment.boots.rarity)} ${equipment.boots.name}` : 'Empty'}`
    ].join('\n');

    embed.addFields({
        name: '🛡️ Equipment',
        value: equipmentText,
        inline: true
    });

    // Add statistics section
    embed.addFields({
        name: '📈 Statistics',
        value: `**Battles:** ${player.totalBattles}\n**Victories:** ${player.totalVictories}\n**Win Rate:** ${player.totalBattles > 0 ? ((player.totalVictories / player.totalBattles) * 100).toFixed(1) : 0}%\n**Monsters Killed:** ${player.monstersKilled}`,
        inline: true
    });

    // Add faction and achievements
    embed.addFields({
        name: '🏛️ Status',
        value: `**Faction:** ${player.faction}\n**Achievements:** ${player.achievements.length}\n**Titles:** ${player.titles.length}`,
        inline: true
    });

    // Add Plagg's commentary
    const plaggComments = [
        "Not bad... for a human.",
        "I've seen cheese with more personality.",
        "Still not as impressive as my Camembert collection.",
        "Keep it up! You might actually be useful someday.",
        "Eh, could be worse. Could be much worse.",
        "At least you're trying. That's... something.",
        "Your stats are almost as good as aged cheddar!"
    ];

    embed.setFooter({ 
        text: plaggComments[Math.floor(Math.random() * plaggComments.length)]
    });

    // Create action buttons
    const actionRow = new ActionRowBuilder<ButtonBuilder>();

    // Stat allocation button (only if player has points)
    if (player.statPointsAvailable > 0) {
        actionRow.addComponents(
            new ButtonBuilder()
                .setCustomId('profile_allocate_stats')
                .setLabel(`⚡ Allocate Stats (${player.statPointsAvailable})`)
                .setStyle(ButtonStyle.Primary)
        );
    }

    actionRow.addComponents(
        new ButtonBuilder()
            .setCustomId('inventory_view')
            .setLabel('🎒 Inventory')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('profile_titles')
            .setLabel('🏆 Titles')
            .setStyle(ButtonStyle.Secondary)
    );

    // Miraculous Path button (only if level 20+ and no path chosen)
    if (player.level >= 20 && player.miraculousPath === 'None') {
        const pathRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('profile_choose_path')
                    .setLabel('🌟 Choose Miraculous Path')
                    .setStyle(ButtonStyle.Success)
            );

        await message.reply({
            embeds: [embed],
            components: [actionRow, pathRow]
        });
    } else {
        await message.reply({
            embeds: [embed],
            components: [actionRow]
        });
    }
}

export async function handleButton(interaction: ButtonInteraction, action: string, params: string[]) {
    if (action === 'allocate' && params[0] === 'stats') {
        await handleStatAllocation(interaction);
    } else if (action === 'titles') {
        await handleTitleSelection(interaction);
    } else if (action === 'choose' && params[0] === 'path') {
        await handlePathSelection(interaction);
    }
}

async function handleStatAllocation(interaction: ButtonInteraction) {
    const userId = interaction.user.id;
    const player = await getPlayer(userId);

    if (!player || player.statPointsAvailable <= 0) {
        return interaction.reply({
            content: '🧀 You don\'t have any stat points to allocate!',
            flags: 64
        });
    }

    // Create stat allocation modal
    const modal = new ModalBuilder()
        .setCustomId('profile_stat_allocation')
        .setTitle(`Distribute Your Power (${player.statPointsAvailable} points)`);

    const strengthInput = new TextInputBuilder()
        .setCustomId('strength')
        .setLabel(`Strength (Current: ${player.stats.strength})`)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Enter points to add')
        .setRequired(false)
        .setValue('0');

    const intelligenceInput = new TextInputBuilder()
        .setCustomId('intelligence')
        .setLabel(`Intelligence (Current: ${player.stats.intelligence})`)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Enter points to add')
        .setRequired(false)
        .setValue('0');

    const dexterityInput = new TextInputBuilder()
        .setCustomId('dexterity')
        .setLabel(`Dexterity (Current: ${player.stats.dexterity})`)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Enter points to add')
        .setRequired(false)
        .setValue('0');

    const vitalityInput = new TextInputBuilder()
        .setCustomId('vitality')
        .setLabel(`Vitality (Current: ${player.stats.vitality})`)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Enter points to add')
        .setRequired(false)
        .setValue('0');

    modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(strengthInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(intelligenceInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(dexterityInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(vitalityInput)
    );

    await interaction.showModal(modal);
}

export async function handleModal(interaction: ModalSubmitInteraction, action: string, params: string[]) {
    if (action !== 'stat' || params[0] !== 'allocation') return;

    const userId = interaction.user.id;
    const player = await getPlayer(userId);

    if (!player) {
        return interaction.reply({
            content: '🧀 Player not found!',
            flags: 64
        });
    }

    // Parse input values
    const strengthAdd = parseInt(interaction.fields.getTextInputValue('strength')) || 0;
    const intelligenceAdd = parseInt(interaction.fields.getTextInputValue('intelligence')) || 0;
    const dexterityAdd = parseInt(interaction.fields.getTextInputValue('dexterity')) || 0;
    const vitalityAdd = parseInt(interaction.fields.getTextInputValue('vitality')) || 0;

    const totalPoints = strengthAdd + intelligenceAdd + dexterityAdd + vitalityAdd;

    // Validate point allocation
    if (totalPoints > player.statPointsAvailable) {
        return interaction.reply({
            content: `🧀 You're trying to spend ${totalPoints} points but only have ${player.statPointsAvailable}! I may be chaotic, but math is math.`,
            flags: 64
        });
    }

    if (totalPoints <= 0) {
        return interaction.reply({
            content: '🧀 You need to allocate at least 1 point! Don\'t waste my time.',
            flags: 64
        });
    }

    // Validate individual values
    if (strengthAdd < 0 || intelligenceAdd < 0 || dexterityAdd < 0 || vitalityAdd < 0) {
        return interaction.reply({
            content: '🧀 Nice try, but you can\'t subtract stats! No negative numbers allowed.',
            flags: 64
        });
    }

    // Apply stat changes
    const oldStats = { ...player.stats };
    player.stats.strength += strengthAdd;
    player.stats.intelligence += intelligenceAdd;
    player.stats.dexterity += dexterityAdd;
    player.stats.vitality += vitalityAdd;
    player.statPointsAvailable -= totalPoints;

    // Recalculate health and mana based on new vitality/intelligence
    const vitalityGain = vitalityAdd * 10;
    const manaGain = intelligenceAdd * 5;
    player.maxHealth += vitalityGain;
    player.maxMana += manaGain;
    player.currentHealth += vitalityGain; // Also heal for the amount gained
    player.currentMana += manaGain; // Also restore mana

    // Save updated player
    const success = await updatePlayer(userId, player);

    if (!success) {
        return interaction.reply({
            content: '🧀 Something went wrong saving your stats. Even my powers have limits apparently.',
            flags: 64
        });
    }

    // Create confirmation embed
    const embed = new EmbedBuilder()
        .setTitle('⚡ Stats Allocated Successfully!')
        .setDescription('Your power grows! Here\'s what changed:')
        .setColor('#00FF00')
        .addFields(
            {
                name: '📊 Stat Changes',
                value: [
                    strengthAdd > 0 ? `**Strength:** ${oldStats.strength} → ${player.stats.strength} (+${strengthAdd})` : null,
                    intelligenceAdd > 0 ? `**Intelligence:** ${oldStats.intelligence} → ${player.stats.intelligence} (+${intelligenceAdd})` : null,
                    dexterityAdd > 0 ? `**Dexterity:** ${oldStats.dexterity} → ${player.stats.dexterity} (+${dexterityAdd})` : null,
                    vitalityAdd > 0 ? `**Vitality:** ${oldStats.vitality} → ${player.stats.vitality} (+${vitalityAdd})` : null
                ].filter(Boolean).join('\n'),
                inline: false
            }
        );

    if (vitalityGain > 0 || manaGain > 0) {
        embed.addFields({
            name: '💪 Bonus Effects',
            value: [
                vitalityGain > 0 ? `**Health:** +${vitalityGain} max HP (and healed!)` : null,
                manaGain > 0 ? `**Mana:** +${manaGain} max MP (and restored!)` : null
            ].filter(Boolean).join('\n'),
            inline: false
        });
    }

    embed.addFields({
        name: '📈 Remaining Points',
        value: player.statPointsAvailable.toString(),
        inline: true
    });

    embed.setFooter({ 
        text: 'Getting stronger! Not quite at my level yet, but it\'s progress.' 
    });

    await interaction.reply({ embeds: [embed], flags: 64 });
}

async function handleTitleSelection(interaction: ButtonInteraction) {
    const userId = interaction.user.id;
    const player = await getPlayer(userId);

    if (!player || player.titles.length === 0) {
        return interaction.reply({
            content: '🧀 You don\'t have any titles yet! Go achieve something first.',
            flags: 64
        });
    }

    // For now, just show available titles
    const embed = new EmbedBuilder()
        .setTitle('🏆 Your Titles')
        .setDescription(`**Current Title:** ${player.currentTitle || 'None'}\n\n**Available Titles:**\n${player.titles.map(title => `• ${title}`).join('\n')}`)
        .setColor('#FFD700')
        .setFooter({ text: 'Title selection system coming soon!' });

    await interaction.reply({ embeds: [embed], flags: 64 });
}

async function handlePathSelection(interaction: ButtonInteraction) {
    const userId = interaction.user.id;
    const player = await getPlayer(userId);

    if (!player || player.level < 20) {
        return interaction.reply({
            content: '🧀 You need to be level 20 or higher to choose a Miraculous Path!',
            flags: 64
        });
    }

    if (player.miraculousPath !== 'None') {
        return interaction.reply({
            content: '🧀 You\'ve already chosen your path! No take-backs in my world.',
            flags: 64
        });
    }

    // Create path selection embed
    const embed = new EmbedBuilder()
        .setTitle('🌟 Choose Your Miraculous Path')
        .setDescription('This choice is **permanent** and will define your late-game specialization. Choose wisely!')
        .setColor('#FF6B6B');

    Object.entries(PATH_INFO).forEach(([pathKey, pathInfo]) => {
        embed.addFields({
            name: `${pathInfo.emoji} ${pathInfo.name}`,
            value: `${pathInfo.description}\n\n**Bonuses:**\n${pathInfo.bonuses.map(bonus => `• ${bonus}`).join('\n')}\n\n*${pathInfo.plaggComment}*`,
            inline: false
        });
    });

    embed.setFooter({ text: 'This decision is permanent! Choose the path that matches your playstyle.' });

    // Create path selection buttons
    const buttonRow1 = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('profile_select_path_Destruction')
                .setLabel('💥 Destruction')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('profile_select_path_Preservation')
                .setLabel('🛡️ Preservation')
                .setStyle(ButtonStyle.Primary)
        );

    const buttonRow2 = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('profile_select_path_Abundance')
                .setLabel('❤️‍🩹 Abundance')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('profile_select_path_The Hunt')
                .setLabel('🎯 The Hunt')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({
        embeds: [embed],
        components: [buttonRow1, buttonRow2],
        flags: 64
    });
}

// Helper functions
function getProfileColor(level: number): number {
    if (level >= 50) return 0xFF00FF; // Cosmic
    if (level >= 40) return 0xFFD700; // Divine
    if (level >= 30) return 0xFF0040; // Mythical
    if (level >= 25) return 0xFF8000; // Legendary
    if (level >= 20) return 0xA335EE; // Epic
    if (level >= 15) return 0x0099CC; // Rare
    if (level >= 10) return 0x1EFF00; // Uncommon
    return 0x808080; // Common
}

function calculateTotalXPForLevel(level: number): number {
    let totalXP = 0;
    for (let i = 1; i < level; i++) {
        totalXP += Math.floor(100 * Math.pow(1.1, i - 1));
    }
    return totalXP;
}

export { handleButton, handleModal };