import { DateUtil } from './date.util';

describe('DateUtil', () => {
  describe('now', () => {
    it('should return current date', () => {
      // Act
      const now = DateUtil.now();

      // Assert
      expect(now).toBeInstanceOf(Date);
      expect(now.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('addDays', () => {
    it('should add days to date', () => {
      // Arrange
      const date = new Date('2024-01-01T00:00:00Z');
      const days = 7;

      // Act
      const result = DateUtil.addDays(date, days);

      // Assert
      expect(result.getTime()).toBe(
        date.getTime() + days * 24 * 60 * 60 * 1000,
      );
    });

    it('should not mutate original date', () => {
      // Arrange
      const date = new Date('2024-01-01');
      const originalTime = date.getTime();

      // Act
      DateUtil.addDays(date, 7);

      // Assert
      expect(date.getTime()).toBe(originalTime);
    });

    it('should handle negative days', () => {
      // Arrange
      const date = new Date('2024-01-08T00:00:00Z');
      const days = -7;

      // Act
      const result = DateUtil.addDays(date, days);

      // Assert
      expect(result.getTime()).toBe(
        date.getTime() + days * 24 * 60 * 60 * 1000,
      );
    });

    it('should handle month boundaries', () => {
      // Arrange
      const date = new Date(2024, 0, 31); // January 31, 2024
      const days = 1;

      // Act
      const result = DateUtil.addDays(date, days);

      // Assert
      // setDate automatically handles month overflow, so Jan 31 + 1 day = Feb 1
      expect(result.getDate()).toBe(1);
      expect(result.getMonth()).toBe(1); // February
    });
  });

  describe('addHours', () => {
    it('should add hours to date', () => {
      // Arrange
      const date = new Date('2024-01-01T10:00:00');
      const hours = 5;

      // Act
      const result = DateUtil.addHours(date, hours);

      // Assert
      expect(result.getHours()).toBe(15);
    });

    it('should not mutate original date', () => {
      // Arrange
      const date = new Date('2024-01-01T10:00:00');
      const originalTime = date.getTime();

      // Act
      DateUtil.addHours(date, 5);

      // Assert
      expect(date.getTime()).toBe(originalTime);
    });

    it('should handle day boundaries', () => {
      // Arrange
      const date = new Date('2024-01-01T23:00:00');
      const hours = 2;

      // Act
      const result = DateUtil.addHours(date, hours);

      // Assert
      expect(result.getDate()).toBe(2);
      expect(result.getHours()).toBe(1);
    });
  });

  describe('addMinutes', () => {
    it('should add minutes to date', () => {
      // Arrange
      const date = new Date('2024-01-01T10:00:00');
      const minutes = 30;

      // Act
      const result = DateUtil.addMinutes(date, minutes);

      // Assert
      expect(result.getMinutes()).toBe(30);
    });

    it('should not mutate original date', () => {
      // Arrange
      const date = new Date('2024-01-01T10:00:00');
      const originalTime = date.getTime();

      // Act
      DateUtil.addMinutes(date, 30);

      // Assert
      expect(date.getTime()).toBe(originalTime);
    });
  });

  describe('isExpired', () => {
    it('should return true for past date', () => {
      // Arrange
      const pastDate = new Date('2020-01-01');

      // Act
      const result = DateUtil.isExpired(pastDate);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for future date', () => {
      // Arrange
      const futureDate = new Date('2099-01-01');

      // Act
      const result = DateUtil.isExpired(futureDate);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true for date very close to now in the past', () => {
      // Arrange
      const pastDate = new Date(Date.now() - 1000); // 1 second ago

      // Act
      const result = DateUtil.isExpired(pastDate);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('formatToISO', () => {
    it('should format date to ISO string', () => {
      // Arrange
      const date = new Date('2024-01-01T10:00:00Z');

      // Act
      const result = DateUtil.formatToISO(date);

      // Assert
      expect(result).toBe(date.toISOString());
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('startOfDay', () => {
    it('should return date with time set to 00:00:00.000', () => {
      // Arrange
      const date = new Date('2024-01-01T15:30:45.123');

      // Act
      const result = DateUtil.startOfDay(date);

      // Assert
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
      expect(result.getDate()).toBe(1);
    });

    it('should not mutate original date', () => {
      // Arrange
      const date = new Date('2024-01-01T15:30:45');
      const originalHours = date.getHours();

      // Act
      DateUtil.startOfDay(date);

      // Assert
      expect(date.getHours()).toBe(originalHours);
    });
  });

  describe('endOfDay', () => {
    it('should return date with time set to 23:59:59.999', () => {
      // Arrange
      const date = new Date('2024-01-01T15:30:45.123');

      // Act
      const result = DateUtil.endOfDay(date);

      // Assert
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
      expect(result.getDate()).toBe(1);
    });

    it('should not mutate original date', () => {
      // Arrange
      const date = new Date('2024-01-01T15:30:45');
      const originalHours = date.getHours();

      // Act
      DateUtil.endOfDay(date);

      // Assert
      expect(date.getHours()).toBe(originalHours);
    });
  });
});
