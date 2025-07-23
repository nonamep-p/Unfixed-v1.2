import { Message, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuInteraction, ButtonInteraction } from 'discord.js';
import { getPlayer } from '../../src/database';

export async function execute(message: Message, args: string[]) {
    const userId = message.author.id;
    const player = await getPlayer(userId);

    // Check if this is a new player who needs tutorial
    if (!player) {
        await showTutorialPrompt(message);
        return;
    }

    // Show main help menu
    await showMainHelp(message);
}

async function showTutorialPrompt(message: Message) {
    const embed = new EmbedBuilder()
        .setTitle('🐾 Welcome to Plagg\'s Chaotic World!')
        .setDescription(`Well, well, well... A new human wants to join my adventure? *dramatically sighs*\n\nI can see you don\'t have a character yet. Don\'t worry, I\'ll guide you through this mess... reluctantly.\n\n**What would you like to do?**`)
        .setColor('#2F3136')
        .addFields(
            {
                name: '🎮 Start Your Adventure',
                value: 'Create your character and begin your journey with me!',
                inline: false
            },
            {
                name: '📚 Learn the Basics',
                value: 'Get an overview of how this chaotic RPG works.',
                inline: false
            }
        )
        .setFooter({ text: 'Choose wisely! I don\'t like repeating myself.' });

    const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help_create_character')
                .setLabel('🎯 Create Character')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('help_tutorial')
                .setLabel('📖 Tutorial')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('help_main_menu')
                .setLabel('📋 Full Help')
                .setStyle(ButtonStyle.Secondary)
        );

    await message.reply({
        embeds: [embed],
        components: [actionRow]
    });
}

async function showMainHelp(message: Message) {
    const embed = new EmbedBuilder()
        .setTitle('🧀 Plagg\'s Guide to Chaos')
        .setDescription('*Ugh, fine. I\'ll help you understand this complicated world. But only because I\'m bored and you probably have cheese somewhere.*\n\n**Choose a topic to learn about:**')
        .setColor('#9400D3')
        .addFields(
            {
                name: '🎮 Quick Start',
                value: 'Essential commands to get you started causing chaos.',
                inline: true
            },
            {
                name: '⚔️ Combat System',
                value: 'Learn how to fight monsters and not die horribly.',
                inline: true
            },
            {
                name: '🎒 Inventory & Items',
                value: 'Managing your collection of not-cheese items.',
                inline: true
            },
            {
                name: '📊 Character System',
                value: 'Stats, classes, and becoming less pathetic.',
                inline: true
            },
            {
                name: '🏰 Adventures',
                value: 'Hunting, dungeons, and miraculous expeditions.',
                inline: true
            },
            {
                name: '🏪 Economy & Trading',
                value: 'Making money and spending it on useful things.',
                inline: true
            },
            {
                name: '🌟 Advanced Features',
                value: 'Miraculous paths, achievements, and end-game content.',
                inline: true
            },
            {
                name: '🤖 Bot Features',
                value: 'Special commands and quality of life features.',
                inline: true
            }
        )
        .setFooter({ text: 'Select a category to learn more, or use buttons for quick actions!' });

    const helpDropdown = new StringSelectMenuBuilder()
        .setCustomId('help_topic_select')
        .setPlaceholder('Select a help topic...')
        .addOptions([
            {
                label: 'Quick Start Guide',
                description: 'Essential commands and first steps',
                value: 'quick_start',
                emoji: '🎮'
            },
            {
                label: 'Combat System',
                description: 'Battle mechanics and strategies',
                value: 'combat',
                emoji: '⚔️'
            },
            {
                label: 'Inventory & Items',
                description: 'Item management and equipment',
                value: 'inventory',
                emoji: '🎒'
            },
            {
                label: 'Character System',
                description: 'Classes, stats, and progression',
                value: 'character',
                emoji: '📊'
            },
            {
                label: 'Adventures',
                description: 'Hunting, dungeons, and exploration',
                value: 'adventures',
                emoji: '🏰'
            },
            {
                label: 'Economy & Trading',
                description: 'Gold, shops, and marketplace',
                value: 'economy',
                emoji: '🏪'
            },
            {
                label: 'Advanced Features',
                description: 'End-game content and special systems',
                value: 'advanced',
                emoji: '🌟'
            },
            {
                label: 'Bot Features',
                description: 'Commands and special functions',
                value: 'bot_features',
                emoji: '🤖'
            }
        ]);

    const quickActionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help_commands')
                .setLabel('📋 All Commands')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('help_tutorial')
                .setLabel('📖 Interactive Tutorial')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('help_support')
                .setLabel('❓ Need Help?')
                .setStyle(ButtonStyle.Secondary)
        );

    await message.reply({
        embeds: [embed],
        components: [
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(helpDropdown),
            quickActionRow
        ]
    });
}

export async function handleSelectMenu(interaction: StringSelectMenuInteraction, action: string, params: string[]) {
    if (action !== 'topic' || params[0] !== 'select') return;

    const topic = interaction.values[0];

    switch (topic) {
        case 'quick_start':
            await showQuickStartGuide(interaction);
            break;
        case 'combat':
            await showCombatGuide(interaction);
            break;
        case 'inventory':
            await showInventoryGuide(interaction);
            break;
        case 'character':
            await showCharacterGuide(interaction);
            break;
        case 'adventures':
            await showAdventuresGuide(interaction);
            break;
        case 'economy':
            await showEconomyGuide(interaction);
            break;
        case 'advanced':
            await showAdvancedGuide(interaction);
            break;
        case 'bot_features':
            await showBotFeaturesGuide(interaction);
            break;
        default:
            await interaction.reply({
                content: '🧀 Invalid topic selected!',
                flags: 64
            });
    }
}

export async function handleButton(interaction: ButtonInteraction, action: string, params: string[]) {
    switch (action) {
        case 'create' && params[0] === 'character':
            await interaction.reply({
                content: '🧀 Use the `$startrpg` command to create your character and choose your class!',
                flags: 64
            });
            break;
        case 'tutorial':
            await showInteractiveTutorial(interaction);
            break;
        case 'main' && params[0] === 'menu':
            await showMainHelpInInteraction(interaction);
            break;
        case 'commands':
            await showAllCommands(interaction);
            break;
        case 'support':
            await showSupportInfo(interaction);
            break;
        case 'back':
            await showMainHelpInInteraction(interaction);
            break;
        default:
            await interaction.reply({
                content: '🧀 Unknown action!',
                flags: 64
            });
    }
}

async function showQuickStartGuide(interaction: StringSelectMenuInteraction) {
    const embed = new EmbedBuilder()
        .setTitle('🎮 Quick Start Guide')
        .setDescription('*Alright, listen up! Here\'s how to survive in my chaotic world without embarrassing yourself too much.*')
        .setColor('#00FF00')
        .addFields(
            {
                name: '1️⃣ Create Your Character',
                value: '`$startrpg` - Choose your class and start your adventure\n*Choose wisely, I won\'t let you change it easily!*',
                inline: false
            },
            {
                name: '2️⃣ Check Your Profile',
                value: '`$profile` - View your stats, level, and equipment\n*Admire your pathetic starting stats!*',
                inline: false
            },
            {
                name: '3️⃣ Start Fighting',
                value: '`$battle` - Enter combat with monsters\n*Time to prove you\'re not completely useless!*',
                inline: false
            },
            {
                name: '4️⃣ Manage Items',
                value: '`$inventory` - View and use your items\n*Your collection of definitely-not-cheese items.*',
                inline: false
            },
            {
                name: '5️⃣ Explore Further',
                value: '`$hunt` - Hunt specific monsters\n`$shop` - Buy better equipment\n`$help` - When you inevitably get confused',
                inline: false
            }
        )
        .setFooter({ text: 'Follow these steps and you might actually survive! Maybe.' });

    const backButton = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help_back')
                .setLabel('🔙 Back to Help Menu')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({
        embeds: [embed],
        components: [backButton],
        flags: 64
    });
}

async function showCombatGuide(interaction: StringSelectMenuInteraction) {
    const embed = new EmbedBuilder()
        .setTitle('⚔️ Combat System Guide')
        .setDescription('*Fighting is easy! Just hit things until they stop moving. But since you humans need detailed explanations...*')
        .setColor('#FF4444')
        .addFields(
            {
                name: '🎯 Basic Combat',
                value: '• Turn-based system - you go, then the monster\n• Use `$battle` to fight random monsters\n• Choose from Attack, Skills, Items, or Flee\n• Watch your HP and MP carefully!',
                inline: false
            },
            {
                name: '⚡ Actions Available',
                value: '**Basic Attack** - Free, reliable damage\n**Skills** - Costs MP, more powerful\n**Items** - Use potions to heal\n**Flee** - Run away like a coward (75% success rate)',
                inline: false
            },
            {
                name: '💥 Special Mechanics',
                value: '**Critical Hits** - Extra damage based on DEX\n**Weakness Break** - Exploit enemy weaknesses\n**Follow-up Attacks** - 25% chance on crits\n**Status Effects** - Buffs and debuffs',
                inline: false
            },
            {
                name: '🏆 Victory Rewards',
                value: '• Experience points for leveling up\n• Gold for purchasing items\n• Random item drops\n• Glory and my reluctant approval',
                inline: false
            },
            {
                name: '💀 Defeat Consequences',
                value: '• Lose 10% of your gold\n• Health set to 1 HP\n• Bruised ego\n• My disappointment',
                inline: false
            }
        )
        .setFooter({ text: 'Pro tip: Don\'t die. It\'s bad for your health.' });

    const backButton = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help_back')
                .setLabel('🔙 Back to Help Menu')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({
        embeds: [embed],
        components: [backButton],
        flags: 64
    });
}

async function showInventoryGuide(interaction: StringSelectMenuInteraction) {
    const embed = new EmbedBuilder()
        .setTitle('🎒 Inventory & Items Guide')
        .setDescription('*Your collection of various non-cheese items. I suppose they\'re... adequate.*')
        .setColor('#8B4513')
        .addFields(
            {
                name: '📦 Item Types',
                value: '**Weapons** ⚔️ - Increase attack power\n**Armor** 🛡️ - Boost defense and health\n**Consumables** 🧪 - Healing potions and buffs\n**Materials** 🔧 - Crafting components\n**Artifacts** ✨ - Special Kwami-related items',
                inline: false
            },
            {
                name: '🌈 Rarity System',
                value: '⚪ Common → 🟢 Uncommon → 🔵 Rare → 🟣 Epic\n🟠 Legendary → 🔴 Mythical → ⭐ Divine → 🌟 Cosmic',
                inline: false
            },
            {
                name: '🎮 Managing Items',
                value: '`$inventory` - Browse your items with filters\n**Equip** - Wear armor and weapons\n**Use** - Consume potions and items\n**Sell** - Get gold for unwanted items\n**Compare** - See stat differences',
                inline: false
            },
            {
                name: '⚡ Equipment Stats',
                value: '**Attack** - Weapon damage\n**Defense** - Damage reduction\n**Health/Mana** - Resource increases\n**Crit Chance/Damage** - Critical hit bonuses\n**Stat Bonuses** - STR, INT, DEX, VIT',
                inline: false
            }
        )
        .setFooter({ text: 'Remember: Better gear = less dying. It\'s basic math!' });

    const backButton = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help_back')
                .setLabel('🔙 Back to Help Menu')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({
        embeds: [embed],
        components: [backButton],
        flags: 64
    });
}

async function showCharacterGuide(interaction: StringSelectMenuInteraction) {
    const embed = new EmbedBuilder()
        .setTitle('📊 Character System Guide')
        .setDescription('*Your character represents your potential for chaos and destruction. Let me explain how not to waste it.*')
        .setColor('#9400D3')
        .addFields(
            {
                name: '🎭 Classes Available',
                value: '🛡️ **Warrior** - Tank with high defense\n🔮 **Mage** - Magical DPS master\n🗡️ **Rogue** - Critical hit assassin\n🏹 **Archer** - Ranged precision striker\n❤️ **Healer** - Support specialist\n⚔️ **Battlemage** - Hybrid melee/magic\n⏰ **Chrono Knight** - Time magic (Hidden)',
                inline: false
            },
            {
                name: '⚡ Core Stats',
                value: '**Strength** - Physical damage and carrying capacity\n**Intelligence** - Magic damage and mana\n**Dexterity** - Critical chance and accuracy\n**Vitality** - Health points and stamina',
                inline: false
            },
            {
                name: '📈 Progression',
                value: '• Gain XP from battles and activities\n• Level up to increase stats and unlock content\n• Get 3 stat points per level to distribute\n• Unlock new skills and abilities',
                inline: false
            },
            {
                name: '🌟 Miraculous Paths (Level 20+)',
                value: '💥 **Destruction** - Pure offensive power\n🛡️ **Preservation** - Defensive mastery\n❤️‍🩹 **Abundance** - Support excellence\n🎯 **The Hunt** - Precision strikes',
                inline: false
            }
        )
        .setFooter({ text: 'Choose your specialization wisely. I won\'t hold your hand forever!' });

    const backButton = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help_back')
                .setLabel('🔙 Back to Help Menu')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({
        embeds: [embed],
        components: [backButton],
        flags: 64
    });
}

async function showAdventuresGuide(interaction: StringSelectMenuInteraction) {
    const embed = new EmbedBuilder()
        .setTitle('🏰 Adventures Guide')
        .setDescription('*Time to explore the world and cause some real chaos! Here are your options for adventure.*')
        .setColor('#FF8C00')
        .addFields(
            {
                name: '🦌 Monster Hunting',
                value: '`$battle` - Fight random monsters your level\n`$hunt` - Choose specific monster types\n• Adaptive difficulty scaling\n• Better rewards for tougher enemies',
                inline: false
            },
            {
                name: '🏰 Dungeon Exploration',
                value: '`$dungeon` - Multi-floor adventures\n• **Goblin Caves** (Levels 1-10)\n• **Ancient Ruins** (Levels 15-25)\n• **Shadow Realm** (Levels 30-40)\n• **Cosmic Void** (Levels 45+)',
                inline: false
            },
            {
                name: '✨ Miraculous Expeditions',
                value: '`$miraculous` - Special artifact farming\n• Costs 40 Miraculous Energy\n• Guaranteed Kwami Artifacts\n• Unique encounters and rewards',
                inline: false
            },
            {
                name: '🏆 Rewards',
                value: '• Experience points for progression\n• Gold and valuable items\n• Rare equipment and materials\n• Achievement progress\n• My grudging respect',
                inline: false
            }
        )
        .setFooter({ text: 'Adventure awaits! Try not to die immediately.' });

    const backButton = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help_back')
                .setLabel('🔙 Back to Help Menu')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({
        embeds: [embed],
        components: [backButton],
        flags: 64
    });
}

async function showEconomyGuide(interaction: StringSelectMenuInteraction) {
    const embed = new EmbedBuilder()
        .setTitle('🏪 Economy & Trading Guide')
        .setDescription('*Money makes the world go round! Even in my chaotic domain, you need gold to get the good stuff.*')
        .setColor('#FFD700')
        .addFields(
            {
                name: '💰 Currencies',
                value: '**Gold** 🏆 - Primary currency for most items\n**Gladiator Tokens** ⚔️ - PvP arena rewards\n**Miraculous Energy** ✨ - Special expeditions',
                inline: false
            },
            {
                name: '🏪 Shopping',
                value: '`$shop` - Browse items by category\n• Weapons, armor, consumables\n• Materials and special items\n• Prices scale with item quality',
                inline: false
            },
            {
                name: '💸 Making Money',
                value: '• Win battles against monsters\n• Sell unwanted items\n• Complete achievements\n• Participate in events\n• Find treasure in dungeons',
                inline: false
            },
            {
                name: '🔄 Trading Tips',
                value: '• Higher rarity items sell for more\n• Stock up on health potions\n• Save gold for equipment upgrades\n• Don\'t hoard materials you can\'t use',
                inline: false
            }
        )
        .setFooter({ text: 'Spend wisely! I won\'t lend you cheese money.' });

    const backButton = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help_back')
                .setLabel('🔙 Back to Help Menu')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({
        embeds: [embed],
        components: [backButton],
        flags: 64
    });
}

async function showAdvancedGuide(interaction: StringSelectMenuInteraction) {
    const embed = new EmbedBuilder()
        .setTitle('🌟 Advanced Features Guide')
        .setDescription('*For those who\'ve survived long enough to see the real chaos. Congratulations on not dying!*')
        .setColor('#FF00FF')
        .addFields(
            {
                name: '🏆 Achievement System',
                value: '• 6-tier progression: Bronze → Mythic\n• Hidden achievements to discover\n• Exclusive rewards and titles\n• Progress tracking and statistics',
                inline: false
            },
            {
                name: '👑 Titles & Prestige',
                value: '• Display titles from achievements\n• Some titles provide stat bonuses\n• Show off your accomplishments\n• Unlock special cosmetic effects',
                inline: false
            },
            {
                name: '⏰ Hidden Classes',
                value: '• **Chrono Knight** - Time manipulation\n• Unlock through secret requirements\n• Powerful unique abilities\n• Prestige and bragging rights',
                inline: false
            },
            {
                name: '🎯 Technique System',
                value: '• Pre-combat preparation abilities\n• 3 technique points per battle\n• Strategic depth and planning\n• Adapt to different enemy types',
                inline: false
            }
        )
        .setFooter({ text: 'Master these systems and you might actually impress me!' });

    const backButton = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help_back')
                .setLabel('🔙 Back to Help Menu')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({
        embeds: [embed],
        components: [backButton],
        flags: 64
    });
}

async function showBotFeaturesGuide(interaction: StringSelectMenuInteraction) {
    const embed = new EmbedBuilder()
        .setTitle('🤖 Bot Features Guide')
        .setDescription('*Special commands and features that make this bot slightly less terrible than others.*')
        .setColor('#00FFFF')
        .addFields(
            {
                name: '🎮 Interactive UI',
                value: '• Button-based combat controls\n• Dropdown menus for selections\n• Real-time stat updates\n• Persistent view across restarts',
                inline: false
            },
            {
                name: '📊 Smart Systems',
                value: '• Auto-tutorial for new players\n• Context-aware help messages\n• Intelligent error handling\n• Performance optimization',
                inline: false
            },
            {
                name: '🧀 Plagg\'s Personality',
                value: '• Sarcastic commentary on everything\n• Cheese obsession references\n• Dynamic responses based on context\n• AI-powered chat (owner only)',
                inline: false
            },
            {
                name: '🛡️ Quality Features',
                value: '• 24/7 uptime with auto-reconnection\n• Data persistence and backups\n• Comprehensive error recovery\n• Regular updates and improvements',
                inline: false
            }
        )
        .setFooter({ text: 'I\'m not just any ordinary Kwami bot - I\'m THE Kwami bot!' });

    const backButton = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help_back')
                .setLabel('🔙 Back to Help Menu')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({
        embeds: [embed],
        components: [backButton],
        flags: 64
    });
}

async function showInteractiveTutorial(interaction: ButtonInteraction) {
    const embed = new EmbedBuilder()
        .setTitle('📖 Interactive Tutorial')
        .setDescription('*Ugh, fine! I\'ll walk you through this step by step. But pay attention - I\'m not repeating myself!*\n\n**Tutorial Steps:**')
        .setColor('#00FF00')
        .addFields(
            {
                name: 'Step 1: Character Creation',
                value: 'Use `$startrpg` to create your character and choose a class. Each class has different strengths!',
                inline: false
            },
            {
                name: 'Step 2: Check Your Profile',
                value: 'Use `$profile` to see your stats, equipment, and progress. This is your character sheet!',
                inline: false
            },
            {
                name: 'Step 3: First Battle',
                value: 'Use `$battle` to fight your first monster. Learn the combat system with basic attacks!',
                inline: false
            },
            {
                name: 'Step 4: Inventory Management',
                value: 'Use `$inventory` to view items you\'ve found. Equip weapons and armor, use potions!',
                inline: false
            },
            {
                name: 'Step 5: Character Growth',
                value: 'As you level up, allocate stat points in your profile. Specialize in your class strengths!',
                inline: false
            },
            {
                name: 'Step 6: Explore Further',
                value: 'Try `$hunt` for specific monsters, `$shop` to buy items, and other commands as you grow!',
                inline: false
            }
        )
        .setFooter({ text: 'Follow these steps and you\'ll be causing chaos in no time!' });

    const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help_create_character')
                .setLabel('🎯 Start Tutorial ($startrpg)')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('help_back')
                .setLabel('🔙 Back to Help')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({
        embeds: [embed],
        components: [actionRow],
        flags: 64
    });
}

async function showAllCommands(interaction: ButtonInteraction) {
    const embed = new EmbedBuilder()
        .setTitle('📋 All Commands')
        .setDescription('*Here\'s every command available in my domain. Try not to break anything!*')
        .setColor('#9400D3')
        .addFields(
            {
                name: '👤 Character Commands',
                value: '`$startrpg` - Create your character\n`$profile` - View character stats\n`$stats` - Quick stat overview',
                inline: false
            },
            {
                name: '⚔️ Combat Commands',
                value: '`$battle` - Fight random monsters\n`$hunt` - Hunt specific monsters\n`$dungeon` - Explore dungeons',
                inline: false
            },
            {
                name: '🎒 Inventory Commands',
                value: '`$inventory` - Manage your items\n`$equip <item>` - Quick equip\n`$use <item>` - Quick use item',
                inline: false
            },
            {
                name: '🏪 Economy Commands',
                value: '`$shop` - Browse and buy items\n`$sell <item>` - Quick sell items\n`$balance` - Check currencies',
                inline: false
            },
            {
                name: '🎯 Adventure Commands',
                value: '`$miraculous` - Artifact expeditions\n`$achievements` - View progress\n`$leaderboard` - Top players',
                inline: false
            },
            {
                name: '❓ Utility Commands',
                value: '`$help` - This help system\n`$info` - Bot information\n`$ping` - Bot responsiveness',
                inline: false
            }
        )
        .setFooter({ text: 'Owner commands exist but are secret. Like my cheese stash.' });

    const backButton = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help_back')
                .setLabel('🔙 Back to Help')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({
        embeds: [embed],
        components: [backButton],
        flags: 64
    });
}

async function showSupportInfo(interaction: ButtonInteraction) {
    const embed = new EmbedBuilder()
        .setTitle('❓ Need More Help?')
        .setDescription('*Still confused? I suppose I can offer more assistance... reluctantly.*')
        .setColor('#FF69B4')
        .addFields(
            {
                name: '🐛 Found a Bug?',
                value: 'Report issues to the bot owner. Include what you were doing when it broke!',
                inline: false
            },
            {
                name: '💡 Suggestions',
                value: 'Have ideas for new features? I might consider them... if they involve cheese.',
                inline: false
            },
            {
                name: '🤝 Community',
                value: 'Join the server\'s community channels to get help from other players!',
                inline: false
            },
            {
                name: '📚 Additional Resources',
                value: '• Use `$help <topic>` for specific help\n• Try commands to learn by doing\n• Check `$achievements` for goals\n• Experiment with the interactive UI',
                inline: false
            }
        )
        .setFooter({ text: 'Remember: I\'m just a Kwami. I can\'t fix everything!' });

    const backButton = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help_back')
                .setLabel('🔙 Back to Help')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({
        embeds: [embed],
        components: [backButton],
        flags: 64
    });
}

async function showMainHelpInInteraction(interaction: ButtonInteraction) {
    // Same as showMainHelp but for interactions
    const embed = new EmbedBuilder()
        .setTitle('🧀 Plagg\'s Guide to Chaos')
        .setDescription('*Ugh, fine. I\'ll help you understand this complicated world. But only because I\'m bored and you probably have cheese somewhere.*\n\n**Choose a topic to learn about:**')
        .setColor('#9400D3')
        .addFields(
            {
                name: '🎮 Quick Start',
                value: 'Essential commands to get you started causing chaos.',
                inline: true
            },
            {
                name: '⚔️ Combat System',
                value: 'Learn how to fight monsters and not die horribly.',
                inline: true
            },
            {
                name: '🎒 Inventory & Items',
                value: 'Managing your collection of not-cheese items.',
                inline: true
            },
            {
                name: '📊 Character System',
                value: 'Stats, classes, and becoming less pathetic.',
                inline: true
            },
            {
                name: '🏰 Adventures',
                value: 'Hunting, dungeons, and miraculous expeditions.',
                inline: true
            },
            {
                name: '🏪 Economy & Trading',
                value: 'Making money and spending it on useful things.',
                inline: true
            },
            {
                name: '🌟 Advanced Features',
                value: 'Miraculous paths, achievements, and end-game content.',
                inline: true
            },
            {
                name: '🤖 Bot Features',
                value: 'Special commands and quality of life features.',
                inline: true
            }
        )
        .setFooter({ text: 'Select a category to learn more, or use buttons for quick actions!' });

    const helpDropdown = new StringSelectMenuBuilder()
        .setCustomId('help_topic_select')
        .setPlaceholder('Select a help topic...')
        .addOptions([
            {
                label: 'Quick Start Guide',
                description: 'Essential commands and first steps',
                value: 'quick_start',
                emoji: '🎮'
            },
            {
                label: 'Combat System',
                description: 'Battle mechanics and strategies',
                value: 'combat',
                emoji: '⚔️'
            },
            {
                label: 'Inventory & Items',
                description: 'Item management and equipment',
                value: 'inventory',
                emoji: '🎒'
            },
            {
                label: 'Character System',
                description: 'Classes, stats, and progression',
                value: 'character',
                emoji: '📊'
            },
            {
                label: 'Adventures',
                description: 'Hunting, dungeons, and exploration',
                value: 'adventures',
                emoji: '🏰'
            },
            {
                label: 'Economy & Trading',
                description: 'Gold, shops, and marketplace',
                value: 'economy',
                emoji: '🏪'
            },
            {
                label: 'Advanced Features',
                description: 'End-game content and special systems',
                value: 'advanced',
                emoji: '🌟'
            },
            {
                label: 'Bot Features',
                description: 'Commands and special functions',
                value: 'bot_features',
                emoji: '🤖'
            }
        ]);

    const quickActionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help_commands')
                .setLabel('📋 All Commands')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('help_tutorial')
                .setLabel('📖 Interactive Tutorial')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('help_support')
                .setLabel('❓ Need Help?')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.update({
        embeds: [embed],
        components: [
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(helpDropdown),
            quickActionRow
        ]
    });
}

export { handleSelectMenu, handleButton };