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

            if(!user) {
                await interaction.editReply("You do not have an account set-up yet, please use /setweight to get started.");
                return;
            }

            const history = user.history;

            if(!history || !Array.isArray(history) || history.length === 0) {
                await interaction.editReply("No history found. Start tracking your weight with `/setweight` or `/track`!");
                return;
            }

            let embed = new EmbedBuilder()
                .setTitle('**Recent History**')
                .setColor('Random')
                .setFooter({ text: `StellarBot` });

            const historyLimit = 5; // Prevent out-of-bounds errors
            let matchHistoryDesc = '';

            for (let i = history.length - 1; i > 3; i--) {
                matchHistoryDesc += `${history[i].date || "Unknown Date"} | **${history[i].weight} lbs**\n`;
            }

            embed.setDescription(matchHistoryDesc);
            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.log(`An error has occurred with the error: ${error}`);
        }
    },
    data: {
        name: 'history',
        description: 'See your recent gains',
    }
}
