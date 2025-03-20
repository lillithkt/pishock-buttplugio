import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const config = {
    "protocols": {
      "lovense": {
        "communication": [{ "websocket": { "name": "PiShock" } }],
        "configurations": []
      }
    },
    "devices": [
      {
        "identifier": {
          "protocol": "lovense",
          "identifier": "Z",
          "address": "P1SH0CK"
        },
        "config": {
          "name": "PiShock",
          "features": [
            {
              "description": "",
              "feature-type": "Vibrate",
              "actuator": {
                "step-range": [0, 100],
                "step-limit": [0, 100],
                "messages": ["ScalarCmd"]
              }
            }
          ],
          "user-config": { "allow": false, "deny": false, "index": 0 }
        }
      }
    ]
  }


  

const ConfigPath = path.join(process.env.APPDATA!, "com.nonpolynomial", "intiface_central", "config", "buttplug-user-device-config-v3.json");
export default function editIntifaceConfig() {
    if (!existsSync(ConfigPath)) {
        writeFileSync(ConfigPath, JSON.stringify({
          "version": { "major": 3, "minor": 0 },
          "user-configs": config
      }));
        console.log("Config file created at", ConfigPath);
        return;
    }

    try {

        const currentConfig: {
          "user-configs": typeof config
         } = JSON.parse(readFileSync(ConfigPath, "utf-8"));
        // @ts-expect-error fill in missing fields
        if (!currentConfig["user-configs"].protocols.lovense) currentConfig["user-configs"].protocols.lovense = {};
        if (!currentConfig["user-configs"].protocols.lovense.communication) currentConfig["user-configs"].protocols.lovense.communication = [];
        if (!currentConfig["user-configs"].protocols.lovense.communication.find((c) => c.websocket)) currentConfig["user-configs"].protocols.lovense.communication.push({ "websocket": { "name": "PiShock" } });
        if (!currentConfig["user-configs"].protocols.lovense.configurations) currentConfig["user-configs"].protocols.lovense.configurations = [];
        if (!currentConfig["user-configs"].devices) currentConfig["user-configs"].devices = [];
        if (!currentConfig["user-configs"].devices.find((d) => d.identifier.protocol === "lovense" && d.identifier.identifier === "Z" && d.identifier.address === "P1SH0CK")) {
          currentConfig["user-configs"].devices.push(
            config.devices[0]
        )}else {
          currentConfig["user-configs"].devices.find((d) => d.identifier.protocol === "lovense" && d.identifier.identifier === "Z" && d.identifier.address === "P1SH0CK")!.config = config.devices[0].config;
        }

        writeFileSync(ConfigPath, JSON.stringify(currentConfig));
        console.log("Config file updated at", ConfigPath);

    } catch {
        writeFileSync(ConfigPath, JSON.stringify(config));
        console.log("Config file created at", ConfigPath);
    }
}