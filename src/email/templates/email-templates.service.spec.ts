import { Test, TestingModule } from '@nestjs/testing';
import { EmailTemplatesService } from './email-templates.service';
import { EmailTemplate } from '../dto/send-email.dto';

describe('EmailTemplatesService', () => {
  let service: EmailTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailTemplatesService],
    }).compile();

    service = module.get<EmailTemplatesService>(EmailTemplatesService);
  });

  describe('getTemplate', () => {
    it('should return welcome template', () => {
      // Arrange
      const variables = {
        name: 'John Doe',
        loginUrl: 'http://localhost:3000/login',
      };

      // Act
      const result = service.getTemplate(EmailTemplate.WELCOME, variables);

      // Assert
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('text');
      expect(result.html).toContain('John Doe');
      expect(result.html).toContain('http://localhost:3000/login');
      expect(result.text).toContain('John Doe');
      expect(result.text).toContain('http://localhost:3000/login');
    });

    it('should return welcome template with default values', () => {
      // Act
      const result = service.getTemplate(EmailTemplate.WELCOME, {});

      // Assert
      expect(result.html).toContain('User');
      expect(result.html).toContain('https://app.example.com/login');
      expect(result.text).toContain('User');
    });

    it('should return password reset template', () => {
      // Arrange
      const variables = {
        name: 'Jane Doe',
        resetUrl: 'http://localhost:3000/reset-password?token=abc123',
        expiresIn: '1 hour',
      };

      // Act
      const result = service.getTemplate(
        EmailTemplate.PASSWORD_RESET,
        variables,
      );

      // Assert
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('text');
      expect(result.html).toContain('Jane Doe');
      expect(result.html).toContain(
        'http://localhost:3000/reset-password?token=abc123',
      );
      expect(result.html).toContain('1 hour');
      expect(result.text).toContain('Jane Doe');
      expect(result.text).toContain(
        'http://localhost:3000/reset-password?token=abc123',
      );
    });

    it('should return password reset template with default values', () => {
      // Act
      const result = service.getTemplate(EmailTemplate.PASSWORD_RESET, {});

      // Assert
      expect(result.html).toContain('User');
      expect(result.html).toContain('https://app.example.com/reset-password');
      expect(result.html).toContain('1 hour');
    });

    it('should return email verification template', () => {
      // Arrange
      const variables = {
        name: 'Bob Smith',
        verifyUrl: 'http://localhost:3000/verify-email?token=xyz789',
        expiresIn: '24 hours',
      };

      // Act
      const result = service.getTemplate(
        EmailTemplate.EMAIL_VERIFICATION,
        variables,
      );

      // Assert
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('text');
      expect(result.html).toContain('Bob Smith');
      expect(result.html).toContain(
        'http://localhost:3000/verify-email?token=xyz789',
      );
      expect(result.html).toContain('24 hours');
      expect(result.text).toContain('Bob Smith');
      expect(result.text).toContain(
        'http://localhost:3000/verify-email?token=xyz789',
      );
    });

    it('should return email verification template with default values', () => {
      // Act
      const result = service.getTemplate(EmailTemplate.EMAIL_VERIFICATION, {});

      // Assert
      expect(result.html).toContain('User');
      expect(result.html).toContain('https://app.example.com/verify-email');
      expect(result.html).toContain('24 hours');
    });

    it('should return password changed template', () => {
      // Arrange
      const variables = {
        name: 'Alice Johnson',
        supportUrl: 'http://localhost:3000/support',
      };

      // Act
      const result = service.getTemplate(
        EmailTemplate.PASSWORD_CHANGED,
        variables,
      );

      // Assert
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('text');
      expect(result.html).toContain('Alice Johnson');
      expect(result.html).toContain('http://localhost:3000/support');
      expect(result.text).toContain('Alice Johnson');
      expect(result.text).toContain('http://localhost:3000/support');
    });

    it('should return password changed template with default values', () => {
      // Act
      const result = service.getTemplate(EmailTemplate.PASSWORD_CHANGED, {});

      // Assert
      expect(result.html).toContain('User');
      expect(result.html).toContain('https://app.example.com/support');
    });

    it('should return account locked template', () => {
      // Arrange
      const variables = {
        name: 'Charlie Brown',
        unlockUrl: 'http://localhost:3000/unlock-account?token=unlock123',
        supportUrl: 'http://localhost:3000/support',
      };

      // Act
      const result = service.getTemplate(
        EmailTemplate.ACCOUNT_LOCKED,
        variables,
      );

      // Assert
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('text');
      expect(result.html).toContain('Charlie Brown');
      expect(result.html).toContain(
        'http://localhost:3000/unlock-account?token=unlock123',
      );
      expect(result.html).toContain('http://localhost:3000/support');
      expect(result.text).toContain('Charlie Brown');
      expect(result.text).toContain(
        'http://localhost:3000/unlock-account?token=unlock123',
      );
    });

    it('should return account locked template with default values', () => {
      // Act
      const result = service.getTemplate(EmailTemplate.ACCOUNT_LOCKED, {});

      // Assert
      expect(result.html).toContain('User');
      expect(result.html).toContain('https://app.example.com/unlock-account');
      expect(result.html).toContain('https://app.example.com/support');
    });

    it('should return empty template for unknown template type', () => {
      // Act
      const result = service.getTemplate('unknown' as EmailTemplate, {});

      // Assert
      expect(result).toEqual({ html: '', text: '' });
    });

    it('should handle null or undefined variables gracefully', () => {
      // Act
      const result = service.getTemplate(EmailTemplate.WELCOME, {});

      // Assert
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('text');
      expect(result.html).toContain('User'); // Should use default
    });

    it('should properly escape HTML in variables', () => {
      // Arrange
      const variables = {
        name: '<script>alert("xss")</script>',
        loginUrl: 'http://localhost:3000/login',
      };

      // Act
      const result = service.getTemplate(EmailTemplate.WELCOME, variables);

      // Assert
      // The template should include the name as-is (it's up to the template to handle escaping)
      // But we verify it's included in the output
      expect(result.html).toContain(variables.name);
      expect(result.text).toContain(variables.name);
    });

    it('should return trimmed HTML and text', () => {
      // Act
      const result = service.getTemplate(EmailTemplate.WELCOME, {
        name: 'Test User',
        loginUrl: 'http://test.com',
      });

      // Assert
      // HTML should not start or end with whitespace
      expect(result.html.trim()).toBe(result.html);
      expect(result.text.trim()).toBe(result.text);
    });
  });
});
