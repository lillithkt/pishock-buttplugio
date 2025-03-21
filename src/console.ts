import { getInRange } from "buttplug";
import editIntifaceConfig from "buttplug/addconfig";
import config from "config";
import { createInterface } from "readline";
import { GlobalPort, sendCommand } from "serial";
import { SerialCommandEnum } from "serial/types";
import { SerialOperateEnum } from "serial/types/operate";

const commands: Record<string, (args: string[]) => void> = {
  help: () => {
    console.log("# Commands:");
    Object.keys(commands).map((i) => console.log("- " + i));
  },
  dumpconfig: () => {
    console.log(JSON.stringify(config.toJSON()));
  },
  min: (args) => {
    if (!args[0]) console.error("Please put a number after the command!");
    config.min = Number(args[0]);
    config.save();
    console.log("Minimum set to " + args[0]);
  },
  minimum: (args) => commands.min(args),
  max: (args) => {
    if (!args[0]) console.error("Please put a number after the command!");
    config.max = Number(args[0]);
    config.save();
    console.log("Maximum set to " + args[0]);
  },
  maximum: (args) => commands.max(args),

  testrange: (args) => {
    const val = Number(args[0]);
    const inRange = getInRange(val);
    console.log("Input: " + val + ". Output: " + inRange);
  },

  vibrate: () => {
    config.type = SerialOperateEnum.VIBRATE;
    config.save();
    console.log("Intiface will now vibrate");
  },
  shock: () => {
    config.type = SerialOperateEnum.SHOCK;
    config.save();
    console.log("Intiface will now shock!");
  },

  wifi: (args) => {
    if (args.length !== 2)
      return console.error("Please input a wifi name and password");
    config.wifiSSID = args[0];
    config.wifiPass = args[1];
    config.save();
    console.log(
      "Registered a new wifi network. This will be added when the pishock resets it."
    );
  },

  restart: () => {
    console.log("Restarting PiShock...");
    sendCommand({ cmd: SerialCommandEnum.RESTART });
  },

  buttplugip: (args) => {
    if (!args.length)
      return console.log(
        "This command sets the buttplug.io url, for if you are running this on another device"
      );
    config.buttplugIP = args[0];
    config.save();
    console.log("Buttplug.io url set to " + config.buttplugIP);
  },

  listshockers: () => {
    console.log("Shockers: ");
    GlobalPort.info?.shockers.map((i) => {
      console.log(i.id);
    });
  },

  testshock: (args) => {
    if (!args.length)
      return console.log(
        "This command shocks at 10% for 0.3s. Please enter a shocker name from `listshockers`"
      );
    sendCommand({
      cmd: SerialCommandEnum.OPERATE,
      value: {
        op: SerialOperateEnum.SHOCK,
        duration: 300,
        intensity: 10,
        id: args[0],
      },
    });
    console.log("Shocking at 10% for 0.3s!");
  },
  testvibrate: (args) => {
    if (!args.length)
      return console.log(
        "This command vibrates at 100% for 2s. Please enter a shocker name from `listshockers`"
      );
    sendCommand({
      cmd: SerialCommandEnum.OPERATE,
      value: {
        op: SerialOperateEnum.VIBRATE,
        duration: 2000,
        intensity: 100,
        id: args[0],
      },
    });
    console.log("Vibrating at 100% for 2s!");
  },

  name: (args) => {
    if (args.length < 2)
      return console.log(
        "This command names a shocker. The first argument is the shocker id from `listshockers`, the second is the name"
      );
    if (!GlobalPort.info!.shockers.find((i) => i.id === Number(args[0])))
      return console.log("That shocker does not exist!");
    const name = args.slice(1).join(" ");
    config.shockerNames[Number(args[0])] = name;
    config.save();
    editIntifaceConfig();
    console.log(
      `Shocker ${args[0]} is now named ${name}. Restart your intiface to see the changes!`
    );
  },
} as const;

export default function runConsole() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("line", (line) => {
    const commandName = line.split(" ")[0];
    const command = commands[commandName.toLowerCase()];
    if (!command) console.error("Command Not Found!");
    command(line.split(" ").slice(1));
  });

  commands.help([]);
}
