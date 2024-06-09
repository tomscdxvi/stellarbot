const { EmbedBuilder } = require('discord.js');
const User = require('../../schemas/User');

module.exports = {
    run: async({ interaction, client }) => {
        if(!interaction.inGuild()) {
            interaction.reply({
                content: "This command can only be executed inside a server",
                ephemeral: true
            });
            return;
        };

        try {
            await interaction.deferReply();
            
            const { username, id } = interaction.user;
            let user = await User.findOne({
                userId: interaction.member.id
            });
            const balance = user.balance.toLocaleString();

            let embed = new EmbedBuilder()
                .setTitle("**Top 5 Highest Balances Leaderboard**")
                .setFooter({ text: `You are not ranked yet` })
                .setColor("#F1C40F")

            const members = await User
                .find() // Find everyone in the database
                .sort({ balance: -1 }) // Sort the users in the database by the balance - 1 (From highest to lowest)
                .catch((err) => console.log(err)) 

            // Find the index for the user initializing the command by filtering through all members and find the one that equals member.userId === id.
            const memberIndex = members.findIndex((member) => member.userId === id); 

            embed.setFooter({ text: `${username}, you are ranked #${memberIndex + 1} with ${balance} :coin:`});

            const topFive = members.slice(0, 5);

            let desc = "";

            for(let i = 0; i < topFive.length; i++) {
                let { user } = await interaction.guild.members.fetch(topFive[i].userId);

                if(!user) return;

                let userBalance = topFive[i].balance.toLocaleString();

                desc += `**${ i + 1}. ${user.username}** ${userBalance} :coin:\n`;
            }

            if(desc !== "") {
                embed.setDescription(desc);
            }

            await interaction.editReply({ embeds: [embed] });

        } catch(error) {
            console.log(`Error: ${error}`);
        }
    },
    data: {
        name: 'leaderboard',
        'description': 'Displays the top 5 balance leaders in the server'
    }
}