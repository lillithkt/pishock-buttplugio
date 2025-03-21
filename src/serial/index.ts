import config from "config";
import { SerialPort } from "serialport";
import { SerialCommandEnum, SerialCommands } from "./types";
import type iTerminalInfo from "./types/terminalinfo";

const PISHOCK_BAUD = 115200;
const TARGET_VENDOR_ID = "1A86";
const TERMINALINFO_REGEX = /(?<=TERMINALINFO: )\{.*ownerId":\d+\}/;

export const GlobalPort = {
  portName: null,
  port: null,
  info: null,
} as {
  portName: string | null;
  port: SerialPort | null;
  info: iTerminalInfo | null;
};

export function sendCommand(command: SerialCommands, port?: SerialPort) {
  if (!command.cmd) {
    throw new Error("Command must have a cmd property");
  }
  let newPort = port;
  if (!newPort) newPort = GlobalPort.port || undefined;
  if (!newPort) {
    throw new Error("Serial port not found");
  }

  newPort.write(JSON.stringify(command) + "\n");
}

async function closeExistingConnections(portPath: string) {
  const ports = await SerialPort.list();
  for (const port of ports) {
    if (port.path === portPath) {
      try {
        const existingPort = new SerialPort({
          path: port.path,
          baudRate: PISHOCK_BAUD,
          autoOpen: false,
        });
        existingPort.close(() => {});
      } catch (error) {
        console.error(
          `Failed to close existing connection on ${port.path}:`,
          error
        );
      }
    }
  }
}

function parseTermInfo() {
  console.log("TERMINFO found");
  const networks = GlobalPort.info!.networks.filter(
    (i) => i.ssid !== "PiShock"
  ); // Stock wifi
  if (networks.length === 0) {
    if (config.wifiSSID && config.wifiPass) {
      console.log("Networks reset. Re-Adding user-specified networks");
      sendCommand({
        cmd: SerialCommandEnum.ADDNETWORK,
        value: {
          ssid: config.wifiSSID,
          password: config.wifiPass,
        },
      });
    } else {
      console.warn(
        "Networks reset! You will need to add them again, or run the `wifi` command"
      );
    }
  }
}

export async function findSerialPort(): Promise<typeof GlobalPort | null> {
  const ports = await SerialPort.list();
  for (const port of ports) {
    if (port.vendorId !== TARGET_VENDOR_ID) continue;

    try {
      closeExistingConnections(port.path);
      const serialPort = new SerialPort({
        path: port.path,
        baudRate: PISHOCK_BAUD,
        autoOpen: false,
      });

      await new Promise<void>((resolve, reject) =>
        serialPort.open((err) => (err ? reject(err) : resolve()))
      );

      sendCommand(
        {
          cmd: SerialCommandEnum.INFO,
        },
        serialPort
      );

      await new Promise<void>((resolve, reject) => {
        let data = "";
        const timeout = setTimeout(() => {
          reject(new Error("Timeout"));
        }, 4000);
        const listener = (chunk: { toString(): string }) => {
          data += chunk.toString();

          if (data.includes("TERMINALINFO")) {
            const match = data.match(TERMINALINFO_REGEX);
            if (match) {
              data = "";
              clearTimeout(timeout);
              GlobalPort.info = JSON.parse(match[0]);
              GlobalPort.portName = port.path;
              GlobalPort.port = serialPort;
              parseTermInfo();
              resolve();
            }
          }
        };

        serialPort.on("data", listener);
      });

      // auto reconnect
      serialPort.on("close", () => {
        console.log("Port closed, reconnecting...");
        serialPort.open();
      });

      return GlobalPort;
    } catch (error) {
      console.error(`Error on port ${port.path}:`, error);
    }
  }
  return null;
}
