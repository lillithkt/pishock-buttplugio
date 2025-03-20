import { SerialCommandEnum } from "serial";

export enum SerialOperateEnum {
    SHOCK = "shock",
    VIBRATE = "vibrate",
    BEEP = "beep",
    END = "end",
}

export interface SerialOperateValue {
    id: string;
    op: SerialOperateEnum;
    duration: number;
    intensity: number;
}

export type SerialCommandOperate = { cmd: SerialCommandEnum.OPERATE; value: SerialOperateValue };