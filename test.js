const words = ["car", "moon", "sun", "bun", "joker"];

function shuffle(array) {
    let currentIndex = array.length;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
}

shuffle(words);

for(let i = 0; i < words.length; i++) {
    console.log(words[i]);
}

/*

let dex = Math.floor((Math.random() * 921) + 1);
let random = Math.floor((Math.random() * 5) + 1);

const options = {
    url: `https://pokeapi.co/api/v2/pokemon/${dex}`,
    json: true
}

    get(options).then(async body => {
        let Embed = new MessageEmbed()
          .setTitle("A Wild pokemon has appeared")
          .setDescription(`Quick, catch that pokemon!`)
          .setThumbnail(body.sprites.front_default)
          .setFooter(body.name)
          .setColor("#00eaff")
        const msg = await c.channels.cache.get(process.env.DISCORD_CHANNEL_ID).send(Embed);
        const filter = m => m.author.id === c.author.id
        msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] }) // 1 minute timer & max of 1 attempt at answering
          .then(collected => {
            get(options).then(body => {
              if (collected.first().content == (body.name)) {
                message.reply("You just caught a " + body.name);
              }
              else {
                message.reply("Not that one!");
              }
            })
          })
          .catch(() => message.reply('you did not guess in time!'));
      })

*/