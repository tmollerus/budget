module.exports = {
  testEnvironment: 'jsdom',

  // The root of your source code, typically /src
  // `<rootDir>` is a token Jest substitutes
  roots: ['<rootDir>/src'],

  collectCoverageFrom: [
    '**/*.{ts,tsx}',
  ],

  coverageThreshold: {
    global: {
      branches: 19,
      functions: 21,
      lines: 27,
      statements: 26,
    }
  },

  // Jest transformations -- this adds support for TypeScript
  // using ts-jest
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },

  // Runs special logic, such as cleaning up components
  // when using React Testing Library and adds special
  // extended assertions to Jest
  setupFilesAfterEnv: [
    // "@testing-library/react/cleanup-after-each",
    "@testing-library/jest-dom/extend-expect"
  ],

  // Test spec file resolution pattern
  testMatch: ['**/*.test.{ts,tsx}'],

  // Module file extensions for importing
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};