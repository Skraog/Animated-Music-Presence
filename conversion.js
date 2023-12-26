const ffmpeg = require('fluent-ffmpeg');
// Requires ffmpeg on PC

module.exports.convert = (url) => {
    const outputGif = 'artwork.gif';

    return ffmpeg(url)
        .output(outputGif)
        .complexFilter('[0:v] split [a][b];[a] palettegen [p];[b][p] paletteuse')
        .run();
}