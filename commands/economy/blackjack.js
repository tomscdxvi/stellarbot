const { ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
const User = require('../../schemas/User');
const Cooldown = require('../../schemas/Cooldown');

// Blackjack game rules
// 52 cards (10, 10, 10, 10) & face cards = J, Q, K (12)

const suits = ["hearts", "diamonds", "clubs", "spaces"];
const ranks = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"];
var deck = [];
var dealer = [];

const generateDeck = () => {
    deck = [];

    // For each type of suit
    for(var i = 0; i < suits.length; i++) {

        // For each rank
        for(var j = 0; i < ranks.length; j++) {
            
            // Generate a card
            var card = {};
            card.suit = suits[i];
            card.rank = ranks[j];

            deck.push(card);
        }
    }

    console.log(deck);
}

/*
const draw = () => {
    var card;

    if(dealer.length > 0 )
}
*/

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
            generateDeck();
        } catch(error) {

        }
    },
    data: {
        name: 'blackjack',
        'description': 'Play Blackjack against the bot to win some coins!'
    }
}