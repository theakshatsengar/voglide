interface Window {
  require?: (module: string) => any;
  electron?: {
    startRecording: () => Promise<{ ok: boolean }>;
    stopRecording: () => Promise<string>;
  };
}
