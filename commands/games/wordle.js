const { EmbedBuilder } = require('discord.js');
const User = require('../../schemas/User');
const Cooldown = require('../../schemas/Cooldown');

const words = ["moon", "butt", "human"];

/*
function shuffle(array) {
    let currentIndex = array.length;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
}
*/

module.exports = {
    run: async({ interaction }) => {
        if(!interaction.inGuild()) {
            interaction.reply({
                content: "This command can only be executed inside a server",
                ephemeral: true
            });
            return;
        };
        
        try {
            await interaction.deferReply();

            let user = await User.findOne({
                userId: interaction.member.id
            });

            let embed = new EmbedBuilder()
                .setTitle("Guess the word!")
                //.setDescription(`Guess the word...`)
                .setFooter({ text: `StellarBot` })
                .setColor("#00eaff")

            interaction.editReply({ embeds: [embed]});

            const filter = m => m.author.id === interaction.user.id

            // Randomize words array and pop the last word in the array into word   
            words.sort(() => 0.5 - Math.random());
            const word = [words.pop()];

            let wordle = new Map();
            

            interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors:['time'] })
                .then(async (collected) => {
                    if(collected.first().content == (word)) {
                        interaction.channel.send(`Correct!`);

                        //cooldown.endsAt = Date.now() + 5_000;
                        //await cooldown.save();
                    } else {
                        interaction.channel.send("Not that one!");

                        //cooldown.endsAt = Date.now() + 5_000;
                        //await cooldown.save();
                    }
            }).catch(async () => {
                await interaction.editReply({ content:'You did not guess in time!', embeds: []});

                //cooldown.endsAt = Date.now() + 5_000;
                //await cooldown.save();
            });

            if(!user) {
                user = new User({ userId });
            }
        } catch(error) {
            console.log(`Error: ${error}`);
        }
    },
    data: {
        name: 'wordle',
        'description': 'Play wordle and win some coins!'
    }
}