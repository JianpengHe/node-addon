const fs = require("fs");
const zlib = require("zlib");
const os = require("os");

module.exports = (file => {
  const temp = `${os.tmpdir()}/${file}`;
  try {
    return require(temp);
  } catch (e) {
    // console.log("解压", file);
    fs.writeFileSync(temp, zlib.brotliDecompressSync(fs.readFileSync(__dirname + "/" + file + ".brotli")));
    return require(temp);
  }
})(`[[projectName]]-v${process.version.match(/^v(\d{1,2})\./)[1]}-${process.platform}-${process.arch}.node`);
