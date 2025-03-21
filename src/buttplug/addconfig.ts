import { flags } from "debugcommands";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const config = {
  protocols: {
    lovense: {
      communication: [{ websocket: { name: "PiShock" } }],
      configurations: [],
    },
  },
  devices: [
    {
      identifier: {
        protocol: "lovense",
        identifier: "Z",
        address: "P1SH0CK",
      },
      config: {
        name: "PiShock",
        features: [
          {
            description: "",
            "feature-type": "Vibrate",
            actuator: {
              "step-range": [0, 100],
              "step-limit": [0, 100],
              messages: ["ScalarCmd"],
            },
          },
        ],
        "user-config": { allow: false, deny: false, index: 0 },
      },
    },
  ],
};

export const getIntifaceConfigPath = () =>
  path.join(
    process.env.APPDATA || "%appdata%",
    "com.nonpolynomial",
    "intiface_central",
    "config",
    "buttplug-user-device-config-v3.json"
  );
export function getEditedIntifaceConfig(): string {
  const configPath = getIntifaceConfigPath();
  if (!existsSync(configPath)) {
    return JSON.stringify({
      version: { major: 3, minor: 0 },
      "user-configs": config,
    });
  }

  try {
    const currentConfig: {
      "user-configs": typeof config;
    } = JSON.parse(readFileSync(configPath, "utf-8"));

    if (!currentConfig["user-configs"].protocols.lovense)
      // @ts-expect-error fill in missing fields
      currentConfig["user-configs"].protocols.lovense = {};
    if (!currentConfig["user-configs"].protocols.lovense.communication)
      currentConfig["user-configs"].protocols.lovense.communication = [];
    if (
      !currentConfig["user-configs"].protocols.lovense.communication.find(
        (c) => c.websocket
      )
    )
      currentConfig["user-configs"].protocols.lovense.communication.push({
        websocket: { name: "PiShock" },
      });
    if (!currentConfig["user-configs"].protocols.lovense.configurations)
      currentConfig["user-configs"].protocols.lovense.configurations = [];
    if (!currentConfig["user-configs"].devices)
      currentConfig["user-configs"].devices = [];
    if (
      !currentConfig["user-configs"].devices.find(
        (d) =>
          d.identifier.protocol === "lovense" &&
          d.identifier.identifier === "Z" &&
          d.identifier.address === "P1SH0CK"
      )
    ) {
      currentConfig["user-configs"].devices.push(config.devices[0]);
    } else {
      currentConfig["user-configs"].devices.find(
        (d) =>
          d.identifier.protocol === "lovense" &&
          d.identifier.identifier === "Z" &&
          d.identifier.address === "P1SH0CK"
      )!.config = config.devices[0].config;
    }

    return JSON.stringify(currentConfig);
  } catch {
    return JSON.stringify({
      version: { major: 3, minor: 0 },
      "user-configs": config,
    });
  }
}
export default function editIntifaceConfig() {
  const configPath = getIntifaceConfigPath();
  const editedConfig = getEditedIntifaceConfig();
  if (process.env.DOCKER === "true") {
    console.log("Please write the following json file to " + configPath);
    console.log(editedConfig);
    return;
  }
  writeFileSync(configPath, editedConfig);
  if (flags.debugLogs) console.log("Config file created at", configPath);
}
