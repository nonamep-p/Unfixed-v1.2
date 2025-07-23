import { Message, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuInteraction } from 'discord.js';
import { getPlayer, createPlayer } from '../../src/database';
import { Player, PlayerClass } from '../../src/types';
import { CLASS_INFO } from '../../src/utils';

export async function execute(message: Message, args: string[]) {
    const userId = message.author.id;
    
    // Check if player already exists
    const existingPlayer = await getPlayer(userId);
    if (existingPlayer) {
        const embed = new EmbedBuilder()
            .setTitle('🧀 Already in the Game!')
            .setDescription('Looks like you\'re already causing chaos in my world. Try `$profile` instead to see your current mess.')
            .setColor('#FFD700')
            .setFooter({ text: 'Plagg is not impressed by redundancy' });
        
        return message.reply({ embeds: [embed] });
    }
    
    // Create class selection embed
    const embed = new EmbedBuilder()
        .setTitle('🐾 A New Kwami-sized Problem')
        .setDescription(`Well, well, well... Another human wants to join my chaotic adventure? *sighs dramatically*\n\nFine! But first, you need to pick a class. Choose wisely, because I'm not doing this twice. Each class has its own... *unique*... approach to causing mayhem.\n\n**Choose your path of destruction:**`)
        .setColor('#2F3136')
        .setThumbnail('https://cdn.discordapp.com/emojis/placeholder.png') // Placeholder for Plagg avatar
        .addFields(
            {
                name: '🛡️ Warrior',
                value: 'Tank with high defense\n*"All brawn, no brains. Perfect."*',
                inline: true
            },
            {
                name: '🔮 Mage',
                value: 'Magical DPS master\n*"Finally, some style!"*',
                inline: true
            },
            {
                name: '🗡️ Rogue',
                value: 'Critical hit assassin\n*"Sneaky like me!"*',
                inline: true
            },
            {
                name: '🏹 Archer',
                value: 'Ranged precision striker\n*"Hit from far away, smart."*',
                inline: true
            },
            {
                name: '❤️ Healer',
                value: 'Support specialist\n*"Boring but necessary."*',
                inline: true
            },
            {
                name: '⚔️ Battlemage',
                value: 'Hybrid melee/magic\n*"Can\'t decide? Typical."*',
                inline: true
            }
        )
        .setFooter({ text: '⏰ Chrono Knight is locked - achieve something special to unlock it!' });
    
    // Create class selection dropdown
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('startrpg_class_select')
        .setPlaceholder('Choose your class... carefully!')
        .addOptions([
            {
                label: 'Warrior',
                description: 'Sturdy frontline fighter with high defense',
                value: 'Warrior',
                emoji: '🛡️'
            },
            {
                label: 'Mage',
                description: 'Powerful spellcaster with magical abilities',
                value: 'Mage',
                emoji: '🔮'
            },
            {
                label: 'Rogue',
                description: 'Sneaky assassin with critical strikes',
                value: 'Rogue',
                emoji: '🗡️'
            },
            {
                label: 'Archer',
                description: 'Precise ranged fighter with hunting skills',
                value: 'Archer',
                emoji: '🏹'
            },
            {
                label: 'Healer',
                description: 'Support specialist with healing powers',
                value: 'Healer',
                emoji: '❤️'
            },
            {
                label: 'Battlemage',
                description: 'Hybrid warrior-mage combination',
                value: 'Battlemage',
                emoji: '⚔️'
            }
        ]);
    
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
    
    await message.reply({
        embeds: [embed],
        components: [row]
    });
}

export async function handleSelectMenu(interaction: StringSelectMenuInteraction, action: string, params: string[]) {
    if (action !== 'class' || !interaction.isStringSelectMenu()) return;
    
    const userId = interaction.user.id;
    const selectedClass = interaction.values[0] as PlayerClass;
    
    // Double-check player doesn't exist
    const existingPlayer = await getPlayer(userId);
    if (existingPlayer) {
        return interaction.reply({
            content: '🧀 You already have a character! Stop trying to cheat the system.',
            ephemeral: true
        });
    }
    
    // Get class info
    const classInfo = CLASS_INFO[selectedClass];
    if (!classInfo) {
        return interaction.reply({
            content: '🧀 Invalid class selection! How did you even manage that?',
            ephemeral: true
        });
    }
    
    // Create new player
    const newPlayer: Player = {
        // Basic Info
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        gold: 100, // Starting gold
        
        // Character
        playerClass: selectedClass,
        miraculousPath: 'None',
        
        // Stats
        stats: { ...classInfo.startingStats },
        statPointsAvailable: 0,
        
        // Combat Stats
        maxHealth: 50 + (classInfo.startingStats.vitality * 10),
        maxMana: 25 + (classInfo.startingStats.intelligence * 5),
        maxStamina: 100,
        currentHealth: 50 + (classInfo.startingStats.vitality * 10),
        currentMana: 25 + (classInfo.startingStats.intelligence * 5),
        currentStamina: 100,
        
        // Inventory & Equipment
        inventory: [
            { id: 'health_potion', name: 'Health Potion', type: 'Consumable', rarity: 'Common', description: 'A basic healing potion.', plaggCommentary: 'Better than nothing.', effect: { healAmount: 50 }, sellPrice: 15, buyPrice: 30, element: 'None' },
            { id: 'health_potion', name: 'Health Potion', type: 'Consumable', rarity: 'Common', description: 'A basic healing potion.', plaggCommentary: 'Better than nothing.', effect: { healAmount: 50 }, sellPrice: 15, buyPrice: 30, element: 'None' }
        ],
        equipment: {
            weapon: null,
            helmet: null,
            chestplate: null,
            leggings: null,
            boots: null
        },
        
        // Currency & Tokens
        gladiatorTokens: 0,
        miraculousEnergy: 50, // Starting energy
        
        // Social
        faction: 'None',
        
        // Achievements & Progression
        achievements: ['new_adventurer'],
        titles: ['Newbie'],
        currentTitle: null,
        
        // Combat
        skills: ['basic_attack'], // Everyone gets basic attack
        techniques: [],
        
        // Cooldowns
        lastBattle: 0,
        lastHunt: 0,
        lastDungeon: 0,
        lastMiraculous: 0,
        
        // Statistics
        totalBattles: 0,
        totalVictories: 0,
        totalDeaths: 0,
        totalDamageDealt: 0,
        totalDamageTaken: 0,
        monstersKilled: 0,
        bossesKilled: 0,
        dungeonsCompleted: 0,
        
        // Timestamps
        createdAt: Date.now(),
        lastActive: Date.now(),
        lastLogin: Date.now()
    };
    
    // Add class-specific starting items
    if (selectedClass === 'Warrior') {
        newPlayer.inventory.push({
            id: 'wooden_sword',
            name: 'Wooden Practice Sword',
            type: 'Weapon',
            rarity: 'Common',
            description: 'A basic wooden sword used for training.',
            plaggCommentary: 'Wow, a stick. I\'ve seen more threatening cheese knives.',
            stats: { attack: 5, strength: 1 },
            sellPrice: 10,
            buyPrice: 25,
            level: 1,
            element: 'Physical'
        });
    } else if (selectedClass === 'Mage') {
        newPlayer.skills.push('fireball');
        newPlayer.inventory.push({
            id: 'mana_potion',
            name: 'Mana Potion',
            type: 'Consumable',
            rarity: 'Common',
            description: 'A blue potion that restores magical energy.',
            plaggCommentary: 'Fizzy and weird. Gives you that tingly magic feeling.',
            effect: { manaAmount: 30 },
            sellPrice: 12,
            buyPrice: 25,
            element: 'None'
        });
    }
    
    // Save player to database
    const success = await createPlayer(userId, newPlayer);
    
    if (!success) {
        return interaction.reply({
            content: '🧀 Something went wrong creating your character. Even I mess up sometimes... rarely.',
            ephemeral: true
        });
    }
    
    // Create success embed
    const successEmbed = new EmbedBuilder()
        .setTitle(`🎉 Welcome to Chaos, ${selectedClass}!`)
        .setDescription(`Hmph. A ${selectedClass}, huh? ${classInfo.plaggComment}\n\nDon't expect me to do all the work. Now, where's the cheese?\n\n**Your adventure starts now!** Use \`$profile\` to see your stats, \`$help\` for commands, or jump straight into \`$battle\` if you're feeling reckless.`)
        .setColor('#00FF00')
        .addFields(
            {
                name: '💰 Starting Gold',
                value: `${newPlayer.gold} gold coins`,
                inline: true
            },
            {
                name: '⚡ Starting Energy',
                value: `${newPlayer.miraculousEnergy} Miraculous Energy`,
                inline: true
            },
            {
                name: '🎒 Starting Items',
                value: `${newPlayer.inventory.length} items in inventory`,
                inline: true
            },
            {
                name: '📊 Base Stats',
                value: `**STR:** ${newPlayer.stats.strength}\n**INT:** ${newPlayer.stats.intelligence}\n**DEX:** ${newPlayer.stats.dexterity}\n**VIT:** ${newPlayer.stats.vitality}`,
                inline: true
            },
            {
                name: '❤️ Health & Mana',
                value: `**HP:** ${newPlayer.currentHealth}/${newPlayer.maxHealth}\n**MP:** ${newPlayer.currentMana}/${newPlayer.maxMana}`,
                inline: true
            },
            {
                name: '🎯 Next Steps',
                value: '`$profile` - View your character\n`$battle` - Start fighting!\n`$help` - Learn the ropes',
                inline: true
            }
        )
        .setFooter({ text: 'Time to cause some chaos! Plagg approves... barely.' });
    
    // Create action buttons
    const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('profile_view')
                .setLabel('👤 View Profile')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('battle_start')
                .setLabel('⚔️ Start Battle')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('help_main')
                .setLabel('❓ Help')
                .setStyle(ButtonStyle.Secondary)
        );
    
    await interaction.update({
        embeds: [successEmbed],
        components: [actionRow]
    });
}

export { handleSelectMenu };
