import * as crypto from 'crypto';

export class CryptoUtil {
  static generateHash(data: string, algorithm: string = 'sha256'): string {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }

  static generateRandomToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static generateUUID(): string {
    return crypto.randomUUID();
  }

  static compareHash(data: string, hash: string, algorithm: string = 'sha256'): boolean {
    const dataHash = this.generateHash(data, algorithm);
    return crypto.timingSafeEqual(Buffer.from(dataHash), Buffer.from(hash));
  }
}
