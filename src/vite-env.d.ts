/// <reference types="vite/client" />

interface DownloadProcess {
  pid?: number;

  on(event: "error", listener: (err: Error) => void): void;
  on(
    event: "finish",
    listener: (code: number, stdout: string, stderr: string) => void
  ): void;
  on(event: "progress", listener: (progress: number) => void): void;

  stop(): void;
}

interface DownloadVideoInfo {
  ffmpegPath: string;
}

declare function runCommand(command: string[]): Promise<string>;

declare function downloadVideo(
  command: string[],
  options: DownloadVideoInfo
): DownloadProcess;
