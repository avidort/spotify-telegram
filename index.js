'use strict';

const [bluebird, SpotifyWebApi, TelegramBot, config] = [
  require('bluebird'), require('spotify-web-api-node'),
  require('node-telegram-bot-api'), require('rc')('botify')
];

const spotify = new SpotifyWebApi({
  clientId: config.spotify.clientId,
  clientSecret: config.spotify.clientSecret
});

const telegram = new TelegramBot(config.telegramToken, {polling: true});
