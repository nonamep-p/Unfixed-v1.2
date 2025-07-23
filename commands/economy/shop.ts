
import { Message, EmbedBuilder } from 'discord.js';
import { getPlayer } from '../../src/database';

export async function execute(message: Message, args: string[]) {
    try {
        const userId = message.author.id;
        const player = await getPlayer(userId);
        
        if (!player) {
            const embed = new EmbedBuilder()
                .setTitle('🧀 No Character Found')
                .setDescription('You need a character to visit the shop! Use `$startrpg` to create one.')
                .setColor('#FF6B6B')
                .setFooter({ text: 'The merchants are waiting for you!' });
            
            return message.reply({ embeds: [embed] });
        }
        
        const embed = new EmbedBuilder()
            .setTitle('🏪 Plagg\'s Cheese & Equipment Emporium')
            .setDescription('*Welcome to my shop! Everything here is guaranteed to be less disappointing than most human endeavors.*')
            .setColor('#FFD700')
            .addFields(
                {
                    name: '💰 Your Wallet',
                    value: `**Gold:** ${player.gold.toLocaleString()}\n**Gladiator Tokens:** ${player.gladiatorTokens}\n**Miraculous Energy:** ${player.miraculousEnergy}`,
                    inline: true
                },
                {
                    name: '🛍️ Shop Categories',
                    value: '• **Weapons** - Sharp and pointy things\n• **Armor** - Protection from poor life choices\n• **Consumables** - Healing potions and snacks\n• **Special Items** - Mysterious and expensive',
                    inline: true
                },
                {
                    name: '🔜 Coming Soon',
                    value: 'Interactive shop system with browsing, buying, and selling capabilities!',
                    inline: false
                }
            )
            .setFooter({ text: 'Shop system under construction by Plagg\'s finest minions' });
        
        await message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error in shop command:', error);
        const errorEmbed = new EmbedBuilder()
            .setTitle('🧀 Shop Closed!')
            .setDescription('Something went wrong with the shop. Even my business ventures have technical difficulties.')
            .setColor('#FF6B6B');
        
        message.reply({ embeds: [errorEmbed] }).catch(console.error);
    }
}
