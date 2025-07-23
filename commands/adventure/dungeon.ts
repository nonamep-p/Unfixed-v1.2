
import { Message, EmbedBuilder } from 'discord.js';
import { getPlayer } from '../../src/database';

export async function execute(message: Message, args: string[]) {
    try {
        const userId = message.author.id;
        const player = await getPlayer(userId);
        
        if (!player) {
            const embed = new EmbedBuilder()
                .setTitle('🧀 No Character Found')
                .setDescription('You need a character to explore dungeons! Use `$startrpg` to create one.')
                .setColor('#FF6B6B')
                .setFooter({ text: 'Plagg is waiting for you to get started!' });
            
            return message.reply({ embeds: [embed] });
        }
        
        // Coming soon embed
        const embed = new EmbedBuilder()
            .setTitle('🏰 Dungeon Exploration')
            .setDescription('The dungeons are being renovated by my minions! This feature is coming soon.')
            .setColor('#FFD700')
            .addFields({
                name: '🔨 What to Expect',
                value: '• Multi-floor challenges\n• Boss encounters\n• Treasure rooms\n• Team dungeons\n• Special rewards',
                inline: false
            })
            .setFooter({ text: 'Plagg is personally overseeing the construction' });
        
        await message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error in dungeon command:', error);
        const errorEmbed = new EmbedBuilder()
            .setTitle('🧀 Dungeon Collapsed!')
            .setDescription('Something went wrong accessing the dungeons. Even my construction projects have issues sometimes.')
            .setColor('#FF6B6B');
        
        message.reply({ embeds: [errorEmbed] }).catch(console.error);
    }
}
