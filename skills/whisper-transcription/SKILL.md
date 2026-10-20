---
name: whisper-transcription
description: >-
  Local audio transcription with faster-whisper (Whisper large-v3 by default,
  GPU if available, CPU otherwise): a ready-made script, setup for Windows,
  Linux and macOS, how to check the result, and what a transcript cannot do.
  Use whenever a recording should become text, even if neither "Whisper" nor
  "transcribe" is said: an interview, a meeting recording, a lecture, a voice
  memo, an `.m4a`, `.mp3`, `.wav`, `.mp4`, `.opus` as a source for quotes,
  minutes or subtitles. Also use when an existing transcript is checked against
  the audio at a disputed passage, or when someone considers uploading audio to
  a transcription service. German triggers: "transkribieren", "Transkript",
  "Mitschnitt", "Aufnahme abtippen", "Untertitel erstellen", "Sprachnachricht
  in Text". Not for live dictation, and not for speaker diarization (the model
  does not provide it).
---

# Local transcription with faster-whisper

Audio stays on the machine. Interviews and meetings usually contain other
people's words, and a local model avoids sending them to a third party. The
script in `scripts/transcribe.py` wraps faster-whisper with defaults that
favour accuracy and fail loudly instead of silently.

## Step 1: find or build the environment

**Look before installing.** If the user already has a venv with
faster-whisper, use it; a second environment helps nobody (with the NVIDIA
libraries one measured 2.3 GiB, 2.0 GiB of it the libraries). Check with
the candidate Python:

```
<python> -c "import faster_whisper, ctranslate2; print(faster_whisper.__version__, ctranslate2.get_cuda_device_count())"
```

The second number is the count of CUDA devices ctranslate2 can see. `0`
means the run will use the CPU.

Only if nothing exists, set one up (ask the user first, it downloads a few GB
including the model on first run):

```
python -m venv whisper-venv
# Windows: whisper-venv\Scripts\python.exe   Linux/macOS: whisper-venv/bin/python
<venv-python> -m pip install faster-whisper
```

**NVIDIA GPU (optional, much faster).** Current ctranslate2 needs cuBLAS for
CUDA 12 and cuDNN 9. If they are not installed system-wide:

```
<venv-python> -m pip install nvidia-cublas-cu12 "nvidia-cudnn-cu12==9.*"
```

- **Windows:** the script finds these pip packages itself and adds their DLL
  folders before loading the model. Nothing else to do. (The faster-whisper
  README calls the pip route "Linux only"; with this wiring it runs on
  Windows, tested with faster-whisper 1.2.1, ctranslate2 4.8.1,
  nvidia-cudnn-cu12 9.25.) The Windows wheel of ctranslate2 4.8.1 ships its
  own `cudnn64_9.dll`; a run with only cuBLAS wired worked (2026-10-20).
  So on Windows `nvidia-cublas-cu12` alone may do and saves about 1 GiB.
  Keep cuDNN in the install if the ctranslate2 version differs.
- **Linux:** `LD_LIBRARY_PATH` must point at the libraries *before* Python
  starts, so the script cannot do it. From the faster-whisper README:

  ```
  export LD_LIBRARY_PATH=`<venv-python> -c 'import os; import nvidia.cublas.lib; import nvidia.cudnn.lib; print(os.path.dirname(nvidia.cublas.lib.__file__) + ":" + os.path.dirname(nvidia.cudnn.lib.__file__))'`
  ```
- **AMD GPU (ROCm):** ctranslate2 publishes separate wheels on its GitHub
  releases page. Not tested with this script.
- **macOS and machines without a supported GPU:** CPU only, Apple Silicon
  included. Works, but large-v3 is slow. Offer `--model medium` or
  `--model small` for long recordings and say that accuracy drops,
  especially for names.

No ffmpeg needed: faster-whisper decodes audio with PyAV, which bundles it.

## Step 2: run

```
<venv-python> scripts/transcribe.py <audio> [<audio> ...] --language <code|auto>
```

Use the venv's Python, not whatever `python` is on the PATH. The script says
so if it is started with the wrong one.

| Option | Default | Note |
|---|---|---|
| `--language`, `-l` | required | ISO code (`en`, `de`, `fr`, …) or `auto` |
| `--model`, `-m` | `large-v3` | any faster-whisper model name or local path |
| `--device` | `auto` | `cuda` if a GPU is visible, else `cpu` |
| `--compute-type` | `auto` | `float16` on GPU, `int8` on CPU |
| `--output-dir`, `-o` | next to the audio | must exist |
| `--no-vad` | VAD on | the voice activity filter skips silence |

**The language is required on purpose.** A typo fails at once instead of
falling back to detection and producing a transcript in the wrong language
after a long run. Ask the user for the language if it is not obvious. Use
`auto` only when they do not know it; the script then prints what it
detected.

Output per file: `<audio>.txt` (one segment per line,
`[start -> end] text`, seconds) and `<audio>.srt`. Example: `talk.m4a` gives
`talk.m4a.txt` and `talk.m4a.srt`, so they never overwrite a `talk.txt`
that came with the recording (some recorder apps ship one).

On the first run the model is downloaded into the Hugging Face cache
(large-v3: 2.9 GiB). Tell the user before a first run on a metered
connection.

Run long recordings in the background. Every 25 segments the script prints
the audio minute it has reached.

## Step 3: check the result

| Exit code | Meaning |
|---|---|
| 0 | all files transcribed |
| 1 | model could not load, or a transcription failed |
| 2 | usage error: missing file, unknown language, wrong Python |
| 3 | no speech found in at least one file, nothing written for it |

**Also check the files, not only the exit code.** With an earlier version of
this script, a run on one Windows machine was reported as exit code 0
although a PyAV DLL blocked by Windows Application Control had stopped it.
The error was only on stderr. So read stderr, and look at the files:

- The script writes to `.part` files and renames them at the end. A `.txt`
  written by this run is complete.
- An error during transcription normally removes the `.part` files and ends
  with exit 1. A leftover `.part` means the run did not finish: the process
  crashed, or the clean-up or a rename failed because another program holds
  a file open. Then `.txt` and `.srt` may come from different runs: compare their
  modification times before trusting either.
- The script prints the audio length when it starts on a file. Compare it
  with the last timestamp in the `.txt`.

If the run fails with a missing `cudnn*.dll`, `libcudnn*.so` or `cublas`
library, the GPU setup is incomplete: fix it as in step 1, or rerun with
`--device cpu`. This usually surfaces at the first transcription, not when
the model loads.

**Sandboxes.** If a run fails only inside a sandbox (for example a library
that cannot be loaded), retry outside it and tell the user why.

## What the transcript cannot do

**No speaker diarization.** The output is text with times, not who said it.
If you name speakers, that is an inference: mark it (`[probably Anna]`).
Someone introducing themselves on tape is evidence. Attributing words to a
person needs the same care as quoting a number.

**Names and technical terms are unreliable.** Whisper mishears exactly the
words that matter most: names, places, jargon, product names. Check every
quote that will carry weight against the audio, using the timestamp.

**Keep the audio findable.** A disputed passage can only be settled by
listening again. The transcript alone cannot answer that, because the
transcript is what is in doubt. Do not delete or move the recording unless
the user says so.

## Cleaning up a transcript (when asked)

If the user wants a readable version (minutes, quotes, an article), produce
it as a separate file and keep the raw `.txt`/`.srt` unless told otherwise.

- **Fix mishearings, do not polish.** Paragraphs and speaker turns may be
  added. Rewording may not, unless the user asks for a summary.
- **Where two sources disagree** (Whisper vs. a transcript from a recorder
  app, for example), decide per passage. If it matters (a name, a number, a
  commitment), decide by listening.
- **Keep Whisper's timestamps** at each paragraph. They are the way back
  into the audio.
- **Put the original file name of the recording at the top**, so the audio
  can be found again.
