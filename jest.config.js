module.exports = {
    roots: ['<rootDir>'],
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    testRegex: './test/ts/.*test.ts$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleDirectories: ["node_modules"],
    moduleNameMapper: {
      "cesium_source/Cesium": "<rootDir>/node_modules/cesium/Build/CesiumUnminified/Cesium"
    },
    preset: "ts-jest",
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.ts', '!**/node_modules/**'],
    coverageDirectory: './coverage',
    coverageReporters: ['html', 'text', 'text-summary'],
}
  