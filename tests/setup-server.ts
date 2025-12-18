// Server-side test setup (no React dependencies)
import { vi } from 'vitest';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console logs in tests
  // log: vi.fn(),
  // debug: vi.fn(),
  // info: vi.fn(),
  // warn: vi.fn(),
  // error: vi.fn(),
};

