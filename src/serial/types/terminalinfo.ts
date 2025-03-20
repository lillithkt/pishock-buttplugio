export default interface iTerminalInfo {
    version: string;
    type: number;
    connected: boolean;
    wifi: string;
    server: string;
    macaddress: string;
    shockers: {
        id: number;
        type: number;
        paused: boolean;
    }[];
    networks: {
        ssig: string;
        password: string;
    }[];
    claimed: boolean;
    isDev: boolean;
    publisher: boolean;
    polled: boolean;
    subscriber: boolean;
    publicIp: string;
    internet: boolean;
    ownerId: number;
}