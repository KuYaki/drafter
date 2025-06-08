// Import jest-dom matchers
import '@testing-library/jest-dom';

// Import global mocks
import './__mocks__/browserMocks';
import './__mocks__/nextMocks';
import './__mocks__/nextIntlMocks';
import './__mocks__/nextHeadersMocks';
import './__mocks__/cookiesMocks';
import './__mocks__/themeMocks';

// Suppress findDOMNode warnings from semantic-ui-react
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    const message = String(args[0]);
    if (
      message.includes('findDOMNode is deprecated') ||
      message.includes('Support for defaultProps will be removed')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
