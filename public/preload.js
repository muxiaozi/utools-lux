const { exec } = require("teen_process");

async function runCommand(command) {
  try {
    let { code, stdout, stderr } = await exec(command[0], command.slice(1));
    if (code == 0) {
      console.log(`run [${command.join(" ")}] success: ${stdout}`);
      return stdout;
    } else {
      console.error(`run [${command.join(" ")}] failed[${code}]: ${stderr}`);
      return stderr;
    }
  } catch (e) {
    console.error(`run [${command.join(" ")}] failed[${e.code}]: ${e}`);
    throw e;
  }
}

window.runCommand = runCommand;
