const { EmbedBuilder } = require('discord.js');
const User = require('../../schemas/User');
const axios = require('axios');
const {pagination, ButtonTypes, ButtonStyles} = require('@devraelfreeze/discordjs-pagination');
require('dotenv').config();

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
            await interaction.deferReply();

            const userId = interaction.user.id;
            let user = await User.findOne({
                userId: interaction.member.id,
            });

            const getMatchHistory = `https://americas.api.riotgames.com/tft/match/v1/matches/by-puuid/${user.puuid}/ids?start=0&count=20&api_key=${process.env.RIOT_API_KEY}`;

            const matchHistory = [];
            const embeds = [];

            if (user) {
                if (user.puuid !== null) {
                    try {
                        await axios.get(getMatchHistory).then((res) => {
                            for (var i = 0; i < res.data.length; i++) {
                                matchHistory.push(res.data[i]);
                            }
                        });

                        // await interaction.editReply(`Here is your most recent match ${matchHistory[0]}`);
                    } catch (error) {
                        await interaction.editReply('An error has occurred...');

                        console.log(error);
                    }
                } else {
                    await interaction.editReply(
                        'You need to link your summoner id to your Discord account before using this command.'
                    );
                }
            } else {
                user = new User({
                    userId: interaction.member.id,
                });
            }

            let embed = new EmbedBuilder()
                .setTitle('**Last 5 TFT Games**')
                .setFooter({ text: `StellarBot` })
                .setColor('#F1C40F');

            const itemsPerPage = 5;
            const numberOfPages = Math.ceil(matchHistory.length / itemsPerPage);

            let desc = '';

            for (let i = 0; i < itemsPerPage; i++) {
                desc += `**${i + 1}. ${matchHistory[i]}**\n`;
            }

            if (desc !== '') {
                embed.setDescription(desc);
            }
            
            /*
            for (var i = 0; i < numberOfPages; i++) {
                embeds.push(embed);
            }
                
            await pagination({
                embeds: embeds,
                author: interaction.member.user,
                interaction: interaction,
                ephemeral: true,
                time: 40000,
                disableButtons: false,
                fastSkip: false,
                pageTravel: false,
                buttons: [
                    {
                        type: ButtonTypes.previous,
                        label: '',
                        style: ButtonStyles.Primary
                    },
                    {
                        type: ButtonTypes.next,
                        label: '',
                        style: ButtonStyles.Success
                    },
                ]
            });

            */

            interaction.editReply({ embeds: [embed] })
        } catch (error) {
            console.log(`An error has occurred with the error: ${error}`);
        }
    },
    data: {
        name: 'matchhistory',
        description: 'See your recent matches',
    }
}