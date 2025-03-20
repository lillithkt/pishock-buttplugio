import { SerialPort } from "serialport";
import { SerialCommands } from "./types";
import type iTerminalInfo from "./types/terminalinfo";

export enum SerialCommandEnum {
    INFO = "info",
    OPERATE = "operate",
}

export interface LooseSerialCommand {
    cmd: SerialCommandEnum;
    value?: any;
}

const PISHOCK_BAUD = 115200;
const INFO_COMMAND = JSON.stringify({ cmd: "info" } as LooseSerialCommand) + "\n";
const TARGET_VENDOR_ID = "1A86";
const TERMINALINFO_REGEX = /(?<=TERMINALINFO: )\{.*ownerId":\d+\}/;

export const GlobalPort = {
    portName: null,
    port: null,
    info: null
} as {
    portName: string | null;
    port: SerialPort | null;
    info: iTerminalInfo | null;
}

export function sendCommand(command: SerialCommands) {
    if (!command.cmd) {
        throw new Error("Command must have a cmd property");
    }
    if (!GlobalPort.port) {
        throw new Error("Serial port not found");
    }
    GlobalPort.port.write(JSON.stringify(command) + "\n");
}

async function closeExistingConnections(portPath: string) {
    const ports = await SerialPort.list();
    for (const port of ports) {
        if (port.path === portPath) {
            try {
                const existingPort = new SerialPort({ path: port.path, baudRate: PISHOCK_BAUD, autoOpen: false });
                existingPort.close(() => {});
            } catch (error) {
                console.error(`Failed to close existing connection on ${port.path}:`, error);
            }
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
                autoOpen: false
            });

            await new Promise<void>((resolve, reject) => serialPort.open(err => err ? reject(err) : resolve()));
            
            serialPort.flush(() => {
                serialPort.write(INFO_COMMAND, async (err) => {
                    if (err) {
                        console.error(`Write error on port ${port.path}:`, err);
                        serialPort.close();
                        return;
                    }
                    await serialPort.drain();
                });
            });
            
            const info = await new Promise<iTerminalInfo>((resolve, reject) => {
                let data = "";
                const timeout = setTimeout(() => {
                    serialPort.off("data", listener);
                    reject(new Error("Timeout"))}, 4000);
                const listener = (chunk: { toString(): string}) => {
                    data += chunk.toString();
                    
                    if (data.includes("TERMINALINFO")) {
                        const match = data.match(TERMINALINFO_REGEX);
                        if (match) {
                            serialPort.off("data", listener);
                            clearTimeout(timeout);
                            resolve(JSON.parse(match[0]));
                        }
                    }
                }
                

                serialPort.on("data", listener);
            });

            // auto reconnect
            serialPort.on("close", () => {
                console.log("Port closed, reconnecting...");
                serialPort.open();
            });
            
            GlobalPort.portName = port.path;
            GlobalPort.port = serialPort;
            GlobalPort.info = info;
            return GlobalPort;
        } catch (error) {
            console.error(`Error on port ${port.path}:`, error);
        }
    }
    return null;
}
