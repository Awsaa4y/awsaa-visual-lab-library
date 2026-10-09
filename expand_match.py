#!/usr/bin/env python3
"""Phase 1: match new concepts to Mulberry EN filenames. Prints match table for review."""
import json, os, difflib, unicodedata

EN_DIR = "/tmp/mulberry-symbols/EN"
LIB = "/home/hatch/workspace/visual-lab-library"

# (english, arabic, category)
CONCEPTS = [
    # foods -> home
    ("apple","تفاحة","home"),("banana","موزة","home"),("orange","برتقالة","home"),
    ("rice","أرز","home"),("chicken","دجاج","home"),("meat","لحم","home"),
    ("fish","سمك","home"),("cheese","جبن","home"),("cake","كعكة","home"),
    ("chocolate","شوكولاتة","home"),("soup","حساء","home"),("pasta","معكرونة","home"),
    ("potato","بطاطس","home"),("salad","سلطة","home"),("sandwich","شطيرة","home"),
    ("honey","عسل","home"),("dates","تمر","home"),("yoghurt","زبادي","home"),
    ("butter","زبدة","home"),("jam","مربى","home"),
    # animals -> outdoor
    ("cat","قطة","outdoor"),("dog","كلب","outdoor"),("bird","عصفور","outdoor"),
    ("fish","سمكة","outdoor"),("horse","حصان","outdoor"),("cow","بقرة","outdoor"),
    ("sheep","خروف","outdoor"),("duck","بطة","outdoor"),("rabbit","أرنب","outdoor"),
    ("lion","أسد","outdoor"),("elephant","فيل","outdoor"),("monkey","قرد","outdoor"),
    ("bee","نحلة","outdoor"),("butterfly","فراشة","outdoor"),("turtle","سلحفاة","outdoor"),
    # verbs -> routine
    ("run","يجري","routine"),("jump","يقفز","routine"),("sit","يجلس","routine"),
    ("stand","يقف","routine"),("eat","يأكل","routine"),("drink","يشرب","routine"),
    ("sleep","ينام","routine"),("play","يلعب","routine"),("read","يقرأ","routine"),
    ("write","يكتب","routine"),("swim","يسبح","routine"),("speak","يتكلم","routine"),
    ("listen","يستمع","routine"),("look","ينظر","routine"),("give","يعطي","routine"),
    ("take","يأخذ","routine"),("open","يفتح","routine"),("close","يغلق","routine"),
    ("wash","يغسل","routine"),("cook","يطبخ","routine"),
    # body -> routine
    ("head","رأس","routine"),("eye","عين","routine"),("ear","أذن","routine"),
    ("nose","أنف","routine"),("mouth","فم","routine"),("hand","يد","routine"),
    ("leg","ساق","routine"),("hair","شعر","routine"),("teeth","أسنان","routine"),
    ("stomach","بطن","routine"),
    # clothes -> routine
    ("dress","فستان","routine"),("hat","قبعة","routine"),("coat","معطف","routine"),
    ("jacket","سترة","routine"),("skirt","تنورة","routine"),("gloves","قفازات","routine"),
    ("scarf","وشاح","routine"),("belt","حزام","routine"),("slippers","شبشب","routine"),
    ("tie","ربطة عنق","routine"),
    # places -> outdoor
    ("school","مدرسة","outdoor"),("classroom","فصل دراسي","outdoor"),
    ("hospital","مستشفى","outdoor"),("restaurant","مطعم","outdoor"),
    ("beach","شاطئ","outdoor"),("street","شارع","outdoor"),("shop","متجر","outdoor"),
    ("library","مكتبة","outdoor"),("cinema","سينما","outdoor"),("stadium","ملعب","outdoor"),
    # colors & numbers -> home
    ("red","أحمر","home"),("blue","أزرق","home"),("green","أخضر","home"),
    ("yellow","أصفر","home"),("black","أسود","home"),("white","أبيض","home"),
    ("one","واحد","home"),("two","اثنان","home"),("three","ثلاثة","home"),
    ("four","أربعة","home"),("five","خمسة","home"),
    # weather -> outdoor
    ("sun","شمس","outdoor"),("rain","مطر","outdoor"),("clouds","غيوم","outdoor"),
    ("snow","ثلج","outdoor"),("wind","رياح","outdoor"),
]

manifest = json.load(open(os.path.join(LIB, "manifest.json")))
existing_kw = {e["english_keyword"] for e in manifest}

fnames = [f for f in os.listdir(EN_DIR) if f.endswith(".svg")]
stems = {f[:-4]: f for f in fnames}

def match(concept):
    norm = concept.lower().replace(" ", "_")
    if norm + ".svg" in fnames:
        return norm + ".svg", 1.0
    cands = difflib.get_close_matches(norm, list(stems.keys()), n=3, cutoff=0.75)
    if cands:
        return stems[cands[0]], round(difflib.SequenceMatcher(None, norm, cands[0]).ratio(), 2)
    return None, 0.0

print(f"{'concept':<12} {'cat':<8} {'status':<10} match (score)")
print("-" * 70)
auto, review, skipped = [], [], []
for eng, ar, cat in CONCEPTS:
    if eng in existing_kw:
        print(f"{eng:<12} {cat:<8} {'SKIP-dup':<10}")
        skipped.append(eng)
        continue
    f, score = match(eng)
    if f is None:
        print(f"{eng:<12} {cat:<8} {'NO-MATCH':<10}")
        review.append((eng, ar, cat, None, 0))
    elif score >= 0.9:
        print(f"{eng:<12} {cat:<8} {'auto':<10} {f} ({score})")
        auto.append((eng, ar, cat, f, score))
    else:
        print(f"{eng:<12} {cat:<8} {'REVIEW':<10} {f} ({score})")
        review.append((eng, ar, cat, f, score))

print(f"\nauto={len(auto)} review={len(review)} skipped_dup={len(skipped)}")
json.dump({"auto": auto, "review": review, "skipped": skipped},
          open("/tmp/expand_matches.json", "w"), ensure_ascii=False, indent=1)
