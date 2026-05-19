from pathlib import Path

for p in Path(r"C:\arrow-platform\admin\src").rglob("*.tsx"):
    text = p.read_text(encoding="utf-8")
    fixed = text.replace("motion.div", "motion.div").replace("motion.div", "div")
    if fixed != text:
        p.write_text(fixed, encoding="utf-8")
        print("fixed", p)
