const { exec } = require("teen_process");

async function runCommand(commands) {
  try {
    let result = await exec(commands[0], commands.slice(1), {
      shell: true,
    });
    if (result.code == 0) {
      return result.stdout;
    } else {
      return result.stderr;
    }
  } catch (error) {
    console.log("wtf", error.stdout, error.error);
    return error.stderr;
  }
}

window.runCommand = runCommand;
