
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const { drawConnectors } = window;
  const { FACEMESH_FACE_OVAL, FACEMESH_LEFT_EYE, FACEMESH_RIGHT_EYE, FACEMESH_LIPS } = window;

  const yawEl = document.getElementById('yaw');
  const mouthEl = document.getElementById('mouth');
  const eyeLEl = document.getElementById('eyeL');
  const eyeREl = document.getElementById('eyeR');
  const statusEl = document.getElementById('status');

  const smileEl = document.getElementById('smile');
  const frownEl = document.getElementById('frown');
  const browsEl = document.getElementById('brows');
  const pitchEl = document.getElementById('pitch');
  const rollEl = document.getElementById('roll');

  let uartCharacteristic = null;

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  document.getElementById('connectBtn').onclick = async () => {
    statusEl.textContent = "🔍 Buscant micro:bit...";
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: "BBC micro:bit" }],
        optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e']
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');
      uartCharacteristic = await service.getCharacteristic('6e400002-b5a3-f393-e0a9-e50e24dcca9e');
      statusEl.textContent = "✅ micro:bit connectada";
    } catch (err) {
      console.error("❌ Error de connexió:", err);
      statusEl.textContent = "❌ No s'ha pogut connectar amb micro:bit";
    }
  };

  const faceMesh = new FaceMesh({
    locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  faceMesh.onResults(results => {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.multiFaceLandmarks.length > 0) {
      const lm = results.multiFaceLandmarks[0];

      const yaw = getYaw(lm);
      const mouth = getMouthOpen(lm);
      const eyeL = getEyeOpen(lm, true);
      const eyeR = getEyeOpen(lm, false);

      yawEl.textContent = yaw;
      mouthEl.textContent = mouth;
      eyeLEl.textContent = eyeL;
      eyeREl.textContent = eyeR;

      const smile = Math.round(distance(lm[61], lm[291]) * 10);
      const frown = Math.round((1 - distance(lm[70], lm[300])) * 10);
      const brows = Math.min(10, Math.max(0, Math.round((distance(lm[105], lm[66]) + distance(lm[334], lm[296])) * 50)));
      const pitch = Math.round((lm[10].y - lm[152].y) * 100);
      const roll = Math.round((lm[33].y - lm[263].y) * 100);

      smileEl.textContent = smile;
      frownEl.textContent = frown;
      browsEl.textContent = brows;
      pitchEl.textContent = pitch;
      rollEl.textContent = roll;

      if (uartCharacteristic) {
        const data = yaw.toString().padStart(2, '0') + mouth.toString().padStart(2, '0') + eyeL + eyeR +
                       smile.toString().padStart(3, '0') +
                       brows.toString().padStart(3, '0') +
                       frown.toString().padStart(3, '0');
        const encoder = new TextEncoder();
        uartCharacteristic.writeValue(encoder.encode(data + "\\n"));
      }

      drawConnectors(ctx, lm, FACEMESH_FACE_OVAL, { color: '#00FF00', lineWidth: 2 });
      drawConnectors(ctx, lm, FACEMESH_LEFT_EYE, { color: '#0000FF', lineWidth: 1 });
      drawConnectors(ctx, lm, FACEMESH_RIGHT_EYE, { color: '#0000FF', lineWidth: 1 });
      drawConnectors(ctx, lm, FACEMESH_LIPS, { color: '#FF0000', lineWidth: 2 });
        drawConnectors(ctx, lm, FACEMESH_RIGHT_EYEBROW, { color: '#FFA500', lineWidth: 2 });
        drawConnectors(ctx, lm, FACEMESH_LEFT_EYEBROW, { color: '#FFA500', lineWidth: 2 });
    }

    ctx.restore();
  });

  function distance(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }

  function getYaw(lm) {
    const dx = lm[454].x - lm[234].x;
    const nx = (lm[1].x - lm[234].x) / dx;
    return Math.max(0, Math.min(99, Math.round((nx - 0.5) * 20 + 5)));
  }

  function getMouthOpen(lm) {
    return Math.max(0, Math.min(99, Math.round(distance(lm[13], lm[14]) * 100)));
  }

  function getEyeOpen(lm, left) {
    const top = lm[left ? 159 : 386];
    const bot = lm[left ? 145 : 374];
    return distance(top, bot) * 100 > 1.5 ? 1 : 0;
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      });
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const camera = new Camera(video, {
          onFrame: async () => {
            await faceMesh.send({ image: video });
          },
          width: 640,
          height: 480
        });
        setTimeout(() => camera.start(), 300);
      };
    } catch (err) {
      alert("Error accedint a la càmera: " + err.message);
    }
  }

  startCamera();
