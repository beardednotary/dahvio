/* USMC CFT scoring (MCO 6100.13A w/ Admin CH-5) for the web calculator.
 * Tables in data/usmc-cft-scoring-2026.json (Tables 3-3 MTC, 3-4 Ammunition
 * Lift, 3-5 Maneuver Under Fire) come from the Marine PFT Calculator app's
 * generated tables, which are checked against the order. A result earns the
 * points of the best row it meets; a time between two rows scores as the
 * slower one; below an event's minimum scores 0 and fails the CFT.
 * Classes (Table 3-2) match the PFT: 1st 235+, 2nd 200-234, 3rd 150-199.
 * The combat arms rule in MARADMIN 613/25 covers the PFT only, so the CFT is
 * always scored on the Marine's own sex and age tables.
 * Mirrors scoreCft() in pft_scorer.dart.
 */
(function (root) {
    var AGES = ['17-20', '21-25', '26-30', '31-35', '36-40', '41-45', '46-50', '51+'];

    function ageGroup(age) {
        var tops = [20, 25, 30, 35, 40, 45, 50];
        for (var i = 0; i < tops.length; i++) if (age <= tops[i]) return AGES[i];
        return '51+';
    }

    // rows: [result, points], best first
    function higherIsBetter(rows, v) {
        for (var i = 0; i < rows.length; i++) if (v >= rows[i][0]) return rows[i][1];
        return 0;
    }
    function lowerIsBetter(rows, v) {
        for (var i = 0; i < rows.length; i++) if (v <= rows[i][0]) return rows[i][1];
        return 0;
    }

    /* input: {sex:'M'|'F', age, mtcSecs, alReps, manufSecs} */
    function score(data, input) {
        var g = ageGroup(input.age), s = input.sex;
        var mtcRows = data.mtc[s][g], alRows = data.ammoLift[s][g], manufRows = data.manuf[s][g];
        var mtc = input.mtcSecs > 0 ? lowerIsBetter(mtcRows, input.mtcSecs) : 0;
        var al = input.alReps > 0 ? higherIsBetter(alRows, input.alReps) : 0;
        var manuf = input.manufSecs > 0 ? lowerIsBetter(manufRows, input.manufSecs) : 0;
        var failed = [];
        if (!mtc) failed.push('Movement to Contact');
        if (!al) failed.push('Ammunition Lift');
        if (!manuf) failed.push('Maneuver Under Fire');
        var total = mtc + al + manuf;
        var cls = failed.length || total < data.classes.third ? 'Failure'
            : total >= data.classes.first ? '1st Class'
            : total >= data.classes.second ? '2nd Class' : '3rd Class';
        return {
            mtc: mtc, ammoLift: al, manuf: manuf, total: total, cls: cls, failedEvents: failed, ageGroup: g,
            mtcMinSecs: mtcRows[mtcRows.length - 1][0], alMinReps: alRows[alRows.length - 1][0],
            manufMinSecs: manufRows[manufRows.length - 1][0]
        };
    }

    var api = { score: score, ageGroup: ageGroup };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.USMCCFT = api;
})(this);
