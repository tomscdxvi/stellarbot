/*
const User = require('../../schemas/User');
const Cooldown = require('../../schemas/Cooldown');
const groq = require("../../utils/groqAi");

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

            const commandName = "ask";
            const userId = interaction.user.id;
            let user = await User.findOne({
                userId: interaction.member.id
            });
            
            let cooldown = await Cooldown.findOne({ userId, commandName });

            const question = interaction.options.getString("question");
            
            const messages = [
                { 
                    role: "system", 
                    content: "You are a Discord ChatBot designed to engage with Users."
                },
                {
                    role: "user",
                    content: question
                },
            ];

            const getGroqChatCompletion = () => {
                return groq.chat.completions.create({
                    messages: messages,
                    model: "llama3-8b-8192",
                    temperature: 0.7,
                }).catch((error) => {
                    interaction.editReply("An error has occurred and the AI is currently having trouble with processing the prompt.");
                    console.log(error);
                })

            }

            const response = await getGroqChatCompletion();

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

            await Promise.all([ cooldown.save() ]);

            const responseText = response.choices[0]?.message?.content;
            const textLimit = 2000;
            
            if(responseText.length > textLimit) {
                interaction.editReply("The AI has reached Discord's max word limit, please try again with a different prompt.");
            } else {
                interaction.editReply(response.choices[0]?.message?.content || "");
            }
        } catch(error) {
            console.log(`Error: ${error}`);
        }
    },
    data: {
        name: 'ask',
        'description': "Ask me anything!",
        options: [
            {
                name: 'question',
                'description': 'Write the question you want to ask StellarBot',
                required: true,
                type: 3
            }
        ]
    }
}
*/