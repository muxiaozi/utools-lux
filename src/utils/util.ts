async function where(exe: string): Promise<string> {
  if (utools.isWindows()) {
    return await runCommand(["where.exe", exe]);
  } else {
    return await runCommand(["whereis", exe]);
  }
}

export { where };
