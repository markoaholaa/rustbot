const { MessageEmbed } = require('discord.js');
const Discord = require('discord.js');
const client = new Discord.Client();
const paginationEmbed = require('discord.js-pagination');
const axios = require('axios');
const { convert } = require('html-to-text');
const config = require('./config');
const prefix = config.prefix;
const rconPrefix = config.rconPrefix;
const { Client } = require('./node_modules/rustrcon/src/index');
const lang = require('./lang');

client.on('ready', () => {
	console.log('Bot is Ready!');
	client.user.setActivity(config.status_text, { type: config.bot_status });
});

let rcon;

if (config.use_rcon === true) {
	rcon = new Client({
		ip: config.rcon_ip,
		port: config.rcon_port,
		password: config.rcon_pw
	});

	rcon.login();

	rcon.on('connected', () => {
		console.log(`RCON Connected to ${rcon.ws.ip}:${rcon.ws.port}`);
	});

	rcon.on('error', err => {
		console.error(err);
	});

	rcon.on('disconnect', () => {
		console.log('Disconnected from RCON websocket');
	});
}

if (config.use_rcon && config.use_chat_log === true) {
	const url = config.webhook.split('/');
	const id = url[url.length - 2];
	const token = url[url.length - 1];

	const hook = new Discord.WebhookClient(id, token);

	rcon.on('message', servermessage => {
		console.log(servermessage);
		if (servermessage.Type === 'Chat') {

			const msg = servermessage.content.Message.split(':');
			const sendMsg = msg.slice(1).join(' ');

			const embed = new MessageEmbed()
				.setTitle(servermessage.content.Username)
				.setColor(config.embed_color)
				.setDescription(sendMsg)
				.setTimestamp();

			hook.send(embed);
		}
	});
}

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
						.setTitle(lang.stats_for + steamid)
						.addFields(
							{
								name: lang.kills,
								value: stats[9].value,
								inline: true
							},
							{
								name: lang.deaths,
								value: stats[0].value,
								inline: true
							},
							{
								name: lang.suicides,
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
					message.channel.send(lang.err_noUser);
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
									name: lang.players,
									value: data.players + ' / ' + data.maxPlayers,
									inline: true
								},
								{
									name: lang.queued_players,
									value: data.details.rust_queued_players,
									inline: true
								},
								{
									name: lang.rank,
									value: data.rank,
									inline: true
								},
								{
									name: lang.seed,
									value: data.details.rust_world_seed,
									inline: true
								},
								{
									name: lang.size,
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
								name: lang.vac_banned,
								value: data.VACBanned,
								inline: true
							},
							{
								name: lang.vac_bans,
								value: data.NumberOfVACBans,
								inline: true
							},
							{
								name: lang.gamebans,
								value: data.NumberOfGameBans,
								inline: true
							},
							{
								name: lang.since_last_ban,
								value: data.DaysSinceLastBan + ' days',
								inline: true
							},
							{
								name: lang.community_banned,
								value: data.CommunityBanned,
								inline: true
							}
						)
						.setTimestamp()
						.setColor(config.embed_color)
						.setThumbnail(config.logo_url);

					message.channel.send(embed);
				}).catch(err => {
					message.channel.send(lang.err_noSteamId);
				})
		} else if (command === config.cmd_resolveid) {
			const url = args[0].split('/');
			const id = url[url.length - 1];

			axios.get(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${config.steam_apiKey}&vanityurl=${id}`)
				.then(response => {
					const data = response.data.response;
					const embed = new MessageEmbed()
						.setTitle(`Steam ID ${lang.for} ${id}`)
						.setDescription(data.steamid)
						.setColor(config.embed_color)
						.setTimestamp()
						.setThumbnail(config.logo_url);

					message.channel.send(embed);
				})
				.catch(err => {
					message.channel.send(lang.err_cantResolve);
				});
		} else if (command === config.cmd_totalplayers) {
			axios.get('https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=252490')
				.then(response => {
					const data = response.data.response;
					const embed = new MessageEmbed()
						.setTitle(lang.total_players)
						.setDescription(data.player_count)
						.setColor(config.embed_color)
						.setTimestamp()
						.setFooter(lang.according_to_steam)
						.setThumbnail(config.logo_url);

					message.channel.send(embed);
				})
				.catch(err => {
					message.channel.send(lang.err_totalPlayers);
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
					message.channel.send(lang.err_news);
				});
		} else if (command === config.cmd_blacklist) {
			const ip = args[0];

			axios.get('https://api.facepunch.com/api/public/manifest/?public_key=j0VF6sNnzn9rwt9qTZtI02zTYK8PRdN1')
				.then(response => {

					const list = response.data.Servers.Banned;

					if (list.includes(ip)) {
						message.channel.send(lang.is_blacklisted);
					} else {
						message.channel.send(lang.not_blacklisted);
					}
				});
		} else if (command === config.cmd_help) {
			const user = message.author;

			const embed = new MessageEmbed()
				.setTitle(lang.help_title)
				.setDescription(lang.help_commands)
				.setTimestamp();

			if (config.help_in_dm === true) {
				user.send(embed);
			} else {
				message.channel.send(embed);
			}
		} else if (command === config.cmd_userinfo) {
			const user = message.mentions.members.first();

			console.log(user);

			const joinDate = new Date(user.joinedTimestamp);
			const year = joinDate.getFullYear();
			const month = joinDate.getMonth() + 1;
			const date = joinDate.getDate();
			const joined = date + '/' + month + '/' + year;

			const embed = new MessageEmbed()
				.setTitle(lang.info_of + user.user.username + '#' + user.user.discriminator)
				.addFields(
					{
						name: lang.info_joined,
						value: joined
					},
					{
						name: lang.info_userid,
						value: user.user.id
					}
				)
				.setThumbnail(`https://cdn.discordapp.com/avatars/${user.user.id}/${user.user.avatar}`);

			message.channel.send(embed);
		} else if (command === config.cmd_hours) {
			const steamid = args[0];
			axios.get(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${config.steam_apiKey}&steamid=${steamid}&format=json`)
				.then(response => {
					const hours = response.data.response.games;
					const result = hours.filter(id => id.appid === 252490);
					const h = Math.floor((result[0].playtime_forever / 60));

					const embed = new MessageEmbed()
						.setTitle(steamid)
						.setDescription(`${lang.user_hours} ${h} ${lang.hours}`)
						.setColor(config.embed_color)
						.setTimestamp();

					message.channel.send(embed);

				})
				.catch(err => {
					message.channel.send(lang.err_general);
				});
		} else if (command === config.cmd_mapcheck) {
			const seed = args[0];
			const size = args[1];

			axios.get(`https://rustmaps.com/api/v2/maps/${seed}/${size}?staging=false&barren=false`)
				.then(response => {
					const map = response.data;

					let launch;
					let airfield;

					if (map.monuments.some(monument => monument.monument === 'Launch_Site')) {
						launch = 'True';
					} else {
						launch = 'False';
					}

					if (map.monuments.some(monument => monument.monument === 'Airfield')) {
						airfield = 'True';
					} else {
						airfield = 'False';
					}

					const embed = new MessageEmbed()
						.setTitle(map.seed + ' / ' + map.size)
						.setImage(map.thumbnailUrl)
						.setDescription(map.url)
						.setColor(config.embed_color)
						.setThumbnail(config.logo_url)
						.addFields(
							{
								name: lang.monuments,
								value: map.monuments.length
							},
							{
								name: lang.launch_site,
								value: launch,
								inline: true
							},
							{
								name: lang.airfield,
								value: airfield,
								inline: true
							}
						);

					message.channel.send(embed);
				})
				.catch(err => {
					message.channel.send('Map was not found!');
				});
		}

	} else {
		message.channel.send(lang.err_permissions);
	}
});

if (config.use_rcon === true) {
	client.on('message', message => {
		if (config.rcon_users.some(user => user === message.author.id)) {
			if (!message.content.startsWith(rconPrefix) || message.author.bot) return;

			const args = message.content.slice(rconPrefix.length).trim().split(' ');
			const command = args.shift().toLowerCase();

			if (command === 'kick') {
				const user = args[0];
				const reason = args.slice(1).join(' ');
				rcon.send(`kick ${user} ${reason}`);
				rcon.on('message', servermsg => {
					if (servermsg.content === 'Player not found') {
						message.channel.send(`Player not found!`);
					} else {
						message.channel.send(`Kicked player ${user}`);
					}
				});
			} else if (command === 'ban') {
				const user = args[0];
				const reason = args.slice(1, args.length - 1).join(' ');
				const length = args[args.length - 1];

				rcon.send(`ban ${user} ${reason} ${length}`);
				rcon.on('message', servermsg => {
					if (servermsg.content === 'Player not found') {
						message.channel.send(`Player not found!`);
					} else {
						message.channel.send(`Banned player ${user}`);
					}
				});
			} else if (command === 'kill') {
				const user = args[0];
				rcon.send(`kill ${user}`);
				rcon.on('message', servermsg => {
					if (servermsg.content === 'Player not found') {
						message.channel.send(`Player not found!`);
					} else {
						message.channel.send(`Killed player ${user}`);
					}
				});
			} else if (command !== 'kick' || command !== 'ban' || command !== 'kill') {
				rcon.send(`${command} ${args}`);
				message.channel.send(`Sent ${command} ${args}`);
			}
		} else {
			if (message.author.bot || message.webhookID) return;
			message.channel.send(lang.rcon_err);
		}
	});
}

client.login(config.bot_token);