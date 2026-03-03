const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {
    navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((localMediaStream) => {
            video.srcObject = localMediaStream;
            video.play();
        })
        .catch((err) =>
            console.error(`Hey this needs access to the webcam to work!!`, err)
        );
}

function paintToCanvas() {
    const width = video.videoWidth;
    const height = video.videoHeight;

    canvas.width = width;
    canvas.height = height;

    setInterval(() => {
        ctx.drawImage(video, 0, 0, width, height);
        let pxls = ctx.getImageData(0, 0, width, height);
        // pxls = redEffect(pxls);
        // pxls = rgbSplit(pxls);
        // ctx.globalAlpha = 0.5;
        pxls = greenScreen(pxls);
        ctx.putImageData(pxls, 0, 0);
    }, 16);
}

function takePhoto() {
    snap.currentTime = 0;
    snap.play();

    const data = canvas.toDataURL('image/jpeg');
    const link = document.createElement('a');
    link.href = data;
    link.setAttribute('download', 'handsome');
    link.innerHTML = `<img src="${data}" alt="Video screenshot" />`;
    strip.insertBefore(link, strip.firstChild);
}

function redEffect(pxls) {
    for (let i = 0; i < pxls.data.length; i += 4) {
        pxls.data[i + 0] = pxls.data[i + 0] + 100;
        pxls.data[i + 1] = pxls.data[i + 1] - 50;
        pxls.data[i + 2] = pxls.data[i + 2] * 0.5;
    }
    return pxls;
}

function rgbSplit(pxls) {
    for (let i = 0; i < pxls.data.length; i += 4) {
        pxls.data[i - 150] = pxls.data[i + 0];
        pxls.data[i + 100] = pxls.data[i + 1];
        pxls.data[i - 150] = pxls.data[i + 2];
    }
    return pxls;
}

function greenScreen(pxls) {
    const levels = {};

    document.querySelectorAll('.rgb input').forEach((input) => {
        levels[input.name] = input.value;
    });

    for (i = 0; i < pxls.data.length; i += 4) {
        red = pxls.data[i + 0];
        green = pxls.data[i + 1];
        blue = pxls.data[i + 2];
        alpha = pxls.data[i + 3];

        if (
            red >= levels.rmin &&
            green >= levels.gmin &&
            blue >= levels.bmin &&
            red <= levels.rmax &&
            green <= levels.gmax &&
            blue <= levels.bmax
        ) {
            pxls.data[i + 3] = 0;
        }
    }
    return pxls;
}

getVideo();
video.addEventListener('canplay', paintToCanvas);
