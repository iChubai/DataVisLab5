module.exports = {
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom", // 确保使用正确的环境
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest", // 使用 ts-jest 转换 TypeScript 文件
  },
  moduleFileExtensions: ["ts", "tsx", "js", "json", "node"], // 支持的文件扩展名
  testPathIgnorePatterns: ["/node_modules/"], // 忽略 node_modules 文件夹
};
