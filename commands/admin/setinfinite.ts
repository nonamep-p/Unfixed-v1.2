import { Message, EmbedBuilder } from 'discord.js';
import { getPlayer, updatePlayer } from '../../src/database';
import { OWNER_ID } from '../../index';

export async function execute(message: Message, args: string[]) {
    // Owner check - must be first line
    if (message.author.id !== OWNER_ID) return;
    
    if (args.length < 2) {
        const embed = new EmbedBuilder()
            .setTitle('🧀 Setinfinite Command Usage')
            .setDescription('**Usage:** `$setinfinite @user <resource>`\n\n**Available Resources:**\n• `gold` - Set gold to 999,999,999\n• `xp` - Set XP to 999,999 (max level)\n• `level` - Set level to 50\n• `tokens` - Set gladiator tokens to 999,999\n• `energy` - Set miraculous energy to 999,999\n• `all` - Set everything to infinite')
            .setColor('#FFD700')
            .setFooter({ text: 'Owner-only command | Plagg\'s divine powers' });
        
        return message.reply({ embeds: [embed] });
    }
    
    // Parse target user
    const targetMention = args[0];
    const resource = args[1].toLowerCase();
    
    let targetUserId = '';
    if (targetMention.startsWith('<@') && targetMention.endsWith('>')) {
        targetUserId = targetMention.slice(2, -1);
        if (targetUserId.startsWith('!')) {
            targetUserId = targetUserId.slice(1);
        }
    } else {
        targetUserId = targetMention; // Assume it's a direct user ID
    }
    
    // Get target player
    const player = await getPlayer(targetUserId);
    if (!player) {
        return message.reply('🧀 Target player not found! They need to create a character first with `$startrpg`.');
    }
    
    // Apply infinite resources based on resource type
    let changesApplied = '';
    
    switch (resource) {
        case 'gold':
            player.gold = 999999999;
            changesApplied = 'Gold set to 999,999,999';
            break;
            
        case 'xp':
            player.xp = 999999;
            player.level = 50; // Max level
            player.statPointsAvailable = 999;
            changesApplied = 'XP set to 999,999 and level to 50';
            break;
            
        case 'level':
            player.level = 50;
            player.statPointsAvailable = 999;
            changesApplied = 'Level set to 50';
            break;
            
        case 'tokens':
            player.gladiatorTokens = 999999;
            changesApplied = 'Gladiator tokens set to 999,999';
            break;
            
        case 'energy':
            player.miraculousEnergy = 999999;
            changesApplied = 'Miraculous energy set to 999,999';
            break;
            
        case 'all':
            player.gold = 999999999;
            player.xp = 999999;
            player.level = 50;
            player.statPointsAvailable = 999;
            player.gladiatorTokens = 999999;
            player.miraculousEnergy = 999999;
            
            // Set all stats to 99
            player.stats.strength = 99;
            player.stats.intelligence = 99;
            player.stats.dexterity = 99;
            player.stats.vitality = 99;
            
            // Max out health and mana
            player.maxHealth = 99999;
            player.maxMana = 99999;
            player.currentHealth = 99999;
            player.currentMana = 99999;
            
            // Add special owner items if not already present
            const adminBlade = player.inventory.find(item => item.id === 'admin_blade');
            if (!adminBlade) {
                player.inventory.push({
                    id: 'admin_blade',
                    name: 'Plagg\'s Cataclysmic Blade',
                    type: 'Weapon',
                    rarity: 'Cosmic',
                    description: 'A blade infused with the power of destruction itself.',
                    plaggCommentary: 'NOW THIS is more like it! Finally, a weapon worthy of my destructive power!',
                    stats: { attack: 999, strength: 50, critChance: 50, critDamage: 100 },
                    sellPrice: 1,
                    buyPrice: 999999,
                    level: 1,
                    element: 'Dark'
                });
            }
            
            const godArmor = player.inventory.find(item => item.id === 'god_armor');
            if (!godArmor) {
                player.inventory.push({
                    id: 'god_armor',
                    name: 'Divine Protection Chestplate',
                    type: 'Chestplate',
                    rarity: 'Cosmic',
                    description: 'Armor blessed by the Kwamis themselves.',
                    plaggCommentary: 'Eh, it\'s alright. Could use more cheese motifs.',
                    stats: { defense: 500, health: 1000, vitality: 25 },
                    sellPrice: 1,
                    buyPrice: 999999,
                    level: 1,
                    element: 'Light'
                });
            }
            
            // Add owner badge to titles if not present
            if (!player.titles.includes('👑 Bot Owner')) {
                player.titles.push('👑 Bot Owner');
            }
            
            changesApplied = 'All resources set to infinite, stats maxed, and owner items granted';
            break;
            
        default:
            return message.reply('🧀 Invalid resource! Use: `gold`, `xp`, `level`, `tokens`, `energy`, or `all`');
    }
    
    // Save updated player
    const success = await updatePlayer(targetUserId, player);
    
    if (!success) {
        return message.reply('🧀 Failed to update player data. Even my divine powers have limits!');
    }
    
    // Get target user object for display
    let targetUser;
    try {
        targetUser = await message.client.users.fetch(targetUserId);
    } catch {
        targetUser = { username: 'Unknown User', id: targetUserId };
    }
    
    // Create success embed
    const embed = new EmbedBuilder()
        .setTitle('⚡ Divine Intervention Applied!')
        .setDescription(`**Target:** ${targetUser.username || 'Unknown User'}\n**Changes:** ${changesApplied}`)
        .setColor('#FFD700')
        .addFields({
            name: '📊 Current Status',
            value: `**Level:** ${player.level}\n**Gold:** ${player.gold.toLocaleString()}\n**XP:** ${player.xp.toLocaleString()}\n**Gladiator Tokens:** ${player.gladiatorTokens.toLocaleString()}\n**Miraculous Energy:** ${player.miraculousEnergy.toLocaleString()}`,
            inline: true
        });
    
    if (resource === 'all') {
        embed.addFields({
            name: '⚡ Owner Powers',
            value: `**All Stats:** 99\n**Health:** 99,999/99,999\n**Mana:** 99,999/99,999\n**Special Items:** Added\n**Owner Title:** Granted`,
            inline: true
        });
    }
    
    embed.setFooter({ text: 'Plagg approves of this divine intervention!' });
    
    await message.reply({ embeds: [embed] });
}
