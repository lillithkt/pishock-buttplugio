import { connectButtplug } from "buttplug";
import editIntifaceConfig from "buttplug/addconfig";
import runDebugCommands, { flags } from "debugcommands";
import { findSerialPort, GlobalPort } from "serial";
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

    runDebugCommands();

    if (!flags.shouldSuppressConsole) runConsole();

    editIntifaceConfig();
    connectButtplug();
})();



