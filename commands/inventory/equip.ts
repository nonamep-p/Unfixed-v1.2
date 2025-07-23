
import { Message, EmbedBuilder } from 'discord.js';
import { getPlayer } from '../../src/database';

export async function execute(message: Message, args: string[]) {
    try {
        const userId = message.author.id;
        const player = await getPlayer(userId);
        
        if (!player) {
            const embed = new EmbedBuilder()
                .setTitle('🧀 No Character Found')
                .setDescription('You need a character to equip items! Use `$startrpg` to create one.')
                .setColor('#FF6B6B')
                .setFooter({ text: 'No character, no equipment!' });
            
            return message.reply({ embeds: [embed] });
        }
        
        if (args.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle('⚔️ Equipment System')
                .setDescription('Specify an item to equip: `$equip <item name>`')
                .setColor('#0099CC')
                .addFields(
                    {
                        name: '🛡️ Current Equipment',
                        value: `**Weapon:** ${player.equipment.weapon?.name || 'None'}\n**Helmet:** ${player.equipment.helmet?.name || 'None'}\n**Chestplate:** ${player.equipment.chestplate?.name || 'None'}\n**Leggings:** ${player.equipment.leggings?.name || 'None'}\n**Boots:** ${player.equipment.boots?.name || 'None'}`,
                        inline: true
                    },
                    {
                        name: '🎒 Equippable Items',
                        value: player.inventory.filter(item => ['Weapon', 'Helmet', 'Chestplate', 'Leggings', 'Boots'].includes(item.type)).length > 0 ?
                            player.inventory.filter(item => ['Weapon', 'Helmet', 'Chestplate', 'Leggings', 'Boots'].includes(item.type))
                                .slice(0, 5).map(item => `• ${item.name}`).join('\n') :
                            'No equippable items in inventory',
                        inline: true
                    }
                )
                .setFooter({ text: 'Equipment system coming soon!' });
            
            return message.reply({ embeds: [embed] });
        }
        
        // Coming soon for actual equipping
        const embed = new EmbedBuilder()
            .setTitle('🔜 Equipment System')
            .setDescription('The equipment system is being forged by my finest smiths! Coming soon.')
            .setColor('#0099CC')
            .addFields({
                name: '⚡ Planned Features',
                value: '• Automatic equipment swapping\n• Stat comparisons\n• Equipment enhancement\n• Set bonuses\n• Quick equip buttons',
                inline: false
            })
            .setFooter({ text: 'Plagg believes in proper gear management' });
        
        await message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error in equip command:', error);
        const errorEmbed = new EmbedBuilder()
            .setTitle('🧀 Equipment Error!')
            .setDescription('Something went wrong with the equipment system. Even my gear has glitches.')
            .setColor('#FF6B6B');
        
        message.reply({ embeds: [errorEmbed] }).catch(console.error);
    }
}
