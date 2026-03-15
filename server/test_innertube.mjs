const videoId = 'smzfDioIPB8';

// Android client to bypass bot detection
const body = {
    context: {
        client: {
            clientName: 'ANDROID',
            clientVersion: '19.09.37',
            androidSdkVersion: 30,
            hl: 'ja',
            gl: 'JP',
        },
    },
    videoId,
    contentCheckOk: true,
    racyCheckOk: true,
};

try {
    const res = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip',
        },
        body: JSON.stringify(body),
    });

    const data = await res.json();

    console.log('Playability:', data.playabilityStatus?.status, data.playabilityStatus?.reason || '');

    if (data.videoDetails) {
        console.log('Title:', data.videoDetails.title);
        console.log('Duration:', data.videoDetails.lengthSeconds + 's');
    }

    if (data.streamingData) {
        const formats = data.streamingData.formats || [];
        const adaptiveFormats = data.streamingData.adaptiveFormats || [];
        console.log('Combined formats:', formats.length);
        console.log('Adaptive formats:', adaptiveFormats.length);
        formats.forEach(f => console.log(' -', f.qualityLabel, f.mimeType?.substring(0, 40), f.url ? 'HAS_URL' : (f.signatureCipher ? 'NEEDS_CIPHER' : 'NO_URL')));
    } else {
        console.log('No streaming data');
    }
} catch (e) {
    console.error('Error:', e.message);
}
