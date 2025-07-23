import { Message, EmbedBuilder } from 'discord.js';
import { getPlayer } from '../../database/connection';
import { config } from '../../config';

export const name = 'dungeon';
export const description = 'Explore dangerous dungeons for rare loot and challenges';
export const aliases = ['explore', 'delve'];
export const cooldown = 10;

export async function execute(message: Message, args: string[]) {
    const player = await getPlayer(message.author.id);

    if (!player) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.warning)
            .setTitle('🧀 Not Registered')
            .setDescription('You need to start your adventure first! Use `$startrpg` to begin.')
            .setFooter({ text: 'Plagg: "Dungeons are dangerous enough WITH experience!"' });

        await message.reply({ embeds: [embed] });
        return;
    }

    const embed = new EmbedBuilder()
        .setColor(config.colors.combat)
        .setTitle('🏰 Dungeon Exploration')
        .setDescription('*The dungeon entrances are sealed for now! Epic adventures await once they\'re ready.*')
        .addFields(
            { name: '⚔️ Coming Soon', value: 'Multi-floor dungeons\nBoss encounters\nRare loot drops\nParty expeditions', inline: false },
            { name: '📊 Your Level', value: `Level ${player.level}`, inline: true },
            { name: '❤️ Your Health', value: `${player.health}/${player.maxHealth}`, inline: true }
        )
        .setFooter({ text: 'Plagg: "Even I need time to properly curse these dungeons!"' });

    await message.reply({ embeds: [embed] });
}