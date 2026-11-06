/* Navy PRT scoring (OPNAVINST 6110.1L Tables 4-1/4-2) for the web calculator.
 * Thresholds come from data/navy-prt-scoring-2026.json, exported from the
 * Navy PRT Calculator iOS app's scorer; event scoring, the average and the
 * category bands mirror lib/services/prt_scorer.dart and models/prt_result.dart.
 */
(function (root) {
    var LOWER_IS_BETTER = { pushups: false, plank: false, run: true, run_alt: true, row: true, swim500: true, swim450: true };

    function ageGroup(age) {
        var bounds = [[19, '17-19'], [24, '20-24'], [29, '25-29'], [34, '30-34'], [39, '35-39'], [44, '40-44'], [49, '45-49'], [54, '50-54'], [59, '55-59'], [64, '60-64']];
        for (var i = 0; i < bounds.length; i++) if (age <= bounds[i][0]) return bounds[i][1];
        return '65+';
    }

    // thresholds[i] is the minimum (or, for timed cardio, maximum) result for levels[i].
    function eventPoints(data, event, key, value) {
        var t = data.events[event][key], lower = LOWER_IS_BETTER[event];
        for (var i = 0; i < data.levels.length; i++) {
            if (lower ? value <= t[i] : value >= t[i]) return data.levels[i];
        }
        return 0; // below Probationary: event failure
    }

    var BANDS = [[100, 'Outstanding', 'High'], [95, 'Outstanding', 'Medium'], [90, 'Outstanding', 'Low'],
        [85, 'Excellent', 'High'], [80, 'Excellent', 'Medium'], [75, 'Excellent', 'Low'],
        [70, 'Good', 'High'], [65, 'Good', 'Medium'], [60, 'Good', 'Low'],
        [55, 'Satisfactory', 'High'], [50, 'Satisfactory', 'Medium'], [45, 'Satisfactory', 'Low']];

    /* input: {sex:'M'|'F', age, pushups, plankSecs, cardio:'run'|'row'|'swim500'|'swim450', cardioSecs, highAltitude} */
    function score(data, input) {
        var key = input.sex + '_' + ageGroup(input.age);
        var cardioEvent = input.cardio === 'run' && input.highAltitude ? 'run_alt' : input.cardio;
        var p = eventPoints(data, 'pushups', key, input.pushups);
        var k = eventPoints(data, 'plank', key, input.plankSecs);
        var c = eventPoints(data, cardioEvent, key, input.cardioSecs);
        var failed = [];
        if (!p) failed.push('push-ups');
        if (!k) failed.push('plank');
        if (!c) failed.push('cardio');
        var avg = failed.length ? 0 : (p + k + c) / 3;
        var category = 'Failure', level = '';
        if (!failed.length) {
            for (var i = 0; i < BANDS.length; i++) if (avg >= BANDS[i][0]) { category = BANDS[i][1]; level = BANDS[i][2]; break; }
        }
        return { pushups: p, plank: k, cardio: c, average: avg, category: category, level: level, failedEvents: failed };
    }

    // App enum names, for verification against the app's export.
    function categoryKey(r) {
        if (r.category === 'Failure') return 'failure';
        return r.category.toLowerCase() + r.level;
    }

    var api = { score: score, ageGroup: ageGroup, eventPoints: eventPoints, categoryKey: categoryKey };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.NAVYPRT = api;
})(this);
