import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path, { join } from "path";
import { SerialOperateEnum } from "serial/types/operate";

interface iConfig {
    min: number;
    max: number;
    type: SerialOperateEnum;
}

class Config implements iConfig {
    private path: string = path.resolve(process.env.APPDATA!, "Pishock-Buttplugio", "config.json")
    public min: number = 0;
    public max: number = 0;
    public type: SerialOperateEnum = SerialOperateEnum.VIBRATE
    constructor() {
        this.load()
    }

    toJSON(): iConfig {
        return {
            min: this.min,
            max: this.max,
            type: this.type
        }
    }

    load() {
        try {
            if (existsSync(this.path)) {
                const read: iConfig = JSON.parse(readFileSync(this.path, "utf-8"))
                if (read.min) this.min = read.min;
                if (read.max) this.max = read.max;
                if (read.type) this.type = read.type;
            }
        } catch(e) {
            console.error("Error loading config! Using defaults.", e)
        }
    }

    save() {
        if (!existsSync(join(this.path, ".."))) mkdirSync(join(this.path, ".."))
        writeFileSync(this.path, JSON.stringify(this.toJSON()))
    }
}

const config = new Config();
export default config;