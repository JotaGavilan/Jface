const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
let uart = null;

document.getElementById('fullscreenBtn').onclick = () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
};
document.getElementById('infoBtn').onclick = () => {
  document.getElementById('info-layer').style.display = 'block';
};
document.getElementById('connectBtn').onclick = async () => {
  try {
    statusEl.textContent = '🔍 Buscant micro:bit...';
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "BBC micro:bit" }],
      optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e']
    });
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');
    uart = await service.getCharacteristic('6e400002-b5a3-f393-e0a9-e50e24dcca9e');
    statusEl.textContent = '✅ micro:bit connectada';
  } catch (e) {
    console.error(e);
    statusEl.textContent = '❌ Error en la connexió';
  }
};

const faceMesh = new FaceMesh({ locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: false, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
faceMesh.onResults(results => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(-1, 1);
  ctx.translate(-canvas.width, 0);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
  if (results.multiFaceLandmarks.length > 0) {
    const lm = results.multiFaceLandmarks[0];
    drawConnectors(ctx, lm, FACEMESH_TESSELATION, { color: '#00FF00', lineWidth: 0.5 });
    const yaw = Math.max(0, Math.min(99, Math.round((lm[1].x - lm[234].x) / (lm[454].x - lm[234].x) * 20 + 5)));
    const mouth = Math.max(0, Math.min(99, Math.round(Math.hypot(lm[13].x - lm[14].x, lm[13].y - lm[14].y) * 100)));
    const eyeL = Math.hypot(lm[159].x - lm[145].x, lm[159].y - lm[145].y) * 100 > 1.5 ? 1 : 0;
    const eyeR = Math.hypot(lm[386].x - lm[374].x, lm[386].y - lm[374].y) * 100 > 1.5 ? 1 : 0;
    if (uart) {
      const data = yaw.toString().padStart(2, '0') +
                   mouth.toString().padStart(2, '0') +
                   eyeL + eyeR;
      uart.writeValue(new TextEncoder().encode(data + "\n"));
    }
  }
  ctx.restore();
});

async function start() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
  video.srcObject = stream;
  await new Promise(r => video.onloadedmetadata = r);
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  new Camera(video, { onFrame: async () => await faceMesh.send({ image: video }) }).start();
}
start();
