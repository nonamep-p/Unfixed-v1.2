import { Message, EmbedBuilder } from 'discord.js';
import { getPlayer } from '../../database/connection';
import { config } from '../../config';

export const name = 'arena';
export const description = 'Fight other players in the PvP arena';
export const aliases = ['pvp', 'fight', 'duel'];
export const cooldown = 10;

export async function execute(message: Message, args: string[]) {
    const player = await getPlayer(message.author.id);

    if (!player) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.warning)
            .setTitle('🧀 Not Registered')
            .setDescription('You need to start your adventure first! Use `$startrpg` to begin.')
            .setFooter({ text: 'Plagg: "Can\'t fight other players if you\'re not a player!"' });

        await message.reply({ embeds: [embed] });
        return;
    }

    const embed = new EmbedBuilder()
        .setColor(config.colors.combat)
        .setTitle('🏟️ PvP Arena')
        .setDescription('*The arena is being constructed! Soon you\'ll be able to test your skills against other players.*')
        .addFields(
            { name: '⚔️ Coming Soon', value: 'Player vs Player battles\nRanked matches\nArena rankings\nSpectator mode', inline: false },
            { name: '📊 Your Stats', value: `Level ${player.level}\n${player.health}/${player.maxHealth} HP`, inline: true },
            { name: '🏆 Future Rank', value: 'Unranked', inline: true }
        )
        .setFooter({ text: 'Plagg: "PvP? More like Player vs Plagg! I always win with cheese!"' });

    await message.reply({ embeds: [embed] });
}