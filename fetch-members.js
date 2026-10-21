const { Client, GatewayIntentBits } = require('discord.js');

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

    await guild.members.fetch();

    const memberData = guild.members.cache.map(member => ({
      username: member.user.username,
      displayName: member.displayName,
      id: member.id,
      status: member.presence?.status || 'offline',
      pfp: member.user.displayAvatarURL({ extension: 'png', size: 256 })
    }));

    // Upload member list to npoint.io
    const response = await fetch(`https://api.npoint.io/${process.env.NPOINT_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData)
    });

    if (response.ok) {
      console.log(`Successfully updated ${memberData.length} members to npoint!`);
    } else {
      console.error('Failed to update npoint JSON.');
    }
  } catch (err) {
    console.error('Error fetching members:', err);
  } finally {
    client.destroy();
    process.exit(0);
  }
});

client.login(process.env.BOT_TOKEN);
