import { ResponseUtil } from './response.util';

describe('ResponseUtil', () => {
  describe('success', () => {
    it('should create success response with data', () => {
      // Arrange
      const data = { id: 1, name: 'Test' };

      // Act
      const result = ResponseUtil.success(data);

      // Assert
      expect(result).toEqual({
        success: true,
        data,
        message: undefined,
      });
    });

    it('should create success response with data and message', () => {
      // Arrange
      const data = { id: 1, name: 'Test' };
      const message = 'Operation successful';

      // Act
      const result = ResponseUtil.success(data, message);

      // Assert
      expect(result).toEqual({
        success: true,
        data,
        message,
      });
    });

    it('should handle null data', () => {
      // Act
      const result = ResponseUtil.success(null);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should handle array data', () => {
      // Arrange
      const data = [{ id: 1 }, { id: 2 }];

      // Act
      const result = ResponseUtil.success(data);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });
  });

  describe('error', () => {
    it('should create error response with message', () => {
      // Arrange
      const message = 'Something went wrong';

      // Act
      const result = ResponseUtil.error(message);

      // Assert
      expect(result).toEqual({
        success: false,
        message,
        errors: undefined,
      });
    });

    it('should create error response with message and errors', () => {
      // Arrange
      const message = 'Validation failed';
      const errors = ['Error 1', 'Error 2'];

      // Act
      const result = ResponseUtil.error(message, errors);

      // Assert
      expect(result).toEqual({
        success: false,
        message,
        errors,
      });
    });

    it('should handle empty errors array', () => {
      // Arrange
      const message = 'Error occurred';
      const errors: string[] = [];

      // Act
      const result = ResponseUtil.error(message, errors);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toEqual([]);
    });
  });

  describe('paginated', () => {
    it('should create paginated response', () => {
      // Arrange
      const data = [{ id: 1 }, { id: 2 }];
      const page = 1;
      const limit = 10;
      const total = 25;

      // Act
      const result = ResponseUtil.paginated(data, page, limit, total);

      // Assert
      expect(result).toEqual({
        success: true,
        data,
        meta: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3, // Math.ceil(25/10) = 3
        },
      });
    });

    it('should calculate totalPages correctly', () => {
      // Arrange
      const data = [];
      const page = 1;
      const limit = 10;
      const total = 25;

      // Act
      const result = ResponseUtil.paginated(data, page, limit, total);

      // Assert
      expect(result.meta.totalPages).toBe(3);
    });

    it('should handle exact division for totalPages', () => {
      // Arrange
      const data = [];
      const page = 1;
      const limit = 10;
      const total = 20;

      // Act
      const result = ResponseUtil.paginated(data, page, limit, total);

      // Assert
      expect(result.meta.totalPages).toBe(2);
    });

    it('should handle zero total', () => {
      // Arrange
      const data = [];
      const page = 1;
      const limit = 10;
      const total = 0;

      // Act
      const result = ResponseUtil.paginated(data, page, limit, total);

      // Assert
      expect(result.meta.totalPages).toBe(0);
    });

    it('should handle empty data array', () => {
      // Arrange
      const data: any[] = [];
      const page = 1;
      const limit = 10;
      const total = 0;

      // Act
      const result = ResponseUtil.paginated(data, page, limit, total);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });
});
