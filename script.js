const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
let uBitDevice;
let rxCharacteristic = null;
const yawEl = document.getElementById('yaw');
const mouthEl = document.getElementById('mouth');
const eyeLEl = document.getElementById('eyeL');
const eyeREl = document.getElementById('eyeR');
let ultimoEnvio = 0;

const UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const UART_TX_CHARACTERISTIC_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const UART_RX_CHARACTERISTIC_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

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
    uBitDevice = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "BBC micro:bit" }],
      optionalServices: [UART_SERVICE_UUID]
    });

    uBitDevice.addEventListener('gattserverdisconnected', onDisconnected);

    const server = await uBitDevice.gatt.connect();
    const service = await server.getPrimaryService(UART_SERVICE_UUID);

    rxCharacteristic = await service.getCharacteristic(UART_TX_CHARACTERISTIC_UUID);
    await rxCharacteristic.startNotifications();
    rxCharacteristic.addEventListener("characteristicvaluechanged", onTxCharacteristicValueChanged);

    const tx = await service.getCharacteristic(UART_RX_CHARACTERISTIC_UUID); // para enviar datos

    statusEl.textContent = '✅ micro:bit connectada';
    uart = tx;
  } catch (e) {
    console.error(e);
    statusEl.textContent = '❌ Error en la connexió';
  }
};

function onTxCharacteristicValueChanged(event) {
  let receivedData = new Uint8Array(event.target.value.buffer);
  const receivedString = String.fromCharCode(...receivedData);
  console.log("📥 Received from micro:bit:", receivedString);
}

function onDisconnected(event) {
  let device = event.target;
  console.log(`🔌 Disconnected from ${device.name}`);
  rxCharacteristic = null;
  uart = null;
}

const faceMesh = new FaceMesh({ locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

faceMesh.onResults(async results => {
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
    const eyeL = getEyeOpen(lm, true);
    const eyeR = getEyeOpen(lm, false);

    yawEl.textContent = yaw;
    mouthEl.textContent = mouth;
    eyeLEl.textContent = eyeL;
    eyeREl.textContent = eyeR;

    const ahora = Date.now();
    if (uart && ahora - ultimoEnvio > 100) {
      const data = yaw.toString().padStart(2, '0') +
                   mouth.toString().padStart(2, '0') +
                   eyeL + eyeR;
      const mensaje = data + "\n";
      const encoded = new TextEncoder().encode(mensaje);
      try {
        await uart.writeValue(encoded);
        console.log("📤 UART enviado:", mensaje, [...encoded]);
        ultimoEnvio = ahora;
      } catch (err) {
        console.error("❌ Error al enviar por UART:", err);
      }
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

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function getEyeOpen(lm, left) {
  const top1 = lm[left ? 159 : 386];
  const top2 = lm[left ? 160 : 387];
  const bot1 = lm[left ? 145 : 374];
  const bot2 = lm[left ? 144 : 373];

  const top = midpoint(top1, top2);
  const bot = midpoint(bot1, bot2);

  const leftCorner = lm[left ? 130 : 359];
  const rightCorner = lm[left ? 243 : 463];

  const vertical = distance(top, bot);
  const horizontal = distance(leftCorner, rightCorner);
  const ratio = vertical / horizontal;

  return ratio > 0.20 ? 1 : 0;
}
