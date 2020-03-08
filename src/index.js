const { prefix, token, giphyToken } = require('../config.json');
const Discord = require('discord.js');

// sticker/gif grabber
var GphApiClient = require('giphy-js-sdk-core');
const giphy = GphApiClient(giphyToken);

// ReadableStreams, in this example YouTube audio
const ytdl = require('ytdl-core');

const client = new Discord.Client();
const queue = new Map();


client.once('ready', () => {
    console.log('Ready!');
});
client.once('reconnecting', () => {
    console.log('Reconnecting!');
});
client.once('disconnect', () => {
    console.log('Disconnect!');
});

client.on('message', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const serverQueue = queue.get(message.guild.id);

    if (message.content.startsWith(`${prefix}help`) || message.content === `${prefix}h`) {
        help(message);
    } else if (message.content.startsWith(`${prefix}sticker`) || message.content === `${prefix}s`) {
        const cmd = message.content.split(' ');
        if (cmd.length > 1) {
            search(message, cmd[1], 'stickers');
        } else {
            message.channel.send(commands.STICKER)
        }
    } else if (message.content.startsWith(`${prefix}gif`) || message.content === `${prefix}g`) {
        const cmd = message.content.split(' ');
        if (cmd.length > 1) {
            search(message, cmd[1], 'gifs');
        } else {
            message.channel.send(commands.GIF)
        }
    } else if (message.content.startsWith(`${prefix}play`) || message.content === `${prefix}p`) {
        execute(message, serverQueue);
    } else if (message.content === `${prefix}skip`) {
        skip(message, serverQueue);
    } else if (message.content === `${prefix}stop`) {
        stop(message, serverQueue);
    } else {
        message.channel.send('You need to enter a valid command!')
    }



    if (message.content == `${prefix}t`) {
        const embed = new MessageEmbed()
            .setTitle('A slick little embed')
            .setColor(0xff0000)
            .setDescription('Hello, this is a slick embed!');
        message.channel.send(embed);
    }
});

async function execute(message, serverQueue) {
    const args = message.content.split(' ');
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.channel.send('You need to be in a voice channel to play music!');
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        return message.channel.send('I need the permissions to join and speak in your voice channel!');
    }
    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
        title: songInfo.title,
        url: songInfo.video_url,
    };

    if (!serverQueue) {
        // Creating the contract for our queue
        const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true,
        };
        // Setting the queue using our contract
        queue.set(message.guild.id, queueContruct);
        // Pushing the song to our songs array
        queueContruct.songs.push(song);

        try {
            // Here we try to join the voicechat and save our connection into our object.
            var connection = await voiceChannel.join();
            queueContruct.connection = connection;
            // Calling the play function to start a song
            play(message.guild, queueContruct.songs[0]);
        } catch (err) {
            // Printing the error message if the bot fails to join the voicechat
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    } else {
        serverQueue.songs.push(song);
        console.log(serverQueue.songs);
        return message.channel.send(`${song.title} has been added to the queue!`);
    }
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }
    
    const dispatcher = serverQueue.connection.play(ytdl(song.url))
        .on('finish', () => {
            console.log('Music ended!');
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on('error', error => {
            console.error(error);
        });
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

function skip(message, serverQueue) {
    if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to skip the music!');
    if (!serverQueue) return message.channel.send('There is no song that I could skip!');
    serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
    if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to stop the music!');
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}


const commands = {
    STICKER: '• !sticker [search term]',
    GIF: '• !gif [search term]',
    PLAY: '• !play [url] ',
    SKIP: '• !skip',
    STOP: '• !stop'
}

help = (message) => {
    message.channel.send(
        'List of commands: \n' +
        commands.STICKER + '\n' +
        commands.GIF + '\n' + 
        commands.PLAY + '\n' + 
        commands.SKIP + '\n' +
        commands.STOP + '\n' 
    );
}

function search(message, term, format)  {
    giphy.search(format, { 'q': term }).then(response => {
        let totalResponses = response.data.length;
        let responseIndex = Math.floor((Math.random() * 10) + 1) % totalResponses;
        let responseFinal = response.data[responseIndex];
        // console.log(`TotalResponses: ${totalResponses}`)
        message.channel.send({
            files: [responseFinal.images.fixed_height.url]
        });
    }).catch(err => {
        message.channel.send(`Cannot find any ${term} ${format}`);
    });
}


client.login(token);