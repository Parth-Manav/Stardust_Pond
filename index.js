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
  users: {},
  buttonMessageId: null,
  buttonChannelId: null
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

cron.schedule('30 14 * * *', () => {
  resetDailyData();
  console.log('🔄 Scheduled reset at 14:30 GMT (20:00/8 PM in GMT+5:30)');
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

      const reply = await interaction.reply({
        content: '🎣 Welcome to Stardust Pond — click to fish!',
        components: [row],
        fetchReply: true
      });

      fishingData.buttonMessageId = reply.id;
      fishingData.buttonChannelId = interaction.channelId;
      saveData();
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === 'fish_button') {
      const userId = interaction.user.id;
      const username = interaction.member.displayName;
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

      try {
        if (fishingData.buttonMessageId && fishingData.buttonChannelId) {
          const channel = await client.channels.fetch(fishingData.buttonChannelId);
          const oldMessage = await channel.messages.fetch(fishingData.buttonMessageId);
          await oldMessage.delete();
        }
      } catch (error) {
        console.log('Could not delete old button message:', error.message);
      }

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('fish_button')
            .setLabel('🎣 Fish!')
            .setStyle(ButtonStyle.Primary)
        );

      const newButtonMessage = await interaction.channel.send({
        content: '🎣 Welcome to Stardust Pond — click to fish!',
        components: [row]
      });

      fishingData.buttonMessageId = newButtonMessage.id;
      fishingData.buttonChannelId = interaction.channelId;
      saveData();
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
