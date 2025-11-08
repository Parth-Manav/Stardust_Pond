# Discord Fishing Bot 🎣

A Discord bot with an interactive daily fishing game! Users can fish once per day from the Stardust Pond.

## Features

- `/fishsetup` command to create a fishing pond with a clickable button
- Interactive "Fish!" button for users to catch fish
- Daily fishing limit (one fish per user per day)
- Public announcements when users fish
- Automatic daily reset at midnight
- Tracks total daily fishing count

## Setup Instructions

### 1. Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section in the left sidebar
4. Click "Add Bot"
5. Under the bot's username, click "Reset Token" to get your bot token
6. **IMPORTANT:** Copy this token - you'll need it in the next step!

### 2. Set Bot Permissions

1. In the Developer Portal, go to "OAuth2" > "URL Generator"
2. Select these scopes:
   - `bot`
   - `applications.commands`
3. Select these bot permissions:
   - Send Messages
   - Use Slash Commands
4. Copy the generated URL and open it in your browser to invite the bot to your server

### 3. Configure the Bot Token

**In Replit:**
1. Click on "Secrets" (lock icon) in the left sidebar
2. Add a new secret:
   - Key: `DISCORD_BOT_TOKEN`
   - Value: (paste your bot token from step 1.5)

**Running locally:**
Create a `.env` file in the project root:
```
DISCORD_BOT_TOKEN=your_bot_token_here
```

### 4. Run the Bot

The bot will start automatically in Replit. You should see:
```
✅ Bot is ready! Logged in as YourBotName#1234
Registering slash commands...
✅ Slash commands registered successfully!
```

## How to Use

1. In any channel where the bot has access, type `/fishsetup`
2. The bot will post a message with a "🎣 Fish!" button
3. Click the button to fish! You can only fish once per day
4. When you fish, everyone will see: `Username has fished! 🐟🎣 at date : {timestamp}  total number of fishing done : {count}`
5. The fishing count resets every day at midnight

## Data Storage

The bot stores fishing data in `fishing_data.json`:
- Daily fishing count
- User fishing attempts
- Last reset date

## Troubleshooting

**Bot not responding?**
- Make sure you've set the `DISCORD_BOT_TOKEN` secret correctly
- Check that the bot has proper permissions in your Discord server
- Wait a few minutes for slash commands to register

**"Already fished today" error?**
- This is expected! Each user can only fish once per day
- Wait until the next day (midnight UTC) to fish again

**Want to test the reset?**
- You can manually delete `fishing_data.json` to reset all data

## Development

The bot uses:
- discord.js v14 for Discord API interactions
- node-cron for scheduling daily resets
- File-based JSON storage for persistence

Enjoy fishing! 🐟
