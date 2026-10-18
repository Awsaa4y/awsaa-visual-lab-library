# مكتبة صور المدرسة — School Image Library

## الهيكل

```
school/
  studio/           ← صور استوديو أوسع (484 صورة، WebP مضغوط)
    awsaa-full-story-assets/
    awsaa-training-book/
    awsaa-vertical-scenes/
    ... (مجلدات الاستوديو الأصلية)
  math/              ← صور الرياضيات (مكتبة DzExams)
  arabic/            ← صور اللغة العربية (قادم)

shared/
  daily-life/       ← صور الحياة اليومية: تُستخدم في المدرسة + الأداة + مشاريع مهارات الحياة
  communication/    ← صور التواصل ولوحات التواصل
```

## القواعد

1. الصورة التي تخدم أكثر من مشروع توضع في `shared/` لا في `school/`
2. الصورة الخاصة بمادة دراسية تبقى في `school/<المادة>/`
3. الصيغة المعتمدة: WebP (ضغط q82، عرض أقصى 1200px)
4. الروابط حصريًا عبر jsDelivr — ممنوع `raw.githubusercontent`:
   ```
   https://cdn.jsdelivr.net/gh/Awsaa4y/awsaa-visual-lab-library@main/school/studio/<المجلد>/<الصورة>.webp
   ```

## التحديث

آخر رفع: 2026-10-18 — 475 صورة من جلسة استوديو أوسع (من 344MB إلى 23MB بعد الضغط)
