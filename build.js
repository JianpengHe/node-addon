const fs = require("fs");
const zlib = require("zlib");
const child_process = require("child_process");
const path = require("path");
const ignoreDir = ["dist", "build", ".git", "node_modules", ".vscode"];
const cwd = path.resolve("./");
fs.mkdir(__dirname, "/dist", () => {});
let nextBuildProjectName = "";
let busy = false;
const spawn = (...a) =>
  new Promise((resolve, reject) =>
    child_process.spawn(...a).once("close", iserr => {
      iserr ? reject() : resolve();
    })
  );
const build = projectName => {
  if (!projectName) {
    return;
  }
  if (busy) {
    // nextBuildProjectName = projectName;
    return;
  }
  busy = true;
  nextBuildProjectName = "";
  console.log(new Date().toLocaleString(), "构建项目", projectName);
  const dir = __dirname + "/" + projectName;
  fs.readFile(dir + "/binding.gyp", (err, d) => {
    if (err || !d) {
      fs.writeFileSync(
        dir + "/binding.gyp",
        JSON.stringify(
          {
            targets: [
              {
                target_name: projectName,
                sources: ["main.cpp"],
              },
            ],
          },
          null,
          2
        )
      );
    }
    child_process.exec("rd /s /q build", () => {
      spawn("node-gyp", ["configure"], {
        cwd: dir,
        stdio: "inherit",
        shell: true,
      })
        .then(() =>
          spawn("node-gyp", ["build"], {
            cwd: dir,
            stdio: "inherit",
            shell: true,
          })
        )
        .then(
          () =>
            new Promise(r => {
              fs.readFile(dir + "/build/Release/" + projectName + ".node", (err, d) => {
                if (err || !d) {
                  r();
                  return;
                }
                zlib.brotliCompress(d, (err, d2) => {
                  if (err || !d2) {
                    r();
                    return;
                  }
                  const fileName = `${projectName}_node-v${process.version.match(/^v(\d{1,2})\./)[1]}-${
                    process.platform
                  }-${process.arch}.node`;
                  Promise.all([
                    fs.promises.writeFile(__dirname + "/dist/" + fileName, d),
                    fs.promises.writeFile(__dirname + "/dist/" + fileName + ".brotli", d2),
                    fs.promises.writeFile(
                      __dirname + "/dist/" + projectName + ".js",
                      String(fs.readFileSync("template.js")).replace("[[projectName]]", projectName)
                    ),
                  ]).then(r);
                });
              });
            })
        )
        .then(
          () =>
            //if (process.argv[2] !== "-w") {
            spawn("node", ["test.js"], { cwd: dir, stdio: "inherit", shell: true })
          //
        )
        .catch(() => {})
        .finally(() => {
          if (process.argv[2] === "-w") {
            busy = false;
            process.nextTick(() => build(nextBuildProjectName));
          }
        });
    });
  });

  //
  // projectName;
};

if (process.argv[2] === "-w") {
  fs.watch("./", { recursive: true }, (eventType, filename) => {
    const { dir, base, ext } = path.parse(filename.replace(/\\/g, "/"));
    if (dir && !dir.includes("/") && (/^\.c/.test(ext) || base === "test.js") && !ignoreDir.includes(dir)) {
      setTimeout(() => build(dir), 100);
    }
    //  console.log(dir, base, ext);
  });
} else {
  const projectName =
    process.argv[2] ||
    (cwd !== __dirname && path.parse(cwd).base) ||
    fs
      .readdirSync(__dirname, { withFileTypes: true })
      .filter(a => a.isDirectory() && !ignoreDir.includes(a.name))
      .map(a => ({ name: a.name, mtime: fs.statSync(a.name).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime)[0].name;
  if (!projectName) {
    throw new Error("projectName not found");
  }
  build(projectName);
}
