const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const { execute } = require('./main');

const queue = new Map();


module.exports = 
{
    name: 'play',
    aliases: ['skip', 'stop'],
    cooldown: 0,
    description: 'Play command',

    async execute(message, args, cmd, client, Discord)
    {
        const voice_channel = message.member.voice.channel;

        if(!voice_channel) return message.channel.send('A user has to be in a channel to use this command.');
        
        const permissions = voice_channel.permissionsFor(message.client.user);

        if(!permissions.has('CONNECT')) return message.channel.send('You do not have the right permissions.');

        const server_queue = queue.get(message.guild.id);
    }
}