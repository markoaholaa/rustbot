const config = require('./config');
module.exports = {
	// Stats Command
	stats_for: 'Stats for ',
	kills: 'Kills',
	deaths: 'Deaths',
	suicides: 'Suicides',

	// Server Stats
	players: 'Players',
	queued_players: 'Queued Players',
	rank: 'Rank',
	seed: 'Seed',
	size: 'Size',

	// Ban Info
	vac_banned: 'VAC Banned',
	vac_bans: 'VAC Bans',
	gamebans: 'Gamebans',
	since_last_ban: 'Since last ban',
	community_banned: 'Community Banned',

	// Blacklist Check
	is_blacklisted: 'This IP is blacklisted!',
	not_blacklisted: 'This IP is not blacklisted!',

	// Discord User Info
	info_of: 'Info of user: ',
	info_joined: 'Joined this server (DD/MM/YYYY)',
	info_userid: 'User ID',

	// Errors
	err_noUser: 'This user could not be found!',
	err_noSteamId: 'Please provide Steam ID!',
	err_cantResolve: 'Could not resolve Steam ID for given URL!',
	err_totalPlayers: 'Could not retrieve the number of players!',
	err_news: 'Could not retrieve news! Try again!',
	err_permissions: 'You dont have permissions to use these commands!',
	err_general: 'Something went wrong. Please try again later.',
	rcon_err: 'You do not have permissions to send RCON commands!',

	// Misc
	for: 'for',
	total_players: 'Total players in Rust',
	according_to_steam: 'Current active players according to Steam',
	user_hours: 'This user has played ',
	hours: ' hours',
	monuments: 'Monuments',
	launch_site: 'Launch Site',
	airfield: 'Airfield',

	// Help Message
	help_title: 'How to use Rust Bot',
	help_commands: [
		`${config.prefix}stats steamid - Display global Rust stats for given Steam ID.`,
		`${config.prefix}serverstats - Display stats for Rust Bot servers.`,
		`${config.prefix}bans steamid - Show bans for given Steam ID.`,
		`${config.prefix}resolveid url - Resolve users Steam ID with their vanity URL.`,
		`${config.prefix}totalplayers - Show total current players on Rust.`,
		`${config.prefix}rustnews - Show news articles that contain Rust.`,
		`${config.prefix}blacklist ip - Show if the server IP is blacklisted by Facepunch`,
		`${config.prefix}hours steamid - Show users Rust hours.`,
	]
};