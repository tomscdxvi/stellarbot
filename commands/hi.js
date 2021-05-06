module.exports =  
{
    name: 'hi',
    description: "This is a simple conversation command",
    execute(message, args)
    {
        message.channel.send('Hello');
    }
}