import runDebugCommands from "debugcommands";
import { findSerialPort, GlobalPort } from "serial";

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
})();



