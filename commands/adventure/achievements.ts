
import { Message, EmbedBuilder } from 'discord.js';
import { getPlayer } from '../../src/database';

export async function execute(message: Message, args: string[]) {
    try {
        const userId = message.author.id;
        const player = await getPlayer(userId);
        
        if (!player) {
            const embed = new EmbedBuilder()
                .setTitle('🧀 No Character Found')
                .setDescription('You need a character to view achievements! Use `$startrpg` to create one.')
                .setColor('#FF6B6B')
                .setFooter({ text: 'Achievements await your creation!' });
            
            return message.reply({ embeds: [embed] });
        }
        
        const embed = new EmbedBuilder()
            .setTitle(`🏆 ${message.author.username}'s Achievements`)
            .setDescription(`You've unlocked ${player.achievements.length} achievements!`)
            .setColor('#FFD700')
            .addFields(
                {
                    name: '📊 Progress Overview',
                    value: `**Battles Won:** ${player.totalVictories}\n**Monsters Killed:** ${player.monstersKilled}\n**Current Level:** ${player.level}\n**Titles Earned:** ${player.titles.length}`,
                    inline: true
                },
                {
                    name: '🎖️ Achievement Categories',
                    value: '• Combat Achievements\n• Exploration Achievements\n• Collection Achievements\n• Special Achievements\n• Hidden Achievements',
                    inline: true
                }
            );
        
        if (player.achievements.length > 0) {
            embed.addFields({
                name: '🌟 Unlocked Achievements',
                value: player.achievements.slice(0, 10).join('\n') || 'None yet',
                inline: false
            });
        } else {
            embed.addFields({
                name: '💡 Get Started',
                value: 'Win your first battle, reach level 5, or collect 10 items to unlock your first achievements!',
                inline: false
            });
        }
        
        embed.setFooter({ text: 'Complete more challenges to unlock achievements!' });
        
        await message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error in achievements command:', error);
        const errorEmbed = new EmbedBuilder()
            .setTitle('🧀 Achievement Error!')
            .setDescription('Something went wrong loading your achievements. Even my record-keeping has off days.')
            .setColor('#FF6B6B');
        
        message.reply({ embeds: [errorEmbed] }).catch(console.error);
    }
}
