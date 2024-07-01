const { EmbedBuilder } = require('discord.js');
const User = require('../../schemas/User');
const Cooldown = require('../../schemas/Cooldown');

const generateRandomNumber = (x, y) => {
    const range = y - x + 1;
    const randomNumber = Math.floor(Math.random() * range);
    
    return randomNumber + x;
}

module.exports = {
    run: async({ client, interaction }) => {
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

            const { username, id } = interaction.user;
            let user = await User.findOne({
                userId: interaction.member.id
            });
            
            // Game Settings
            const difficulty = interaction.options.getInteger('difficulty');
            const mainCharacters = [':elf:', ':ninja:'];
            const randomizeMainCharacters = mainCharacters[generateRandomNumber(0, mainCharacters.length - 1)];
            
            /*
                Characters: 
                    Elf ->
                        Move Set: Regular Attack :magic_wand:, Fireball :fire:, Flee :dash:

                    Ninja -> 
                        Move Set: 
            */
            
            // Game Story Board (Embed Based)
            let embed = new EmbedBuilder().setTitle("Building your adventure...").setFooter({ text: `StellarBot` }).setColor("#00eaff")
            let desc = ``;

            if(randomizeMainCharacters == mainCharacters[0]) {
                desc =`
                    User: ${username} as ${randomizeMainCharacters}
                    Class: Elf
                    Difficulty: ${difficulty}
                `;
            } else {
                desc =`
                    User: ${username} as ${randomizeMainCharacters}
                    Class: Ninja
                    Difficulty: ${difficulty}
                `;
            } 

            embed.setDescription(desc);

            embed.addFields(
                {
                    name:'How to Play:', 
                    value:'Use ⬅ or ➡ to move progress through the story. \n \n Press ▶ to Start!.', 
                    inline: false
                }
            )
            


            interaction.editReply({ embeds: [embed]}).then(message => {
                message.react("▶");
            })
        } catch(error) {
            console.log(`An error has occurred with the error: ${error}`);
        }

    },
    data: {
        name: 'adventure',
        'description': 'Go on a story-based adventure on Discord!',
        options: [
            {
                name: 'difficulty',
                'description': 'Set the difficulty of the story (1 - 3)',
                minValue: 1,
                maxValue: 3,
                required: true,
                type: 4
            }
        ]
    }
}