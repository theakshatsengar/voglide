const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let recordingSession = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadURL("http://localhost:5173");
}

const startRecording = () => {
  if (recordingSession) {
    throw new Error("Recording already in progress.");
  }

  const scriptPath = path.join(__dirname, "..", "..", "backend", "run_transcription.py");
  const workspaceRoot = path.join(__dirname, "..", "..");

  const proc = spawn("python3", [scriptPath], {
    cwd: workspaceRoot,
    stdio: ["pipe", "pipe", "pipe"]
  });

  const session = {
    proc,
    stdout: "",
    stderr: ""
  };

  proc.stdout.on("data", (data) => {
    session.stdout += data.toString();
  });

  proc.stderr.on("data", (data) => {
    session.stderr += data.toString();
  });

  proc.on("error", (error) => {
    session.stderr += error.message;
  });

  recordingSession = session;
};

const stopRecording = () => {
  if (!recordingSession) {
    throw new Error("No active recording.");
  }

  const session = recordingSession;
  recordingSession = null;

  return new Promise((resolve, reject) => {
    session.proc.once("exit", (code) => {
      const stdout = session.stdout.trim();
      const stderr = session.stderr.trim();

      if (code && code !== 0) {
        reject(stderr || `Python exited with code ${code}.`);
        return;
      }

      resolve(stdout);
    });

    if (session.proc.stdin) {
      session.proc.stdin.write("\n");
      session.proc.stdin.end();
    }
  });
};

ipcMain.handle("start-recording", () => {
  startRecording();
  return { ok: true };
});

ipcMain.handle("stop-recording", async () => {
  const result = await stopRecording();
  return result;
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
