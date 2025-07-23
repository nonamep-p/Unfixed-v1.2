import { Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction } from 'discord.js';
import { getPlayer, savePlayer } from '../../database/connection';
import { config } from '../../config';

export const name = 'auction';
export const aliases = ['ah', 'market'];
export const description = 'Access the auction house to buy and sell items';
export const cooldown = 5;

export async function execute(message: Message, args: string[]) {
    const player = await getPlayer(message.author.id);

    if (!player) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.warning)
            .setTitle('🧀 Not Registered')
            .setDescription('You need to start your adventure first! Use `$startrpg` to begin.')
            .setFooter({ text: 'Plagg: "How can you trade if you don\'t exist? Philosophy 101!"' });

        await message.reply({ embeds: [embed] });
        return;
    }

    const embed = new EmbedBuilder()
        .setColor(config.colors.gold)
        .setTitle('🏛️ Auction House')
        .setDescription('*The auction house is currently under construction! Check back soon for amazing deals and chaotic bidding wars.*')
        .addFields(
            { name: '🔨 Coming Soon', value: 'List items for auction\nBid on player items\nInstant buyouts\nAuction history', inline: false },
            { name: '💰 Current Gold', value: `${player.gold.toLocaleString()}`, inline: true }
        )
        .setFooter({ text: 'Plagg: "Patience! Even I can\'t snap auction houses into existence... yet."' });

    await message.reply({ embeds: [embed] });
}

export async function handleButton(interaction: ButtonInteraction, action: string, params: string[]) {
    const player = await getPlayer(interaction.user.id);
    if (!player) return;

    switch (action) {
        case 'browse':
            await showAuctionBrowse(interaction, player);
            break;
        case 'sell':
            await showSellInterface(interaction, player);
            break;
        case 'mybids':
            await showMyBids(interaction, player);
            break;
    }
}

async function showAuctionBrowse(interaction: ButtonInteraction, player: any) {
    const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle('🔍 Browse Auctions')
        .setDescription('*Current auctions available for bidding*')
        .addFields(
            {
                name: '⚔️ Legendary Demon Slayer',
                value: 'Current Bid: **500 gold**\nTime Left: 2h 30m\nSeller: Anonymous',
                inline: false
            },
            {
                name: '🛡️ Mystic Guardian Armor',
                value: 'Current Bid: **350 gold**\nTime Left: 1h 45m\nSeller: Anonymous',
                inline: false
            },
            {
                name: '💎 Rare Chaos Gem',
                value: 'Current Bid: **200 gold**\nTime Left: 4h 15m\nSeller: Anonymous',
                inline: false
            }
        )
        .setFooter({ text: 'Plagg: "These items look almost as valuable as my cheese collection!"' });

    await interaction.update({ embeds: [embed] });
}

async function showSellInterface(interaction: ButtonInteraction, player: any) {
    const embed = new EmbedBuilder()
        .setColor(config.colors.secondary)
        .setTitle('💸 Sell Your Items')
        .setDescription('*Put your items up for auction and earn gold!*')
        .addFields(
            {
                name: '📋 How to Sell',
                value: '1. Select an item from your inventory\n2. Set a starting bid price\n3. Choose auction duration\n4. List your item!',
                inline: false
            },
            {
                name: '💰 Your Sellable Items',
                value: player.inventory.length > 0 ? 
                    player.inventory.slice(0, 3).map((item: any) => `• ${item.name}`).join('\n') || 'No items to sell' :
                    'Your inventory is empty',
                inline: false
            },
            {
                name: '🏷️ Auction Fees',
                value: '5% commission on successful sales',
                inline: false
            }
        )
        .setFooter({ text: 'Plagg: "Turn your junk into treasure! Well, gold at least."' });

    await interaction.update({ embeds: [embed] });
}

async function showMyBids(interaction: ButtonInteraction, player: any) {
    const embed = new EmbedBuilder()
        .setColor(config.colors.warning)
        .setTitle('📋 My Active Bids')
        .setDescription('*Track your current auction participation*')
        .addFields(
            {
                name: '🎯 Current Bids',
                value: 'You have no active bids',
                inline: false
            },
            {
                name: '🏆 Won Auctions',
                value: 'No recent wins',
                inline: false
            },
            {
                name: '💸 Outbid Items',
                value: 'No recent outbids',
                inline: false
            }
        )
        .setFooter({ text: 'Plagg: "Empty bid history? Time to start some bidding wars!"' });

    await interaction.update({ embeds: [embed] });
}