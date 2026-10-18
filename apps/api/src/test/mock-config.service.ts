import { ConfigService } from '@nestjs/config';

const defaults: Record<string, string> = {
  SECRET_KEY: 'test-secret-key-for-jwt-unit-tests-minimum-length',
  AWS_REGION: 'us-east-1',
  AWS_ACCESS_KEY: 'test-access',
  AWS_SECRET_KEY: 'test-secret',
  AWS_BUCKET_NAME: 'test-bucket',
  DEV_ENVIRONMENT: 'true',
  SMTP_SECURE_FLAG: 'false',
  SMTP_HOST: 'localhost',
  SMTP_PORT: '587',
  SMTP_EMAIL: 'test@test.com',
  SMTP_PASSWORD: 'test',
};

/** Minimal ConfigService mock for unit tests (merge `overrides` as needed). */
export function createMockConfigService(
  overrides: Record<string, string> = {},
): ConfigService {
  const env = { ...defaults, ...overrides };
  return {
    get: (key: string, def?: unknown) =>
      key in env ? env[key as keyof typeof env] : def,
    getOrThrow: (key: string) => {
      if (!(key in env)) throw new Error(`Missing config key: ${key}`);
      return env[key as keyof typeof env];
    },
  } as ConfigService;
}
