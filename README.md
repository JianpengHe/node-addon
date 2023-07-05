# node-addon

node 的 C++插件

# 使用 Visual Studio

## 环境准备

- 安装 python：https://www.python.org/ftp/python/3.11.4/python-3.11.4-amd64.exe
- 安装 nasm：https://www.nasm.us/pub/nasm/releasebuilds/?C=M;O=D
- 下载 Node.js 源码：https://codeload.github.com/nodejs/node/zip/refs/tags/v18.16.1
- 解压到当前 git 仓库目录
- 重命名：`node-18.16.1`→`.node`
- 进入.node 目录，编译命令：`vcbuild.bat Release nosign x64`

## 创建解决方案

- 打开 Visual Studio
- 创建新项目(N)
- (C++)控制台应用
- 位置：当前 git 仓库的目录，勾选“将解决方案和项目放在同一目录(D)”

## 切换编译&调试模式

- 切换模式：`Release x64`
- 右侧栏 → 源文件 → 添加(D) → 新建项(W) → 名称(N)：`index.js`
- 打开`index.js` → 粘贴：

```javascript
const addon = require(process.argv[2]);
console.log(addon.hello());
```

## 配置解决方案

- 右侧栏 → 右击项目 → 属性(R)
- 配置属性 → 常规 → 配置类型：`动态库(.dll)`
- 配置属性 → 高级 → 目标文件扩展名：`.node`
- 配置属性 → 调试 → 命令：`$(SolutionDir)../.node/Release/node.exe`
- 配置属性 → 调试 → 命令参数：`index.js "$(TargetPath)"`
- 配置属性 →VC++目录 → 包含目录：`$(SolutionDir)../.node/deps/v8/include;$(SolutionDir)../.node/deps/uv/include;$(SolutionDir)../.node/src;$(VC_IncludePath);$(WindowsSDK_IncludePath);`
- 配置属性 →VC++目录 → 引用目录：`$(SolutionDir)../.node/Release;$(VC_ReferencesPath_x64);`
- 配置属性 → 链接器 → 输入 → 附加依赖项：`$(SolutionDir)../.node/out/Release/node.lib;$(CoreLibraryDependencies);%(AdditionalDependencies)`
