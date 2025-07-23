
import { Message, EmbedBuilder } from 'discord.js';
import { getPlayer } from '../../src/database';

export async function execute(message: Message, args: string[]) {
    try {
        const userId = message.author.id;
        const player = await getPlayer(userId);
        
        if (!player) {
            const embed = new EmbedBuilder()
                .setTitle('🧀 No Character Found')
                .setDescription('You need a character to sell items! Use `$startrpg` to create one.')
                .setColor('#FF6B6B')
                .setFooter({ text: 'No character, no transactions!' });
            
            return message.reply({ embeds: [embed] });
        }
        
        if (args.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle('💰 Item Selling')
                .setDescription('Specify an item to sell: `$sell <item name>`')
                .setColor('#FFD700')
                .addFields({
                    name: '📦 Your Inventory',
                    value: player.inventory.length > 0 ? 
                        player.inventory.slice(0, 10).map(item => `• ${item.name} (Qty: ${item.quantity || 1})`).join('\n') :
                        'Your inventory is empty!',
                    inline: false
                })
                .setFooter({ text: 'Selling system coming soon!' });
            
            return message.reply({ embeds: [embed] });
        }
        
        // Coming soon for actual selling
        const embed = new EmbedBuilder()
            .setTitle('🔜 Selling System')
            .setDescription('The item selling system is being perfected by my merchant minions! Coming soon.')
            .setColor('#FFD700')
            .addFields({
                name: '💡 Planned Features',
                value: '• Sell individual items\n• Bulk selling options\n• Price calculations\n• Market value fluctuations\n• Special item handling',
                inline: false
            })
            .setFooter({ text: 'Plagg approves of profitable ventures' });
        
        await message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error in sell command:', error);
        const errorEmbed = new EmbedBuilder()
            .setTitle('🧀 Selling Error!')
            .setDescription('Something went wrong with the selling system. Even commerce has bugs.')
            .setColor('#FF6B6B');
        
        message.reply({ embeds: [errorEmbed] }).catch(console.error);
    }
}
