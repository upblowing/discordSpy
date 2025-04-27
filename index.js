const { Client } = require('discord.js-selfbot-v13');
const sqlite3 = require('sqlite3');
const path = require('path');
const { token } = require('./config.json');

const db = new sqlite3.Database(path.join(__dirname, 'messages.db'));

db.run(`
    CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        server_id TEXT,
        server_name TEXT,
        channel_id TEXT,
        channel_name TEXT,
        author_id TEXT,
        author_username TEXT,
        author_display_name TEXT,
        content TEXT,
        timestamp TEXT
    )
`);

const client = new Client({ checkUpdate: false });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.username}`);
});

client.on('messageCreate', msg => {
    if (!msg.guild) return;
    
    const username = msg.author?.username || 'Unknown';
    const displayName = msg.author?.globalName || username;
    
    db.run(`
        INSERT OR IGNORE INTO messages VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        msg.id,
        msg.guild.id,
        msg.guild.name,
        msg.channel.id,
        msg.channel.name,
        msg.author.id,
        username,
        displayName,
        msg.content,
        msg.createdAt.toISOString()
    ], err => {
        if (err) console.error('DB error:', err.message);
    });
    
    console.log(`[${msg.guild.name}] #${msg.channel.name} - ${displayName}: ${msg.content}`);
});

client.login(token);
