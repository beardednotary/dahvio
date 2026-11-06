/* USMC PFT scoring (MCO 6100.13A w/ Admin CH-5) for the web calculator.
 * Tables in data/usmc-pft-scoring-2026.json were extracted from the order
 * (Tables 2-1, 2-2, 2-4, 2-5) and are the same data the Marine PFT
 * Calculator app is generated from. A result earns the points of the best
 * row it meets; below an event's minimum scores 0 and fails the PFT.
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
        var sorted = rows.slice().sort(function (a, b) { return b[0] - a[0]; });
        for (var i = 0; i < sorted.length; i++) if (v >= sorted[i][0]) return sorted[i][1];
        return 0;
    }
    function lowerIsBetter(rows, v) {
        var sorted = rows.slice().sort(function (a, b) { return a[0] - b[0]; });
        for (var i = 0; i < sorted.length; i++) if (v <= sorted[i][0]) return sorted[i][1];
        return 0;
    }

    /* input: {sex:'M'|'F', age, strength:'pullups'|'pushups', reps, plankSecs, runSecs} */
    function score(data, input) {
        var g = ageGroup(input.age);
        var strengthTable = data[input.strength][input.sex][g];
        var strength = higherIsBetter(strengthTable, input.reps);
        var plank = higherIsBetter(data.plank, input.plankSecs);
        var runRows = data.run[input.sex][g];
        var run = lowerIsBetter(runRows, input.runSecs);
        var failed = [];
        if (!strength) failed.push(input.strength === 'pullups' ? 'pull-ups' : 'push-ups');
        if (!plank) failed.push('plank');
        if (!run) failed.push('3-mile run');
        var total = strength + plank + run;
        var cls = failed.length || total < data.classes.third ? 'Failure'
            : total >= data.classes.first ? '1st Class'
            : total >= data.classes.second ? '2nd Class' : '3rd Class';
        return {
            strength: strength, plank: plank, run: run, total: total, cls: cls, failedEvents: failed,
            strengthMax: input.strength === 'pullups' ? 100 : 70, ageGroup: g,
            strengthMinReps: Math.min.apply(null, strengthTable.map(function (r) { return r[0]; })),
            runMinSecs: Math.max.apply(null, runRows.map(function (r) { return r[0]; }))
        };
    }

    var api = { score: score, ageGroup: ageGroup };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.USMCPFT = api;
})(this);
