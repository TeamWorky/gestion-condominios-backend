import { IsStrongPasswordConstraint } from './password-strength.validator';
import { ValidationArguments } from 'class-validator';

describe('IsStrongPasswordConstraint', () => {
  let constraint: IsStrongPasswordConstraint;
  let mockValidationArguments: ValidationArguments;

  beforeEach(() => {
    constraint = new IsStrongPasswordConstraint();
    mockValidationArguments = {
      value: undefined,
      constraints: [],
      targetName: 'TestClass',
      object: {},
      property: 'password',
    } as ValidationArguments;
  });

  describe('validate', () => {
    it('should return false for null password', () => {
      // Arrange
      const password = null;

      // Act
      const result = constraint.validate(password, mockValidationArguments);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for undefined password', () => {
      // Arrange
      const password = undefined;

      // Act
      const result = constraint.validate(password, mockValidationArguments);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for non-string password', () => {
      // Arrange
      const password = 12345 as any;

      // Act
      const result = constraint.validate(password, mockValidationArguments);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for password shorter than 8 characters', () => {
      // Arrange
      const password = 'Short1!';

      // Act
      const result = constraint.validate(password, mockValidationArguments);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for password without uppercase letter', () => {
      // Arrange
      const password = 'password123!';

      // Act
      const result = constraint.validate(password, mockValidationArguments);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for password without lowercase letter', () => {
      // Arrange
      const password = 'PASSWORD123!';

      // Act
      const result = constraint.validate(password, mockValidationArguments);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for password without number', () => {
      // Arrange
      const password = 'Password!';

      // Act
      const result = constraint.validate(password, mockValidationArguments);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for password without special character', () => {
      // Arrange
      const password = 'Password123';

      // Act
      const result = constraint.validate(password, mockValidationArguments);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true for valid strong password', () => {
      // Arrange
      const password = 'SecurePassword123!';

      // Act
      const result = constraint.validate(password, mockValidationArguments);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for password with different special characters', () => {
      // Arrange
      const passwords = [
        'Password123@',
        'Password123#',
        'Password123$',
        'Password123%',
        'Password123&',
      ];

      // Act & Assert
      passwords.forEach((password) => {
        const result = constraint.validate(password, mockValidationArguments);
        expect(result).toBe(true);
      });
    });

    it('should return true for password with exactly 8 characters', () => {
      // Arrange
      const password = 'Pass123!';

      // Act
      const result = constraint.validate(password, mockValidationArguments);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('defaultMessage', () => {
    it('should return appropriate error message', () => {
      // Act
      const message = constraint.defaultMessage(mockValidationArguments);

      // Assert
      expect(message).toContain('Password must have');
      expect(message).toContain('8 characters');
      expect(message).toContain('uppercase');
      expect(message).toContain('lowercase');
      expect(message).toContain('number');
      expect(message).toContain('special character');
    });
  });
});

