
const { Client, IntentsBitField, Collection } = require('discord.js');
const fs = require('fs');
require('dotenv').config();


const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

const prefix = '-'

const token = process.env.DISCORD_AUTH_TOKEN;

var version = '1.2'

var servers = {};

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
} 

client.once('ready', (c) => {
    console.log(`${c.user.tag} is now online!`);
});

client.once('reconnecting',() => {
    console.log('Reconnecting StellarBot');
});

client.once('disconnect', () => {
    console.log('Disconnecting StellarBot');
});

client.login(token);