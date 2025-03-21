import { connectButtplug, initPersistTimer } from "buttplug";
import editIntifaceConfig from "buttplug/addconfig";
import runDebugCommands, { flags } from "debugcommands";
import { findSerialPort, GlobalPort, sendCommand } from "serial";
import { SerialCommandEnum } from "serial/types";
import runConsole from "./console";

(async () => {
  if (flags.debugLogs) console.log("Finding serial port...");
  while (!GlobalPort.port) {
    try {
      await findSerialPort();
    } catch (e) {
      console.error("Error finding serial port:", e);
    }
  }
  if (flags.debugLogs) console.log("Found serial port:", GlobalPort.portName);

  setInterval(() => {
    if (GlobalPort.port) sendCommand({ cmd: SerialCommandEnum.INFO });
  }, 10000);

  runDebugCommands();

  if (!flags.shouldSuppressConsole) runConsole();

  editIntifaceConfig();
  connectButtplug();

  initPersistTimer();
})();
