const User = require('../../schemas/User');
require('dotenv').config();

// const random = (min, max) => { return Math.floor(Math.random() * (max - min + 1) + min); }

let randomMsg = [``, ``, `Zoinks`,]


module.exports = (c) => {

    console.log(`${c.user.tag} is now online!`);

    /*
    setInterval(() => { 
        c.channels.cache.get(process.env.DISCORD_CHANNEL_ID).send(randomMsg[random(0, randomMsg.length - 1)]);
    }, 5000); */
}