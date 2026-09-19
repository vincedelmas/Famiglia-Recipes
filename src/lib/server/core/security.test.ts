import {expect, test} from "bun:test";
import {scryptSync} from "node:crypto";
import {checkWerkzeugPassword, generatePasswordHash} from "./security";


test("verifies the scrypt parameters stored in Werkzeug hashes", () => {
    const digest = scryptSync("family-password", "fixture-salt", 64, { N: 16384, r: 8, p: 1 }).toString("hex");
    const hash = `scrypt:16384:8:1$fixture-salt$${digest}`;
    expect(checkWerkzeugPassword("family-password", hash)).toBe(true);
    expect(checkWerkzeugPassword("wrong-password", hash)).toBe(false);
});


test("new hashes and legacy plain scrypt hashes still verify", () => {
    const hash = generatePasswordHash("family-password");
    expect(checkWerkzeugPassword("family-password", hash)).toBe(true);
    expect(checkWerkzeugPassword("family-password", hash.replace(/^scrypt:[^$]+/, "scrypt"))).toBe(true);
});


test("malformed password hashes reject credentials without throwing", () => {
    for (const hash of ["", "scrypt$salt$abcd", "unknown$salt$abcd", "scrypt:invalid$salt$abcd"]) {
        expect(checkWerkzeugPassword("family-password", hash)).toBe(false);
    }
});
