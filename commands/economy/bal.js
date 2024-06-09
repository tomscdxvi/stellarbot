const User = require('../../schemas/User');
const Cooldown = require('../../schemas/Cooldown');

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

            const commandName = "bal";
            const userId = interaction.user.id;
            let user = await User.findOne({
                userId: interaction.member.id
            });
            
            let cooldown = await Cooldown.findOne({ userId, commandName });

            if (cooldown && Date.now() < cooldown.endsAt) {
                const { default: prettyMs } = await import('pretty-ms');

                interaction.editReply(`You are on a cooldown, please try again after ${prettyMs(cooldown.endsAt - Date.now())}`);
                return;
            }
            
            if(!cooldown) {
                cooldown = new Cooldown({ userId, commandName });
            }
            
            if(!user) {
                user = new User({ userId });
            }

            cooldown.endsAt = Date.now() + 5_000;

            await Promise.all([ cooldown.save(), user.save() ]);

            interaction.editReply(`Your current balance is :coin: ${user.balance.toLocaleString()}`);
        } catch(error) {
            console.log(`Error: ${error}`);
        }
    },
    data: {
        name: 'bal',
        'description': "Display your current balance."
    }
}