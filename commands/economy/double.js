const User = require('../../schemas/User');
const Cooldown = require('../../schemas/Cooldown');

// Generate a random number between x and y.
const generateRandomNumber = (x, y) => {
    const range = y - x + 1;
    const randomNumber = Math.floor(Math.random() * range);
    
    return randomNumber + x;
}

module.exports = {

    run: async({ interaction }) => {
        if(!interaction.inGuild()) {
            interaction.reply({
                content: "This command can only be executed inside a server",
                ephemeral: true,
                thinking: true
            });
            return;
        };

        try {
            await interaction.deferReply();

            const commandName = "double";
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

            const chance = generateRandomNumber(0, 100);

            if(chance < 95) {

                await interaction.editReply(`You did not get to double your balance this time!`);
            
                cooldown.endsAt = Date.now() + 5_000;
                await cooldown.save();

                return;
            } 

            const double = user.balance * 2;

            if(!user) {
                user = new User({ userId });
            }

            user.balance = double;
            cooldown.endsAt = Date.now() + 5_000;

            await Promise.all([ cooldown.save(), user.save() ]);

            interaction.editReply(`Congrats! Your current balance is now :coin: ${user.balance.toLocaleString()}`);

        } catch(error) {
            console.log(`Error: ${error}`);
        }
    },
    data: {
        name: 'double',
        'description': "You have a chance to double your balance."
    }
}