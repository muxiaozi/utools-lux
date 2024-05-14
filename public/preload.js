const child_process = require("node:child_process");

async function runCommand(command) {
  return new Promise((resolve, reject) => {
    child_process.execFile(
      command[0],
      command.slice(1),
      (err, stdout, stderr) => {
        if (err) {
          reject(err);
        } else {
          resolve(stdout);
        }
      }
    );
  });
}

function downloadVideo(command) {
  let proc = child_process.spawn(command[0], command.slice(1));
  let stdout = "";
  let stderr = "";
  const callbackMap = new Map();

  proc.on("error", (err) => {
    const cb = callbackMap.get("error");
    if (cb) {
      cb(err);
    }
    console.log("Error: ", err);
  });

  proc.stdout.on("data", (data) => {
    stdout += data.toString();
  });

  proc.stderr.on("data", (data) => {
    stderr += data.toString();
    // 6.00 MiB / 37.85 MiB [========>---------------------------------------------] 3.86 MiB p/s 15.85% 8s
    let progressRegex =
      /([\d\.]+) (\w+) \/ ([\d\.]+) (\w+) [^\]]*\] (\?|([\d\.]+) ([\w]+)) p\/s ([\d\.]+)%/;
    let progress = data.toString().match(progressRegex);
    // progress[1] 当前大小
    // progress[2] 单位
    // progress[3] 总大小
    // progress[4] 单位
    // progress[5] 速度 | ?
    // progress[6] 速度
    // progress[7] 速度单位
    // progress[8] 百分比
    if (progress) {
      const cb = callbackMap.get("progress");
      if (cb) {
        cb(progress[8]);
      }
    }
    console.log("stderr: ", data.toString(), progress);
  });

  proc.on("close", (code) => {
    const cb = callbackMap.get("finish");
    if (cb) {
      cb(code, stdout, stderr);
    }
    console.log("close: ", code, ", stdout:", stdout, ", stderr:", stderr);
  });

  /**
   * @param {*} event "progress" | "error" | "finish"
   * @param {*} callback
   */
  function on(event, callback) {
    callbackMap.set(event, callback);
  }

  /**
   * 停止下载
   */
  function stop() {
    proc.kill();
  }

  return {
    pid: proc.pid,
    on,
    stop,
  };
}

window.runCommand = runCommand;
window.downloadVideo = downloadVideo;
