import mlx_whisper

MODEL_NAME = "mlx-community/whisper-base-mlx"


def _run_transcribe(file_path: str, **kwargs):
  try:
    return mlx_whisper.transcribe(file_path, path_or_hf_repo=MODEL_NAME, **kwargs)
  except TypeError:
    return mlx_whisper.transcribe(file_path, model=MODEL_NAME, **kwargs)


def _extract_text(result) -> str:
  if isinstance(result, dict) and "text" in result:
    return str(result["text"]).strip()

  return str(result).strip()


def transcribe(file_path: str, preferred_languages: list[str] | None = None) -> str:
  preferred = [lang.lower() for lang in (preferred_languages or ["en", "hi"])]

  result = _run_transcribe(file_path, language=None, task="transcribe")
  text = _extract_text(result)
  if text:
    return text

  for language in preferred:
    result = _run_transcribe(file_path, language=language, task="transcribe")
    text = _extract_text(result)
    if text:
      return text

  return text
