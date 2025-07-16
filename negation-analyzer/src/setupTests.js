// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock AWS Amplify
jest.mock('aws-amplify', () => ({
  Amplify: {
    configure: jest.fn(),
  },
  Auth: {
    currentAuthenticatedUser: jest.fn().mockResolvedValue({
      attributes: {
        email: 'test@example.com',
      },
    }),
  },
}));

// Mock AWS Amplify UI React
jest.mock('@aws-amplify/ui-react', () => ({
  Authenticator: ({ children }) => children({ signOut: jest.fn(), user: { attributes: { email: 'test@example.com' } } }),
}));
