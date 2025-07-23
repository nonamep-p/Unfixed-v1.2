import Database from '@replit/database';

const db = new Database();

// Initialize database with default values
export async function initDatabase() {
    try {
        // Check if global stats exist, create if not
        const globalStats = await db.get('globalStats');
        if (!globalStats) {
            await db.set('globalStats', {
                totalPlayers: 0,
                totalBattles: 0,
                totalGold: 0,
                lastReset: Date.now()
            });
        }

        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
}

// Player data functions
export async function getPlayer(userId: string) {
    try {
        const player = await db.get(`player_${userId}`);
        return player || null;
    } catch (error) {
        console.error(`Error getting player ${userId}:`, error);
        return null;
    }
}

export async function createPlayer(userId: string, playerData: any) {
    try {
        await db.set(`player_${userId}`, {
            ...playerData,
            createdAt: Date.now(),
            lastActive: Date.now(),
            lastLogin: Date.now()
        });
        
        // Update global stats
        const globalStatsResult = await db.get('globalStats');
        const globalStats = globalStatsResult || { totalPlayers: 0 };
        if (typeof globalStats === 'object' && globalStats !== null && 'totalPlayers' in globalStats) {
            (globalStats as any).totalPlayers += 1;
        } else {
            (globalStats as any).totalPlayers = 1;
        }
        await db.set('globalStats', globalStats);
        
        return true;
    } catch (error) {
        console.error(`Error creating player ${userId}:`, error);
        return false;
    }
}

export async function updatePlayer(userId: string, updates: any) {
    try {
        const currentPlayer = await getPlayer(userId);
        if (!currentPlayer) {
            throw new Error('Player not found');
        }

        const updatedPlayer = {
            ...currentPlayer,
            ...updates,
            lastActive: Date.now()
        };

        await db.set(`player_${userId}`, updatedPlayer);
        return updatedPlayer;
    } catch (error) {
        console.error(`Error updating player ${userId}:`, error);
        return null;
    }
}

export async function deletePlayer(userId: string) {
    try {
        await db.delete(`player_${userId}`);
        return true;
    } catch (error) {
        console.error(`Error deleting player ${userId}:`, error);
        return false;
    }
}

// Guild data functions
export async function getGuild(guildId: string) {
    try {
        const guild = await db.get(`guild_${guildId}`);
        return guild || null;
    } catch (error) {
        console.error(`Error getting guild ${guildId}:`, error);
        return null;
    }
}

export async function createGuild(guildId: string, guildData: any) {
    try {
        await db.set(`guild_${guildId}`, {
            ...guildData,
            createdAt: Date.now()
        });
        return true;
    } catch (error) {
        console.error(`Error creating guild ${guildId}:`, error);
        return false;
    }
}

export async function updateGuild(guildId: string, updates: any) {
    try {
        const currentGuild = await getGuild(guildId);
        if (!currentGuild) {
            throw new Error('Guild not found');
        }

        const updatedGuild = {
            ...currentGuild,
            ...updates
        };

        await db.set(`guild_${guildId}`, updatedGuild);
        return updatedGuild;
    } catch (error) {
        console.error(`Error updating guild ${guildId}:`, error);
        return null;
    }
}

// Combat session functions
export async function saveCombatSession(sessionId: string, sessionData: any) {
    try {
        await db.set(`combat_${sessionId}`, {
            ...sessionData,
            lastUpdate: Date.now()
        });
        return true;
    } catch (error) {
        console.error(`Error saving combat session ${sessionId}:`, error);
        return false;
    }
}

export async function getCombatSession(sessionId: string) {
    try {
        const session = await db.get(`combat_${sessionId}`);
        return session || null;
    } catch (error) {
        console.error(`Error getting combat session ${sessionId}:`, error);
        return null;
    }
}

export async function deleteCombatSession(sessionId: string) {
    try {
        await db.delete(`combat_${sessionId}`);
        return true;
    } catch (error) {
        console.error(`Error deleting combat session ${sessionId}:`, error);
        return false;
    }
}

// Global stats functions
export async function getGlobalStats() {
    try {
        const stats = await db.get('globalStats');
        return stats || {
            totalPlayers: 0,
            totalBattles: 0,
            totalGold: 0,
            lastReset: Date.now()
        };
    } catch (error) {
        console.error('Error getting global stats:', error);
        return null;
    }
}

export async function updateGlobalStats(updates: any) {
    try {
        const currentStats = await getGlobalStats();
        const updatedStats = {
            ...currentStats,
            ...updates
        };
        
        await db.set('globalStats', updatedStats);
        return updatedStats;
    } catch (error) {
        console.error('Error updating global stats:', error);
        return null;
    }
}

// Utility functions
export async function getAllKeys(prefix: string = '') {
    try {
        const keys = await db.list(prefix);
        return keys;
    } catch (error) {
        console.error(`Error getting keys with prefix ${prefix}:`, error);
        return [];
    }
}

export async function getAllPlayers() {
    try {
        const keys = await getAllKeys('player_');
        const players = [];
        
        if (Array.isArray(keys)) {
            for (const key of keys) {
                const player = await db.get(key);
                if (player) {
                    players.push({
                        userId: key.replace('player_', ''),
                        ...player
                    });
                }
            }
        }
        
        return players;
    } catch (error) {
        console.error('Error getting all players:', error);
        return [];
    }
}

export default db;
