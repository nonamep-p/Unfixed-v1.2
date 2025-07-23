import { Message, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { getPlayer, savePlayer } from '../../database/connection';
import { config } from '../../config';
import { Player } from '../../types';

export const name = 'startrpg';
export const description = 'Start your RPG adventure by creating a character';
export const aliases = ['start', 'create', 'newgame'];
export const cooldown = 10;

export async function execute(message: Message, args: string[]) {
    const existingPlayer = await getPlayer(message.author.id);

    if (existingPlayer) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.warning)
            .setTitle('🧀 Already Started!')
            .setDescription('You already have a character! Use `$profile` to view your stats.')
            .setFooter({ text: 'Plagg: "One character at a time! I\'m not running a cloning operation here!"' });

        await message.reply({ embeds: [embed] });
        return;
    }

    const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle('🎭 Choose Your Class')
        .setDescription('Welcome to the world of chaos and camembert! Choose your class to begin your adventure.')
        .addFields(
            { name: '⚔️ Warrior', value: 'High health and physical damage', inline: true },
            { name: '🔮 Mage', value: 'Powerful magic and spells', inline: true },
            { name: '🗡️ Rogue', value: 'Speed and critical strikes', inline: true },
            { name: '🏹 Archer', value: 'Ranged attacks and precision', inline: true },
            { name: '💚 Healer', value: 'Support and healing abilities', inline: true },
            { name: '🛡️ Paladin', value: 'Balance of offense and defense', inline: true }
        )
        .setFooter({ text: 'Plagg: "Choose wisely! Or don\'t. Chaos is fun either way!"' });

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('startrpg_class_select')
        .setPlaceholder('Select your class...')
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Warrior')
                .setDescription('High health and physical damage')
                .setValue('warrior')
                .setEmoji('⚔️'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Mage')
                .setDescription('Powerful magic and spells')
                .setValue('mage')
                .setEmoji('🔮'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Rogue')
                .setDescription('Speed and critical strikes')
                .setValue('rogue')
                .setEmoji('🗡️'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Archer')
                .setDescription('Ranged attacks and precision')
                .setValue('archer')
                .setEmoji('🏹'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Healer')
                .setDescription('Support and healing abilities')
                .setValue('healer')
                .setEmoji('💚'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Paladin')
                .setDescription('Balance of offense and defense')
                .setValue('paladin')
                .setEmoji('🛡️')
        );

    const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(selectMenu);

    await message.reply({
        embeds: [embed],
        components: [actionRow]
    });
}