import { Message, EmbedBuilder } from 'discord.js';
import { getPlayer } from '../../database/connection';
import { config } from '../../config';

export const name = 'craft';
export const description = 'Craft items using materials and recipes';
export const aliases = ['make', 'create', 'forge'];
export const cooldown = 5;

export async function execute(message: Message, args: string[]) {
    const player = await getPlayer(message.author.id);

    if (!player) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.warning)
            .setTitle('🧀 Not Registered')
            .setDescription('You need to start your adventure first! Use `$startrpg` to begin.')
            .setFooter({ text: 'Plagg: "Can\'t craft without hands! Or existence!"' });

        await message.reply({ embeds: [embed] });
        return;
    }

    const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle('🔨 Crafting Workshop')
        .setDescription('*The crafting system is being forged as we speak! Soon you\'ll be able to create amazing items.*')
        .addFields(
            { name: '⚒️ Coming Soon', value: 'Learn recipes\nCraft weapons & armor\nEnhance equipment\nCreate consumables', inline: false },
            { name: '📦 Inventory Space', value: `${player.inventory.length}/50 items`, inline: true }
        )
        .setFooter({ text: 'Plagg: "I\'d help with crafting, but I\'m more of a destruction specialist!"' });

    await message.reply({ embeds: [embed] });
}