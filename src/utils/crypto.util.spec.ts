import { CryptoUtil } from './crypto.util';

describe('CryptoUtil', () => {
  describe('generateHash', () => {
    it('should generate a hash with default algorithm (sha256)', () => {
      // Arrange
      const data = 'test-data';

      // Act
      const hash = CryptoUtil.generateHash(data);

      // Assert
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
      expect(hash.length).toBe(64); // SHA256 produces 64 hex characters
    });

    it('should generate different hashes for different data', () => {
      // Arrange
      const data1 = 'test-data-1';
      const data2 = 'test-data-2';

      // Act
      const hash1 = CryptoUtil.generateHash(data1);
      const hash2 = CryptoUtil.generateHash(data2);

      // Assert
      expect(hash1).not.toBe(hash2);
    });

    it('should generate same hash for same data', () => {
      // Arrange
      const data = 'test-data';

      // Act
      const hash1 = CryptoUtil.generateHash(data);
      const hash2 = CryptoUtil.generateHash(data);

      // Assert
      expect(hash1).toBe(hash2);
    });

    it('should generate hash with custom algorithm', () => {
      // Arrange
      const data = 'test-data';
      const algorithm = 'md5';

      // Act
      const hash = CryptoUtil.generateHash(data, algorithm);

      // Assert
      expect(hash).toBeDefined();
      expect(hash.length).toBe(32); // MD5 produces 32 hex characters
    });
  });

  describe('generateRandomToken', () => {
    it('should generate a random token with default length', () => {
      // Act
      const token = CryptoUtil.generateRandomToken();

      // Assert
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes = 64 hex characters
    });

    it('should generate tokens of specified length', () => {
      // Arrange
      const length = 16;

      // Act
      const token = CryptoUtil.generateRandomToken(length);

      // Assert
      expect(token.length).toBe(length * 2); // hex encoding doubles length
    });

    it('should generate different tokens on each call', () => {
      // Act
      const token1 = CryptoUtil.generateRandomToken();
      const token2 = CryptoUtil.generateRandomToken();

      // Assert
      expect(token1).not.toBe(token2);
    });

    it('should generate token with custom length', () => {
      // Arrange
      const length = 8;

      // Act
      const token = CryptoUtil.generateRandomToken(length);

      // Assert
      expect(token.length).toBe(16); // 8 bytes = 16 hex characters
    });
  });

  describe('generateUUID', () => {
    it('should generate a valid UUID', () => {
      // Act
      const uuid = CryptoUtil.generateUUID();

      // Assert
      expect(uuid).toBeDefined();
      expect(typeof uuid).toBe('string');
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('should generate different UUIDs on each call', () => {
      // Act
      const uuid1 = CryptoUtil.generateUUID();
      const uuid2 = CryptoUtil.generateUUID();

      // Assert
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('compareHash', () => {
    it('should return true for matching hash', () => {
      // Arrange
      const data = 'test-data';
      const hash = CryptoUtil.generateHash(data);

      // Act
      const result = CryptoUtil.compareHash(data, hash);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for non-matching hash', () => {
      // Arrange
      const data = 'test-data';
      const wrongHash = CryptoUtil.generateHash('wrong-data');

      // Act
      const result = CryptoUtil.compareHash(data, wrongHash);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when comparing with different algorithm', () => {
      // Arrange
      const data = 'test-data';
      const sha256Hash = CryptoUtil.generateHash(data, 'sha256');
      // Compare using sha256 but with a hash generated with md5 (different length)
      const md5Hash = CryptoUtil.generateHash(data, 'md5');

      // Act & Assert
      // This will throw an error because hashes have different lengths
      expect(() => {
        CryptoUtil.compareHash(data, md5Hash, 'sha256');
      }).toThrow();
    });
  });
});

