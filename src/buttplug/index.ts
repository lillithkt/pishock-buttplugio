import config from "config";
import { flags } from "debugcommands";
import { GlobalPort, sendCommand } from "serial";
import { SerialCommandEnum } from "serial/types";
import WebSocket from "ws";

const DEVICE_ADDRESS = "P1SH0CK";
const WS_URL = "ws://127.0.0.1:54817";

export function getInRange(value: number) {
  return config.min + (value / 100) * (config.max - config.min);
}
export function connectButtplug() {
  const ws = new WebSocket(WS_URL, { handshakeTimeout: 500 });

  ws.on("open", () => {
    if (flags.debugLogs) console.log("Connected");
    ws.send(
      JSON.stringify({
        identifier: "PiShock",
        address: DEVICE_ADDRESS,
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
      ws.send(`Z:${DEVICE_ADDRESS}:10`);
    } else if (packet.startsWith("Vibrate:")) {
      if (flags.debugLogs) console.log(`Got Vibrate Request: ${packet}`);
      if (!GlobalPort.info?.shockers[0]) {
        console.error("Got vibrate but no shockers connected!");
        return;
      }
      sendCommand({
        cmd: SerialCommandEnum.OPERATE,
        value: {
          id: GlobalPort.info?.shockers[0].id.toString(),
          duration: 10000,
          intensity: getInRange(Number(packet.match(/\d+/))),
          op: config.type,
        },
      });
    }
  });

  ws.on("error", (err) => console.error("WebSocket Error:", err));

  ws.on("close", () => {
    console.log("Disconnected. Reconnecting in", 1000, "ms");
    setTimeout(connectButtplug, 1000);
  });
}
