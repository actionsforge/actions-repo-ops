module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // @actions/github v9 exports ESM-only; map to a CJS stub for Jest.
  moduleNameMapper: {
    '^@actions/github$': '<rootDir>/src/__mocks__/actions-github.ts'
  },
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**'
  ],
  coverageReporters: ['text-summary', 'json-summary', 'lcov', 'text'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  },
  testTimeout: 30000,
  forceExit: true,
  detectOpenHandles: true
};
