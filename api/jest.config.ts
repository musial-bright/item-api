/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  setupFiles: ['<rootDir>/src/tests/jest.setupEnv.ts'],
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  testMatch: ['**/src/tests/**/*.test.ts'],
}
