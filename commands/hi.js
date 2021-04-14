module.exports =  {
    name: 'hi',
    description: "this is a hi command",
    execute(message, args){
        message.channel.send('hello celena');
        

        }
    }