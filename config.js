module.exports = {
	// General
	rust_news_amount: 3, // When doing the rustnews command, how many news articles should be fetched.
	logo_url: 'https://i.imgur.com/Zbbjn7r.png',
	embed_color: '#03d7fc',
	prefix: 'r/',
	help_in_dm: true, // Send the help message in users DM = true, publicly = false

	// Discord Bot Info
	bot_token: 'ODY5ODE3ODYwNTgxNjUwNDQy.YQDvAg.iUmue2rMPsWvtIvKDinp6rPAwjA', // Enter your Discord bot token here
	bot_status: 'WATCHING', // Available statuses: WATCHING, STREAMING, PLAYING, LISTENING, CUSTOM_STATUS, COMPETING
	status_text: 'help', // Text shown after bot status

	// Steam API
	steam_apiKey: '202421567411E3481E99816B94F5E3C5', // Get Steam API key from https://steamcommunity.com/dev/apikey

	// RCON
	rconPrefix: 'rc/', // Own prefix for security reasons
	use_rcon: true,
	rcon_ip: '54.37.245.61',
	rcon_port: '28016',
	rcon_pw: 'armadillo',
	use_chat_log: true, // Log server chat messages to channel
	webhook: 'https://discord.com/api/webhooks/869921314025111562/xnB7Y-gSxybSo-ADDcj3StloEYc9QVA5bNC4_fmJGGBnU8DAePE81JiYniL000rMYbsO', // Webhook for the chat logs

	// Rust Server IDs from Battlemetrics.com
	// Get the ID from the Server URL -- https://www.battlemetrics.com/servers/rust/9255283 where the 9255283 is the ID
	servers: [
		'6324892',
		'9255283'
	],

	// Permissions
	everyone_can_use: true, // Set to true if you want everyone in your server to be able to use these commands.
	allowed_users: [ // List all Discord IDs that can use the commands.
		'529803538650497026', // Remember the comma ( , ) after each new line!
	],
	rcon_users: [ // These users are allowed to send RCON commands to server.
		'529803538650497026',
	],

	// Commands
	// Change the prefix and commands for each function
	cmd_stats: 'stats', // Command to retrieve players stats
	cmd_serverstats: 'serverstats', // Command to retrieve server stats
	cmd_bans: 'bans', // Command to retrieve players bans
	cmd_resolveid: 'resolveid', // Command to resolve Steam ID from vanity URL
	cmd_totalplayers: 'totalplayers', // Command to fetch amount of current active rust players
	cmd_news: 'rustnews', // Command to fetch rust news
	cmd_blacklist: 'blacklist', // Command to check if server IP is blacklisted
	cmd_help: 'help', // Command to send help message to users DMs
	cmd_userinfo: 'userinfo', // Command to show info of tagged user
	cmd_hours: 'hours', // Command to check users Rust hours
	cmd_mapcheck: 'mapcheck', // Command to do mapcheck
};