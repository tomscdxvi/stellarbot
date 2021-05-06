const Discord = require('discord.js');

const client = new Discord.Client();

const queue = new Map();

const ytdl = require('ytdl-core');

const prefix = '-'
  
const fs = require('fs');

const token = '';

var version = '1.2'

var servers = {};

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('Stellar On');
});
client.once('reconnecting',() => {
    console.log('Reconnecting StellarBot');
});
client.once('disconnect', () => {
    console.log('Disconnecting StellarBot');
});

    client.on("message", async message => {

        if (message.author.bot) return;
        if (!message.content.startsWith(prefix)) return;

        const serverQueue = queue.get(message.guild.id);

        if (message.content.startsWith(`${prefix}play`)) {
            execute(message, serverQueue);
            return;

        }else if (message.content.startsWith(`${prefix}skip`)) {
            skip(message, serverQueue);
            return;
        }else if (message.content.startsWith(`${prefix}stop`)){
            return;
        }else {
            message.channel.send("Use the right commands");
        }
    });

        async function execute(message, serverQueue) {
            const args = message.content.split(" ");
            
            if (message.member.voice.channel) {
                message.member.voice.channel.join()
                  .then(connection => { 
                    message.reply('I have made it to this channel');
                  })
                  .catch(console.log);
              } else {
                message.reply('You need to join a voice channel first!');
              };

            const permissions = voice.channel.permissionsFor(message.client.user);
            if(!permission.has("CONNECT") || !permissions.has("SPEAK")) {
                return message.channel.send(
                    "Give me permissions so I am able to speak in this voice channel"
                );
            }
        
        
                const songInfo = await ytdl.getInfo(args[1]);
                const song = {
                    title: songInfo.title,
                    url: songInfo.video_url,
                };
        
        if(!serverQueue) {
            const queueConstruct = {
                textChannel: message.channel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true,
        };

            queue.set(message.guild.id, queueConstruct);

            queueConstruct.songs.push(song);

            try {
                var connection = await voice.channel.join();
                queueConstruct.connection = connection;
                play(message.guild, queueConstruct.songs[0]);
            } catch (err) {
                console.log(err);
                queue.delete(message.guild.id);
                return message.channel.send(err);
            }
        }else {
            serverQueue.songs.push(song);
            return message.channel.send(`${song.title} was put into the queue`);
        }
    
            function playStream(guild, song) {
                const serverQueue = queue.get(guild.id);
                if(!song) {
                    serverQueue.voice.channel.leave();
                    queue.delete(guild.id);
                    return;
                }
            }
        
            const dispatcher = serverQueue.connection
            .playStream(ytdl(song.url))
            .on("finish", () => {
                serverQueue.songs.shift();
                play(guild, serverQueue.songs[0]);
            })
            .on("error", error => console.error(error));
            dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
            serverQueue.textChannel.send(`Playing: [${song.title}]`);
        
            function skip(message, serverQueue) 
            {
                if(!message.member.voice.channel)
                    return message.channel.send(
                        "StellarBot has to be on for this command to work"
                    );
                if (!serverQueue)
                        return message.channel.send("StellarBot could not find a song to skip");
                serverQueue.connection.dispatcher.end();
            }

            function stop(message, serverQueue) 
            {
                if(!message.member.voice.channel)
                    return message.channel.send(
                        "StellarBot has to be on for this command to work"
                    );
                serverQueue.songs = [];
                serverQueue.connection.dispatcher.end();
            }
            
            if (command.cooldown)
            {
                if(!cooldowns.has(command.name))
                {
                    cooldowns.set(command.name, new Discord.Collection());
                }

                const current_time = Date.now();
                const time_stamps = cooldowns.get(command.name);
                const cooldown_amount = (command.cooldown) * 1000;

                if (time_stamps.has(message.author.id))
                {
                    const expiration_time = times_stamps.get(message.author.id) + cooldown_amount;
                    
                    if (current_time < expiration_time)
                    {
                        const time_left = (expiration_time = current_time) / 1000;

                        return message.reply('Please wait' + time_left.toFixed(1) + ' more seconds before using ' + command.name);
                    }
                }

                time_stamps.set(message.author.id, current_time);

                setTimeout(() => time_stamps.delete(message.author.id), cooldown_amount);
            }
        }
    client.login(token);