/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  // Don't transform node_modules
  transformIgnorePatterns: ["/node_modules/"],
  // Clear mocks between tests
  clearMocks: true,
};
