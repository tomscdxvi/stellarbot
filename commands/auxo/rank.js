const { EmbedBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRow, ActionRowBuilder } = require('discord.js');
const User = require('../../schemas/User');
const axios = require('axios');
const {pagination, ButtonTypes, ButtonStyles} = require('@devraelfreeze/discordjs-pagination');
const groq = require("../../utils/groqAi");
require('dotenv').config();

module.exports = {
    run: async ({ interaction, client }) => {
        if (!interaction.inGuild()) {
            interaction.reply({
                content: 'This command can only be executed inside a server',
                ephemeral: true,
            });
            return;
        }

        try {
            await interaction.deferReply();

            let user = await User.findOne({
                userId: interaction.member.id,
            });

            if (!user) {
                await interaction.editReply("You need to set up your initial weight and goal first! Use `/setweight`.");

                return;
            }

            const weight = user.weight;
            const goal = user.goal;
            const rank = user.rank;
            const difference = goal - weight;
            const today = new Date().toLocaleString();

            let previousDiff = user.history.length > 0 ? user.history[user.history.length - 1].diff : null;
            let previousRank = user.rank || "Bronze"; // Store old rank
            let fp = user.fp || 0;  // Fitness Points (FP)

            let embed1 = new EmbedBuilder()
                .setTitle('**Current Stats**')
                .setColor('Random');

            let embed2 = new EmbedBuilder()
                .setTitle('**Rank Up**')
                .setColor('Random');

            /*
            let embed3 = new EmbedBuilder()
                .setTitle('**Motivation!**')
                .setColor('Random');
            */

            // Embed 1
            embed1.setDescription(`
                ✅ Your current weight is **${weight} lbs** and your goal is **${goal} lbs**.\n \n🏆 Current Rank: **${rank}** | 🎖️ FP: **${fp}**
            `);

            embed2.setDescription(`
                Hello
            `)

            // Store embeds in an array
            const embeds = [embed1, embed2];  // Each embed is a page in pagination

            // Start pagination with these embeds
            await pagination({
                embeds: embeds, // Each embed is a separate page
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
        } catch (error) {
            console.log(`Error: ${error}`);
        }
    },
    data: {
        name: 'rank',
        description: 'Check your current rank and view your stats!',
    },
};
