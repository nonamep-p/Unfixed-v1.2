# Plagg Bot - Discord RPG Bot

## Overview

Plagg Bot is a comprehensive Discord RPG bot themed around the character Plagg from Miraculous Ladybug. The bot features a complete RPG system with character creation, combat mechanics, inventory management, and administrative tools. Players can create characters, engage in turn-based combat, collect items, and progress through an RPG experience with Plagg's characteristic chaotic personality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Architecture
- **Runtime Environment**: Node.js with TypeScript
- **Primary Framework**: Discord.js v14 for Discord API interactions
- **Database**: Replit Database (@replit/database) for persistent data storage
- **Web Server**: Express.js for health monitoring and keep-alive functionality
- **File Structure**: Modular command system with organized directories

### Key Technologies
- TypeScript for type safety and better development experience
- Discord.js for Discord bot functionality
- Express.js for web server capabilities
- Replit Database for simple key-value storage

## Key Components

### Bot Core (`index.ts`)
- Discord client initialization with required intents (Guilds, Messages, MessageContent, DirectMessages)
- Dynamic command loading system that recursively scans command directories
- Command collection management
- Owner verification system for administrative commands

### Database Layer (`src/database.ts`)
- Replit Database integration for persistent storage
- Player data management (creation, retrieval, updates)
- Global statistics tracking
- Combat session storage and management
- Automatic database initialization with default values

### Type System (`src/types.ts`)
- Comprehensive TypeScript interfaces for game entities
- Player character system with classes (Warrior, Mage, Rogue, Archer, Healer, etc.)
- Item system with rarities and equipment slots
- Combat system with skills, effects, and monsters
- Miraculous-themed progression paths

### Game Systems

#### Character System
- Multiple player classes with unique abilities
- Stat system (Strength, Intelligence, Dexterity, Vitality)
- Equipment system with various item types
- Level progression with XP requirements
- Title and achievement system

#### Combat System (`src/combat.ts`)
- Turn-based combat with players and monsters
- Skill system with mana costs and cooldowns
- Break bar mechanics for stunning enemies
- Elemental damage types and weaknesses
- Loot drops and XP rewards

#### Item System (`src/items.ts`)
- Rarity-based item system (Common to Divine)
- Equipment with stat bonuses
- Consumables for healing and buffs
- Crafting materials and artifacts
- Dynamic item generation

#### Utility Functions (`src/utils.ts`)
- XP and leveling calculations
- Stat computation with equipment bonuses
- Combat damage calculations
- Progress bar generation
- Number formatting utilities

### Command Structure

#### Character Commands
- `startrpg`: Character creation with class selection
- `profile`: Comprehensive character information display

#### Combat Commands
- `battle`: Initiate combat encounters with monsters

#### Inventory Commands
- `inventory`: View and manage items with pagination and filtering

#### Administrative Commands (Owner-only)
- `chat`: AI-powered conversation system (requires Gemini API)
- `setinfinite`: Grant unlimited resources to players
- `spawnitem`: Create any item directly in inventory

#### Help System
- `help`: Interactive help menu with tutorials and command explanations

### Keep-Alive System (`keep_alive.ts`)
- Express server for maintaining bot uptime
- Health check endpoints
- Status monitoring with memory and uptime metrics

## Data Flow

### Player Registration Flow
1. New user runs `$startrpg` command
2. Bot checks for existing player data
3. If new, presents class selection interface
4. Player selects class via Discord interactions
5. Character created with default stats and starter equipment
6. Data persisted to Replit Database

### Combat Flow
1. Player initiates combat with `$battle` command
2. Random monster selected based on player level
3. Combat session created and stored in database
4. Turn-based combat loop with player actions and monster responses
5. Combat resolves with XP, gold, and item rewards
6. Player stats and inventory updated

### Inventory Management
1. Items stored as array in player data
2. Inventory command provides paginated display
3. Equipment system calculates effective stats
4. Items can be filtered by type and rarity

## External Dependencies

### Required Packages
- `discord.js`: Discord API wrapper for bot functionality
- `@replit/database`: Simple key-value database for Replit environment
- `express`: Web framework for keep-alive server
- `typescript`: Type safety and modern JavaScript features
- `@types/node`: TypeScript definitions for Node.js
- `@types/express`: TypeScript definitions for Express

### Optional Integrations
- Google Gemini API for AI chat functionality (admin command)
- Environment variables for API keys and configuration

## Deployment Strategy

### Replit Environment
- Designed for Replit hosting platform
- Uses Replit Database for data persistence
- Keep-alive server prevents bot from sleeping
- Environment variables for sensitive configuration

### Configuration Requirements
- `DISCORD_BOT_TOKEN`: Discord bot token for authentication
- `GEMINI_API_KEY` or `GOOGLE_API_KEY`: Optional for AI chat features
- `PORT`: Server port (defaults to 5000)

### File Structure Organization
```
/
├── index.ts (Main bot entry point)
├── keep_alive.ts (Keep-alive server)
├── src/
│   ├── database.ts (Database operations)
│   ├── types.ts (TypeScript interfaces)
│   ├── utils.ts (Utility functions)
│   ├── combat.ts (Combat system)
│   └── items.ts (Item definitions)
└── commands/
    ├── admin/ (Owner-only commands)
    ├── character/ (Character management)
    ├── combat/ (Combat commands)
    ├── inventory/ (Inventory management)
    └── help/ (Help system)
```

### Scalability Considerations
- Modular command system allows easy addition of new features
- Database operations are asynchronous and handle errors gracefully
- Combat sessions are stored separately to prevent data corruption
- Type system ensures consistency across all game mechanics