const User = require('../../schemas/User');

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
            
            const users = await User.find();

            let userMap = users.map((user) => { return user._doc });
            

        } catch(error) {
            console.log(`Error: ${error}`);
        }
    },
    data: {
        name: 'leaderboard',
        'description': 'Displays the top 5 balance leaders in the server'
    }
}