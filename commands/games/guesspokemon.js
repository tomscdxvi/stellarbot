/*

const { EmbedBuilder } = require('discord.js');
const User = require('../../schemas/User');
const Cooldown = require('../../schemas/Cooldown');

module.exports = {
    run: async ({ interaction }) => {
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

            var randomize = Math.floor(Math.random() * 1118) + 1;
            const options = `https://pokeapi.co/api/v2/pokemon/${randomize}`;

            const commandName = 'guesspokemon';
            const userId = interaction.user.id;
            let user = await User.findOne({
                userId: interaction.member.id,
            });

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

            // Game Code Below
            fetch(options)
                .then((res) => res.json())
                .then(async (data) => {
                    let embed = new EmbedBuilder()
                        .setTitle(
                            'Guess the name of this pokemon in 30 seconds!'
                        )
                        .setDescription(
                            `What is the name of this pokemon? (In lowercase)`
                        )
                        .setThumbnail(data.sprites.front_default)
                        .setFooter({ text: `StellarBot` })
                        .setColor('#00eaff');

                    interaction.editReply({ embeds: [embed] });

                    const filter = (m) => m.author.id === interaction.user.id;

                    interaction.channel
                        .awaitMessages({
                            filter,
                            max: 1,
                            time: 30000,
                            errors: ['time'],
                        })
                        .then((collected) => {
                            fetch(options)
                                .then((res) => res.json())
                                .then(async (data) => {
                                    if (
                                        collected.first().content == data.name
                                    ) {
                                        cooldown.endsAt = Date.now() + 10_000;
                                        await Promise.all([cooldown.save()]);

                                        interaction.channel.send(
                                            `Correct! The name of the pokemon was ${data.name}...`
                                        );
                                    } else {
                                        const { default: prettyMs } =
                                            await import('pretty-ms');
                                        cooldown.endsAt = Date.now() + 10_000;
                                        await cooldown.save();

                                        interaction.channel.send(
                                            `Wrong! Try another one in ${prettyMs(cooldown.endsAt - Date.now())}`
                                        );
                                    }
                                });
                        })
                        .catch(async () => {
                            await interaction.editReply({
                                content: `You did not guess in time...`,
                                embeds: [],
                            });

                            cooldown.endsAt = Date.now() + 5_000;
                            await cooldown.save();
                        });
                });

            if (!user) {
                user = new User({ userId });
            }

            await Promise.all([cooldown.save()]);
        } catch (error) {
            console.log(`Error: ${error}`);
        }
    },
    data: {
        name: 'guesspokemon',
        description: 'Guess the name of the random pokemon to win coins!',
    },
};

*/
