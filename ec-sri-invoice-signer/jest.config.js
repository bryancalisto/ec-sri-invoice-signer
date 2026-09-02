module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  maxWorkers: '50%' // not 100% to not overwhelm the system and get better performance
};
