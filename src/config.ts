import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path, { join } from "path";
import { SerialOperateEnum } from "serial/types/operate";

import os from "os";

interface iConfig {
  min: number;
  max: number;
  type: SerialOperateEnum;
  wifiSSID: string | null;
  wifiPass: string | null;
  buttplugUrl: string;
}

function getConfigDir(): string {
  if (process.env.DOCKER === "true") {
    return "/data/config.json";
  }
  if (process.platform === "win32") {
    return path.resolve(
      process.env.APPDATA!,
      "PiShock-ButtplugIO",
      "config.json"
    );
  }
  return path.join(
    os.homedir(),
    ".config",
    "PiShock-ButtplugIO",
    "config.json"
  );
}

class Config implements iConfig {
  private path: string = getConfigDir();
  public min: number = 0;
  public max: number = 0;
  public type: SerialOperateEnum = SerialOperateEnum.VIBRATE;
  public wifiSSID: string | null = null;
  public wifiPass: string | null = null;
  public buttplugUrl: string = "ws://127.0.0.1:54817";
  constructor() {
    this.load();
  }

  toJSON(): iConfig {
    return {
      min: this.min,
      max: this.max,
      type: this.type,
      wifiSSID: this.wifiSSID,
      wifiPass: this.wifiPass,
      buttplugUrl: this.buttplugUrl,
    };
  }

  load() {
    try {
      if (existsSync(this.path)) {
        const read: iConfig = JSON.parse(readFileSync(this.path, "utf-8"));
        if (read.min) this.min = read.min;
        if (read.max) this.max = read.max;
        if (read.type) this.type = read.type;
        if (read.wifiSSID) this.wifiSSID = read.wifiSSID;
        if (read.wifiPass) this.wifiPass = read.wifiPass;
        if (read.buttplugUrl) this.buttplugUrl = read.buttplugUrl;
      }
    } catch (e) {
      console.error("Error loading config! Using defaults.", e);
    }
  }

  save() {
    if (!existsSync(join(this.path, ".."))) mkdirSync(join(this.path, ".."));
    writeFileSync(this.path, JSON.stringify(this.toJSON()));
  }
}

const config = new Config();
export default config;
