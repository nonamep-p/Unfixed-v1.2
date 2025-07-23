import { Message, EmbedBuilder } from 'discord.js';
import { getPlayer } from '../../database/connection';
import { config } from '../../config';

export const name = 'house';
export const description = 'Manage your personal housing and decorations';
export const aliases = ['home', 'residence'];
export const cooldown = 5;

export async function execute(message: Message, args: string[]) {
    const player = await getPlayer(message.author.id);

    if (!player) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.warning)
            .setTitle('🧀 Not Registered')
            .setDescription('You need to start your adventure first! Use `$startrpg` to begin.')
            .setFooter({ text: 'Plagg: "Homeless AND characterless? That\'s rough!"' });

        await message.reply({ embeds: [embed] });
        return;
    }

    const embed = new EmbedBuilder()
        .setColor(config.colors.info)
        .setTitle('🏠 Housing System')
        .setDescription('*Your future home is still in the planning phase! Soon you\'ll have your own space to decorate.*')
        .addFields(
            { name: '🛠️ Coming Soon', value: 'Buy and upgrade houses\nDecorate with furniture\nInvite friends over\nStorage rooms', inline: false },
            { name: '💰 Your Gold', value: `${player.gold.toLocaleString()}`, inline: true }
        )
        .setFooter({ text: 'Plagg: "I\'d offer my place, but it\'s full of cheese and chaos!"' });

    await message.reply({ embeds: [embed] });
}