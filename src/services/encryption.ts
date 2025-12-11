// End-to-end encryption service
import CryptoJS from 'crypto-js';

export interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
}

export class EncryptionService {
  private static generateKey(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 10000
    }).toString();
  }

  static encrypt(data: any, userKey: string): EncryptedData {
    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
    const iv = CryptoJS.lib.WordArray.random(128 / 8).toString();
    const key = this.generateKey(userKey, salt);
    
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return {
      data: encrypted.toString(),
      iv,
      salt
    };
  }

  static decrypt(encryptedData: EncryptedData, userKey: string): any {
    const key = this.generateKey(userKey, encryptedData.salt);
    
    const decrypted = CryptoJS.AES.decrypt(encryptedData.data, key, {
      iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  }

  static generateUserKey(): string {
    return CryptoJS.lib.WordArray.random(256 / 8).toString();
  }

  static hashPassword(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 10000
    }).toString();
  }
}

// Data anonymization utilities
export class AnonymizationService {
  static anonymizeReport(report: any): any {
    const anonymized = { ...report };
    
    // Remove personally identifiable information
    delete anonymized.contactEmail;
    delete anonymized.userId;
    
    // Generalize location data
    if (anonymized.location) {
      anonymized.location = {
        state: anonymized.location.state,
        country: anonymized.location.country
        // Remove city for privacy
      };
    }
    
    // Generalize timing
    if (anonymized.timing?.date) {
      const date = new Date(anonymized.timing.date);
      anonymized.timing.date = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    return anonymized;
  }

  static applyDifferentialPrivacy(data: number[], epsilon: number = 1.0): number[] {
    // Simple Laplace mechanism for differential privacy
    const sensitivity = 1; // Assuming count queries
    const scale = sensitivity / epsilon;
    
    return data.map(value => {
      const noise = this.generateLaplaceNoise(scale);
      return Math.max(0, Math.round(value + noise));
    });
  }

  private static generateLaplaceNoise(scale: number): number {
    const u = Math.random() - 0.5;
    return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  }
}