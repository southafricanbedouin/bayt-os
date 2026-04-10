#!/usr/bin/env python3
"""
BaytOS Gemini Runner
────────────────────
Reads a batch prompt .md file, sends it to Gemini 2.5 Pro,
extracts TSX/TS code blocks, and writes files directly into the
baytOS app/ folder.

Usage:
  python gemini-runner.py 5          # runs gemini-batch-5-*.md
  python gemini-runner.py 6          # runs gemini-batch-6-*.md
  python gemini-runner.py batch-9    # partial match
  python gemini-runner.py gemini-batch-9--rhythm.md  # full name

Setup (first time only):
  pip install google-genai
"""

import sys
import os
import re
import time
from pathlib import Path

# ── Config ──────────────────────────────────────────────────────────────────
API_KEY   = "AIzaSyC46OHUeH0bw2gaatrNfnqnhMXb9Wk4ciM"
MODEL     = "gemini-2.5-pro"

# Paths — adjust BATCH_DIR if your batch .md files live elsewhere
SCRIPT_DIR = Path(__file__).parent.resolve()
BAYT_ROOT  = SCRIPT_DIR                     # app/ lives here
BATCH_DIR  = SCRIPT_DIR.parent / "[P02] BaytOS [Bayt Seedat]"

# Fallback: if batch dir not found, check same folder as script
if not BATCH_DIR.exists():
    BATCH_DIR = SCRIPT_DIR

# ── Gemini client ────────────────────────────────────────────────────────────
try:
    from google import genai
except ImportError:
    print("\n  ✗  google-genai not installed. Run:\n")
    print("     pip install google-genai\n")
    sys.exit(1)

client = genai.Client(api_key=API_KEY)

# ── Helpers ──────────────────────────────────────────────────────────────────
def extract_files(text: str) -> list[tuple[str, str]]:
    """
    Extract (filepath, code) pairs from Gemini's response.
    Handles patterns like:
      app/deen/deen-client.tsx
      ```tsx
      ...code...
      ```
    And also:
      // app/deen/deen-client.tsx
      // File: app/foo/bar.tsx
    """
    files = []

    # Strategy 1: filepath on its own line (or as comment) before a code fence
    pattern = re.compile(
        r'(?:^|\n)'
        r'(?:/{1,2}\s*(?:File:|Path:)?\s*)?'   # optional // comment prefix
        r'(app/[\w\-./]+\.tsx?)'                 # app/path/to/file.tsx
        r'[^\n]*\n'
        r'```(?:tsx?|typescript|javascript)?\s*\n'
        r'(.*?)'
        r'```',
        re.DOTALL | re.MULTILINE
    )
    for m in pattern.finditer(text):
        files.append((m.group(1).strip(), m.group(2).strip()))

    # Strategy 2: fall back to all code blocks if no filepath annotations
    if not files:
        blocks = re.findall(
            r'```(?:tsx?|typescript|javascript)?\s*\n(.*?)```',
            text, re.DOTALL
        )
        print(f"\n  ⚠  No filepath annotations found — got {len(blocks)} raw block(s).")
        print("  Raw response saved to __gemini_raw_response.txt")
        (BAYT_ROOT / '__gemini_raw_response.txt').write_text(text, encoding='utf-8')
        for i, block in enumerate(blocks):
            files.append((f'app/__output_{i+1}.tsx', block.strip()))

    return files


def write_file(rel_path: str, code: str) -> Path:
    full = BAYT_ROOT / rel_path
    full.parent.mkdir(parents=True, exist_ok=True)
    full.write_text(code, encoding='utf-8')
    return full


def find_batch(arg: str) -> Path:
    if arg.endswith('.md') and Path(arg).exists():
        return Path(arg)
    if arg.endswith('.md') and (BATCH_DIR / arg).exists():
        return BATCH_DIR / arg
    # Try numeric or partial match
    for pattern in [f'gemini-batch-{arg}--*.md', f'*{arg}*.md']:
        matches = sorted(BATCH_DIR.glob(pattern))
        if matches:
            return matches[0]
    return None


# ── Main ─────────────────────────────────────────────────────────────────────
def run(batch_file: Path):
    print(f"\n{'═'*58}")
    print(f"  BaytOS Gemini Runner")
    print(f"  File  : {batch_file.name}")
    print(f"  Model : {MODEL}")
    print(f"{'═'*58}\n")

    prompt = batch_file.read_text(encoding='utf-8')
    print(f"  Prompt: {len(prompt):,} chars  →  sending to Gemini...\n")

    # Append output format instructions
    prompt += """

---

## CRITICAL OUTPUT FORMAT

Return ONLY the code file(s). For EACH file, use EXACTLY this format — filepath on its own line, then fenced code block:

app/folder/filename.tsx
```tsx
'use client'
// ... full file contents
```

No prose, no explanation, no intro text. Just filepath + code block repeated for each file.
"""

    t0 = time.time()
    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config={
            'temperature': 0.2,
            'max_output_tokens': 65536,
        }
    )
    elapsed = time.time() - t0
    raw = response.text
    print(f"  ✓  Response in {elapsed:.1f}s  ({len(raw):,} chars)\n")

    files = extract_files(raw)

    if not files:
        print("  ✗  No code extracted. Check __gemini_raw_response.txt")
        (BAYT_ROOT / '__gemini_raw_response.txt').write_text(raw, encoding='utf-8')
        return

    print(f"  Writing {len(files)} file(s):\n")
    for rel_path, code in files:
        out = write_file(rel_path, code)
        lines = code.count('\n') + 1
        print(f"    ✓  {rel_path}  ({lines} lines)")

    print(f"\n  Done. Files written to:\n  {BAYT_ROOT}\n")
    print("  → Now open your Cowork session and tell Claude:")
    print(f"    'Batch {batch_file.stem} files are in — wire them up'\n")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("\nUsage: python gemini-runner.py <batch-number-or-filename>\n")
        print("Examples:")
        print("  python gemini-runner.py 5")
        print("  python gemini-runner.py 9")
        print("  python gemini-runner.py gemini-batch-5--deen-health-education.md\n")
        print("Available batches:")
        for f in sorted(BATCH_DIR.glob('gemini-batch-*.md')):
            print(f"  {f.name}")
        sys.exit(1)

    batch_file = find_batch(sys.argv[1])
    if not batch_file:
        print(f"\n  ✗  No batch file matching '{sys.argv[1]}'")
        print(f"  Looked in: {BATCH_DIR}\n")
        sys.exit(1)

    run(batch_file)
