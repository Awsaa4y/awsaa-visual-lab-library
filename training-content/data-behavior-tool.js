/* =====================================================================
   أداة أوسع لإدارة السلوك 2.0 — بيانات الأداة ومحرك التصنيف الشفاف.
   المصدر التصميمي: «تصميم أداة السلوك المحسنة 2026-11-01» (البنوك من الباب
   السادس-2 بأرقام البنود الأصلية، المقياس من سادسًا-3، قواعد التصنيف من
   سادسًا-4، مكتبة التوصيات من الباب الثامن حرفيًا بمضمونها).
   هذا الملف بيانات + دوال نقية فقط: يعمل في المتصفح (window.BEHAVIOR_TOOL)
   وفي Node للاختبارات (module.exports) بالمحتوى نفسه.
   ===================================================================== */
(function (root) {
"use strict";

/* ---------- مقياس الإجابة (سادسًا-3): سلّم مرسى زمنيًا + «لا أعرف» خارج الحساب ---------- */
var SCALE = [
  { v: 0, t: "أبدًا في آخر 4 أسابيع" },
  { v: 1, t: "نادرًا (مرة أو مرتين)" },
  { v: 2, t: "أحيانًا (أسبوعيًا تقريبًا)" },
  { v: 3, t: "غالبًا (عدة مرات أسبوعيًا)" },
  { v: 4, t: "شبه دائمًا (يوميًا أو كلما توفّرت الظروف)" }
];
var DK_LABEL = "لا أعرف / لم ألاحظ";
var DK = "dk"; // قيمة «لا أعرف»: تُستبعد من الدرجات وتُحسب في نسبة اكتمال البيانات

/* ---------- الوظائف الست (خمس وظائف تنافسية + ألم/جسدي مسار تحقق) ---------- */
var FUNCTIONS = [
  { key: "attention",       name: "جلب الانتباه",                    short: "الانتباه" },
  { key: "escape_demand",   name: "الهروب من الطلب/المهام",          short: "هرب الطلب" },
  { key: "escape_attention",name: "الهروب من الانتباه/التفاعل",       short: "الهرب الاجتماعي" },
  { key: "tangible",        name: "الحصول على ملموس/نشاط",           short: "الملموس" },
  { key: "sensory",         name: "حسي/انفرادي (تعزيز تلقائي)",      short: "الحسي" }
];
var PAIN_KEY = "pain";
var PAIN_NAME = "ألم/جسدي — مسار تحقق لا وظيفة";

/* ---------- بنوك البنود: 6 وظائف × 6 بنود. orig = رقم البند في الاستمارة الأصلية.
   star = بند نتيجة مؤكِّدة («يتوقف فورًا بعد…») — دليل أقوى من بنود الحدوث. ---------- */
var BANKS = {
  attention: [
    { id: "att1", orig: 9,  text: "يظهر السلوك كلما توقّف المحيطون عن إعطائه الانتباه أو انشغلوا عنه." },
    { id: "att2", orig: 4,  text: "يظهر السلوك عندما يتحدّث المربّي أو المقيّم مع أشخاص آخرين في الغرفة نفسها." },
    { id: "att3", orig: 55, star: true, text: "يتوقّف السلوك خلال فترة قصيرة عندما يُولى الحالة الانتباه (حديث، نظر، اقتراب)." },
    { id: "att4", orig: 22, text: "يُمنح الحالة انتباه فردي مباشر بشكل متكرّر لمنع حدوث السلوك، ويهدأ ما دام هذا الانتباه مستمرًا." },
    { id: "att5", orig: 13, text: "يتوقّف السلوك عندما يكون الحالة بمفرده، ويظهر أكثر بوجود آخرين حوله." },
    { id: "att6", orig: 27, text: "يظهر السلوك عندما يبدو الجميع مشغولين وغير قادرين على الانتباه إليه." }
  ],
  escape_demand: [
    { id: "esc1", orig: 2,  text: "يظهر السلوك بعد أن يُطلب من الحالة القيام بشيء (مهمة، نشاط، انتقال)." },
    { id: "esc2", orig: 20, star: true, text: "يتوقّف السلوك خلال فترة قصيرة (1–5 دقائق) بعد التوقّف عن تقديم الطلبات." },
    { id: "esc3", orig: 29, star: true, text: "يتوقّف السلوك إذا سُمح للحالة باستراحة من النشاط الجاري." },
    { id: "esc4", orig: 21, text: "يتجنّب المقدّمون تقديم الطلبات للحالة خوفًا من ظهور السلوك." },
    { id: "esc5", orig: 52, text: "يظهر السلوك عندما يُتوقّع من الحالة العمل بشكل مستقل دون مساعدة." },
    { id: "esc6", orig: 56, text: "يظهر السلوك عند الإشارة إلى الانتقال إلى نشاط جديد." }
  ],
  escape_attention: [
    { id: "soc1", orig: 17, text: "يعقب السلوك عادةً توقّفُ الآخرين عن التفاعل معه أو ابتعادهم عنه، فيهدأ بعدها." },
    { id: "soc2", orig: 26, text: "يحدث السلوك غالبًا عندما يحاول الآخرون التفاعل معه (حديث، لعب مشترك، اقتراب)." },
    { id: "soc3", orig: 25, text: "يحدث السلوك غالبًا خلال الأنشطة الجماعية." },
    { id: "soc4", orig: 8,  text: "يحدث السلوك عندما يكون كثير من الأشخاص حوله (ازدحام أو تفاعل مكثّف)." },
    { id: "soc5", orig: 3,  text: "يظهر السلوك عندما يكون الآخرون منتبهين إلى هذا الشخص أصلًا ومنشغلين به." },
    { id: "soc6", orig: 49, text: "يتصاعد السلوك حين يستمرّ التفاعل معه رغم إشارات رفضه (إبعاد الوجه أو الجسد، دفع اليد، الابتعاد)." }
  ],
  tangible: [
    { id: "tan1", orig: 5,  text: "يظهر السلوك للحصول على لعبة أو طعام أو نشاط مُنع منه أو أُجّل عنه." },
    { id: "tan2", orig: 15, star: true, text: "يتوقّف السلوك فورًا بعد إعطائه اللعبة أو الطعام أو النشاط الذي طلبه." },
    { id: "tan3", orig: 10, text: "يظهر السلوك عندما تؤخذ منه لعبة مفضّلة أو طعام أو يُوقَف نشاط جارٍ يحبّه." },
    { id: "tan4", orig: 18, text: "يظهر السلوك عندما يُقال له إنه لا يستطيع فعل ما أراد فعله الآن." },
    { id: "tan5", orig: 41, text: "يتكرّر السلوك إذا كان شيء مفضّل غير متوفّر أو خارج متناوله." },
    { id: "tan6", orig: 39, star: true, text: "يتوقّف السلوك عندما يُقدَّم له شيء مفضّل يطلبه." }
  ],
  sensory: [
    { id: "sen1", orig: 6,  text: "يتكرّر السلوك بنفس الطريقة لفترات طويلة إذا لم يكن أحد حوله (كالتأرجح أكثر من ساعة)." },
    { id: "sen2", orig: 11, text: "يبدو مستمتعًا بأداء السلوك نفسه، مستغرقًا في إحساسه (يلمس، يشمّ، يتذوّق، يبتسم أثناءه)." },
    { id: "sen3", orig: 16, text: "أثناء السلوك يبدو هادئًا وغير مدرك لما حوله." },
    { id: "sen4", orig: 23, text: "يحدث السلوك غالبًا في «أوقات الفراغ» حين يقلّ النشاط حوله." },
    { id: "sen5", orig: 24, text: "يستمرّ السلوك بنفس الوتيرة حين يكون وحده، ويبدو منسجمًا معه ومستمتعًا بوقته بمفرده." },
    { id: "sen6", orig: 57, text: "يبدو «مدفوعًا» من الداخل لإكمال السلوك وإتمامه حتى نهايته." }
  ]
};

/* ---------- بنك الألم/الجسدي المستقل (6 بنود من مواضيع التصميم).
   مخرجه راية إحالة لا درجة منافسة. local = علامة ألم موضعية. ---------- */
var PAIN_BANK = [
  { id: "pain1", text: "تغيّر نوم الحالة في الفترة الأخيرة (صعوبة بدء النوم، استيقاظ متكرّر، أو نوم أطول من المعتاد)." },
  { id: "pain2", local: true, text: "تظهر علامات ألم موضعي: يمسك أذنه أو بطنه أو رأسه، أو يشير إلى موضع محدّد في جسده." },
  { id: "pain3", text: "تزامن ظهور السلوك أو تفاقمه مع مرض حديث أو بدء دواء جديد أو تغيير جرعته." },
  { id: "pain4", text: "تغيّرت شهية الحالة، أو ظهرت علامات إمساك أو اضطراب هضمي في الفترة الأخيرة." },
  { id: "pain5", text: "يوقظ السلوكُ الحالةَ ليلًا، أو يظهر بقوة عند الاستيقاظ من النوم." },
  { id: "pain6", text: "يتفاقم السلوك بدورة منتظمة متكرّرة (يرتبط بمواعيد ثابتة: أسنان، حساسية، أو نوبات محتملة)." }
];

/* ---------- أزواج التناقض المنطقي (القاعدة 6) — موثّقة في سجل القرارات ----------
   الزوج الأول على محور الانفراد: «يستمرّ وحده بنفس الوتيرة» × «يتوقّف عندما يكون بمفرده».
   الزوج الثاني على محور حضور الانتباه: «يظهر والانتباه حاضر أصلًا» × «يظهر كلما توقّف الانتباه». */
var CONTRADICTION_PAIRS = [
  { a: "sen5", b: "att5", why: "بند «يستمرّ السلوك بنفس الوتيرة حين يكون وحده» وبند «يتوقّف السلوك عندما يكون بمفرده» حصلا معًا على درجة عالية — وهما متقابلان منطقيًا على محور الانفراد." },
  { a: "soc5", b: "att1", why: "بند «يظهر السلوك والانتباه حاضر أصلًا ومنشغل به» وبند «يظهر السلوك كلما توقّف الانتباه» حصلا معًا على درجة عالية — وهما متقابلان على محور حضور الانتباه." }
];

/* ---------- أحداث التهيئة والسياق (قسم الاستمارة 2) ---------- */
var SETTING_EVENTS = [
  "نوم سيّئ أو متقطّع في ليالي فترة الملاحظة",
  "جوع أو تخطّي وجبة قبل أوقات ظهور السلوك",
  "دواء جديد أو تغيير في جرعة دواء قائم",
  "مرض أو ألم حديث (أسنان، أذن، هضم، حساسية)",
  "تغيّر في الروتين اليومي أو في مكان النشاط",
  "تغيّر المربّي أو المختص المرافق للحالة",
  "حدث أسري مؤثّر (سفر، ضيوف، مناسبة، توتّر)",
  "ضجيج أو ازدحام في مكان القياس"
];

/* ---------- المجالات الحسية التسعة (للفحص الحسي الإلزامي) ---------- */
var SENSORY_DOMAINS = ["السمع", "البصر", "اللمس", "الشم والتذوق", "الحس العميق", "الدهليزي", "الحس الداخلي", "الانتباه", "الاجتماعي العاطفي"];
var SENSORY_PATTERNS = ["باحث (يطلب المزيد من المثير)", "متجنّب (ينسحب من المثير)", "حسّاس (يستجيب بشدّة لمثير خفيف)", "ضعيف الإدراك (لا ينتبه للمثير)"];

/* ---------- قوالب السرد التفسيري لكل وظيفة (قسم التقرير 6) ---------- */
var NARRATIVE = {
  attention:       { when: "انشغل المحيطون عنه أو توقّف انتباههم إليه", follows: "حصوله على انتباه مباشر (حديث أو نظر أو اقتراب) وعودة التفاعل معه" },
  escape_demand:   { when: "قُدّم إليه طلب أو مهمة أو إشارة انتقال", follows: "تأجيل الطلب أو تقليصه أو منحه استراحة" },
  escape_attention:{ when: "ازدحم المكان أو كثُر التفاعل حوله أو معه", follows: "توقّف التفاعل معه أو ابتعاد الآخرين عنه وهدوء الموقف" },
  tangible:        { when: "مُنع عنه شيء مفضّل أو أُجّل أو أُخذ منه", follows: "حصوله على الشيء المطلوب أو على بديل قريب منه" },
  sensory:         { when: "قلّ النشاط حوله أو تُرك لفترات دون انخراط منظّم", follows: "استمراره في الإحساس الذي يمنحه السلوك نفسه دون حاجة إلى نتيجة اجتماعية" }
};

/* ---------- مكتبة التوصيات (الباب الثامن من التصميم — تُعرض حرفيًا بمضمونها) ---------- */
var RECOMMENDATIONS = {
  attention: {
    title: "جلب الانتباه",
    proactive: [
      "انتباه مجدول غير مشروط بالسلوك: وصلات قصيرة متوقّعة (تحية خاصة، مهمة مشتركة، نظرة واسم) على مدار اليوم قبل أن يطلبه بالسلوك.",
      "تعليم المحيط إشارة «أنا مشغول الآن وسأعود بعد…» مع مؤقّت بصري يُحترم فعلًا."
    ],
    alternative: [
      "وسيلة نداء مقبولة (بطاقة/كلمة/إشارة «انظر إليّ/تعال») تُدرَّب في أوقات هادئة بلعب أدوار قصير.",
      "تُستجاب الوسيلة فورًا في بدايات التدريب بلا استثناء."
    ],
    reinforcement: [
      "الاستجابة للبديل أسرع وأغنى من الاستجابة للسلوك أبدًا.",
      "السلوك نفسه يُقابَل بأقلّ انتباه اجتماعي ممكن مع بقاء الأمان، دون تجاهل متصلّب عند الخطر."
    ],
    measure: "عدد استعمالات البديل أسبوعيًا صعودًا مقابل وقائع السلوك هبوطًا."
  },
  escape_demand: {
    title: "الهروب من الطلب/المهام",
    proactive: [
      "تفتيت الطلب، وبداية مضمونة النجاح، وإعلان بصري لكمية العمل ونهايته، وخيار بين مهمّتين، وفواصل مجدولة قبل الامتلاء.",
      "فحص صعوبة: هل الطلب فوق المستوى أصلًا؟ (الجسر إلى خطة التعلم الفردية)."
    ],
    alternative: [
      "«استراحة/ساعدني» ببطاقة أو كلمة أو إشارة، تُدرَّب داخل مهام سهلة أولًا ثم تُعمَّم.",
      "الاستراحة تُمنح فورًا وتُضبط مدّتها بمؤقّت بصري ثم عودة لطيفة."
    ],
    reinforcement: [
      "إتمام وحدات صغيرة يُقابَل بتعزيز فوري محدّد السلوك.",
      "منح الاستراحة بالبديل أسرع من منحها بالسلوك، والسلوك لا يلغي الطلب كاملًا بل يصغّره (يبقى جزء رمزي يُتمّ) حتى لا يصبح السلوك زرّ حذف."
    ],
    measure: "زمن البقاء في المهمة، وعدد طلبات الاستراحة بالبديل، ونسبة الوحدات المنجزة."
  },
  escape_attention: {
    title: "الهروب من الانتباه/التفاعل (الهروب الاجتماعي)",
    proactive: [
      "جرعة تفاعل مضبوطة: إشعار قبل الاقتراب، ومسافة محترمة، وزمن تفاعل معلن البداية والنهاية.",
      "ركن انسحاب مشروع متاح دائمًا بلا سلوك، وتخفيض الازدحام والضجيج حوله (يرتبط بالبروفيل الحسي إن وجد نمط تجنّب)."
    ],
    alternative: [
      "إشارة «قف/أحتاج وحدي» مقبولة اجتماعيًا تُدرَّب وتُحترم فورًا من كل المحيط — احترامها هو التدريب."
    ],
    reinforcement: [
      "كل بقاء هادئ داخل تفاعل مخطط يُقابَل بتقدير وانتهاء نظيف في وقته.",
      "الانسحاب بالبديل لا يُعاقَب ولا يُطارَد بأسئلة."
    ],
    measure: "مدّة التفاعل المُحتمَلة، وعدد مرات الانسحاب بالبديل مقابل السلوك."
  },
  tangible: {
    title: "الحصول على ملموس/نشاط",
    proactive: [
      "قواعد وصول مرئية معلنة (متى يتاح المفضّل وكيف يُطلب)، وجدولة المفضلات في اليوم بدل حرمان مفتوح.",
      "تحذير قبل نهاية النشاط المحبوب بوقتَين، وبدائل قريبة مشروعة عند المنع."
    ],
    alternative: [
      "طلب كامل بوسيلته (صورة/كلمة/جهاز) + تحمّل «انتظر» و«ليس الآن» بتدريب متدرّج بثوانٍ أولًا مع مؤقّت بصري ونهاية صادقة."
    ],
    reinforcement: [
      "الطلب السليم يُستجاب بسرعة ولو جزئيًا.",
      "الاعتذار الصادق يقترن ببديل وتوقيت بديل مسمّى، والسلوك لا يفتح باب الممنوع."
    ],
    measure: "نسبة الطلبات بالبديل، وزمن تحمّل الانتظار، ووقائع السلوك عند المنع."
  },
  sensory: {
    title: "حسي/انفرادي (تعزيز تلقائي)",
    before: [
      "قبل كل شيء: فحص طبي/حسي مزدوج — لا تُعتمد قبل استبعاد الألم ومراجعة البروفيل الحسي: أيّ مجال وأيّ نمط؟"
    ],
    proactive: [
      "إغناء اليوم بأنشطة نشطة مجدولة من بنك أوسع الحسي بحسب المجال الغالب (عمل ثقيل نشط دفعًا وحملًا وعصرًا للحس العميق؛ حركة منظمة إيقاعية للدهليزي؛ بدائل فموية/لمسية آمنة بحسب المجال) موزّعة قبل أوقات الذروة المعروفة من سجل الوقائع."
    ],
    alternative: [
      "بديل حسي آمن متاح دائمًا في مكانه يؤدّي الوظيفة نفسها (مكان/مادة/حركة مشروعة)، يُعرَّف به الحالة ويُدرَّب على الذهاب إليه ذاتيًا — الهدف تنظيم لا منع."
    ],
    reinforcement: [
      "تعزيز زمن التنظيم الذاتي والعودة للنشاط المشترك.",
      "لا يُنتزع البديل الحسي عقابًا."
    ],
    measure: "زمن الانخراط الحسي الذاتي الآمن، والعودة للأنشطة المشتركة، وانخفاض شدة/مدة النوبات إن وُجدت.",
    redline: "خط أحمر: إن كان السلوك مؤذيًا للجسد، فالأولوية لحماية بلا عزل (تعديل بيئة، بديل أقرب للإحساس نفسه، إشراف قريب) مع إحالة مختص وتقييم طبي — خارج التقرير الواحد وحده."
  },
  pain: {
    title: "ألم/جسدي (مسار تحقق لا وظيفة)",
    action: "الفعل الوحيد في التقرير: إحالة طبية موثّقة (طبيب أطفال/أسنان/أنف وأذن بحسب العلامة) + سجل ملاحظة أعراض مرافق (نوم، شهية، مواضع إمساك، توقيتات)، وتعليق اعتماد الخطة السلوكية حتى وضوح الصورة الطبية أو استبعادها.",
    during: [
      "أثناء الانتظار: تخفيف مطالب، ومراقبة الأنماط الزمنية، وعدم تفسير أيّ تصاعد بوصفه «سلوكيًا» افتراضيًا."
    ],
    measure: "عودة لمسار الوظائف بعد الإحالة، مع توثيق ما تغيّر طبيًا ليُقرأ التقييم التالي على ضوئه."
  }
};

/* ---------- القواعد السبع للتصنيف (تُطبع في تذييل التقرير — سادسًا-4) ---------- */
var RULES_TEXT = [
  "التطبيع أولًا: درجة كل وظيفة = (مجموع بنودها ÷ الدرجة القصوى الممكنة لبنودها المُجابة) × 100 — لا مقارنة بالمجاميع الخام.",
  "عتبة الفرضية: الوظيفة مرشّحة إذا بلغت نسبتها 50٪ فأكثر؛ دونها تُعرض إشارة ضعيفة لا فرضية.",
  "التمييز: الوظيفة الأولى «رئيسة» فقط إذا تقدّمت الثانية بـ15 نقطة مئوية فأكثر؛ غير ذلك يُعلن تعدّد وظائف وتُبنى فرضيتان مرتّبتان.",
  "مستوى الثقة يُحسب من اكتمال البيانات وحضور أدلة النتائج المؤكّدة (★) واتساق سجل الوقائع، ويُطبع سببه.",
  "راية الألم تسبق التصنيف: إشارة جسدية قوية (بندان فأكثر بدرجة 3 فأعلى، أو علامة ألم موضعية واحدة قصوى) توقف اعتماد الفرضية الوظيفية وتفتح مسار الإحالة الطبية أولًا.",
  "فحص التناقض: بنود متقابلة منطقيًا إن تعارضت إجاباتها بشدة تُرفع راية «إجابات متناقضة — يُستكمل بمقابلة» بدل تمرير نتيجة هادئة كاذبة.",
  "قاعدة البيانات غير الكافية: اكتمال أقلّ من 80٪ من البنوك يجعل التقرير «أوليًا غير قابل للاعتماد» مهما كانت النسب."
];
var TOOL_LIMIT = "حدود الأداة: نتيجة هذه الأداة فرضية إرشادية لا تشخيص؛ تُدعَّم بالملاحظة المباشرة والمقابلة، ولا تُبنى عليها قرارات علاجية وحدها.";

/* =====================================================================
   محرك التصنيف — دوال نقية.
   answers: خريطة معرّف البند → رقم 0..4 أو "dk".
   opts: { abcCount: عدد وقائع سجل ABC المعبّأة (0..3) }
   ===================================================================== */
function itemIndex() {
  var idx = {};
  Object.keys(BANKS).forEach(function (fk) {
    BANKS[fk].forEach(function (it) { idx[it.id] = { fn: fk, item: it }; });
  });
  PAIN_BANK.forEach(function (it) { idx[it.id] = { fn: PAIN_KEY, item: it }; });
  return idx;
}
var ITEM_INDEX = itemIndex();
var ALL_ITEM_IDS = Object.keys(ITEM_INDEX);

function isNum(v) { return typeof v === "number" && v >= 0 && v <= 4; }

function classify(answers, opts) {
  answers = answers || {};
  opts = opts || {};
  var abcCount = typeof opts.abcCount === "number" ? opts.abcCount : 0;

  // اكتمال البيانات: كل ردّ (رقمي أو «لا أعرف») يُحسب ردًّا؛ الدرجات رقمية فقط.
  var responded = 0, numericCount = 0;
  ALL_ITEM_IDS.forEach(function (id) {
    var v = answers[id];
    if (isNum(v)) { responded++; numericCount++; }
    else if (v === DK) { responded++; }
  });
  var completeness = Math.round((responded / ALL_ITEM_IDS.length) * 100);
  var dkCount = responded - numericCount;

  // نسب الوظائف الخمس (التطبيع — القاعدة 1)
  var percents = {}, sums = {}, answeredPerFn = {};
  FUNCTIONS.forEach(function (f) {
    var sum = 0, n = 0;
    BANKS[f.key].forEach(function (it) {
      var v = answers[it.id];
      if (isNum(v)) { sum += v; n++; }
    });
    sums[f.key] = sum; answeredPerFn[f.key] = n;
    percents[f.key] = n > 0 ? Math.round((sum / (n * 4)) * 100) : null;
  });

  // الترتيب والترشيح والتمييز (القاعدتان 2 و3)
  var ranked = FUNCTIONS.map(function (f) { return f.key; }).filter(function (k) { return percents[k] !== null; })
    .sort(function (a, b) { return percents[b] - percents[a]; });
  var candidates = ranked.filter(function (k) { return percents[k] >= 50; });
  var primary = candidates.length ? candidates[0] : null;
  var secondary = candidates.length > 1 ? candidates[1] : null;
  var multi = !!(primary && secondary && (percents[primary] - percents[secondary]) < 15);
  var gap = (primary && secondary) ? percents[primary] - percents[secondary] : null;

  // أدلة النتائج المؤكّدة (★) والبنود الأعلى لكل وظيفة
  var starEvidence = {}, topItems = {};
  FUNCTIONS.forEach(function (f) {
    var stars = [], tops = [];
    BANKS[f.key].forEach(function (it) {
      var v = answers[it.id];
      if (it.star && isNum(v) && v >= 2) stars.push({ id: it.id, text: it.text, value: v });
      if (isNum(v)) tops.push({ id: it.id, text: it.text, value: v, star: !!it.star });
    });
    tops.sort(function (a, b) { return b.value - a.value; });
    starEvidence[f.key] = stars;
    topItems[f.key] = tops.slice(0, 3);
  });
  var starPresent = primary ? starEvidence[primary].length > 0
    : FUNCTIONS.some(function (f) { return starEvidence[f.key].length > 0; });

  // راية الألم (القاعدة 5 — تسبق التصنيف)
  var painHigh = 0, painLocalMax = false, painAnswered = 0;
  PAIN_BANK.forEach(function (it) {
    var v = answers[it.id];
    if (isNum(v)) {
      painAnswered++;
      if (v >= 3) painHigh++;
      if (it.local && v >= 4) painLocalMax = true;
    }
  });
  var painFlag = painHigh >= 2 || painLocalMax;

  // فحص التناقض (القاعدة 6)
  var contradictions = [];
  CONTRADICTION_PAIRS.forEach(function (p) {
    var a = answers[p.a], b = answers[p.b];
    if (isNum(a) && isNum(b) && a >= 3 && b >= 3) contradictions.push({ pair: [p.a, p.b], a: a, b: b, why: p.why });
  });

  // مستوى الثقة (القاعدة 4) مع سبب مطبوع
  var confReasons = [];
  var level;
  if (completeness >= 90 && starPresent && abcCount >= 3) level = "مرتفع";
  else if (completeness >= 80 && (starPresent || abcCount >= 3)) level = "متوسط";
  else level = "منخفض";
  confReasons.push("اكتمال البيانات " + completeness + "٪" + (completeness >= 90 ? " (يبلغ حد الارتفاع 90٪)" : completeness >= 80 ? " (بين 80٪ و90٪)" : " (دون حد الاعتماد 80٪)"));
  confReasons.push(starPresent ? "أدلة نتائج مؤكّدة (★) حاضرة في البنود" : "لا أدلة نتائج مؤكّدة (★) بدرجة كافية في البنود");
  confReasons.push(abcCount >= 3 ? "سجل الوقائع ABC مكتمل بثلاث وقائع" : "سجل الوقائع ABC ناقص (" + abcCount + " من 3 وقائع معبّأة)");

  // الاعتماد (القاعدة 7)
  var reliable = completeness >= 80;

  return {
    percents: percents, sums: sums, answeredPerFn: answeredPerFn,
    completeness: completeness, responded: responded, numericCount: numericCount, dkCount: dkCount,
    ranked: ranked, candidates: candidates, primary: primary, secondary: secondary,
    multi: multi, gap: gap,
    starEvidence: starEvidence, topItems: topItems, starPresent: starPresent,
    pain: { flag: painFlag, highCount: painHigh, localMax: painLocalMax, answered: painAnswered },
    contradictions: contradictions,
    confidence: { level: level, reasons: confReasons },
    reliable: reliable,
    abcCount: abcCount
  };
}

/* ---------- السرد التفسيري (قسم التقرير 6): قالب محرَّر + «ما لا نعرفه بعد» ----------
   meta: { behavior: وصف السلوك, sensoryHypothesis: true/false/null,
           hasProfile: bool, commWorks: true/false/null,
           settingEvents: [أسماء أحداث حاضرة] } */
function buildNarrative(result, meta) {
  meta = meta || {};
  var behavior = (meta.behavior || "السلوك المستهدف").trim() || "السلوك المستهدف";
  var fnName = {};
  FUNCTIONS.forEach(function (f) { fnName[f.key] = f.name; });
  var out = { hypothesis: "", secondaryHypothesis: "", unknowns: [] };

  function sentence(fnKey) {
    var fr = NARRATIVE[fnKey];
    var stars = (result.starEvidence[fnKey] || []).filter(function (s) { return s.value >= 3; });
    var tops = (result.topItems[fnKey] || []).filter(function (t) { return t.value >= 3 && !t.star; });
    var ev = stars.length ? stars : tops;
    var evText = ev.length ? "، والدليل الأقوى: " + ev.map(function (e) { return "«" + e.text + "»"; }).join("؛ ") : "";
    return "عندما " + fr.when + "، يقوم بـ" + behavior + "، ويعقبه عادة " + fr.follows + evText + ".";
  }

  if (result.pain.flag) {
    out.hypothesis = "راية الألم/الجسد تسبق أيّ فرضية وظيفية: توجد إشارة جسدية قوية تستدعي مسار التحقق الطبي أولًا، ويُعلَّق اعتماد الفرضية الوظيفية حتى وضوح الصورة الطبية أو استبعادها.";
  } else if (result.primary) {
    out.hypothesis = "الفرضية الأرجح — " + fnName[result.primary] + " (" + result.percents[result.primary] + "٪): " + sentence(result.primary);
    if (result.multi && result.secondary) {
      out.secondaryHypothesis = "فرضية ثانية مرتّبة — " + fnName[result.secondary] + " (" + result.percents[result.secondary] + "٪): " + sentence(result.secondary) + " الفارق بين الفرضيتين أقلّ من 15 نقطة، لذا تُعاملان معًا بوصفهما تعدّد وظائف لا وظيفة واحدة.";
    } else if (result.secondary) {
      out.secondaryHypothesis = "وظيفة مرشّحة ثانوية — " + fnName[result.secondary] + " (" + result.percents[result.secondary] + "٪): فوق عتبة الترشيح لكنها دون الرئيسة بفارق واضح؛ تُراقب وتُغطّى في الخطة دون أن تُبنى عليها الفرضية.";
    }
  } else {
    out.hypothesis = "لا وظيفة بلغت عتبة الترشيح (50٪): البيانات الحالية لا تدعم اعتماد فرضية وظيفية، وتُقرأ النسب بوصفها إشارات ضعيفة تستدعي ملاحظة مباشرة أوسع قبل أيّ خطة.";
  }

  // «ما لا نعرفه بعد» — إلزامية، تُبنى من فجوات البيانات الفعلية
  if (result.dkCount > 0) out.unknowns.push("بقيت " + result.dkCount + " من البنود بلا ملاحظة كافية (أُجيب بـ«لا أعرف») — تُستكمل بمقابلة أو ملاحظة موجّهة قبل إعادة الحكم.");
  var near = result.ranked.filter(function (k) { return result.percents[k] !== null && result.percents[k] >= 40 && result.percents[k] < 50; });
  near.forEach(function (k) { out.unknowns.push("وظيفة «" + fnName[k] + "» قريبة من عتبة الترشيح (" + result.percents[k] + "٪) — قد تصعد إلى فرضية مع بيانات أدقّ أو في سياق آخر."); });
  if (result.abcCount < 3) out.unknowns.push("سجل الوقائع ABC غير مكتمل (" + result.abcCount + " من 3) — تتابع «سابق ← سلوك ← نتيجة» لم يُوثَّق بما يكفي لدعم الفرضية بالملاحظة.");
  if (meta.sensoryHypothesis === null || typeof meta.sensoryHypothesis === "undefined") out.unknowns.push("الفرضية الحسية لم تُحسم في الفحص الإلزامي — لا يُعرف بعد إن كان وراء السلوك مكوّن حسي وأيّ مجال من المجالات التسعة.");
  if (meta.sensoryHypothesis === true && !meta.hasProfile) out.unknowns.push("توجد فرضية حسية دون بروفيل حسي مرتبط — المجال والنمط الدقيقان غير معروفين بعد، ويلزم بروفيل قبل اعتماد أيّ تدخّل حسي.");
  if (meta.commWorks === false) out.unknowns.push("لا وسيلة طلب تعمل عند الحالة تحت الضغط — حدود تأثير أيّ خطة سلوكية قبل بناء البديل التواصلي غير معروفة.");
  if (meta.settingEvents && meta.settingEvents.length) out.unknowns.push("أحداث تهيئة حاضرة في فترة القياس (" + meta.settingEvents.join("، ") + ") — أثرها في وقائع الأيام التالية لم يُضبط بعد بسجل متابعة.");
  if (result.contradictions.length) out.unknowns.push("وُجدت إجابات متناقضة منطقيًا في البنود — لا يُعرف أيّ الطرفين أدقّ حتى تُستكمل بمقابلة وملاحظة.");
  if (!out.unknowns.length) out.unknowns.push("لا فجوة بيانات كبرى في هذا التقييم؛ يبقى أثر الخطة في الأسابيع الأربعة التالية غير معروف حتى قياس المتابعة.");
  return out;
}

var API = {
  SCALE: SCALE, DK: DK, DK_LABEL: DK_LABEL,
  FUNCTIONS: FUNCTIONS, PAIN_KEY: PAIN_KEY, PAIN_NAME: PAIN_NAME,
  BANKS: BANKS, PAIN_BANK: PAIN_BANK,
  CONTRADICTION_PAIRS: CONTRADICTION_PAIRS,
  SETTING_EVENTS: SETTING_EVENTS,
  SENSORY_DOMAINS: SENSORY_DOMAINS, SENSORY_PATTERNS: SENSORY_PATTERNS,
  NARRATIVE: NARRATIVE, RECOMMENDATIONS: RECOMMENDATIONS,
  RULES_TEXT: RULES_TEXT, TOOL_LIMIT: TOOL_LIMIT,
  ALL_ITEM_IDS: ALL_ITEM_IDS,
  classify: classify, buildNarrative: buildNarrative
};
root.BEHAVIOR_TOOL = API;
if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
