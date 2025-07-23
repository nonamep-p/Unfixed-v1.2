import { Client, GatewayIntentBits, Collection, Message, Interaction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ActivityType, ButtonInteraction, StringSelectMenuInteraction, ModalSubmitInteraction, RepliableInteraction } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { database } from './src/database/connection';
import { CommandHandler } from './src/handlers/commandHandler';
import { config, validateConfig } from './src/config';
import { logger } from './src/utils/logger';
import { keepAlive } from './keep_alive';

// Initialize Discord client with comprehensive intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers
    ]
});

// Initialize command handler
const commandHandler = new CommandHandler(client);

// Command interface for backward compatibility
interface BotCommand {
    execute: (message: Message, args: string[], client?: Client) => Promise<void>;
    handleSelectMenu?: (interaction: StringSelectMenuInteraction, action: string, params: string[]) => Promise<void>;
    handleButton?: (interaction: ButtonInteraction, action: string, params: string[]) => Promise<void>;
    handleModal?: (interaction: ModalSubmitInteraction, action: string, params: string[]) => Promise<void>;
}

// Legacy command collection for existing commands
const commands = new Collection<string, BotCommand>();

// Load commands from directories
function loadCommands() {
    const commandsPath = join(__dirname, 'commands');

    function loadFromDirectory(dir: string, basePath = '') {
        const items = readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
            const itemPath = join(dir, item.name);

            if (item.isDirectory()) {
                loadFromDirectory(itemPath, basePath);
            } else if (item.name.endsWith('.ts') || item.name.endsWith('.js')) {
                try {
                    const command = require(itemPath);
                    const commandName = item.name.replace(/\.(ts|js)$/, '');
                    commands.set(commandName, command);
                    console.log(`🧀 Loaded command: ${commandName}`);
                } catch (error) {
                    console.error(`❌ Failed to load command ${item.name}:`, error);
                }
            }
        }
    }

    loadFromDirectory(commandsPath);
}

// Bot ready event
client.once('ready', () => {
    console.log(`🐾 Plagg Bot is ready! Logged in as ${client.user?.tag}`);
    console.log(`🧀 Serving ${client.guilds.cache.size} servers with ${client.users.cache.size} users`);

    // Set bot activity
    client.user?.setActivity('with Camembert | $help', { type: ActivityType.Playing });
});

// Message handling with new command handler
client.on('messageCreate', async (message: Message) => {
    // Handle with new command handler first
    await commandHandler.handleCommand(message);

    // Fallback to legacy command system for existing commands
    if (message.author.bot || !message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    // Check legacy commands
    const command = commands.get(commandName);
    if (command) {
        try {
            await command.execute(message, args, client);
        } catch (error) {
            logger.error(`Error executing legacy command ${commandName}:`, error);

            const errorEmbed = new EmbedBuilder()
                .setTitle('🧀 Oops! I Dropped My Camembert')
                .setDescription('Something went wrong while executing that command. Even I make mistakes sometimes... rarely.')
                .setColor(config.colors.error)
                .setFooter({ text: 'Try again in a moment' });

            message.reply({ embeds: [errorEmbed] }).catch(console.error);
        }
    }
});

// Interaction handling
client.on('interactionCreate', async (interaction: Interaction) => {
    try {
        if (interaction.isStringSelectMenu()) {
            const [commandName, action, ...params] = interaction.customId.split('_');
            const command = commands.get(commandName);

            if (command && command.handleSelectMenu) {
                await command.handleSelectMenu(interaction, action, params);
            }
        } else if (interaction.isButton()) {
            const [commandName, action, ...params] = interaction.customId.split('_');
            const command = commands.get(commandName);

            if (command && command.handleButton) {
                await command.handleButton(interaction, action, params);
            }
        } else if (interaction.isModalSubmit()) {
            const [commandName, action, ...params] = interaction.customId.split('_');
            const command = commands.get(commandName);

            if (command && command.handleModal) {
                await command.handleModal(interaction, action, params);
            }
        }
    } catch (error) {
        console.error('Interaction error:', error);

        if (interaction.isRepliable()) {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: '🧀 Something went wrong with that interaction. Even Plagg has off days.',
                    ephemeral: true
                }).catch(console.error);
            } else {
                await interaction.reply({
                    content: '🧀 Something went wrong with that interaction. Even Plagg has off days.',
                    ephemeral: true
                }).catch(console.error);
            }
        }
    }
});

// Error handling
client.on('error', (error) => {
    logger.error('Discord client error:', error);
});

client.on('warn', (warning) => {
    logger.warn('Discord client warning:', warning);
});

process.on('unhandledRejection', (error) => {
    logger.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
    logger.fatal('Uncaught exception:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    logger.info('Shutting down gracefully...');
    await database.close();
    client.destroy();
    process.exit(0);
});

// Initialize everything
async function init() {
    try {
        logger.info('Initializing Plagg Bot Ultimate Edition...');

        // Validate configuration
        if (!validateConfig()) {
            logger.error('Configuration validation failed');
            process.exit(1);
        }

        // Initialize database
        await database.initialize();
        logger.info('Database initialized');

        // Load legacy commands for compatibility
        loadCommands();
        logger.info(`Loaded ${commands.size} legacy commands`);

        // Load new command system - temporarily disabled until module loading is fixed
        // loadNewCommands('./src/commands');
        logger.info(`Loaded ${commandHandler.commands.size} new commands`);

        // Start keep-alive server
        keepAlive();
        logger.info('Keep-alive server started');

        // Login to Discord
        const token = process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN;
        if (!token) {
            throw new Error('DISCORD_BOT_TOKEN environment variable is required');
        }

        await client.login(token);
    } catch (error) {
        logger.error('Failed to initialize bot:', error);
        process.exit(1);
    }
}

// Load new command system
function loadNewCommands(dir: string): void {
    const fs = require('fs');
    const path = require('path');

    function loadFromDirectory(directory: string) {
        const entries = fs.readdirSync(directory);

        for (const entry of entries) {
            const fullPath = path.join(directory, entry);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                loadFromDirectory(fullPath);
            } else if (entry.endsWith('.ts') && fs.existsSync(fullPath)) {
                try {
                    // Use absolute path and resolve from the current working directory
                    const absolutePath = path.resolve(fullPath);
                    delete require.cache[absolutePath]; // Clear cache to ensure fresh load
                    const command = require(absolutePath);

                    if (command && command.name) {
                        commandHandler.loadCommand(absolutePath, command);
                        logger.info(`Loaded command: ${command.name}`);
                    }
                } catch (error) {
                    logger.error(`Failed to load ${fullPath}:`, error);
                }
            }
        }
    }

    if (fs.existsSync(dir)) {
        loadFromDirectory(dir);
    }
}

// Start the bot
init();

export { client, commands, commandHandler, config };