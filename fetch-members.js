const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ]
});

client.once('ready', async () => {
  try {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) {
      console.error('Guild not found!');
      process.exit(1);
    }

    await guild.members.fetch({ force: true });

    const memberData = guild.members.cache.map(member => ({
      username: member.user.username,
      displayName: member.displayName || member.user.username,
      id: member.user.id,
      status: member.presence?.status || 'offline',
      pfp: member.user.displayAvatarURL({ extension: 'png', size: 256 })
    }));

    // Save directly to members.json file
    fs.writeFileSync('members.json', JSON.stringify(memberData, null, 2));
    console.log(`Saved ${memberData.length} members to members.json!`);

  } catch (err) {
    console.error('Error fetching members:', err);
  } finally {
    client.destroy();
    process.exit(0);
  }
});

client.login(process.env.BOT_TOKEN);
