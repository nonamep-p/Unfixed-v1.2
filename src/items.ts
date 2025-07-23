import { Item, RarityInfo } from './types';

// Rarity information
export const RARITY_INFO: { [key: string]: RarityInfo } = {
    'Common': {
        name: 'Common',
        color: 0x808080,
        emoji: '⚪',
        statMultiplier: 1.0,
        sellMultiplier: 1.0
    },
    'Uncommon': {
        name: 'Uncommon',
        color: 0x1eff00,
        emoji: '🟢',
        statMultiplier: 1.2,
        sellMultiplier: 1.3
    },
    'Rare': {
        name: 'Rare',
        color: 0x0099cc,
        emoji: '🔵',
        statMultiplier: 1.5,
        sellMultiplier: 1.7
    },
    'Epic': {
        name: 'Epic',
        color: 0xa335ee,
        emoji: '🟣',
        statMultiplier: 2.0,
        sellMultiplier: 2.5
    },
    'Legendary': {
        name: 'Legendary',
        color: 0xff8000,
        emoji: '🟠',
        statMultiplier: 3.0,
        sellMultiplier: 4.0
    },
    'Mythical': {
        name: 'Mythical',
        color: 0xff0040,
        emoji: '🔴',
        statMultiplier: 4.5,
        sellMultiplier: 6.0
    },
    'Divine': {
        name: 'Divine',
        color: 0xffd700,
        emoji: '⭐',
        statMultiplier: 7.0,
        sellMultiplier: 10.0
    },
    'Cosmic': {
        name: 'Cosmic',
        color: 0xff00ff,
        emoji: '🌟',
        statMultiplier: 10.0,
        sellMultiplier: 15.0
    }
};

// Base items database
export const ITEMS: { [key: string]: Item } = {
    // Weapons - Common
    'wooden_sword': {
        id: 'wooden_sword',
        name: 'Wooden Practice Sword',
        type: 'Weapon',
        rarity: 'Common',
        description: 'A basic wooden sword used for training.',
        plaggCommentary: 'Wow, a stick. I\'ve seen more threatening cheese knives.',
        stats: { attack: 5, strength: 1 },
        sellPrice: 10,
        buyPrice: 25,
        level: 1,
        element: 'Physical'
    },
    'iron_sword': {
        id: 'iron_sword',
        name: 'Iron Sword',
        type: 'Weapon',
        rarity: 'Uncommon',
        description: 'A sturdy iron blade with decent sharpness.',
        plaggCommentary: 'At least it\'s metal. Still looks duller than my wit though.',
        stats: { attack: 12, strength: 2 },
        sellPrice: 25,
        buyPrice: 60,
        level: 5,
        element: 'Physical'
    },
    'steel_blade': {
        id: 'steel_blade',
        name: 'Steel Blade',
        type: 'Weapon',
        rarity: 'Rare',
        description: 'A well-crafted steel sword with excellent balance.',
        plaggCommentary: 'Now we\'re talking! This could actually cut through more than butter.',
        stats: { attack: 25, strength: 4, critChance: 5 },
        sellPrice: 60,
        buyPrice: 150,
        level: 10,
        element: 'Physical'
    },
    'flame_sword': {
        id: 'flame_sword',
        name: 'Flamebrand Sword',
        type: 'Weapon',
        rarity: 'Epic',
        description: 'A magical blade wreathed in eternal flames.',
        plaggCommentary: 'Ooh, fire! Perfect for melting cheese... I mean, enemies.',
        stats: { attack: 45, strength: 8, critChance: 10, intelligence: 3 },
        sellPrice: 150,
        buyPrice: 400,
        level: 20,
        element: 'Fire'
    },

    // Armor - Helmets
    'leather_cap': {
        id: 'leather_cap',
        name: 'Leather Cap',
        type: 'Helmet',
        rarity: 'Common',
        description: 'A simple leather cap that offers minimal protection.',
        plaggCommentary: 'It\'s like a hat, but less stylish. At least it hides bad hair days.',
        stats: { defense: 2, health: 5 },
        sellPrice: 8,
        buyPrice: 20,
        level: 1,
        element: 'None'
    },
    'iron_helmet': {
        id: 'iron_helmet',
        name: 'Iron Helmet',
        type: 'Helmet',
        rarity: 'Uncommon',
        description: 'A sturdy iron helmet that protects the head.',
        plaggCommentary: 'Heavy, clunky, but it\'ll keep your brain from leaking out.',
        stats: { defense: 8, health: 15, vitality: 1 },
        sellPrice: 20,
        buyPrice: 50,
        level: 5,
        element: 'None'
    },

    // Armor - Chestplates
    'leather_vest': {
        id: 'leather_vest',
        name: 'Leather Vest',
        type: 'Chestplate',
        rarity: 'Common',
        description: 'A basic leather vest for minimal torso protection.',
        plaggCommentary: 'About as protective as tissue paper, but hey, it\'s something.',
        stats: { defense: 5, health: 10 },
        sellPrice: 15,
        buyPrice: 35,
        level: 1,
        element: 'None'
    },
    'chainmail': {
        id: 'chainmail',
        name: 'Chainmail Armor',
        type: 'Chestplate',
        rarity: 'Uncommon',
        description: 'Interlocked metal rings provide good protection.',
        plaggCommentary: 'Jingly jangly, but at least arrows won\'t pierce it. Probably.',
        stats: { defense: 15, health: 25, vitality: 2 },
        sellPrice: 35,
        buyPrice: 80,
        level: 5,
        element: 'None'
    },

    // Consumables
    'health_potion': {
        id: 'health_potion',
        name: 'Health Potion',
        type: 'Consumable',
        rarity: 'Common',
        description: 'A red potion that restores health.',
        plaggCommentary: 'Tastes terrible, but it\'ll patch you up. Not as good as cheese though.',
        effect: { healAmount: 50 },
        sellPrice: 15,
        buyPrice: 30,
        element: 'None'
    },
    'mana_potion': {
        id: 'mana_potion',
        name: 'Mana Potion',
        type: 'Consumable',
        rarity: 'Common',
        description: 'A blue potion that restores magical energy.',
        plaggCommentary: 'Fizzy and weird. Gives you that tingly magic feeling, I guess.',
        effect: { manaAmount: 30 },
        sellPrice: 12,
        buyPrice: 25,
        element: 'None'
    },
    'greater_health_potion': {
        id: 'greater_health_potion',
        name: 'Greater Health Potion',
        type: 'Consumable',
        rarity: 'Uncommon',
        description: 'A potent healing potion that restores significant health.',
        plaggCommentary: 'Much better than the cheap stuff. Still not cheese flavored though.',
        effect: { healAmount: 120 },
        sellPrice: 35,
        buyPrice: 70,
        element: 'None'
    },

    // Special/Admin Items
    'admin_blade': {
        id: 'admin_blade',
        name: 'Plagg\'s Cataclysmic Blade',
        type: 'Weapon',
        rarity: 'Cosmic',
        description: 'A blade infused with the power of destruction itself.',
        plaggCommentary: 'Now THIS is more like it! Finally, a weapon worthy of my destructive power!',
        stats: { attack: 999, strength: 50, critChance: 50, critDamage: 100 },
        sellPrice: 1,
        buyPrice: 999999,
        level: 1,
        element: 'Dark'
    },
    'god_armor': {
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
    },

    // Materials
    'iron_ore': {
        id: 'iron_ore',
        name: 'Iron Ore',
        type: 'Material',
        rarity: 'Common',
        description: 'Raw iron that can be refined into useful materials.',
        plaggCommentary: 'Rocks. Boring rocks. Can\'t even eat them.',
        sellPrice: 5,
        buyPrice: 12,
        element: 'None'
    },
    'leather_scraps': {
        id: 'leather_scraps',
        name: 'Leather Scraps',
        type: 'Material',
        rarity: 'Common',
        description: 'Pieces of leather suitable for crafting.',
        plaggCommentary: 'From some poor animal. At least it\'s not cheese wrapper.',
        sellPrice: 3,
        buyPrice: 8,
        element: 'None'
    }
};

// Function to get item by ID
export function getItem(itemId: string): Item | null {
    return ITEMS[itemId] || null;
}

// Function to get items by type
export function getItemsByType(type: string): Item[] {
    return Object.values(ITEMS).filter(item => item.type === type);
}

// Function to get items by rarity
export function getItemsByRarity(rarity: string): Item[] {
    return Object.values(ITEMS).filter(item => item.rarity === rarity);
}

// Function to get random item by rarity chance
export function getRandomItem(minLevel: number = 1, maxLevel: number = 50): Item {
    const availableItems = Object.values(ITEMS).filter(item => 
        (item.level || 1) >= minLevel && (item.level || 1) <= maxLevel
    );
    
    if (availableItems.length === 0) {
        return ITEMS.wooden_sword; // Fallback
    }
    
    // Rarity weights (lower = more common)
    const rarityWeights: { [key: string]: number } = {
        'Common': 50,
        'Uncommon': 25,
        'Rare': 15,
        'Epic': 7,
        'Legendary': 2.5,
        'Mythical': 0.4,
        'Divine': 0.09,
        'Cosmic': 0.01
    };
    
    const weightedItems: { item: Item; weight: number }[] = availableItems.map(item => ({
        item,
        weight: rarityWeights[item.rarity] || 1
    }));
    
    const totalWeight = weightedItems.reduce((sum, { weight }) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const { item, weight } of weightedItems) {
        random -= weight;
        if (random <= 0) {
            return item;
        }
    }
    
    return availableItems[0]; // Fallback
}

// Function to create item with random stats variation
export function createItemInstance(baseItem: Item, qualityBonus: number = 0): Item {
    const item = { ...baseItem };
    
    if (item.stats && qualityBonus > 0) {
        const bonusMultiplier = 1 + (qualityBonus / 100);
        item.stats = { ...item.stats };
        
        Object.keys(item.stats).forEach(stat => {
            if (typeof item.stats![stat as keyof typeof item.stats] === 'number') {
                (item.stats as any)[stat] = Math.floor(
                    (item.stats as any)[stat] * bonusMultiplier
                );
            }
        });
        
        // Update name to reflect quality
        if (qualityBonus >= 20) {
            item.name = `Superior ${item.name}`;
        } else if (qualityBonus >= 10) {
            item.name = `Fine ${item.name}`;
        }
    }
    
    return item;
}

// Function to get item display color based on rarity
export function getItemColor(rarity: string): number {
    return RARITY_INFO[rarity]?.color || 0x808080;
}

// Function to get item rarity emoji
export function getItemEmoji(rarity: string): string {
    return RARITY_INFO[rarity]?.emoji || '⚪';
}
