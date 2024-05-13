const { exec } = require("teen_process");

async function runCommand(command) {
  try {
    let { code, stdout, stderr } = await exec(command[0], command.slice(1));
    if (code == 0) {
      return stdout;
    } else {
      return stderr;
    }
  } catch (e) {
    console.error(`run [${command.join(" ")}] failed[${e.code}]: ${e.stdout}`);
    throw e;
  }
}

window.runCommand = runCommand;
