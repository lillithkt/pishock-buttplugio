import { createInterface } from "readline";
import { GlobalPort, sendCommand, SerialCommandEnum } from "serial";
import { SerialCommandOperate, SerialOperateEnum } from "serial/types/operate";

export default async function runDebugCommands() {
    if (process.argv.includes("--serial")) await serialDebug();
    if (process.argv.includes("--vibrate")) await vibrateDebug();
    if (process.argv.includes("--shock")) await shockDebug();
}

function serialDebug() {
    console.log("Opening SerialPort debug console...");
        // flush buffer to serial port on enter
        // print serial port output to console
    
        const rl = createInterface({
            input: process.stdin,
            output: process.stdout
        });
    
        rl.on("line", (line) => {
            GlobalPort.port!.write(line + "\n");
        });

        GlobalPort.port!.on("data", (data) => {
            const str = data.toString();
            // write to stdout without newline
            process.stdout.write(str);
        })
}

function vibrateDebug() {
    const command: SerialCommandOperate = {
        cmd: SerialCommandEnum.OPERATE,
        value: {
            id: GlobalPort.info!.shockers[0]!.id.toString(),
            op: SerialOperateEnum.VIBRATE,
            duration: 1000,
            intensity: 100
        }
    }
    sendCommand(command);
}
function shockDebug() {
    const command: SerialCommandOperate = {
        cmd: SerialCommandEnum.OPERATE,
        value: {
            id: GlobalPort.info!.shockers[0]!.id.toString(),
            op: SerialOperateEnum.SHOCK,
            duration: 300,
            intensity: 10
        }
    }
    sendCommand(command);
}