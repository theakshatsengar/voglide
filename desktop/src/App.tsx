import { useState } from "react";

function App() {
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const startRecording = async () => {
    if (!window.electron) {
      setTranscript("Electron bridge is unavailable.");
      return;
    }

    setIsBusy(true);
    setTranscript("Recording...");

    try {
      await window.electron.startRecording();
      setIsRecording(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setTranscript(message || "Failed to start recording.");
    } finally {
      setIsBusy(false);
    }
  };

  const stopRecording = async () => {
    if (!window.electron) {
      setTranscript("Electron bridge is unavailable.");
      return;
    }

    setIsBusy(true);
    setTranscript("Transcribing...");

    try {
      const result = await window.electron.stopRecording();
      setTranscript(result || "No transcript returned.");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setTranscript(message || "Failed to stop recording.");
    } finally {
      setIsBusy(false);
      setIsRecording(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Meeting Transcriber</h1>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={startRecording} disabled={isBusy || isRecording}>
          {isRecording ? "Recording..." : "Start Recording"}
        </button>
        <button onClick={stopRecording} disabled={isBusy || !isRecording}>
          Stop Recording
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Transcript:</h3>
        <p>{transcript}</p>
      </div>
    </div>
  );
}

export default App;
