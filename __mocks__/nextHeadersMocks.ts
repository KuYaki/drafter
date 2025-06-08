// Mock for next/headers
jest.mock('next/headers', () => ({
  cookies: () => ({
    set: jest.fn(),
    get: jest.fn(),
    getAll: jest.fn(),
  }),
}));
