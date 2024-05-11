const { exec } = require("teen_process");
const fs = require("fs");
const https = require("follow-redirects").https;

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
  return new Promise((resolve, reject) => {
    var options = {
      host: "127.0.0.1",
      port: 10809,
      path: url,
      // headers: {
      //   Host: "www.google.com",
      // },
    };
    https
      .get(options, (response) => {
        const totalLength = response.headers["content-length"];
        let downloadedLength = 0;
        response.on("data", (chunk) => {
          downloadedLength += chunk.length;
          let progress = (downloadedLength / totalLength) * 100;
          if (onProgress) {
            onProgress(progress);
          }
          console.log("Downloading... ", progress);
        });

        const file = fs.createWriteStream(path);
        file.on("finish", () => {
          file.close();
          resolve();
        });
        file.on("error", (error) => {
          fs.unlink(path);
          reject(error);
        });

        response.pipe(file);
      })
      .on("error", (error) => {
        fs.unlink(path, (err) => {
          if (err) {
            console.error(err);
          }
        });
        reject(error);
      });
  });
}

async function runCommand(command) {
  try {
    let { code, stdout, stderr } = await exec(command[0], command.slice(1), {
      timeout: 60000,
    });
    if (code == 0) {
      return stdout;
    } else {
      return stderr;
    }
  } catch (e) {
    console.error(
      `run [${command.join(" ")}] failed[${e.code}]: ${e.stdout}`
    );
    throw e;
  }
}

window.runCommand = runCommand;
window.downloadFile = downloadFile;
