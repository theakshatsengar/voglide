import sys
import threading
import wave
from pathlib import Path

import sounddevice as sd

from transcriber import transcribe

SAMPLE_RATE = 16000
CHANNELS = 1
SAMPLE_WIDTH = 2
OUTPUT_FILE = Path(__file__).parent / "recording.wav"


def record_until_stopped(output_path: Path) -> Path:
  stop_event = threading.Event()

  def wait_for_stop() -> None:
    sys.stdin.readline()
    stop_event.set()

  stop_thread = threading.Thread(target=wait_for_stop, daemon=True)
  stop_thread.start()

  with wave.open(str(output_path), "wb") as wav_file:
    wav_file.setnchannels(CHANNELS)
    wav_file.setsampwidth(SAMPLE_WIDTH)
    wav_file.setframerate(SAMPLE_RATE)

    def callback(indata, _frames, _time, status):
      if status:
        print(status, file=sys.stderr)
      wav_file.writeframes(indata.tobytes())
      if stop_event.is_set():
        raise sd.CallbackStop()

    with sd.InputStream(
      samplerate=SAMPLE_RATE,
      channels=CHANNELS,
      dtype="int16",
      callback=callback,
    ):
      stop_thread.join()

  return output_path


def run() -> str:
  file_path = record_until_stopped(OUTPUT_FILE)
  try:
    return transcribe(str(file_path))
  finally:
    try:
      file_path.unlink()
    except OSError:
      pass


if __name__ == "__main__":
  print(run())
