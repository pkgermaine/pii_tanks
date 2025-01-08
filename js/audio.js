


export async function playMusic() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const response = await fetch('assets/music/background.mp3');
    const audioData = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(audioData);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = true;

    source.connect(audioContext.destination);
    source.start();
}