export const mockSyncCookies = jest.fn();

jest.mock('@/lib/cookies/actions', () => ({
  syncCookies: mockSyncCookies,
  __esModule: true,
}));
