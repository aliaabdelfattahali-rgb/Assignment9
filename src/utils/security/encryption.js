import crypto from "crypto";

const getSecretKey = () => Buffer.from(process.env.ENCRYPTION_KEY, "hex");

export const encryption = (data) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", getSecretKey(), iv);
  let cipherText = cipher.update(data, "utf8", "hex");
  cipherText += cipher.final("hex");
  return `${iv.toString("hex")}:${cipherText}`;
};

export const decryption = (encryptedValue) => {
  const [iv, cipherText] = encryptedValue.split(":");
  if (!iv || !cipherText) {
    const err = new Error("in-valid encrypted value");
    err.status = 400;
    throw err;
  }
  const binaryIv = Buffer.from(iv, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", getSecretKey(), binaryIv);
  let plaintext = decipher.update(cipherText, "hex", "utf8");
  plaintext += decipher.final("utf8");
  return plaintext;
};
