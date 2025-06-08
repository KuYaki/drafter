// Mock for next/navigation
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

const mockSearchParams = {
  get: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter() {
    return mockRouter;
  },
  useSearchParams() {
    return mockSearchParams;
  },
}));
