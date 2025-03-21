import { connectButtplug } from "buttplug";
import editIntifaceConfig from "buttplug/addconfig";
import runDebugCommands, { flags } from "debugcommands";
import { findSerialPort, GlobalPort, sendCommand } from "serial";
import { SerialCommandEnum } from "serial/types";
import runConsole from "./console";

(async () => {
  console.log("Finding serial port...");
  while (!GlobalPort.port) {
    try {
      await findSerialPort();
    } catch (e) {
      console.error("Error finding serial port:", e);
    }
  }
  console.log("Found serial port:", GlobalPort.portName);

  setInterval(() => {
    if (GlobalPort.port) sendCommand({ cmd: SerialCommandEnum.INFO });
  }, 10000);

  runDebugCommands();

  if (!flags.shouldSuppressConsole) runConsole();

  editIntifaceConfig();
  connectButtplug();
})();
