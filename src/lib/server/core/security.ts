import crypto from "node:crypto";
import {DEFAULT_SCRYPT_METHOD} from "~/lib/utils/constants";


const derivePassword = (password: string, salt: string, method: string) => {
    const parameters = /^scrypt:([1-9]\d*):([1-9]\d*):([1-9]\d*)$/.exec(method === "scrypt" ? DEFAULT_SCRYPT_METHOD : method);
    if (!parameters) {
        throw new Error("Unsupported password hash method");
    }

    const [, n, r, p] = parameters;

    return crypto.scryptSync(password, salt, 64, { N: Number(n), r: Number(r), p: Number(p), maxmem: 1024 * 1024 * 1024 });
};


export const checkWerkzeugPassword = (password: string, pwhash: string) => {
    const parts = pwhash.split("$");
    if (parts.length !== 3) return false;

    const [method, salt, storedHash] = parts;
    if (!/^[a-f\d]{128}$/i.test(storedHash)) return false;

    try {
        return crypto.timingSafeEqual(Buffer.from(storedHash, "hex"), derivePassword(password, salt, method));
    }
    catch {
        return false;
    }
};


export const generatePasswordHash = (password: string, method = DEFAULT_SCRYPT_METHOD, saltLength = 16) => {
    const salt = crypto.randomBytes(Math.ceil(saltLength * 3 / 4))
        .toString("base64url")
        .slice(0, saltLength);

    return `${method}$${salt}$${derivePassword(password, salt, method).toString("hex")}`;
};
