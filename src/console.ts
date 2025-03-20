import { getInRange } from "buttplug";
import config from "config";
import { createInterface } from "readline";
import { SerialOperateEnum } from "serial/types/operate";

const commands: Record<string, (args: string[]) => void> = {
    help: () => {
        console.log("Commands:")
        Object.keys(commands).map(i=>console.log(i))
    },
    dumpconfig: () => {
        console.log(JSON.stringify(config.toJSON()))
    },
    min: (args) => {
        if (!args[0]) console.error("Please put a number after the command!")
        config.min = Number(args[0])
        config.save()
        console.log("Minimum set to " + args[0])
    },
    minimum: (args) => commands.min(args),
    max: (args) => {
        if (!args[0]) console.error("Please put a number after the command!")
        config.max = Number(args[0])
        config.save()
        console.log("Maximum set to " + args[0])
    },
    maximum: (args) => commands.max(args),

    testrange: (args) => {
        const val = Number(args[0])
        const inRange = getInRange(val);
        console.log("Input: " + val + ". Output: " + inRange)
    },

    vibrate: () => {
        config.type = SerialOperateEnum.VIBRATE;
        config.save();
        console.log("Intiface will now vibrate")
    },
    shock: () => {
        config.type = SerialOperateEnum.SHOCK;
        config.save();
        console.log("Intiface will now shock!")
    }
} as const;

export default function runConsole() {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on("line", (line) => {
        const commandName = line.split(" ")[0];
        const command = commands[commandName.toLowerCase()];
        if (!command) console.error("Command Not Found!")
        command(line.split(" ").slice(1))
    });

    commands.help([])
}