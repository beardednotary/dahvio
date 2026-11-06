/* USAF PFA scoring (DAFMAN 36-2905, 2026 PFA) for the web calculator.
 * Event points come from data/af-pfa-scoring-2026.json, exported from the
 * PFA Calculator iOS app's own scoring engine, so web and app agree.
 * Body composition, altitude and the composite/rating rules below mirror
 * lib/services/scoring_engine.dart in the app.
 */
(function (root) {
    var ALTITUDE_FACTOR = [1.0, 1.03, 1.06, 1.09, 1.12];

    function ageGroup(age) {
        if (age < 25) return '<25';
        if (age < 30) return '25-29';
        if (age < 35) return '30-34';
        if (age < 40) return '35-39';
        if (age < 45) return '40-44';
        if (age < 50) return '45-49';
        if (age < 55) return '50-54';
        if (age < 60) return '55-59';
        return '60+';
    }

    // Change points are [value, points] sorted by value; the score for v is
    // the last change point at or below v.
    function lookup(data, event, key, v) {
        var cps = data.events[event][key];
        if (v < cps[0][0]) return cps[0][1];
        var pts = 0;
        for (var i = 0; i < cps.length; i++) {
            if (cps[i][0] <= v) pts = cps[i][1]; else break;
        }
        return pts;
    }

    // Waist-to-height ratio, rounded to 2 decimals, 20 points max.
    function bodyComp(heightIn, waistIn) {
        if (!(heightIn > 0) || !(waistIn > 0)) return 0;
        var r = parseFloat((waistIn / heightIn).toFixed(2));
        if (r <= 0.49) return 20;
        if (r >= 0.60) return 0;
        var steps = [[0.50, 19], [0.51, 18], [0.52, 17], [0.53, 16], [0.54, 15], [0.55, 12.5], [0.56, 10], [0.57, 7.5], [0.58, 5], [0.59, 2.5]];
        for (var i = 0; i < steps.length; i++) if (r <= steps[i][0]) return steps[i][1];
        return 0;
    }

    /* input: {sex:'M'|'F', age, height, waist, strength:'pushups'|'hr_pushups', strengthReps,
     *         core:'situps'|'crunches'|'plank', coreReps, coreSecs,
     *         cardio:'run'|'shuttle', runSecs, laps, altitude:0-4} */
    function score(data, input) {
        var key = input.sex + '_' + ageGroup(input.age);
        var strength = lookup(data, input.strength, key, input.strengthReps);
        var core = input.core === 'plank'
            ? lookup(data, 'plank', key, input.coreSecs)
            : lookup(data, input.core, key, input.coreReps);
        var cardio;
        if (input.cardio === 'shuttle') {
            cardio = lookup(data, 'shuttle', key, input.laps);
        } else {
            var adjusted = Math.round(input.runSecs / ALTITUDE_FACTOR[input.altitude || 0]);
            cardio = input.runSecs > 0 ? lookup(data, 'run', key, adjusted) : 0;
        }
        var body = bodyComp(input.height, input.waist);
        var total = Math.min(100, Math.max(0, body + strength + core + cardio));
        var failed = [];
        if (body <= 0) failed.push('body composition');
        if (strength <= 0) failed.push('strength');
        if (core <= 0) failed.push('core');
        if (cardio <= 0) failed.push('cardio');
        var status = failed.length ? 'unsatisfactory'
            : total >= 90 ? 'excellent'
            : total >= 75 ? 'satisfactory'
            : 'unsatisfactory';
        return { bodyComp: body, strength: strength, core: core, cardio: cardio, total: total, status: status, failedComponents: failed };
    }

    var api = { score: score, bodyComp: bodyComp, ageGroup: ageGroup, lookup: lookup };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.AFPFA = api;
})(this);
