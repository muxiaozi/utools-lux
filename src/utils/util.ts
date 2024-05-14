async function where(exe: string): Promise<string> {
  if (utools.isWindows()) {
    return await runCommand(["where.exe", exe]);
  } else {
    return await runCommand(["whereis", exe]);
  }
}

/**
 * 删除URL的查询参数
 * http://example.com?query=1 => http://example.com
 */
function cleanupUrl(url: string): string {
  return url.replace(/\?.*/, "");
}

export { where, cleanupUrl };
