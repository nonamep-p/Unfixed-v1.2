
import { Message, EmbedBuilder } from 'discord.js';
import { getPlayer } from '../../src/database';

export async function execute(message: Message, args: string[]) {
    try {
        const userId = message.author.id;
        const player = await getPlayer(userId);
        
        if (!player) {
            const embed = new EmbedBuilder()
                .setTitle('🧀 No Character Found')
                .setDescription('You need a character to use items! Use `$startrpg` to create one.')
                .setColor('#FF6B6B')
                .setFooter({ text: 'No character, no item usage!' });
            
            return message.reply({ embeds: [embed] });
        }
        
        if (args.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle('🧪 Item Usage')
                .setDescription('Specify an item to use: `$use <item name>`')
                .setColor('#00FF00')
                .addFields({
                    name: '💊 Usable Items',
                    value: player.inventory.filter(item => item.type === 'Consumable').length > 0 ?
                        player.inventory.filter(item => item.type === 'Consumable')
                            .slice(0, 10).map(item => `• ${item.name} (${item.quantity || 1})`).join('\n') :
                        'No consumable items in inventory',
                    inline: false
                })
                .setFooter({ text: 'Item usage system coming soon!' });
            
            return message.reply({ embeds: [embed] });
        }
        
        // Coming soon for actual item usage
        const embed = new EmbedBuilder()
            .setTitle('🔜 Item Usage System')
            .setDescription('The item usage system is being perfected by my alchemist minions! Coming soon.')
            .setColor('#00FF00')
            .addFields({
                name: '💡 Planned Features',
                value: '• Potion consumption\n• Buff applications\n• Healing effects\n• Mana restoration\n• Special item effects',
                inline: false
            })
            .setFooter({ text: 'Plagg approves of strategic item consumption' });
        
        await message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error in use command:', error);
        const errorEmbed = new EmbedBuilder()
            .setTitle('🧀 Usage Error!')
            .setDescription('Something went wrong with item usage. Even my potions have side effects.')
            .setColor('#FF6B6B');
        
        message.reply({ embeds: [errorEmbed] }).catch(console.error);
    }
}
