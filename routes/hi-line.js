// ═══════════════════════════════════════════════════════════════════════════
// MILE MARKER — ROUTE 4 — THE HI-LINE
// Fargo, ND → Nowhere · I-29 to Grand Forks, then US-2 west across North
// Dakota and Montana to the Continental Divide at Marias Pass. Deep winter.
//
// THIS FILE IS ASSEMBLED. Edit the pieces in routes/src-hi-line/ and run
// `node tools/build_hi_line.js`; do not edit routes/hi-line.js by hand.
//
// Voice: the desert was absence, the Delta was presence, the coast was close
// weather. This is distance you can see. The next town's elevator shows up
// fifteen miles before you reach it; weather is visible for an hour before it
// arrives; nothing is hidden and nothing is near. The cold is a fact with a
// number on it. People are plain and practical and they stop for each other,
// not because they are kind but because next time it is them. The brutality
// here belongs to the weather and never to anybody you meet.
//
// Mechanic: the cold charges you for stopping. The engine stays running, so
// a stop that would be free anywhere else costs fuel here, and the sign says
// so. One seeded storm per run closes one of three highway gates.
//
// The finale. It reads `s.carried` — what you brought from the other roads —
// everywhere, always with a first-time fallback. Texture, not homework.
//
// Nobody in this route says "drive safe" (Route 3's promise covered
// California; it costs nothing to keep it here). Cord does not appear until
// the summit. Until then there is only a car under snow in Havre.
// ═══════════════════════════════════════════════════════════════════════════

// Where this run's storm closes the road: 0 = west of Devils Lake (day one),
// 1 = west of Wolf Point (day two), 2 = west of Cut Bank (day three). Drawn
// from the run seed, so it is fixed for the run, a reload resumes the same
// weather, and people along the road can know it before you get there.
function hlStorm() {
  return typeof runRand === 'function' ? Math.floor(runRand('hl:storm') * 3) % 3 : 0;
}
const HL_STORM_WHERE = ['from Devils Lake west to Rugby', 'from Wolf Point west to Glasgow', 'from Cut Bank west to the mountains'];

// ── Drawn signs ──────────────────────────────────────────────────────────
// Same rule as Route 3: only where the prose sets a sign on a line of its own.
const HL_ARROW_LEFT = "<svg class='rs-arrow' viewBox='0 0 34 25' aria-hidden='true'><path d='M0 12.5 L13 0 L13 7.5 L34 7.5 L34 17.5 L13 17.5 L13 25 Z'/></svg>";
const HL_SIGN = {
  // A bank's time-and-temperature sign: the only thing in town that says the number.
  led: (a, b) => "<div class='rs-wrap'><div class='rs-led'><span>" + a + "</span><span>" + b + "</span></div></div>",
  // A green guide sign: route shield line, then towns. No distances unless given.
  green: (rows, head) => "<div class='rs-wrap'><div class='rs sign rs-green" + (rows.length === 1 && !head ? ' rs-one' : '') + "'>" +
    (head ? "<div class='rs-head'>" + head + "</div>" : '') +
    "<div class='rs-body'>" + HL_ARROW_LEFT + "<div class='rs-rows'>" +
    rows.map(r => "<div class='rs-row'><span class='rs-name'>" + r[0] + "</span>" + (r[1] != null ? "<span class='rs-num'>" + r[1] + "</span>" : '') + "</div>").join('') +
    "</div></div></div></div>",
  // A brown sign: a place somebody decided was worth a sign.
  brown: (lines) => "<div class='rs-wrap'><div class='rs sign rs-brown rs-centred'>" + lines.map((l, i) => "<div class='" + (i === 0 ? 'rs-big' : 'rs-small') + "'>" + l + "</div>").join('') + "</div></div>",
  // The gate across the highway.
  closed: (sub) => "<div class='rs-wrap'><div class='rs-gate'><div class='rs-bar'></div><div class='sign rs-white'><div class='rs-big'>ROAD CLOSED</div>" + (sub ? "<div class='rs-small'>" + sub + "</div>" : '') + "</div><div class='rs-bar'></div></div></div>",
  // A white sign with black letters: a town saying something about itself.
  white: (lines) => "<div class='rs-wrap'><div class='rs sign rs-white'>" + lines.map((l, i) => "<div class='" + (i === 0 ? 'rs-big' : 'rs-small') + "'>" + l + "</div>").join('') + "</div></div>",
  // An index card in a door. Lettered by the engine so no two letters match.
  card: (lines, later) => "<div class='rs-wrap'><div class='rs-glass'><div class='rs-card'>" +
    lines.map(l => "<span class='m1 hand'>" + l + "</span>").join('') +
    (later ? "<span class='m2 hand'>" + later + "</span>" : '') + "</div></div></div>"
};

// ── What is in the car ───────────────────────────────────────────────────
// One line per object brought from another road: where it rides. Read at Fargo
// and again at the divide. Empty for a first-time traveller, and that is fine.
const HL_RIDES = {
  southwest: {
    note: "The note from Kingman is in your shirt pocket, gone soft at the crease. A highway number and a time. You have stopped expecting to learn which highway.",
    room_key: "The room key from Arizona is in the cupholder. DROP IN ANY MAILBOX, it says on the back. You have driven past a great many mailboxes.",
    receipt: "The gas receipt from the desert is in the door pocket. It has gone nearly blank, as you knew it would, and you have it anyway."
  },
  south: {
    photograph: "The photograph from Natchez is in the visor. A two-lane, a grade, a guardrail. You have not taken it down in a long time.",
    map: "The photocopied map from Natchez is in the door pocket, folded to a piece of Mississippi, with a biro line down it in somebody else's hand.",
    receipt: "There is a gas receipt from the Delta in the door pocket, thermal paper, going pale from the edges in."
  },
  coast: {
    shell: "The abalone shell is on the passenger seat, inside up. Out here, in this light, it is the only colour in the car.",
    stone: "The stone from Cannon Beach is in the cupholder. Dry and grey. It was something else when it was wet, and you remember what.",
    tides: "The tide table from Pacific City is in the door pocket: highs and lows for water that is fifteen hundred miles west of you.",
    penny: "The flattened penny from Astoria is in the ashtray, with the river pressed into it."
  }
};
function hlRides(s) {
  const out = [];
  ((s.carried && s.carried.objects) || []).forEach(o => {
    const line = HL_RIDES[o.route] && HL_RIDES[o.route][o.id];
    if (line) out.push(line);
  });
  return out;
}
// Has this traveller driven that road and arrived?
function hlBeen(s, route) { return !!(s.carried && s.carried.routes && s.carried.routes[route]); }

const HI_LINE = {
  id: 'hiline',
  label: 'Route 4',
  name: 'The Hi-Line',
  start: 'hl_001',
  miles: null,                // This road does not post a distance. See the design spec.
  wearMiles: 903,             // ...but it is 903 miles to the divide, built from state mileposts.
  tankPerMile: 0.21,          // 903 x 0.21 = 190 before idling. First pass at 0.25 stranded 84-100% of competent runs.
  strandReturnDefault: 'hl_009',
  strand: { one: 'hl_strand_1', end: 'hl_strand_end' },

  // ── What you came away holding. Given, not bought. ──────────────────────
  keepsakeFor: (s) => {
    if (s.flags.got_mitts) return {
      id: 'mitts', tag: 'MITTS', label: 'A pair of chopper mitts off a nail in Lakota',
      line: "The mitts are on the dash over the defrost vent, where they have ridden since Lakota, leather out, wool in, the shape of somebody else's hands still in them. Arlen's. He had no use."
    };
    if (s.flags.got_scale_ticket) return {
      id: 'ticket', tag: 'TICKET', label: 'A scale ticket from the elevator at Glasgow',
      line: "The scale ticket from the elevator at Glasgow is in the door pocket. Gross, tare, net. It is the only piece of paper from this whole road that says exactly what something weighed."
    };
    if (s.flags.took_timetable) return {
      id: 'timetable', tag: 'TRAIN', label: 'An Empire Builder timetable',
      line: "The timetable is folded in the door pocket. Every town you drove through is on it, in order, with a time beside it, for a train that did the whole road while you were asleep."
    };
    return null;
  },

  // ── The radio. Same station. Up here, at night, it carries from anywhere. ─
  // AM skywave is real and the northern plains are where it is strongest: a
  // clear-channel signal from a thousand miles off comes in after dark like it
  // is next door. So this is the route where the station is allowed to sound
  // like the other three. Never confirmed. Function entries may read `state`.
  radioBands: [
    { from: 0, to: 150, lines: [
      "School closings, read as a list. Late starts, then closings, then the ones that are closed and say so every time. He gets through forty of them without changing speed.",
      "The markets. Spring wheat, durum, sunflowers, at the elevator. He reads the basis like a man reading somebody else's mail.",
      "A wind chill advisory. He gives the number, and then the number of minutes exposed skin has got, and then a recipe.",
      (m) => "The forecast. Cold, and then cold, and a ground blizzard warning late " + (hlStorm() === 0 ? 'today' : hlStorm() === 1 ? 'tomorrow' : 'the day after') + " " + HL_STORM_WHERE[hlStorm()] + ". He reads it once. Up here they only read it once."
    ]},
    { from: 150, to: 300, lines: [
      "Hockey scores. Then girls' basketball, every town in the district, with the scores, and he does not skip the ones that were not close.",
      "A man has lost a heifer east of town. Black baldy, ear tag, the tag number. He reads the number twice and says she'll be standing in somebody's shelterbelt.",
      "The obituaries, sponsored by an implement dealer. Born, farmed, survived by. Lunch to follow in the church basement. It is always lunch to follow.",
      (m) => (typeof state !== 'undefined' && state.carried && state.carried.heard_of_the_river)
        ? "River stages, as part of a longer list. The Souris, the Sheyenne, the Red at Fargo. He reads on down a different river entirely and gets as far as the Pascagoula, and says it twice, and you take your hand off the dial."
        : "River stages, as part of a longer list. The Souris, the Sheyenne, the Red at Fargo. The Red runs north, he says, in case anybody is new."
    ]},
    { from: 300, to: 450, lines: [
      "A rig count. Then a list of road restrictions by county, load limits, frost laws, which a great many people who are driving right now are apparently writing down.",
      "Somebody is selling a camper. Somebody is looking for a room. Somebody has found a set of keys at the Cenex with a rabbit's foot on them and would like the rabbit's owner to call.",
      "The time, and then the time in the other time zone, because the line is close, and he would rather say both than have anybody be an hour wrong.",
      (m) => (typeof state !== 'undefined' && state.carried && state.carried.heard_livestock)
        ? "Livestock. Feeder cattle, slaughter cows. A long pause with the mic open, and then the same numbers again. You have heard this man do this before, in a different year, in a desert."
        : "Livestock. Feeder cattle, slaughter cows. A long pause with the mic open, and then the same numbers again."
    ]},
    { from: 450, to: 600, lines: [
      "The stage of the Missouri at Culbertson and at Wolf Point, under the ice. He gives the numbers for a river nobody can see.",
      "Basketball, from a gym on the reservation, live. The announcer knows every player's grandmother and mentions most of them.",
      "A list of what is closed. The school, the senior centre, the clinic until noon. The cafe is open. The cafe, he says, is always open.",
      "The station fades and something else comes up under it from very far away, the way it does out here after dark: a tide table. Highs and lows. Then it is the markets again."
    ]},
    { from: 600, to: 760, lines: [
      "The temperature in every town on the line, read west to east. Cut Bank, Shelby, Chester, Havre, Chinook, Malta, Glasgow. It takes a while. None of them is a number you would choose.",
      "A weather report for Shelby. Highs, lows, wind. He does not say which Shelby. You wait for him to say which Shelby and he goes to an ad for a tyre shop.",
      "The train is late. He says it the way he says the temperature. Number 7, the westbound, four hours down out of Williston, and there are people in a depot somewhere listening to this.",
      (m) => (typeof state !== 'undefined' && state.carried && state.carried.routes && state.carried.routes.coast)
        ? "Under the station, from a thousand miles off, clear as the next room: the bar report. Conditions at the mouth of the river. You know which river. You started a road there once."
        : "Under the station, from a thousand miles off, clear as the next room: a man reading the conditions at the mouth of a river, for boats. Then the wheat again."
    ]},
    { from: 760, to: 910, lines: [
      "A chinook is coming, he says, by the end of the week. Forty degrees warmer in an afternoon. He says it the way you would promise a child something.",
      "Wind. Gusts to seventy at Browning. High-profile vehicles are advised, and then he lists what a high-profile vehicle is, and it is nearly everything.",
      "The avalanche report for the canyon west of the pass. Considerable. He explains what considerable means on a scale where the next word up is high.",
      "An announcer mentions a single vehicle on the shoulder at the summit, hazards on. No details. He moves on to the weather."
    ]}
  ],

  // Scenes that carry their own sound, or where you are standing out in it.
  radioSilent: ['hl_001', 'hl_005a', 'hl_strand_1', 'hl_strand_end', 'hl_strand_resume', 'hl_070', 'hl_071', 'hl_072', 'hl_073', 'hl_end_paid', 'hl_end_rode', 'hl_end_passed'],

  nodes: {

  // ─── THE SHOULDER, IN WINTER ─────────────────────────────────────────────
  // Running dry out here is not a truck and twenty-five dollars. It is the same
  // road ethic at a higher price: everybody stops, because next time it is them.
  hl_strand_1: {
    location: "US 2 West — Shoulder",
    tags: ["tension"],
    mile: null,
    paywall: false,
    onLoad: (s) => { s.flags.stranded_once = true; },
    textFn: (s) => {
      const base = [
        "The engine does not announce it. It just stops pulling, and the heater goes on blowing for a little while out of habit.",
        "You get it onto the shoulder. Then there is the wind, which was there the whole time, and now it is the only thing running.",
        "You have about as long as the heat in the seat lasts."
      ];
      if (s.flags.winter_kit)
        base.push("The candle in the coffee can is in the trunk with the blanket. You get both. One candle in a closed car is an astonishing thing; you would not have believed it this morning, and you believe it now.");
      else
        base.push("You put on everything you own. It is not a great deal. You sit on your hands, and then you do not, because you want to be able to feel them when it matters.");
      base.push(
        "A grain truck goes by eastbound and its brake lights come on before it is past you. Out here they stop. Everybody stops. It is not kindness, exactly. It is arithmetic: next time it is them.",
        "He backs up along the shoulder for a quarter of a mile. He has a can strapped behind the cab, because everybody does.",
        "'Thirty,' he says, through two inches of window. 'It's a long way to more.'"
      );
      return base;
    },
    choices: [
      { text: "Pay him the thirty", sub: "Requires $30 — he will pour it himself, with his back to the wind.", type: "safe", showIf: (s) => !!s.flags.winter_kit, requires: { walletMin: 30 }, next: "hl_strand_resume", outcome: "paid", deltas: { wallet: -30, tank: +30 } },
      { text: "Pay him the thirty", sub: "Requires $30 — he will pour it himself, with his back to the wind.", type: "safe", showIf: (s) => !s.flags.winter_kit, requires: { walletMin: 30 }, next: "hl_strand_resume", outcome: "paid", deltas: { wallet: -30, tank: +30, gut: -2 } },
      { text: "Tell him you don't have it", sub: "Costs Nerve — through two inches of window, at twenty below.", type: "neutral", showIf: (s) => !!s.flags.winter_kit, next: "hl_strand_resume", outcome: "couldnt", deltas: { tank: +14, nerve: -3 }, road: +1, flags: { owes_the_road: true } },
      { text: "Tell him you don't have it", sub: "Costs Nerve — through two inches of window, at twenty below.", type: "neutral", showIf: (s) => !s.flags.winter_kit, next: "hl_strand_resume", outcome: "couldnt", deltas: { tank: +14, nerve: -3, gut: -2 }, road: +1, flags: { owes_the_road: true } }
    ],
    outcomes: {
      paid: [
        "He pours it with his back to the wind and his chin in his collar, and he does not spill any, and you understand that not spilling any is a thing he has practised.",
        "He waits until it starts. He does not wave. He is back up in the cab and rolling before your gauge has moved."
      ],
      couldnt: (s) => [
        "You say it through the window. It is worse through a window.",
        "He looks down the road, east, as if somebody were coming who would know what to do, and then he gets the can anyway.",
        (s.carried && s.carried.owes_the_road)
          ? "'Pay the next one,' he says. You have been told that before, on a shoulder with heat coming off it, by a man who did not wait to be thanked either."
          : "'Pay the next one,' he says.",
        "He does not say whether he means the next station or the next person. He is gone before you can decide which."
      ]
    }
  },

  hl_strand_end: {
    location: "US 2 West — Shoulder",
    tags: ["tension"],
    mile: null,
    paywall: false,
    runEnd: true,
    text: [
      "It is a long time before anybody comes, and when somebody does it is a deputy, because somebody else called it in.",
      "He does not ask what happened. There is only the one thing that happens. He has a blanket in the back of the Tahoe that has been on other people.",
      "You ride into town with your hands under your arms, watching your own car get small through the back glass, with a drift already starting against the wheels on the west side.",
      "It will be there in the spring. You will not be the one who comes for it.",
      "This run is over."
    ],
    choices: [
      { text: "Try the route again", sub: "Same traveler. New run.", type: "safe", action: "retrySame" },
      { text: "Choose a different traveler", sub: "Back to character select.", type: "neutral", action: "newTraveler" }
    ]
  },

  hl_strand_resume: {
    location: "US 2 West",
    tags: ["travel"],
    mile: null,
    paywall: false,
    text: [
      "You are moving again.",
      "The heater takes four miles to mean it. You drive those four miles bent forward with your chin over the wheel, as if that helped.",
      "The gauge sits just above the peg. Out here you watch it more than you watch the road, and the road does not mind. It is not going anywhere."
    ],
    choices: [
      { text: "Keep going", sub: "There is still road left.", type: "neutral", next: "__RESUME__" }
    ]
  },

  // ═════════════════════════════════════════════════════════════════════════
  // DAY ONE — FARGO TO MINOT. Mile 0 to 291.
  // Teaches the cold: the engine stays running, and stopping costs fuel.
  // ═════════════════════════════════════════════════════════════════════════

  // 01 — FARGO. Twenty-two below on the bank sign. What is in the car.
  hl_001: {
    location: "Fargo, ND — a motel lot, 6:41 AM",
    tags: ["opening","money"],
    mile: 0,
    heading: "Grand Forks",
    paywall: false,
    onLoad: (s) => { if (s.archetype === 'planner') s.flags.winter_kit = true; },
    textFn: (s) => {
      const base = [
        "The bank across the frontage road has a sign that does the time and then the temperature, and you have watched it do both four times now, in case one of them changes.",
        HL_SIGN.led('6:41', '&minus;22&deg;F'),
        "Every car in the lot has an orange cord running from under its hood to a post with an outlet on it. Yours too. That is what the post is for. At this temperature a car that was not plugged in overnight is a piece of furniture.",
        "You unplug it. The cord has gone as stiff as a length of rebar and stays the shape of the lot when you coil it.",
        "The engine turns over like it is thinking about the question. Then it catches. You do not turn it off again unless you have to. Nobody up here does. The exhaust from forty idling cars stands straight up in the dark and does not move."
      ];
      const rides = hlRides(s);
      if (rides.length) {
        base.push("You take stock of the car while it warms, because it takes eleven minutes to warm.");
        rides.forEach(r => base.push(r));
        base.push(rides.length >= 3
          ? "Three roads' worth. You did not set out to collect anything. It is just what was in your hands each time you stopped."
          : "You did not set out to collect anything. It is just what was in your hands when you stopped.");
      } else {
        base.push("The car is clean. Nothing on the dash, nothing in the door pockets. You notice that, this morning, for some reason.");
      }
      if (s.flags.winter_kit)
        base.push("The winter kit is in the trunk where you put it in October: a candle in a coffee can, a wool blanket, a bag of sand, a short shovel. You checked it last night. You are going to check it again at Grand Forks.");
      base.push("North first, up the interstate along the river. Then west. You have looked at the map and the map does not put a number on west.");
      return base;
    },
    choices: [
      { text: "Fill up before the interstate", sub: (s) => pumpSub(s, { rate: 0.24 }, "City prices, the best you will see. The pump handle is cold enough to want a glove."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.24 }, next: "hl_001" },
      { text: "Buy what the man at the counter says to buy", sub: "Requires $9 — a candle in a coffee can, a wool blanket, a bag of sand. He does not ask if you have them. He can tell.", type: "neutral", showIf: (s) => !s.flags.winter_kit, requires: { walletMin: 9 }, next: "hl_001", deltas: { wallet: -9 }, outcome: "kit", flags: { winter_kit: true } },
      { text: "A caramel roll and coffee at the truck stop", sub: "Requires $5 — the roll is the size of a hubcap. The car stays running outside.", type: "neutral", showIf: (s) => !s.flags.ate_fargo, requires: { walletMin: 5 }, next: "hl_001", deltas: { wallet: -5, gut: +1, tank: -1 }, flags: { ate_fargo: true } },
      { text: "North on 29", sub: "Safe — Grand Forks is an hour and a quarter up the valley.", type: "safe", next: "hl_002" }
    ],
    outcomes: {
      kit: [
        "He rings it up without your having asked for any of it. A coffee can with a candle and a book of matches in it. A grey wool blanket that has been on the shelf since the last person needed one. Twenty pounds of sand.",
        "'Candle'll keep a car above freezing,' he says. 'Crack a window. People forget the window.'",
        "He puts the matches inside the can so they will be where the candle is. That is the whole of the instruction, and it is clearly an instruction he has given before to somebody he later read about."
      ]
    }
  },

  // 02 — THE VALLEY. A lake bed, a river that runs north, and a pickup in the
  // ditch. The first time the route asks whether you stop.
  hl_002: {
    location: "I-29 North — the Red River Valley",
    tags: ["travel","character"],
    mile: 40,
    paywall: false,
    text: [
      "The valley is not a valley. It is the bottom of a lake that drained ten thousand years ago and left the flattest ground on the continent, and the interstate goes up the middle of it like a line ruled on a table.",
      "The river is a mile east, under ice, in a line of bare trees. It runs north. It is one of the few in the country that does: everything that falls here goes to Hudson Bay.",
      "Snow is moving across the road at ankle height, in ropes, from the left. It is not snowing. This is snow that fell last week, going somewhere else.",
      "Sun dogs, either side of the sun. The light comes up pink over forty miles of nothing and for about six minutes it is the most beautiful place you have ever been cold.",
      "Ahead on the right there is a pickup in the ditch, nose down, lights on, with a man standing beside it in coveralls with his hands in his armpits."
    ],
    choices: [
      { text: "Pull over", sub: "Engine running — costs a little fuel. He has not waved. Up here they don't wave.", type: "neutral", next: "hl_003", deltas: { tank: -2 }, road: +2, outcome: "stopped", flags: { stopped_ditch: true, storm_told: true } },
      { text: "Slow down and get a look at him", sub: "Gut check — he might have it handled.", type: "neutral", check: { stat: "gut", difficulty: 5 },
        success: { next: "hl_003", outcome: "looked" },
        failure: { next: "hl_003", outcome: "looked_bad", deltas: { nerve: -1 } } },
      { text: "Keep your speed", sub: "Safe — somebody will stop. Somebody always does, up here.", type: "safe", next: "hl_003", road: -1 }
    ],
    outcomes: {
      stopped: (s) => [
        "You put the window down two inches. The cold comes in through the two inches like something poured.",
        "'Tow's coming,' he says. 'Out of Hillsboro. I'm all right.' He looks at your plates and then at you. 'Appreciate you stopping. Folks do, mostly. You'd be surprised who doesn't.'",
        "You ask how he went in. He looks at the ditch as if it had asked. 'Looked at something,' he says.",
        "'You going west? It's going to blow " + (hlStorm() === 0 ? 'this afternoon' : hlStorm() === 1 ? 'tomorrow' : 'day after tomorrow') + ", " + HL_STORM_WHERE[hlStorm()] + ". They'll shut the gate. Be on the right side of it or be in town.'",
        "He says it the way you would tell somebody which exit. Then he takes one hand out of his armpit, lifts it about an inch, and puts it back."
      ],
      looked: [
        "He has his phone out. There are flares on the shoulder behind the truck, set out at even distances by somebody who has done it before. He sees you looking and lifts his chin: he is fine.",
        "You take him at his chin and keep going."
      ],
      looked_bad: [
        "You slow down and look at him and he looks at you, and you cannot tell from his face whether he needs anything, and by the time you have decided you are a quarter mile past.",
        "In the mirror he gets small. He does not wave you back. That does not settle it."
      ]
    }
  },

  // 03 — GRAND FORKS. The turn. From here it is one road.
  hl_003: {
    location: "Grand Forks, ND — US 2 and I-29",
    tags: ["travel","money"],
    mile: 78,
    shield: "US 2 WEST",
    heading: "Devils Lake",
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.stopped_ditch) base.push("Your left hand is still cold from two inches of open window forty miles ago. You hold it over the vent.");
      base.push(
        "Grand Forks is a university and a grain terminal and a river that came over its dikes once and took downtown. They built the dikes higher and put a marker on a pole to show how deep it was. The marker is over your head.",
        "At the top of the ramp the sign for the road west has one town on it.",
        HL_SIGN.green([['Devils Lake']], 'WEST 2'),
        "No number after it. You look for the number. Every green sign you have ever driven under has had a number, and this one has a town and an arrow and a strip of bare aluminium where the number would go."
      );
      if (hlBeen(s, 'coast'))
        base.push("The last road told you how far every single time. It counted for you. You had not thought you would miss that.");
      base.push("West of town there is an air base, and then there is not anything, and the road goes into the not anything without changing width.");
      return base;
    },
    choices: [
      { text: "Fill up at the last big station", sub: (s) => pumpSub(s, { rate: 0.25 }, "A truck stop with twelve pumps. You will not see twelve pumps again."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.25 }, next: "hl_003" },
      { text: "West on 2", sub: "Safe — the road is dry and the wind is from the northwest, which is the direction you are going.", type: "safe", next: "hl_004" }
    ]
  },

  // 04 — LAKOTA. A cafe with a row of nails by the door, and the mitts.
  hl_004: {
    location: "Lakota, ND — the cafe on US 2",
    tags: ["character","money"],
    mile: 140,
    paywall: false,
    text: [
      "You see Lakota fifteen miles before you get to it. First the elevator, a white tower standing up out of the flat like a tooth, and then for a long time nothing else, and then a water tower and some trees and a town.",
      "Every town out here does this. You are going to spend this whole road arriving.",
      "There is a cafe on the highway with nine pickups nosed up to it, all running, all empty. Nobody locks a running truck. There is nobody to take it who would not bring it back.",
      "Inside the door, on the left, there is a board with a row of nails in it, and on the nails there are caps and scarves and mitts that people have left behind over a number of winters.",
      "Your gloves are the kind you buy at a gas station in a place where gloves are a formality."
    ],
    choices: [
      { text: "Soup at the counter", sub: "Requires $5 — knoephla, which is dumplings and potatoes and cream. The car stays running.", type: "neutral", requires: { walletMin: 5 }, next: "hl_005", deltas: { wallet: -5, gut: +2, tank: -2 }, outcome: "soup", flags: { got_mitts: true } },
      { text: "Stand inside the door until you can feel your hands", sub: "Engine running — Nerve check. Nine men will look up, once, and then not again.", type: "neutral", check: { stat: "nerve", difficulty: 4 },
        success: { next: "hl_005", outcome: "door", deltas: { tank: -2 }, flags: { got_mitts: true } },
        failure: { next: "hl_005", outcome: "door_bad", deltas: { tank: -2, nerve: -1 } } },
      { text: "Coffee to go", sub: "Requires $2 — in and out.", type: "neutral", requires: { walletMin: 2 }, next: "hl_005", deltas: { wallet: -2, tank: -1 } },
      { text: "Drive through", sub: "Safe — Devils Lake is twenty-seven miles and you have seen the cafe.", type: "safe", next: "hl_005" }
    ],
    outcomes: {
      soup: [
        "The soup comes in a bowl the size of a hubcap with a slice of white bread on the saucer. The woman who brings it looks at your hands on the spoon for exactly as long as it takes to look at something.",
        "She goes to the board by the door and takes down a pair of mitts. Leather outside, gone dark and soft, with a knitted wool liner you can pull out. Choppers, they call them.",
        "'Arlen's,' she says, and puts them by your bowl. 'He's got no use.' She does not say why he has no use, and she refills four coffees on her way back so that you will not ask.",
        "You try to pay for them with the soup. She takes the five for the soup and pushes the rest back across the counter with one finger."
      ],
      door: [
        "Nine men look up, once, and then go back to it. You stand by the board with your hands under your arms and nobody asks what you want, which out here is a courtesy.",
        "The woman behind the counter comes past with the coffee pot. She does not stop. She takes a pair of leather mitts down off a nail as she goes by, the way you would straighten a picture, and puts them in your hands.",
        "'Arlen's,' she says, already past you. 'He's got no use.'",
        "They are warm from hanging over the register. The wool inside has the shape of somebody else's hands in it."
      ],
      door_bad: [
        "Nine men look up. You had meant to stand there for a minute. With nine men looking it turns out to be about twelve seconds.",
        "You nod at nobody and go back out to the car, where your hands hurt worse for having been warm."
      ]
    }
  },

  // 05 — DEVILS LAKE. A lake with no outlet, rising for thirty years.
  hl_005: {
    location: "Devils Lake, ND — the lake",
    tags: ["travel","money","quiet"],
    mile: 167,
    heading: "Rugby",
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.got_mitts) base.push("The mitts are on the dash over the defrost vent. You have had them on twice already, to see.");
      base.push(
        "The road comes into Devils Lake on a causeway, with ice on both sides of it and no shore you can see, and the causeway is higher than it was. You can tell because the old road is right there beside it, ten feet lower, going down into the ice at an angle like a boat ramp.",
        "The lake has no outlet. Nothing runs out of it. Whatever falls in this whole basin comes here and stays, and for thirty years more has come than has left. It has taken farms. It has taken a church. They have raised this road three times and the old road each time is underneath the new one, or beside it, or gone.",
        "Out on the ice there is a silo, standing in the lake up to its second band, with a line of dead cottonwoods leading out to it where somebody's lane used to go.",
        "And past the silo, a town. A hundred little houses on runners, set out in streets on the ice, with pickups parked beside them and smoke coming out of stovepipes. There is a road ploughed out to it from the boat landing, with a sign at the landing."
      );
      return base;
    },
    choices: [
      { text: "Fill up in town", sub: (s) => pumpSub(s, { rate: 0.27 }, "Rugby is fifty-eight miles and there is a gate between here and there."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.27 }, next: "hl_005" },
      { text: "Drive out on the ice", sub: "Nerve check — three miles out and three back, on a lake. The sign says the ice is thirty inches. The sign is hand-painted.", type: "neutral", addMiles: 3, check: { stat: "nerve", difficulty: 5 },
        success: { next: "hl_005a" },
        failure: { next: "hl_006", outcome: "ice_no", deltas: { nerve: -1 }, flags: { turned_at_ice: true } } },
      { text: "West, to the edge of town", sub: "Safe — the highway is on dirt the whole way. Raised dirt.", type: "safe", next: "hl_006" }
    ],
    outcomes: {
      ice_no: [
        "You get the front wheels onto it. The ice does not do anything. It is thirty inches of ice. It makes a sound, though, once, a long way off, like a cable being plucked, and your foot comes off the gas without consulting you.",
        "You back up onto the landing. A man going past you in a one-ton with a fish house on a trailer lifts two fingers off the wheel and drives out onto the lake at thirty miles an hour."
      ]
    }
  },

  // 05a — THE FISH HOUSES. Warm, and somebody needs holes drilled.
  hl_005a: {
    location: "Devils Lake, ND — on the ice",
    tags: ["character","money"],
    mile: 167,
    owed: 3,
    paywall: false,
    text: [
      "The road across the ice is ploughed as wide as a county road and has drifts along the sides like a county road, and after a mile you have stopped thinking about what is under it, which is forty feet of water and, further down, somebody's farm.",
      "The fish houses have names painted on them and numbers, like a street. Some have satellite dishes. One has a wreath.",
      "A man is outside the fourth one with a power auger, drilling a line of holes in the ice, and beside him there are a lot more holes marked out with spray paint than one man would want to drill.",
      "He lets the auger wind down when you pull up. He looks at your car, on his lake, with those plates, for a while."
    ],
    choices: [
      { text: "Ask if he wants a hand with the holes", sub: "Nerve check — an hour outside. Pays cash, and whatever he is frying.", type: "neutral", check: { stat: "nerve", difficulty: 4 }, road: +1, addMiles: 3,
        success: { next: "hl_006", outcome: "holes", deltas: { wallet: +22, gut: +1, tank: -3 }, flags: { worked_ice: true, storm_told: true } },
        failure: { next: "hl_006", outcome: "holes_slow", deltas: { wallet: +8, gut: -1, tank: -3 }, flags: { worked_ice: true } } },
      { text: "Stand at the edge of a hole and look down it", sub: "Engine running — costs a little fuel. It is green down there.", type: "neutral", addMiles: 3, next: "hl_006", deltas: { tank: -2 }, outcome: "hole" },
      { text: "Turn around and go back to the road", sub: "Safe — you drove on a lake. That was the thing.", type: "safe", addMiles: 3, next: "hl_006" }
    ],
    outcomes: {
      holes: (s) => [
        "He hands you the auger as if you had asked for it. It weighs forty pounds and wants to turn you instead of the ice, and by the third hole you have worked out how to stand.",
        (s.flags.got_mitts ? "Arlen's mitts turn out to have been made for exactly this. " : "Your gas-station gloves are not made for this, and he watches them not be made for it and says nothing. ") + "Each hole comes up through thirty inches of ice and then the water wells up green and smoking and stands level with the top.",
        "After an hour he waves you inside. It is seventy degrees in there. There is a stove, a bunk, a television, and four holes in the floor with lines down them, and he fries perch in a pan on the stove and you eat them with your fingers off a paper towel.",
        "He counts twenty-two dollars off a fold and does not ask what you thought it was worth.",
        "'Going west?' he says. 'It'll blow " + (hlStorm() === 0 ? 'this afternoon, right out here past town' : hlStorm() === 1 ? 'tomorrow, out past Wolf Point' : 'day after tomorrow, up by Cut Bank') + ". Gate'll come down. You don't go round the gate.' He turns a perch. 'People go round the gate.'"
      ],
      holes_slow: [
        "He hands you the auger. It turns you instead of the ice. You get two holes done in the time he would have done six, and on the third it kicks and puts you on your back on the lake, looking straight up at the sky, which is very large from down there.",
        "He takes the auger back and finishes the row. He gives you eight dollars anyway. 'For the two,' he says.",
        "Your coat is wet through at the shoulder where you landed. It will stay wet until Minot."
      ],
      hole: [
        "The hole is ten inches across and thirty inches deep, and the sides of it are blue, and the water at the bottom of it is green and comes up to exactly the level of the ice and stops, which you would not have predicted.",
        "Down there, forty feet, there is a section road and a fence line and the foundation of a house. Nobody up here mentions it. They mention the perch.",
        "You stand there until your eyelashes start to stick."
      ]
    }
  },

  // 06 — THE FIRST GATE. A steel arm on a post at the edge of town. One run in
  // three it is down, and the afternoon is a different afternoon.
  hl_006: {
    location: "US 2 West — the gate west of Devils Lake",
    tags: ["danger","fork"],
    mile: 172,
    paywall: false,
    textFn: (s) => {
      const shut = hlStorm() === 0;
      const base = [];
      if (s.flags.worked_ice) base.push("Your forearms are still buzzing from the auger and you smell of perch.");
      else if (s.flags.turned_at_ice) base.push("You can still hear the sound the ice made. It was a perfectly safe sound. Everybody says so.");
      base.push("At the west edge of town, where the last streetlight is, there is a steel gate on a post beside the highway. A long red-and-white arm, the kind at a railroad crossing, except that it is as long as the road is wide. Every town on this highway has one at each end. You had taken them for something to do with trains.");
      if (shut) {
        base.push(
          "This one is down.",
          HL_SIGN.closed('NO TRAVEL &middot; GROUND BLIZZARD'),
          "It is across both lanes with a light flashing on the end of it. Past it you can see the highway for about two hundred yards and then you cannot see anything. Not dark. White. The sky overhead is perfectly blue. The snow is not falling. It is the snow that is already on the ground, picked up and carried sideways at fifty miles an hour, eight feet deep, like a river you could drown in standing up.",
          s.flags.storm_told
            ? "He told you. Be on the right side of it or be in town. You are in town."
            : "Nobody told you. Somebody would have, if you had stopped anywhere long enough to be told.",
          "Four cars are pulled up at the gate with their engines running. Behind you, on the frontage, there is a cafe with a full lot. A county plow is sitting on the far side of the arm with its blade up and its lights going, waiting for something."
        );
      } else {
        base.push(
          "This one is up, standing straight against the sky with its light off, bolted back against the post.",
          s.flags.storm_told
            ? "Not here, then. It is going to blow somewhere else, further on, and this is just a clear cold afternoon with the wind at your left shoulder."
            : "You drive under where it would be."
        );
      }
      return base;
    },
    choices: [
      { text: "Wait it out in the cafe", sub: "Requires $8 — pie, coffee, and everybody else who is waiting. The car idles in the lot.", type: "neutral", showIf: () => hlStorm() === 0, requires: { walletMin: 8 }, next: "hl_007", deltas: { wallet: -8, gut: +1, tank: -4 }, outcome: "cafe", flags: { waited_gate: true } },
      { text: "Wait it out in the car", sub: "Engine running for three hours — costs fuel, and nothing else.", type: "neutral", showIf: () => hlStorm() === 0, next: "hl_007", deltas: { tank: -7, nerve: -1 }, outcome: "car", flags: { waited_gate: true } },
      { text: "Follow the plow when it goes", sub: "Gut check — stay in its lights and you are through in an hour. Lose its lights and you are not.", type: "risky", showIf: () => hlStorm() === 0, check: { stat: "gut", difficulty: 5 },
        success: { next: "hl_007", outcome: "plow", deltas: { nerve: +1 }, flags: { followed_plow: true } },
        failure: { next: "hl_007", outcome: "plow_lost", deltas: { nerve: -2, tank: -6 }, flags: { followed_plow: true, lost_plow: true } } },
      { text: "Go around the gate", sub: "Nerve check — there is room on the shoulder. There is a reason there is a gate.", type: "risky", showIf: () => hlStorm() === 0, road: -2, check: { stat: "nerve", difficulty: 7 },
        success: { next: "hl_007", outcome: "around", deltas: { nerve: -1 }, flags: { went_round_gate: true } },
        failure: { strand: true, strandReturn: "hl_007", flags: { went_round_gate: true, ditched_blizzard: true } } },
      { text: "West", sub: "Safe — the arm is up and the road is dry.", type: "safe", showIf: () => hlStorm() !== 0, next: "hl_007" }
    ],
    outcomes: {
      cafe: [
        "Everybody in the cafe is waiting for the same gate, and nobody is put out about it. A woman with two kids in snowsuits. Three men from a seed company. A long-haul driver doing a crossword in pen.",
        "Somebody's phone says the plow went through at two. Somebody else's says three. The waitress says it opens when it opens and brings pie to people who did not order pie.",
        "At twenty to five the light on the arm stops flashing, and everybody stands up at once, like church letting out."
      ],
      car: [
        "You sit at the gate with the heater on and watch the white wall two hundred yards off. It does not get closer. It does not do anything. It is just the place where the road stops being visible, under a blue sky, for three hours.",
        "The needle comes down a width while you sit there doing nothing at all. That is new. You have never before paid to stay still.",
        "At twenty to five the light on the arm stops flashing and it goes up, slowly, like something being allowed."
      ],
      plow: [
        "The plow driver looks down out of his cab at the four cars, and at you, and holds up one finger: one of you, behind me, close. Then he drops the blade.",
        "For an hour you are a pair of tail lights. That is your whole world: two red lights and a strobe, forty feet ahead, in a white that has no top or bottom or sides. You do not look at anything else because there is not anything else.",
        "Then the white goes thin, and then it is gone all at once, as if you had driven out of a building, and there is the sun, low, and the plow pulling off at a crossroads, and the driver's arm out of the window, flat, pointing you west."
      ],
      plow_lost: [
        "You are behind him for twenty minutes. Then a gust comes across that takes the tail lights away as cleanly as a hand over a lamp, and when it passes they are not there.",
        "You stop. You do not decide to. You sit in the lane in the white with the hazards going and the engine running and no idea where the edges are, and you run the heater, and you wait, because moving is how people end up in the field.",
        "It is forty minutes before a second plow comes through, slowly, and finds you with its lights. Its driver does not get out. He just waits for you to fall in behind."
      ],
      around: [
        "There is room on the shoulder. You take it at walking pace with two wheels in the snow, past the end of the arm and the flashing light, and none of the people in the four cars looks at you, very deliberately.",
        "Then you are in it. You drive eleven miles at nine miles an hour with the window down and your head out, steering by the rumble strip under the right-hand wheels, the only part of the road you can find.",
        "When you come out the far side your face does not work properly for an hour. You got away with it. You know the difference between that and having been right."
      ]
    }
  },

  // 07 — RUGBY. The geographical centre of North America, in a parking lot.
  hl_007: {
    location: "Rugby, ND — US 2 and Highway 3",
    tags: ["travel","money","quiet"],
    mile: 225,
    heading: "Minot",
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.ditched_blizzard) base.push("You went around the gate, and the road took the car away from you for a while and then, for reasons of its own, gave it back. Your hands have not finished shaking about it.");
      else if (s.flags.lost_plow) base.push("You keep checking the mirror for tail lights. There is nothing to follow now. The road is clear and you can see for nine miles and you keep checking.");
      else if (s.flags.followed_plow) base.push("For an hour your whole world was two red lights and a strobe. The road is wide open now and you keep looking for something to follow.");
      else if (s.flags.waited_gate) base.push("The afternoon is three hours shorter than it was meant to be, and the sun is already low and orange in the windscreen.");
      base.push(
        "At Rugby, at the crossroads, in the car park of a Mexican restaurant, there is a stone cairn about fifteen feet high with a sign on it.",
        HL_SIGN.white(['GEOGRAPHICAL CENTER', 'OF NORTH AMERICA', 'RUGBY, N.D.']),
        "This is the middle. Halfway between the oceans, halfway between the Arctic and the Gulf. As far as you can get on this continent from anywhere the water goes.",
        "A smaller sign beside it, put up later by somebody conscientious, explains that the actual centre is some miles from here. Fifteen miles, by the old figures. By the newer ones, a hundred and something, near a town that is called Center for unrelated reasons. A bar in another town trademarked the title for a few years. The cairn was moved once, to widen the road.",
        "So this is where they agreed to put the middle. It is a pile of fieldstone in a parking lot with a flagpole on either side, and it is twenty below, and nobody else is looking at it.",
        "Across the highway the railroad runs dead straight in both directions, and there is a brick depot with a light on."
      );
      return base;
    },
    choices: [
      { text: "Fill up at the crossroads", sub: (s) => pumpSub(s, { rate: 0.28 }, "Minot is sixty-six miles."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.28 }, next: "hl_007" },
      { text: "Get out and stand at the centre", sub: "Engine running — costs a little fuel. You have come this far to the middle.", type: "neutral", showIf: (s) => !s.flags.stood_centre, next: "hl_007", deltas: { tank: -2 }, outcome: "centre", flags: { stood_centre: true } },
      { text: "Walk over to the depot", sub: "Engine running — costs a little fuel. The light is on and there is a rack by the door.", type: "neutral", showIf: (s) => !s.flags.took_timetable, next: "hl_007", deltas: { tank: -2 }, outcome: "depot", flags: { took_timetable: true } },
      { text: "West", sub: "Safe — an hour to Minot, into the sun.", type: "safe", next: "hl_008" }
    ],
    outcomes: {
      centre: (s) => [
        "You stand with one hand on the fieldstone. It is so cold the stone feels dry.",
        "The middle of a continent turns out to feel like nothing in particular. There is wind. There is a restaurant. A semi goes through on 2 without slowing down, because the driver has been through the middle before.",
        hlBeen(s, 'coast') && hlBeen(s, 'south')
          ? "You have stood at two of the edges of this. You stood at a seawall on the Gulf, and you drove across a red bridge with the Pacific under it. This is the point that is furthest from both, and somebody marked it with rocks from a field."
          : hlBeen(s, 'coast') ? "You have stood at one edge of this, where the road ran out at the Pacific. This is as far from that as the land goes."
          : hlBeen(s, 'south') ? "You have stood at one edge of this, where a road ran out at the Gulf. This is as far from that as the land goes."
          : "Somewhere a very long way off in every direction there is an edge. You have not seen one. You are told they are there."
      ],
      depot: [
        "The depot is brick, 1907, with a waiting room that has the original benches and one woman behind glass who looks up as though you might be a passenger.",
        "The train comes through here twice a day, she says, once each way. The westbound at something after four in the morning, when it is on time, which is a thing she says without any expression at all.",
        "There is a rack of timetables by the door, free. You take one. Every town on it is a town on your road, in the same order, each with a time beside it. Fargo. Grand Forks. Devils Lake. Rugby. Minot. On and on down the page, and off the bottom of it.",
        "It is a schedule for doing exactly what you are doing, in the dark, asleep, with a dining car."
      ]
    }
  },

  // 08 — THE MISSILE FIELDS. A fenced square in a wheat field.
  hl_008: {
    location: "US 2 West — east of Minot",
    tags: ["quiet","tension"],
    mile: 262,
    paywall: false,
    textFn: (s) => {
      const base = [
        "The sun goes down in the windscreen for forty minutes. Out here it does not set so much as land.",
        "In the last of it you start to see them. A quarter mile off the highway, in the middle of a field of stubble, a square of chain-link fence about the size of a tennis court. Inside the fence, nothing. A concrete slab, a couple of white poles, a light. A gravel road running out to it from the section line, ploughed.",
        "Then another one, eight miles on, on the other side. Then another.",
        "There is no sign on the highway. There is a small one on the fence, too far away to read. Everybody out here knows what is under the slab and has known since they were children, and they farm around it. The wheat goes right up to the wire.",
        "The gravel road to the next one comes down to the highway at a cattle guard, a hundred yards ahead."
      ];
      if (s.flags.took_timetable) base.push("The timetable on the seat says the train went through here at twenty to six this morning. Everybody on it was asleep.");
      return base;
    },
    choices: [
      { text: "Pull off at the cattle guard and look at it", sub: "Engine running — Nerve check. It is a public road. As far as the cattle guard.", type: "neutral", check: { stat: "nerve", difficulty: 5 },
        success: { next: "hl_009", outcome: "looked", deltas: { tank: -2 }, flags: { saw_silo: true } },
        failure: { next: "hl_009", outcome: "watched", deltas: { tank: -2, nerve: -2 }, flags: { saw_silo: true, was_watched: true } } },
      { text: "Keep driving", sub: "Safe — it is a fence around a slab. The farmers do not look at it either.", type: "safe", next: "hl_009" }
    ],
    outcomes: {
      looked: [
        "You stop at the cattle guard with the lights off and the engine running and look at it for as long as you want to.",
        "It is very plain. That is the thing. A fence, a slab, a light on a pole. It has been sitting there since before you were born with the single most serious object ever made underneath it, and it looks like a place where the county keeps gravel.",
        "A jackrabbit goes along the inside of the wire, stops, and goes on. Nothing else happens. You put the lights back on."
      ],
      watched: [
        "You stop at the cattle guard. You have been there perhaps ninety seconds when a pair of headlights comes on, a long way down the section road, where there had not been a vehicle.",
        "They do not come closer. They just stay on. A white pickup, you think, with something on the roof. It sits there with its lights on you, and you sit there with yours off, and neither of you does anything, for a while.",
        "When you pull back onto the highway it follows, at a quarter mile, for six miles. Then it turns off. It does not hurry at any point. It did not have to."
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // THE FIRST NIGHT, AND DAY TWO — MINOT TO GLASGOW. Mile 291 to 560.
  // A room has a plug. The oil patch charges boom prices. Then Montana, where
  // the state marks its dead beside the road, and Nowhere turns out to be a
  // town with a sign that says it is only the middle.
  // ═════════════════════════════════════════════════════════════════════════

  // 09 — MINOT, EVENING. Where to spend twenty-seven below.
  hl_009: {
    location: "Minot, ND — the strip, evening",
    tags: ["money","night","fork"],
    time: "night",
    mile: 291,
    heading: "Williston",
    paywall: false,
    textFn: (s) => {
      const base = [
        "You see Minot for twenty miles before you are in it: a low orange smear, and then a line of lights, and then a strip of motels and pickup dealers with the river valley falling away behind it.",
        "There is a billboard on the way in that asks WHY NOT MINOT? Everybody in the state knows the rest of it. Freezin's the reason. They say it fondly.",
        HL_SIGN.led('7:12', '&minus;27&deg;F'),
        "It has dropped five degrees since Fargo and the wind has not stopped once."
      ];
      if (s.flags.was_watched) base.push("You look in the mirror as you pull in. There is no white pickup. You look again in the motel lot.");
      else if (s.flags.saw_silo) base.push("Somewhere back there in the dark, a fenced square with a light on a pole, and the wheat going right up to the wire.");
      base.push(
        "The motels all have the posts. A row of them along the front of every lot, each with an outlet, each with a little hinged cover against the snow. A room comes with a post.",
        "The car will not start itself in the morning at this temperature. It either spends the night on a cord or it spends the night running. Those are the two ways."
      );
      return base;
    },
    choices: [
      { text: "Fill up on the strip", sub: (s) => pumpSub(s, { rate: 0.26 }, "Air base prices. Williston is a hundred and twenty-five miles and costs more."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.26 }, next: "hl_009" },
      { text: "Take a room", sub: "Requires $24 — a bed, a shower, and a post to plug into.", type: "safe", requires: { walletMin: 24 }, next: "hl_010", deltas: { wallet: -24, gut: +1, nerve: +2 }, outcome: "room", flags: { slept_room_minot: true } },
      { text: "Ask the clerk what the walks are worth", sub: "Requires $9 — Nerve check. There is a shovel leaning by the door and a foot of drift on the walk.", type: "neutral", showIf: (s) => !s.flags.asked_clerk, requires: { walletMin: 9 }, check: { stat: "nerve", difficulty: 4 },
        success: { next: "hl_010", outcome: "shovel", deltas: { wallet: -9, nerve: +2, gut: -1 }, flags: { asked_clerk: true, shovelled: true, slept_room_minot: true } },
        failure: { next: "hl_009", outcome: "shovel_no", deltas: { nerve: -1 }, flags: { asked_clerk: true } } },
      { text: "Sleep in the car with the engine running", sub: "Free, and not free — it burns fuel all night. You have a blanket and a candle.", type: "neutral", showIf: (s) => !!s.flags.winter_kit, next: "hl_010", deltas: { tank: -10, nerve: -1 }, outcome: "car" },
      { text: "Sleep in the car with the engine running", sub: "Free, and not free — it burns fuel all night, and you have nothing to put over you.", type: "neutral", showIf: (s) => !s.flags.winter_kit, next: "hl_010", deltas: { tank: -10, nerve: -1, gut: -2 }, outcome: "car" },
      { text: "Keep going, tonight, to Williston", sub: "Gut check — a hundred and twenty-five miles of two-lane in the dark, with deer on it and ice under it.", type: "risky", check: { stat: "gut", difficulty: 6 },
        success: { next: "hl_012n", outcome: "night_ok", deltas: { nerve: -1 }, flags: { drove_night_nd: true } },
        failure: { next: "hl_012n", outcome: "night_bad", deltas: { nerve: -3, tank: -5 }, flags: { drove_night_nd: true, night_scare: true } } }
    ],
    outcomes: {
      room: [
        "The clerk gives you a key on a plastic diamond and tells you which post is yours, the way another place would tell you about breakfast.",
        "You plug the car in. The cover on the outlet has a little icicle on its lip. You stand there for a second with your hand on the hood as if it could tell you it was working.",
        "The room has a heater under the window that ticks and a bed with too many blankets, and you use all of them."
      ],
      shovel: [
        "'Fifteen off,' he says, without looking up from the television. 'Both walks and round the ice machine. Salt's in the bucket.'",
        "It takes fifty minutes. The snow is as dry as sand and squeaks, and by the end of the second walk your eyelashes have frozen together twice and you have had to stop and hold your eyes shut with your hand until they let go.",
        "He gives you a key on a plastic diamond and a post. The room is the same room. It feels like more of a room."
      ],
      shovel_no: [
        "'Kid does those,' he says. 'In the morning.' He turns the television up one notch, which is the end of that.",
        "The shovel stays leaning where it is."
      ],
      car: (s) => [
        "You park at the back of the truck stop among the idling semis, where one more engine running all night is not anything anybody will notice.",
        s.flags.winter_kit
          ? "You put the wool blanket over you and the seat back and crack the window a finger's width, the way the man in Fargo said. The windows frost on the inside in ferns."
          : "You put your coat over you the wrong way round, sleeves on your arms, and sit on your feet. The windows frost on the inside in ferns. It is cold in a way that gets into what you think about.",
        "Every two hours you wake and look at the gauge. It is always a little lower. That is all it is doing. It is burning to keep you exactly where you are."
      ],
      night_ok: [
        "The road west of Minot at night is two lanes and a centre line and the reflectors on the delineator posts, going by like a slow count.",
        "Twice there are eyes on the shoulder, green, low, in a row. They do not come out. You drive the whole way with your foot barely on it and your shoulders up round your ears.",
        "Somewhere past Stanley the horizon starts to glow orange, ahead and to both sides, and it is one in the morning and it is not the sun."
      ],
      night_bad: [
        "She comes out of the ditch at a dead run, a whitetail doe, and you do the thing you are not supposed to do and the back of the car comes round on the ice.",
        "It is a long, slow, quiet half turn. There is time to see the whole thing. You end up stopped in the other lane, pointing east, with the engine still running and the doe standing in your headlights looking at you as if you had done something odd.",
        "You sit there. Then you turn the car round in the road, in three goes, with your hands doing it and the rest of you watching, and you drive to Williston at thirty-five."
      ]
    }
  },

  // 10 — MINOT, MORNING. The cord, and whether the car remembers how.
  hl_010: {
    location: "Minot, ND — morning",
    tags: ["travel","money"],
    mile: 291,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.shovelled) base.push("You wake in a room you shovelled for, with your shoulders reminding you. The walk outside the window is already drifting back in, in a neat tongue, from the northwest corner.");
      else if (s.flags.slept_room_minot) base.push("You wake under four blankets with the heater ticking. It takes a moment to work out what state this is. Then you remember the cord.");
      else base.push("You wake in the driver's seat with your neck wrong and frost ferns on the inside of every window. The engine is still running. It ran all night to keep a parking place warm.");
      if (s.flags.slept_room_minot)
        base.push("The car is where you left it, on its post, with frost on the hood everywhere except a dark patch over the engine the size of a dinner plate. That is the block heater. That is most of what the room was for. It starts on the first turn.");
      else
        base.push("Two of the pickups that were not plugged in last night have their hoods up this morning, and a man is going from one to the other with a set of cables, patiently, like a doctor.");
      base.push(
        HL_SIGN.led('7:40', '&minus;31&deg;F'),
        "West of here the land stops being flat and starts to roll, and there is oil under it."
      );
      return base;
    },
    choices: [
      { text: "Fill up before the oil patch", sub: (s) => pumpSub(s, { rate: 0.26 }, "The last ordinary price for three hundred miles."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.26 }, next: "hl_010" },
      { text: "West", sub: "Safe — Stanley, then Williston.", type: "safe", next: "hl_011" }
    ]
  },

  // 11 — STANLEY. The first flare.
  hl_011: {
    location: "Stanley, ND — the edge of the oil patch",
    tags: ["travel","money"],
    mile: 345,
    paywall: false,
    text: [
      "The first one is a mile off the road, in a wheat field. A pump jack, nodding. Then on the next rise there are four, and beside them a steel pipe twenty feet tall with a flame on top of it the size of a house.",
      "It is burning in broad daylight. It burns all the time. It is the gas that comes up with the oil, which there is no pipe to carry and nobody will pay to truck, so they light it. From space this part of North Dakota is brighter than Minneapolis.",
      "The road changes. It has been a highway nobody was on. Now it is a highway everybody is on: water trucks, sand trucks, crude tankers, flatbeds with pipe, crew cabs with a rig company's name on the door, nose to tail in both directions at seventy, and the asphalt under them is broken into plates.",
      "Stanley has a station with a line at the pumps."
    ],
    choices: [
      { text: "Wait in the line and fill up", sub: (s) => pumpSub(s, { rate: 0.30 }, "Oil-patch prices. It goes up again in Williston."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.30 }, next: "hl_012" },
      { text: "Pull onto an approach and watch a flare", sub: "Engine running — costs a little fuel. You can feel it on your face from the road.", type: "neutral", next: "hl_012", deltas: { tank: -2 }, outcome: "flare", flags: { watched_flare: true } },
      { text: "Stay in the traffic", sub: "Safe — seventy, nose to tail, to Williston.", type: "safe", next: "hl_012" }
    ],
    outcomes: {
      flare: [
        "You stop on a field approach two hundred yards from one. It makes a noise like a jet that is not going anywhere. The snow is melted in a perfect circle around the base of the pipe, and inside the circle the grass is green, in January, at thirty below.",
        "There are birds in the circle. Horned larks, a dozen of them, walking about on the green grass in the roar as if it were April.",
        "You put the window down and hold your hand out towards it. It is warm. It is the first warm thing out of doors since Fargo, and it is waste."
      ]
    }
  },

  // 12 — WILLISTON. Boom prices, and an hour's work for cash.
  hl_012: {
    location: "Williston, ND — the truck route",
    tags: ["money","character"],
    mile: 416,
    heading: "Glasgow",
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.drove_night_nd) base.push("You slept four hours in a truck stop lot among two hundred idling diesels, and woke when the sun came through frost.");
      else if (s.flags.watched_flare) base.push("One side of your face is still warm from the flare. It is the side that was towards it. The other side has not forgiven you.");
      base.push(
        "Williston was a farm town of twelve thousand. Then somebody worked out how to get the oil out of the shale, and for some years it was the fastest-growing place in the country, and it has the look of a town that was built in a hurry by people who were not planning to stay.",
        "Man camps: rows of white trailers behind chain-link, with a gate and a guard, out on the edge of town where there were sugar beets. Steel buildings with company names. A strip of new hotels that all opened the same year.",
        "Everything costs a third more than it did in Minot. Nobody is hiding it. A sandwich, a room, a tank of gas."
      );
      if (hlBeen(s, 'coast')) base.push("You have paid this tax before, on a coast, for the view. Here it is for the oil, and there is no view.");
      base.push("At the truck stop a man in a hi-vis coat is standing beside a flatbed trailer loaded with boxes, looking at his phone and then at the boxes, with the particular face of somebody whose help did not show up.");
      return base;
    },
    choices: [
      { text: "Ask him if he needs the trailer unloaded", sub: "Nerve check — an hour of lifting in the cold. The patch pays cash and does not round down.", type: "neutral", showIf: (s) => !s.flags.asked_hotshot, check: { stat: "nerve", difficulty: 5 }, road: +1,
        success: { next: "hl_012", outcome: "unload", deltas: { wallet: +38, gut: -1, tank: -3 }, flags: { asked_hotshot: true, worked_patch: true } },
        failure: { next: "hl_012", outcome: "unload_slow", deltas: { wallet: +14, gut: -1, tank: -3 }, flags: { asked_hotshot: true, worked_patch: true } } },
      { text: "Fill up at boom prices", sub: (s) => pumpSub(s, { rate: 0.33 }, "The next pumps are across the line in Montana, and they are not cheaper."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.33 }, next: "hl_012" },
      { text: "West, to the state line", sub: "Safe — eighteen miles to Montana.", type: "safe", next: "hl_013" }
    ],
    outcomes: {
      unload: (s) => [
        "'You got a back?' he says. That is the interview.",
        "They are valve fittings, forty pounds a box, a hundred and ten boxes, and they go from the trailer to a pallet. " + (s.flags.got_mitts ? "Arlen's mitts take it without complaint. " : "") + "He works the other side and does not talk, and the two of you get a rhythm, and it is done in fifty minutes.",
        "He peels thirty-eight dollars off a roll that is mostly hundreds. 'You looking for work? I can get you on. Start tonight.' He means it. Out here that is how it happens: you lift something, and by evening you live in a white trailer behind a fence.",
        "You say you are going west. He looks west, as if to check that there is one. 'What's out there?' he says. It is a fair question and you do not have the answer."
      ],
      unload_slow: [
        "'You got a back?' he says. You say you do, and for the first thirty boxes you have.",
        "Around forty it goes. Not hurt, just gone, the way a battery goes. He finishes the last half of the trailer mostly himself while you hand him boxes off the tailgate.",
        "He gives you fourteen dollars and a look that is not unkind. 'It's the cold,' he says. 'Takes it out of you before you know.'"
      ]
    }
  },

  // 12n — WILLISTON AT ONE IN THE MORNING. For whoever drove on from Minot.
  hl_012n: {
    location: "Williston, ND — 1:10 AM",
    tags: ["money","night"],
    time: "night",
    mile: 416,
    heading: "Glasgow",
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.night_scare) base.push("Your hands are still doing something on their own, a small fast shake, from the doe.");
      base.push(
        "At night the oil patch is on fire. That is what it looks like. Every rise for forty miles has a flame standing on it, and the underside of the cloud is orange from one horizon to the other, like the sky over a city, and there is no city.",
        "Williston is asleep except for the trucks, which do not sleep. The stations are dark. The one thing lit is a row of pumps under a canopy with no building behind them at all, just a card reader on a post.",
        HL_SIGN.white(['CARDTROL', '24 HR &middot; CARD ONLY', 'NO ATTENDANT'])
      );
      return base;
    },
    choices: [
      { text: "Put the gas card in the reader", sub: (s) => pumpSub(s, { rate: 0.28, fixed: true }, "The one card you have that still works is exactly this kind of card."), type: "neutral", requires: (s) => s.archetype === 'planner' && pumpOpen(s), lockText: (s) => s.archetype !== 'planner' ? "card only, no attendant — and what you have is cash" : pumpClosed(s), pump: { rate: 0.28, fixed: true }, next: "hl_012n" },
      { text: "Sleep in the truck stop lot until it is light", sub: "Engine running for five hours — costs fuel.", type: "neutral", next: "hl_012", deltas: { tank: -8 }, outcome: "lot" }
    ],
    outcomes: {
      lot: [
        "You find a gap between two tankers and put the seat back. The diesels on either side of you idle all night at a note so low you feel it in your teeth, and it turns out a person can sleep inside that.",
        "The orange on the ceiling of the car does not go out. Some time after six it is joined by something paler."
      ]
    }
  },

  // 13 — THE MONTANA LINE. An hour comes back, and the crosses begin.
  hl_013: {
    location: "The Montana line — US 2",
    tags: ["travel","quiet"],
    mile: 434,
    paywall: false,
    textFn: (s) => {
      const base = [
        ...(s.flags.worked_patch ? ["Your back is letting you know about a hundred and ten boxes of valve fittings. You could be living in a white trailer behind a fence by tonight. You keep thinking about how easy it would have been to say yes."] : []),
        "The sign for Montana is a wooden one, brown, with the state cut out of it, and somebody has shot it, some time ago, twice.",
        "There is a second sign for the time zone. It is an hour earlier here. The clock on the dash is wrong now, and you leave it wrong.",
        "The oil stops at the line as if it had been told. The trucks turn off. In ten miles the road is empty again, two lanes and the railroad beside it and the river somewhere to the south, under ice, in a line of cottonwoods. That is the Missouri. Two miles back it took in the Yellowstone. You are going to be beside it, more or less, for two hundred miles, driving up it while it goes down."
      ];
      if (hlBeen(s, 'south'))
        base.push("It goes to Memphis. You have stood beside this same water, a long way down it, at the other end of a year, when it was brown and a mile wide and warm.");
      base.push(
        "And then, on the shoulder, on the right: a white steel cross on a red post, about three feet high. No name on it. Then nothing for six miles. Then two together.",
        "Montana marks the places. One cross for each person, where it happened, kept up by the Legion. They have been doing it since the fifties and they do not take them down."
      );
      if (s.carried && s.carried.saw_turnout)
        base.push("You have stood at crosses before, at a turnout on a grade in Arizona, with your temperature gauge climbing. Those were somebody's own. These are the state's, and they are all the same size.");
      else if (s.carried && (s.carried.took_photograph || s.carried.took_other_photo))
        base.push("The photograph in your visor has a guardrail in it with three things wired to the rail. This is the official version of that.");
      base.push("You start counting them without deciding to. Everybody does.");
      return base;
    },
    choices: [
      { text: "Stop at the two together", sub: "Engine running — costs a little fuel. They are on one post.", type: "neutral", next: "hl_014", deltas: { tank: -2 }, outcome: "crosses", flags: { stopped_crosses: true } },
      { text: "Keep counting from the car", sub: "Safe — Poplar is fifty miles.", type: "safe", next: "hl_014" }
    ],
    outcomes: {
      crosses: [
        "Two crosses on one post, one above the other. The paint on the top one is newer. Somebody has wired a plastic poinsettia to the post, and the wind has taken all the red out of it.",
        "There is nothing here. That is what you notice. No curve, no hill, no intersection. The road is dead straight and dead flat for five miles either way and you can see every foot of it.",
        "It is not a dangerous place. It is just a long way from anywhere, late, and that is enough."
      ]
    }
  },

  // 14 — POPLAR. A card taped in a door, and a line added later.
  hl_014: {
    location: "Poplar, MT — Fort Peck Reservation",
    tags: ["money","character"],
    mile: 487,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.stopped_crosses) base.push("Eleven, since the line. You have not been trying to keep count and you know the number exactly.");
      base.push(
        "The reservation starts without a gate. A sign with the names of the two nations on it, Assiniboine and Sioux, and then the same highway, the same railroad, the same river off to the left.",
        "Poplar is the tribal offices and a college and a school with a gym the size of an aircraft hangar, and a gas station on the highway with two pumps and an index card taped inside the glass of the door.",
        HL_SIGN.card(['NEXT GAS<br>WOLF POINT 22 MI', 'AFTER 6 PM<br>CARDS ONLY'], 'WE MEAN IT')
      );
      if (s.carried && s.carried.asked_card)
        base.push("You have read this card before. Not this one. One in Oregon, in a different hand, with a different last line added later in a different pen. You stand there with your hand on the door for a second.");
      else if (hlBeen(s, 'coast'))
        base.push("There was a card like this in a door in Oregon. You drove past that one without asking.");
      else
        base.push("Somebody added the last line afterwards. The pen is different.");
      return base;
    },
    choices: [
      { text: "Fill up while there is somebody to take cash", sub: (s) => pumpSub(s, { rate: 0.31 }, "The card in the door is not an advertisement."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.31 }, next: "hl_014" },
      { text: "Ask who wrote the last line", sub: "Nerve check — somebody in there tapes cards in doors.", type: "neutral", showIf: (s) => !s.flags.asked_card_mt, check: { stat: "nerve", difficulty: 4 }, road: +1,
        success: { next: "hl_014", outcome: "asked", deltas: { nerve: +1 }, flags: { asked_card_mt: true, storm_told: true } },
        failure: { next: "hl_014", outcome: "asked_bad", flags: { asked_card_mt: true } } },
      { text: "West to Wolf Point", sub: "Safe — twenty-two miles, like it says.", type: "safe", next: "hl_015" }
    ],
    outcomes: {
      asked: (s) => [
        "'Me,' the woman at the till says. 'The first part. My auntie wrote the bottom.'",
        (s.carried && s.carried.asked_card)
          ? "'People read the number,' she says. 'Nobody reads the middle.' You have been told that before, word for word, by a woman ringing up somebody's milk in a town of two hundred people on the Oregon coast. You do not say so. There is no way to say so."
          : "'People read the number,' she says. 'Nobody reads the middle.'",
        "'Every winter somebody comes through at nine at night with forty dollars cash and a quarter tank, and the pumps want a card, and they sit out there with the engine running till it quits.' She slides a pack of gum across to a kid. 'So she wrote that. It didn't help. But she wrote it.'",
        "She looks at the sky through the door, the way people here do, as if it were a clock. 'It's blowing " + (hlStorm() === 1 ? "today out past Wolf Point. They'll have the gate down by two" : hlStorm() === 2 ? "tomorrow, up on the Blackfeet side. Not here" : "back east where you came from. You got through ahead of it") + ".'"
      ],
      asked_bad: [
        "'Been up a while,' the woman at the till says, which is an answer to a different question.",
        "On the way out you read it again. It does say we mean it."
      ]
    }
  },

  // 15 — WOLF POINT. A gym with the whole district in it.
  hl_015: {
    location: "Wolf Point, MT — the high school",
    tags: ["character","money","quiet"],
    mile: 509,
    paywall: false,
    text: [
      "Wolf Point is on a bench above the river with a grain elevator at each end and a bridge to the south, and today it is full. Every street near the high school is parked solid, engines running, exhaust standing up over three blocks like a town on fire.",
      "There is a banner on the gym. It is the district tournament. Eight teams, boys and girls, games from nine in the morning until they are done.",
      "You can hear it from the highway with the windows up. Not the game. The crowd: a noise that goes up, hangs, and comes down all at once.",
      "Admission is on a card table inside the door, with a cash box and a woman in a team jacket."
    ],
    choices: [
      { text: "Pay and go in for a quarter", sub: "Requires $4 — it is seventy degrees in there and there is frybread at the concession. The car idles outside.", type: "neutral", requires: { walletMin: 4 }, next: "hl_016", deltas: { wallet: -4, gut: +1, nerve: +2, tank: -3 }, outcome: "game", flags: { saw_game: true, storm_told: true } },
      { text: "Fill up on the highway", sub: (s) => pumpSub(s, { rate: 0.30 }, "Glasgow is fifty miles, and there is a gate on the way."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.30 }, next: "hl_015" },
      { text: "West", sub: "Safe — you can hear it. You do not need to see it.", type: "safe", next: "hl_016" }
    ],
    outcomes: {
      game: (s) => [
        "It is the loudest room you have been in since you left. Two thousand people on wooden bleachers, grandmothers in the front row in star quilts, small children running along the baseline between plays, and on the floor ten girls playing faster than you knew the game went.",
        "There is no shot clock in anybody's head. They get the ball and they run. A girl who cannot be five foot four takes it the length of the floor through four people and lays it in, and the whole gym comes up off the bleachers like something breaking the surface.",
        "The man next to you gives you half his frybread without looking away from the floor and tells you which one is his niece. Then, in the same breath: " + (hlStorm() === 1
          ? "'You going west? Not this afternoon you're not. It's blowing past the gate right now.'"
          : hlStorm() === 2 ? "'You going west? You're all right today. It's tomorrow it blows, up past Cut Bank.'"
          : "'You come from the east? Heard they shut Devils Lake yesterday. You must have been right in it.'"),
        "You stay for the quarter, and then, somehow, for the half."
      ]
    }
  },

  // 16 — THE SECOND GATE. West of Wolf Point.
  hl_016: {
    location: "US 2 West — the gate west of Wolf Point",
    tags: ["danger","fork"],
    mile: 512,
    paywall: false,
    textFn: (s) => {
      const shut = hlStorm() === 1;
      const base = [];
      if (s.flags.saw_game) base.push("Your ears are still ringing from the gym. Out here there is only the wind, and it sounds thin after that.");
      base.push("The gate at the west end of Wolf Point stands beside the highway on its post, where the last house is.");
      if (shut) {
        base.push(
          "It is down.",
          HL_SIGN.closed('NO TRAVEL &middot; GROUND BLIZZARD'),
          "Beyond it the road runs out along the river bench for a quarter of a mile and then goes into a white wall as flat-fronted as the side of a building. Above the wall the sky is blue and there is a hawk in it. Underneath, fifty feet deep, the snow of the whole county is travelling east.",
          s.flags.storm_told
            ? "You were told. That does not open it."
            : "Nobody told you. You did not stop anywhere long enough to be told.",
          "A stock truck and two cars are waiting. Back in town, the gym is still going. On the far side of the arm a state plow is parked with its wing up."
        );
      } else {
        base.push(
          "It is up. The arm is bolted back and the light on the end of it is dark, and past it the road goes out along the bench above the river as clear as a ruled line.",
          s.flags.storm_told ? "Not this one. Not today." : "You drive through the place where it would be."
        );
      }
      return base;
    },
    choices: [
      { text: "Go back and wait it out at the tournament", sub: "Requires $4 — two more games. The car idles on the street with the others.", type: "neutral", showIf: () => hlStorm() === 1, requires: { walletMin: 4 }, next: "hl_017", deltas: { wallet: -4, nerve: +1, tank: -5 }, outcome: "gym", flags: { waited_gate: true } },
      { text: "Wait it out in the car", sub: "Engine running for three hours — costs fuel, and nothing else.", type: "neutral", showIf: () => hlStorm() === 1, next: "hl_017", deltas: { tank: -7, nerve: -1 }, outcome: "car", flags: { waited_gate: true } },
      { text: "Follow the plow when it goes", sub: "Gut check — keep its lights and you are through. Lose them and you are not.", type: "risky", showIf: () => hlStorm() === 1, check: { stat: "gut", difficulty: 5 },
        success: { next: "hl_017", outcome: "plow", deltas: { nerve: +1 }, flags: { followed_plow: true } },
        failure: { next: "hl_017", outcome: "plow_lost", deltas: { nerve: -2, tank: -6 }, flags: { followed_plow: true, lost_plow: true } } },
      { text: "Go around the gate", sub: "Nerve check — the shoulder is wide enough. The gate is there for a reason.", type: "risky", showIf: () => hlStorm() === 1, road: -2, check: { stat: "nerve", difficulty: 7 },
        success: { next: "hl_017", outcome: "around", deltas: { nerve: -1 }, flags: { went_round_gate: true } },
        failure: { strand: true, strandReturn: "hl_017", flags: { went_round_gate: true, ditched_blizzard: true } } },
      { text: "West", sub: "Safe — the arm is up.", type: "safe", showIf: () => hlStorm() !== 1, next: "hl_017" }
    ],
    outcomes: {
      gym: [
        "You watch two more games from the top row with your coat off. The second one goes to overtime. By the end of it you know the names of four players and have opinions about the officiating.",
        "Somebody's uncle comes up the bleachers at a quarter to five and says the gate is up, to nobody in particular, to the section. Half the section leaves. The other half stays for the boys."
      ],
      car: [
        "You sit at the arm with the heater going and watch the wall. A tumbleweed comes out of it, crosses the highway, and goes into the ditch. Then nothing does.",
        "The needle comes down while you sit. You are paying for an afternoon you are not using.",
        "At a quarter to five the light on the arm goes out."
      ],
      plow: [
        "The plow driver points at you and then at his own tailgate. Then he goes.",
        "It is like being towed through milk. Two red lights and a flasher, close enough to read the mud flaps, and outside that nothing at all, not even the hood of your own car. Once the lights swing left and you swing left without knowing why and something the size of a cow goes by on the right.",
        "It lets go of you all at once, twelve miles on. The plow pulls over. His arm comes out of the window and points west and stays there until you are past."
      ],
      plow_lost: [
        "You have him for six miles. Then he goes through a drift that has come in since the last pass and it explodes over his blade and when it clears he is not there.",
        "You stop in the lane. Hazards. Heater. You can hear the wind taking the snow across the hood and you cannot see the hood.",
        "You are there most of an hour before a pair of lights comes up behind you, slowly, and sits, and waits for you to understand that you are meant to follow."
      ],
      around: [
        "You take the shoulder past the end of the arm with the stock truck driver watching you do it. He does not shake his head. He does not need to.",
        "It is fourteen miles of white. You do it at eight miles an hour with your head out of the window and your right wheels on the rumble strip, and twice the strip stops and you stop with it until you can find it again with your hand out of the door.",
        "When the air clears, near a place called Frazer, you pull over and put your forehead on the wheel. You were not right. You were let off."
      ]
    }
  },

  // 17 — GLASGOW. Nowhere, with "middle of" in front of it.
  hl_017: {
    location: "Glasgow, MT — the middle of nowhere",
    tags: ["money","character","quiet"],
    mile: 560,
    heading: "Havre",
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.ditched_blizzard) base.push("You went round a gate into a ground blizzard, and it put the car in the field and somebody had to come and get you out of it. You are driving like a person carrying a full glass.");
      else if (s.flags.lost_plow) base.push("For an hour back there you were parked in a highway lane inside a cloud. You keep finding that you are holding the wheel too hard.");
      else if (hlStorm() === 1 && s.flags.followed_plow) base.push("You came through the white behind a plow, close enough to read its mud flaps. The driver's arm, pointing west, is still in your head.");
      base.push(
        "Glasgow was named by a railroad man who spun a globe and put his finger on it. So were most of the towns on this line. Malta. Havre. Harlem. Zurich. Inverness. Kremlin. There is hardly a place between here and the mountains that is named for itself.",
        "Some years ago somebody at a newspaper worked out which town in the lower forty-eight states was the furthest from everything: four and a half hours, in any direction, to a city of any size. It was this one. The town thought about being offended and then put it on the welcome sign.",
        HL_SIGN.white(['WELCOME TO THE', 'MIDDLE OF NOWHERE', 'GLASGOW, MONTANA']),
        "You have been driving towards that word for two days without a number on it. Here it is. And it says middle.",
        "There is an elevator by the tracks with a line of grain trucks at the scale, a bar on Front Street with its beer sign on, and a station on the highway."
      );
      return base;
    },
    choices: [
      { text: "Ask at the elevator if they need a hand at the pit", sub: "Nerve check — an hour on a grain shovel in the cold. Pays cash at the scale.", type: "neutral", showIf: (s) => !s.flags.asked_elevator, check: { stat: "nerve", difficulty: 4 }, road: +1,
        success: { next: "hl_017", outcome: "pit", deltas: { wallet: +28, gut: -1, tank: -3 }, flags: { asked_elevator: true, got_scale_ticket: true } },
        failure: { next: "hl_017", outcome: "pit_no", deltas: { nerve: -1 }, flags: { asked_elevator: true } } },
      { text: "Go into the bar on Front Street", sub: "Requires $3 — a beer you do not have to finish. The car idles at the kerb.", type: "neutral", showIf: (s) => !s.flags.saw_matches, requires: { walletMin: 3 }, next: "hl_017", deltas: { wallet: -3, nerve: +1, tank: -2 }, outcome: "bar", flags: { saw_matches: true } },
      { text: "Fill up in the middle of nowhere", sub: (s) => pumpSub(s, { rate: 0.30 }, "Malta is sixty-nine miles. Havre is a hundred and fifty-eight."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.30 }, next: "hl_017" },
      { text: "West. It is only the middle.", sub: "Safe — the road goes on past the sign as if the sign were not there.", type: "safe", next: "hl_018" }
    ],
    outcomes: {
      pit: (s) => [
        "The man at the scale house looks at you through the slider. 'Pit's froze,' he says. 'Grate's iced over. You want to chip, chip.'",
        "So you chip. A steel bar and a scoop shovel, down at the grate where the trucks dump, breaking ice out of the gaps so the wheat will go through. Every truck that pulls on pours forty thousand pounds of spring wheat past your boots in a noise like surf, and the dust comes up gold in the cold and hangs. " + (s.flags.got_mitts ? "The mitts were made for a bar like this one. Maybe for this one." : ""),
        "After an hour he waves you up and pays you out of the scale-house drawer, twenty-eight dollars, and tears a ticket off the printer for the last truck across and hands you that too, because you were standing there.",
        "Gross, tare, net. A date and a time. It is a piece of paper that says precisely what something weighed. You fold it once and keep it."
      ],
      pit_no: [
        "The man at the scale house looks at you through the slider, and at your shoes.",
        "'Insurance,' he says, and shuts the slider, which lets out about a quart of warm air."
      ],
      bar: (s) => [
        "It is one long room with a back bar that came up the river on a steamboat and three men at the far end who have been there since the elevator opened. Nobody turns round. The bartender sets a beer down in front of you before you have got your coat off.",
        "On the bar there is a brandy snifter the size of a fishbowl, full of matchbooks. People bring them. It is what you do here: you come back from somewhere and you drop the matches in the bowl. Reno. Minneapolis. A hotel in Calgary. A steakhouse in Omaha.",
        hlBeen(s, 'southwest')
          ? "You turn a few over. One of them is from the Desert Rose Diner, Barstow, California. You have sat in a booth there with a bad cup of coffee, deciding how much breakfast you could afford. You hold it for a while. Then you put it back in the bowl, exactly where it was."
          : "You turn a few over. One of them is from the Desert Rose Diner, Barstow, California. You have never been there. Somebody from here has. They went all that way and came back to the middle of nowhere and brought matches.",
        "'Furthest from anything,' the bartender says, seeing you look. 'They measured.' He says it with some satisfaction. 'Doesn't feel like it from here. From here it's everything else that's a long way off.'"
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // THE MIDDLE, THE SECOND NIGHT, AND DAY THREE — GLASGOW TO CUT BANK.
  // Mile 560 to 846. A rock the highway department moved. A battlefield forty
  // miles short of a line. A car under snow in Havre, plugged in.
  // ═════════════════════════════════════════════════════════════════════════

  // 18 — SLEEPING BUFFALO. A boulder in a shed beside the highway, moved there.
  hl_018: {
    location: "Sleeping Buffalo, MT — US 2 at Highway 243",
    tags: ["quiet","money"],
    mile: 602,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.got_scale_ticket) base.push("There is wheat dust in the seams of your coat. It will be there for the rest of the coat's life.");
      else if (s.flags.saw_matches) base.push("From here it is everything else that is a long way off. You keep turning that over.");
      base.push(
        "The road follows the Milk River now, which is the colour its name says in summer and is a strip of ice in a strip of willows today.",
        "At a junction with nothing at it, beside the highway, there is an open-fronted shed with a low fence, and under the shed roof there are two grey boulders.",
        "One of them is the shape of a buffalo lying down with its legs under it. Somebody a very long time ago cut the ribs into it, and the horns, and the line of the back, and the stone has worn until the cuts look as if they grew there.",
        "It sat on a ridge above the river with others like it. From a distance they looked like a herd resting, and the people who lived here knew which ridge and did not pass it without stopping. In 1967 the highway department moved it. It has been moved more than once. It has been here, in a shed, at a junction, since the eighties.",
        "People still stop. Along the top of the stone and on the ground in front of it there is tobacco, loose and in pouches, and coins, and a few strips of coloured cloth tied to the fence. The state asked the tribes what they thought of where it sits. They said, in different words, that it is not comfortable there. And that it is powerful anyway."
      );
      if (s.flags.stood_centre && s.carried && s.carried.took_cove)
        base.push("A lighthouse flown in by helicopter. The middle of a continent, shifted to widen a road. Now this. You have started to notice how many things on these roads are not standing where they stood.");
      else if (s.flags.stood_centre)
        base.push("The cairn at Rugby was moved to widen a road, too. Things out here get put where the highway can use them.");
      if (s.carried && s.carried.took_glass)
        base.push("There is a piece of blue glass in a coat pocket somewhere that a sign on a beach asked you to leave. There is no sign here. Nobody is asking anything. That turns out to be harder.");
      base.push("A mile down the side road there is steam coming up out of the snow: a hot spring, with a pool, and a hand-painted price.");
      return base;
    },
    choices: [
      { text: "Leave something", sub: "Requires $1 — a coin from your pocket, on the ground with the others. The car idles.", type: "neutral", requires: { walletMin: 1 }, road: +1, next: "hl_019", deltas: { wallet: -1, tank: -2 }, outcome: "left", flags: { left_offering: true } },
      { text: "Stand at the fence and leave nothing", sub: "Engine running — costs a little fuel.", type: "neutral", next: "hl_019", deltas: { tank: -2 }, outcome: "stood" },
      { text: "Go down the side road and get in the hot water", sub: "Requires $8 — a hundred and six degrees, outdoors, at twenty below. The car idles.", type: "neutral", requires: { walletMin: 8 }, addMiles: 2, next: "hl_019", deltas: { wallet: -8, gut: +2, nerve: +1, tank: -3 }, outcome: "spring", flags: { soaked_spring: true } },
      { text: "West", sub: "Safe — Malta is twenty-seven miles.", type: "safe", next: "hl_019" }
    ],
    outcomes: {
      left: [
        "You do not know the right way to do it. You suspect that not knowing is the correct amount to know. You put a coin on the frozen ground among the others, a little apart, and take your hand away.",
        "Nothing happens. The wind goes through the shed. A semi goes by on 2 and the cloth on the fence stands straight out and then falls.",
        "You stand there a moment longer than the cold wants you to. Then you go back to the car, which has been running the whole time, waiting, like a horse."
      ],
      stood: [
        "You stand at the fence with your hands in your sleeves. It is a rock. It is very clearly more than a rock to a great many people, and you are not one of them, and you do not pretend to be.",
        "You look at it the way you would stand at the back of somebody else's church. Then you go."
      ],
      spring: [
        "The pool is outdoors, in a fog of its own making so thick you cannot see the far side. You cross ten feet of ice in bare feet at twenty below, which is the longest ten feet of the trip, and then you are in to the neck.",
        "It is a hundred and six. The water came up from a mile down, where a crew drilling for oil in the twenties hit it instead and were disappointed. Your hair freezes solid while the rest of you cooks.",
        "There are two old men in there already, up to their chins, talking about a bull. They nod. One of them says, 'Cold enough for you?' and the other one laughs, as he must have every day of his life.",
        "It is the first time in three days that all of you has been warm at once."
      ]
    }
  },

  // 19 — MALTA. The train goes by with its lights on.
  hl_019: {
    location: "Malta, MT — the crossing",
    tags: ["travel","money"],
    mile: 629,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.soaked_spring) base.push("Your hair thaws in the car and runs down your neck. You do not mind at all.");
      else if (s.flags.left_offering) base.push("There is a coin of yours on the ground in a shed twenty-seven miles back. It was not much. It is not nothing.");
      base.push(
        "Malta. Named off a globe, for an island in a warm sea. It has a dinosaur museum, shut until May, and an elevator, and the tracks running through the middle of it beside the highway, as they have run beside the highway since Grand Forks.",
        "You have stopped seeing the railroad. It is always there, on the left, a hundred yards off, on its own embankment. Freight trains two miles long have passed you all the way across, three engines on the front, coal and grain and containers stacked two high, and you have stopped counting those as well.",
        "At the crossing in the middle of town the lights are going and the arms are down, and from the east something is coming that is not a freight."
      );
      return base;
    },
    choices: [
      { text: "Wait at the arms and watch it go through", sub: "Engine running — costs a little fuel. It will not stop here. It does not stop here.", type: "neutral", showIf: (s) => !s.flags.saw_train, next: "hl_019", deltas: { tank: -1 }, outcome: "train", flags: { saw_train: true } },
      { text: "Fill up in Malta", sub: (s) => pumpSub(s, { rate: 0.31 }, "Havre is eighty-nine miles."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.31 }, next: "hl_019" },
      { text: "West", sub: "Safe — Dodson, Harlem, Zurich, Chinook.", type: "safe", next: "hl_020" }
    ],
    outcomes: {
      train: (s) => [
        "Two engines, and then silver cars, double-decked, with a stripe down them and every window lit.",
        s.flags.took_timetable
          ? "The timetable says this is Number 7, the westbound, due through Malta at 1:25 in the afternoon. It is ten past four. It has been late since Minneapolis."
          : "It is a passenger train. You had forgotten there were any. It runs the whole length of this road once a day each way, and this is the one going your way.",
        "It goes through at sixty. Sleepers, with the curtains half drawn. A car with a glass roof and people sitting sideways in it, looking out at exactly what you have been looking at for three days, with a drink. Then the dining car: white tablecloths, a waiter with a tray held level, a woman at a window table lifting a fork.",
        "She looks out. She sees a car at a crossing in a town she does not know the name of, with its engine running. She will have forgotten it by the time the fork arrives.",
        "The last car has a red light on the back. The arms go up. The road is exactly as empty as it was."
      ]
    }
  },

  // 20 — CHINOOK. A brown sign pointing south.
  hl_020: {
    location: "Chinook, MT — US 2 and Highway 240",
    tags: ["fork","money"],
    mile: 697,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.saw_train) base.push("Somewhere ahead of you now, already past Havre, a woman is finishing her dinner at sixty miles an hour.");
      base.push(
        "Chinook is named for the wind. A warm one, off the mountains, that comes through in the dead of winter and takes the temperature up forty degrees in an afternoon and eats the snow off the ground while you watch. People here talk about it the way people elsewhere talk about a relative with money.",
        "There is not one today.",
        "In the middle of town a brown sign points south, down a county road that goes out across the bench towards a low blue line of mountains.",
        HL_SIGN.brown(['BEAR PAW BATTLEFIELD', '16 MILES']),
        "The light is getting long. Havre is twenty-one miles west and it will be dark before you get there either way."
      );
      return base;
    },
    choices: [
      { text: "South, to the battlefield", sub: "Sixteen miles down and sixteen back, in the last of the light. The sign mentions one of those.", type: "neutral", addMiles: 16, next: "hl_020a", flags: { went_bearpaw: true } },
      { text: "Fill up in Chinook", sub: (s) => pumpSub(s, { rate: 0.30 }, "Havre is twenty-one miles and has more pumps."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.30 }, next: "hl_020" },
      { text: "West to Havre", sub: "Safe — twenty-one miles, straight into the sun going down.", type: "safe", next: "hl_021" }
    ]
  },

  // 20a — BEAR PAW. Forty miles short of the line.
  hl_020a: {
    location: "Bear Paw Battlefield — Snake Creek",
    tags: ["quiet"],
    mile: 697,
    owed: 16,
    paywall: false,
    text: [
      "The road goes south across grass for sixteen miles and ends at a gravel pull-off with a flagpole and a row of plaques. Nobody is here. There is no building. There is a creek in a shallow coulee, some willows, low hills, and the wind.",
      "In the autumn of 1877 about seven hundred Nez Perce camped in this coulee. They had come eleven hundred and seventy miles, from Oregon, over the mountains and across the whole of Montana, with their children and their old people and two thousand horses, with the army behind them the entire way. They were going to Canada. They thought they had a day in hand.",
      "The line is forty miles north of here. You can very nearly see it.",
      "The army came over that rise on the last morning of September. It lasted five days, in snow. Out in the grass there are steel stakes with names on them, a few dozen, each one where that person fell. That is all there is to look at: grass, and stakes, and a creek.",
      "On the fifth day their chief rode up to that knoll and gave up his rifle. What he said is on the plaque. It ends: from where the sun now stands I will fight no more forever.",
      "Forty miles. You have driven forty miles since lunch."
    ],
    choices: [
      { text: "Walk the loop through the stakes", sub: "Engine running — costs fuel. A mile and a quarter, in the wind, in the last light.", type: "neutral", addMiles: 16, next: "hl_021", deltas: { tank: -3 }, outcome: "walked", flags: { walked_bearpaw: true } },
      { text: "Read the plaques and go back", sub: "Safe — sixteen miles to the highway.", type: "safe", addMiles: 16, next: "hl_021" }
    ],
    outcomes: {
      walked: [
        "The path goes down into the coulee and along the creek. Each stake has a name and nothing else. Some have a second line: a brother, a wife. A few are where a rifle pit was, and you can still see the pit, a shallow scoop in the bank that somebody dug with a knife and a frying pan, in the dark, with the ground freezing.",
        "At some of the stakes there is tobacco. At one there is a child's bracelet, beads on elastic, new.",
        "You are the only person within sixteen miles. The sun goes down behind the mountains they were named for and the wind does not drop. You walk back to the car without having thought of anything adequate, and you understand that this is the right result."
      ]
    }
  },

  // 21 — HAVRE, NIGHT. The second night. And a car in the motel lot.
  hl_021: {
    location: "Havre, MT — the motel on US 2, night",
    tags: ["money","night","fork"],
    time: "night",
    mile: 718,
    heading: "Shelby",
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.walked_bearpaw) base.push("You drove back up from the coulee in the dark with the heater on high and did not turn the radio on.");
      else if (s.flags.went_bearpaw) base.push("Sixteen miles back to the highway in the dusk. Forty miles, they were short by. You did the sixteen in twenty minutes.");
      base.push(
        "Havre is a railroad town. They pronounce it to rhyme with cadaver, and they will tell you so. The yards run for two miles along the highway under sodium lights with engines idling in rows, and the old downtown burned in 1904 and was rebuilt on top of itself, and there is still a street of shops underneath the street.",
        HL_SIGN.led('6:55', '&minus;24&deg;F'),
        "The motel has the posts. Nine cars in the lot, nine orange cords.",
        "The ninth is at the far end, nose-in to its post, under a foot of snow that has not been touched. It has been there a while. It is long and low, and it is not quite a car: a car in front, and behind the cab an open bed with a drift in it."
      );
      if (hlBeen(s, 'southwest'))
        base.push("There is primer on the passenger door. There is a crack in the windshield that has been there long enough to stop spreading. You stop walking. You know the car before you have got as far as wondering.");
      else if (s.carried && (s.carried.knows_cord_name || s.carried.met_cord_cove))
        base.push("A woman in a store on the Lost Coast once told you she had never seen what he drives. You do not know why you think of that now, looking at an old car under snow in Montana.");
      else
        base.push("An El Camino, somebody would call it. Primer on the passenger door. A crack in the windshield. You look at it for longer than a parked car calls for and could not say why.");
      base.push("Somebody has plugged it in. The cord runs from the grille to the post like all the others, and where the plug goes into the outlet the snow has been brushed away, recently, by a hand.");
      return base;
    },
    choices: [
      { text: "Fill up at the yards", sub: (s) => pumpSub(s, { rate: 0.28 }, "Railroad-town prices, the best in Montana."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.28 }, next: "hl_021" },
      { text: "Take a room", sub: "Requires $26 — a bed, and a post next to the one at the end.", type: "safe", requires: { walletMin: 26 }, next: "hl_022", deltas: { wallet: -26, gut: +1, nerve: +2 }, outcome: "room", flags: { slept_room_havre: true } },
      { text: "Ask the night clerk about the car at the end", sub: "Nerve check — it is not your business. He is doing the crossword.", type: "neutral", showIf: (s) => !s.flags.asked_about_car, check: { stat: "nerve", difficulty: 5 },
        success: { next: "hl_021", outcome: "clerk", deltas: { nerve: +1 }, flags: { asked_about_car: true, clerk_told: true, knows_cord_name: true } },
        failure: { next: "hl_021", outcome: "clerk_no", flags: { asked_about_car: true } } },
      { text: "Go down the stairs on First Street", sub: "The bar under the street does not close when it says it does, and somebody down there has a couch.", type: "neutral", showIf: (s) => s.archetype === 'drifter', next: "hl_022", deltas: { nerve: +2, tank: -2 }, outcome: "under", flags: { slept_under_havre: true } },
      { text: "Put what you have on the desk and ask for a post", sub: "Just the plug. He looks at the money, and at you, and at the temperature.", type: "neutral", showIf: (s) => s.archetype === 'broke', next: "hl_022", deltas: { gut: -1 }, outcome: "post", flags: { slept_post_havre: true } },
      { text: "Sleep in the car with the engine running", sub: "Free, and not free — it burns fuel all night. You have a blanket and a candle.", type: "neutral", showIf: (s) => !!s.flags.winter_kit, next: "hl_022", deltas: { tank: -10, nerve: -1 }, outcome: "car" },
      { text: "Sleep in the car with the engine running", sub: "Free, and not free — it burns fuel all night, and you have nothing to put over you.", type: "neutral", showIf: (s) => !s.flags.winter_kit, next: "hl_022", deltas: { tank: -10, nerve: -1, gut: -2 }, outcome: "car" }
    ],
    outcomes: {
      room: [
        "The clerk gives you a key and a post number. Your post is the eighth. You plug in beside the buried car and stand there for a second in the cold, the two cords side by side.",
        "There is no frost-free patch on its hood. Whatever the cord is doing, the engine under there has not run in days.",
        "From the room you can see it through the gap in the curtain, at the end of the row, under the light. You look twice before you sleep. It does not do anything. It is a parked car."
      ],
      clerk: [
        "'That one,' he says. He puts the pen down. 'Been there since the fourth. Paid a week, cash. Haven't seen him since the first night.' He turns the register round with one finger so you can read it. One word, in pencil, where the name goes. Cord.",
        "You ask who plugged it in.",
        "'I did,' he says. 'Walked past it Tuesday and the cord was laying in the snow. You don't leave a car unplugged up here. Doesn't matter whose.' He picks the pen back up. 'He'll want it to start when he comes back for it.'",
        "He says when, not if. You notice that."
      ],
      clerk_no: [
        "'Guest,' he says, without looking up, and fills in a word.",
        "It is a complete answer. You stand there a second and then you go."
      ],
      under: [
        "There is a door on First Street with a stair behind it that goes down under the sidewalk, and at the bottom is what was the town for a year after the fire: a barber's, a bakery, a saloon, all of it still there, under purple glass set into the pavement overhead.",
        "The saloon is the only part still doing business, and not officially. Eleven people, a wood stove, a man playing something slow on a guitar with three of the right strings. Nobody asks what you are doing in Havre. Out here nobody is in Havre for a reason.",
        "A woman who runs the place decides, around midnight, that you are sleeping on the couch by the stove, and tells you so. It is the warmest you have slept since Fargo, and it cost a little gas getting here and nothing else."
      ],
      post: [
        "You put it on the desk. All of it. He does not count it. He looks out through the glass at the bank sign across the road.",
        "'Post six,' he says, and pushes the money back. 'Outlet's on the house. Nobody's car freezes in my lot.' Then, as you are going: 'There's a blanket in the laundry room. Bring it back.'",
        "You sleep in the car, with the engine off, with the block warm and the cab not. It is a long night. But the needle is exactly where you left it in the morning, and that is worth a great deal out here."
      ],
      car: (s) => [
        "You park at the back of the yards among the idling locomotives, which are bigger than houses and do not turn off either.",
        s.flags.winter_kit
          ? "Blanket, window cracked a finger, the candle in its can on the dash for when you wake. You have the routine now."
          : "Coat on backwards, sitting on your feet. You are better at it than you were in Minot. That is not a thing to be proud of.",
        "Every two hours the gauge is a little lower. Somewhere past three a switch engine couples onto a string of cars beside you with a bang that runs away down the train for half a mile, car by car, like a sentence being finished."
      ]
    }
  },

  // 22 — HAVRE, MORNING. A rectangle of bare pavement.
  hl_022: {
    location: "Havre, MT — the motel lot, morning",
    tags: ["travel","money"],
    mile: 718,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.slept_under_havre) base.push("You come up the stair onto First Street at seven with wood smoke in your coat. The purple glass in the sidewalk is under an inch of new frost.");
      else if (s.flags.slept_post_havre) base.push("You take the blanket back to the laundry room, folded. The clerk is not at the desk. The car starts on the first turn, with every drop of fuel it had last night.");
      else if (s.flags.slept_room_havre) base.push("You wake to the heater ticking and go to the gap in the curtain before you have decided to.");
      else base.push("You wake stiff, with frost ferns on the glass, among the locomotives.");
      base.push(
        "The motel lot has eight cars in it.",
        "At the far end, by the ninth post, there is a clean dark rectangle of pavement the size of a long low car, with a foot of undisturbed snow standing round it on three sides in a wall, like a mould that something has been lifted out of.",
        "No tracks. It snowed a little before dawn and covered them. The orange cord is coiled and hung on the post, neatly, the way you would leave it for the next person."
      );
      if (s.flags.clerk_told) base.push("He'll want it to start when he comes back for it, the clerk said. It started.");
      base.push(
        HL_SIGN.led('7:05', '&minus;29&deg;F'),
        "West of Havre the towns get smaller and further apart, and at some point today there will be mountains."
      );
      return base;
    },
    choices: [
      { text: "Fill up at the yards", sub: (s) => pumpSub(s, { rate: 0.28 }, "Chester is sixty-four miles. Fill here."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.28 }, next: "hl_022" },
      { text: "West", sub: "Safe — Kremlin, Gildford, Hingham, Rudyard.", type: "safe", next: "hl_023" }
    ]
  },

  // 23 — RUDYARD. A sign with one sore head on it, and a car on the shoulder.
  // The rehearsal: the route asks, before the end, whether you are someone who stops.
  hl_023: {
    location: "Rudyard, MT — US 2",
    tags: ["character","tension"],
    mile: 758,
    paywall: false,
    textFn: (s) => {
      const base = [
        "Kremlin. Gildford. Hingham. Each one an elevator and a dozen houses and a sign, eight miles from the last one, because that is how far a farmer could haul a wagon of wheat and get home the same day.",
        "Rudyard has a sign of its own.",
        HL_SIGN.white(['RUDYARD', '596 NICE PEOPLE', '&amp; 1 OLD SORE HEAD']),
        "There are not five hundred and ninety-six people in Rudyard and there have not been for a long time. Nobody has changed the number. The sore head is an elected position. They hold a vote.",
        "To the north, standing up out of the plain all by themselves, there are three blue buttes with snow on them. They are the first thing taller than a grain elevator you have seen in seven hundred miles. You are going to be able to see them for the next two hours.",
        "A mile past the sign there is a car on the shoulder with its hazards going. Somebody is in it. The windows are fogged."
      ];
      if (s.flags.owes_the_road || (s.carried && s.carried.owes_the_road))
        base.push("Pay the next one. You were told that once on a shoulder, by a man who was already leaving.");
      return base;
    },
    choices: [
      { text: "Pull in behind it", sub: "Engine running — costs fuel, and maybe more than fuel. You do not know what they need.", type: "neutral", road: +2, next: "hl_024", deltas: { tank: -4, gut: -1 }, outcome: "stopped", flags: { helped_shoulder: true } },
      { text: "Slow down and look for a wave", sub: "Gut check — if they needed something they would be out of the car. Probably.", type: "neutral", check: { stat: "gut", difficulty: 5 },
        success: { next: "hl_024", outcome: "wave" },
        failure: { next: "hl_024", outcome: "no_wave", deltas: { nerve: -1 } } },
      { text: "Keep your speed", sub: "Safe — somebody will stop. Somebody always does, up here.", type: "safe", road: -1, next: "hl_024", flags: { passed_shoulder: true } }
    ],
    outcomes: {
      stopped: (s) => [
        "It is a woman and a boy of about nine, in a sedan with a dead battery, forty minutes into waiting. She has a phone with no bars. The boy has every piece of clothing in the car on top of him and is reading a book about sharks.",
        "You do not have cables. She does. They are in her trunk, where her husband put them, and she has never had the hood of this car open in her life. Neither of you says so. You work it out between you from the diagram on the cable bag, in the wind, with your " + (s.flags.got_mitts ? "mitts off because you cannot do it in mitts" : "gloves off because you cannot do it in gloves") + ", and it takes four tries.",
        "When it catches she puts both hands over her mouth. She tries to give you a twenty and you will not take it and she tries again, and the boy puts the window down two inches and says, 'Mom, he said no,' with the weariness of a person who has watched adults do this before.",
        "She says thank you. And then, because up here it is what you say: 'You'd do the same.' She means that she would. She means everybody would."
      ],
      wave: [
        "You slow to twenty. A hand wipes a circle in the fog on the driver's window and a woman's face looks out. She holds up a phone and nods at it: somebody is coming.",
        "She gives you the smallest wave you have ever seen. One finger, off the wheel. It means: I saw that you slowed down."
      ],
      no_wave: [
        "You slow down. The windows are fogged solid and nobody wipes them. You cannot tell if anyone has seen you.",
        "You are past before you have made up your mind. In the mirror the hazards go on blinking, orange, getting small. A grain truck coming the other way is already putting its signal on."
      ]
    }
  },

  // 24 — SHELBY. A town that bet itself on a prize fight.
  hl_024: {
    location: "Shelby, MT — US 2 and I-15",
    tags: ["travel","money"],
    mile: 819,
    heading: "Cut Bank",
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.helped_shoulder) base.push("Your knuckles are split from the battery clamps. You would do the same, she said. You have been thinking about who taught you that, and when.");
      else if (s.flags.passed_shoulder) base.push("Somebody will have stopped by now. A grain truck was already slowing. You have told yourself that twice.");
      base.push(
        "Chester, and then sixty miles of nothing with the three buttes sliding slowly round to the right of you, and then Shelby, where an interstate comes down from Canada and crosses your road and goes on south without stopping.",
        "In 1923 this town decided to put itself on the map. It offered Jack Dempsey three hundred thousand dollars to defend the heavyweight title here, in a wooden arena it built for forty thousand people, in a town of two and a half thousand. Seven thousand paid. The rest climbed the fence. Dempsey won on points, took the money and was on a train by dark, and four banks failed inside a month.",
        "There is a sign about it. They are rather proud. It is the biggest thing that ever happened here and it happened to them."
      );
      if (hlBeen(s, 'south'))
        base.push("There is a weather report on the radio for Shelby. You once listened to one for Shelby County, Tennessee, from four hundred miles south of it, at night. You wait to hear which this is. He does not say.");
      base.push("West, the plain tilts up. Wind turbines, hundreds, all facing the way you are going.");
      return base;
    },
    choices: [
      { text: "Fill up at the interstate", sub: (s) => pumpSub(s, { rate: 0.30 }, "Truck stop prices. It only goes up from here."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.30 }, next: "hl_024" },
      { text: "West", sub: "Safe — Cut Bank is twenty-five miles, uphill, into it.", type: "safe", next: "hl_025" }
    ]
  },

  // 25 — CUT BANK. A penguin, and the end of the plains.
  hl_025: {
    location: "Cut Bank, MT — the east edge of town",
    tags: ["travel","money"],
    mile: 844,
    heading: "Browning",
    paywall: false,
    text: [
      "At the east edge of Cut Bank, in front of a motel, there is a penguin. It is twenty-seven feet tall and made of concrete and it is standing on a concrete iceberg with a sign.",
      HL_SIGN.white(['WELCOME TO CUT BANK', 'COLDEST SPOT', 'IN THE NATION']),
      "A man who sold appliances built it in 1989 after a night when the wind chill here went to sixty-four below. It used to talk. There was a speaker in it. He sold the motel and moved to Texas and the penguin has not said anything since.",
      "Other towns dispute the claim. Nobody disputes it very hard, today.",
      "And past the penguin, past the town, past the bridge over the gorge the creek has cut: the mountains. You have been watching them come up for an hour as a line of white teeth along the bottom of the sky. Now they are a wall. They go from one side of the windscreen to the other, straight up out of the plain with no foothills at all, as if the country had been folded.",
      "Seven hundred and seventy miles of flat, and then that."
    ],
    choices: [
      { text: "Fill up under the penguin", sub: (s) => pumpSub(s, { rate: 0.31 }, "Browning has a pump. After Browning nothing does."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.31 }, next: "hl_025" },
      { text: "West, at the wall", sub: "Safe — the gate is at the far edge of town.", type: "safe", next: "hl_026" }
    ]
  },

  // 26 — THE THIRD GATE. West of Cut Bank, where the wind comes off the Front.
  hl_026: {
    location: "US 2 West — the gate west of Cut Bank",
    tags: ["danger","fork"],
    mile: 846,
    paywall: false,
    textFn: (s) => {
      const shut = hlStorm() === 2;
      const base = ["The last gate on this road is at the west edge of Cut Bank, where the reservation begins and the land starts to climb."];
      if (shut) {
        base.push(
          "It is down.",
          HL_SIGN.closed('SEVERE CROSSWIND &middot; BLOWING SNOW'),
          "This one is not like the others. It is not a wall. The wind comes off the mountain front here as if somebody had opened a door, sixty and seventy miles an hour, straight across the highway from the left, and it is carrying the snow off thirty miles of prairie in a sheet about four feet deep. You can see the mountains perfectly over the top of it. You cannot see the road.",
          "A semi is parked at the arm with its trailer rocking. The driver is out of the cab, on the lee side, smoking, with the look of a man who has put a trailer on its side once and learned from it.",
          s.flags.storm_told ? "You were told it would be here. Here it is." : "Nobody told you. Nobody had the chance."
        );
      } else {
        base.push(
          "It is up. The wind is from the left and steady and strong enough that you are steering against it, but the road is black and dry and you can see every reflector post all the way to the mountains.",
          s.flags.storm_told ? "Not this one, either. The storm was somewhere behind you." : "You drive under where it would be."
        );
      }
      return base;
    },
    choices: [
      { text: "Wait it out in Cut Bank", sub: "Requires $8 — a cafe with the wind leaning on the windows. The car idles.", type: "neutral", showIf: () => hlStorm() === 2, requires: { walletMin: 8 }, next: "hl_027", deltas: { wallet: -8, gut: +1, tank: -4 }, outcome: "cafe", flags: { waited_gate: true } },
      { text: "Wait it out in the car, in the lee of the semi", sub: "Engine running for three hours — costs fuel.", type: "neutral", showIf: () => hlStorm() === 2, next: "hl_027", deltas: { tank: -7, nerve: -1 }, outcome: "car", flags: { waited_gate: true } },
      { text: "Go when the trucker goes, tucked in behind his trailer", sub: "Gut check — he blocks the wind. Until a gust gets under him.", type: "risky", showIf: () => hlStorm() === 2, check: { stat: "gut", difficulty: 5 },
        success: { next: "hl_027", outcome: "tucked", deltas: { nerve: +1 }, flags: { followed_plow: true } },
        failure: { next: "hl_027", outcome: "tucked_bad", deltas: { nerve: -2, tank: -6 }, flags: { followed_plow: true, lost_plow: true } } },
      { text: "Go around the gate", sub: "Nerve check — thirty-four miles of crosswind you cannot see the bottom of.", type: "risky", showIf: () => hlStorm() === 2, road: -2, check: { stat: "nerve", difficulty: 7 },
        success: { next: "hl_027", outcome: "around", deltas: { nerve: -1 }, flags: { went_round_gate: true } },
        failure: { strand: true, strandReturn: "hl_027", flags: { went_round_gate: true, ditched_blizzard: true } } },
      { text: "West", sub: "Safe — the arm is up. Both hands on the wheel.", type: "safe", showIf: () => hlStorm() !== 2, next: "hl_027" }
    ],
    outcomes: {
      cafe: [
        "The cafe has a window facing west and everybody in it is facing the window. Every so often the whole building takes a gust and settles, and the coffee in the cups shivers, and nobody remarks on it.",
        "A man in a Blackfeet Nation road crew jacket comes in at four, takes his hat off, and says, 'She's laying down.' Half the room puts money on the table and gets up."
      ],
      car: [
        "You park in the shadow of the trailer, where the wind cannot get a grip. The car rocks anyway. Snow goes past the windows flat, like something on a belt.",
        "The needle goes down while you wait for air to stop moving. Then, around four, the trailer beside you stops rocking, and the trucker grinds out his cigarette on the step and climbs up."
      ],
      tucked: [
        "The trucker looks at your car, and at you, and jerks his thumb at the back of his own trailer: there, close, and stay there.",
        "For thirty-four miles you drive four car lengths behind a steel wall, in a pocket of dead air it is dragging along with it, while on either side of you the prairie goes past horizontally. When he moves over, you move over. When his brake lights come on, your foot is already down.",
        "At Browning he pulls onto the scale and you go past him. He does not look. He lifts one finger off the wheel."
      ],
      tucked_bad: [
        "You are tucked in behind him for eleven miles. Then the road comes up onto a ridge and a gust gets under the trailer and it steps sideways, a full lane, like an animal shying, and you are on the brakes and out of the pocket and the wind has the whole side of the car.",
        "It puts you across the centre line and most of the way to the far ditch before the tyres find something. You stop there. The semi's lights go on into the white without you.",
        "You do the rest alone, at fifteen, both hands locked, steering a quarter turn to the left the entire way just to go straight."
      ],
      around: [
        "You go round the end of the arm. The trucker watches you over his cigarette and says nothing, which is the worst thing he could have said.",
        "The wind hits the car broadside like a hand. You drive thirty-four miles leaning the wheel into it with the ground blowing under you so that the road appears to be sliding sideways out from beneath the car, and it takes every piece of attention you own not to follow it.",
        "At Browning you sit in the first parking lot you come to with the engine running and your arms shaking from the shoulders down. You were not right. You were let off."
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // THE LAST AFTERNOON — CUT BANK TO THE DIVIDE. Mile 846 to 903.
  // The last pump. A lodge shut for the winter. Then the top of the country,
  // and a car on the shoulder with its hazards going.
  // ═════════════════════════════════════════════════════════════════════════

  // 27 — BROWNING. The last pump on the road. What you put in here is what you
  // will have at the top, and what you have at the top decides what you can give.
  hl_027: {
    location: "Browning, MT — Blackfeet Nation",
    tags: ["money","character"],
    mile: 880,
    heading: "the Divide",
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.ditched_blizzard) base.push("You went round the last gate, and the wind took the car, and you were got out of it by people who did not ask why you had done it. You have not got much left to be frightened with.");
      else if (s.flags.lost_plow) base.push("Your forearms ache from thirty-four miles of holding the wheel a quarter turn into the wind.");
      base.push(
        "Browning is the capital of the Blackfeet Nation, which has been on this ground since before anybody was counting. The mountains behind the town are theirs. The Backbone of the World, the name is, in translation. From here you can see why nobody felt the need for a second name.",
        "It is the windiest town you have ever stood in. Every sign leans east. The stop signs have a second post behind them as a brace.",
        "In January of 1916 it was forty-four degrees here at noon one day and fifty-six below at noon the next. A hundred degrees in twenty-four hours. It is a record. There is no sign about it. It is just a thing that happened one Tuesday.",
        "There is a station on the highway with four pumps. West of here the road goes up through East Glacier, which is shut for the winter, and then there is the pass, and there is nothing on the pass at all.",
        "This is the last pump."
      );
      if ((s.stats.tank || 0) < 30)
        base.push("The needle is a long way down. It is twenty-three miles to the top, climbing, into the wind. You could make it on what you have. You would arrive with nothing to spare for anything.");
      base.push("Across the lot a man is trying to get a tarp over a load of fence posts on a flatbed, alone, and the wind is taking the tarp away from him every time he gets a corner down.");
      return base;
    },
    choices: [
      { text: "Fill it at the last pump", sub: (s) => pumpSub(s, { rate: 0.33 }, "There is no more after this. Whatever goes in here is what you will have up there."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.33 }, next: "hl_027" },
      { text: "Take the other end of the tarp", sub: "Nerve check — ten minutes in a seventy-mile wind. He will pay something. He has not asked.", type: "neutral", showIf: (s) => !s.flags.asked_tarp, check: { stat: "nerve", difficulty: 4 }, road: +1,
        success: { next: "hl_027", outcome: "tarp", deltas: { wallet: +16, gut: -1, tank: -2 }, flags: { asked_tarp: true, held_tarp: true } },
        failure: { next: "hl_027", outcome: "tarp_bad", deltas: { wallet: +5, nerve: -1, gut: -1, tank: -2 }, flags: { asked_tarp: true, held_tarp: true } } },
      { text: "West, up", sub: "Safe — twelve miles to East Glacier, eleven more to the top.", type: "safe", next: "hl_028" }
    ],
    outcomes: {
      tarp: [
        "You take the upwind corner without saying anything and lie on it. That is the method: you put the tarp down and then you put yourself on top of the tarp, and the other man runs the strap.",
        "It takes ten minutes and four straps. At one point the wind gets under the whole thing and lifts both of you an inch off the load, and he laughs, a short bark, the first laugh you have heard out of doors in three days.",
        "He gives you sixteen dollars. 'Going over?' he says, and looks at the mountains, and then at your car, and then at your gas cap, in that order. 'Fill it,' he says. 'There's a lot of people sitting up there who thought they had enough.'"
      ],
      tarp_bad: [
        "You take the upwind corner and the wind takes it straight back, and you with it, off the side of the flatbed and onto your shoulder on the ice.",
        "He gets it down himself in the end, with you standing on one edge like a sandbag. He gives you five dollars. 'For the weight,' he says, not unkindly."
      ]
    }
  },

  // 28 — EAST GLACIER. Everything boarded. The train does not stop here until spring.
  hl_028: {
    location: "East Glacier Park, MT — the lodge road",
    tags: ["quiet"],
    mile: 892,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.held_tarp) base.push("There's a lot of people sitting up there who thought they had enough. You look at the needle. " + ((s.stats.tank || 0) >= 45 ? "It is all right. You made sure of it." : "It is what it is now."));
      base.push(
        "East Glacier is a summer town. In July there are red buses and people in new boots. Today every building on the main street has plywood over its windows and a drift against its door, and the pumps at the one station have plastic bags tied over the handles.",
        "The depot is across the road, a log building, dark. There is a notice in the window of the door.",
        HL_SIGN.white(['STATION CLOSED', 'TRAINS STOP AT BROWNING', 'UNTIL SPRING']),
        "Behind the depot, at the end of a long lawn that is four feet under, there is the lodge. It is enormous. The railroad built it in 1913 out of fir trees eight hundred years old, sixty of them, forty feet tall, with the bark still on, standing in rows in the lobby like a forest somebody brought indoors. You can see the tops of them through the high windows. There is nobody in it. There will not be until June."
      );
      if (s.flags.took_timetable)
        base.push("The timetable has a small dagger printed beside this town's name, and at the bottom of the page, in very small type, what the dagger means.");
      base.push(
        "The light is going. Above the town the road bends into the trees and starts up, with the railroad beside it, and the two of them go up the creek together towards a gap in the wall that from here does not look like a gap."
      );
      return base;
    },
    choices: [
      { text: "Walk up the lawn and look in at the trees", sub: "Engine running — costs a little fuel. Knee-deep, a hundred yards.", type: "neutral", next: "hl_070", deltas: { tank: -2 }, outcome: "lodge", flags: { saw_lodge: true } },
      { text: "Up", sub: "Safe — eleven miles. It is not steep. It is just the top.", type: "safe", next: "hl_070" }
    ],
    outcomes: {
      lodge: [
        "You wade up the lawn and put your face to a window with your hands round your eyes.",
        "The lobby is three storeys high and nearly dark. The trees stand in it in two rows, each one bigger round than you could reach, going up into the shadow under the roof. Dust sheets on the furniture. A grand piano under a quilt. A stuffed mountain goat on a ledge, looking down at an empty room.",
        "Sixty trees that were standing when nobody on this continent had seen a wheel, cut down and carried here to hold up a roof for three months of the year. It is absurd, and it is the grandest room you have ever looked into, and both of those are true at the same time.",
        "Your breath has frozen on the glass in the shape of your face. You leave it there."
      ]
    }
  },

  // 70 — THE SUMMIT. The Continental Divide, and a car with its hazards going.
  hl_070: {
    location: "Marias Pass, MT — the Continental Divide",
    tags: ["quiet","night","fork"],
    time: "night",
    mile: 903,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.saw_lodge) base.push("Somewhere below you, on a window, there is the shape of your face in frost.");
      base.push(
        "It is not a climb. That is the surprise. The road goes up the creek with the railroad beside it, through lodgepole and snowsheds, for eleven miles at a grade you would hardly call a hill, and then the trees stand back and the ground is level and wide, and that is it. That is the top of the country.",
        "A pullout. A stone obelisk sixty feet tall, standing in the snow by itself. A bronze man in a long coat on a plinth, with a drift on his hat: the engineer who found this gap for the railroad, on foot, alone, in December, in weather like this. And a sign.",
        HL_SIGN.brown(['MARIAS PASS', 'ELEVATION 5213', 'CONTINENTAL DIVIDE']),
        "The snow that falls on the east side of that sign goes down a creek to the Marias River, and the Marias goes to the Missouri, and the Missouri goes to the Mississippi, and the Mississippi goes past Memphis to the Gulf."
      );
      if (hlBeen(s, 'south')) base.push("You have stood at the bottom of that. You parked facing it, because everybody parks facing the water.");
      base.push("The snow that falls on the west side goes down to the Flathead, and the Flathead to the Columbia, and the Columbia goes out to the Pacific over a bar at a town called Astoria, where a man on the radio reads its condition every morning.");
      if (hlBeen(s, 'coast')) base.push("You started a road there once, in fog, under a bridge that went the other way.");
      if (hlBeen(s, 'southwest')) base.push("And you have crossed this same line before. In New Mexico, at night, at seventy, west of a town called Grants. Nobody put up a sign that you noticed. The desert's water was deciding which ocean under your wheels, and you were watching the gauge.");
      base.push(
        "It is the same snow. It lands a foot apart and ends up three thousand miles apart, and the only thing that decides it is which side of a sign it came down on.",
        "The roads were separate. The water says they were one road.",
        "Then you see that you are not alone up here.",
        "At the far end of the pullout, on the shoulder, there is a car with its hazards going. Long, low. A car in front and a truck bed behind. Primer on the passenger door.",
        "There is no exhaust. Every engine you have seen in three days has been running. That one is not.",
        "A man is leaning on the front quarter panel with his arms crossed, looking at nothing in particular down the road. At twenty below. Engine off."
      );
      if (hlBeen(s, 'southwest')) base.push("He was standing exactly like that at a pull-off in the desert, in a hundred and four degrees, a long time ago. You know him before you know the car.");
      return base;
    },
    choices: [
      { text: "Pull in behind him", sub: "He has not waved. He is not going to wave.", type: "neutral", road: +2, next: "hl_071" },
      { text: "Keep your speed", sub: "Safe — somebody will stop. Somebody always does, up here.", type: "safe", road: -2, next: "hl_end_passed" }
    ]
  },

  // 71 — THE DIVIDE. He looks at the objects. Then, for the first time, at you.
  hl_071: {
    location: "Marias Pass, MT — the shoulder",
    tags: ["character","quiet","night"],
    time: "night",
    unlit: true,
    mile: 903,
    paywall: false,
    textFn: (s) => {
      const c = s.carried || {}, objs = c.objects || [];
      const name = (c.knows_cord_name || s.flags.knows_cord_name) ? 'Cord' : 'He';
      const base = [
        "You pull in behind the hazards and you do the thing you have not done since Fargo. You turn the engine off.",
        "The quiet comes down like a lid. The clock on the dash, which has been an hour wrong since the Montana line, says 4:40."
      ];
      if (objs.some(o => o.route === 'southwest' && o.id === 'note'))
        base.push(
          "You take the note out of your shirt pocket, because of the clock. You have unfolded it so many times it opens by itself.",
          "A highway number and a time, in pencil, on a sheet off a motel notepad.",
          "The number is 2. You have been on 2 since Grand Forks. Eight hundred and twenty-five miles, with it in your shirt, and you never once put the two together.",
          "The time is 4:40."
        );
      base.push(
        "You get out. The cold is not like weather any more. It is like a property of the place.",
        name + " does not look round. He does not look surprised either. He looks, as he always has, like your arriving was one of several things he had already thought about.",
        "His hood is cold. There is a red gas can lying on its side in the snow by the rear wheel, with the cap off. He is in a wool shirt and a vest. He has been here a while.",
        "He is never going to say that it will not go. You understand that completely. He has never once in his life asked anybody for anything, and he is not going to start at the top of the continent."
      );
      // He looks at the objects, not at you. One place per thing.
      const says = [];
      objs.forEach(o => {
        const p = ({
          southwest: { note: "Kingman", room_key: "Kingman", receipt: "Needles, or near it" },
          south: { photograph: "Natchez. Off her wall", map: "Natchez. She drew that line herself", receipt: "The Delta" },
          coast: { shell: "Bodega Bay. He gave you that", stone: "Cannon Beach", tides: "Pacific City", penny: "Astoria" }
        }[o.route] || {})[o.id];
        if (p) says.push(p);
      });
      const own = HI_LINE.keepsakeFor(s);
      if (own) says.push(({ mitts: "Lakota. Arlen's", ticket: "Glasgow. The elevator", timetable: "Rugby. The depot" })[own.id]);
      if (says.length) {
        base.push("He comes off the quarter panel and walks past you to your car and looks in through the passenger glass, at the seat, and the dash, and the door pocket. At what is there.");
        // One "he says", then the rest in a single breath: he is reading them off.
        base.push("'" + says[0] + ",' he says." + (says.length > 1 ? " '" + says.slice(1).join(". ") + ".'" : ""));
        base.push("You never told him any of it.");
      } else {
        base.push("He comes off the quarter panel and walks past you to your car and looks in through the passenger glass. There is nothing on the seat. Nothing on the dash. He looks at that for a while, too, as if it were also something a person could carry.");
      }
      // He always knew where you were going and never said where you had been. Here he does.
      const rem = [];
      const sw = c.routes && c.routes.southwest, so = c.routes && c.routes.south, co = c.routes && c.routes.coast;
      if (sw) rem.push(c.paid_it_forward ? "'New Mexico. You put ten dollars on a kid's pump and drove off before he saw who.'"
        : c.hitchhiker_picked_up ? "'The Mojave. Somebody was standing on the shoulder with a hand out, and you stopped.'"
        : c.elcamino_debt ? "'Arizona. You owed me. You don't.'"
        : "'Albuquerque. You got there.'");
      if (so) rem.push(so.ending === 'pascagoula' ? "'Pascagoula. You went down to hear it.'"
        : so.ending === 'pass' ? "'The Pass. You followed a line a woman drew for you to the end of it.'"
        : "'Mobile. The bridge over the bay.'");
      if (co) rem.push(c.wrote_log ? "'Point Reyes. You wrote a number in a book.' He says the number. It is the right number."
        : c.met_cord_cove ? "'Shelter Cove. You asked me about gas.' He looks, for the first time, at his own car. He does not finish the thought."
        : c.took_glass ? "'Fort Bragg.' He looks at your coat pocket. 'They ask you to leave that.'"
        : "'San Francisco. Over the bridge. They sent the bill to somebody.'");
      if (s.flags.helped_shoulder) rem.push("'Rudyard. A woman and a boy.'");
      else if (s.flags.stopped_ditch) rem.push("'A man in a ditch, the first morning. You stopped.'");
      else if (s.flags.went_round_gate) rem.push("'You went round a gate.'");
      if (rem.length) {
        base.push("Then he says where you have been. He has never done that. For four roads he has known where you were going and not said one word about where you had come from.");
        rem.forEach(r => base.push(r));
      }
      if (c.took_jacket && !s.flags.gave_jacket)
        base.push("His eyes go to the back seat. There is a denim jacket there, faded, with a patch on the left shoulder. It has been in the car since a motel in Kingman. He looks at it for a long time, in his shirtsleeves, at twenty below. He does not ask for it. He does not ask for anything.");
      base.push(
        "Then he looks at you. Not at what you are carrying. At you. It is the first time.",
        "He does not say anything. It is your turn. That is all it is."
      );
      return base;
    },
    choices: [
      { text: "Ask him if he wrote the note", sub: "A highway number and a time. Both of them are here.", type: "neutral", showIf: (s) => !s.flags.asked_note && ((s.carried && s.carried.objects) || []).some(o => o.route === 'southwest' && o.id === 'note'), next: "hl_071", outcome: "note", flags: { asked_note: true } },
      { text: "Hand him the jacket", sub: "It was never yours. You took it off a car door in Arizona.", type: "neutral", showIf: (s) => !!(s.carried && s.carried.took_jacket) && !s.flags.gave_jacket, road: +1, next: "hl_071", outcome: "jacket", flags: { gave_jacket: true } },
      { text: "Put some of yours in his", sub: "Twenty points of your tank, through a hose, into his can. You will have less to go down on.", type: "neutral", requires: { tankMin: 25 }, lockText: "you came up here with too little to give any away", next: "hl_end_paid", deltas: { tank: -20 } },
      { text: "Tell him to get in", sub: "It is warm in your car. It will be again in a minute.", type: "neutral", next: "hl_end_rode" }
    ],
    outcomes: {
      note: [
        "You hold it out. He looks at it without taking it. The pencil, the motel's name across the top, the number, the time.",
        "'Good question,' he says.",
        "He does not answer it. He has never answered it. You fold the note along its own crease and put it back in your shirt, and you find that you did not need him to."
      ],
      jacket: [
        "You get it off the back seat and hold it out. He looks at it, and at you, and takes it.",
        "He puts it on. It fits him the way a thing fits that has been worn by one person for twenty years. He does the top button and turns the collar up, and for a second he closes his eyes.",
        "He does not say thank you. He does not say it was his. He just stands there, at the top of the country, in his own jacket, and you understand you have been carrying it all this way to here."
      ]
    }
  },

  // ─── THREE ENDINGS ───────────────────────────────────────────────────────
  // Earned by what you do when it is your turn, and by whether you came up
  // with enough to be generous. His last words, in the two where you stop, are
  // the ones a stranger said to you on a shoulder: pay the next one.

  // PAID — you give him fuel. He goes over the top ahead of you.
  hl_end_paid: {
    location: "Marias Pass, MT — the Continental Divide",
    tags: ["victory","night"],
    time: "night",
    mile: 903,
    paywall: false,
    isVictory: true,
    ending: 'paid',
    arrival: "Marias Pass, MT — the Continental Divide",
    textFn: (s) => {
      const c = s.carried || {};
      const base = [
        "He has a length of hose in the bed, under the drift. Of course he has. He has everything except the one thing.",
        "You do it between you without a word. Your tank, the hose, his can; his can, his tank. Twice. The gasoline is so cold it pours like syrup and smokes where it touches the air. Your fingers stop reporting in after the first minute. His have, clearly, some time ago, and he works the cap with the heels of his hands.",
        "He gets in. The engine turns over slowly, and again, and on the third time it catches, and settles into an idle you would know anywhere: rough, steady, patient, like a man clearing his throat before he does not say something.",
        "The hazards go off.",
        "His window comes down one inch."
      ];
      base.push((c.owes_the_road || s.flags.owes_the_road)
        ? "'Pay the next one,' he says. You have been told that before, on a shoulder, by a stranger with a can who did not wait. You had wondered ever since which one he meant. It was this one. And now there is another."
        : "'Pay the next one,' he says.");
      base.push(
        "The window goes up. He pulls out past you, and over the line, and down the west side. You watch his tail lights until the trees have them. He does not touch the brakes once.",
        "You are standing at the top of the country with a fifth of a tank less than you came up with, and your hands do not work, and you would not take back one drop of it."
      );
      hlRides(s).forEach(r => base.push(r));
      const kept = HI_LINE.keepsakeFor(s);
      if (kept) base.push(kept.line);
      if (s.flags.gave_jacket) base.push("The back seat is empty where the jacket was. It is the first thing you have put down in four roads.");
      base.push(
        "You get back in. You sit a moment with your hands under your arms. The snow is coming down on both sides of the sign, a foot apart, and going to different oceans.",
        "You start the car.",
        "That's enough.",
        "That's the whole thing."
      );
      return base;
    },
    choices: []
  },

  // RODE — he gets in. The objects come off the seat and he holds them.
  hl_end_rode: {
    location: "Marias Pass, MT — the Continental Divide",
    tags: ["victory","night"],
    time: "night",
    mile: 903,
    paywall: false,
    isVictory: true,
    ending: 'rode',
    arrival: "Marias Pass, MT — the Continental Divide",
    textFn: (s) => {
      const c = s.carried || {}, objs = c.objects || [];
      const base = [
        "You open your passenger door and stand there holding it. That is the whole of the offer. You do not say anything, because he would have to answer.",
        "He looks at the open door. He looks back at his own car, once, the hazards ticking orange on the snow. Then he walks over."
      ];
      if (objs.length || HI_LINE.keepsakeFor(s)) {
        base.push(
          "To make room you have to move things. You have not moved them in a long time. Some of them you have not moved since the day they were put there.",
          "You lift them off the seat, out of the cupholder, down from the dash, and you stand there with your hands full and nowhere to set any of it.",
          "He sits. He holds out his hands. You give them to him, one at a time, and he takes each one and sets it in his lap as if it were a thing that could spill."
        );
      } else {
        base.push("There is nothing on the seat to move. He sits, and puts his hands on his knees, and looks at the empty dash. 'Travelling light,' he says. It is not a criticism. It may be the opposite.");
      }
      base.push(
        (s.stats.tank || 0) < 25
          ? "You have not got enough in the tank to give any away. You both know it. This is the thing you had to give instead, and it is not less."
          : "You had enough in the tank to send him on his own way. You opened the door instead. He noticed which.",
        "You leave the El Camino where it is, with its hazards going. Somebody will stop for it. That is how it works up here. It just will not be anybody who knows whose it was.",
        "You go over the line together and down the west side, eleven miles of curves in the dark with the river a long way below, and neither of you says a word, and it is the easiest silence of your life.",
        "At the bottom there is a railroad hotel with one light on. He hands you your things back, one at a time, in the order you gave them. He gets out."
      );
      base.push((c.owes_the_road || s.flags.owes_the_road)
        ? "'Pay the next one,' he says, through the open door. You have been told that before, by a stranger with a can on a shoulder. You had wondered which one he meant. It was this one. And now there is another."
        : "'Pay the next one,' he says, through the open door.");
      base.push("He shuts it. He goes up the steps and does not look back, and the light in the hotel does not change.");
      hlRides(s).forEach(r => base.push(r));
      const kept = HI_LINE.keepsakeFor(s);
      if (kept) base.push(kept.line);
      if (s.flags.gave_jacket) base.push("He was wearing the jacket when he went in. It is the first thing you have put down in four roads.");
      base.push(
        "Everything is back where it rides. The seat is still warm.",
        "You put the car in gear.",
        "That's enough.",
        "That's the whole thing."
      );
      return base;
    },
    choices: []
  },

  // PASSED — you do not slow down.
  hl_end_passed: {
    location: "Marias Pass, MT — the Continental Divide",
    tags: ["victory","night"],
    time: "night",
    mile: 903,
    paywall: false,
    isVictory: true,
    ending: 'passed',
    arrival: "Marias Pass, MT — the Continental Divide",
    textFn: (s) => {
      const c = s.carried || {};
      const base = [
        "You don't slow down.",
        "He does not turn his head as you go by. He is looking at nothing in particular, down the road, with his arms crossed, and you are part of the nothing.",
        "The hazards are in your mirror for as long as the pullout is straight. Orange, orange, orange. Then the road bends and the trees have them."
      ];
      base.push((s.strandings || 0) > 0 || c.stranded_once || c.owes_the_road
        ? "Nobody does, out here. You learned that from the other side, on a shoulder, waiting, counting the ones that did not stop. And then one did."
        : "Somebody will stop. Somebody always does, up here. You have been told so for three days by everyone you met.");
      base.push(
        "You go over the line at fifty. There is no bump. The snow that lands on your hood now is going to the Pacific, and a second ago it was going to the Gulf, and nothing about it feels any different.",
        "Twenty minutes down the west side the radio has it, between the wind and the avalanche report: a single vehicle on the shoulder at the summit, hazards on. No details. He moves on to the weather."
      );
      hlRides(s).forEach(r => base.push(r));
      const kept = HI_LINE.keepsakeFor(s);
      if (kept) base.push(kept.line);
      base.push(
        "Everything you brought is still in the car. Nothing has been moved. Nothing has been put down.",
        "You made it to the top of the country and over, with all of it.",
        "That's the whole thing."
      );
      return base;
    },
    choices: []
  },

  }
};

if (typeof module !== 'undefined') module.exports = HI_LINE;
