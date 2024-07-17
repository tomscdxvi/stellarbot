const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
} = require('discord.js');
const Paginator = require('./paginator');

module.exports = async (interaction, pages, pageSize) => {
    try {
        if (!interaction || !pages || !pages > 0)
            throw new Error(`[Pagination] Invalid Arguments`);

        if (pages.length === 1) {
            await interaction.editReply({
                embeds: [],
                components: [],
                fetchReply: true,
            });
        }

        let index = 1;

        let paginator = new Paginator(pages, pageSize);

        const first = new ButtonBuilder()
            .setCustomId('first-page')
            .setEmoji('↩️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);

        const previous = new ButtonBuilder()
            .setCustomId('previous-page')
            .setEmoji('⬅️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);

        const pageCount = new ButtonBuilder()
            .setCustomId('page-count')
            .setLabel(`${index + 1}/${pages.length}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);

        const next = new ButtonBuilder()
            .setCustomId('next-page')
            .setEmoji('➡️')
            .setStyle(ButtonStyle.Primary);

        const last = new ButtonBuilder()
            .setCustomId('last-page')
            .setEmoji('↪️')
            .setStyle(ButtonStyle.Primary);

        const buttons = new ActionRowBuilder().addComponents([
            first,
            previous,
            pageCount,
            next,
            last,
        ]);

        const msg = await interaction.editReply({
            embeds: [pages[index]],
            components: [buttons],
            fetchReply: true,
        });

        const collector = await msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time,
        });

        collector.on('collect', async (i) => {
            if (i.user.id != interaction.user.id) {
                return await i.reply({
                    content: `Only ${interaction.user.username} can use these buttons...`,
                    ephemeral: true,
                });
            }

            await i.deferUpdate();

            if (i.customId === 'first-page') {
                paginator.first();

                pageCount.setLabel(`${index + 1}/${pages.length}`);
            }

            if (i.customId === 'previous-page') {
                paginator.previous();

                pageCount.setLabel(`${index + 1}/${pages.length}`);
            } else if (i.customId === 'next-page') {
                paginator.next();

                pageCount.setLabel(`${index + 1}/${pages.length}`);
            } else if (i.customId === 'last-page') {
                paginator.last();

                pageCount.setLabel(`${index + 1}/${pages.length}`);
            }

            if (index === 1) {
                first.setDisabled(true);
                previous.setDisabled(true);
            } else {
                first.setDisabled(false);
                previous.setDisabled(false);
            }

            if (index === pages.length - 1) {
                next.setDisabled(true);
                last.setDisabled(true);
            } else {
                next.setDisabled(false);
                last.setDisabled(false);
            }

            await msg
                .edit({ embeds: [pages[index]], components: [buttons] })
                .catch((error) => {
                    console.log(error);
                });

            collector.resetTimer();
        });

        collector.on('end', async () => {
            await msg
                .edit({ embeds: [pages[index]], components: [] })
                .catch((error) => {
                    console.log(error);
                });
        });

        return msg;
    } catch (error) {
        console.log(error);
    }
};
