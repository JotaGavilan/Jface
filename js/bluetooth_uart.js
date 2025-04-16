
// Gestión de la conexión Bluetooth con micro:bit vía UART
const UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const UART_TX_CHARACTERISTIC_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const UART_RX_CHARACTERISTIC_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

let uBitDevice;
let rxCharacteristic = null;
let uart = null;
let queue = Promise.resolve();

function queueGattOperation(operation) {
  queue = queue.then(operation, operation);
  return queue;
}

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

    uart = await service.getCharacteristic(UART_RX_CHARACTERISTIC_UUID);

    statusEl.textContent = '✅ micro:bit connectada';
  } catch (e) {
    console.error(e);
    statusEl.textContent = '❌ Error en la connexió';
  }
};

function onTxCharacteristicValueChanged(event) {
  const receivedData = new Uint8Array(event.target.value.buffer);
  const receivedString = String.fromCharCode(...receivedData);
  console.log("📥 Received from micro:bit:", receivedString);
}

function onDisconnected(event) {
  const device = event.target;
  console.log(`🔌 Disconnected from ${device.name}`);
  rxCharacteristic = null;
  uart = null;
}

function sendUARTData(data) {
  if (!uart) return;
  const encoded = new TextEncoder().encode(data + "\n");
  queueGattOperation(() => uart.writeValue(encoded)
    .then(() => console.log("📤 UART enviado:", data))
    .catch(err => console.error("❌ Error al enviar por UART:", err)));
}
