const User = require('../../schemas/User');
const Cooldown = require('../../schemas/Cooldown');

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
            const user = interaction.options.getUser('user');
            const tipAmount = interaction.options.getInteger('amount');
            const userId = interaction.user.id;
            let interactionUser = await User.findOne({
                userId: interaction.member.id,
            });
            const balance = interactionUser.balance;
            const commandName = 'tip';

            let cooldown = await Cooldown.findOne({ userId, commandName });

            if (cooldown && Date.now() < cooldown.endsAt) {
                const { default: prettyMs } = await import('pretty-ms');

                interaction.editReply(
                    `You are on a cooldown, please try again after ${prettyMs(cooldown.endsAt - Date.now())}`
                );
                return;
            }

            if (!cooldown) {
                cooldown = new Cooldown({ userId, commandName });
            }

            if (tipAmount > balance) {
                await interaction.deferReply({ ephemeral: true });

                cooldown.endsAt = Date.now() + 5_000;
                await cooldown.save();

                return await interaction.editReply(
                    `You do not have enough to send :coin: ${tipAmount}`
                );
            }

            const getUserData = await User.findOneAndUpdate(
                {
                    userId: user.id,
                },
                {
                    $inc: {
                        balance: tipAmount,
                    },
                }
            );

            if (interaction.user.id === user.id) {
                await interaction.deferReply({ ephemeral: true });

                cooldown.endsAt = Date.now() + 5_000;
                await cooldown.save();

                return await interaction.editReply(
                    `You cannot send coins to yourself`
                );
            }

            if (!getUserData) {
                await interaction.deferReply({ ephemeral: true });

                cooldown.endsAt = Date.now() + 5_000;
                await cooldown.save();

                return await interaction.editReply(
                    `${user.username} is not in the system...`
                );
            }

            await interaction.deferReply();

            await User.findOneAndUpdate(
                {
                    userId: interaction.user.id,
                },
                {
                    $inc: {
                        balance: -tipAmount,
                    },
                }
            );

            cooldown.endsAt = Date.now() + 5_000;
            await cooldown.save();

            interaction.editReply(
                `You have sent :coin: ${tipAmount.toLocaleString()} to ${user.username}`
            );
        } catch (error) {
            console.log(`An error has occurred with the error: ${error}`);
        }
    },
    data: {
        name: 'tip',
        description: 'Send coins to other users.',
        options: [
            {
                name: 'user',
                description: 'Mention a user to send coins.',
                required: true,
                type: 6,
            },
            {
                name: 'amount',
                description: 'Enter the number of coins you want to send',
                required: true,
                minValue: 1,
                type: 4,
            },
        ],
    },
};
