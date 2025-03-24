/*

const { EmbedBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRow, ActionRowBuilder } = require('discord.js');
const User = require('../../schemas/User');
const axios = require('axios');
const {pagination, ButtonTypes, ButtonStyles} = require('@devraelfreeze/discordjs-pagination');
const groq = require("../../utils/groqAi");
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

            if (user) {
                if (user.puuid != null) {
                    try {
                        await axios.get(getMatchHistory).then((res) => {
                            for (var i = 0; i < res.data.length; i++) {
                                matchHistory.push(res.data[i]);
                            }
                        });

                        // await interaction.editReply(`Here is your most recent match ${matchHistory[0]}`);
                    } catch (error) {
                        await interaction.editReply('An error has occurred while loading your recent match, please try again');

                        console.log(error);
                    }
                } else {
                    await interaction.editReply(
                        'You need to link your summoner id (/setsummoner) to your Discord account before using this command.'
                    );
                }
            } else {
                user = new User({
                    userId: interaction.member.id,
                });
            }

            let embed = new EmbedBuilder()
                .setTitle('**Most Recent TFT Games (5)**')
                .setColor('Random')
                .setFooter({ text: `StellarBot` })

            const historyLimit = 5;

            let matchHistoryDesc = '';

            for(let i = 0; i < historyLimit; i++) {
                matchHistoryDesc += `${i + 1}: Match Id<**${matchHistory[i]}**> \n`;
            }

            embed.setDescription(matchHistoryDesc);

            interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.log(`An error has occurred with the error: ${error}`);
        }
    },
    data: {
        name: 'matchhistory',
        description: 'See your recent matches',
    }
}

*/