
import { Message, EmbedBuilder } from 'discord.js';
import { getPlayer } from '../../src/database/connection';
import { calculateEffectiveStats } from '../../src/utils';

export const name = 'stats';
export const description = 'Quick overview of your character stats';
export const aliases = ['s'];
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
    
    const effectiveStats = calculateEffectiveStats(player);
    
    const embed = new EmbedBuilder()
        .setTitle(`📊 ${player.username}'s Stats`)
        .setColor('#9400D3')
        .addFields(
            { name: '⚔️ Combat', value: `ATK: ${effectiveStats.attack}\nDEF: ${effectiveStats.defense}`, inline: true },
            { name: '❤️ Health', value: `${player.currentHealth}/${effectiveStats.maxHealth}`, inline: true },
            { name: '💙 Mana', value: `${player.currentMana}/${effectiveStats.maxMana}`, inline: true },
            { name: '📈 Core Stats', value: `STR: ${effectiveStats.strength}\nINT: ${effectiveStats.intelligence}\nDEX: ${effectiveStats.dexterity}\nVIT: ${effectiveStats.vitality}`, inline: true },
            { name: '🏆 Progress', value: `Level: ${player.level}\nXP: ${player.xp}/${player.xpToNextLevel}`, inline: true },
            { name: '💰 Wealth', value: `Gold: ${player.gold.toLocaleString()}`, inline: true }
        )
        .setFooter({ text: 'Use $profile for detailed character information' });
    
    await message.reply({ embeds: [embed] });
}
