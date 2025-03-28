const User = require('../../schemas/User');

module.exports = {
    run: async ({ interaction }) => {
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
                await interaction.editReply("You need to set up your initial weight and goal first! Use /setweight.");
                return;
            }

            const goal = interaction.options.getInteger('goal');

            // Validate weight input to ensure it's no greater than 999
            if (goal > 999) {
                await interaction.editReply(
                    '❌ Your goal must be a number less than or equal to 999.'
                );

                return;
            }

            if (user) {
                try {
                    await User.findOneAndUpdate(
                        {
                            userId: interaction.user.id,
                        },
                        {
                            goal: goal,
                        }
                    );

                } catch (error) {
                    await interaction.editReply('An error has occurred...');

                    console.log(error);
                }
            } 

            await interaction.editReply(
                'New goal has been saved!'
            );

        } catch (error) {
            console.log(`Error: ${error}`);
        }
    },
    data: {
        name: 'setgoal',
        description: 'Update your goal weight you want to reach!',
        options: [
            {
                name: 'goal',
                description: 'Enter your goal in lbs.',
                required: true,
                minValue: 1,
                type: 4,
            },
        ],
    },
};
