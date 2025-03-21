import { SerialCommandAddNetwork } from "./addnetwork";
import { SerialCommandOperate } from "./operate";
import { SerialCommandTermInfo } from "./terminalinfo";
export enum SerialCommandEnum {
  INFO = "info",
  OPERATE = "operate",
  ADDNETWORK = "addnetwork",
}

export interface LooseSerialCommand {
  cmd: SerialCommandEnum;
  value?: any;
}

export type SerialCommands =
  | SerialCommandOperate
  | SerialCommandTermInfo
  | SerialCommandAddNetwork;
