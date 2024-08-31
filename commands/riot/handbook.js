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


            const standardComps = [
                "Brusier Kaisa", 
                "Built Diff", 
                "Fated Dryad", 
                "Mythic Invoker",
                "Reapers",
                "Sage Lillia",
                "Sniper Warden",
                "Vertical Storyweaver",
                "Duelists",
                "Heavenly Kayn",
                "Vertical Inkshadow"
            ]

            let embed1 = new EmbedBuilder()
                .setTitle('**Standard Comps**')
                .setColor('Random');


        } catch(error) {
            await interaction.editReply("An error has occurred, please try again!");
        }
    },
    data: {
        data: {
            name: 'handbook',
            description: 'See the top comps in TFT',
        }
    }
}