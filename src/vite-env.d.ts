/// <reference types="vite/client" />

declare function runCommand(command: string[]): Promise<string>;

declare function downloadFile(
  url: string,
  path: string,
  onProgress?: (progress: number) => void
): Promise<void>;
