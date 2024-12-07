import chalk from 'chalk';
export const loadingAnimation = (totaltime) => {
  const frameLoading = ['', '読', '読み', '読み込', '読み込み', '読み込み中'];
  let frameIndex = 0;
  let startTime = Date.now();
  return setInterval(() => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    let elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    let current = totaltime - elapsedTime;
    process.stdout.write(
      chalk.white(
        `waiting delay ${current} second ${chalk.red(
          `${frameLoading[frameIndex]}`
        )}`
      )
    );
    frameIndex = (frameIndex + 1) % frameLoading.length;
  }, 200);
};
export default async (ms) => {
  let remainingSeconds = ms / 1000;
  let loading = loadingAnimation(remainingSeconds);
  await new Promise((resolve) => {
    setTimeout(() => {
      clearInterval(loading);
      resolve();
    }, ms);
  });
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
};
