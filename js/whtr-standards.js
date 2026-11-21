/* Waist-to-height ratio standards by branch, for the WHtR calculator.
 * Each rule mirrors the DahVio app for that branch, which cites its source:
 *
 *  Marine Corps  MARADMIN 066/26 para 3.d and 6, as changed by 073/26:
 *                height and waist rounded down to 1/2 inch; within standard
 *                when waist <= 0.52 x height (pft_app body_composition.dart).
 *                Over: body fat evaluation (tape test or BIA).
 *  Navy          PRP Guide-4 (Jun 2026): height rounded UP and waist DOWN to
 *                1/2 inch; ratio rounded down to 4 decimals; 0.5499 or lower
 *                is within standards. Over: Step 2 body fat, 26% / 36%
 *                (prt_app bca.dart). Reproduces Guide-4 Table-1.
 *  Army          AD 2026-13 para 5a: "a WHtR of less than and not equal to
 *                0.55". Measured as entered; no tape test can challenge it
 *                (aft_app whtr_screen.dart).
 *  Air Force     DAFMAN 36-2905: scored 0-20 on the PFA, ratio rounded to
 *                2 decimals; uses AFPFA.bodyComp from af-pfa-scoring.js so it
 *                matches the Air Force calculator exactly.
 *  DoD ceiling   DoWI 1308.03 (effective 31 Aug 2026) para 3.2.g: every
 *                Service's limit is under 0.55; 0.55+ means a body fat check.
 *
 * All Marine and Navy math is in whole half inches, so floating point can
 * never flip a result at a limit.
 */
(function (root) {
    function halvesDown(v) { return Math.floor(Math.round(v * 100) / 50); } // inches -> half inches, rounded down
    function halvesUp(v) { return Math.ceil(Math.round(v * 100) / 50); }

    function usmc(h, w) {
        var h2 = halvesDown(h), w2 = halvesDown(w);
        var maxW2 = Math.floor(h2 * 52 / 100);
        return {
            ok: w2 <= maxW2, height: h2 / 2, waist: w2 / 2, maxWaist: maxW2 / 2,
            ratio: Math.floor(w2 / h2 * 100000) / 100000
        };
    }

    function navy(h, w) {
        var h2 = halvesUp(h), w2 = halvesDown(w);
        var r4 = Math.floor(w2 * 10000 / h2); // ratio x 10,000, rounded down
        // floor(ratio x 10,000) <= 5499 is the same as waist / height < 0.55.
        var maxW2 = Math.ceil(55 * h2 / 100) - 1;
        return { ok: r4 <= 5499, height: h2 / 2, waist: w2 / 2, maxWaist: maxW2 / 2, ratio: r4 / 10000 };
    }

    function army(h, w) {
        // In tenths of an inch, as entered: meets when waist / height < 0.55.
        var h10 = Math.round(h * 10), w10 = Math.round(w * 10);
        var maxW10 = Math.ceil(55 * h10 / 100) - 1;
        return { ok: w10 * 100 < 55 * h10, ratio: Math.floor(w10 / h10 * 100) / 100, maxWaist: maxW10 / 10 };
    }

    function afpfa() { return root.AFPFA || (typeof AFPFA !== 'undefined' ? AFPFA : null); }

    function airForce(h, w) {
        var AF = afpfa();
        var pts = AF ? AF.bodyComp(h, w) : null;
        // Largest waist (to 0.1 in) that still earns all 20 points.
        var full = null;
        if (AF) {
            var h10 = Math.round(h * 10);
            for (var w10 = Math.floor(h10 * 0.5); w10 > 0; w10--) {
                if (AF.bodyComp(h, w10 / 10) === 20) { full = w10 / 10; break; }
            }
        }
        return { points: pts, ok: pts !== null && pts > 0, ratio: Math.round(w / h * 100) / 100, fullPointsWaist: full };
    }

    function dod(h, w) {
        var h2 = halvesDown(h), w2 = halvesDown(w);
        return { ok: w2 * 100 < 55 * h2, ratio: Math.floor(w2 / h2 * 10000) / 10000 };
    }

    function check(h, w) {
        return { usmc: usmc(h, w), navy: navy(h, w), army: army(h, w), af: airForce(h, w), dod: dod(h, w), raw: w / h };
    }

    var api = { check: check, usmc: usmc, navy: navy, army: army, airForce: airForce, dod: dod };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.WHTR = api;
})(this);
