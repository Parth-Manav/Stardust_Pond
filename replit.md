# Discord Fishing Bot

## Overview
A Discord bot built with discord.js v14 that provides an interactive daily fishing game. Users can fish once per day from the Stardust Pond using slash commands and button interactions.

## Recent Changes
- November 8, 2025: Initial project setup
  - Created Discord bot with /fishsetup slash command
  - Implemented button-based fishing interaction
  - Added daily fishing limits (one per user per day)
  - Implemented automatic daily reset at midnight using node-cron
  - Set up persistent JSON-based data storage for tracking fishing attempts

## Project Architecture

### Structure
```
.
├── index.js               # Main bot application
├── fishing_data.json      # Persistent data storage (auto-generated)
├── package.json           # Node.js dependencies
├── .gitignore            # Git ignore rules
└── README.md             # User documentation
```

### Key Components
- **Slash Commands**: `/fishsetup` creates the fishing pond message
- **Button Interactions**: "🎣 Fish!" button for user interaction
- **Daily Reset System**: Automated cron job runs at midnight to reset fishing counts
- **Data Persistence**: JSON file storage tracks users, counts, and reset dates

### Dependencies
- discord.js v14: Discord API interactions
- node-cron: Scheduled daily resets
- Node.js built-in fs module: File-based data storage

### Environment Variables
- `DISCORD_BOT_TOKEN`: Discord bot authentication token (required)

## Features
1. Interactive fishing game with button UI
2. Daily fishing limit enforcement (one fish per user per day)
3. Public announcements when users fish with timestamp and daily count
4. Automatic midnight reset of fishing data
5. Persistent storage across bot restarts
