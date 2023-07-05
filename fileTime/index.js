const addon = require(process.argv[2]);

console.log(
    addon.fileTime(
        __dirname + "/test.txt",
        new Date().getTime() / 1000 - 86400 * 3,
        new Date().getTime() / 1000 - 86400 * 2,
        new Date().getTime() / 1000 - 8640
    )
);