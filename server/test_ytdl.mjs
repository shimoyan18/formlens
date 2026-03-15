import ytdl from '@distube/ytdl-core';

const url = 'https://www.youtube.com/watch?v=0ugiJfHltlA';

console.log('Testing ytdl-core with URL:', url);
console.log('Is valid URL:', ytdl.validateURL(url));

try {
    const info = await ytdl.getInfo(url);
    console.log('OK - Title:', info.videoDetails.title);
    console.log('Duration:', info.videoDetails.lengthSeconds, 'seconds');
    console.log('Formats count:', info.formats.length);

    const format = ytdl.chooseFormat(info.formats, {
        quality: 'lowest',
        filter: 'videoandaudio',
    });
    console.log('Chosen format:', format.qualityLabel, format.container, format.mimeType);
} catch (err) {
    console.error('ERROR:', err.message);
    console.error('Stack:', err.stack);
}
