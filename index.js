const { MessageEmbed, Client, Discord } = require('discord.js');
const client = new Client();
const paginationEmbed = require('discord.js-pagination');
const axios = require('axios');
const { convert } = require('html-to-text');
const config = require('./config');
const prefix = config.prefix;

client.on('ready', () => {
	console.log('Bot is Ready!');
	client.user.setActivity(config.status_text, { type: config.bot_status });
});

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(' ');
	const command = args.shift().toLowerCase();

	if (config.everyone_can_use === true || config.allowed_users.some(id => id === message.author.id)) {
		if (command === config.cmd_stats) {
			const steamid = args[0];
			axios.get(`https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/?key=${config.steam_apiKey}&appid=252490&steamid=${steamid}`)
				.then(response => {
					const stats = response.data.playerstats.stats;
					const embed = new MessageEmbed()
						.setTitle(`Stats for ${steamid}`)
						.addFields(
							{
								name: 'Kills',
								value: stats[9].value,
								inline: true
							},
							{
								name: 'Deaths',
								value: stats[0].value,
								inline: true
							},
							{
								name: 'Suicides',
								value: stats[6].value,
								inline: true
							}
						)
						.setTimestamp()
						.setThumbnail(config.logo_url);

					message.channel.send(embed);
				})
				.catch(err => {
					console.log(err);
					message.channel.send('This user could not be found!');
				});
		} else if (command === config.cmd_serverstats) {
			config.servers.forEach(server => {
				axios.get(`https://api.battlemetrics.com/servers/${server}`)
					.then(response => {
						const data = response.data.data.attributes;
						const embed = new MessageEmbed()
							.setTitle(data.name)
							.addFields(
								{
									name: 'Players',
									value: data.players + ' / ' + data.maxPlayers,
									inline: true
								},
								{
									name: 'Queued Players',
									value: data.details.rust_queued_players,
									inline: true
								},
								{
									name: 'Rank',
									value: data.rank,
									inline: true
								},
								{
									name: 'Seed',
									value: data.details.rust_world_seed,
									inline: true
								},
								{
									name: 'Size',
									value: data.details.rust_world_size,
									inline: true
								}
							)
							.setTimestamp()
							.setColor(config.embed_color)
							.setThumbnail(config.logo_url);

						message.channel.send(embed);
					});
			});
		} else if (command === config.cmd_bans) {
			const steamid = args[0] || undefined;

			axios.get(`https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${config.steam_apiKey}&steamids=${steamid}`)
				.then(response => {
					const data = response.data.players[0];
					const embed = new MessageEmbed()
						.setTitle(data.SteamId)
						.addFields(
							{
								name: 'VAC Banned',
								value: data.VACBanned,
								inline: true
							},
							{
								name: 'VAC Bans',
								value: data.NumberOfVACBans,
								inline: true
							},
							{
								name: 'Gamebans',
								value: data.NumberOfGameBans,
								inline: true
							},
							{
								name: 'Since last ban',
								value: data.DaysSinceLastBan + ' days',
								inline: true
							},
							{
								name: 'Community Banned',
								value: data.CommunityBanned,
								inline: true
							}
						)
						.setTimestamp()
						.setColor(config.embed_color)
						.setThumbnail(config.logo_url);

					message.channel.send(embed);
				}).catch(err => {
					message.channel.send('Please provide a Steam ID!');
				})
		} else if (command === config.cmd_resolveid) {
			const url = args[0].split('/');
			const id = url[url.length - 1];

			axios.get(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${config.steam_apiKey}&vanityurl=${id}`)
				.then(response => {
					const data = response.data.response;
					const embed = new MessageEmbed()
						.setTitle(`Steam ID for ${id}`)
						.setDescription(data.steamid)
						.setColor(config.embed_color)
						.setTimestamp()
						.setThumbnail(config.logo_url);

					message.channel.send(embed);
				})
				.catch(err => {
					message.channel.send('Could not resolve Steam ID for given URL!');
				});
		} else if (command === config.cmd_totalplayers) {
			axios.get('https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=252490')
				.then(response => {
					const data = response.data.response;
					const embed = new MessageEmbed()
						.setTitle(`Total players in Rust`)
						.setDescription(data.player_count)
						.setColor(config.embed_color)
						.setTimestamp()
						.setFooter('Current active players according to Steam')
						.setThumbnail(config.logo_url);

					message.channel.send(embed);
				})
				.catch(err => {
					message.channel.send('Could not retrieve the number of players!');
				});
		} else if (command === config.cmd_news) {
			axios.get(`https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=252490&count=${config.rust_news_amount}`)
				.then(response => {
					const news = response.data.appnews.newsitems;
					let articles = [];

					news.forEach(article => {
						let content = convert(article.contents, {
							selectors: [
								{ selector: 'img', format: 'skip' },
								{ selector: 'previewyoutube', format: 'skip' }
							]
						});

						if (content.length > 4095) {
							content = content.substring(0, 4092) + ' ...';
						} else {
							content = content;
						}

						const embed = new MessageEmbed()
							.setTitle(article.title)
							.setDescription(content)
							.setURL(article.url)
							.setTimestamp()
							.setFooter();

						articles.push(embed);
					});
					paginationEmbed(message, articles);
				})
				.catch(err => {
					message.channel.send('Could not retrieve news! Try again!');
				});
		} else if (command === config.cmd_blacklist) {
			const ip = args[0];

			axios.get('https://api.facepunch.com/api/public/manifest/?public_key=j0VF6sNnzn9rwt9qTZtI02zTYK8PRdN1')
				.then(response => {

					const list = response.data.Servers.Banned;

					if (list.includes(ip)) {
						message.channel.send('This IP is blacklisted!');
					} else {
						message.channel.send('This IP is not blacklisted!');
					}
				});
		} else if (command === config.cmd_help) {

		}

	} else {
		message.channel.send('You dont have permissions to use these commands!');
	}
});

client.login(config.bot_token);