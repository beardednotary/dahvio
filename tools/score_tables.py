#!/usr/bin/env python3
"""Write the static score-chart tables into the calculator and chart pages.

Every table comes from the same data/*.json files the web calculators score
with, so a chart can never disagree with the calculator next to it. Each
table lives between marker comments in a page:

    <!-- score-table:usmc-pft-glance -->
    ...generated HTML...
    <!-- /score-table:usmc-pft-glance -->

Run from the repo root after changing any data file:

    python tools/score_tables.py          # rewrite every marked table
    python tools/score_tables.py --check  # exit 1 if any page is stale
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = [
    "marine-pft-calculator-2026.html",
    "marine-cft-calculator-2026.html",
    "marine-pft-cft-score-chart-2026.html",
    "army-aft-calculator-2026.html",
    "navy-prt-calculator-2026.html",
    "air-force-pt-calculator-2026.html",
    "military-waist-to-height-calculator.html",
]


def load(name):
    return json.loads((ROOT / "data" / name).read_text(encoding="utf-8"))


def mmss(secs):
    return f"{secs // 60}:{secs % 60:02d}"


def age_label(a):
    return a.replace("-", "&ndash;").replace("<", "Under ")


def table(caption, head, rows, indent):
    pad = " " * indent
    out = [f'{pad}<div class="table-scroll">',
           f'{pad}    <table class="data-table score-table">',
           f'{pad}        <caption>{caption}</caption>',
           f'{pad}        <thead><tr>' + "".join(f"<th>{h}</th>" for h in head) + "</tr></thead>",
           f'{pad}        <tbody>']
    for r in rows:
        out.append(f'{pad}            <tr>' + "".join(f"<td>{c}</td>" for c in r) + "</tr>")
    out += [f'{pad}        </tbody>', f'{pad}    </table>', f'{pad}</div>']
    return "\n".join(out)


def glance(caption, ages, cell, indent, head=None):
    """cell(sex, age) -> (best, minimum) strings."""
    head = head or ["Age", "Male max", "Male minimum", "Female max", "Female minimum"]
    rows = []
    for a in ages:
        m, f = cell("M", a), cell("F", a)
        rows.append([age_label(a), m[0], m[1], f[0], f[1]])
    return table(caption, head, rows, indent)


# ── Marine Corps (MCO 6100.13A) ────────────────────────────────────────
USMC_PFT = load("usmc-pft-scoring-2026.json")
USMC_CFT = load("usmc-cft-scoring-2026.json")
USMC_AGES = USMC_PFT["ageGroups"]


def ends(rows, time=False):
    """rows are [value, points] best first -> (best, minimum) display."""
    rows = sorted(rows, key=lambda r: r[0], reverse=not time)
    f = mmss if time else str
    return f(rows[0][0]), f(rows[-1][0])


def usmc_pft_glance(indent):
    d = USMC_PFT
    plank = ends(d["plank"])
    parts = [
        glance("Pull-ups &mdash; reps for 100 points and the event minimum", USMC_AGES,
               lambda s, a: ends(d["pullups"][s][a]), indent),
        glance("Push-ups &mdash; reps for the 70-point max and the event minimum", USMC_AGES,
               lambda s, a: ends(d["pushups"][s][a]), indent),
        glance("3-mile run &mdash; slowest time for 100 points and the slowest passing time", USMC_AGES,
               lambda s, a: ends(d["run"][s][a], time=True), indent),
        table("Plank &mdash; the same for every age and sex",
              ["Plank", "100 points", "Minimum (40 points)"],
              [["Every Marine", mmss(int(plank[0])), mmss(int(plank[1]))]], indent),
    ]
    return "\n".join(parts)


def usmc_cft_glance(indent):
    d = USMC_CFT
    return "\n".join([
        glance("Movement to Contact &mdash; slowest time for 100 points and the slowest passing time", USMC_AGES,
               lambda s, a: ends(d["mtc"][s][a], time=True), indent),
        glance("Ammunition Lift &mdash; reps for 100 points and the event minimum", USMC_AGES,
               lambda s, a: ends(d["ammoLift"][s][a]), indent),
        glance("Maneuver Under Fire &mdash; slowest time for 100 points and the slowest passing time", USMC_AGES,
               lambda s, a: ends(d["manuf"][s][a], time=True), indent),
    ])


def need_for(rows, p, lower_is_better):
    """The least performance that earns exactly p points (fewest reps or
    slowest time), or None when no row of the table lands on p."""
    hits = [v for v, pts in rows if pts == p]
    if not hits:
        return None
    return max(hits) if lower_is_better else min(hits)


def full_tables(tabs, indent):
    """tabs: [(label, [(heading, rows, lower_is_better, show_as_time)])], one table each."""
    pad = " " * indent
    out = []
    for label, cols in tabs:
        rows = []
        for p in range(100, 39, -1):
            cells = []
            for _, col, lower, as_time in cols:
                v = need_for(col, p, lower)
                cells.append("&ndash;" if v is None else (mmss(v) if as_time else str(v)))
            rows.append([str(p)] + cells)
        out.append(f'{pad}<details class="chart-full">')
        out.append(f'{pad}    <summary>{label}</summary>')
        out.append(table(f"{label} &mdash; what each point value takes",
                         ["Points"] + [c[0] for c in cols], rows, indent + 4))
        out.append(f'{pad}</details>')
    return "\n".join(out)


def usmc_pft_full(indent):
    d = USMC_PFT
    tabs = []
    for s, sex in (("M", "Male"), ("F", "Female")):
        for a in USMC_AGES:
            tabs.append((f"{sex} {age_label(a)}", [
                ("Pull-ups", d["pullups"][s][a], False, False),
                ("Push-ups", d["pushups"][s][a], False, False),
                ("Plank", d["plank"], False, True),
                ("3-mile run", d["run"][s][a], True, True),
            ]))
    return full_tables(tabs, indent)


def usmc_cft_full(indent):
    d = USMC_CFT
    tabs = []
    for s, sex in (("M", "Male"), ("F", "Female")):
        for a in USMC_AGES:
            tabs.append((f"{sex} {age_label(a)}", [
                ("Movement to Contact", d["mtc"][s][a], True, True),
                ("Ammunition Lift", d["ammoLift"][s][a], False, False),
                ("Maneuver Under Fire", d["manuf"][s][a], True, True),
            ]))
    return full_tables(tabs, indent)


# ── Army (AFT scoring scales, June 2025) ───────────────────────────────
AFT = load("aft-scoring-2025.json")


def aft_ends(ev, key):
    e = AFT["events"][ev]
    col = e["cols"][key]  # [points, value], best first
    best = col[0][1]
    at60 = [v for p, v in col if p >= 60]
    minimum = max(at60) if e["lowerIsBetter"] else min(at60)
    f = mmss if e["unit"] == "time" else str
    return f(best), f(minimum)


def army_glance(indent):
    names = [("MDL", "3-rep max deadlift (lb)"), ("HRP", "Hand-release push-ups (reps)"),
             ("SDC", "Sprint-drag-carry (time)"), ("PLK", "Plank (time)"), ("2MR", "2-mile run (time)")]
    head = ["Age", "Male / combat 100", "Male / combat 60", "Female 100", "Female 60"]
    return "\n".join(glance(f"{n} &mdash; 100 points and the 60-point minimum", AFT["ages"],
                            lambda s, a, ev=ev: aft_ends(ev, f"{s}_{a}"), indent, head)
                     for ev, n in names)


# ── Navy (OPNAVINST 6110.1L Table 4-1) ─────────────────────────────────
NAVY = load("navy-prt-scoring-2026.json")


def navy_ends(ev, key, time):
    t = NAVY["events"][ev][key]  # one threshold per level, 100 first
    f = mmss if time or ev == "plank" else str
    return f(t[0]), f(t[-1])


def navy_glance(indent):
    low = NAVY["levels"][-1]
    head = ["Age", "Male 100", f"Male minimum ({low})", "Female 100", f"Female minimum ({low})"]
    return "\n".join(glance(f"{n} &mdash; 100 points and the lowest passing score ({low} points)", NAVY["ageGroups"],
                            lambda s, a, ev=ev, time=time: navy_ends(ev, f"{s}_{a}", time), indent, head)
                     for ev, n, time in [("pushups", "Push-ups (reps)", False), ("plank", "Forearm plank (time)", False),
                                         ("run", "1.5-mile run, below 5,000 ft (time)", True)])


# ── Air Force (DAFMAN 36-2905, 2026 PFA) ───────────────────────────────
AF = load("af-pfa-scoring-2026.json")


def af_ends(ev, key, time):
    cps = AF["events"][ev][key]  # [value, points] sorted by value; score = last point at or below
    top = max(p for _, p in cps)
    if time:
        # Points hold from one change point until the next; [v, 0] ends the scale.
        nxt = {cps[i][0]: cps[i + 1][0] for i in range(len(cps) - 1)}
        best = nxt[[v for v, p in cps if p == top][0]] - 1
        worst = [v for v, p in cps if p == 0][0] - 1
        return mmss(best), mmss(worst)
    scoring = [v for v, p in cps if p > 0]
    f = mmss if ev == "plank" else str
    return f([v for v, p in cps if p == top][0]), f(min(scoring))


def af_glance(indent):
    head = ["Age", "Male max", "Male minimum", "Female max", "Female minimum"]
    return "\n".join(glance(f"{n}", AF["ageGroups"],
                            lambda s, a, ev=ev, time=time: af_ends(ev, f"{s}_{a}", time), indent, head)
                     for ev, n, time in [
                         ("pushups", "Push-ups &mdash; reps for 15 points and the fewest that score", False),
                         ("situps", "Sit-ups &mdash; reps for 15 points and the fewest that score", False),
                         ("plank", "Forearm plank &mdash; hold for 15 points and the shortest hold that scores", False),
                         ("run", "2-mile run &mdash; slowest time for 50 points and the slowest that scores", True)])


# ── Waist-to-height ratio: maximum waist by height ─────────────────────
# Same rules as js/whtr-standards.js (which is tested against the MARADMIN
# 066/26 and Guide-4 Table-1 max-waist tables). Heights here are whole
# inches, so the half-inch rounding rules leave them unchanged.
def js_round2(x):
    """Number.prototype.toFixed(2): the exact double, ties rounded up."""
    from decimal import Decimal, ROUND_HALF_UP
    return float(Decimal(x).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def af_points(h, w):
    r = js_round2(w / h)
    if r <= 0.49:
        return 20
    if r >= 0.60:
        return 0
    for limit, pts in [(0.50, 19), (0.51, 18), (0.52, 17), (0.53, 16), (0.54, 15),
                       (0.55, 12.5), (0.56, 10), (0.57, 7.5), (0.58, 5), (0.59, 2.5)]:
        if r <= limit:
            return pts
    return 0


def whtr_max_waist(indent):
    rows = []
    for h in range(58, 81):
        h2, h10 = 2 * h, 10 * h
        usmc = (h2 * 52 // 100) / 2                    # waist <= 0.52 x height, half inches
        navy = (-(-55 * h2 // 100) - 1) / 2            # waist / height < 0.55, half inches
        army = (-(-55 * h10 // 100) - 1) / 10          # waist / height < 0.55, tenths
        af = max(w10 for w10 in range(1, h10) if af_points(h, w10 / 10) == 20) / 10
        rows.append([f'{h}"', f'{usmc:.1f}"', f'{navy:.1f}"', f'{army:.1f}"', f'{af:.1f}"'])
    return table("Largest waist that meets each standard, by height",
                 ["Height", "Marine Corps (0.52)", "Navy Step 1 (under 0.55)", "Army (under 0.55)",
                  "Air Force full 20 pts (0.49)"], rows, indent)


GEN = {
    "whtr-max-waist": whtr_max_waist,
    "usmc-pft-glance": usmc_pft_glance,
    "usmc-cft-glance": usmc_cft_glance,
    "usmc-pft-full": usmc_pft_full,
    "usmc-cft-full": usmc_cft_full,
    "army-glance": army_glance,
    "navy-glance": navy_glance,
    "af-glance": af_glance,
}

MARK = re.compile(r"([ \t]*)<!-- score-table:([\w-]+) -->\n.*?<!-- /score-table:\2 -->", re.S)


def render(page_text):
    def sub(m):
        indent, name = m.group(1), m.group(2)
        body = GEN[name](len(indent))
        return f"{indent}<!-- score-table:{name} -->\n{body}\n{indent}<!-- /score-table:{name} -->"
    return MARK.sub(sub, page_text)


def main():
    check = "--check" in sys.argv
    stale = 0
    for p in PAGES:
        path = ROOT / p
        if not path.exists():
            continue
        raw = path.read_text(encoding="utf-8")
        crlf = "\r\n" in raw
        text = raw.replace("\r\n", "\n")
        new = render(text)
        if new != text:
            stale += 1
            if check:
                print("stale:", p)
            else:
                path.write_bytes((new.replace("\n", "\r\n") if crlf else new).encode("utf-8"))
                print("updated:", p)
    if check and stale:
        sys.exit(1)


if __name__ == "__main__":
    main()
