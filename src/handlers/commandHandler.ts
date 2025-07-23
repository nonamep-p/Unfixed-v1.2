import { Collection, Message, Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import { Player, CommandCategory } from '../types';
import { loadGameData, getPlayer, savePlayer } from '../database/connection';
import { config } from '../config';
import { logger } from '../utils/logger';

export class CommandHandler {
    public commands: Collection<string, any> = new Collection();
    public categories: Map<string, CommandCategory> = new Map();
    public cooldowns: Map<string, Collection<string, number>> = new Collection();
    
    constructor(private client: Client) {
        this.initializeCategories();
    }

    private initializeCategories() {
        const categories: CommandCategory[] = [
            {
                name: 'Character',
                description: 'Manage your character, stats, class, and progression',
                commands: ['startrpg', 'profile', 'stats', 'allocate', 'class', 'path', 'title'],
                requiredLevel: 1,
                emoji: '👤'
            },
            {
                name: 'Combat', 
                description: 'Battle monsters, use skills, and engage in tactical combat',
                commands: ['battle', 'hunt', 'flee', 'skills', 'techniques', 'boss'],
                requiredLevel: 1,
                emoji: '⚔️'
            },
            {
                name: 'Economy',
                description: 'Trade, craft, buy, sell and manage your wealth',
                commands: ['shop', 'buy', 'sell', 'craft', 'recipes', 'salvage', 'market', 'trade'],
                requiredLevel: 6,
                emoji: '💰'
            },
            {
                name: 'Exploration',
                description: 'Explore dungeons, hunt artifacts, and face world bosses',
                commands: ['dungeon', 'miraculous', 'worldboss', 'explore', 'map'],
                requiredLevel: 10,
                emoji: '🗺️'
            },
            {
                name: 'PvP Arena',
                description: 'Fight other players, climb rankings, and earn glory',
                commands: ['arena', 'spectate', 'faction', 'bounty', 'ranking', 'challenge'],
                requiredLevel: 15,
                emoji: '🏟️'
            },
            {
                name: 'Social',
                description: 'Interact with other players and build relationships',
                commands: ['trade', 'view', 'party', 'leaderboard', 'roll', 'chat', 'friend'],
                requiredLevel: 5,
                emoji: '👥'
            },
            {
                name: 'Housing',
                description: 'Build and customize your personal living space',
                commands: ['house', 'decorate', 'visit', 'furniture', 'garden'],
                requiredLevel: 20,
                emoji: '🏠'
            },
            {
                name: 'Pets',
                description: 'Tame, train, and adventure with loyal companions',
                commands: ['pet', 'tame', 'feed', 'train', 'evolve'],
                requiredLevel: 18,
                emoji: '🐾'
            },
            {
                name: 'Utility',
                description: 'Helpful commands for information and management',
                commands: ['help', 'ping', 'info', 'event', 'time', 'weather', 'remind'],
                requiredLevel: 1,
                emoji: '🛠️'
            },
            {
                name: 'Admin',
                description: 'Powerful commands for bot management and testing',
                commands: ['set', 'spawn', 'reload', 'eval', 'godmode', 'shutdown', 'backup'],
                requiredLevel: 100,
                emoji: '⚡'
            }
        ];

        categories.forEach(category => {
            this.categories.set(category.name.toLowerCase(), category);
        });
    }

    public async handleCommand(message: Message): Promise<void> {
        if (!message.content.startsWith(config.prefix) || message.author.bot) return;

        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();

        if (!commandName) return;

        const command = this.commands.get(commandName) || 
                      this.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        // Check if user is registered
        if (commandName !== 'startrpg' && commandName !== 'help') {
            const player = await getPlayer(message.author.id);
            if (!player) {
                const embed = new EmbedBuilder()
                    .setColor(config.colors.warning)
                    .setTitle('🧀 Welcome, future hero!')
                    .setDescription('It seems you\'re new here. Let\'s get you started!')
                    .addFields(
                        { name: 'Getting Started', value: `Use \`${config.prefix}startrpg\` to choose your class and begin your adventure!` },
                        { name: 'Need Help?', value: `Use \`${config.prefix}help\` for a complete guide!` }
                    )
                    .setFooter({ text: 'Plagg: "Time to cause some chaos! But first... cheese!"' });

                await message.reply({ embeds: [embed] });
                return;
            }

            // Level requirements
            const category = Array.from(this.categories.values())
                .find(cat => cat.commands.includes(commandName));
            
            if (category && player.level < category.requiredLevel) {
                const embed = new EmbedBuilder()
                    .setColor(config.colors.error)
                    .setTitle('🚫 Level Requirement Not Met')
                    .setDescription(`You need to be level ${category.requiredLevel} to use ${category.name} commands!`)
                    .addFields(
                        { name: 'Current Level', value: player.level.toString(), inline: true },
                        { name: 'Required Level', value: category.requiredLevel.toString(), inline: true }
                    )
                    .setFooter({ text: 'Plagg: "Keep fighting and you\'ll get there! Like me reaching for the top shelf cheese!"' });

                await message.reply({ embeds: [embed] });
                return;
            }
        }

        // Cooldown check
        if (!this.cooldowns.has(command.name)) {
            this.cooldowns.set(command.name, new Collection());
        }

        const now = Date.now();
        const timestamps = this.cooldowns.get(command.name)!;
        const cooldownAmount = (command.cooldown || config.commandCooldown) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id)! + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                const embed = new EmbedBuilder()
                    .setColor(config.colors.warning)
                    .setTitle('⏰ Command Cooldown')
                    .setDescription(`Please wait ${timeLeft.toFixed(1)} more seconds before using \`${command.name}\` again.`)
                    .setFooter({ text: 'Plagg: "Patience! Even I wait between cheese bites... sometimes."' });

                await message.reply({ embeds: [embed] });
                return;
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        // Execute command
        try {
            await command.execute(message, args);
            logger.info(`Command ${command.name} executed by ${message.author.tag}`);
        } catch (error) {
            logger.error(`Error executing command ${command.name}:`, error);
            
            const embed = new EmbedBuilder()
                .setColor(config.colors.error)
                .setTitle('❌ Command Error')
                .setDescription('An error occurred while executing this command. The issue has been logged.')
                .setFooter({ text: 'Plagg: "Even chaos has its limits! This shouldn\'t have happened."' });

            await message.reply({ embeds: [embed] });
        }
    }

    public loadCommand(commandPath: string, command: any): void {
        this.commands.set(command.name, command);
        if (command.aliases) {
            command.aliases.forEach((alias: string) => {
                this.commands.set(alias, command);
            });
        }
    }

    public getAvailableCommands(playerLevel: number): CommandCategory[] {
        return Array.from(this.categories.values())
            .filter(category => playerLevel >= category.requiredLevel)
            .sort((a, b) => a.requiredLevel - b.requiredLevel);
    }
}

export default CommandHandler;