import { describe, expect, it } from "vitest";
import { findSerialPort, GlobalPort } from "../src/serial";


describe("Serial", {
    timeout: 10000
}, () => {
    it("should find a valid serial port with version info", async () => {
        const result = await findSerialPort();
        expect(result).not.toBeNull();
        expect(result).toHaveProperty("port");
        expect(result).toHaveProperty("portName");
    });

    it("should get a valid terminfo", async () => {
        expect(GlobalPort).not.toBeNull();
        expect(GlobalPort).toHaveProperty("info");
        expect(GlobalPort.info).toHaveProperty("ownerId");
    })
});