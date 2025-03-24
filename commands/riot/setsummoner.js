/*

const User = require('../../schemas/User');
const axios = require('axios');
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

            const name = interaction.options.getString('name');
            const tagline = interaction.options.getString('tagline');

            const getSummonerPuuid = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${name}/${tagline}?api_key=${process.env.RIOT_API_KEY}`;

            const summonerData = {
                puuid: '',
                name: '',
                tagline: '',
            };

            if (user) {
                if (user.puuid == null) {
                    try {
                        await axios.get(getSummonerPuuid).then((res) => {
                            summonerData.puuid = res.data.puuid;
                            summonerData.name = res.data.gameName;
                            summonerData.tagline = res.data.tagLine;
                        });

                        await User.findOneAndUpdate(
                            {
                                userId: interaction.user.id,
                            },
                            {
                                puuid: summonerData.puuid,
                            }
                        );

                        await interaction.editReply(
                            'Summoner has been saved onto your Discord account, you can now use the other commands!'
                        );
                    } catch (error) {
                        await interaction.editReply('An error has occurred...');

                        console.log(error);
                    }
                } else {
                    await interaction.editReply(
                        'There is an existing summoner associated with your Discord account, please contact the support team to update it.'
                    );
                }
            } else {
                user = new User({
                    userId: interaction.member.id,
                });
            }
        } catch (error) {
            console.log(`An error has occurred with the error: ${error}`);
        }
    },
    data: {
        name: 'setsummoner',
        description:
            'Set your summoner in-game name and tagline to your account',
        options: [
            {
                name: 'name',
                description: 'Set your in-game name',
                required: true,
                type: 3,
            },
            {
                name: 'tagline',
                description: 'Set your in-game tagline',
                required: true,
                type: 3,
            },
        ],
    },
};

*/