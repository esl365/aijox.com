import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.DIRECT_URL = 'postgresql://test:test@localhost:5432/test';
process.env.NEXTAUTH_SECRET = 'test-secret-key-minimum-32-characters-long';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.OPENAI_API_KEY = 'sk-test-key';
process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.UPLOADTHING_SECRET = 'test-uploadthing-secret';
process.env.UPLOADTHING_APP_ID = 'test-app-id';
