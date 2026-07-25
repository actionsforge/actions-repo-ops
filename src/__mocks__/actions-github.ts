// CJS-friendly stub for Jest — @actions/github v9 is ESM-only.
export const getOctokit = jest.fn(() => ({
  rest: {
    repos: {
      get: jest.fn(),
      createInOrg: jest.fn(),
      delete: jest.fn(),
      update: jest.fn()
    }
  }
}));

export const context = {};
