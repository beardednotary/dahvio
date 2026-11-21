/* Training tips for the lowest-scoring event, shown under a calculator result.
 * One short, general tip per event. Where a tip states how a table scores,
 * that comes from the same scoring data the calculator uses.
 *
 *   DVTips.html('usmc', 'run')  ->  '<p class="calc-tip">...</p>'  ('' if unknown)
 */
(function (root) {
    var T = {
        usmc: {
            pullups: ['Pull-ups', 'Build volume with several easy sets through the day, each about half your max, most days of the week. If you are stuck under 10, add slow 3–5 second lowering reps.'],
            pushups: ['Push-ups', 'Push-ups cap at 70 points; pull-ups are worth up to 100. If you can do pull-ups, training them is often the bigger score gain. For push-ups, practice 2-minute timed sets with a steady cadence.'],
            plank: ['Plank', 'The plank table is the same for every Marine: 1:10 earns 40 points and 3:45 earns 100, about a point for every 2–3 seconds. Hold timed planks three times a week and add 10–15 seconds a week.'],
            run: ['3-mile run', 'Each 10 seconds off your 3-mile time is worth about a point. Pair one interval session a week (800 m repeats at goal pace or faster) with easy runs on other days.'],
            mtc: ['Movement to Contact', 'The MTC is an 880-yard sprint in boots and utilities. Train it with 200 m and 400 m repeats faster than goal pace, with full recovery between them.'],
            ammoLift: ['Ammunition Lift', 'The AL is two minutes of pressing a 30-pound can from shoulder height to lockout. Practice timed sets with a 30-lb dumbbell or kettlebell and hold a steady rhythm from the first rep; a fast first minute usually costs more than it gains.'],
            manuf: ['Maneuver Under Fire', 'The MANUF is a 300-yard shuttle of sprints, crawls, a buddy drag and carry, an ammo can carry, and a grenade throw. Drill the transitions: shuttle sprints with fast turns and carries with a partner close to your weight.']
        },
        army: {
            MDL: ['Deadlift', 'The deadlift table is set in 10-pound increments, so every 10 lb you add can move your score. Train heavy triples on the hex bar twice a week and practice your setup so the test lift feels routine.'],
            HRP: ['Hand-release push-ups', 'The hand-release push-up rewards pace. Practice 2-minute timed sets at a cadence you can hold, rather than racing the first 30 seconds.'],
            SDC: ['Sprint-drag-carry', 'Drill the five 50 m shuttles in order: sprint, drag, lateral, carry, sprint. Time lost at the turns adds up, so practice them as much as the lanes.'],
            PLK: ['Plank', 'Hold timed planks three times a week and add 10–15 seconds a week. Practice the exact test position so you are not docked for form.'],
            '2MR': ['2-mile run', 'Mix one interval session a week (400–800 m repeats faster than goal pace) with easy aerobic runs on other days.']
        },
        navy: {
            pushups: ['Push-ups', 'Practice 2-minute timed sets at a cadence you can hold to the end, three days a week.'],
            plank: ['Forearm plank', 'Hold timed forearm planks three times a week and add 10–15 seconds a week.'],
            run: ['1.5-mile run', 'Mix one interval session a week (400 m repeats faster than goal pace) with easy runs on other days.'],
            row: ['2 km row', 'Row 500 m intervals at goal split with short rests, and practice holding an even pace for the full 2 km.'],
            swim500: ['500-yard swim', 'Swim 50- and 100-yard repeats at goal pace with short rests, and work on turns and breathing rhythm.'],
            swim450: ['450-meter swim', 'Swim 50- and 100-meter repeats at goal pace with short rests, and work on turns and breathing rhythm.']
        },
        af: {
            cardio: ['Cardio', 'Cardio is half the PFA (50 points). For the 2-mile run, pair one interval session a week with easy runs; for the HAMR, practice the beeps and the turns so you reach each line on time.'],
            strength: ['Strength', 'Practice timed sets of your test exercise at the test time limit three days a week, at a pace you can hold to the end.'],
            core: ['Core', 'Practice your test exercise under the clock three days a week. If you plank, add 10–15 seconds to your hold each week.'],
            'body composition': ['Body composition', 'Waist-to-height ratio is 20 points: 0.49 or under earns all 20, and each 0.01 above that costs 1 to 2.5 points until 0.60 earns none. Measure at the same point and time of day each week to track it.']
        }
    };

    function html(branch, key) {
        var t = T[branch] && T[branch][key];
        if (!t) return '';
        return '<p class="calc-tip"><strong>Your lowest event: ' + t[0] + '.</strong> ' + t[1] + '</p>';
    }

    root.DVTips = { html: html };
})(this);
