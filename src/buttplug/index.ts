import config from "config";
import { flags } from "debugcommands";
import { GlobalPort, sendCommand } from "serial";
import { SerialCommandEnum } from "serial/types";
import { SerialOperateEnum } from "serial/types/operate";
import WebSocket from "ws";

export const DEVICE_ADDRESS_PREFIX = "P1SH0CK";

export function getInRange(value: number) {
  return config.min + (value / 100) * (config.max - config.min);
}

let lastSentValue = 0;

function sendShock() {
  const level = getInRange(lastSentValue);
  sendCommand({
    cmd: SerialCommandEnum.OPERATE,
    value: {
      id: GlobalPort.info!.shockers[0].id.toString(),
      duration: 10000,
      intensity: level,
      op: level === 0 ? SerialOperateEnum.END : config.type,
    },
  });
}

export function initPersistTimer() {
  setInterval(sendShock, 5000);
}

export function connectButtplugForShocker(shockerID: number) {
  const ws = new WebSocket(`ws://${config.buttplugIP}:54817`, {
    handshakeTimeout: 500,
  });

  ws.on("open", () => {
    if (flags.debugLogs) console.log("Connected");
    ws.send(
      JSON.stringify({
        identifier: "PiShock",
        address: shockerID.toString(),
        version: 0,
      })
    );
    if (flags.debugLogs) console.log("Handshake sent");
  });

  ws.on("message", (data: WebSocket.Data) => {
    const packet = data.toString("utf-8");
    if (flags.debugLogs) console.log(`Got packet: ${packet}`);

    if (packet.startsWith("DeviceType;")) {
      if (flags.debugLogs) console.log("Got Device Type Request");
      ws.send(`Z:${DEVICE_ADDRESS_PREFIX}:10`);
    } else if (packet.startsWith("Vibrate:")) {
      if (flags.debugLogs) console.log(`Got Vibrate Request: ${packet}`);
      if (!GlobalPort.info?.shockers.find((i) => i.id === shockerID)) {
        console.error("Got vibrate but no shockers connected!");
        return;
      }
      lastSentValue = Number(packet.match(/\d+/));
      sendShock();
    }
  });

  ws.on("error", (err) => {
    if (flags.debugLogs) console.error("WebSocket Error:", err);
  });

  ws.on("close", () => {
    console.log("Please restart intiface!");
    setTimeout(() => connectButtplugForShocker(shockerID), 5000);
  });
}

export function connectButtplug() {
  for (const shocker of GlobalPort.info!.shockers) {
    connectButtplugForShocker(shocker.id);
  }
}
