const User = require('../../schemas/User');

const dailyAmount = 500;

module.exports = {

    run: async({ interaction }) => {
        if(!interaction.inGuild()) {
            interaction.reply({
                content: "This command can only be executed inside a server",
                ephemeral: true
            });
            return;
        };

        try {
            await interaction.deferReply();

            let user = await User.findOne({
                userId: interaction.member.id
            });

            if (user) {
                const lastDailyDate = user.lastDailyCollected?.toDateString();
                const currentDate = new Date().toDateString();

                if(lastDailyDate === currentDate) {
                    interaction.editReply("You have already collected your daily coins for today, please try again tomorrow!");
                    return;
                }
            } else {
                user = new User({
                    userId: interaction.member.id
                });
            }

            user.balance += dailyAmount;
            user.lastDailyCollected = new Date();

            await user.save();

            interaction.editReply(`${dailyAmount} has been deposited into your account!`);
        } catch(error) {
            console.log(`Error: ${error}`);
        }
    },
    data: {
        name: 'daily',
        'description': "Collect your daily coins."
    }
}