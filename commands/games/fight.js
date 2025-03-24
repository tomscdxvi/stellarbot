/*

const fight = require('discord-fight-game');

module.exports = {
    run: async ({ client, interaction }) => {
        if (!interaction.inGuild()) {
            interaction.reply({
                content: 'This command can only be executed inside a server',
                ephemeral: true,
                thinking: true,
            });
            return;
        }

        try {
            const game = new fight(client);

            let user = interaction.options.getUser('user');

            interaction.author = interaction.user;

            if (!user) {
                game.solo(interaction);
            } else {
                game.duo(interaction, user);
            }
        } catch (error) {
            console.log(`An error has occurred with the error: ${error}`);
        }
    },
    data: {
        name: 'fight',
        description: 'Battle against your friends to win coins!',
        options: [
            {
                name: 'user',
                description: 'Mention a user to battle',
                required: false,
                type: 6,
            },
        ],
    },
};

*/
