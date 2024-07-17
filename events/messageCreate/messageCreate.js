require('dotenv').config();
const groq = require('../../utils/groqAi');

module.exports = async (message, client) => {
    const message_text = message.content;

    const ignore_prefix = '!';

    const channels = [
        process.env.DISCORD_CHANNEL_ID1,
        process.env.DISCORD_CHANNEL_ID2,
    ];

    const messages = [
        {
            role: 'system',
            content: 'You are a Discord Chatbot.',
        },
        {
            role: 'user',
            content: message_text,
        },
    ];

    let conversation = [];

    conversation.push({
        role: 'system',
        content:
            'You are a Discord Chatbot developed by Tommy. Interact with users in a friendly manner and have fun with a joke level of 60%',
    });

    let previousMessages = await message.channel.messages.fetch({ limit: 10 });
    previousMessages.reverse();

    previousMessages.forEach((msg) => {
        if (msg.author.bot && msg.author.id !== client.user.id) return;
        if (msg.content.startsWith(ignore_prefix)) return;

        const username = msg.author.username
            .replace(/\s+/g, '_')
            .replace(/[^\w\s]/gi, '');

        if (msg.author.id === client.user.id) {
            conversation.push({
                role: 'assistant',
                name: username,
                content: msg.content,
            });

            return;
        }

        conversation.push({
            role: 'user',
            name: username,
            content: msg.content,
        });
    });

    const getGroqChatCompletion = async () => {
        return groq.chat.completions.create({
            //messages: messages,
            messages: conversation,
            model: 'llama3-8b-8192',
            temperature: 0.7,
        });
    };

    const response = await getGroqChatCompletion();

    if (message.author.bot) return;

    if (message.content.startsWith(ignore_prefix)) return;

    if (
        !channels.includes(message.channel.id) &&
        !message.mentions.users.has(client.user.id)
    )
        return;

    await message.channel.sendTyping();

    const sendTypingInterval = setInterval(() => {
        message.channel.sendTyping();
    }, 5000);

    clearInterval(sendTypingInterval);

    console.log(message_text);

    //client.channels.cache.get(process.env.DISCORD_CHANNEL_ID).send(response.choices[0]?.message?.content || "");

    const responseText = response.choices[0]?.message?.content;
    const textLimit = 2000;

    for (let i = 0; i < responseText.length; i += textLimit) {
        const chunk = responseText.substring(i, i + textLimit);

        await message.reply(chunk || '');
    }

    /*
    client.channels.fetch(process.env.DISCORD_CHANNEL_ID).then((channel) => {
        channel.send(message_text);
    });
    */
};
