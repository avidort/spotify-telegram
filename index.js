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

telegram.on('message', (msg) => {
  console.log(msg); // todo send a message explaining about bot usage
});

telegram.on('inline_query', async (query) => {
  if (!query.query) {
    return;
  }

  try {
    const search = await spotify.searchTracks(query.query, {limit: config.spotify.limitResults});

    let tracks = [];
    search.body.tracks.items.forEach((track) => {
      tracks.push({
        type: 'article',
        id: track.id,
        title: `${track.artists[0].name} - ${track.name}`,
        description: track.album.name,
        thumb_url: track.album.images[0].url,
        input_message_content: {
          message_text: track.external_urls.spotify
        }
      });
    });

    telegram.answerInlineQuery(query.id, tracks);
  } catch (e) {
    console.error('[SpotifyWebApi] %s', e);
  }
});