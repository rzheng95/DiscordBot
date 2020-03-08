const { prefix, token, giphyToken } = require('../config.json');

const Discord = require('discord.js');
const client = new Discord.Client();

var GphApiClient = require('giphy-js-sdk-core');
const giphy = GphApiClient(giphyToken);

client.once('ready', () => {
    console.log('Ready!')
});

client.on('message', message => {
    if (message.content.startsWith(`${prefix}help`)) {
        help(message);
    }

    if (message.content.startsWith(`${prefix}sticker`)) {
        const cmd = message.content.split(' ');
        if (cmd.length > 1) {
            search(message, cmd[1], 'stickers');
        } else {
            message.channel.send(commands.STICKER)
        }
    }
    
    if (message.content.startsWith(`${prefix}gif`)) {
        const cmd = message.content.split(' ');
        if (cmd.length > 1) {
            search(message, cmd[1], 'gifs');
        } else {
            message.channel.send(commands.GIF)
        }
    }
});

client.login(token);

const commands = {
    STICKER: '• !sticker [search term]',
    GIF: '• !gif [search term]'
}

help = (message) => {
    message.channel.send(
        'List of commands: \n' + 
        commands.STICKER + '\n' +
        commands.GIF + '\n'
    );
}


search = (message, term, format) => {
    giphy.search(format, { 'q': term }).then(response => {
        let totalResponses = response.data.length;
        let responseIndex = Math.floor((Math.random() * 10) + 1) % totalResponses;
        let responseFinal = response.data[responseIndex];
        console.log(`TotalResponses: ${totalResponses}`)
        message.channel.send({
            files: [responseFinal.images.fixed_height.url]
        });
    }).catch(err => {
        message.channel.send(`Can not find any ${term} ${format}`);
    });
}