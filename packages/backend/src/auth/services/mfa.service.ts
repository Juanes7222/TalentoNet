import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class MfaService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly encryptionKey: Buffer;

  constructor(private configService: ConfigService) {
    // Get encryption key from env or generate one (should be 32 bytes for aes-256)
    const key = this.configService.get<string>('MFA_ENCRYPTION_KEY');
    if (!key) {
      throw new Error('MFA_ENCRYPTION_KEY must be set in environment variables');
    }
    this.encryptionKey = Buffer.from(key, 'hex');
  }

  /**
   * Generate a new TOTP secret for a user
   */
  generateSecret(): { secret: string; qrCode: string } {
    // Generate a random base32 secret (160 bits / 32 characters)
    const secret = this.generateBase32Secret();
    
    // Create otpauth URL for QR code
    const qrCode = this.generateOtpAuthUrl(secret, 'user@example.com', 'TalentoNet');
    
    return { secret, qrCode };
  }

  /**
   * Verify a TOTP code
   */
  verifyToken(secret: string, token: string, window = 1): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeStep = 30; // 30 seconds per TOTP window

    // Check current window and adjacent windows
    for (let i = -window; i <= window; i++) {
      const timeSlice = Math.floor(currentTime / timeStep) + i;
      const expectedToken = this.generateTOTP(secret, timeSlice);
      
      if (expectedToken === token) {
        return true;
      }
    }

    return false;
  }

  /**
   * Encrypt MFA secret for storage
   */
  encryptSecret(secret: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
    
    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Return: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt MFA secret from storage
   */
  decryptSecret(encryptedData: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate base32 secret (compatible with Google Authenticator)
   */
  private generateBase32Secret(): string {
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    const randomBytes = crypto.randomBytes(20); // 160 bits
    
    for (let i = 0; i < 32; i++) {
      secret += base32Chars[randomBytes[i % 20] % 32];
    }
    
    return secret;
  }

  /**
   * Generate OTP Auth URL for QR code
   */
  private generateOtpAuthUrl(secret: string, email: string, issuer: string): string {
    const params = new URLSearchParams({
      secret,
      issuer,
      algorithm: 'SHA1',
      digits: '6',
      period: '30',
    });
    
    return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?${params.toString()}`;
  }

  /**
   * Generate TOTP code for a given time slice
   * Implementation of RFC 6238
   */
  private generateTOTP(secret: string, timeSlice: number): string {
    const key = this.base32Decode(secret);
    const time = Buffer.alloc(8);
    time.writeBigInt64BE(BigInt(timeSlice), 0);

    const hmac = crypto.createHmac('sha1', key);
    hmac.update(time);
    const hash = hmac.digest();

    const offset = hash[hash.length - 1] & 0x0f;
    const binary =
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff);

    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  }

  /**
   * Decode base32 string to buffer
   */
  private base32Decode(base32: string): Buffer {
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const bits: number[] = [];
    
    base32 = base32.toUpperCase().replace(/=+$/, '');
    
    for (const char of base32) {
      const val = base32Chars.indexOf(char);
      if (val === -1) throw new Error('Invalid base32 character');
      
      bits.push(...val.toString(2).padStart(5, '0').split('').map(Number));
    }
    
    const bytes: number[] = [];
    for (let i = 0; i < bits.length; i += 8) {
      if (i + 8 <= bits.length) {
        bytes.push(parseInt(bits.slice(i, i + 8).join(''), 2));
      }
    }
    
    return Buffer.from(bytes);
  }

  /**
   * Generate QR code as data URL (for display in frontend)
   */
  async generateQrCodeDataUrl(otpAuthUrl: string): Promise<string> {
    // Simple implementation - in production, use qrcode library
    // For now, return the URL that frontend can use with a QR library
    return otpAuthUrl;
  }
}
