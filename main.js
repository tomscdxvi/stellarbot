
const { Client, IntentsBitField, Guild } = require('discord.js');
const { CommandKit } = require('commandkit');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

new CommandKit({
    client,
    eventsPath: path.join(__dirname, 'events'),
    commandsPath: path.join(__dirname, 'commands'),
});


(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to Database!");

    /* 
    // Automatically set client commands to empty and CommandKit will refresh.
    client.on('ready', () => {
        client.application.commands.set([]);
    }); */

    client.login(process.env.DISCORD_AUTH_TOKEN);
})();