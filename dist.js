const fs = require("fs");
const path = require("path");

require(path.resolve("./", "index.js"));

fs.copyFile(
  process.argv[2],
  `${__dirname}/dist/${path.parse(process.argv[2]).name}_v${process.version.match(/^v(\d{1,2})\./)[1]}-${
    process.platform
  }-${process.arch}.node`,
  () => {}
);
