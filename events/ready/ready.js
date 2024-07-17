const { ActivityType } = require('discord.js');
const User = require('../../schemas/User');
require('dotenv').config();

module.exports = (client) => {
    console.log(`${client.user.tag} is now online!`);

    client.user.setActivity('your coins disappear...', {
        type: ActivityType.Watching,
    });

    /*
    setInterval(() => { 
        c.channels.cache.get(process.env.DISCORD_CHANNEL_ID).send(randomMsg[random(0, randomMsg.length - 1)]);
    }, 5000); */
};
