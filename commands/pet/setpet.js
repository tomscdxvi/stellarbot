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

            if (user) {
                if (user.pet != null) {
                    interaction.editReply(
                        'You have already set your initial pet!'
                    );
                    return;
                }
            } else {
                user = new User({
                    userId: interaction.member.id,
                });
            }

            const chance = generateRandomNumber(0, 100);

            if (chance < 50) {
                await interaction.editReply(
                    `You did not get to double your daily :coin: this time! :coin: ${dailyAmount} has been deposited into your account!`
                );

                user.balance += dailyAmount;
                user.lastDailyCollected = new Date();

                await user.save();

                return;
            } else {
                await interaction.editReply(
                    `Congrats! Your daily :coin: has been doubled. :coin: ${double} has been deposited into your account!`
                );

                user.balance += double;
                user.lastDailyCollected = new Date();

                await user.save();

                return;
            }
        } catch (error) {
            console.log(`Error: ${error}`);
        }
    },
    data: {
        name: 'setpet',
        description: 'Set your initial pet!',
    },
};