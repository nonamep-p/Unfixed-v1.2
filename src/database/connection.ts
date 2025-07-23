// PostgreSQL Database Connection and Operations for Plagg Bot
// Resilient, type-safe database layer with comprehensive error handling

import { Pool } from 'pg';
import { Player, DatabaseSchema, Item, Monster, Recipe, IsekaiScenario, AuctionListing, ArenaMatch } from '../types';
import { logger, logDatabaseOperation } from '../utils/logger';
import { config } from '../config';
import * as fs from 'fs';
import * as path from 'path';

export class DatabaseConnection {
    private pool: Pool;
    private gameData: {
        items: Map<string, Item>;
        monsters: Map<string, Monster>; 
        recipes: Map<string, Recipe>;
        scenarios: Map<string, IsekaiScenario>;
        dungeons?: Map<string, any>;
        achievements?: Map<string, any>;
        pets?: Map<string, any>;
        housingItems?: Map<string, any>;
        worldEvents?: Map<string, any>;
        factions?: Map<string, any>;
    } = {
        items: new Map(),
        monsters: new Map(),
        recipes: new Map(),
        scenarios: new Map(),
        dungeons: new Map(),
        achievements: new Map(),
        pets: new Map(),
        housingItems: new Map(),
        worldEvents: new Map(),
        factions: new Map()
    };

    constructor() {
        this.pool = new Pool({
            connectionString: config.databaseUrl,
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        this.pool.on('error', (err) => {
            logger.error('Database pool error:', err);
        });
    }

    async initialize(): Promise<void> {
        try {
            await this.createTables();
            await this.loadGameData();
            logger.info('Database initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize database:', error);
            throw error;
        }
    }

    private async createTables(): Promise<void> {
        const queries = [
            `CREATE TABLE IF NOT EXISTS players (
                id VARCHAR(20) PRIMARY KEY,
                data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )`,
            `CREATE TABLE IF NOT EXISTS auctions (
                id VARCHAR(50) PRIMARY KEY,
                data JSONB NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )`,
            `CREATE TABLE IF NOT EXISTS arena_matches (
                id VARCHAR(50) PRIMARY KEY,
                data JSONB NOT NULL,
                status VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )`,
            `CREATE TABLE IF NOT EXISTS global_stats (
                key VARCHAR(50) PRIMARY KEY,
                value BIGINT NOT NULL,
                updated_at TIMESTAMP DEFAULT NOW()
            )`,
            `CREATE INDEX IF NOT EXISTS idx_auctions_expires ON auctions(expires_at)`,
            `CREATE INDEX IF NOT EXISTS idx_matches_status ON arena_matches(status)`,
            `CREATE INDEX IF NOT EXISTS idx_players_updated ON players(updated_at)`
        ];

        for (const query of queries) {
            await this.pool.query(query);
        }

        logDatabaseOperation('create_tables', true);
    }

    public async loadGameData(): Promise<void> {
        const dataDir = path.join(__dirname, '../data');
        
        try {
            // Load all game data with comprehensive scanning
            await this.loadItemsData(dataDir);
            await this.loadMonstersData(dataDir);
            await this.loadRecipesData(dataDir);
            await this.loadScenariosData(dataDir);
            await this.loadDungeonsData(dataDir);
            await this.loadAchievementsData(dataDir);
            await this.loadPetsData(dataDir);
            await this.loadHousingData(dataDir);
            await this.loadWorldEventsData(dataDir);
            await this.loadFactionsData(dataDir);
            
            logger.info(`Loaded game data: ${this.gameData.items.size} items, ${this.gameData.monsters.size} monsters, ${this.gameData.recipes.size} recipes, ${this.gameData.scenarios.size} scenarios, ${this.gameData.dungeons?.size || 0} dungeons, ${this.gameData.achievements?.size || 0} achievements`);
        } catch (error) {
            logger.error('Failed to load game data:', error);
            throw error;
        }
    }

    private async loadItemsData(dataDir: string): Promise<void> {
        const itemPaths = ['weapons.json', 'armor.json', 'artifacts.json', 'consumables.json'];
        
        for (const itemPath of itemPaths) {
            try {
                const filePath = path.join(dataDir, 'items', itemPath);
                if (fs.existsSync(filePath)) {
                    const rawData = fs.readFileSync(filePath, 'utf-8');
                    const items: Item[] = JSON.parse(rawData);
                    
                    items.forEach(item => {
                        try {
                            // Validate item structure
                            if (this.validateItem(item)) {
                                this.gameData.items.set(item.id, item);
                            } else {
                                logger.warn(`Invalid item structure: ${item.id || 'unknown'} in ${itemPath}`);
                            }
                        } catch (itemError) {
                            logger.warn(`Failed to load item from ${itemPath}:`, itemError);
                        }
                    });
                }
            } catch (fileError) {
                logger.error(`Failed to load ${itemPath}:`, fileError);
                // Continue loading other files - resilient by design
            }
        }
    }

    private async loadMonstersData(dataDir: string): Promise<void> {
        try {
            const filePath = path.join(dataDir, 'monsters.json');
            if (fs.existsSync(filePath)) {
                const rawData = fs.readFileSync(filePath, 'utf-8');
                const monsters: Monster[] = JSON.parse(rawData);
                
                monsters.forEach(monster => {
                    try {
                        if (this.validateMonster(monster)) {
                            this.gameData.monsters.set(monster.id, monster);
                        } else {
                            logger.warn(`Invalid monster structure: ${monster.id || 'unknown'}`);
                        }
                    } catch (monsterError) {
                        logger.warn(`Failed to load monster:`, monsterError);
                    }
                });
            }
        } catch (error) {
            logger.error('Failed to load monsters.json:', error);
        }
    }

    private async loadRecipesData(dataDir: string): Promise<void> {
        try {
            const filePath = path.join(dataDir, 'recipes.json');
            if (fs.existsSync(filePath)) {
                const rawData = fs.readFileSync(filePath, 'utf-8');
                const recipes: Recipe[] = JSON.parse(rawData);
                
                recipes.forEach(recipe => {
                    try {
                        if (this.validateRecipe(recipe)) {
                            this.gameData.recipes.set(recipe.id, recipe);
                        } else {
                            logger.warn(`Invalid recipe structure: ${recipe.id || 'unknown'}`);
                        }
                    } catch (recipeError) {
                        logger.warn(`Failed to load recipe:`, recipeError);
                    }
                });
            }
        } catch (error) {
            logger.error('Failed to load recipes.json:', error);
        }
    }

    private async loadScenariosData(dataDir: string): Promise<void> {
        try {
            const filePath = path.join(dataDir, 'scenarios', 'isekai_scenarios.json');
            if (fs.existsSync(filePath)) {
                const rawData = fs.readFileSync(filePath, 'utf-8');
                const scenarios: IsekaiScenario[] = JSON.parse(rawData);
                
                scenarios.forEach(scenario => {
                    try {
                        if (this.validateScenario(scenario)) {
                            this.gameData.scenarios.set(scenario.id, scenario);
                        } else {
                            logger.warn(`Invalid scenario structure: ${scenario.id || 'unknown'}`);
                        }
                    } catch (scenarioError) {
                        logger.warn(`Failed to load scenario:`, scenarioError);
                    }
                });
            }
        } catch (error) {
            logger.error('Failed to load isekai_scenarios.json:', error);
        }
    }

    private async loadDungeonsData(dataDir: string): Promise<void> {
        try {
            const filePath = path.join(dataDir, 'dungeons.json');
            if (fs.existsSync(filePath)) {
                const rawData = fs.readFileSync(filePath, 'utf-8');
                const dungeons = JSON.parse(rawData);
                
                dungeons.forEach((dungeon: any) => {
                    try {
                        if (this.validateDungeon(dungeon)) {
                            this.gameData.dungeons!.set(dungeon.id, dungeon);
                        }
                    } catch (error) {
                        logger.warn(`Failed to load dungeon:`, error);
                    }
                });
            }
        } catch (error) {
            logger.error('Failed to load dungeons.json:', error);
        }
    }

    private async loadAchievementsData(dataDir: string): Promise<void> {
        try {
            const achievementsDir = path.join(dataDir, 'achievements');
            if (fs.existsSync(achievementsDir)) {
                const files = fs.readdirSync(achievementsDir);
                for (const file of files) {
                    if (file.endsWith('.json')) {
                        const filePath = path.join(achievementsDir, file);
                        const rawData = fs.readFileSync(filePath, 'utf-8');
                        const achievements = JSON.parse(rawData);
                        
                        achievements.forEach((achievement: any) => {
                            if (achievement && achievement.id) {
                                this.gameData.achievements!.set(achievement.id, achievement);
                            }
                        });
                    }
                }
            }
        } catch (error) {
            logger.error('Failed to load achievements:', error);
        }
    }

    private async loadPetsData(dataDir: string): Promise<void> {
        try {
            const petsDir = path.join(dataDir, 'pets');
            if (fs.existsSync(petsDir)) {
                const files = fs.readdirSync(petsDir);
                for (const file of files) {
                    if (file.endsWith('.json')) {
                        const filePath = path.join(petsDir, file);
                        const rawData = fs.readFileSync(filePath, 'utf-8');
                        const pets = JSON.parse(rawData);
                        
                        pets.forEach((pet: any) => {
                            if (pet && pet.id) {
                                this.gameData.pets!.set(pet.id, pet);
                            }
                        });
                    }
                }
            }
        } catch (error) {
            logger.error('Failed to load pets:', error);
        }
    }

    private async loadHousingData(dataDir: string): Promise<void> {
        try {
            const housingDir = path.join(dataDir, 'housing_items');
            if (fs.existsSync(housingDir)) {
                const files = fs.readdirSync(housingDir);
                for (const file of files) {
                    if (file.endsWith('.json')) {
                        const filePath = path.join(housingDir, file);
                        const rawData = fs.readFileSync(filePath, 'utf-8');
                        const items = JSON.parse(rawData);
                        
                        items.forEach((item: any) => {
                            if (item && item.id) {
                                this.gameData.housingItems!.set(item.id, item);
                            }
                        });
                    }
                }
            }
        } catch (error) {
            logger.error('Failed to load housing items:', error);
        }
    }

    private async loadWorldEventsData(dataDir: string): Promise<void> {
        try {
            const eventsDir = path.join(dataDir, 'world_events');
            if (fs.existsSync(eventsDir)) {
                const files = fs.readdirSync(eventsDir);
                for (const file of files) {
                    if (file.endsWith('.json')) {
                        const filePath = path.join(eventsDir, file);
                        const rawData = fs.readFileSync(filePath, 'utf-8');
                        const events = JSON.parse(rawData);
                        
                        events.forEach((event: any) => {
                            if (event && event.id) {
                                this.gameData.worldEvents!.set(event.id, event);
                            }
                        });
                    }
                }
            }
        } catch (error) {
            logger.error('Failed to load world events:', error);
        }
    }

    private async loadFactionsData(dataDir: string): Promise<void> {
        try {
            const factionsDir = path.join(dataDir, 'factions');
            if (fs.existsSync(factionsDir)) {
                const files = fs.readdirSync(factionsDir);
                for (const file of files) {
                    if (file.endsWith('.json')) {
                        const filePath = path.join(factionsDir, file);
                        const rawData = fs.readFileSync(filePath, 'utf-8');
                        const factions = JSON.parse(rawData);
                        
                        factions.forEach((faction: any) => {
                            if (faction && faction.id) {
                                this.gameData.factions!.set(faction.id, faction);
                            }
                        });
                    }
                }
            }
        } catch (error) {
            logger.error('Failed to load factions:', error);
        }
    }

    // Validation methods for resilient data loading
    private validateItem(item: any): boolean {
        return item && 
               typeof item.id === 'string' && 
               typeof item.name === 'string' && 
               typeof item.type === 'string' &&
               typeof item.rarity === 'string';
    }

    private validateDungeon(dungeon: any): boolean {
        return dungeon && 
               typeof dungeon.id === 'string' && 
               typeof dungeon.name === 'string' &&
               Array.isArray(dungeon.floors);
    }

    private validateMonster(monster: any): boolean {
        return monster &&
               typeof monster.id === 'string' &&
               typeof monster.name === 'string' &&
               typeof monster.level === 'number';
    }

    private validateRecipe(recipe: any): boolean {
        return recipe &&
               typeof recipe.id === 'string' &&
               typeof recipe.name === 'string' &&
               Array.isArray(recipe.materials);
    }

    private validateScenario(scenario: any): boolean {
        return scenario &&
               typeof scenario.id === 'string' &&
               typeof scenario.name === 'string' &&
               Array.isArray(scenario.triggerConditions);
    }

    // Player operations
    public async getPlayer(userId: string): Promise<Player | null> {
        try {
            const result = await this.pool.query(
                'SELECT data FROM players WHERE id = $1',
                [userId]
            );

            if (result.rows.length === 0) {
                return null;
            }

            const player = result.rows[0].data as Player;
            return player;
        } catch (error) {
            logger.error(`Failed to get player ${userId}:`, error);
            return null;
        }
    }

    public async savePlayer(userId: string, player: Player): Promise<boolean> {
        try {
            await this.pool.query(
                `INSERT INTO players (id, data, updated_at) 
                 VALUES ($1, $2, NOW()) 
                 ON CONFLICT (id) DO UPDATE SET 
                 data = $2, updated_at = NOW()`,
                [userId, JSON.stringify(player)]
            );

            logDatabaseOperation('save_player', true, { userId });
            return true;
        } catch (error) {
            logger.error(`Failed to save player ${userId}:`, error);
            logDatabaseOperation('save_player', false, { userId, error: error.message });
            return false;
        }
    }

    public async createNewPlayer(userId: string): Promise<Player> {
        const newPlayer: Player = {
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            gold: config.startingGold,
            
            playerClass: 'None',
            miraculousPath: 'None',
            
            stats: {
                strength: 10,
                intelligence: 10,
                dexterity: 10,
                vitality: 10
            },
            statPointsAvailable: 0,
            
            maxHealth: config.startingHealth,
            maxMana: config.startingMana,
            maxStamina: 100,
            currentHealth: config.startingHealth,
            currentMana: config.startingMana,
            currentStamina: 100,
            
            inventory: [],
            equipment: {
                weapon: null,
                helmet: null,
                chestplate: null,
                leggings: null,
                boots: null
            },
            
            gladiatorTokens: 0,
            miraculousEnergy: 0,
            
            faction: '',
            guildId: undefined,
            
            achievements: [],
            titles: [],
            currentTitle: null,
            
            skills: [],
            techniques: [],
            
            lastBattle: 0,
            lastHunt: 0,
            lastDungeon: 0,
            lastMiraculous: 0,
            
            totalBattles: 0,
            totalVictories: 0,
            totalDeaths: 0,
            totalDamageDealt: 0,
            totalDamageTaken: 0,
            monstersKilled: 0,
            bossesKilled: 0,
            dungeonsCompleted: 0,
            
            createdAt: Date.now(),
            lastActive: Date.now(),
            lastLogin: Date.now()
        };

        await this.savePlayer(userId, newPlayer);
        logger.info(`Created new player: ${userId}`);
        
        return newPlayer;
    }

    // Game data accessors
    public getItem(itemId: string): Item | undefined {
        return this.gameData.items.get(itemId);
    }

    public getMonster(monsterId: string): Monster | undefined {
        return this.gameData.monsters.get(monsterId);
    }

    public getRecipe(recipeId: string): Recipe | undefined {
        return this.gameData.recipes.get(recipeId);
    }

    public getScenario(scenarioId: string): IsekaiScenario | undefined {
        return this.gameData.scenarios.get(scenarioId);
    }

    public getAllItems(): Item[] {
        return Array.from(this.gameData.items.values());
    }

    public getAllMonsters(): Monster[] {
        return Array.from(this.gameData.monsters.values());
    }

    public getAllScenarios(): IsekaiScenario[] {
        return Array.from(this.gameData.scenarios.values());
    }

    // Global stats
    public async getGlobalStat(key: string): Promise<number> {
        try {
            const result = await this.pool.query(
                'SELECT value FROM global_stats WHERE key = $1',
                [key]
            );

            return result.rows.length > 0 ? result.rows[0].value : 0;
        } catch (error) {
            logger.error(`Failed to get global stat ${key}:`, error);
            return 0;
        }
    }

    public async incrementGlobalStat(key: string, increment: number = 1): Promise<void> {
        try {
            await this.pool.query(
                `INSERT INTO global_stats (key, value) VALUES ($1, $2)
                 ON CONFLICT (key) DO UPDATE SET 
                 value = global_stats.value + $2, updated_at = NOW()`,
                [key, increment]
            );
        } catch (error) {
            logger.error(`Failed to increment global stat ${key}:`, error);
        }
    }

    public async close(): Promise<void> {
        await this.pool.end();
        logger.info('Database connection closed');
    }
}

// Global database instance
export const database = new DatabaseConnection();

// Convenience functions
export const getPlayer = (userId: string) => database.getPlayer(userId);
export const savePlayer = (userId: string, player: Player) => database.savePlayer(userId, player);
export const createNewPlayer = (userId: string) => database.createNewPlayer(userId);
export const loadGameData = () => database.loadGameData();

export default database;