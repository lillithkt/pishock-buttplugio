import { GlobalPort, sendCommand } from "serial";
import { SerialCommandEnum } from "serial/types";
import { SerialCommandOperate, SerialOperateEnum } from "serial/types/operate";

import readline from "readline";

export const flags = {
  shouldSuppressConsole: false,
  debugLogs: false,
};

export default async function runDebugCommands() {
  if (process.argv.includes("-h") || process.argv.includes("--help"))
    sendHelpCommand();
  if (process.argv.includes("--serial")) await serialDebug(true);
  if (process.argv.includes("--seriallogs")) await serialDebug(false);
  if (process.argv.includes("--vibrate")) await vibrateDebug();
  if (process.argv.includes("--shock")) await shockDebug();
  if (process.argv.includes("--debug")) flags.debugLogs = true;
}

function sendHelpCommand() {
  console.log(
    "Normally, this program is run without any arguments. However, there are certian ones for debug usage."
  );
  console.log("--help or -h shows this message!");
  console.log(
    "--serial opens a serial console where you can interface with the pishock hub"
  );
  console.log("--seriallogs just outputs the hub's logs to the console");
  console.log(
    "--vibrate sends a vibrate at 100 for 1 second to test your connection"
  );
  console.log(
    "--shock shocks you at 10 for 0.3 seconds to test your connection"
  );
  console.log("--debug outputs extra debug logs");
  console.log(
    "Your config file is stored at AppData/Roaming/Pishock-Buttplugio/config.json if you would like to edit it or check all the data i store."
  );
  process.exit(0);
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
