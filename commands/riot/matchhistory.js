const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
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

            let embed1 = new EmbedBuilder()
                .setTitle('**Most Recent TFT Game**')
                .setColor('Random');

            let embed2 = new EmbedBuilder()
                .setTitle('**Most Recent TFT Game**')
                .setColor('Random');

            const getMatch = `https://americas.api.riotgames.com/tft/match/v1/matches/${matchHistory[0]}?api_key=${process.env.RIOT_API_KEY}`;

            const matchData = {
                augments: [],
                level: "",
                placement: "",
                traitNames: [],
                traitUnits: []
            }

            let participantArray = [];
            
            try {
                await axios.get(getMatch).then((res) => {

                    for(let i = 0; i < res.data.info.participants.length; i++) {
                        participantArray.push(res.data.info.participants[i]);
                    }
    
                });
            } catch(error) {
                console.log(error);

                await interaction.editReply('An error has occurred...');
            }

            /*
            for(let i = 0; i < participantArray.length; i++) {
                    
                if(participantArray[i].puuid == user.puuid) {
                    
                    matchData.placement = participantArray[i].placement;
                }
            } */

            const foundParticipant = Object.values(participantArray).find(participant => participant.puuid === user.puuid);

            // Placement + Level
            matchData.placement = foundParticipant.placement;
            matchData.level = foundParticipant.level;

            // Placement Image 
            const placementImageArray = {
                1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Eo_circle_yellow_white_number-1.svg/1024px-Eo_circle_yellow_white_number-1.svg.png',
                2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Eo_circle_teal_white_number-2.svg/1024px-Eo_circle_teal_white_number-2.svg.png',
                3: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Eo_circle_deep-orange_white_number-3.svg/1024px-Eo_circle_deep-orange_white_number-3.svg.png',
                4: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Eo_circle_brown_white_number-4.svg/1024px-Eo_circle_brown_white_number-4.svg.png',
                5: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Eo_circle_blue-grey_white_number-5.svg/1024px-Eo_circle_blue-grey_white_number-5.svg.png',
                6: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Eo_circle_blue-grey_white_number-6.svg/1024px-Eo_circle_blue-grey_white_number-6.svg.png',
                7: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Eo_circle_blue-grey_white_number-7.svg/1024px-Eo_circle_blue-grey_white_number-7.svg.png',
                8: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Eo_circle_blue-grey_white_number-8.svg/1024px-Eo_circle_blue-grey_white_number-8.svg.png'
            }

            for(let i = 0; i <= 8; i++) {

                if(matchData.placement == i) {
                    embed1.setThumbnail(placementImageArray[i]);
                    embed2.setThumbnail(placementImageArray[i]);
                }
            }
            
            // Embed 1
            for(let i = 0; i < foundParticipant.augments.length; i++) {
                matchData.augments.push(foundParticipant.augments[i]);
            }

            let augmentDesc = '';
            
            for(let i = 0; i < matchData.augments.length; i++) {

                augmentDesc += `**Augment ${i + 1}: ${matchData.augments[i].split('_')[2].replace(/([A-Z0-9])/g, ' $1').trim()}**\n`;
            }

            embed1.setDescription(`
                **Level: ${matchData.level}** \n
                ${augmentDesc}
            `);

            // Embed 2
            for(let i = 0; i < foundParticipant.traits.length; i++) {

                if(foundParticipant.traits[i].tier_current >= 2) {
                    matchData.traitNames.push(foundParticipant.traits[i].name);
                    matchData.traitUnits.push(foundParticipant.traits[i].num_units);
                }
            }

            let traitDesc = '';
            
            for(let i = 0; i < matchData.traitNames.length; i++) {

                traitDesc += `**${matchData.traitUnits[i]} | ${matchData.traitNames[i].split('_')[1]}**\n`;
            }

            embed2.setDescription(`
                **Standard Comp:** ${matchData.traitNames[0].split('_')[1]}

                __**Traits**__
                ${traitDesc}
            `);

            embeds.push(embed1);
            embeds.push(embed2);
                
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

            // embed1.setFooter({ text: `Placement: ${matchData.placement}` });

            // interaction.editReply({ embeds: [embeds] });
        } catch (error) {
            console.log(`An error has occurred with the error: ${error}`);
        }
    },
    data: {
        name: 'matchhistory',
        description: 'See your recent matches',
    }
}