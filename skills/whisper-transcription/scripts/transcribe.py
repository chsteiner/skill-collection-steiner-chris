#!/usr/bin/env python
"""Local audio transcription with faster-whisper.

Usage (with the Python of the venv that has faster-whisper installed):
    python transcribe.py <audio> [<audio> ...] --language <code|auto>
                         [--model large-v3] [--device auto|cuda|cpu]
                         [--compute-type auto|float16|int8_float16|int8|...]
                         [--output-dir DIR] [--no-vad]

Writes <audio>.txt (one line per segment, with timestamps) and <audio>.srt
next to the audio file, or into --output-dir. Both are written to a .part
file first and renamed only after the run finished, so a file this run wrote
is a complete one. An error during transcription normally removes the .part
files. A .part left behind means the process crashed, or the clean-up or a
rename failed (for example a file held open by another program); then .txt
and .srt may come from different runs.

--language is required on purpose: a typo should fail loudly instead of
silently falling back to auto-detection and returning a transcript in the
wrong language half an hour later. Pass "auto" to ask for detection
explicitly.

Exit codes: 0 success, 1 transcription failed, 2 usage error,
3 no speech found (no output written).
"""
from __future__ import annotations

import argparse
import importlib.util
import os
import sys
from pathlib import Path

CUDA_HINT = ("If a CUDA library (cuBLAS, cuDNN) is missing, see the setup "
             "section of SKILL.md, or retry with --device cpu.")


def wire_cuda_dlls() -> None:
    """On Windows, make pip-installed NVIDIA DLLs (nvidia-cublas-cu12,
    nvidia-cudnn-cu12) visible before ctranslate2 loads. No-op elsewhere
    and when the packages are not installed. On Linux the equivalent is
    LD_LIBRARY_PATH, which must be set before Python starts."""
    if os.name != "nt":
        return
    for pkg in ("nvidia.cublas", "nvidia.cudnn"):
        try:
            spec = importlib.util.find_spec(pkg)
        except ModuleNotFoundError:
            continue
        if spec is None or not spec.submodule_search_locations:
            continue
        for loc in spec.submodule_search_locations:
            d = Path(loc) / "bin"
            if d.is_dir():
                os.add_dll_directory(str(d))
                os.environ["PATH"] = str(d) + os.pathsep + os.environ["PATH"]


def srt_ts(seconds: float) -> str:
    ms = round(seconds * 1000)
    h, rest = divmod(ms, 3_600_000)
    m, rest = divmod(rest, 60_000)
    s, ms = divmod(rest, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Transcribe audio locally with faster-whisper.",
        epilog="Exit codes: 0 ok, 1 failed, 2 usage, 3 no speech found.",
    )
    p.add_argument("audio", nargs="+", type=Path, help="audio or video file(s)")
    p.add_argument("--language", "-l", required=True,
                   help='language code such as "en" or "de", or "auto"')
    p.add_argument("--model", "-m", default="large-v3",
                   help="model size or path (default: large-v3)")
    p.add_argument("--device", choices=("auto", "cuda", "cpu"), default="auto")
    p.add_argument("--compute-type", default="auto",
                   help="default: float16 on cuda, int8 on cpu")
    p.add_argument("--output-dir", "-o", type=Path,
                   help="default: next to each audio file")
    p.add_argument("--no-vad", action="store_true",
                   help="disable the voice activity filter")
    return p.parse_args()


def language_ok(lang: str) -> bool:
    if lang == "auto":
        return True
    try:
        from faster_whisper.tokenizer import _LANGUAGE_CODES
    except ImportError:
        return True  # private name moved; faster-whisper validates on its own
    if lang not in _LANGUAGE_CODES:
        print(f"Unknown language code: {lang!r}. "
              f"Known: {', '.join(_LANGUAGE_CODES)}, or auto.",
              file=sys.stderr)
        return False
    return True


def pick_device(requested: str) -> str:
    if requested != "auto":
        return requested
    import ctranslate2
    return "cuda" if ctranslate2.get_cuda_device_count() > 0 else "cpu"


def transcribe_one(model, audio: Path, lang: str, out_dir: Path | None,
                   vad: bool) -> int:
    target = (out_dir or audio.parent) / audio.name
    txt_path = target.with_name(target.name + ".txt")
    srt_path = target.with_name(target.name + ".srt")
    txt_part = txt_path.with_name(txt_path.name + ".part")
    srt_part = srt_path.with_name(srt_path.name + ".part")

    segments, info = model.transcribe(
        str(audio),
        language=None if lang == "auto" else lang,
        vad_filter=vad,
        condition_on_previous_text=False,
        beam_size=5,
    )
    print(f"{audio.name}: audio {info.duration / 60:.1f} min", flush=True)
    if lang == "auto":
        print(f"Detected language: {info.language} "
              f"(p={info.language_probability:.2f})", flush=True)

    n = 0
    try:
        with open(txt_part, "w", encoding="utf-8") as txt, \
             open(srt_part, "w", encoding="utf-8") as srt:
            for seg in segments:
                n += 1
                line = seg.text.strip()
                txt.write(f"[{seg.start:8.2f} -> {seg.end:8.2f}] {line}\n")
                srt.write(f"{n}\n{srt_ts(seg.start)} --> {srt_ts(seg.end)}\n"
                          f"{line}\n\n")
                if n % 25 == 0:
                    print(f"  ... {n} segments, at {seg.end / 60:.1f} min",
                          flush=True)
    except BaseException:
        txt_part.unlink(missing_ok=True)
        srt_part.unlink(missing_ok=True)
        raise

    if n == 0:
        txt_part.unlink(missing_ok=True)
        srt_part.unlink(missing_ok=True)
        print(f"No speech found in {audio} "
              f"(audio {info.duration / 60:.1f} min). Nothing written.",
              file=sys.stderr)
        return 3

    txt_part.replace(txt_path)
    srt_part.replace(srt_path)
    print(f"Done: {n} segments, audio {info.duration / 60:.1f} min "
          f"({info.language}).", flush=True)
    print(f"  {txt_path}\n  {srt_path}", flush=True)
    return 0


def main() -> int:
    # A console code page such as cp1252 cannot print every file name; a
    # failed print after the files are written must not turn into exit 1.
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(errors="backslashreplace")
    args = parse_args()
    missing = [a for a in args.audio if not a.is_file()]
    if missing:
        for a in missing:
            print(f"Audio file not found: {a}", file=sys.stderr)
        return 2
    if args.output_dir and not args.output_dir.is_dir():
        print(f"Output directory not found: {args.output_dir}", file=sys.stderr)
        return 2

    wire_cuda_dlls()
    try:
        from faster_whisper import WhisperModel
    except ImportError as e:
        print(f"faster-whisper is not importable from {sys.executable}: {e}\n"
              "Run the script with the Python of the venv it is installed in.",
              file=sys.stderr)
        return 2
    if not language_ok(args.language):
        return 2

    device = pick_device(args.device)
    compute_type = args.compute_type
    if compute_type == "auto":
        compute_type = "float16" if device == "cuda" else "int8"
    print(f"Model {args.model} on {device} ({compute_type})", flush=True)

    try:
        model = WhisperModel(args.model, device=device,
                             compute_type=compute_type)
    except Exception as e:
        print(f"Could not load the model: {e}", file=sys.stderr)
        if device == "cuda":
            print(CUDA_HINT, file=sys.stderr)
        return 1

    codes = []
    for audio in args.audio:
        try:
            codes.append(transcribe_one(model, audio, args.language,
                                        args.output_dir, not args.no_vad))
        except Exception as e:
            print(f"Transcription failed for {audio}: {e}", file=sys.stderr)
            if device == "cuda":
                # a missing cuBLAS/cuDNN shows up here, not at model load
                print(CUDA_HINT, file=sys.stderr)
            codes.append(1)
    # a failure outranks "no speech", which outranks success
    for rc in (1, 3):
        if rc in codes:
            return rc
    return 0


if __name__ == "__main__":
    sys.exit(main())
