import { StringUtil } from './string.util';

describe('StringUtil', () => {
  describe('slugify', () => {
    it('should convert text to lowercase slug', () => {
      // Arrange
      const text = 'Hello World';

      // Act
      const result = StringUtil.slugify(text);

      // Assert
      expect(result).toBe('hello-world');
    });

    it('should remove special characters', () => {
      // Arrange
      const text = 'Hello, World!';

      // Act
      const result = StringUtil.slugify(text);

      // Assert
      expect(result).toBe('hello-world');
    });

    it('should replace spaces with hyphens', () => {
      // Arrange
      const text = 'Hello World Test';

      // Act
      const result = StringUtil.slugify(text);

      // Assert
      expect(result).toBe('hello-world-test');
    });

    it('should trim whitespace', () => {
      // Arrange
      const text = '  Hello World  ';

      // Act
      const result = StringUtil.slugify(text);

      // Assert
      expect(result).toBe('hello-world');
    });

    it('should handle multiple spaces', () => {
      // Arrange
      const text = 'Hello    World';

      // Act
      const result = StringUtil.slugify(text);

      // Assert
      expect(result).toBe('hello-world');
    });

    it('should handle underscores', () => {
      // Arrange
      const text = 'Hello_World_Test';

      // Act
      const result = StringUtil.slugify(text);

      // Assert
      expect(result).toBe('hello-world-test');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter and lowercase rest', () => {
      // Arrange
      const text = 'hello world';

      // Act
      const result = StringUtil.capitalize(text);

      // Assert
      expect(result).toBe('Hello world');
    });

    it('should handle already capitalized text', () => {
      // Arrange
      const text = 'HELLO WORLD';

      // Act
      const result = StringUtil.capitalize(text);

      // Assert
      expect(result).toBe('Hello world');
    });

    it('should handle single character', () => {
      // Arrange
      const text = 'h';

      // Act
      const result = StringUtil.capitalize(text);

      // Assert
      expect(result).toBe('H');
    });

    it('should handle empty string', () => {
      // Arrange
      const text = '';

      // Act
      const result = StringUtil.capitalize(text);

      // Assert
      expect(result).toBe('');
    });
  });

  describe('truncate', () => {
    it('should truncate text longer than length', () => {
      // Arrange
      const text = 'This is a very long text';
      const length = 10;

      // Act
      const result = StringUtil.truncate(text, length);

      // Assert
      expect(result).toContain('...');
      expect(result.length).toBeLessThanOrEqual(length + 3); // length + '...'
      expect(result.substring(0, result.length - 3).length).toBeLessThanOrEqual(length);
    });

    it('should not truncate text shorter than length', () => {
      // Arrange
      const text = 'Short';
      const length = 10;

      // Act
      const result = StringUtil.truncate(text, length);

      // Assert
      expect(result).toBe('Short');
    });

    it('should use custom suffix', () => {
      // Arrange
      const text = 'This is a very long text';
      const length = 10;
      const suffix = '...more';

      // Act
      const result = StringUtil.truncate(text, length, suffix);

      // Assert
      expect(result).toContain(suffix);
    });

    it('should trim truncated text', () => {
      // Arrange
      const text = 'This is a very long text   ';
      const length = 10;

      // Act
      const result = StringUtil.truncate(text, length);

      // Assert
      expect(result).not.toContain('   ');
    });
  });

  describe('generateRandomString', () => {
    it('should generate string of specified length', () => {
      // Arrange
      const length = 10;

      // Act
      const result = StringUtil.generateRandomString(length);

      // Assert
      expect(result.length).toBe(length);
    });

    it('should generate different strings on each call', () => {
      // Act
      const result1 = StringUtil.generateRandomString(10);
      const result2 = StringUtil.generateRandomString(10);

      // Assert
      expect(result1).not.toBe(result2);
    });

    it('should only contain alphanumeric characters', () => {
      // Arrange
      const length = 100;

      // Act
      const result = StringUtil.generateRandomString(length);

      // Assert
      expect(result).toMatch(/^[A-Za-z0-9]+$/);
    });
  });

  describe('maskEmail', () => {
    it('should mask email with local part longer than 2 characters', () => {
      // Arrange
      const email = 'user@example.com';

      // Act
      const result = StringUtil.maskEmail(email);

      // Assert
      expect(result).toBe('us***@example.com');
    });

    it('should mask email with local part of 2 or fewer characters', () => {
      // Arrange
      const email = 'ab@example.com';

      // Act
      const result = StringUtil.maskEmail(email);

      // Assert
      expect(result).toBe('ab***@example.com');
    });

    it('should preserve domain part', () => {
      // Arrange
      const email = 'user@example.com';

      // Act
      const result = StringUtil.maskEmail(email);

      // Assert
      expect(result).toContain('@example.com');
    });
  });

  describe('isValidEmail', () => {
    it('should return true for valid email', () => {
      // Arrange
      const email = 'user@example.com';

      // Act
      const result = StringUtil.isValidEmail(email);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for email without @', () => {
      // Arrange
      const email = 'userexample.com';

      // Act
      const result = StringUtil.isValidEmail(email);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for email without domain', () => {
      // Arrange
      const email = 'user@';

      // Act
      const result = StringUtil.isValidEmail(email);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for email without TLD', () => {
      // Arrange
      const email = 'user@example';

      // Act
      const result = StringUtil.isValidEmail(email);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for empty string', () => {
      // Arrange
      const email = '';

      // Act
      const result = StringUtil.isValidEmail(email);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true for email with subdomain', () => {
      // Arrange
      const email = 'user@mail.example.com';

      // Act
      const result = StringUtil.isValidEmail(email);

      // Assert
      expect(result).toBe(true);
    });
  });
});

