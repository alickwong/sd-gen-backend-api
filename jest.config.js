module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  transform: {
    // '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  transformIgnorePatterns: [`/node_modules/(?!(sip\.js))`] // Keep `sip.js` to get transpiled as well
  // moduleNameMapper: {
  //   axios: "axios/dist/node/axios.cjs"
  // }
};