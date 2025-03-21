import { GlobalPort, sendCommand } from "serial";
import { SerialCommandEnum } from "serial/types";
import { SerialCommandOperate, SerialOperateEnum } from "serial/types/operate";

import readline from "readline";

export const flags = {
  shouldSuppressConsole: false,
  debugLogs: false,
};

export default async function runDebugCommands() {
  if (process.argv.includes("--serial")) await serialDebug(true);
  if (process.argv.includes("--seriallogs")) await serialDebug(false);
  if (process.argv.includes("--vibrate")) await vibrateDebug();
  if (process.argv.includes("--shock")) await shockDebug();
  if (process.argv.includes("--debug")) flags.debugLogs = true;
}

function serialDebug(shouldEnterReadline: boolean = true) {
  console.log("Opening SerialPort debug console...");

  if (shouldEnterReadline) {
    flags.shouldSuppressConsole = true;
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf-8");
    readline.emitKeypressEvents(process.stdin);

    let currentInput = "";

    process.stdin.on("keypress", (chunk, key) => {
      if (key?.sequence === "\x03") {
        // Handle Ctrl+C properly
        process.stdin.setRawMode(false);
        process.exit();
      } else if (key?.name === "return") {
        GlobalPort.port!.write(currentInput + "\n");
        currentInput = "";
        redrawInput();
      } else if (key?.name === "backspace") {
        currentInput = currentInput.slice(0, -1);
        redrawInput();
      } else if (!key?.ctrl && chunk) {
        currentInput += chunk;
        redrawInput();
      }
    });

    function redrawInput() {
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      process.stdout.write("> " + currentInput);
    }

    GlobalPort.port!.on("data", (data) => {
      const str = data.toString();
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(str);
      redrawInput();
    });

    function overrideConsoleMethod(method: "log" | "warn" | "error") {
      const original = console[method];
      console[method] = (...args) => {
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        original(...args);
        redrawInput();
      };
    }

    overrideConsoleMethod("log");
    overrideConsoleMethod("warn");
    overrideConsoleMethod("error");

    redrawInput();
  } else {
    GlobalPort.port!.on("data", (data) => {
      process.stdout.write(data.toString());
    });
  }
}

function vibrateDebug() {
  const command: SerialCommandOperate = {
    cmd: SerialCommandEnum.OPERATE,
    value: {
      id: GlobalPort.info!.shockers[0]!.id.toString(),
      op: SerialOperateEnum.VIBRATE,
      duration: 1000,
      intensity: 100,
    },
  };
  sendCommand(command);
}
function shockDebug() {
  const command: SerialCommandOperate = {
    cmd: SerialCommandEnum.OPERATE,
    value: {
      id: GlobalPort.info!.shockers[0]!.id.toString(),
      op: SerialOperateEnum.SHOCK,
      duration: 300,
      intensity: 10,
    },
  };
  sendCommand(command);
}
