module.exports = {
    roots: ['<rootDir>/src'],
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    testRegex: '/src/.*test.ts$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleDirectories: ["node_modules"],
    moduleNameMapper: {
      "cesium_source/Cesium": "<rootDir>/node_modules/cesium/Build/CesiumUnminified/Cesium"
    },
    preset: "ts-jest"
}
  