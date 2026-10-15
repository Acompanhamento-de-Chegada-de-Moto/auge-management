import "server-only";
import {
  createHash,
  randomBytes,
  randomInt,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const deriveKey = promisify(scrypt);
export const generatePin = () =>
  String(randomInt(0, 100_000_000)).padStart(8, "0");
export const generateToken = () => randomBytes(32).toString("hex");
export const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export async function hashPin(pin: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await deriveKey(pin, salt, 64)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}

export async function verifyPin(pin: string, encoded: string) {
  const [salt, digest] = encoded.split(":");
  if (!salt || !digest) return false;
  const key = (await deriveKey(pin, salt, 64)) as Buffer;
  const expected = Buffer.from(digest, "hex");
  return key.length === expected.length && timingSafeEqual(key, expected);
}
