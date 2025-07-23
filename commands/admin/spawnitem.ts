import { Message, EmbedBuilder } from 'discord.js';
import { getPlayer, updatePlayer } from '../../src/database';
import { getItem, ITEMS } from '../../src/items';
import { OWNER_ID } from '../../index';

export async function execute(message: Message, args: string[]) {
    // Owner check - must be first line
    if (message.author.id !== OWNER_ID) return;
    
    if (args.length === 0) {
        // Show available items
        const embed = new EmbedBuilder()
            .setTitle('🧀 Spawnitem Command')
            .setDescription('**Usage:** `$spawnitem <item_id> [quantity]`\n\n**Available Item IDs:**')
            .setColor('#FFD700');
        
        // Group items by type
        const itemsByType: { [key: string]: string[] } = {};
        
        Object.values(ITEMS).forEach(item => {
            if (!itemsByType[item.type]) {
                itemsByType[item.type] = [];
            }
            itemsByType[item.type].push(`\`${item.id}\` - ${item.name}`);
        });
        
        Object.entries(itemsByType).forEach(([type, items]) => {
            embed.addFields({
                name: `${type}s`,
                value: items.slice(0, 10).join('\n') + (items.length > 10 ? `\n... and ${items.length - 10} more` : ''),
                inline: false
            });
        });
        
        embed.setFooter({ text: 'Owner-only command | Spawn any item directly to your inventory' });
        
        return message.reply({ embeds: [embed] });
    }
    
    const itemId = args[0].toLowerCase();
    const quantity = parseInt(args[1]) || 1;
    
    if (quantity <= 0 || quantity > 100) {
        return message.reply('🧀 Quantity must be between 1 and 100!');
    }
    
    // Get the item
    const baseItem = getItem(itemId);
    if (!baseItem) {
        return message.reply(`🧀 Item \`${itemId}\` not found! Use \`$spawnitem\` without arguments to see available items.`);
    }
    
    // Get owner's player data
    const player = await getPlayer(message.author.id);
    if (!player) {
        return message.reply('🧀 You don\'t have a character! Create one with `$startrpg` first.');
    }
    
    // Add items to inventory
    for (let i = 0; i < quantity; i++) {
        // Create a copy of the item to avoid reference issues
        const itemCopy = JSON.parse(JSON.stringify(baseItem));
        player.inventory.push(itemCopy);
    }
    
    // Save updated player
    const success = await updatePlayer(message.author.id, player);
    
    if (!success) {
        return message.reply('🧀 Failed to spawn items. Even divine cheese powers have limits!');
    }
    
    // Create success embed
    const embed = new EmbedBuilder()
        .setTitle('✨ Items Spawned!')
        .setDescription(`Successfully spawned **${quantity}x ${baseItem.name}** to your inventory!`)
        .setColor('#00FF00')
        .addFields(
            {
                name: '📦 Item Details',
                value: `**Name:** ${baseItem.name}\n**Type:** ${baseItem.type}\n**Rarity:** ${baseItem.rarity}\n**Description:** ${baseItem.description}`,
                inline: false
            }
        );
    
    // Add stats if present
    if (baseItem.stats) {
        const statsText = Object.entries(baseItem.stats)
            .filter(([_, value]) => value && value > 0)
            .map(([stat, value]) => `**${stat.charAt(0).toUpperCase() + stat.slice(1)}:** +${value}`)
            .join('\n');
        
        if (statsText) {
            embed.addFields({
                name: '📊 Stats',
                value: statsText,
                inline: true
            });
        }
    }
    
    // Add effects if present
    if (baseItem.effect) {
        let effectText = '';
        if (baseItem.effect.healAmount) effectText += `**Healing:** ${baseItem.effect.healAmount} HP\n`;
        if (baseItem.effect.manaAmount) effectText += `**Mana Restore:** ${baseItem.effect.manaAmount} MP\n`;
        if (baseItem.effect.duration) effectText += `**Duration:** ${baseItem.effect.duration} turns\n`;
        
        if (effectText) {
            embed.addFields({
                name: '✨ Effects',
                value: effectText.trim(),
                inline: true
            });
        }
    }
    
    embed.addFields({
        name: '🧀 Plagg\'s Commentary',
        value: `*"${baseItem.plaggCommentary}"*`,
        inline: false
    });
    
    embed.setFooter({ 
        text: `Total inventory items: ${player.inventory.length} | Use $inventory to view` 
    });
    
    await message.reply({ embeds: [embed] });
}
