const { Builder, Browser, By } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const config = require('./config.json');
const axios = require('axios');

const options = new firefox.Options().headless();

let driver = new Builder().forBrowser(Browser.FIREFOX).setFirefoxOptions(options).build();

const getAlbum = async (name) => {
  const r = await axios.get(
    `https://amp-api.music.apple.com/v1/catalog/us/search`,
    {
      params: {
        term: name,
        l: "en-US",
        platform: "web",
        types: "albums",
        limit: 1,
      },
      headers: config.headers,
      timeout: 10 * 1000,
    }
  );

  return r.data?.results?.albums?.data?.[0];
}

const getVideo = async ({ album }) => {
  const url = album?.attributes.url;

  if (!url) return;

  try {
    await driver.get(url);
    return await driver.findElement(By.className('editorial-video svelte-1p1721i')).getAttribute('src'); // should def try something more ..definitive?
  } catch { return undefined } finally { driver.quit() };
};


module.exports.getEverything = async (name, artist) => {
  const album = await getAlbum(`${artist} ${name}`);
  const stillArt = album.attributes.artwork;

  const artwork = await getVideo({ album }) ?? stillArt.url.replace('{w}', stillArt.width).replace('{h}', stillArt.height);

  return {
    artwork: artwork,
    url: album.attributes.url,
    artist: album.attributes.artistName
  };
};

this.getEverything('Wasteland', 'Brent Faiyaz').then(r => {
  require('./conversion').convert(r.artwork); // Requires ffmpeg on PC
})