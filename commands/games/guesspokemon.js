const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const User = require('../../schemas/User');
const Cooldown = require('../../schemas/Cooldown');

const words = ["car", "moon"];

function shuffle(array) {
    let currentIndex = array.length;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
}

var dex = Math.floor((Math.random() * 921) + 1);
var random = Math.floor((Math.random() * 5) + 1);

const options = `https://pokeapi.co/api/v2/pokemon/${dex}`;

module.exports = {
    run: async({ interaction }) => {
        if(!interaction.inGuild()) {
            interaction.reply({
                content: "This command can only be executed inside a server",
                ephemeral: true,
                thinking: true
            });
            return;
        }; 

        try {
            await interaction.deferReply();

            const commandName = "guesspokemon";
            const userId = interaction.user.id;
            let user = await User.findOne({
                userId: interaction.member.id
            });
            
            /* 
            let cooldown = await Cooldown.findOne({ userId, commandName });

            if (cooldown && Date.now() < cooldown.endsAt) {
                const { default: prettyMs } = await import('pretty-ms');

                interaction.editReply(`You are on a cooldown, please try again after ${prettyMs(cooldown.endsAt - Date.now())}`);
                return;
            }
            
            if(!cooldown) {
                cooldown = new Cooldown({ userId, commandName });
            }

            */

            // Game Code Below

            axios.get(options).then(async body => {
                let Embed = new EmbedBuilder()
                    .setTitle("A Wild pokemon has appeared")
                    .setDescription(`Quick, catch that pokemon!`)
                    .setThumbnail(body.sprites.front_default)
                    .setFooter(body.name)
                    .setColor("#00eaff")
                interaction.editReply(Embed);
                const filter = m => userId === interaction.member.id
                await interaction.editReply(filter, { max: 1, time: 60000, errors: ['time'] }) // 1 minute timer & max of 1 attempt at answering
                    .then(collected => {
                        axios.get(options).then(body => {
                            if (collected.first().content == (body.name)) {
                                message.reply("You just caught a " + body.name);
                            } else {
                                message.reply("Not that one!");
                            }
                        })
                    }).catch(() => message.reply('you did not guess in time!'));
                });

            /*
            if(random===5) {
                options.get().then(body => {
                    let Embed = new EmbedBuilder()
                        .setTitle("A Wild pokemon has appeared")
                        .setDescription(`Quick, catch that pokemon!`)  
                        .setThumbnail(body.sprites.front_default)
                        .setFooter(body.name)
                        .setColor("#00eaff")
                    interaction.editReply(`${Embed}`);
                }).get(options).then(body => {
                    if(interaction.reply == (body.name)){
                        interaction.editReply(`You just caught a ${body.name}`);
                    } else {
                        interaction.editReply("Not that one!");
                    }
                });
            }
            */ 

            if(!user) {
                user = new User({ userId });
            }
            
            /*
            cooldown.endsAt = Date.now() + 10_000;

            await Promise.all([ cooldown.save(), user.save() ]);

            interaction.editReply(`Congrats! Your current balance is now ${user.balance}`);

            */

        } catch(error) {
            console.log(`Error: ${error}`);
        }
    },
    data: {
        name: 'guesspokemon',
        'description': 'Guess the name of the random pokemon to win coins!'
    }
}