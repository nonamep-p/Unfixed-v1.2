// Core interfaces for the Plagg Bot RPG system

export interface Item {
    id: string;
    name: string;
    type: 'Weapon' | 'Helmet' | 'Chestplate' | 'Leggings' | 'Boots' | 'Consumable' | 'Material' | 'Artifact';
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical' | 'Divine' | 'Cosmic';
    description: string;
    plaggCommentary: string;
    stats?: {
        attack?: number;
        defense?: number;
        health?: number;
        mana?: number;
        critChance?: number;
        critDamage?: number;
        strength?: number;
        intelligence?: number;
        dexterity?: number;
        vitality?: number;
    };
    effect?: {
        healAmount?: number;
        manaAmount?: number;
        duration?: number;
        type?: string;
    };
    sellPrice: number;
    buyPrice: number;
    level?: number;
    element?: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Light' | 'Dark' | 'Physical' | 'None';
}

export interface Skill {
    id: string;
    name: string;
    description: string;
    manaCost: number;
    damage: number;
    element: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Light' | 'Dark' | 'Physical' | 'None';
    cooldown: number;
    effects?: string[];
    requiredLevel: number;
    requiredClass?: PlayerClass[];
}

export type PlayerClass = 'Warrior' | 'Mage' | 'Rogue' | 'Archer' | 'Healer' | 'Battlemage' | 'Chrono Knight' | 'None';
export type MiraculousPath = 'Destruction' | 'Preservation' | 'Abundance' | 'The Hunt' | 'None';

export interface PlayerStats {
    strength: number;
    intelligence: number;
    dexterity: number;
    vitality: number;
}

export interface Equipment {
    weapon: Item | null;
    helmet: Item | null;
    chestplate: Item | null;
    leggings: Item | null;
    boots: Item | null;
}

export interface Player {
    // Basic Info
    level: number;
    xp: number;
    xpToNextLevel: number;
    gold: number;
    
    // Character
    playerClass: PlayerClass;
    miraculousPath: MiraculousPath;
    
    // Stats
    stats: PlayerStats;
    statPointsAvailable: number;
    
    // Combat Stats (derived)
    maxHealth: number;
    maxMana: number;
    maxStamina: number;
    currentHealth: number;
    currentMana: number;
    currentStamina: number;
    
    // Inventory & Equipment
    inventory: Item[];
    equipment: Equipment;
    
    // Currency & Tokens
    gladiatorTokens: number;
    miraculousEnergy: number;
    
    // Social
    faction: string;
    guildId?: string;
    
    // Achievements & Progression
    achievements: string[];
    titles: string[];
    currentTitle: string | null;
    
    // Combat
    skills: string[]; // Skill IDs
    techniques: string[]; // Technique IDs
    
    // Cooldowns
    lastBattle: number;
    lastHunt: number;
    lastDungeon: number;
    lastMiraculous: number;
    
    // Statistics
    totalBattles: number;
    totalVictories: number;
    totalDeaths: number;
    totalDamageDealt: number;
    totalDamageTaken: number;
    monstersKilled: number;
    bossesKilled: number;
    dungeonsCompleted: number;
    
    // Timestamps
    createdAt: number;
    lastActive: number;
    lastLogin: number;
}

export interface Monster {
    id: string;
    name: string;
    level: number;
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
    element: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Light' | 'Dark' | 'Physical' | 'None';
    weakness: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Light' | 'Dark' | 'Physical' | 'None';
    skills: string[];
    xpReward: number;
    goldReward: number;
    dropTable: DropTableEntry[];
    description: string;
    breakBar: number;
    maxBreakBar: number;
    stunned: boolean;
    type: 'Common' | 'Elite' | 'Rare' | 'Boss' | 'Legendary';
}

export interface DropTableEntry {
    itemId: string;
    chance: number; // 0-100
    minQuantity: number;
    maxQuantity: number;
}

export interface CombatSession {
    playerId: string;
    monster: Monster;
    playerTurn: boolean;
    turnCount: number;
    messageId: string;
    channelId: string;
    startTime: number;
    playerBuffs: CombatEffect[];
    playerDebuffs: CombatEffect[];
    monsterBuffs: CombatEffect[];
    monsterDebuffs: CombatEffect[];
    combatLog: string[];
    lastPlayerAction: string;
    actionHistory: string[];
}

export interface CombatEffect {
    id: string;
    name: string;
    description: string;
    duration: number;
    type: 'Buff' | 'Debuff';
    stats: {
        attack?: number;
        defense?: number;
        critChance?: number;
        critDamage?: number;
        speed?: number;
    };
}

export interface ShopCategory {
    id: string;
    name: string;
    description: string;
    items: string[]; // Item IDs
    requiredLevel?: number;
    requiredClass?: PlayerClass[];
    currency: 'Gold' | 'GladiatorTokens' | 'MiraculousEnergy';
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Legendary' | 'Mythic';
    requirements: {
        type: string;
        value: number;
        comparison: 'equal' | 'greater' | 'less';
    }[];
    rewards: {
        xp?: number;
        gold?: number;
        items?: string[];
        title?: string;
        gladiatorTokens?: number;
    };
    hidden: boolean;
}

export interface Dungeon {
    id: string;
    name: string;
    description: string;
    requiredLevel: number;
    floors: DungeonFloor[];
    entryFee: number;
    currency: 'Gold' | 'GladiatorTokens' | 'MiraculousEnergy';
    cooldown: number; // in milliseconds
    rewards: {
        xp: number;
        gold: number;
        items?: string[];
    };
}

export interface DungeonFloor {
    floor: number;
    name: string;
    description: string;
    encounters: DungeonEncounter[];
    boss?: Monster;
    rewards: DropTableEntry[];
}

export interface DungeonEncounter {
    type: 'Monster' | 'Treasure' | 'Trap' | 'Special';
    chance: number;
    data: any; // Flexible data for different encounter types
}

export interface GuildData {
    name: string;
    description: string;
    leaderId: string;
    members: string[];
    officers: string[];
    level: number;
    xp: number;
    treasury: number;
    createdAt: number;
    settings: {
        joinRequests: boolean;
        memberLimit: number;
        taxRate: number;
    };
}

// Utility types
export interface RarityInfo {
    name: string;
    color: number;
    emoji: string;
    statMultiplier: number;
    sellMultiplier: number;
}

export interface ClassInfo {
    name: string;
    description: string;
    emoji: string;
    startingStats: PlayerStats;
    statGrowth: PlayerStats;
    skills: string[];
    plaggComment: string;
}

// Event types for the event system
export interface GameEvent {
    type: 'levelUp' | 'itemFound' | 'achievementUnlocked' | 'pathUnlocked' | 'skillLearned';
    playerId: string;
    data: any;
    timestamp: number;
}

// Extended Auction House System
export interface AuctionListing {
    id: string;
    sellerId: string;
    sellerName: string;
    item: Item;
    startingPrice: number;
    buyoutPrice?: number;
    currentBid: number;
    currentBidderId?: string;
    bids: AuctionBid[];
    duration: number; // in hours
    expiresAt: number;
    createdAt: number;
    status: 'active' | 'sold' | 'expired' | 'cancelled';
}

export interface AuctionBid {
    bidderId: string;
    bidderName: string;
    amount: number;
    timestamp: number;
}

// PvP Arena System
export interface ArenaMatch {
    id: string;
    player1Id: string;
    player2Id: string;
    player1Name: string;
    player2Name: string;
    player1Elo: number;
    player2Elo: number;
    winnerId?: string;
    status: 'waiting' | 'active' | 'completed' | 'abandoned';
    startTime: number;
    endTime?: number;
    spectators: string[];
    rounds: ArenaRound[];
}

export interface ArenaRound {
    roundNumber: number;
    actions: ArenaAction[];
    winnerId?: string;
    damage: { [playerId: string]: number };
}

export interface ArenaAction {
    playerId: string;
    action: string;
    damage: number;
    timestamp: number;
}

// Housing System
export interface PlayerHousing {
    ownerId: string;
    houseType: 'Apartment' | 'House' | 'Mansion' | 'Castle' | 'Pocket_Dimension';
    level: number;
    rooms: HousingRoom[];
    furniture: HousingFurniture[];
    visitors: string[];
    totalValue: number;
    maintenanceCost: number;
    lastMaintenance: number;
    decorations: string[];
    buffs: HousingBuff[];
}

export interface HousingRoom {
    id: string;
    name: string;
    type: 'Living' | 'Kitchen' | 'Bedroom' | 'Study' | 'Workshop' | 'Shrine' | 'Garden';
    level: number;
    furniture: string[];
    capacity: number;
    buffs: string[];
}

export interface HousingFurniture {
    id: string;
    name: string;
    type: 'Chair' | 'Table' | 'Bed' | 'Decoration' | 'Functional' | 'Magical';
    rarity: Item['rarity'];
    roomType: HousingRoom['type'];
    cost: number;
    buffs: HousingBuff[];
    description: string;
}

export interface HousingBuff {
    id: string;
    name: string;
    description: string;
    effect: string;
    value: number;
    duration: number;
    stackable: boolean;
}

// Pet System
export interface PlayerPet {
    id: string;
    ownerId: string;
    species: string;
    name: string;
    level: number;
    xp: number;
    rarity: Item['rarity'];
    stats: PetStats;
    skills: string[];
    personality: 'Aggressive' | 'Defensive' | 'Balanced' | 'Support';
    happiness: number;
    hunger: number;
    health: number;
    maxHealth: number;
    evolution: string[];
    bondLevel: number;
    lastFed: number;
    lastPlayed: number;
    equipment?: Item[];
}

export interface PetStats {
    attack: number;
    defense: number;
    speed: number;
    magic: number;
    loyalty: number;
}

export interface PetSpecies {
    id: string;
    name: string;
    description: string;
    baseStats: PetStats;
    skillPool: string[];
    rarity: Item['rarity'];
    evolutions: PetEvolution[];
    tamingRequirements: {
        level: number;
        items: string[];
        location?: string;
    };
}

export interface PetEvolution {
    fromSpecies: string;
    toSpecies: string;
    requirements: {
        level: number;
        bondLevel: number;
        items?: string[];
        conditions?: string[];
    };
}

// Isekai Scenario System
export interface IsekaiScenario {
    id: string;
    name: string;
    anime: string;
    description: string;
    triggerConditions: TriggerCondition[];
    dialogue: string[];
    rewards: ScenarioReward[];
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary' | 'Mythic';
    oneTime: boolean;
    unlockLevel: number;
    completedBy: string[];
}

export interface TriggerCondition {
    type: 'combat' | 'inventory' | 'stat' | 'location' | 'action' | 'time' | 'random';
    condition: string;
    value?: number | string;
    comparison?: 'equal' | 'greater' | 'less' | 'contains';
}

export interface ScenarioReward {
    type: 'item' | 'skill' | 'title' | 'buff' | 'stat' | 'special';
    value: string | number;
    permanent: boolean;
    description: string;
}

// Faction Warfare System
export interface Faction {
    id: string;
    name: string;
    description: string;
    leader: string;
    members: string[];
    officers: string[];
    level: number;
    reputation: number;
    treasury: number;
    warPoints: number;
    territory: string[];
    buffs: FactionBuff[];
    rivals: string[];
    allies: string[];
    joinRequirements: {
        level: number;
        reputation?: number;
        items?: string[];
        questsCompleted?: string[];
    };
}

export interface FactionBuff {
    id: string;
    name: string;
    description: string;
    effect: string;
    value: number;
    duration: number;
    requirements: {
        memberRank?: string;
        territoryControl?: number;
    };
}

// Crafting & Recipe System  
export interface Recipe {
    id: string;
    name: string;
    description: string;
    resultItem: string;
    resultQuantity: number;
    materials: CraftingMaterial[];
    goldCost: number;
    craftingLevel: number;
    craftingStation?: string;
    successRate: number;
    craftingTime: number; // in seconds
    category: 'Weapons' | 'Armor' | 'Consumables' | 'Materials' | 'Artifacts' | 'Housing' | 'Special';
    discoveredBy: string[];
    rarity: Item['rarity'];
}

export interface CraftingMaterial {
    itemId: string;
    quantity: number;
    consumed: boolean; // Some materials may not be consumed
}

// Miraculous System Extensions
export interface MiraculousArtifact {
    id: string;
    name: string;
    miraculous: string; // Ladybug, Black Cat, Fox, etc.
    tier: 'Broken' | 'Damaged' | 'Restored' | 'Awakened' | 'Unified';
    power: string;
    description: string;
    requirements: {
        level: number;
        path: MiraculousPath;
        questsCompleted: string[];
    };
    stats: Item['stats'];
    abilities: string[];
    setBonus?: string; // When combined with other Miraculous
    lore: string;
}

// World Events System
export interface WorldEvent {
    id: string;
    name: string;
    description: string;
    type: 'Invasion' | 'Festival' | 'Awakening' | 'Calamity' | 'Discovery';
    startTime: number;
    endTime: number;
    participants: string[];
    rewards: {
        individual: ScenarioReward[];
        faction: ScenarioReward[];
        global: ScenarioReward[];
    };
    objectives: EventObjective[];
    status: 'upcoming' | 'active' | 'completed' | 'failed';
    requirements: {
        minParticipants: number;
        minLevel: number;
        location?: string;
    };
}

export interface EventObjective {
    id: string;
    description: string;
    type: 'kill' | 'collect' | 'defend' | 'survive' | 'craft' | 'explore';
    target: string | number;
    progress: number;
    completed: boolean;
    contributors: string[];
}

// Market Economy System
export interface MarketData {
    itemId: string;
    averagePrice: number;
    highestPrice: number;
    lowestPrice: number;
    totalSold: number;
    priceHistory: PricePoint[];
    lastUpdated: number;
    trend: 'rising' | 'falling' | 'stable';
}

export interface PricePoint {
    price: number;
    timestamp: number;
    quantity: number;
}

// Database structure (Extended)
export interface DatabaseSchema {
    players: { [userId: string]: Player };
    guilds: { [guildId: string]: GuildData };
    auctions: { [auctionId: string]: AuctionListing };
    arenaMatches: { [matchId: string]: ArenaMatch };
    housing: { [ownerId: string]: PlayerHousing };
    pets: { [petId: string]: PlayerPet };
    factions: { [factionId: string]: Faction };
    worldEvents: { [eventId: string]: WorldEvent };
    marketData: { [itemId: string]: MarketData };
    completedScenarios: { [playerId: string]: string[] };
    globalStats: {
        totalPlayers: number;
        totalBattles: number;
        totalGold: number;
        totalAuctions: number;
        totalTrades: number;
        activePvPMatches: number;
        lastReset: number;
        lastBackup: number;
    };
    events: GameEvent[];
    crafting: {
        [playerId: string]: {
            knownRecipes: string[];
            activeProjects: CraftingProject[];
        };
    };
}

export interface CraftingProject {
    recipeId: string;
    startTime: number;
    completionTime: number;
    materials: CraftingMaterial[];
    successBonus: number;
}

// Command Categories (For the 50+ Commands)
export interface CommandCategory {
    name: string;
    description: string;
    commands: string[];
    requiredLevel: number;
    emoji: string;
}
