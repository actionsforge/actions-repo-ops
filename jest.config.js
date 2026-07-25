module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // @actions/core v3 and @actions/github v9 are ESM-only; map to CJS stubs for Jest.
  moduleNameMapper: {
    '^@actions/core$': '<rootDir>/src/__mocks__/actions-core.ts',
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
