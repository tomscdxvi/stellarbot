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

            const weight = interaction.options.getInteger('weight');
            const goal = interaction.options.getInteger('goal');

            // Validate weight input to ensure it's no greater than 999
            if (weight > 999 || goal > 999) {
                await interaction.editReply(
                    '❌ Your weight and goal must be a number less than or equal to 999.'
                );
                return;
            }

            const today = new Date().toLocaleString();

            const difference = goal - weight;

            if (user) {
                if (!user.weight && !user.goal) {
                    try {
                        await User.findOneAndUpdate(
                            {
                                userId: interaction.user.id,
                            },
                            {
                                weight: weight,
                                goal: goal,
                                history: [
                                    {                        
                                        date: today,
                                        weight: weight,
                                        diff: difference,
                                    }
                                ],
                                rank: "Bronze",
                                fp: 0
                            }
                        );

                    } catch (error) {
                        await interaction.editReply('An error has occurred...');

                        console.log(error);
                    }
                } else {
                    interaction.editReply(
                        'You have already set your weight and goal weight! To update these, please use the specific commands to change them.'
                    );
                    return;
                }
            } else {
                user = new User({
                    userId: interaction.member.id,
                    weight: weight,
                    goal: goal,
                    history: [
                        {                        
                            date: today,
                            weight: weight,
                            diff: difference,
                        }
                    ],
                    rank: "Bronze",
                    fp: 0
                });
            }

            await user.save();

            await interaction.editReply(
                'Weight and goal has been saved, you can now use the other commands!'
            );

        } catch (error) {
            console.log(`Error: ${error}`);
        }
    },
    data: {
        name: 'setweight',
        description: 'Set your initial weight and the goal weight you want to reach!',
        options: [
            {
                name: 'weight',
                description: 'Enter your current weight in lbs.',
                required: true,
                minValue: 1,
                type: 4,
            },
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
