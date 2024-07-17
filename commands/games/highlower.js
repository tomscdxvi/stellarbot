const {
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ComponentType,
} = require('discord.js');
const User = require('../../schemas/User');
const Cooldown = require('../../schemas/Cooldown');

/* Blackjack game rules
    52 cards (10, 10, 10, 10) & face cards = J, Q, K (12)
    
    1: Generate and shuffle deck on start
    2: Prompt user to place a bet (< 2)
    3: After bets are placed, the player draws one card
    4: The bot draws one card but its unknown to the player
    5: The player draws the second card
    6: The bot draws another card face-up this time
    7: Player is now allowed to hit or stand
    8: The bot now shows both cards and will now hit until 16 (Which is an auto stand)
    
    Win Conditions: 
        If the bot is at 16, the bot has to stand no matter what (So if the player has 17, they auto win)
        If the bot goes over 21, the bot auto loses
        If the bot gets 21, the bot auto wins
        If the bot's final total number is higher than the players, the bot wins
        
        If the player goes over 21, the player auto loses
        If the player gets 21, the player auto wins
        If the player's final total number is higher than the bots, the player wins.

    Constraints:
        If the player or bot draws an Ace and if the Ace brings their total over 21, it is considered a 1.
        If the bot's total == 16 && the player's total is > 16, the bot loses
        If the bot's total == 16 && the player's total is < 16, the bot wins
        If the bot's total > 21, the bot loses
        If the player's total == 21, the player wins
        If the player's total > 21, the player loses

*/

var suits = ['♠', '♥', '♣', '♦'];
var ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
var deck = [];
var dealerHand = [];
var dealerHandValue = 0;

const generateDeck = () => {
    // Reinitialize and empty the deck for a new game.
    deck = [];

    // For each suit in suits
    for (let suit in suits) {
        // For each rank in ranks
        for (let rank in ranks) {
            // Push each into the deck
            deck.push(ranks[rank] + suits[suit]);
        }
    }

    // Shuffle deck after the deck has been generated using Fisher-Yates Shuffle Algorithm
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
};

const drawIntoDealer = () => {
    var randomIndex = Math.floor(Math.random() * deck.length);
    var card = deck.splice(randomIndex, 1)[0];

    dealerHand.push(card);

    // If card.length === 2 (This means the end of the length is equal to 2), that means the number cannot be 10 so we find the value from that condition
    if (card.length === 2) {
        if (card[0] === 'J' || card[0] === 'Q' || card[0] === 'K') {
            dealerHandValue += 10;
        } else if (card[0] === 'A') {
            dealerHandValue += 1;
        } else {
            dealerHandValue += Number(card[0]);
        }
    } else {
        // This handles the condition if the card is 10, set the value to 10.
        dealerHandValue += 10;
    }

    return dealerHand;
};

// Generate a random number between x and y.
const generateRandomNumber = (x, y) => {
    const range = y - x + 1;
    const randomNumber = Math.floor(Math.random() * range);

    return randomNumber + x;
};

// Action Buttons
const higherButton = new ButtonBuilder()
    .setLabel('Higher')
    .setStyle(ButtonStyle.Primary)
    .setCustomId('higher-button');
const lowerButton = new ButtonBuilder()
    .setLabel('Lower')
    .setStyle(ButtonStyle.Success)
    .setCustomId('lower-button');

const gameRow = new ActionRowBuilder().addComponents(higherButton, lowerButton);

const timeout = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

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

            const commandName = 'highlower';
            const userId = interaction.user.id;
            let user = await User.findOne({
                userId: interaction.member.id,
            });

            const percent = interaction.options.getInteger('percent');
            const percentage = ((percent / 100) * user.balance).toFixed(0);
            const totalInString = (
                (percent / 100) *
                user.balance
            ).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            });

            // interaction.editReply("Currently disabled for maintenance...");

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

            if (user.balance < percentage) {
                interaction.editReply(
                    `You do not have enough to play ${percentage} `
                );

                return;
            }

            const chance = generateRandomNumber(2, 10);

            interaction.editReply({
                content: `The value of my card is hidden to you, do you think it is higher or lower than ${chance}`,
                components: [gameRow],
            });

            const collector =
                interaction.channel.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    time: 60000,
                });

            collector.on('collect', async (interaction) => {
                dealerHandValue = 0;

                // Generate deck at the start of the command.
                generateDeck();

                if (interaction.customId === 'higher-button') {
                    if (interaction.user != interaction.member) {
                        await interaction.deferReply({ ephemeral: true });

                        return await interaction.editReply(
                            `You cannot click within this event...`
                        );
                    } else {
                        await interaction.deferUpdate();

                        drawIntoDealer();
                        const amount = percentage;
                        const bet = user.balance - amount;
                        user.balance = bet;

                        await user.save();

                        interaction.editReply({
                            content: `Calculating...`,
                            components: [],
                        });

                        await timeout(3000);

                        if (dealerHandValue === chance) {
                            user.balance += amount;
                            cooldown.endsAt = Date.now() + 10_000;

                            await Promise.all([cooldown.save(), user.save()]);

                            await interaction.editReply({
                                content: `The value of my card was ${dealerHandValue}, it was a tie! :coin: ${totalInString} has been added back into your balance.`,
                                components: [],
                            });
                        }

                        if (dealerHandValue > chance) {
                            user.balance += amount * 2;
                            cooldown.endsAt = Date.now() + 10_000;

                            await Promise.all([cooldown.save(), user.save()]);

                            await interaction.editReply({
                                content: `The value of my card was ${dealerHandValue}, you won! :coin: ${totalInString} has been added into your balance.`,
                                components: [],
                            });

                            collector.stop();
                        } else {
                            cooldown.endsAt = Date.now() + 10_000;
                            await cooldown.save();

                            await interaction.editReply({
                                content: `The value of my card was ${dealerHandValue}. You lost :coin: ${totalInString}.`,
                                components: [],
                            });
                            collector.stop();
                        }
                    }
                }

                if (interaction.customId === 'lower-button') {
                    if (interaction.user != interaction.member) {
                        await interaction.deferReply({ ephemeral: true });

                        return await interaction.editReply(
                            `You cannot click within this event...`
                        );
                    } else {
                        await interaction.deferUpdate();

                        drawIntoDealer();
                        const amount = percentage;
                        const bet = user.balance - amount;
                        user.balance = bet;

                        await user.save();

                        interaction.editReply({
                            content: `Calculating...`,
                            components: [],
                        });

                        await timeout(3000);

                        if (dealerHandValue === chance) {
                            user.balance += amount;
                            cooldown.endsAt = Date.now() + 10_000;

                            await Promise.all([cooldown.save(), user.save()]);

                            await interaction.editReply({
                                content: `The value of my card was ${dealerHandValue}, it was a tie! :coin: ${totalInString} has been added back into your balance.`,
                                components: [],
                            });
                        }

                        if (dealerHandValue < chance) {
                            user.balance += amount * 2;
                            cooldown.endsAt = Date.now() + 10_000;

                            await Promise.all([cooldown.save(), user.save()]);

                            await interaction.editReply({
                                content: `The value of my card was ${dealerHandValue}, you won! :coin: ${totalInString} has been added into your balance.`,
                                components: [],
                            });

                            collector.stop();
                        } else {
                            cooldown.endsAt = Date.now() + 10_000;
                            await cooldown.save();

                            await interaction.editReply({
                                content: `The value of my card was ${dealerHandValue}. You lost :coin: ${totalInString}.`,
                                components: [],
                            });
                            collector.stop();
                        }
                    }
                }
            });
        } catch (error) {
            console.log(`An error has occurred with the error: ${error}`);
        }
    },
    data: {
        name: 'highlower',
        description: 'Play higher or lower against the bot.',
        options: [
            {
                name: 'percent',
                description:
                    'Set the percentage of coins based on your total balance you want to bet',
                minValue: 10,
                maxValue: 100,
                required: true,
                type: 4,
            },
        ],
    },
};
