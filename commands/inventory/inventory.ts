import { Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle, ButtonInteraction, StringSelectMenuInteraction } from 'discord.js';
import { getPlayer, updatePlayer } from '../../src/database';
import { Player, Item } from '../../src/types';
import { canEquipItem, getEquipmentSlot, formatNumber } from '../../src/utils';
import { getItemColor, getItemEmoji, getItem } from '../../src/items';

const ITEMS_PER_PAGE = 5;

export async function execute(message: Message, args: string[]) {
    const userId = message.author.id;
    
    const player = await getPlayer(userId);
    if (!player) {
        const embed = new EmbedBuilder()
            .setTitle('🧀 No Character Found')
            .setDescription('You don\'t have a character yet! Use `$startrpg` to create one and start hoarding items with me!')
            .setColor('#FF6B6B')
            .setFooter({ text: 'Plagg\'s stash is empty because you don\'t exist' });
        
        return message.reply({ embeds: [embed] });
    }
    
    await displayInventory(message, player);
}

async function displayInventory(message: Message, player: Player, page: number = 0, filter: string = 'All') {
    // Filter items based on type
    let filteredItems = player.inventory;
    if (filter !== 'All') {
        filteredItems = player.inventory.filter(item => item.type === filter);
    }
    
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
    const currentPage = Math.max(0, Math.min(page, totalPages - 1));
    
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentItems = filteredItems.slice(startIndex, endIndex);
    
    // Create main embed
    const embed = new EmbedBuilder()
        .setTitle(`🎒 Plagg's Stash (Page ${currentPage + 1}/${totalPages})`)
        .setDescription(filteredItems.length === 0 
            ? `Your ${filter === 'All' ? '' : filter.toLowerCase() + ' '}inventory is emptier than my patience. Go find some items!`
            : `**Filter:** ${filter} | **Total Items:** ${filteredItems.length}`
        )
        .setColor('#8B4513')
        .setThumbnail('https://cdn.discordapp.com/emojis/placeholder.png'); // Placeholder for inventory icon
    
    // Add items to embed
    if (currentItems.length > 0) {
        currentItems.forEach((item, index) => {
            const globalIndex = startIndex + index;
            const emoji = getItemEmoji(item.rarity);
            
            let itemValue = `${emoji} **${item.name}**\n*${item.description}*\n`;
            
            // Add stats if present
            if (item.stats) {
                const stats = Object.entries(item.stats)
                    .filter(([_, value]) => value && value > 0)
                    .map(([stat, value]) => `${stat}: +${value}`)
                    .join(', ');
                if (stats) itemValue += `**Stats:** ${stats}\n`;
            }
            
            // Add effect if present
            if (item.effect) {
                if (item.effect.healAmount) itemValue += `**Heals:** ${item.effect.healAmount} HP\n`;
                if (item.effect.manaAmount) itemValue += `**Restores:** ${item.effect.manaAmount} MP\n`;
            }
            
            itemValue += `**Value:** ${item.sellPrice} gold\n`;
            itemValue += `*"${item.plaggCommentary}"*`;
            
            embed.addFields({
                name: `${globalIndex + 1}. ${item.name}`,
                value: itemValue,
                inline: false
            });
        });
    }
    
    if (filteredItems.length === 0) {
        embed.setFooter({ text: 'Go on adventures to find items! Or buy some cheese... I mean, equipment.' });
    } else {
        const plaggComments = [
            "Not bad for a human's collection.",
            "I've seen better organized cheese wheels.",
            "At least it's something. Barely.",
            "Your hoard grows! Still not as good as my cheese stash.",
            "These items could use more cheese flavoring.",
            "A decent collection of non-cheese items, I suppose."
        ];
        embed.setFooter({ 
            text: plaggComments[Math.floor(Math.random() * plaggComments.length)]
        });
    }
    
    // Create filter dropdown
    const filterDropdown = new StringSelectMenuBuilder()
        .setCustomId('inventory_filter')
        .setPlaceholder('Filter by item type')
        .addOptions([
            { label: 'All Items', value: 'All', emoji: '📦', default: filter === 'All' },
            { label: 'Weapons', value: 'Weapon', emoji: '⚔️', default: filter === 'Weapon' },
            { label: 'Armor', value: 'Armor', emoji: '🛡️', default: ['Helmet', 'Chestplate', 'Leggings', 'Boots'].includes(filter) },
            { label: 'Consumables', value: 'Consumable', emoji: '🧪', default: filter === 'Consumable' },
            { label: 'Materials', value: 'Material', emoji: '🔧', default: filter === 'Material' },
            { label: 'Artifacts', value: 'Artifact', emoji: '✨', default: filter === 'Artifact' }
        ]);
    
    // Create navigation buttons
    const navButtons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`inventory_page_0_${filter}`)
                .setLabel('⏮️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === 0),
            new ButtonBuilder()
                .setCustomId(`inventory_page_${Math.max(0, currentPage - 1)}_${filter}`)
                .setLabel('◀️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === 0),
            new ButtonBuilder()
                .setCustomId(`inventory_page_${Math.min(totalPages - 1, currentPage + 1)}_${filter}`)
                .setLabel('▶️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === totalPages - 1),
            new ButtonBuilder()
                .setCustomId(`inventory_page_${totalPages - 1}_${filter}`)
                .setLabel('⏭️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === totalPages - 1)
        );
    
    // Create item selection dropdown if there are items
    const components = [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(filterDropdown), navButtons];
    
    if (currentItems.length > 0) {
        const itemDropdown = new StringSelectMenuBuilder()
            .setCustomId('inventory_item_select')
            .setPlaceholder('Select an item to inspect')
            .addOptions(
                currentItems.map((item, index) => ({
                    label: item.name,
                    description: item.rarity + (item.type ? ` ${item.type}` : ''),
                    value: (startIndex + index).toString(),
                    emoji: getItemEmoji(item.rarity)
                }))
            );
        
        components.splice(1, 0, new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(itemDropdown));
    }
    
    await message.reply({
        embeds: [embed],
        components: components
    });
}

export async function handleButton(interaction: ButtonInteraction, action: string, params: string[]) {
    if (action === 'page') {
        const page = parseInt(params[0]);
        const filter = params[1] || 'All';
        
        const userId = interaction.user.id;
        const player = await getPlayer(userId);
        
        if (!player) {
            return interaction.reply({
                content: '🧀 Player not found!',
                ephemeral: true
            });
        }
        
        // Update the message with new page
        await updateInventoryDisplay(interaction, player, page, filter);
    } else if (action === 'equip') {
        await handleEquipItem(interaction, parseInt(params[0]));
    } else if (action === 'use') {
        await handleUseItem(interaction, parseInt(params[0]));
    } else if (action === 'sell') {
        await handleSellItem(interaction, parseInt(params[0]));
    } else if (action === 'confirm' && params[0] === 'equip') {
        await handleConfirmEquip(interaction, parseInt(params[1]), params[2]);
    } else if (action === 'cancel') {
        await handleCancelAction(interaction);
    }
}

export async function handleSelectMenu(interaction: StringSelectMenuInteraction, action: string, params: string[]) {
    const userId = interaction.user.id;
    const player = await getPlayer(userId);
    
    if (!player) {
        return interaction.reply({
            content: '🧀 Player not found!',
            ephemeral: true
        });
    }
    
    if (action === 'filter') {
        let filter = interaction.values[0];
        if (filter === 'Armor') {
            filter = 'All'; // Handle armor filter differently
        }
        
        await updateInventoryDisplay(interaction, player, 0, filter);
    } else if (action === 'item' && params[0] === 'select') {
        const itemIndex = parseInt(interaction.values[0]);
        await displayItemDetails(interaction, player, itemIndex);
    }
}

async function updateInventoryDisplay(interaction: ButtonInteraction | StringSelectMenuInteraction, player: Player, page: number, filter: string) {
    // Filter items based on type
    let filteredItems = player.inventory;
    if (filter === 'Armor') {
        filteredItems = player.inventory.filter(item => ['Helmet', 'Chestplate', 'Leggings', 'Boots'].includes(item.type));
    } else if (filter !== 'All') {
        filteredItems = player.inventory.filter(item => item.type === filter);
    }
    
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
    const currentPage = Math.max(0, Math.min(page, totalPages - 1));
    
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentItems = filteredItems.slice(startIndex, endIndex);
    
    // Create updated embed
    const embed = new EmbedBuilder()
        .setTitle(`🎒 Plagg's Stash (Page ${currentPage + 1}/${totalPages})`)
        .setDescription(filteredItems.length === 0 
            ? `Your ${filter === 'All' ? '' : filter.toLowerCase() + ' '}inventory is emptier than my patience. Go find some items!`
            : `**Filter:** ${filter} | **Total Items:** ${filteredItems.length}`
        )
        .setColor('#8B4513');
    
    // Add items to embed
    if (currentItems.length > 0) {
        currentItems.forEach((item, index) => {
            const globalIndex = startIndex + index;
            const emoji = getItemEmoji(item.rarity);
            
            let itemValue = `${emoji} **${item.name}**\n*${item.description}*\n`;
            
            if (item.stats) {
                const stats = Object.entries(item.stats)
                    .filter(([_, value]) => value && value > 0)
                    .map(([stat, value]) => `${stat}: +${value}`)
                    .join(', ');
                if (stats) itemValue += `**Stats:** ${stats}\n`;
            }
            
            if (item.effect) {
                if (item.effect.healAmount) itemValue += `**Heals:** ${item.effect.healAmount} HP\n`;
                if (item.effect.manaAmount) itemValue += `**Restores:** ${item.effect.manaAmount} MP\n`;
            }
            
            itemValue += `**Value:** ${item.sellPrice} gold\n`;
            itemValue += `*"${item.plaggCommentary}"*`;
            
            embed.addFields({
                name: `${globalIndex + 1}. ${item.name}`,
                value: itemValue,
                inline: false
            });
        });
    }
    
    // Update components (same as before)
    const filterDropdown = new StringSelectMenuBuilder()
        .setCustomId('inventory_filter')
        .setPlaceholder('Filter by item type')
        .addOptions([
            { label: 'All Items', value: 'All', emoji: '📦', default: filter === 'All' },
            { label: 'Weapons', value: 'Weapon', emoji: '⚔️', default: filter === 'Weapon' },
            { label: 'Armor', value: 'Armor', emoji: '🛡️', default: ['Helmet', 'Chestplate', 'Leggings', 'Boots'].includes(filter) },
            { label: 'Consumables', value: 'Consumable', emoji: '🧪', default: filter === 'Consumable' },
            { label: 'Materials', value: 'Material', emoji: '🔧', default: filter === 'Material' },
            { label: 'Artifacts', value: 'Artifact', emoji: '✨', default: filter === 'Artifact' }
        ]);
    
    const navButtons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`inventory_page_0_${filter}`)
                .setLabel('⏮️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === 0),
            new ButtonBuilder()
                .setCustomId(`inventory_page_${Math.max(0, currentPage - 1)}_${filter}`)
                .setLabel('◀️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === 0),
            new ButtonBuilder()
                .setCustomId(`inventory_page_${Math.min(totalPages - 1, currentPage + 1)}_${filter}`)
                .setLabel('▶️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === totalPages - 1),
            new ButtonBuilder()
                .setCustomId(`inventory_page_${totalPages - 1}_${filter}`)
                .setLabel('⏭️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === totalPages - 1)
        );
    
    const components = [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(filterDropdown), navButtons];
    
    if (currentItems.length > 0) {
        const itemDropdown = new StringSelectMenuBuilder()
            .setCustomId('inventory_item_select')
            .setPlaceholder('Select an item to inspect')
            .addOptions(
                currentItems.map((item, index) => ({
                    label: item.name,
                    description: item.rarity + (item.type ? ` ${item.type}` : ''),
                    value: (startIndex + index).toString(),
                    emoji: getItemEmoji(item.rarity)
                }))
            );
        
        components.splice(1, 0, new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(itemDropdown));
    }
    
    await interaction.update({
        embeds: [embed],
        components: components
    });
}

async function displayItemDetails(interaction: StringSelectMenuInteraction, player: Player, itemIndex: number) {
    if (itemIndex < 0 || itemIndex >= player.inventory.length) {
        return interaction.reply({
            content: '🧀 Invalid item selection!',
            ephemeral: true
        });
    }
    
    const item = player.inventory[itemIndex];
    const emoji = getItemEmoji(item.rarity);
    
    // Create detailed item embed
    const embed = new EmbedBuilder()
        .setTitle(`${emoji} ${item.name}`)
        .setDescription(`**${item.rarity} ${item.type}**\n\n${item.description}`)
        .setColor(getItemColor(item.rarity));
    
    // Add stats
    if (item.stats) {
        const statsText = Object.entries(item.stats)
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
    
    // Add effects
    if (item.effect) {
        let effectText = '';
        if (item.effect.healAmount) effectText += `**Healing:** ${item.effect.healAmount} HP\n`;
        if (item.effect.manaAmount) effectText += `**Mana Restore:** ${item.effect.manaAmount} MP\n`;
        if (item.effect.duration) effectText += `**Duration:** ${item.effect.duration} turns\n`;
        
        if (effectText) {
            embed.addFields({
                name: '✨ Effects',
                value: effectText.trim(),
                inline: true
            });
        }
    }
    
    // Add value info
    embed.addFields({
        name: '💰 Value',
        value: `**Sell Price:** ${formatNumber(item.sellPrice)} gold${item.buyPrice ? `\n**Buy Price:** ${formatNumber(item.buyPrice)} gold` : ''}`,
        inline: true
    });
    
    // Add level requirement
    if (item.level) {
        embed.addFields({
            name: '📏 Requirements',
            value: `**Level:** ${item.level}`,
            inline: true
        });
    }
    
    // Add Plagg's commentary
    embed.addFields({
        name: '🧀 Plagg\'s Opinion',
        value: `*"${item.plaggCommentary}"*`,
        inline: false
    });
    
    // Create action buttons
    const actionButtons = new ActionRowBuilder<ButtonBuilder>();
    
    // Equip button for equipment
    if (['Weapon', 'Helmet', 'Chestplate', 'Leggings', 'Boots'].includes(item.type)) {
        const equipCheck = canEquipItem(player, item);
        actionButtons.addComponents(
            new ButtonBuilder()
                .setCustomId(`inventory_equip_${itemIndex}`)
                .setLabel('⚔️ Equip')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(!equipCheck.canEquip)
        );
    }
    
    // Use button for consumables
    if (item.type === 'Consumable') {
        actionButtons.addComponents(
            new ButtonBuilder()
                .setCustomId(`inventory_use_${itemIndex}`)
                .setLabel('🍷 Use')
                .setStyle(ButtonStyle.Success)
        );
    }
    
    // Sell button
    actionButtons.addComponents(
        new ButtonBuilder()
            .setCustomId(`inventory_sell_${itemIndex}`)
            .setLabel(`💰 Sell (${item.sellPrice}g)`)
            .setStyle(ButtonStyle.Secondary)
    );
    
    // Back button
    actionButtons.addComponents(
        new ButtonBuilder()
            .setCustomId('inventory_back')
            .setLabel('🔙 Back')
            .setStyle(ButtonStyle.Secondary)
    );
    
    await interaction.reply({
        embeds: [embed],
        components: [actionButtons],
        ephemeral: true
    });
}

async function handleEquipItem(interaction: ButtonInteraction, itemIndex: number) {
    const userId = interaction.user.id;
    const player = await getPlayer(userId);
    
    if (!player || itemIndex < 0 || itemIndex >= player.inventory.length) {
        return interaction.reply({
            content: '🧀 Invalid item or player not found!',
            ephemeral: true
        });
    }
    
    const item = player.inventory[itemIndex];
    const equipCheck = canEquipItem(player, item);
    
    if (!equipCheck.canEquip) {
        return interaction.reply({
            content: `🧀 ${equipCheck.reason}`,
            ephemeral: true
        });
    }
    
    const slot = getEquipmentSlot(item.type);
    const currentItem = player.equipment[slot];
    
    // Show comparison if there's a current item
    if (currentItem) {
        const embed = new EmbedBuilder()
            .setTitle('⚔️ Equipment Comparison')
            .setDescription(`Compare your current ${slot} with the new item:`)
            .setColor('#FFD700');
        
        // Current item stats
        let currentStats = 'None';
        if (currentItem.stats) {
            currentStats = Object.entries(currentItem.stats)
                .filter(([_, value]) => value && value > 0)
                .map(([stat, value]) => `${stat}: +${value}`)
                .join('\n');
        }
        
        // New item stats
        let newStats = 'None';
        if (item.stats) {
            newStats = Object.entries(item.stats)
                .filter(([_, value]) => value && value > 0)
                .map(([stat, value]) => `${stat}: +${value}`)
                .join('\n');
        }
        
        embed.addFields(
            {
                name: `${getItemEmoji(currentItem.rarity)} Current: ${currentItem.name}`,
                value: `**Rarity:** ${currentItem.rarity}\n**Stats:**\n${currentStats}`,
                inline: true
            },
            {
                name: `${getItemEmoji(item.rarity)} New: ${item.name}`,
                value: `**Rarity:** ${item.rarity}\n**Stats:**\n${newStats}`,
                inline: true
            }
        );
        
        const confirmButtons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`inventory_confirm_equip_${itemIndex}_${slot}`)
                    .setLabel('✅ Confirm Equip')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('inventory_cancel')
                    .setLabel('❌ Cancel')
                    .setStyle(ButtonStyle.Secondary)
            );
        
        await interaction.reply({
            embeds: [embed],
            components: [confirmButtons],
            ephemeral: true
        });
    } else {
        // No current item, equip directly
        await equipItemDirectly(interaction, player, itemIndex, slot);
    }
}

async function handleConfirmEquip(interaction: ButtonInteraction, itemIndex: number, slot: string) {
    const userId = interaction.user.id;
    const player = await getPlayer(userId);
    
    if (!player) {
        return interaction.reply({
            content: '🧀 Player not found!',
            ephemeral: true
        });
    }
    
    await equipItemDirectly(interaction, player, itemIndex, slot as keyof typeof player.equipment);
}

async function equipItemDirectly(interaction: ButtonInteraction, player: Player, itemIndex: number, slot: keyof typeof player.equipment) {
    const userId = interaction.user.id;
    const item = player.inventory[itemIndex];
    const currentItem = player.equipment[slot];
    
    // Move current item back to inventory if exists
    if (currentItem) {
        player.inventory.push(currentItem);
    }
    
    // Equip new item
    player.equipment[slot] = item;
    player.inventory.splice(itemIndex, 1);
    
    // Save player
    const success = await updatePlayer(userId, player);
    
    if (!success) {
        return interaction.reply({
            content: '🧀 Failed to equip item. Even my powers have limits!',
            ephemeral: true
        });
    }
    
    const embed = new EmbedBuilder()
        .setTitle('⚔️ Item Equipped!')
        .setDescription(`${getItemEmoji(item.rarity)} **${item.name}** has been equipped!${currentItem ? `\n\nYour previous ${slot} (${currentItem.name}) has been moved to your inventory.` : ''}`)
        .setColor('#00FF00')
        .setFooter({ text: 'Looking good! Well, better than before at least.' });
    
    await interaction.update({
        embeds: [embed],
        components: []
    });
}

async function handleUseItem(interaction: ButtonInteraction, itemIndex: number) {
    const userId = interaction.user.id;
    const player = await getPlayer(userId);
    
    if (!player || itemIndex < 0 || itemIndex >= player.inventory.length) {
        return interaction.reply({
            content: '🧀 Invalid item or player not found!',
            ephemeral: true
        });
    }
    
    const item = player.inventory[itemIndex];
    
    if (item.type !== 'Consumable' || !item.effect) {
        return interaction.reply({
            content: '🧀 This item cannot be used!',
            ephemeral: true
        });
    }
    
    let effectText = '';
    let used = false;
    
    // Apply healing
    if (item.effect.healAmount && player.currentHealth < player.maxHealth) {
        const healAmount = Math.min(item.effect.healAmount, player.maxHealth - player.currentHealth);
        player.currentHealth += healAmount;
        effectText += `Restored ${healAmount} HP! `;
        used = true;
    }
    
    // Apply mana restoration
    if (item.effect.manaAmount && player.currentMana < player.maxMana) {
        const manaAmount = Math.min(item.effect.manaAmount, player.maxMana - player.currentMana);
        player.currentMana += manaAmount;
        effectText += `Restored ${manaAmount} MP! `;
        used = true;
    }
    
    if (!used) {
        return interaction.reply({
            content: '🧀 You don\'t need to use that right now! (Health and mana are full)',
            ephemeral: true
        });
    }
    
    // Remove item from inventory
    player.inventory.splice(itemIndex, 1);
    
    // Save player
    const success = await updatePlayer(userId, player);
    
    if (!success) {
        return interaction.reply({
            content: '🧀 Failed to use item. The universe conspires against us!',
            ephemeral: true
        });
    }
    
    const embed = new EmbedBuilder()
        .setTitle('🍷 Item Used!')
        .setDescription(`${getItemEmoji(item.rarity)} **${item.name}** consumed!\n\n${effectText}`)
        .setColor('#00FF00')
        .setFooter({ text: 'Tastes better than expired cheese... probably.' });
    
    await interaction.update({
        embeds: [embed],
        components: []
    });
}

async function handleSellItem(interaction: ButtonInteraction, itemIndex: number) {
    const userId = interaction.user.id;
    const player = await getPlayer(userId);
    
    if (!player || itemIndex < 0 || itemIndex >= player.inventory.length) {
        return interaction.reply({
            content: '🧀 Invalid item or player not found!',
            ephemeral: true
        });
    }
    
    const item = player.inventory[itemIndex];
    const sellPrice = item.sellPrice;
    
    // Remove item and add gold
    player.inventory.splice(itemIndex, 1);
    player.gold += sellPrice;
    
    // Save player
    const success = await updatePlayer(userId, player);
    
    if (!success) {
        return interaction.reply({
            content: '🧀 Failed to sell item. Even merchants have standards!',
            ephemeral: true
        });
    }
    
    const embed = new EmbedBuilder()
        .setTitle('💰 Item Sold!')
        .setDescription(`${getItemEmoji(item.rarity)} **${item.name}** sold for ${formatNumber(sellPrice)} gold!\n\n*"${item.plaggCommentary}"*`)
        .setColor('#FFD700')
        .setFooter({ text: 'Cha-ching! Now you can afford some quality cheese!' });
    
    await interaction.update({
        embeds: [embed],
        components: []
    });
}

async function handleCancelAction(interaction: ButtonInteraction) {
    await interaction.update({
        content: '🧀 Action cancelled. Back to browsing your mediocre collection.',
        embeds: [],
        components: []
    });
}

export { handleButton, handleSelectMenu };
