const { Client, GatewayIntentBits, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, REST, Routes } = require('discord.js');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'fishing_data.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ]
});

let fishingData = {
  dailyCount: 0,
  lastReset: new Date().toDateString(),
  users: {}
};

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      fishingData = JSON.parse(data);
      
      const today = new Date().toDateString();
      if (fishingData.lastReset !== today) {
        resetDailyData();
      }
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(fishingData, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

function resetDailyData() {
  const today = new Date().toDateString();
  fishingData.dailyCount = 0;
  fishingData.lastReset = today;
  fishingData.users = {};
  saveData();
  console.log(`Daily data reset for ${today}`);
}

cron.schedule('0 20 * * *', () => {
  resetDailyData();
  console.log('🔄 Scheduled reset at 20:00 GMT (5:30 AM GMT+5:30)');
}, {
  timezone: 'Etc/GMT'
});

client.once('ready', async () => {
  console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
  
  loadData();
  
  const commands = [
    new SlashCommandBuilder()
      .setName('fishsetup')
      .setDescription('Set up the fishing pond')
      .toJSON()
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('✅ Slash commands registered successfully!');
  } catch (error) {
    console.error('Error registering slash commands:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'fishsetup') {
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('fish_button')
            .setLabel('🎣 Fish!')
            .setStyle(ButtonStyle.Primary)
        );

      await interaction.reply({
        content: '🎣 Welcome to Stardust Pond — click to fish!',
        components: [row]
      });
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === 'fish_button') {
      const userId = interaction.user.id;
      const username = interaction.user.username;
      const today = new Date().toDateString();

      if (fishingData.lastReset !== today) {
        resetDailyData();
      }

      if (fishingData.users[userId]) {
        await interaction.reply({
          content: `❌ You've already fished today! Come back tomorrow.`,
          ephemeral: true
        });
        return;
      }

      fishingData.users[userId] = {
        username: username,
        fishedAt: new Date().toISOString()
      };
      fishingData.dailyCount++;
      saveData();

      const now = new Date();
      const dateString = now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      await interaction.reply({
        content: `${username} has fished! 🐟🎣 at date : ${dateString}  total number of fishing done : ${fishingData.dailyCount}`
      });
    }
  }
});

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
  console.error('❌ ERROR: DISCORD_BOT_TOKEN environment variable is not set!');
  console.error('Please set your Discord bot token as an environment variable.');
  process.exit(1);
}

client.login(token);
