
import { Message, EmbedBuilder } from 'discord.js';
import { getPlayer } from '../../src/database/connection';

export const name = 'balance';
export const description = 'Check your current currencies and wealth';
export const aliases = ['bal', 'money', 'gold'];
export const cooldown = 3;

export async function execute(message: Message, args: string[]) {
    const player = await getPlayer(message.author.id);
    
    if (!player) {
        const embed = new EmbedBuilder()
            .setTitle('🧀 No Character Found')
            .setDescription('Create a character first with `$startrpg`!')
            .setColor('#FF6B6B');
        
        return message.reply({ embeds: [embed] });
    }
    
    const embed = new EmbedBuilder()
        .setTitle('💰 Your Wealth')
        .setColor('#FFD700')
        .addFields(
            { name: '🏆 Gold', value: `${player.gold.toLocaleString()}`, inline: true },
            { name: '⚔️ Gladiator Tokens', value: `${player.gladiatorTokens || 0}`, inline: true },
            { name: '✨ Miraculous Energy', value: `${player.miraculousEnergy || 40}`, inline: true }
        )
        .setDescription(`**Total Net Worth:** ${player.gold.toLocaleString()} gold`)
        .setFooter({ text: 'Plagg: "Not bad! But can you buy cheese with it?"' });
    
    await message.reply({ embeds: [embed] });
}
