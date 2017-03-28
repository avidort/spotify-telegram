'use strict';

const [bluebird, TelegramBot, SpotifyWebApi, config] = [
  require('bluebird'), require('node-telegram-bot-api'),
  require('spotify-web-api-node'), require('rc')('botify')
];

(function() {
  if (!config.config) {
    return console.error('[spotify-telegram] Unable to start without config');
  }

  const telegram = new TelegramBot(config.telegram.token, {polling: true});
  const spotify = new SpotifyWebApi({
    clientId: config.spotify.clientId,
    clientSecret: config.spotify.clientSecret
  });

  console.log('[spotify-telegram] Started');
  
  telegram.on('message', (msg) =>
    telegram.sendMessage(msg.chat.id, config.telegram.message, {parse_mode: 'markdown'}));

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
})();