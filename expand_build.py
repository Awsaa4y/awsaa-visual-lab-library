#!/usr/bin/env python3
"""Phase 2: convert matched SVGs to PNG, append manifest, update GAPS."""
import json, os, re
import cairosvg
from PIL import Image

EN_DIR = "/tmp/mulberry-symbols/EN"
LIB = "/home/hatch/workspace/visual-lab-library"

# (english, arabic, category, svg_file, note)
NEW = [
    # home: foods
    ("orange","برتقالة","home","orange.svg"),("meat","لحم","home","meat.svg"),
    ("cheese","جبن","home","cheese.svg"),("cake","كعكة","home","cake.svg"),
    ("chocolate","شوكولاتة","home","chocolate.svg"),("soup","حساء","home","soup.svg"),
    ("pasta","معكرونة","home","pasta.svg"),("potato","بطاطس","home","potato.svg"),
    ("salad","سلطة","home","salad.svg"),("sandwich","شطيرة","home","sandwich.svg"),
    ("yoghurt","زبادي","home","yogurt.svg"),("butter","زبدة","home","butter.svg"),
    ("jam","مربى","home","jam.svg"),
    # home: colors & numbers
    ("red","أحمر","home","red.svg"),("blue","أزرق","home","blue.svg"),
    ("green","أخضر","home","green.svg"),("yellow","أصفر","home","yellow.svg"),
    ("black","أسود","home","black.svg"),("white","أبيض","home","white.svg"),
    ("one","واحد","home","one.svg"),("two","اثنان","home","two.svg"),
    ("three","ثلاثة","home","three.svg"),("four","أربعة","home","four.svg"),
    ("five","خمسة","home","five.svg"),
    # outdoor
    ("bee","نحلة","outdoor","bee_bumble.svg"),
    ("school","مدرسة","outdoor","school.svg"),
    ("classroom","فصل دراسي","outdoor","class_room.svg"),
    ("shop","متجر","outdoor","shop.svg"),
    ("clouds","غيوم","outdoor","cloudy.svg"),
    ("hospital","مستشفى","outdoor","ambulance.svg"),
    ("wind","رياح","outdoor","kite.svg"),
    # routine: verbs
    ("run","يجري","routine","run_,_to.svg"),("jump","يقفز","routine","jump_,_to.svg"),
    ("sit","يجلس","routine","sit_,_to.svg"),("stand","يقف","routine","stand_,_to.svg"),
    ("sleep","ينام","routine","sleep_male_,_to.svg"),("swim","يسبح","routine","swim_,_to.svg"),
    ("speak","يتكلم","routine","talk_1_,_to.svg"),("listen","يستمع","routine","hear_,_to.svg"),
    ("look","ينظر","routine","look_,_to.svg"),("give","يعطي","routine","give_,_to.svg"),
    ("take","يأخذ","routine","take_,_to.svg"),("open","يفتح","routine","open.svg"),
    ("close","يغلق","routine","closed.svg"),("wash","يغسل","routine","wash_hands_,_to.svg"),
    # routine: body
    ("head","رأس","routine","head.svg"),("eye","عين","routine","eye.svg"),
    ("ear","أذن","routine","ear.svg"),("mouth","فم","routine","mouth.svg"),
    ("leg","ساق","routine","leg.svg"),("teeth","أسنان","routine","teeth.svg"),
    ("stomach","بطن","routine","stomach.svg"),
    # routine: clothes
    ("belt","حزام","routine","belt.svg"),("tie","ربطة عنق","routine","tie.svg"),
    ("hat","قبعة","routine","hat_-_mans.svg"),
]
ALT_NOTES = {"hospital": "بديل: سيارة إسعاف", "wind": "بديل: طائرة ورقية"}

def next_num(cat):
    nums = []
    for f in os.listdir(os.path.join(LIB, cat)):
        m = re.match(rf"{cat}_(\d+)_", f)
        if m: nums.append(int(m.group(1)))
    return max(nums) + 1 if nums else 1

counters = {c: next_num(c) for c in ("routine", "home", "outdoor", "emotions")}
manifest = json.load(open(os.path.join(LIB, "manifest.json")))
added = []
for eng, ar, cat, svg in NEW:
    src = os.path.join(EN_DIR, svg)
    assert os.path.exists(src), f"MISSING SVG {svg}"
    n = counters[cat]; counters[cat] += 1
    fname = f"{cat}_{n:03d}_{eng}.png"
    dest = os.path.join(LIB, cat, fname)
    cairosvg.svg2png(url=src, write_to=dest, output_width=500, output_height=500)
    im = Image.open(dest)
    assert im.size == (500, 500), f"BAD SIZE {fname}: {im.size}"
    entry = {"file": f"{cat}/{fname}", "arabic_label": ar, "category": cat,
             "english_keyword": eng, "source": svg}
    if eng in ALT_NOTES: entry["note"] = ALT_NOTES[eng]
    manifest.append(entry)
    added.append((cat, fname))

json.dump(manifest, open(os.path.join(LIB, "manifest.json"), "w"), ensure_ascii=False, indent=1)
print(f"added {len(added)} images; manifest now {len(manifest)}")
from collections import Counter
print(Counter(c for c, _ in added))

# update GAPS.md
gaps_path = os.path.join(LIB, "GAPS.md")
g = open(gaps_path).read()
new_gaps = ["قرد (monkey) — لا يوجد رمز", "أنف (nose) — لا يوجد رمز",
            "شعر (hair) — لا يوجد رمز مناسب", "يد (hand) — لا يوجد رمز مستقل",
            "مكتبة (library) — لا يوجد رمز", "سينما (cinema) — لا يوجد رمز",
            "ملعب (stadium) — لا يوجد رمز"]
g += "\n## فجوات التوسعة الثانية (2026-10-09)\n\n"
for x in new_gaps: g += f"- {x}\n"
open(gaps_path, "w").write(g)
print("GAPS.md updated")
