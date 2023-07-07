const addon = require(process.argv[2]);
const arr = [];

setTimeout(() => {
  const timer = setInterval(() => {
    const v = addon.getCursorPos();
    if (v > 200000000) {
      clearInterval(timer);
      setTimeout(() => {
        play();
      }, 1000);
      return;
    }
    arr.push(v);
    const x = (v / 10000) | 0,
      y = v % 10000;
    console.log(x, y);
  }, 100);
}, 1000);

const sleep = () => new Promise(r => setTimeout(r, 100));
let last = 0;
let t = 0;
const play = async () => {
  if (t++ > 5) {
    process.exit(0);
  }
  console.log("go");

  for (const v of arr) {
    await sleep();
    if (last === v) {
      continue;
    }
    last = v;
    const x = (v / 10000) | 0,
      y = v % 10000,
      i = (x / 10000) | 0;
    addon.move(x % 10000, y, i);
    console.log(x % 10000, y, i);
  }
  await sleep();
  await play();
};
