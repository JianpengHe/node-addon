const { fileTime } = require("./build/Release/fileTime.node");

console.log(
  fileTime(
    "test.txt",
    new Date().getTime() / 1000 - 86400 * 3,
    new Date().getTime() / 1000 - 86400 * 2,
    new Date().getTime() / 1000 - 8640
  )
);
