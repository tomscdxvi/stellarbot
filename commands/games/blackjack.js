/*

const {
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ComponentType,
} = require('discord.js');
const User = require('../../schemas/User');
const Cooldown = require('../../schemas/Cooldown');

Blackjack game rules
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



var suits = ['♠', '♥', '♣', '♦'];
var ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
var deck = [];
var dealerHand = [];
var playerHand = [];
var dealerHandValue = 0;
var playerHandValue = 0;
var hidden = true;

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
        card[0] === 'J' || card[0] === 'Q' || card[0] === 'K'
            ? (dealerHandValue += 10)
            : (dealerHandValue += Number(card[0]));
    } else {
        // This handles the condition if the card is 10, set the value to 10.
        dealerHandValue += 10;
    }

    return dealerHand;
};

const drawIntoPlayer = () => {
    var randomIndex = Math.floor(Math.random() * deck.length);
    const card = deck.splice(randomIndex, 1)[0];

    playerHand.push(card);

    // If card.length === 2 (This means the end of the length is equal to 2), that means the number cannot be 10 so we find the value from that condition
    if (card.length === 2) {
        card[0] === 'J' || card[0] === 'Q' || card[0] === 'K'
            ? (playerHandValue += 10)
            : (playerHandValue += Number(card[0]));
    } else {
        // This handles the condition if the card is 10, set the value to 10.
        playerHandValue += 10;
    }

    return playerHand;
};

const calculateDealerHand = (dealerHand) => {
    for (card in dealerHand) {
        if (card[0] === 'J' || card[0] === 'Q' || card[0] === 'K') {
            dealerHandValue = 10;
        } else {
            var rankInt = parseInt(card[0]);

            dealerHandValue = rankInt;
        }
    }

    return dealerHandValue;
};

// Action Buttons
const normalBlackjack = new ButtonBuilder()
    .setLabel('Normal')
    .setStyle(ButtonStyle.Primary)
    .setCustomId('normal-button');
const highRollBlackjack = new ButtonBuilder()
    .setLabel('HighRoll')
    .setStyle(ButtonStyle.Success)
    .setCustomId('highroll-button');

const lowBet = new ButtonBuilder()
    .setLabel('150')
    .setStyle(ButtonStyle.Secondary)
    .setCustomId('low-button');
const midBet = new ButtonBuilder()
    .setLabel('500')
    .setStyle(ButtonStyle.Primary)
    .setCustomId('mid-button');
const topBet = new ButtonBuilder()
    .setLabel('1000')
    .setStyle(ButtonStyle.Success)
    .setCustomId('top-button');

const hitButton = new ButtonBuilder()
    .setLabel('Hit')
    .setStyle(ButtonStyle.Success)
    .setCustomId('hit-button');
const standButton = new ButtonBuilder()
    .setLabel('Stand')
    .setStyle(ButtonStyle.Primary)
    .setCustomId('stand-button');

const exitButton = new ButtonBuilder()
    .setLabel('Exit')
    .setStyle(ButtonStyle.Danger)
    .setCustomId('exit-button');

const introRow = new ActionRowBuilder().addComponents(
    normalBlackjack,
    highRollBlackjack,
    exitButton
);
const betsRow = new ActionRowBuilder().addComponents(lowBet, midBet, topBet);
const gameRow = new ActionRowBuilder().addComponents(hitButton, standButton);

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

            const userId = interaction.user.id;
            let user = await User.findOne({
                userId: interaction.member.id,
            });

            interaction.editReply('Currently disabled for maintenance...');
            var percentage = 10;
            const betAmount = ((percentage / 100) * user.balance).toFixed(0);

            if (user.balance < betAmount) {
                interaction.editReply(
                    `You do not have enough to play (${betAmount})`
                );

                return;
            }

            // interaction.editReply({ content: 'Choose your stakes', components: [introRow] });

            const collector =
                interaction.channel.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    time: 60000,
                });

            collector.on('collect', async (interaction) => {
                if (interaction.member.id != interaction.user.id) {
                    return interaction.editReply(
                        'You do not have permission to play in this game...WYD!'
                    );
                }

                if (interaction.customId === 'normal-button') {
                    await interaction.deferUpdate();

                    // Generate deck at the start of the command.
                    generateDeck();

                    interaction.editReply({
                        content: 'Place your bets...',
                        components: [betsRow],
                    });

                    collector.on('collect', async (interaction) => {
                        if (interaction.customId === 'low-button') {
                            await interaction.deferUpdate();

                            percentage = 10;
                            const bet = user.balance - betAmount;
                            user.balance = bet;

                            await user.save();

                            interaction.editReply({
                                content: `Bets are in...`,
                                components: [],
                            });

                            drawIntoPlayer();
                            drawIntoDealer();

                            drawIntoPlayer();
                            drawIntoDealer();

                            await timeout(3000);

                            if (playerHandValue === 21) {
                                interaction.editReply({
                                    content: `Dealer: *, ${dealerHand[1]}| Player: ${playerHand[0]}, ${playerHand[1]} | Blackjack, you win!`,
                                    components: [gameRow],
                                });
                            }

                            interaction.editReply({
                                content: `Dealer: *, ${dealerHand[1]}| Player: ${playerHand[0]}, ${playerHand[1]}`,
                                components: [gameRow],
                            });

                            collector.on('collect', async (interaction) => {
                                if (interaction.customId === 'hit-button') {
                                    await interaction.deferUpdate();

                                    // drawIntoPlayer();

                                    /*
                                    for(let i = 0; i < playerHand.length; i++) {
                                        interaction.editReply({ content: `Player: Player: ${playerHand[0]}, ${playerHand[1]}`, components: [] });
                                    } 

                                    interaction.editReply({
                                        content: `HELLO!`,
                                        components: [],
                                    });
                                }
                            });
                        }

                        if (interaction.customId === 'mid-button') {
                            await interaction.deferUpdate();

                            const amount = 500;
                            const bet = user.balance - amount;
                            user.balance = bet;

                            await user.save();

                            drawIntoDealer();

                            interaction.editReply({
                                content: `${dealerHand}`,
                                components: [],
                            });
                        }

                        if (interaction.customId === 'top-button') {
                            await interaction.deferUpdate();

                            const amount = 1000;
                            const bet = user.balance - amount;
                            user.balance = bet;

                            await user.save();

                            drawIntoDealer();

                            interaction.editReply({
                                content: `${dealerHand}`,
                                components: [],
                            });
                        }
                    });
                }

                if (interaction.customId === 'highroll-button') {
                    await interaction.deferUpdate();

                    // Generate deck at the start of the command.
                    generateDeck();

                    interaction.editReply('Normal Blackjack');
                }

                if (interaction.customId === 'exit-button') {
                    await interaction.deferUpdate();

                    return interaction.editReply({
                        content: 'Closing table...',
                        components: [],
                    });
                }
            });
        } catch (error) {
            console.log(`An error has occurred with the error: ${error}`);
        }
    },
    data: {
        name: 'blackjack',
        description: 'Play Blackjack against the bot to win some coins!',
    },
};

*/
