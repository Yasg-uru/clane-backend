import crypto from "crypto";

export class EncryptionService {
  private static readonly ALGORITHM = "aes-256-gcm";
  private static readonly IV_BYTES = 16;

  static encryptToken(plaintext: string, hexKey: string): string {
    const key = Buffer.from(hexKey, "hex");
    const iv = crypto.randomBytes(EncryptionService.IV_BYTES);
    const cipher = crypto.createCipheriv(EncryptionService.ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [iv.toString("hex"), tag.toString("hex"), encrypted.toString("hex")].join(":");
  }

  static decryptToken(ciphertext: string, hexKey: string): string {
    const key = Buffer.from(hexKey, "hex");
    const parts = ciphertext.split(":");
    const ivHex = parts[0];
    const tagHex = parts[1];
    const encryptedHex = parts[2];
    if (!ivHex || !tagHex || !encryptedHex || parts.length !== 3) {
      throw new Error("Invalid ciphertext format");
    }
    const decipher = crypto.createDecipheriv(
      EncryptionService.ALGORITHM,
      key,
      Buffer.from(ivHex, "hex"),
    );
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    return (
      decipher.update(Buffer.from(encryptedHex, "hex")).toString("utf8") +
      decipher.final("utf8")
    );
  }
}
