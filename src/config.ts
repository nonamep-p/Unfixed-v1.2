// Configuration file for Plagg Bot Ultimate Edition
// Contains all bot settings, colors, and constants

export const config = {
    prefix: '$',
    botOwnerId: '1297013439125917766',
    
    // Database configuration
    databaseUrl: process.env.DATABASE_URL || '',
    
    // Starting player stats
    startingGold: 500,
    startingHealth: 100,
    startingMana: 50,
    
    // Combat settings
    commandCooldown: 3, // seconds
    battleTimeout: 300000, // 5 minutes
    
    // Economy settings
    vendorSellMultiplier: 0.6, // Players sell items for 60% of buy price
    auctionFee: 0.05, // 5% auction house fee
    
    // XP and leveling
    baseXP: 100,
    xpMultiplier: 1.2,
    maxLevel: 100,
    
    // Colors for embeds
    colors: {
        primary: 0x6B73FF,     // Plagg purple
        success: 0x00D26A,     // Green
        error: 0xFF4757,       // Red
        warning: 0xFFA502,     // Orange
        info: 0x3742FA,        // Blue
        combat: 0xFF3838,      // Combat red
        gold: 0xFFD700,        // Gold color
        rare: 0x0099FF,        // Rare blue
        epic: 0x9966FF,        // Epic purple
        legendary: 0xFFD700    // Legendary gold
    },
    
    // API Keys (from environment)
    geminiApiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
    
    // Feature toggles
    features: {
        pvpArena: true,
        dungeons: true,
        housing: true,
        pets: true,
        auction: true,
        crafting: true,
        isekaiScenarios: true,
        guildSystem: true
    },
    
    // Isekai scenario settings
    isekai: {
        triggerChance: 0.02, // 2% chance per action
        cooldownTime: 3600000, // 1 hour cooldown
        maxActiveScenarios: 3
    },
    
    // PvP Arena settings
    arena: {
        eloStarting: 1000,
        eloK: 32,
        matchTimeout: 600000, // 10 minutes
        spectatorLimit: 50
    },
    
    // Housing settings
    housing: {
        maintenancePeriod: 2592000000, // 30 days
        maxVisitors: 20,
        maxFurniture: 100
    },
    
    // Pet settings
    pets: {
        maxPets: 5,
        feedingCooldown: 21600000, // 6 hours
        trainingCooldown: 43200000, // 12 hours
        evolutionRequirements: {
            bondLevel: 80,
            level: 25
        }
    },
    
    // Crafting settings
    crafting: {
        maxActiveProjects: 3,
        criticalSuccessChance: 0.05, // 5% chance for critical success
        criticalFailureChance: 0.02  // 2% chance for critical failure
    },
    
    // Auction house settings
    auction: {
        maxListings: 10,
        defaultDuration: 86400000, // 24 hours
        maxDuration: 604800000,    // 7 days
        minBidIncrement: 0.1       // 10% minimum bid increase
    },
    
    // Dungeon settings
    dungeons: {
        maxPartySize: 4,
        reviveTimeoutMinutes: 5,
        bossRespawnHours: 24
    },
    
    // Chat and AI settings
    chat: {
        maxMessageLength: 2000,
        aiPersonality: 'chaotic',
        responseDelay: 1000
    },
    
    // Notification settings
    notifications: {
        levelUp: true,
        rareDrops: true,
        pvpChallenges: true,
        guildEvents: true
    },
    
    // Rate limiting
    rateLimiting: {
        enabled: true,
        windowMs: 60000, // 1 minute
        maxRequests: 60  // 60 requests per minute
    },
    
    // Debug and logging
    debug: process.env.NODE_ENV === 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    
    // URLs and links
    urls: {
        supportServer: 'https://discord.gg/plagg-support',
        website: 'https://plagg-bot.repl.co',
        documentation: 'https://plagg-bot.repl.co/docs'
    }
};

// Validate configuration
export function validateConfig(): boolean {
    const required = ['databaseUrl'];
    
    for (const key of required) {
        if (!config[key as keyof typeof config]) {
            console.error(`❌ Missing required configuration: ${key}`);
            return false;
        }
    }
    
    return true;
}

export default config;