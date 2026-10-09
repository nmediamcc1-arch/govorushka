#!/usr/bin/env python3
"""Генерирует озвучку из content.json в audio/*.m4a и phrases.json (id -> текст).

  python3 build_audio.py --engine say           # macOS say, голос Milena (офлайн)
  python3 build_audio.py                       # Google Cloud TTS (Chirp 3 HD), ключ GOOGLE_SHEETS_SA_JSON
  python3 build_audio.py --engine google --voice ru-RU-Chirp3-HD-Aoede --force
  python3 build_audio.py --only praise_1,hello --force   # перегенерировать отдельные фразы
"""
import argparse, base64, json, subprocess, sys, tempfile, urllib.request
from pathlib import Path

ROOT = Path(__file__).parent


def phrases(c):
    p = dict(c["phrases"])
    for it in c["items"]:
        i, n = it["id"], it["name"]
        p[f"name_{i}"] = f"{n.capitalize()}!"
        p[f"where_{i}"] = f"Где {n}?"
        p[f"this_{i}"] = f"Это {n}."
        if "sound" in it:
            p[f"sound_{i}"] = it["sound"]
        if "says" in it:
            p[f"who_{i}"] = f"Кто говорит: {it['says']}?"
    for f in c["feed"]:
        p[f"feed_ask_{f['animal']}"] = f["ask"]
        p[f"feed_ok_{f['animal']}"] = f["ok"]
    for col in c["colors"]:
        p[f"ball_{col['id']}"] = f"{col['m'].capitalize()} шарик!"
        p[f"whereball_{col['id']}"] = f"Где {col['m']} шарик?"
        p[f"thisball_{col['id']}"] = f"Это {col['m']} шарик."
        p[f"pop_{col['id']}"] = f"Лопни {col['m']} шарик!"
    for s in c["shapes"]:
        for col in c["colors"]:
            p[f"combo_{col['id']}_{s['id']}"] = f"{col[s['g']]} {s['name']}".capitalize() + "!"
    return p


def tts_say(text, wav, voice):
    subprocess.run(["say", "-v", voice or "Milena", "-r", "140", "-o", str(wav), text], check=True)


_token = None


def tts_google(text, wav, voice):
    global _token
    if _token is None:
        sys.path.insert(0, str(Path.home() / "Documents/agency-ops"))
        from lib import google_sa
        _token = google_sa.token("https://www.googleapis.com/auth/cloud-platform")
    body = {
        "input": {"text": text},
        "voice": {"languageCode": "ru-RU", "name": voice or "ru-RU-Chirp3-HD-Aoede"},
        "audioConfig": {"audioEncoding": "LINEAR16", "sampleRateHertz": 24000, "speakingRate": 0.9},
    }
    req = urllib.request.Request("https://texttospeech.googleapis.com/v1/text:synthesize",
                                 data=json.dumps(body).encode(),
                                 headers={"Authorization": "Bearer " + _token, "Content-Type": "application/json"})
    data = json.loads(urllib.request.urlopen(req, timeout=60).read())
    Path(wav).write_bytes(base64.b64decode(data["audioContent"]))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--engine", choices=["say", "google"], default="google")
    ap.add_argument("--voice")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--only", help="через запятую: id фраз")
    a = ap.parse_args()
    c = json.loads((ROOT / "content.json").read_text())
    p = phrases(c)
    (ROOT / "phrases.json").write_text(json.dumps(p, ensure_ascii=False, indent=1))
    only = set(a.only.split(",")) if a.only else None
    tts = tts_google if a.engine == "google" else tts_say
    out = ROOT / "audio"
    out.mkdir(exist_ok=True)
    keep = {f"{k}.m4a" for k in p}
    for f in out.glob("*.m4a"):
        if f.name not in keep:
            f.unlink()
    made = 0
    with tempfile.TemporaryDirectory() as tmp:
        for key, text in p.items():
            dst = out / f"{key}.m4a"
            if only is not None and key not in only:
                continue
            if dst.exists() and not a.force:
                continue
            src = Path(tmp) / (key + (".wav" if a.engine == "google" else ".aiff"))
            tts(text, src, a.voice)
            subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "64000", str(src), str(dst)], check=True)
            made += 1
    print(f"phrases: {len(p)}, generated: {made}")


if __name__ == "__main__":
    main()
