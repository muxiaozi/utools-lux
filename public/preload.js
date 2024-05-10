const { exec } = require("teen_process");

/**
 * 下载文件到指定路径
 * @param {string} url 下载地址
 * @param {string} destination 文件保存路径
 * @param {function} onProgress 下载进度回调
 * @returns Promise<void>
 * @throws {Error} 下载失败时抛出异常
 */
async function downloadFile(url, destination, onProgress) {
  console.log("start download", url, "->", destination);
}

async function runCommand(command) {
  try {
    let { code, stdout, stderr } = await exec(command[0], command.slice(1), {
      timeout: 10000,
    });
    if (code == 0) {
      return stdout;
    } else {
      return stderr;
    }
  } catch (e) {
    console.error(
      `run [${command.join(" ")}] failed[${e.code}]: ${e.message} \n${e.stdout}`
    );
    throw e;
  }
}

window.runCommand = runCommand;
window.downloadFile = downloadFile;
