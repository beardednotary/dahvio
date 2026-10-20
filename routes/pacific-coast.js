// ═══════════════════════════════════════════════════════════════════════════
// MILE MARKER — ROUTE 3 — PACIFIC COAST RUN
// Astoria, OR → San Francisco, CA · US-101 down the Oregon coast, through the
// redwoods, and CA-1 if you can afford it.
//
// Content module. Same schema as mile-marker-v2.html and routes/deep-south.js.
//
// Voice: the desert was absence. The Delta was presence — too much of
// everything. This is neither. The coast is close weather. You cannot see
// far, what you can see is beautiful, and nothing is wrong. That last part is
// the problem. Route 1 frightens you and Route 2 crowds you; this one is
// pleasant all the way down, and the player should like it.
//
// Mechanic: the drain is fuel, reached by the pumps you drove past. Every
// road worth taking has fewer of them. Node `mile` values are the US-101
// spine; a detour that rejoins pays the difference with `addMiles` on the
// choice, so the odometer tells the truth and the graph stays flat.
//
// STATUS: first slice. Astoria to Cloverdale, mile 0–88, both arms of the
// Three Capes fork. The rest of the spine is in the design spec.
// ═══════════════════════════════════════════════════════════════════════════

const PACIFIC_COAST = {
  id: 'coast',
  label: 'Route 3',
  name: 'Pacific Coast Run',
  start: 'pc_001',
  miles: 721,                 // Astoria→Tillamook→Coos Bay→Brookings→Eureka→Leggett→SF on 101. Measured by Ray.
  tankPerMile: 0.24,          // 721 x 0.24 = 173 fuel. Route 1: 0.23. Burn is deliberately ordinary here — scarcity is the lever, not cost.
  strandReturnDefault: 'pc_003',

  // ── What you came away holding. ─────────────────────────────────────────
  // Coastal objects: free, heavy, useless. Nothing here was bought.
  keepsakeFor: (s) => {
    if (s.flags.took_stone) return {
      id: 'stone', tag: 'STONE', label: 'A stone off a beach in Oregon',
      line: "The stone has been in the cupholder since Oregon. It was wet when you picked it up and it has not looked like that since, and you knew it wouldn't, and you kept it anyway."
    };
    if (s.flags.pressed_penny) return {
      id: 'penny', tag: 'PENNY', label: 'A penny flattened at the Column',
      line: "The flattened penny is in the ashtray with the sand. You can still read part of the river on it if you hold it at the right angle, which you have done twice now at traffic lights."
    };
    if (s.flags.took_tidetable) return {
      id: 'tides', tag: 'TIDES', label: 'A tide table for a month you will not be here',
      line: "The tide table is folded in the door pocket. Highs and lows for a stretch of water you drove past, for weeks you will spend somewhere else."
    };
    return null;
  },

  // ── The radio. Same station. Up here it is mostly about water. ───────────
  // The bar report is real and daily: the mouth of the Columbia is one of the
  // worst river bars on earth and somebody reads its condition out loud every
  // morning for people who are about to cross it. The player is in a car.
  radioBands: [
    { from: 0, to: 150, lines: [
      "The bar report. Conditions at the mouth of the river, read for people who are about to decide something, in the voice of a man who is not going out himself.",
      "A tide table, read as a list. Highs and lows for places along the coast, each one a time and a number, and he gets through nine of them without once saying what any of it is for.",
      "A mill is hiring. He gives the shift, the wage and the phone number, and then he gives the phone number again more slowly, and there is a long pause before the next thing.",
      "A fog advisory for the coast range, which he reads out of a different kind of paper than the one he was reading before. You can hear it. Then music, half a bar in and already going.",
      // The only check-free way to learn the Capes road is broken before you commit to it.
      { text: "Somebody is complaining about the county on behalf of somebody else. A road out by the water, closed again, closed for years. He agrees with her, says the name of the cape, and goes to an ad for a tyre shop.", sets: 'heard_road_closed' }
    ]},
    { from: 150, to: 300, lines: [
      "The crab price at the dock in Newport. He reads it, and then he reads it again, and then he says he is just the one reading it.",
      "Beach conditions. Sneaker waves possible. Then he explains what a sneaker wave is, slowly, the way you would explain it to somebody who had never seen the sea, because every year it needs explaining again.",
      "An elk advisory for 38 east of Reedsport. The herd is down by the road. He reads it the way he reads the weather, which out here is what it is.",
      "A dune rental place reads its own ad. The ad is about freedom. The part after the ad, which he also reads, is about deposits.",
      "A missing hiker, found. He gives the trail and the age and the word 'safe' and then he says it again, and the next thing is a song that has been playing since before he started talking."
    ]},
    { from: 300, to: 450, lines: [
      "The river report for the Rogue. Flows, temperatures, which holes the steelhead are in. He reads it like a man reading out the names of old friends.",
      "A siren test notice. The tsunami sirens along the coast will sound at noon on the first Wednesday of the month, he says. This is only a test. He says the last part twice.",
      "The temperatures along the coast. Brookings, eighty-one. Port Orford, fifty-eight. Forty miles apart. He reads them both in the same voice and does not try to explain it.",
      "A road work notice for 101 south of the state line. One lane, flaggers, delays of up to twenty minutes. He gives the dates, and then gives them again, as though somebody had asked.",
      "A man on a call-in is selling a boat. He describes it for longer than a boat needs. He says it has never let him down. He says it a third time, and then he starts to say why he is selling it, and the line goes quiet."
    ]}
  ],

  // Scenes where the engine is off, or where the prose handles its own sound.
  radioSilent: ['pc_001a', 'pc_c1', 'strand_1', 'strand_end', 'strand_resume'],

  nodes: {

  // ═════════════════════════════════════════════════════════════════════════
  // 01 — ASTORIA. The river mouth. The biggest thing here goes the other way.
  // Teaches the whole route in two dollars: looking costs a little.
  // ═════════════════════════════════════════════════════════════════════════
  pc_001: {
    location: "Astoria, OR — Marine Drive, 7:20 AM",
    tags: ["opening"],
    mile: 0,
    paywall: false,
    text: [
      "Astoria is built on a hill that goes straight into a river four miles wide, and this morning the far side of the river is a rumour.",
      "The bridge to Washington starts at the end of the street and climbs into the fog and does not come out of it. It is the biggest thing in town by a distance and it goes the other way.",
      "You are pointed south. Everything you are going to see is south.",
      "There is a cannery that is a restaurant now, a restaurant that is a brewery now, and a gas station that has been a gas station the whole time.",
      "Up behind the town, on the top of the hill, there is a column with a staircase inside it. A sign on Marine Drive says how to get there and how many steps it is."
    ],
    choices: [
      { text: "Fill up before the bridge-light changes", sub: (s) => pumpSub(s, { rate: 0.26 }, "Town prices. There is gas in Seaside and gas in Tillamook."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.26 }, next: "pc_002" },
      { text: "Coffee and something out of the case", sub: "Requires $4 — the case has been there since six.", type: "neutral", requires: { walletMin: 4 }, next: "pc_002", deltas: { wallet: -4, gut: +1 } },
      { text: "Drive up to the Column", sub: "Two miles up, two miles back. One hundred and sixty-four steps. It is free.", type: "neutral", addMiles: 2, next: "pc_001a" },
      { text: "South on 101", sub: "Safe — the fog is not going to lift for the bridge and the bridge is not where you are going.", type: "safe", next: "pc_002" }
    ]
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 01a — THE COLUMN. Four miles and twenty minutes for a view of weather.
  // Nothing is charged. The lesson is that it cost something anyway.
  // ═════════════════════════════════════════════════════════════════════════
  pc_001a: {
    location: "Astoria Column — 600 feet up",
    tags: ["quiet"],
    mile: 0,
    paywall: false,
    text: [
      "The road up is one lane with turnouts and somebody's hedge on both sides of it. The car park at the top is gravel and nearly empty.",
      "The column itself is a hundred and twenty-five feet of concrete with the history of the state painted around the outside in a spiral, and most of the history is boats.",
      "One hundred and sixty-four steps. They go up the inside in the dark with a handrail that has been held by everybody.",
      "At the top there is a platform and a railing and the entire mouth of the Columbia River, and today the entire mouth of the Columbia River is white.",
      "You can hear the bridge. You cannot see it. Somewhere under the fog a ship is going somewhere and sounding its horn about it, twice, with a long gap.",
      "Down in the car park a machine on a post will flatten a penny for you and put the river on it. It takes quarters."
    ],
    choices: [
      { text: "Put the quarters in", sub: "Requires $1 — fifty-one cents of it is the penny and the quarters.", type: "neutral", requires: { walletMin: 1 }, addMiles: 2, next: "pc_002", deltas: { wallet: -1, gut: +1 }, flags: { pressed_penny: true } },
      { text: "Stand there until the ship sounds again", sub: "Gut check — it is going to be a while and you have somewhere to be.", type: "neutral", check: { stat: "gut", difficulty: 4 }, addMiles: 2,
        success: { next: "pc_002", outcome: "waited", deltas: { gut: +2 } },
        failure: { next: "pc_002", outcome: "didnt", deltas: { gut: -1 } } },
      { text: "Back down to 101", sub: "Safe — you saw it. That was the point.", type: "safe", addMiles: 2, next: "pc_002" }
    ],
    outcomes: {
      waited: [
        "It takes four minutes. You count the first two and then stop counting, which is how you know it worked.",
        "When it comes it is closer than it was, and lower, and there is still nothing to see.",
        "You go down the steps in the dark behind a family who are counting them out loud."
      ],
      didnt: [
        "You give it a minute and a half and then the cold gets into the back of your jacket and you take the steps down two at a time.",
        "In the car park you hear it. From down here it is just a noise a boat makes."
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 02 — CANNON BEACH. Tourist money. The first place things cost more.
  // Also where somebody tells you about pumps, which is the real lesson.
  // ═════════════════════════════════════════════════════════════════════════
  pc_002: {
    location: "Cannon Beach, OR — off US-101",
    tags: ["travel","money"],
    mile: 25,
    paywall: false,
    text: [
      "The road down from Astoria runs through Seaside, which is arcades and saltwater taffy and a promenade, and then through trees, and then there is a turn-off with a sign that has a rock on it.",
      "The rock is two hundred and thirty-five feet tall and standing in the surf about a hundred yards out, and there are birds all over the top of it that are too far away to be birds yet.",
      "The town behind the beach is cedar shingle and galleries and a bakery, and everything in all of it costs about a third more than it would ten miles inland. Nobody is hiding this. It is the arrangement.",
      "The sand is hard and wide and goes a long way in both directions. People are walking dogs on it in weather that is not really weather, just grey with water in it.",
      "At the pump on the way out, the man ahead of you is filling a truck and a jerry can, and he does both without hurrying, and he looks at your plates while he does it."
    ],
    choices: [
      { text: "Walk down to the rock", sub: "Free. Twenty minutes. Your shoes will be wet after.", type: "neutral", next: "pc_003", outcome: "walked", flags: { walked_beach: true } },
      { text: "Pick something up off the sand", sub: "Free — Gut check. Most of what is down there is not worth carrying.", type: "neutral", check: { stat: "gut", difficulty: 5 },
        success: { next: "pc_003", outcome: "stone", deltas: { gut: +1 }, flags: { took_stone: true, walked_beach: true } },
        failure: { next: "pc_003", outcome: "nostone", flags: { walked_beach: true } } },
      { text: "Top up, at Cannon Beach prices", sub: (s) => pumpSub(s, { rate: 0.34 }, "A third more, like everything else here. Tillamook is forty miles."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.34 }, next: "pc_003" },
      { text: "Ask the man with the jerry can why he needs it", sub: "Nerve check — he has already looked at your plates. Fair is fair.", type: "neutral", check: { stat: "nerve", difficulty: 5 }, road: +1,
        success: { next: "pc_003", outcome: "asked", deltas: { nerve: +1 }, flags: { warned_pumps: true } },
        failure: { next: "pc_003", outcome: "asked_bad", deltas: { nerve: -1 } } }
    ],
    outcomes: {
      walked: [
        "It is further out than it looks because there is nothing out there the right size to judge it against.",
        "Up close the birds are birds. Thousands of them, and all of the noise is theirs.",
        "You stand in the wet part until the cold finds your ankles and then you walk back, and the car is further away than the rock was."
      ],
      stone: [
        "Most of it is broken shell and kelp and a shoe. Then there is a stone the size of the inside of your hand, flat, dark grey, with a white seam through it that goes all the way round and meets itself.",
        "It is perfect when it is wet. You already know what it is going to look like dry.",
        "You put it in the cupholder."
      ],
      nostone: [
        "You turn over about forty things and all of them are the same thing.",
        "There is a stone near the end that is almost it, and you pick it up, and the seam goes about a third of the way round and stops.",
        "You put it back where it was, which is a strange thing to be careful about, and you are careful about it."
      ],
      asked: [
        "'Capes road,' he says, like you asked a different question. 'Nothing out there. There's nothing between Netarts and the highway and there hasn't been.'",
        "He screws the cap on the can. 'Folks go round it for the view and come out the other side on fumes. Every summer.'",
        "He says it without any pleasure in it at all, which is how you know it is just true."
      ],
      asked_bad: [
        "He finishes the can, puts it in the bed, and ties it down with a strap he has clearly tied down a thousand times.",
        "'Long way to the next one,' he says, and gets in, and that is the whole conversation."
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 03 — TILLAMOOK. The fork. Last pump before the loop, and the loop does
  // not have one. The sign offers three headlands and does not mention that.
  // ═════════════════════════════════════════════════════════════════════════
  pc_003: {
    location: "Tillamook, OR — US-101 and the Capes turn",
    tags: ["fork","money"],
    mile: 66,
    paywall: false,
    textFn: (s) => {
      const base = [
        "Tillamook is cows. Not as scenery — as the economy. The valley is flat and green and wet and there are more of them in it than there are people in the county, and the whole town smells faintly and permanently of the arrangement.",
        "The cheese factory on the north end has a car park the size of a supermarket's and a viewing window where you can watch blocks of it go past on a belt. There is a queue for ice cream at nine in the morning and the queue is not short.",
        "South of town the road offers you a decision in the form of a brown sign.",
        "THREE CAPES SCENIC LOOP — CAPE MEARES · CAPE LOOKOUT · CAPE KIWANDA",
        "Brown means recreation. It is the colour they use for the things you are not required to do.",
        "The other way is 101, which goes inland through the trees and comes out at Cloverdale in about twenty minutes, and which no sign feels any need to advertise."
      ];
      if (s.flags.warned_pumps)
        base.push("There is nothing between Netarts and the highway, the man at Cannon Beach said, and there hasn't been. He was tying down a jerry can when he said it.");
      else if (s.flags.heard_road_closed)
        base.push("A woman on the radio was annoyed about a road out by the water, closed for years, and the man agreed with her and said the name of one of these capes. You were not paying full attention and you are now.");
      base.push("The pump here is on the corner, before the sign, which is the order those two things come in.");
      return base;
    },
    choices: [
      { text: "Fill up here", sub: (s) => pumpSub(s, { rate: 0.28 }, "Dairy-town prices. The next pump after this is Cloverdale, whichever way you go."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.28 }, next: "pc_003" },
      { text: "Ice cream, at nine in the morning", sub: "Requires $5 — there is a queue and you would be in it.", type: "neutral", showIf: (s) => !s.flags.had_icecream, requires: { walletMin: 5 }, next: "pc_003", deltas: { wallet: -5, gut: +1 }, flags: { had_icecream: true } },
      { text: "Take the Capes loop", sub: "The brown sign. Three headlands and the water the whole way. It comes back to 101 at Cloverdale.", type: "neutral", addMiles: 5, next: "pc_c1", flags: { took_capes: true } },
      { text: "Stay on 101", sub: "Safe — inland through the trees, twenty-two miles, Cloverdale by ten.", type: "safe", next: "pc_004" }
    ]
  },

  // ═════════════════════════════════════════════════════════════════════════
  // C1 — CAPE MEARES. The road up to the lighthouse is closed and has been
  // for years. The route's whole argument, 600 miles early, and free.
  // ═════════════════════════════════════════════════════════════════════════
  pc_c1: {
    location: "Cape Meares, OR — the barricade",
    tags: ["quiet","night"],
    time: "day",
    mile: 70,
    paywall: false,
    textFn: (s) => {
      const base = [
        "The loop road leaves Tillamook along the edge of a bay that is mostly mud at this hour, with pilings in it from something that is not there any more, and the birds standing on the pilings are standing on one leg each.",
        "Then it climbs into trees and the trees close over the top of it.",
        "At Cape Meares the road to the lighthouse is shut.",
        "Not shut this morning. Shut. There are concrete barriers across it and a county sign bolted to the barriers, and the sign has been repainted at least once, and there is moss on the bottom edge of it.",
        "Past the barriers you can see where the surface goes. It does not go level. There is a seam across both lanes where one side of the road has gone down about eighteen inches relative to the other, and then further on it does it again, and the yellow line follows it down both times.",
        "The hill is moving. It has been moving the whole time, the way hills do, which is slowly and without stopping, and the road was put here anyway because of what you can see from the end of it."
      ];
      if (s.flags.heard_road_closed)
        base.push("This is the one. The woman on the radio was right and so was the man who agreed with her and said the name.");
      base.push(
        "You can walk it. People do. There is a path worn around the end of the barriers on both sides and it is worn smooth.",
        "The lighthouse is a mile and a bit down there, and it is the shortest lighthouse in Oregon, and there is a spruce near it that grew sideways out of the cliff and then changed its mind in about six places."
      );
      return base;
    },
    choices: [
      { text: "Walk around the barriers", sub: "Free. Two miles on foot, there and back. The car stays here.", type: "neutral", addMiles: 5, next: "pc_c2", deltas: { nerve: +1 }, outcome: "walked", flags: { walked_meares: true } },
      { text: "Read the county sign all the way through", sub: "Gut check — there is a date on it.", type: "neutral", check: { stat: "gut", difficulty: 4 }, addMiles: 5,
        success: { next: "pc_c2", outcome: "read", deltas: { gut: +1 }, flags: { read_closure_sign: true } },
        failure: { next: "pc_c2", outcome: "unread" } },
      { text: "Carry on round the loop", sub: "Safe — there are two more capes and this one is closed.", type: "safe", addMiles: 5, next: "pc_c2" }
    ],
    outcomes: {
      walked: [
        "The walk down is easy and the surface is the strangest thing you have driven to look at in some time. Grass is coming up through the seams in lines, because the seams are where the water sits.",
        "The lighthouse is small and white and shut, and the fog has come in far enough that the light would not do anybody any good today.",
        "The spruce is the thing. It came out of the cliff sideways, got about thirty feet, thought better of it, and went up — and then along, and then up again, in a shape that only makes sense if you accept that it was trying its whole life and the wind was there first.",
        "On the way back up you are walking uphill on a road that is going downhill at a different rate, and the two of you are in no hurry about it."
      ],
      read: [
        "CAPE MEARES LOOP ROAD CLOSED TO VEHICLES. LANDSLIDE. The county has signed it and dated it and the date is a long way back.",
        "Underneath, in smaller letters and a different century of paint: PEDESTRIAN ACCESS AT YOUR OWN RISK.",
        "They did not close the road. They stopped repairing it, and then they put something in front of it, and the difference matters to somebody."
      ],
      unread: [
        "Closed, landslide, county seal. You get the shape of it without the specifics and you are already walking back to the car.",
        "There was a date on it. You could not tell you from a year."
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // C2 — CAPE LOOKOUT. Nothing wrong with it. That is the register of this
  // whole route and this is the node that has to carry it.
  // ═════════════════════════════════════════════════════════════════════════
  pc_c2: {
    location: "Cape Lookout, OR — the Capes loop",
    tags: ["travel","quiet"],
    mile: 76,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.walked_meares)
        base.push("Your shoes are wet through from a road that nobody maintains, and the heater is doing what it can, and the windows are going.");
      else if (s.flags.walked_beach)
        base.push("Your shoes have not been properly dry since Cannon Beach and the car has started to smell like the inside of the weather.");
      base.push(
        "Through Oceanside, which is forty houses on a slope and a tunnel through a headland to a beach on the other side, and then Netarts, which is a bay and a boat ramp and a shop that sells bait and milk.",
        "After Netarts the road goes up into the forest and stays there, and the forest is the kind where everything that is not a tree is moss on a tree.",
        "Cape Lookout is a headland two miles long and about four hundred feet of it is straight down. The trail out along the spine of it is sand and root and it takes two hours if you do the whole thing, which you are not going to.",
        "The car park has eleven cars in it and one of them has a surfboard on the roof, which from here is an act of some considerable optimism.",
        "You get out because that is the entire reason you came this way. The air is salt and cedar and something turned over. You can hear the ocean from four hundred feet above it and it does not sound like it does on television. It sounds like a road.",
        "Nothing is wrong. The map says Cloverdale is not far. The needle says what the needle says."
      );
      return base;
    },
    choices: [
      { text: "Walk out along the spine, twenty minutes of it", sub: "Free. Not the whole trail. Enough of it.", type: "neutral", addMiles: 6, next: "pc_c3", deltas: { gut: +2 }, outcome: "spine" },
      { text: "Check the needle against the map", sub: "Safe — it is the sensible thing and it is nine-thirty in the morning.", type: "safe", addMiles: 6, next: "pc_c3", outcome: "checked", flags: { checked_range: true } },
      { text: "Straight on to Kiwanda", sub: "Neutral — you saw it from the car park. You have seen it.", type: "neutral", addMiles: 6, next: "pc_c3" }
    ],
    outcomes: {
      spine: [
        "The trail starts in mud and gets better, and then there is a place where the trees stop on the left and there is nothing between you and the water for four hundred feet.",
        "There is a bench. Somebody carried a bench out here and bolted it to the rock, and somebody else has carved initials into the back of it, and somebody after that has sanded most of them off again.",
        "You sit on it for a while. Pelicans go past below you in a line, which is a thing you did not know you could look down at.",
        "Twenty minutes out is forty minutes, because twenty minutes back is uphill, and you knew that when you started."
      ],
      checked: [
        "Cloverdale is twenty-odd miles by the loop and the needle has come down more than twenty-odd miles' worth since Tillamook, because of the climbing and because of the cold and because of standing still with the engine running at Cape Meares while you decided something.",
        "It is fine. It is comfortably fine.",
        "You notice that you have started doing this arithmetic, and that you did not do any of it on the way out of Astoria, and you put the map back in the door."
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // C3 — CAPE KIWANDA, PACIFIC CITY. The dories. Boats launched off a beach
  // through surf, with pickup trucks, because there is no harbour.
  // ═════════════════════════════════════════════════════════════════════════
  pc_c3: {
    location: "Pacific City, OR — Cape Kiwanda",
    tags: ["character","quiet"],
    mile: 82,
    paywall: false,
    text: [
      "Sand Lake, and then dunes, and then a town that is a few streets and a brewery and a beach you are allowed to drive on.",
      "People are driving on it. Pickup trucks, down the ramp and along the hard sand, and every one of them has a boat behind it.",
      "The boats are flat-bottomed and about twenty feet and they do not go in the water off a trailer in any ordinary sense. There is no harbour here. There is no river mouth and no jetty and no breakwater and there never has been.",
      "So they back the trailer down to the surf line, and then they run the boat at the ocean, and the ocean is right there doing what it does, and they go out through the break under power and come back in the same way at about fifteen knots and let the beach stop them.",
      "A man is winching one up the sand with the tide still in the trailer wheels. He has done it enough times that there is nothing to watch. That is the thing about it. It is the most alarming thing you have seen all morning and it is somebody's Tuesday.",
      "Behind the beach, the cape itself is yellow sandstone with a fence along the top of it and a gap in the fence that has been there longer than the fence.",
      "There is a shop at the top of the ramp that sells coffee and sells nothing you need, and has a stack of tide tables by the door, free, take one."
    ],
    choices: [
      { text: "Take a tide table", sub: "Free. It is a month of highs and lows for water you are leaving.", type: "neutral", addMiles: 5, next: "pc_004", flags: { took_tidetable: true } },
      { text: "Ask the man with the winch how often it goes wrong", sub: "Nerve check — he is working and you are watching.", type: "neutral", check: { stat: "nerve", difficulty: 5 }, road: +1, addMiles: 5,
        success: { next: "pc_004", outcome: "asked", deltas: { nerve: +1 }, flags: { asked_dory: true } },
        failure: { next: "pc_004", outcome: "asked_bad", deltas: { nerve: -1 } } },
      { text: "Coffee, and watch the next one go out", sub: "Requires $3 — there will be a next one.", type: "neutral", requires: { walletMin: 3 }, addMiles: 5, next: "pc_004", deltas: { wallet: -3, gut: +1 } },
      { text: "Back to 101", sub: "Safe — Cloverdale is five miles inland and there is a pump there.", type: "safe", addMiles: 5, next: "pc_004" }
    ],
    outcomes: {
      asked: [
        "'Goes wrong every year,' he says. He does not stop winching. 'Goes wrong for people who've done it thirty years. That's not the part that gets you.'",
        "You ask what the part is.",
        "'Deciding,' he says. 'Standing on the sand in the morning looking at it and deciding. Going out's easy, you just go. Coming in you've got no choice left, you're coming in either way.' The trailer clears the water. 'Most of them like that better.'"
      ],
      asked_bad: [
        "He looks at the winch, and then at you, and then at the winch.",
        "'Busy,' he says, not unkindly, and he is.",
        "You stand there for a second longer than you should and then you go and look at the fence."
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 04 — CLOVERDALE. Where the loop comes back, if you took it. The node
  // does not congratulate anybody. There is a pump and it is the only one.
  // ═════════════════════════════════════════════════════════════════════════
  pc_004: {
    location: "Cloverdale, OR — back on US-101",
    tags: ["travel","money"],
    mile: 88,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.took_capes) {
        base.push(
          "The loop road comes back to 101 at Cloverdale the way a tributary comes back to a river, at an angle, without ceremony, with a stop sign.",
          "Forty-three miles since Tillamook. The highway did it in twenty-two while you were out at the capes, and it has been doing it all morning, and the cars that are on it now are not the cars that were on it then."
        );
        if (s.flags.checked_range) base.push("You did the arithmetic at Cape Lookout and the arithmetic was fine. It is still fine. It is less fine than it was.");
      } else {
        base.push(
          "The highway through the trees does exactly what the map said it would. Twenty-two miles, some of it along a river, none of it along the water.",
          "At Cloverdale there is a stop sign where a road comes in from the west at an angle, and a brown sign on the far side of the junction facing the other way, for the people doing this in the opposite direction.",
          "You were out of Tillamook at nine-twenty and it is nine-forty-five, and you have a little more fuel than you expected to have, and you did not see the ocean once."
        );
      }
      base.push(
        "Cloverdale is a feed store, a church, a tavern that opens at eleven, and a gas station with two pumps and a hand-lettered card taped inside the window of the door.",
        "NEXT GAS LINCOLN CITY 22 MI — NOTHING ON THE BEACH ROADS — WE ARE NOT KIDDING",
        "Somebody wrote the last line later. The pen is different."
      );
      if (s.flags.read_closure_sign)
        base.push("The county bolted its sign to a concrete barrier and had it printed. This one is an index card and a marker and somebody standing at this window deciding what you needed to know. You have now read both of today's signs all the way through.");
      return base;
    },
    choices: [
      { text: "Fill it here", sub: (s) => pumpSub(s, { rate: 0.27 }, "The card in the door is not an advertisement. It is information."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.27 }, next: "pc_005" },
      { text: "Ask who wrote the second line", sub: "Nerve check — somebody in there is the kind of person who tapes a card in a door.", type: "neutral", check: { stat: "nerve", difficulty: 4 }, road: +1,
        success: { next: "pc_005", outcome: "asked", deltas: { nerve: +1 }, flags: { asked_card: true } },
        failure: { next: "pc_005", outcome: "asked_bad" } },
      { text: "South — you have enough", sub: "Safe — twenty-two miles is twenty-two miles, and the card says so.", type: "safe", next: "pc_005" }
    ],
    outcomes: {
      asked: [
        "'I did,' she says. 'Both lines. The second one about four years after the first one.'",
        "She rings up somebody's milk. 'People read the number. Nobody reads the middle.'",
        "'Every summer somebody takes a beach road for the sunset on what they've got in the tank. Then they come back up it on foot and they come in here.' She hands the man his change. 'So I wrote it down. Then I wrote it down again.'"
      ],
      asked_bad: [
        "'Been there a while,' she says, which is an answer to a question you did not ask, and she goes back to the till.",
        "On the way out you read it again. It does say we are not kidding. You had not misread it."
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // LEG 2 — CLOVERDALE TO FLORENCE. Leg 1 taught distance. Leg 2 teaches money:
  // every stop has a thing that costs a little and returns nothing you can
  // measure. Fuel is everywhere on this stretch, and that is the trick of it.
  // ═════════════════════════════════════════════════════════════════════════

  // 05 — LINCOLN CITY. Gas on every corner, and a river you can see all of.
  pc_005: {
    location: "Lincoln City, OR — US-101",
    tags: ["travel"],
    mile: 110,
    paywall: false,
    textFn: (s) => {
      const base = [
        "Lincoln City is seven miles long and about four blocks wide, and all seven miles of it are on 101. Outlet mall, casino, kite shop, chowder, motel, motel, chowder.",
        "There is gas on every other corner."
      ];
      if (s.flags.asked_card)
        base.push("Nothing on the beach roads, the woman at Cloverdale wrote, and then wrote again. This is not a beach road. This is the opposite of one, and it goes on for seven miles.");
      base.push(
        "Halfway through town the highway crosses a river so short there is a sign about it. The D River comes out of a lake on the inland side of the road and goes into the Pacific on the other, and from the bridge you can see the whole of it, start to finish.",
        "The sign says it is one of the shortest rivers in the world. Another town somewhere has disagreed about this, and the sign is what is left of the argument.",
        "Kites over the beach. A great many of them. One of them is a whale."
      );
      return base;
    },
    choices: [
      { text: "Fill up while it is everywhere", sub: (s) => pumpSub(s, { rate: 0.27 }, "Strip prices. There is gas the whole length of town."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.27 }, next: "pc_006" },
      { text: "Walk the whole length of the D River", sub: "Free. It will not take long. That is the point of it.", type: "neutral", next: "pc_006", outcome: "river" },
      { text: "Through town and out", sub: "Safe — seven miles of stoplights and then the coast again.", type: "safe", next: "pc_006" }
    ],
    outcomes: {
      river: [
        "It takes about a minute and a half. You start where it comes out from under the road, all of it at once, brown from the lake, and you walk beside it across the sand, and then it is the ocean.",
        "A kid is standing in it with both feet. He is standing in the entire width of a river. He knows this and he is not going to get over it any time soon.",
        "You walk back up and you have seen a whole river, beginning and end, which is more than you can say for most of them."
      ]
    }
  },

  // 06 — DEPOE BAY. A harbour you enter through a slot in the rock. Whales,
  // for twenty-five dollars, or for nothing if you are patient and lucky.
  pc_006: {
    location: "Depoe Bay, OR — the sea wall",
    tags: ["money","quiet"],
    mile: 122,
    paywall: false,
    text: [
      "Depoe Bay is a town built along the top of a sea wall, and the whole of the business district faces the water like an audience.",
      "The harbour is behind the highway bridge, and the way in is a gap in the rock about fifty feet wide with the open Pacific on the other side of it. Boats come through it under power, and while they are coming through it nobody on the wall says anything at all.",
      "Along the wall, when the swell lines up, the ocean comes up through holes in the rock and goes thirty feet into the air. A man in a raincoat is standing exactly where the sign says not to stand, and he is getting exactly what the sign said he would.",
      "Across 101 there is a booth with a chalkboard.",
      "WHALES — GRAYS ALL SUMMER — 1 HR — NEXT BOAT 11:30 — $25 CASH"
    ],
    choices: [
      { text: "Buy a seat on the 11:30", sub: "Requires $25 — an hour on a small boat, and no promises written on the board.", type: "neutral", requires: { walletMin: 25 }, check: { stat: "gut", difficulty: 5 },
        success: { next: "pc_007", outcome: "boat_saw", deltas: { wallet: -25, gut: +2 }, flags: { saw_whale: true, took_boat: true } },
        failure: { next: "pc_007", outcome: "boat_none", deltas: { wallet: -25, nerve: -1 }, flags: { took_boat: true } } },
      { text: "Watch from the wall for nothing", sub: "Gut check — they come in close here, the board says. Sometimes.", type: "neutral", check: { stat: "gut", difficulty: 6 },
        success: { next: "pc_007", outcome: "wall_saw", deltas: { gut: +2 }, flags: { saw_whale: true } },
        failure: { next: "pc_007", outcome: "wall_none" } },
      { text: "On to Newport", sub: "Safe — twelve miles, and there are sea lions there that do not charge.", type: "safe", next: "pc_007" }
    ],
    outcomes: {
      boat_saw: [
        "The boat goes out through the slot with eleven people on it and the skipper does not slow down, and everybody on the wall watches you go the way you were watching the others.",
        "Twenty minutes out there is a breath. That is what you see first. A noise like a tyre going down, and a column of mist that hangs there after whatever made it has gone under.",
        "Then the back of it. Grey, scarred, the length of the boat, rolling over slowly and on purpose and going down again without any interest in you whatsoever.",
        "It was twenty-five dollars. You would be lying if you said you were thinking about that."
      ],
      boat_none: [
        "The boat goes out through the slot and an hour later it comes back in through it.",
        "In between there is a great deal of grey water and a skipper who says they were here yesterday, and a woman at the rail who has been sick quietly over the side three times and apologised each time.",
        "Twenty-five dollars. The board did not promise anything. You read it twice before you paid and it did not promise anything."
      ],
      wall_saw: [
        "You give it ten minutes and then fifteen. A woman beside you with binoculars says 'there,' not to you, and points, and you look where she is pointing and see nothing.",
        "Then you see it. A breath, close, maybe two hundred yards out, a little column of mist standing up off the water and hanging.",
        "The back comes up after it, grey, enormous, and goes down again. The boat that left at eleven-thirty is a mile further out, looking the other way."
      ],
      wall_none: [
        "You give it twenty minutes. The spouting horns go off. The man in the raincoat gets soaked again and seems pleased about it.",
        "There are no whales. There is a great deal of water that could have whales in it, which is a different thing, and after a while you walk back to the car."
      ]
    }
  },

  // 07 — NEWPORT. The Bayfront. The route's first honest wage, and the first
  // place the comfort tax is a plate of food you would have bought anyway.
  pc_007: {
    location: "Newport, OR — the Bayfront",
    tags: ["money","character"],
    mile: 134,
    paywall: false,
    textFn: (s) => {
      const base = [
        "The Yaquina Bay Bridge is green and arched and built in the thirties by people who believed a bridge should look like it meant it. It lifts you over the bay and sets you down in Newport like it is presenting you to somebody.",
        "Down on the Bayfront the canneries are still canneries, mostly, and the smell is the smell.",
        "Under the public docks there are sea lions. Dozens of them, piled on floats that were put out for boats and given up, barking at nothing in particular at a volume you would have to hear to believe."
      ];
      if (s.flags.saw_whale)
        base.push("You saw a whale this morning. These are louder about it.");
      else if (s.flags.took_boat)
        base.push("Twenty-five dollars and no whale, and here are forty sea lions for free, shouting.");
      base.push(
        "There is a fish and chips window with a queue. There is a crab boat tied up at the end of the dock with pots stacked on the deck higher than the wheelhouse, and one man on it trying to get them onto the dock by himself.",
        "He is not managing. He is not asking anybody either."
      );
      if (s.flags.had_icecream)
        base.push("You had ice cream in Tillamook before ten. Nobody is keeping score of this except you.");
      return base;
    },
    choices: [
      { text: "Offer the man a hand with the pots", sub: "Nerve check — he has not asked, and he is not going to.", type: "neutral", check: { stat: "nerve", difficulty: 4 }, road: +1,
        success: { next: "pc_007b", outcome: "pots", deltas: { wallet: +24, gut: -1 }, flags: { worked_pots: true } },
        failure: { next: "pc_007b", outcome: "pots_slow", deltas: { wallet: +10, nerve: -1 }, flags: { worked_pots: true } } },
      { text: "Fish and chips from the window", sub: "Requires $12 — cod, and more of it than you need.", type: "neutral", requires: { walletMin: 12 }, next: "pc_007b", deltas: { wallet: -12, gut: +1 }, outcome: "chips" },
      { text: "Down to the docks to look at the sea lions", sub: "Free. Loud.", type: "neutral", next: "pc_007b", outcome: "lions" },
      { text: "Back over the bridge and south", sub: "Safe — there is gas on the way out of town.", type: "safe", next: "pc_007b" }
    ],
    outcomes: {
      pots: [
        "He looks at you for about as long as it takes to decide you are not going to fall in, and then he hands you a pot.",
        "They are steel frames with mesh over them and they are heavier than they look and wet all the way through. You pass them up and he stacks them, and neither of you talks, and it takes most of an hour.",
        "When it is done he takes a fold of bills out of his coat and counts off twenty-four dollars without asking what you thought it was worth. 'Going south?' he says. You say yes. He nods like that explains something.",
        "Your hands smell of bait and will for the rest of the day."
      ],
      pots_slow: [
        "He lets you help. You are slower than he would be on his own and you both know it by the fourth pot.",
        "He finishes the last ten himself while you hold the dock line, which is the job he gives people who are not good at the other job.",
        "He gives you ten dollars anyway. 'For the line,' he says, which is generous, and you both know that too."
      ],
      chips: [
        "It is cod in a paper boat with a lot of chips under it and a little cup of tartar sauce that is not enough, and you eat it standing at a rail with the sea lions shouting below.",
        "A gull lands on the rail four feet away and watches every single chip. It does not get one. It is not discouraged."
      ],
      lions: [
        "Up close they are enormous and they smell like what they eat. They lie on the floats in heaps, on top of each other, and the ones on the bottom of the heaps complain about it continuously.",
        "Every so often one of them slides off into the water and another one hauls itself up into the gap, and the barking goes up a register while they argue about it, and then it settles back to the ordinary level, which is very loud."
      ]
    }
  },

  // 07b — NEWPORT, the way out. A pump, on the way out of town, which is the
  // last one for twenty-three miles and nobody needs telling.
  pc_007b: {
    location: "Newport, OR — 101 South at the bridge",
    tags: ["travel","money"],
    mile: 135,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.worked_pots)
        base.push("Your hands are cold and smell of bait and there is money in your pocket you did not have this morning.");
      base.push(
        "South of the bridge there is a gas station with a boy in a reflective vest standing between the pumps.",
        "In Oregon somebody pumps it for you. You wait in the car and he comes to the window and asks how much, and you tell him, and he does it, and he takes the money, and it is the most human contact most people in this state have with a gas station.",
        "The road south from here runs along the edge of everything for twenty-three miles to Yachats and Cape Perpetua."
      );
      return base;
    },
    choices: [
      { text: "Let him fill it", sub: (s) => pumpSub(s, { rate: 0.29 }, "Twenty-nine cents a point. He will wash the windscreen whether you ask or not."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.29 }, next: "pc_008" },
      { text: "South", sub: "Safe — you have what you have.", type: "safe", next: "pc_008" }
    ]
  },

  // 08 — CAPE PERPETUA. Thor's Well: the sea fills a hole in the rock from below
  // and drains it again, and it looks like it has no bottom. The route's
  // mechanic as an image. Also the first place on this route that can hurt you.
  pc_008: {
    location: "Cape Perpetua, OR — below the highway",
    tags: ["danger","quiet"],
    mile: 158,
    paywall: false,
    textFn: (s) => {
      const base = [
        "South of Newport the road gets close to the water and stays close. Waldport, which is a bridge and a bay. Yachats, which is a village that has decided to be a village on purpose and is very good at it.",
        "Then the land goes up into Cape Perpetua, and the highway hangs on the side of the cape a couple of hundred feet above the sea.",
        "Below the road, at the bottom of a trail, the shore is black rock in shelves. And in the middle of one shelf there is a hole.",
        "People call it Thor's Well. It is round, about the size of a hot tub, and the sea comes in underneath the shelf and fills it from below until it overflows and pours off across the rock in white sheets in every direction.",
        "Then the swell goes back out, and the whole thing drains. Down. Out of sight. It looks like it goes nowhere and has no bottom. It has a bottom. You cannot see it from anywhere it is safe to stand.",
        "A sign at the top of the trail says SNEAKER WAVES — NEVER TURN YOUR BACK ON THE OCEAN, and somebody has drawn a small wave on it in biro."
      ];
      if (s.flags.asked_dory)
        base.push("Going out's easy, the man at Pacific City said. Coming in you've got no choice left. You watch the well fill and empty and fill and you think about that more than you mean to.");
      base.push("Up the hill, a narrow road climbs to the top of the cape, to a stone shelter somebody built there ninety years ago so people could stand out of the wind and look at all of it.");
      return base;
    },
    choices: [
      { text: "Go out on the shelf for a proper look", sub: "Nerve check — the good view is where the sign says not to be.", type: "neutral", check: { stat: "nerve", difficulty: 5 },
        success: { next: "pc_009", outcome: "close", deltas: { nerve: +1, gut: +2 }, flags: { saw_well_close: true } },
        failure: { next: "pc_009", outcome: "wave", take: 12, deltas: { nerve: -2 }, flags: { soaked: true } } },
      { text: "Watch it from the end of the trail", sub: "Free. From here it is just the most remarkable thing you have seen all day.", type: "neutral", next: "pc_009", outcome: "trail" },
      { text: "Drive up to the top of the cape", sub: "Two miles up and two back. The highest you can drive on this coast.", type: "neutral", addMiles: 4, next: "pc_009", deltas: { gut: +2 }, outcome: "top", flags: { saw_from_top: true } },
      { text: "Carry on south", sub: "Safe — it is a hole. You have seen holes.", type: "safe", next: "pc_009" }
    ],
    outcomes: {
      close: [
        "The basalt is wet and black and grippy in a way that makes you trust it more than you should. You go out to where three other people are already standing, and you stand with them.",
        "From here you can see down into it. Not to the bottom. Ten feet, maybe, of churning white, and then dark.",
        "It fills. It goes over. Water runs past your shoes in a thin fast sheet and goes back where it came from. It drains. You hear it drain.",
        "You go back up the trail with your back to the ocean, which is the one thing the sign asked, and nothing happens."
      ],
      // The sea takes what is in the back pocket, capped at what you had. Says so.
      wave: (s) => [
        "You are watching the well. That is the problem. Everybody out there is watching the well.",
        "The wave does not come over the edge of the shelf so much as the edge of the shelf stops being there, and there is water around your knees and then your waist and it is pulling, not pushing, back the way it came.",
        "You go down on one hand on the rock and it holds. Somebody has your jacket by the shoulder. Then it is gone and the shelf is just wet rock again and the well is doing what it was doing.",
        (s.taken || 0) > 0
          ? "Back at the car you are shaking in a way you did not decide to, and the " + (s.taken >= 12 ? "twelve dollars" : "few dollars") + " that were in your back pocket are in the Pacific Ocean, or in the well, which as far as you can tell is the same place."
          : "Back at the car you are shaking in a way you did not decide to. You check your back pocket out of habit. There was nothing in it to lose, and for once that is the good news."
      ],
      trail: [
        "From the end of the trail it is like watching a fountain someone built backwards.",
        "It fills, it overflows, the white runs off in every direction across the black rock, and then it drains, and every time it drains you lean forward a little to see where it goes.",
        "Out on the shelf three people are standing much closer than you are, and you watch them watch it, and you watch the water behind them."
      ],
      top: [
        "The road up is steep and narrow and there is nowhere to pass. At the top there is a car park and a short path and a shelter made of stacked stone with a window in it that has no glass.",
        "From up here you can see the coast going south in headlands, one behind the other, each one paler than the last, until they stop being land and start being weather.",
        "A plaque says on a clear day you can see seventy miles. It is not a clear day. You can see a great deal of it anyway."
      ]
    }
  },

  // 09 — HECETA HEAD. A lighthouse you can see for free and a sea cave you pay
  // to go down into. The comfort tax at its purest: you pay, it is
  // astonishing, and it returns nothing the road can use.
  pc_009: {
    location: "Heceta Head, OR — US-101",
    tags: ["money","quiet"],
    mile: 171,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.soaked)
        base.push("Your jeans are still wet from the shelf at Cape Perpetua and the heater has stopped pretending it can do anything about them.");
      else if (s.flags.saw_well_close)
        base.push("You keep seeing it when you blink. The white going over, and then the drain, and then the dark where the bottom should be.");
      if (s.flags.saw_from_top)
        base.push("From the shelter on top of Cape Perpetua this headland was one of the pale ones further down. Now it is the one you are on, and it is not pale at all.");
      base.push(
        "The highway comes round a headland on a bridge and there is a lighthouse below you, white, on a shelf of rock, with a keeper's house beside it painted the colours keepers' houses are painted.",
        "There is a pullout above it that is full of people taking the same photograph.",
        "A mile on, on the ocean side, there is a building with a gift shop and a turnstile and a sign. SEA LION CAVES. An elevator goes two hundred feet down inside the cliff to a sea cave you could fit a church in. The sea lions are in it, or they are not; it depends on the season, and a board by the turnstile says which.",
        "The price is on the board as well."
      );
      return base;
    },
    choices: [
      { text: "Pay and go down", sub: "Requires $14 — two hundred feet down inside a cliff.", type: "neutral", requires: { walletMin: 14 }, next: "pc_010", deltas: { wallet: -14, gut: +2 }, outcome: "cave", flags: { went_down: true } },
      { text: "Stand at the pullout and look at the lighthouse", sub: "Free. Everybody else is.", type: "neutral", next: "pc_010", outcome: "light" },
      { text: "On to Florence", sub: "Safe — thirteen miles, and the dunes start just past it.", type: "safe", next: "pc_010" }
    ],
    outcomes: {
      cave: [
        "The elevator is old and slow and the operator does not say anything the whole way down. The doors open on a walkway in the rock and a smell that arrives about a second before the sound does.",
        "The cave is enormous. Green water coming and going on the floor of it, and light coming in sideways from two openings to the sea, and on the rocks at the far end, a couple of hundred sea lions, piled and shouting, and the shouting goes all the way up into the roof and comes back.",
        "You stand at the rail for as long as the people behind you let you.",
        "On the way back up you have the thought that this was the first thing all day that you paid for and could not have got any other way, and you do not know yet whether that is a good thought or not."
      ],
      light: [
        "From up here the lighthouse is small and perfect and looks exactly like the postcard of itself in the gift shop a mile down the road.",
        "A man next to you tells his wife it is the most photographed lighthouse in the country. She asks who counted. He does not know."
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // LEG 3 — FLORENCE TO COOS BAY, AND OUT TO CAPE ARAGO. The dunes, and the
  // middle rung of the ladder: the first dead end, at a price low enough that
  // the lesson lands before Shelter Cove charges the full amount for it.
  // ═════════════════════════════════════════════════════════════════════════

  // 10 — FLORENCE. A river town with a green bridge, and then sand.
  pc_010: {
    location: "Florence, OR — the Siuslaw bridge",
    tags: ["travel","money"],
    mile: 184,
    paywall: false,
    textFn: (s) => {
      const base = [
        "Florence is an old town on a river, with another of the green bridges over it — this one opens in the middle for boats, and has two little towers on it for the men who used to open it.",
        "Old Town is one street of it along the water. A fish market, a bookshop, a place selling saltwater taffy in a window with a machine pulling it, slowly, all day, for nobody in particular."
      ];
      if (s.flags.worked_pots) base.push("Your hands still smell of the dock at Newport.");
      if (s.flags.went_down) base.push("You can still hear the cave if you think about it, which you keep doing.");
      base.push(
        "South of the bridge the land changes all at once.",
        "Sand. Not beach. Dunes, inland, as high as the trees and higher, going south for forty miles between the highway and the sea. Every half mile along 101 there is somebody renting something with big tyres that will take you out into them, and the price of it is on a banner."
      );
      return base;
    },
    choices: [
      { text: "Fill up before the dunes", sub: (s) => pumpSub(s, { rate: 0.28 }, "River-town prices. Reedsport is twenty-one miles."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.28 }, next: "pc_011" },
      { text: "Watch the taffy machine for a minute", sub: "Free. It is not going anywhere and neither, for a minute, are you.", type: "neutral", next: "pc_011", outcome: "taffy" },
      { text: "Over the bridge and south", sub: "Safe — the dunes are on the right for the next forty miles. You will see them.", type: "safe", next: "pc_011" }
    ],
    outcomes: {
      taffy: [
        "Two steel arms turn in a slow circle and fold a rope of pink taffy over itself, and over itself, and over itself.",
        "A woman inside cuts it into pieces and twists each one into wax paper without looking at her hands. There is a sign that says the machine is from 1950-something. The machine does not look like it knows that."
      ]
    }
  },

  // 11 — THE DUNES. Money for a ride, nothing for a walk, and a sign to a beach
  // access that the card at Cloverdale already warned you about.
  pc_011: {
    location: "Oregon Dunes — off US-101",
    tags: ["money","danger"],
    mile: 196,
    paywall: false,
    textFn: (s) => {
      const base = [
        "For twelve miles the dunes are just a brightness behind the trees on the right, and then there is a turn-off and a car park and a wooden platform built out over the edge of them, and you can see.",
        "It does not look like Oregon. It looks like somewhere that has never heard of Oregon. Sand in ridges three hundred feet high, pale, going west to a line of dark trees and the sea beyond the trees, with the wind taking the tops off the ridges in long thin sheets.",
        "Back on the highway the rental places have banners. DUNE TOURS · 30 MIN · $40 · BUGGIES · SANDRAILS · NO EXPERIENCE NEEDED.",
        "Past them, a smaller sign, nailed to a post: BEACH ACCESS, and an arrow, and a road that goes into the trees and comes out the other side with sand already blown across it."
      ];
      if (s.flags.asked_card)
        base.push("Nothing on the beach roads. She wrote it down, and then she wrote it down again.");
      return base;
    },
    choices: [
      { text: "Pay for half an hour in a dune buggy", sub: "Requires $40 — a man drives, you hold on. No experience needed.", type: "neutral", requires: { walletMin: 40 }, next: "pc_012", deltas: { wallet: -40, gut: +2, nerve: +1 }, outcome: "ride", flags: { rode_buggy: true } },
      { text: "Walk out from the platform", sub: "Free. The sand is soft and every ridge is further than it looks.", type: "neutral", next: "pc_012", outcome: "walk" },
      { text: "Follow the BEACH ACCESS sign", sub: "Gut check — it is an ordinary car, and that is ordinary sand, probably.", type: "neutral", check: { stat: "gut", difficulty: 5 },
        success: { next: "pc_012", outcome: "turned", deltas: { gut: +1 }, flags: { read_sand: true } },
        failure: { next: "pc_011s", outcome: "stuck", deltas: { nerve: -1 }, flags: { stuck_sand: true } } },
      { text: "Keep to 101", sub: "Safe — they are dunes. You can see them from here.", type: "safe", next: "pc_012" }
    ],
    outcomes: {
      ride: [
        "The buggy is a steel cage on enormous tyres with a seat belt that goes over both shoulders, and the man who drives it does not say anything until you are on top of the first ridge.",
        "Then he goes down the far side of it, and there is a moment where the whole front of the buggy is pointed at nothing and the sand is coming up the windscreen, and you are making a noise you did not know you made.",
        "Thirty minutes. At the end of it you are full of sand in places that are going to be finding sand until San Francisco, and forty dollars lighter, and grinning in a way your face did not consult you about."
      ],
      walk: [
        "Every step goes in to the ankle and comes back out with half of it. The first ridge looks like a five-minute walk and takes fifteen.",
        "From the top of it there is nothing in any direction but more of it, and the wind, and somewhere very far off the sound of an engine going up something and coming down the other side.",
        "You sit on the crest and the sand keeps moving under you, very slightly, all the time, towards the trees. The whole thing is walking inland at a few feet a year. You do not stay long enough to notice."
      ],
      turned: [
        "The road goes into the trees and the trees thin out and the asphalt gets a sand-coloured edge, and then a sand-coloured middle.",
        "There is a pickup parked at the side of it with a tow strap coiled on the tailgate and nobody in it, which is a sign of a kind.",
        "You stop where there is still more road than sand, and turn round in three careful points, and go back the way you came. Somebody in a car like yours has not done this today. You can see the tracks."
      ],
      stuck: [
        "The road goes into the trees and the trees thin out and the asphalt gets a sand-coloured edge, and then a sand-coloured middle, and then it is not asphalt.",
        "You feel the back of the car go soft before you understand it. You give it more, because that is what everybody does, and that is the wrong thing, and now it is sitting on its own axles in a groove it dug for itself."
      ]
    }
  },

  // 11s — STUCK IN THE SAND. A bill, or a favour. Nobody leaves you there.
  pc_011s: {
    location: "Oregon Dunes — a beach access road",
    tags: ["danger","money","character"],
    mile: 196,
    paywall: false,
    text: [
      "The back wheels are in to the hubs. Getting out to look at it is worse than not looking at it.",
      "You have been there ten minutes when a pickup comes up the road from the beach, slowly, the way a person drives who knows exactly where the soft bits are. It stops level with you. The man inside looks at the car, then at the groove behind it, then at you.",
      "There is a tow strap on his tailgate. It is not the first time today it has been off the tailgate.",
      "'Twenty,' he says. 'Or you can dig. People dig.' He says it like a forecast. He is not going anywhere either way."
    ],
    choices: [
      { text: "Pay him the twenty", sub: "Requires $20 — two minutes and a strap, and you are on asphalt.", type: "safe", requires: { walletMin: 20 }, next: "pc_012", deltas: { wallet: -20 }, outcome: "paid" },
      { text: "Dig it out yourself", sub: "Nerve check — he is going to watch.", type: "neutral", check: { stat: "nerve", difficulty: 5 },
        success: { next: "pc_012", outcome: "dug", deltas: { tank: -3, gut: +1 }, flags: { dug_out: true } },
        failure: { next: "pc_012", outcome: "dug_bad", deltas: { tank: -6, nerve: -2 }, flags: { pulled_free: true } } }
    ],
    outcomes: {
      paid: [
        "He backs up, hooks the strap to something under your bumper without having to look for it, and pulls, and the car comes up out of the sand like it was never in any real difficulty.",
        "He coils the strap. He takes the twenty and puts it in his shirt pocket with the others, by the look of it. 'Don't go that way again,' he says, which is the whole of the advice."
      ],
      dug: [
        "You dig with your hands and a floor mat. You let half the air out of the back tyres because he says, without being asked, to let half the air out of the back tyres.",
        "It takes twenty minutes. Then you ease it out in first, very gently, and the car crawls up out of its own groove and onto something firm, and he nods once from the cab of his truck, as if a thing has been settled between you.",
        "He tells you where the air pump is in Reedsport. You did not ask that either."
      ],
      dug_bad: [
        "You dig. You spin it. You dig again and spin it again and the groove gets deeper and the engine gets louder and the needle on the dash does what needles do when you spin wheels in sand for a quarter of an hour.",
        "In the end he gets out of the truck without saying anything and hooks the strap on and pulls you out.",
        "You reach for your wallet. He shakes his head and coils the strap. 'Wasn't going to watch you do that all afternoon,' he says, and drives off back down to the beach, slowly, knowing where the soft bits are."
      ]
    }
  },

  // 12 — REEDSPORT AND WINCHESTER BAY. The Umpqua, a lighthouse, a pump, and a
  // meadow of elk three miles up a side road that cost nothing to look at.
  pc_012: {
    location: "Reedsport, OR — the Umpqua",
    tags: ["travel","money"],
    mile: 205,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.stuck_sand)
        base.push("There is sand in the wheel arches and sand in the footwells and sand, somehow, in the cupholder. The car is going to be giving it back for days.");
      else if (s.flags.rode_buggy)
        base.push("You are still finding sand. You are going to be finding sand for a while.");
      else if (s.flags.read_sand)
        base.push("Back on the beach road there is a pickup with a tow strap on its tailgate, and today it is waiting for somebody else.");
      if (s.flags.pulled_free)
        base.push("He would not take the money. You have that in your pocket still, and the feeling of having been watched dig, and you are not sure which one weighs more.");
      else if (s.flags.dug_out)
        base.push("The air pump is at the station by the river, which is exactly where he said it would be. You put back what you let out of the tyres and they stop looking sorry for themselves.");
      base.push(
        "The Umpqua River comes out of the mountains here wide and slow and brown, and Reedsport sits on the flat beside it, built low and a bit damp, like it is expecting the river to come and visit.",
        "Down at the mouth, at Winchester Bay, there is a lighthouse with a red and white light that turns in daylight for nobody, and a harbour full of boats that go out for salmon, and a dune rental place with a queue.",
        "A brown sign on the edge of town points east, up Route 38. ELK VIEWING AREA 3."
      );
      return base;
    },
    choices: [
      { text: "Fill up at the river", sub: (s) => pumpSub(s, { rate: 0.29 }, "Coos Bay is twenty-seven miles."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.29 }, next: "pc_013" },
      { text: "Out 38 to look at the elk", sub: "Three miles up, three back. Free. They are either there or they are not.", type: "neutral", addMiles: 6, next: "pc_013", deltas: { gut: +2 }, outcome: "elk", flags: { saw_elk: true } },
      { text: "South to Coos Bay", sub: "Safe — twenty-seven miles of trees with the dunes on the right.", type: "safe", next: "pc_013" }
    ],
    outcomes: {
      elk: [
        "Route 38 follows the river up into a valley, and three miles in there is a pullout with a fence along it and a wide flat meadow beyond the fence, and the meadow is full of elk.",
        "Sixty of them, maybe. Big, brown, pale at the back end, grazing with their heads down and their ears moving, in no hurry at all, a hundred yards from a state highway. A bull with a rack of antlers like a coat stand lifts his head and looks at the road and puts it down again.",
        "A family at the fence has a pair of binoculars they are passing round. The youngest is using them the wrong way round and is perfectly happy.",
        "Nobody charged anybody anything for this. You notice yourself noticing that, and you drive back down to 101."
      ]
    }
  },

  // 13 — COOS BAY. The biggest town on the coast, a mile of bridge into it, and a
  // brown sign to the end of a road. The Arago turn is the ladder's middle rung.
  pc_013: {
    location: "Coos Bay, OR — US-101",
    tags: ["travel","money","fork"],
    mile: 232,
    paywall: false,
    textFn: (s) => {
      const base = [
        "The bridge into North Bend is nearly a mile long, green, arched in the middle high enough for a ship, and the whole of the bay goes by underneath it, wide and grey and flat.",
        "Coos Bay is the biggest town on the Oregon coast and it does not look like a postcard of anything. It looks like work. There are log ships at the docks and piles of wood chips by the water the size of hills, and a mill whistle, and a main street with an old cinema on it with Egyptians painted on the front."
      ];
      if (s.flags.saw_elk) base.push("You saw sixty elk for nothing an hour ago. This town has never once been free for anybody.");
      base.push(
        "At the south end of town there is a brown sign pointing west, out towards the coast you have not been able to see since the dunes.",
        "CHARLESTON 9 · SHORE ACRES 13 · CAPE ARAGO 14",
        "There is nothing written under CAPE ARAGO. There does not need to be. The road ends there. You can tell from the way the sign is laid out that there is nowhere else on it to go."
      );
      return base;
    },
    choices: [
      { text: "Fill up in town", sub: (s) => pumpSub(s, { rate: 0.28 }, "City prices. Bandon is twenty-four miles south on 101."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.28 }, next: "pc_013" },
      { text: "Out the Cape Arago road", sub: "Fourteen miles out to the end, and fourteen back. The brown sign does not mention the back. The green one will.", type: "neutral", addMiles: 9, next: "pc_a1", flags: { took_arago: true } },
      { text: "South on 101", sub: "Safe — Bandon in twenty-four miles, back near the water.", type: "safe", next: "pc_014" }
    ]
  },

  // A1 — CHARLESTON. A fishing village, a cove, and a garden on a cliff you pay
  // the state ten dollars to park beside.
  pc_a1: {
    location: "Charleston, OR — the Cape Arago Highway",
    tags: ["travel","money"],
    mile: 232,
    owed: 9,      // back to 101 at Coos Bay. Shown on the sign, never charged here.
    paywall: false,
    text: [
      "The road goes out along the bay and over a bridge at Charleston, which is a fishing village of the working kind: a boat basin, a fish plant, a shack selling crab out of a steaming pot by the road, and a smell that is half salt and half diesel.",
      "After Charleston it narrows and climbs and finds the coast again, and here it is a different coast. Rock. Cliffs of it in layers, tipped up on end, with the sea breaking into the cracks between the layers.",
      "Sunset Bay is a cove like a held breath, round and calm, with the ocean pushing at the narrow mouth of it and not getting in.",
      "A little further there is a car park and a gate and a machine. SHORE ACRES STATE PARK · DAY USE · $10. Behind the gate, a garden. Formal beds and a lily pond and a rose garden, on the top of a cliff, belonging to a house that is not there any more — a lumber man built it so he could look at the sea, and it burned, and the state kept the garden."
    ],
    choices: [
      { text: "Pay the machine and walk the garden", sub: "Requires $10 — roses on the edge of a cliff, which is not where roses go.", type: "neutral", requires: { walletMin: 10 }, addMiles: 5, next: "pc_a2", deltas: { wallet: -10, gut: +2 }, outcome: "garden", flags: { paid_shore: true } },
      { text: "Stop at Sunset Bay and look at it for free", sub: "Free. A cove. Nobody is charging for the cove.", type: "neutral", addMiles: 5, next: "pc_a2", outcome: "cove" },
      { text: "On to the end of the road", sub: "Neutral — it is five more miles, and you have come this far.", type: "neutral", addMiles: 5, next: "pc_a2" }
    ],
    outcomes: {
      garden: [
        "The garden is absurd and perfect: clipped hedges in rows, roses in labelled beds, a pond with lilies on it and a bench beside the pond, and over the edge of the lawn a hundred feet straight down to water that is trying to take the whole cliff apart.",
        "A gardener is deadheading the roses into a bucket. She has a radio on in her apron pocket, very quietly, and it is the same station.",
        "At the end of the lawn there is a stone wall and an observation building where the house was, and in a glass case a photograph of the house. It was enormous. Somebody built all of it to look at this, and all of it is gone, and this is still here."
      ],
      cove: [
        "You stand at the top of the little beach and watch the swell come up to the mouth of the cove and stop, as if there were a line drawn across it.",
        "Inside the line the water is flat enough for a child to be wading in it to the waist with her trousers rolled. Outside the line it is the Pacific Ocean. Twenty yards separate the two, and she is not aware of the second one at all."
      ]
    }
  },

  // A2 — CAPE ARAGO. The end of the road. A reef covered in animals that are
  // louder than the sea, and a woman counting them. Then the way you came.
  pc_a2: {
    location: "Cape Arago, OR — end of the road",
    tags: ["quiet","character"],
    mile: 232,
    owed: 14,     // the whole way back. The sign goes up as you drive away from it.
    paywall: false,
    textFn: (s) => {
      const base = [
        "The road ends in a loop at the top of the cape, around a car park and a toilet block and a sign about the reef.",
        "You hear the reef before you see it. Out in the water, a few hundred yards off, there are flat rocks and a low island, and they are covered — covered — in sea lions and seals and things larger than either, and the noise of them comes in off the water louder than the waves it is coming in on.",
        "Some of the large ones are elephant seals. You did not know there were elephant seals in Oregon. They lie on the rock like dropped luggage and every so often one rears up and roars at another one, and the other one ignores it.",
        "At the railing a woman in a fleece with a clipboard is looking through a scope, and every few seconds she presses a clicker in her other hand."
      ];
      if (s.flags.paid_shore)
        base.push("The gardener's radio was playing the same station. You think about that for longer than it deserves.");
      return base;
    },
    choices: [
      { text: "Ask her what she is counting", sub: "Nerve check — she is working, and the clicker is going.", type: "neutral", check: { stat: "nerve", difficulty: 4 }, road: +1, addMiles: 14,
        success: { next: "pc_014", outcome: "count", deltas: { nerve: +1, gut: +1 }, flags: { counted_seals: true } },
        failure: { next: "pc_014", outcome: "count_bad" } },
      { text: "Stand at the rail and listen to it", sub: "Free. It will not get quieter.", type: "neutral", addMiles: 14, next: "pc_014", deltas: { gut: +2 }, outcome: "listen" },
      { text: "Back the way you came", sub: "Safe — it is the only way there is. Fourteen miles to 101.", type: "safe", addMiles: 14, next: "pc_014" }
    ],
    outcomes: {
      count: [
        "'Pups,' she says, without taking her eye from the scope. Click. 'Elephant seal pups, this week. Then the adults again on Friday.' Click.",
        "She is a volunteer. She has been doing it for nine years, once a week, every week, out here, for the state.",
        "You ask her what the number is for. She thinks about it, which is more than most people would. 'So somebody knows,' she says. 'If it changes. Somebody has to have been counting before it changed, or nobody can say it did.' Click."
      ],
      count_bad: [
        "'Busy,' she says, and does not look up, and the clicker goes twice while she says it.",
        "You stand next to her for a little while anyway. She does not mind that. She just does not have a number to spare."
      ],
      listen: [
        "You stand there until you stop being able to tell the animals from the water. The barking, the roaring, a sort of long groaning sound that comes from the large ones, and under all of it the sea doing the same thing it was doing at Astoria this morning.",
        "The light is getting long. You came fourteen miles to stand here, and you are going to drive fourteen back past everything you have already seen, and you knew that when you turned off, and it is still worth it. You notice that it is still worth it. You notice that you are keeping track."
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // LEG 4 — BANDON TO CRESCENT CITY. The evening, the state line, the night.
  // Oregon gives away its best twelve miles in the last of the light, and then
  // California starts charging: you pump your own, it costs more, and the
  // inspection station is only open while it is light.
  // ═════════════════════════════════════════════════════════════════════════

  // 14 — BANDON. Evening. Rocks on a beach like furniture left behind.
  pc_014: {
    location: "Bandon, OR — Old Town, evening",
    tags: ["travel"],
    mile: 256,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.took_arago)
        base.push("Fourteen miles back past Sunset Bay and Charleston and the crab pot steaming by the road, and over the long bridge again the other way, and then twenty-four on 101. The cape cost you twenty-eight miles. The green sign said so the whole time you were out there, going up instead of down, and you went to the end anyway.");
      if (s.flags.counted_seals)
        base.push("So somebody knows, if it changes. You have been thinking about it since the cape.");
      base.push(
        "Bandon is cranberry bogs on the way in, flat and red-green and flooded in squares, and then an Old Town by a harbour with the light going long and gold across it.",
        "Below the bluff, the beach is full of rocks standing up out of the sand like the furniture of a house that has been taken away. One of them has a face, people say. In this light you can see why they say it.",
        "It is half past seven. The day has been very long and very good and nothing at all has gone wrong in it, and there are three hundred miles of the day still on the sign."
      );
      return base;
    },
    choices: [
      { text: "Fill up while the light holds", sub: (s) => pumpSub(s, { rate: 0.29 }, "Somebody pumps it for you. Port Orford is twenty-seven miles."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.29 }, next: "pc_015" },
      { text: "Go down to the beach and look at the face", sub: "Free. The steps down are steep and the light will not wait.", type: "neutral", next: "pc_015", outcome: "face", flags: { saw_face: true } },
      { text: "South", sub: "Safe — the light is going and there is a long way to go in it.", type: "safe", next: "pc_015" }
    ],
    outcomes: {
      face: [
        "Down on the sand the rocks are bigger than they looked from the top, and wetter, and each one has its own small weather of birds.",
        "The face is a rock lying on its back in the surf with its chin up, looking at the sky, and once you have seen it there is no way to stop seeing it. The story on the sign at the top says she was a girl who looked at the moon and was turned to stone for it.",
        "You climb back up the steps with your legs burning and turn round at the top. She is still looking up. The moon is not out yet."
      ]
    }
  },

  // 15 — PORT ORFORD. No harbour, so a crane lifts every boat out of the sea at
  // the end of the day and sets it on the dock. Pacific City's dories, again,
  // in a different shape: places on this coast that the sea will not keep a
  // boat for overnight.
  pc_015: {
    location: "Port Orford, OR — the dock",
    tags: ["quiet"],
    mile: 283,
    paywall: false,
    textFn: (s) => {
      const base = [
        "Port Orford is a town on a headland with the ocean on two sides, and it has a sign that says it is the westernmost town in the lower forty-eight. It is a small town to have to carry a fact that size.",
        "There is no harbour. There is a dock, built out from the rocks into open water, and at the end of the dock there is a crane.",
        "At the end of the day the boats come in and nose up under the crane one at a time, and a man in the cab swings the hook out, and they lift the whole boat out of the sea — dripping, crew and all — and set it down on a trailer on the dock for the night. There is nowhere in the water to leave it. The sea will not keep a boat here overnight."
      ];
      if (s.flags.saw_face)
        base.push("Twenty-seven miles back there is a stone face on a beach, chin up, looking at a sky that does not have the moon in it yet. You are still carrying her a little.");
      if (s.flags.asked_dory)
        base.push("Coming in you've got no choice left, the man at Pacific City said. Here they don't even come in. They get lifted.");
      base.push("Past the town, Humbug Mountain comes right down to the road, steep and dark with trees, and the highway goes round the bottom of it like it is being careful.");
      return base;
    },
    choices: [
      { text: "Fill up at the edge of town", sub: (s) => pumpSub(s, { rate: 0.30 }, "Small-town prices. Gold Beach is twenty-seven miles."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.30 }, next: "pc_016" },
      { text: "Watch them lift a boat out", sub: "Free. There is one coming in now.", type: "neutral", next: "pc_016", outcome: "crane" },
      { text: "South round Humbug Mountain", sub: "Safe — the light is going orange.", type: "safe", next: "pc_016" }
    ],
    outcomes: {
      crane: [
        "The boat comes in sideways under the hook with the swell lifting it and dropping it four feet at a time, and a man on the deck catches the cable on the second try and clips it on.",
        "Then the whole boat goes up. Thirty feet of it, out of the sea, water pouring off the keel, the man still standing on the deck with one hand on the cable, swinging slowly round over the dock like something being put back on a shelf.",
        "It comes down on the trailer as gently as a cup on a saucer. The man steps off it onto the dock and goes to get a coffee. Nobody watching applauds, because nobody watching is anybody but you."
      ]
    }
  },

  // 16 — GOLD BEACH. The mouth of the Rogue. A jet boat up the river to where the
  // mail boat used to go, for more money than most people have in the car.
  pc_016: {
    location: "Gold Beach, OR — the mouth of the Rogue",
    tags: ["money","quiet"],
    mile: 310,
    paywall: false,
    text: [
      "The Rogue comes down out of the mountains and meets the sea at Gold Beach, under another of the long arched bridges, wide and green and moving fast.",
      "On the north bank there is a dock with jet boats tied along it, flat and open with rows of bench seats, and a board. RIVER RUN · 64 MILES · UP TO AGNESS AND BACK · $55. They have carried the mail up this river by boat for over a hundred years, the board says, because for most of that time there was no road. There is one now. They still carry the mail.",
      "The last boat of the day is already out. The board says the first one tomorrow is at eight.",
      "The sun is low and red and flat on the water, and the town is lighting up behind you a window at a time."
    ],
    choices: [
      { text: "Buy a seat on tomorrow's eight o'clock", sub: "Requires $55 — and a night in Gold Beach, and a day of the road you do not have.", type: "neutral", requires: { walletMin: 55 }, next: "pc_017", deltas: { wallet: -55 }, outcome: "ticket", flags: { bought_jetboat: true } },
      { text: "Fill up at the river", sub: (s) => pumpSub(s, { rate: 0.31 }, "Brookings is twenty-nine miles. After that, California."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.31 }, next: "pc_017" },
      { text: "Walk out on the jetty while the sun goes", sub: "Free. It is going whether you watch it or not.", type: "neutral", next: "pc_017", outcome: "jetty" },
      { text: "South while there is light", sub: "Safe — the best of the Oregon coast is the next twelve miles and it is getting dark.", type: "safe", next: "pc_017" }
    ],
    outcomes: {
      ticket: [
        "The woman at the window takes your fifty-five dollars and writes you a ticket by hand and says eight sharp, they don't wait.",
        "You walk back to the car holding it. A ticket for tomorrow, for a boat up a river, from a town you will not be in tomorrow, because you are driving to California tonight.",
        "You knew that when you bought it. You put it in the visor with the other things you have kept today, and you start the car."
      ],
      jetty: [
        "The jetty is a long arm of black boulders reaching out into the river mouth, and you walk out along the top of it until the town is behind you and there is only the river going out and the sea coming in, meeting in a line of standing waves.",
        "The sun goes down into the sea without any fuss, the way it does here, all at once at the end, and the line of standing waves turns grey.",
        "When you get back to the car the streetlights are on."
      ]
    }
  },

  // 17 — THE BOARDMAN CORRIDOR. The twelve best miles of the Oregon coast, free,
  // in the last of the light. Oregon gives it away on the way out.
  pc_017: {
    location: "US-101 — the Boardman corridor",
    tags: ["quiet"],
    mile: 325,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.bought_jetboat)
        base.push("The jet boat ticket is in the visor. Eight sharp. They don't wait.");
      base.push(
        "South of Gold Beach the road climbs onto the cliffs and stays up there, and for twelve miles there is a turnout every half mile, each one with a little sign and a path into the trees and the last of the light coming through them sideways.",
        "Arch Rock. Natural Bridges. Secret Beach. Whaleshead. The names are on brown signs, one after another, and every one of them is free.",
        "Halfway along, the road crosses a gorge on a bridge so high that the trees at the bottom of it look like moss. A sign at the end says it is the tallest bridge in Oregon. There is nowhere to stop on it. You are over it before you have finished reading.",
        "Oregon is giving away its best twelve miles on the way out of the door, and it is nearly too dark to see them."
      );
      return base;
    },
    choices: [
      { text: "Stop at Natural Bridges", sub: "Free. A short path. The light is nearly gone.", type: "neutral", next: "pc_018", outcome: "bridges", flags: { saw_bridges: true } },
      { text: "Pull over and walk back to look at the tall bridge", sub: "Nerve check — there is a trail down the side, steep, in the near-dark.", type: "neutral", check: { stat: "nerve", difficulty: 5 },
        success: { next: "pc_018", outcome: "tall", deltas: { nerve: +1, gut: +1 } },
        failure: { next: "pc_018", outcome: "tall_bad", deltas: { nerve: -1 } } },
      { text: "Drive it without stopping", sub: "Safe — you can see it from the car, mostly.", type: "safe", next: "pc_018" }
    ],
    outcomes: {
      bridges: [
        "The path goes through salal and spruce to a platform on the edge of the cliff, and below the platform the sea has eaten through the rock in two places, so that the headland stands out in the water on legs, in arches, with the ocean going in and out underneath it.",
        "There is just enough light to see it and then there isn't. You stand there through the last of it. A couple at the other end of the platform are doing the same thing and nobody says anything until it is dark, and then the woman says 'well,' and they go."
      ],
      tall: [
        "The trail goes down the side of the gorge in switchbacks, steep and soft with needles, and at the bottom of the first stretch you can look up and see the bridge from underneath.",
        "It goes across the sky. That is the only way to say it. Three hundred feet up, a line of steel against the last pale bit of the evening, and a car going across it with its lights on, very small, making no sound at all from down here.",
        "You climb back up in the dark and your legs are not happy and you do not care."
      ],
      tall_bad: [
        "You go a little way down the trail and the light goes before you get to where you could see anything, and the path goes from steep to steep and wet, and you stop.",
        "You stand in the dark in the trees for a minute listening to a car go over the bridge somewhere above you, and then you climb back up to the road by feel."
      ]
    }
  },

  // 18 — BROOKINGS. The last Oregon pump. Somebody fills it for you one more
  // time and tells you, unasked, what is about to happen to the price.
  pc_018: {
    location: "Brookings, OR — the last Oregon pump",
    tags: ["money","night"],
    time: "night",
    mile: 339,
    paywall: false,
    textFn: (s) => [
      ...(s.flags.saw_bridges ? ["The headland on its legs, with the sea going in and out underneath it, is behind you in the dark now. You are glad you stopped. You are aware of having been glad of every stop today, and of every one of them being somewhere behind you."] : []),
      "Brookings is lit up along the highway, motels and a burger place and a station with a canopy that is the brightest thing for miles.",
      "A girl in a reflective vest comes out to the window before you have the engine off. She looks at your plates.",
      "'California?' You say yes. 'Fill it here,' she says. 'It's about a third more over the line, and you pump it yourself.' She says it like she has said it four hundred times, because she has.",
      "Six miles south there is a state line. After that there is nobody to come to the window."
    ],
    choices: [
      { text: "Let her fill it, one last time", sub: (s) => pumpSub(s, { rate: 0.30 }, "The last Oregon price. The last time anybody does this for you."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.30 }, next: "pc_019", outcome: "filled" },
      { text: "Thank her and go", sub: "Safe — you have what you have. California has gas too.", type: "safe", next: "pc_019" }
    ],
    outcomes: {
      filled: [
        "She fills it and washes the windscreen without being asked and the windscreen is still wet with it when you pull out.",
        "'Drive safe,' she says. Everybody in this state has said it to you today, one way or another. You do not know it yet but nobody is going to say it again."
      ]
    }
  },

  // 19 — THE CALIFORNIA LINE. A daylight-only inspection station shutting for the
  // night as you arrive, lily fields in the dark, and the first California
  // pump: self-serve, and a third more.
  pc_019: {
    location: "Smith River, CA — the state line",
    tags: ["money","night"],
    time: "night",
    mile: 345,
    paywall: false,
    textFn: (s) => {
      const base = [
        "WELCOME TO CALIFORNIA, the sign says, lit by your own headlights and nothing else.",
        "A quarter mile past it there is an inspection station across all the lanes, a long low roof with booths under it, the kind they have at the border of a country. The state checks what you are carrying in, for bugs, for fruit, for things that should not be here.",
        "It is open in daylight only. As you come up to it the last booth has its light on and a woman in a state uniform is standing in it with her jacket on. She looks at your car, and at the dark, and lifts one hand, and waves you through.",
        "Behind you the light in her booth goes off."
      ];
      if (s.flags.took_stone)
        base.push("There is a stone from a beach in Oregon in your cupholder. Nobody asked.");
      base.push(
        "The fields on both sides of the road are flat and dark and planted in rows. In the daytime you would see that they are lilies, nearly all the Easter lilies in the country, grown here for a reason the soil knows and nobody else is sure of. At night they are just rows.",
        "In the little town of Smith River there is a gas station with its canopy lit. Nobody comes to the window. There is a sign on the pump that says so, and a price per gallon that is not the price you have been paying all day."
      );
      return base;
    },
    choices: [
      { text: "Pump your own, at California prices", sub: (s) => pumpSub(s, { rate: 0.38 }, "A third more, like the girl said. Crescent City is twenty miles."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.38 }, next: "pc_020", outcome: "self" },
      { text: "On to Crescent City", sub: "Safe — twenty miles. There will be gas there too, at the same price.", type: "safe", next: "pc_020" }
    ],
    outcomes: {
      self: [
        "You get out and stand at the pump and do it yourself, and it is the first time all day, and it feels like the first time ever.",
        "The numbers go round faster than they did in Oregon. Or they go round at the same speed and mean more. You watch them either way."
      ]
    }
  },

  // 20 — CRESCENT CITY, NIGHT. Where to sleep. A motel at California prices,
  // the car at the harbour under a sign about overnight parking, or the
  // redwoods in the dark, where the elk are on the road.
  pc_020: {
    location: "Crescent City, CA — the harbour, night",
    tags: ["money","night","danger"],
    time: "night",
    mile: 365,
    paywall: false,
    textFn: (s) => {
      const base = [
        "Crescent City is a harbour and a long curve of beach and a town that has been knocked down by the sea twice in living memory and put itself back up both times. There are blue signs on the lamp posts that say ENTERING TSUNAMI HAZARD ZONE and, a little further on, LEAVING TSUNAMI HAZARD ZONE, and the town is between them.",
        "It is ten o'clock. You have been driving since seven this morning. There are three hundred and fifty-six miles left on the sign."
      ];
      if (s.flags.took_tidetable)
        base.push("The tide table from Pacific City says low water here is at five-forty tomorrow morning. There is a lighthouse on an island off the point that you can only walk out to at low water. You did not plan this. The tide table did.");
      base.push(
        "There is a motel on the main road with a VACANCY sign and a price on a board under it, California prices.",
        "Down at the harbour there is a car park facing the water, with sea lions barking out on the breakwater and a sign at the entrance about overnight parking that is too far away to read in the dark.",
        "South of town the highway goes into the redwoods. It is fifty miles of trees from here to anywhere, and the road through them is two lanes and dark, and there are elk."
      );
      return base;
    },
    choices: [
      { text: "Take a room", sub: "Requires $40 — a bed, a shower, and a door that locks. California prices.", type: "safe", requires: { walletMin: 40 }, next: "pc_021", deltas: { wallet: -40, gut: +2, nerve: +2 }, outcome: "room", flags: { slept_room: true } },
      { text: "Sleep in the car at the harbour", sub: "Gut check — the sign at the entrance said something about overnight. You did not read it.", type: "neutral", check: { stat: "gut", difficulty: 5 },
        success: { next: "pc_021", outcome: "harbour", deltas: { nerve: +1 }, flags: { slept_harbour: true } },
        failure: { next: "pc_021", outcome: "ticket", take: 25, deltas: { nerve: -1 }, flags: { slept_harbour: true, got_ticket: true } } },
      { text: "Drive on into the redwoods tonight", sub: "Gut check — fifty miles of dark two-lane, and the signs about elk are not decorative.", type: "neutral", check: { stat: "gut", difficulty: 6 },
        success: { next: "pc_021b", outcome: "elk_night", deltas: { gut: +3, nerve: -1 }, flags: { saw_elk_night: true } },
        failure: { next: "pc_021b", outcome: "elk_bad", deltas: { nerve: -3, gut: -1, tank: -6 }, flags: { elk_scare: true } } }
    ],
    outcomes: {
      room: [
        "The room is clean and small and smells of the cleaning, and the heater under the window comes on with a noise like a cough and stays on.",
        "You stand in the shower until the hot water starts to think about it. You lie on top of the covers meaning to get under them, and you do not get under them."
      ],
      harbour: [
        "You park facing the water at the far end, away from the lights, and put the seat back.",
        "The sea lions bark out on the breakwater all night, in shifts. A foghorn somewhere does what foghorns do, once every half minute, and by the second hour you have stopped hearing it, and then you are asleep.",
        "Nobody comes. Whatever the sign said, it did not say it to you."
      ],
      // Parking ticket, capped at what you have. Says what happened to it.
      ticket: (s) => [
        "You park facing the water and put the seat back and the sea lions bark all night and the foghorn goes every half minute and you sleep, eventually, badly, in pieces.",
        "In the morning there is an envelope under the wiper. HARBOR DISTRICT — NO OVERNIGHT PARKING — $25.",
        (s.taken || 0) >= 25
          ? "There is a slot in a post at the entrance for paying it. You put twenty-five dollars in the envelope and the envelope in the slot, because the alternative is a letter to whoever this car is registered to, and you would rather not think about that letter."
          : (s.taken || 0) > 0
            ? "There is a slot in a post at the entrance for paying it. You do not have twenty-five dollars. You put in what you have, and write a line on the envelope saying so, and post it, and feel stupid, and feel slightly better."
            : "There is a slot in a post at the entrance for paying it. You have nothing to put in the envelope. You put it on the dash, where it is going to ride with you, and you try not to look at it."
      ],
      elk_night: [
        "The trees close in over the road a mile out of town and then there is no sky. Just the headlights on the trunks, enormous, going by one after another like the legs of something.",
        "Twenty miles in there is a shape at the edge of the lights and you are already braking before you know what it is.",
        "She walks out into the road in front of you as if you were not there. An elk cow, as tall at the shoulder as the roof of the car, pale-rumped, unhurried. Then a calf. Then four more, one at a time, while you sit with your foot on the brake and the engine running and do not breathe.",
        "When they are gone you drive the rest of it at thirty, and you pull off at the first wide place under the trees and turn the engine off and sit there in the dark with your heart going until it stops going, and then you sleep."
      ],
      elk_bad: [
        "The trees close in over the road a mile out of town and then there is no sky, just the headlights on the trunks going by.",
        "You see her late. You are on the brakes and the back of the car comes round and you are on the shoulder at an angle, stopped, with the headlights pointing into the forest, and she is standing in the road behind you looking at you over her shoulder.",
        "She walks off into the trees. You sit with the engine running for a long time, longer than you would like to say, because you cannot make your hands do anything about it.",
        "When you can, you drive the rest of the way at twenty, and pull off at the first place there is, and do not sleep for a long time."
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // LEG 5 — CRESCENT CITY TO EUREKA. The redwoods, in the morning, in fog.
  // The first leg built to the California rule: its dangers are Nerve checks
  // (the tide at Battery Point, the bull at Elk Prairie), not Gut, so the
  // Drifter cannot drive it on instinct. Klamath to Trinidad is forty-one
  // miles with no pump in it, and the scarcity begins.
  // ═════════════════════════════════════════════════════════════════════════

  // 21 — CRESCENT CITY, MORNING. Fog. A lighthouse you can walk to only at low
  // water, which the tide table from Pacific City says is now.
  pc_021: {
    location: "Crescent City, CA — morning",
    tags: ["travel","money"],
    mile: 366,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.slept_room) base.push("You wake in the motel with the heater still coughing and the light coming grey round the curtain, and for a second you do not know which state you are in.");
      else if (s.flags.got_ticket) base.push("You wake in the car with your neck at an angle and an envelope from the harbour district somewhere in the car with you.");
      else if (s.flags.slept_harbour) base.push("You wake in the car at the harbour with the windows fogged solid and the sea lions still at it.");
      base.push(
        "Morning in Crescent City is fog. All of it, everywhere, the harbour and the beach and the town and the road out of it, white and close and dripping off everything.",
        "Off the point at the end of town there is a small island with a lighthouse on it, a white house with a lantern on the roof. Most of the day there is water between it and the shore."
      );
      if (s.flags.took_tidetable)
        base.push("Low water was at five-forty, the tide table from Pacific City says. It is ten past six. Between the shore and the island there is a path of wet rock and weed, and it is out of the water. It will not be for long.");
      else
        base.push("This morning there is a causeway of wet rock to it. You do not know how long that lasts. Somebody here does.");
      base.push("There is a diner on the main road with its lights on and a pump across the street where nobody comes to the window.");
      return base;
    },
    choices: [
      { text: "Walk out to the lighthouse before the tide turns", sub: "Nerve check — it is open now. The table says how long. You have to be back before that.", type: "neutral", showIf: (s) => !!s.flags.took_tidetable, check: { stat: "nerve", difficulty: 5 },
        success: { next: "pc_022", outcome: "battery", deltas: { gut: +2, nerve: +1 }, flags: { walked_battery: true } },
        failure: { next: "pc_022", outcome: "battery_wet", deltas: { nerve: -2 }, flags: { walked_battery: true, wet_battery: true } } },
      { text: "Pump your own", sub: (s) => pumpSub(s, { rate: 0.38 }, "California prices. Klamath is twenty miles, and then it is trees."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.38 }, next: "pc_022" },
      { text: "Breakfast at the diner", sub: "Requires $8 — eggs and coffee and somewhere warm to sit.", type: "neutral", requires: { walletMin: 8 }, next: "pc_022", deltas: { wallet: -8, gut: +1, nerve: +1 }, outcome: "diner" },
      { text: "South into the trees", sub: "Safe — the redwoods start a mile out of town.", type: "safe", next: "pc_022" }
    ],
    outcomes: {
      battery: [
        "The path across is rock and kelp and pools with things in them that close when your shadow goes over. The fog is so thick the lighthouse comes out of it in pieces: the rail, then the house, then the lantern.",
        "Up close it is just a house. Curtains. A bench by the door. Somebody lived here and kept the light going and walked across this at low water for groceries, and swam it, presumably, when they got the table wrong.",
        "You do not stay long. You can hear the water starting to come back round the far side of the island, quietly, the way it does everything.",
        "You are on the shore again with dry shoes and twenty minutes to spare, and the path behind you is already shining."
      ],
      battery_wet: [
        "The path across is rock and kelp and pools with things in them that close when your shadow goes over, and the lighthouse comes out of the fog in pieces, and you stand at the top of the island longer than you meant to.",
        "When you start back, the low places on the path have water in them. Then the path has water on it. By the middle it is over your knees and moving sideways, cold enough to stop your breath, and you go the rest of the way slowly, one foot feeling for the next, with the island behind you getting further away and the shore not getting any closer.",
        "On the beach you stand and shake. The tide table said. You read it, and it said, and you stayed anyway."
      ],
      diner: [
        "The waitress pours the coffee before you ask and leaves the pot. Two men at the counter are talking about crab and the price of it, and about a boat one of them used to have.",
        "The eggs are good. The window is white with fog all the way across, and you eat looking at it as if there were something to see."
      ]
    }
  },

  // 21b — IN THE TREES, MORNING. Where you stopped in the dark after the elk.
  pc_021b: {
    location: "US-101 — Del Norte Coast Redwoods, morning",
    tags: ["travel","quiet"],
    mile: 380,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.saw_elk_night) base.push("You wake with the seat back under trees so tall the morning has not reached the ground yet. You keep seeing them in the headlights. One at a time, unhurried, as if you were not there.");
      else if (s.flags.elk_scare) base.push("You wake with the seat back under the trees, stiff, with your hands still remembering the wheel. In daylight the shoulder you stopped on is wider than it felt.");
      base.push(
        "The trees here are redwoods, and you were not ready for them in the dark and you are not ready for them now. The trunks are the width of the car. They go up into the fog and you cannot see where they stop, and the light that comes down between them is green and comes down slowly, as if it were tired.",
        "It is completely quiet. A drip somewhere. The engine ticking as it cools from the night before. That is all."
      );
      return base;
    },
    choices: [
      { text: "Walk into the trees before you go", sub: "Free. Ten minutes. There is a path.", type: "neutral", next: "pc_022", outcome: "walk" },
      { text: "On to Klamath", sub: "Safe — the town is somewhere ahead in the fog.", type: "safe", next: "pc_022" }
    ],
    outcomes: {
      walk: [
        "The path is soft, made of a thousand years of needles, and it goes between the trunks like a corridor between buildings.",
        "There is a tree lying on its side across a gully that must have come down before anyone you have ever met was born, and it is still there, and things are growing out of it — ferns, small trees, a whole other forest along the top of it.",
        "You touch the bark of a standing one because you cannot not. It is soft. It gives a little under your hand, like something with a pulse."
      ]
    }
  },

  // 22 — KLAMATH. Two gold bears on a bridge, a fifty-foot man who talks, a
  // gondola into the canopy, and the last pump for forty-one miles.
  pc_022: {
    location: "Klamath, CA — the Trees of Mystery",
    tags: ["money","character"],
    mile: 386,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.wet_battery) base.push("Your jeans are wet to the thigh and the heater is losing to them and you keep thinking about the middle of that path, where the shore was not getting any closer.");
      else if (s.flags.walked_battery) base.push("You walked to a lighthouse this morning and back with dry shoes, because a tide table you picked up for nothing in Oregon told you when. You are still a little pleased about it.");
      base.push(
        "The bridge over the Klamath River has a golden bear at each end of it, painted gold, standing up on their back legs and looking at the traffic like they have been asked to and are prepared to keep doing it.",
        "A mile past the bridge there is a man forty-nine feet tall standing in a car park. He is blue-shirted and bearded and has an axe over his shoulder, and beside him is an ox the same blue as the sky is not today.",
        "He talks. As you pull in he turns his head, slowly, on a motor, and says hello to the family getting out of the car next to yours by the colours of their jackets. Somebody in the gift shop has a microphone and a window.",
        "Behind him there is a ticket booth for a gondola that goes up into the canopy. And across the road there is a gas station with a sign on it that someone has written on by hand: LAST GAS FOR A WHILE."
      );
      return base;
    },
    choices: [
      { text: "Pump your own at Klamath prices", sub: (s) => pumpSub(s, { rate: 0.41 }, "The handwritten sign is not lying. Trinidad is forty-one miles."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.41 }, next: "pc_023" },
      { text: "Ride the gondola up into the canopy", sub: "Requires $30 — up through the trees to a platform above them.", type: "neutral", requires: { walletMin: 30 }, next: "pc_023", deltas: { wallet: -30, gut: +2 }, outcome: "gondola", flags: { rode_gondola: true } },
      { text: "Talk back to the giant", sub: "Nerve check — out loud, in a car park, to a statue.", type: "neutral", check: { stat: "nerve", difficulty: 5 }, road: +1,
        success: { next: "pc_023", outcome: "bunyan", deltas: { nerve: +1 }, flags: { bunyan_warned: true } },
        failure: { next: "pc_023", outcome: "bunyan_bad", deltas: { nerve: -1 } } },
      { text: "Past the giant and south", sub: "Safe — forty-one miles of trees to Trinidad.", type: "safe", next: "pc_023" }
    ],
    outcomes: {
      gondola: [
        "The gondola is a little red cabin on a cable and it goes up through the trees at the speed of somebody climbing a ladder carefully.",
        "For a while you are among the trunks, and then you are among the branches, and then you are above the fog and the sun is on everything, and below you the fog is a white floor with the tops of the redwoods coming up through it like the masts of ships in a harbour.",
        "There is a platform at the top. You stand on it in the sun with five other people and nobody says anything for a long time, which you think is the right amount."
      ],
      bunyan: [
        "You stand in front of him and say good morning, which feels exactly as stupid as you expected.",
        "The head turns. 'Morning,' he says, a voice the size of a building with somebody small and amused inside it. 'Going south?'",
        "You say yes.",
        "'Fill up across the road, then,' he says. 'It's trees from here to Trinidad, and the trees don't sell any.' And then, to a child behind you, in exactly the same voice: 'Nice hat.'"
      ],
      bunyan_bad: [
        "You stand in front of him meaning to say something and nothing comes out, and he turns his head and says 'Nice boots' to a man behind you, who looks down at his boots, pleased.",
        "You go back to the car. You were going to talk to a forty-nine-foot statue in a car park, and you could not do it, and you are not sure which of those two things is the strange one."
      ]
    }
  },

  // 23 — PRAIRIE CREEK. The highway bypasses the park. The old road goes
  // through it, past a meadow of elk, two miles longer. Same shape as the
  // Avenue of the Giants, smaller: a parallel that costs little distance.
  pc_023: {
    location: "Prairie Creek Redwoods, CA — the fork",
    tags: ["fork","quiet"],
    mile: 398,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.rode_gondola) base.push("You have stood above the fog this morning and looked down on the tops of these trees. From underneath them it is hard to believe there is a top.");
      base.push(
        "South of Klamath the highway is a new road, four lanes for a while, built to go around the park rather than through it.",
        "There is an exit before it does. A brown sign: NEWTON B. DRURY SCENIC PARKWAY. It is the old highway, the one they built the new one to avoid, and it goes through the middle of the oldest trees for ten miles and comes back out onto 101 at the other end.",
        "There are elk in there, a sign says. Do not approach the elk, another sign says."
      );
      return base;
    },
    choices: [
      { text: "Take the old road through the park", sub: "About two miles longer. Through the middle of it instead of round the edge.", type: "neutral", addMiles: 1, next: "pc_023p", flags: { took_parkway: true } },
      { text: "Stay on the new road", sub: "Safe — it is quicker, and there are trees on both sides of it too.", type: "safe", next: "pc_024" }
    ]
  },

  // 23p — ELK PRAIRIE. A meadow by the old road with the herd lying in the grass,
  // a bull with a rack of antlers, and people getting out of cars. A Nerve check,
  // because the Drifter's instinct is not what keeps you out of trouble here.
  pc_023p: {
    location: "Newton B. Drury Parkway — Elk Prairie",
    tags: ["danger","quiet"],
    mile: 398,
    paywall: false,
    text: [
      "The old road is two narrow lanes and the trees come right to the edge of the asphalt on both sides, and the light is green and moves when the wind moves the tops, three hundred feet above you.",
      "Halfway along, the trees stand back from a meadow. Long grass, wet with the fog, and lying in the grass, folded up like furniture, twenty elk.",
      "One of them is standing. A bull, the size of a horse and then some, with a rack of antlers like something that grew out of the forest rather than out of him. He is watching the road.",
      "Two cars are stopped on the shoulder. A man has got out of one of them with his phone held up and is walking into the grass, slowly, the way you walk towards something you think does not know you are there.",
      "It knows."
    ],
    choices: [
      { text: "Get out and get closer", sub: "Nerve check — the sign said not to. The man with the phone did not read it either.", type: "neutral", check: { stat: "nerve", difficulty: 6 }, addMiles: 1,
        success: { next: "pc_024", outcome: "close", deltas: { nerve: +1, gut: +1 } },
        failure: { next: "pc_024", outcome: "charged", deltas: { nerve: -3 }, flags: { bull_charge: true } } },
      { text: "Watch from the car with the engine off", sub: "Free. The window is enough.", type: "neutral", addMiles: 1, next: "pc_024", outcome: "watch" },
      { text: "Drive on slowly", sub: "Safe — whatever the man with the phone is about to learn, he can learn it without you.", type: "safe", addMiles: 1, next: "pc_024" }
    ],
    outcomes: {
      close: [
        "You get out and stand at the edge of the grass, no further, and that turns out to be exactly as far as you should go.",
        "The bull turns his head and looks at you. Not at the man with the phone. At you. It goes on for long enough that you understand you are being measured, and then he snorts once, loudly, a sound like a door slammed in another room, and looks away.",
        "You get back in the car. Your hands are completely steady, and you notice that, because you would have bet against it."
      ],
      charged: [
        "You get out. You take a few steps into the wet grass, because the man with the phone is further in than you and nothing has happened to him.",
        "Then the bull drops his head. It is not a big movement. That is the thing about it. He drops his head and takes three steps, very fast, not towards the man with the phone but towards you, and the ground does something you feel in your knees.",
        "You are in the car with the door shut before you know you have run. He stops at the edge of the grass, twenty feet away, and stands there, and then turns and walks back to the herd as if none of that happened.",
        "The man with the phone is standing very still in the middle of the meadow, looking at you. He did not get a picture. He walks back to his car without taking his eyes off the bull, and so do you, from inside yours, for a long time."
      ],
      watch: [
        "You turn the engine off and sit with the window down. The elk do nothing, at length. One of them flicks an ear. The bull shifts his weight.",
        "The man with the phone gets to within about thirty yards and the bull turns his head towards him, just the head, and the man stops, and stays stopped, and after a while backs away the way he came.",
        "Nobody got hurt. You saw the whole thing from the one place in the meadow nobody was being measured."
      ]
    }
  },

  // 24 — ORICK. Chainsaw carvings along the highway, and a woman who cannot get a
  // table into a truck on her own. The leg's income, and it is a Nerve check.
  pc_024: {
    location: "Orick, CA — US-101",
    tags: ["money","character"],
    mile: 407,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.bull_charge) base.push("You are still listening for something behind you. There is nothing behind you. There is a road and some trees.");
      else if (s.flags.took_parkway) base.push("The old road comes back out onto the new one at the south end of the park, and it is as though you have walked out of a building into a car park.");
      base.push(
        "Orick is a few buildings where Redwood Creek comes out of the hills to the sea, and along both sides of the highway there are carvings. Bears, mostly. Eagles. Several Bigfoots. All of them cut out of redwood with a chainsaw, some taller than a person, standing in rows in the yards of shops with their prices chalked on their chests.",
        "Outside one of the shops a woman is trying to get a table into the back of a pickup on her own. It is a single slab of a redwood burl with the bark still on the edge, and it is about the size of a door and very obviously heavier than she is.",
        "She has got one end of it up onto the tailgate. The other end is still on the ground. She is looking at it the way you look at a problem you have already solved twice this week."
      );
      return base;
    },
    choices: [
      { text: "Offer to take the other end", sub: "Nerve check — she has not asked, and she looks like she does not ask.", type: "neutral", check: { stat: "nerve", difficulty: 4 }, road: +1,
        success: { next: "pc_025", outcome: "table", deltas: { wallet: +20 }, flags: { carried_table: true } },
        failure: { next: "pc_025", outcome: "table_slow", deltas: { wallet: +8, nerve: -1 }, flags: { carried_table: true } } },
      { text: "Look at the carvings", sub: "Free. Every price is chalked on.", type: "neutral", next: "pc_025", outcome: "carvings" },
      { text: "South", sub: "Safe — Trinidad is twenty miles, and there is gas there.", type: "safe", next: "pc_025" }
    ],
    outcomes: {
      table: [
        "She looks at you, and at the table, and says 'Lift with your legs,' which is the whole of the negotiation.",
        "It is heavier than it looks, which is saying something. You get it up on three and slide it in and she ratchets two straps over it without looking at what her hands are doing.",
        "She goes into the shop and comes back with a twenty and holds it out. You start to say no and she is already holding it out further. 'It's a ninety-dollar delivery fee if I'd waited for my son,' she says. 'You're cheap.'"
      ],
      table_slow: [
        "You take the other end and it is a great deal heavier than it looks and you nearly drop your end on the first try, and she has to take most of it while you find a grip.",
        "It goes in on the third attempt. She straps it down. She gives you eight dollars and says 'For the first try,' and you cannot tell whether she is joking and decide not to ask."
      ],
      carvings: [
        "Up close they are better than they had any right to be. The bears have expressions. One of them looks tired, sitting down, with its paws on its knees like a man at the end of a shift.",
        "The prices go from forty dollars for one you could carry to three thousand for one you would need a truck for. There is a Bigfoot by the door with SOLD chalked on it and an address in Ohio."
      ]
    }
  },

  // 25 — TRINIDAD. A headland village with a pier and a white lighthouse, and
  // the first pump in forty-one miles.
  pc_025: {
    location: "Trinidad, CA — the pier",
    tags: ["travel","money"],
    mile: 427,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.carried_table) base.push("Your back knows exactly what you did in Orick and is going to remind you about it at intervals for the rest of the day.");
      if (s.flags.bunyan_warned) base.push("The trees did not sell any. He was right about that, the man inside the giant.");
      base.push(
        "Trinidad is a village on a headland, a few streets of shingled houses and a church and a pier going out into a little bay with rocks standing in it, and on the bluff above the pier a small white lighthouse that somebody built as a memorial to people the sea kept.",
        "There is a gas station by the exit, the first since Klamath. Forty-one miles. Nobody comes to the window.",
        "Eureka is twenty-two miles south. After Eureka the coast goes away from you, and the map shows why: there is a long stretch of it where the road simply is not."
      );
      return base;
    },
    choices: [
      { text: "Pump your own", sub: (s) => pumpSub(s, { rate: 0.39 }, "The first pump since Klamath. Eureka is twenty-two miles."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.39 }, next: "pc_026" },
      { text: "Walk out to the end of the pier", sub: "Free. It is a long pier.", type: "neutral", next: "pc_026", outcome: "pier" },
      { text: "South to Eureka", sub: "Safe — twenty-two miles along the edge of a lagoon and then a bay.", type: "safe", next: "pc_026" }
    ],
    outcomes: {
      pier: [
        "The pier is long and wooden and there are people fishing off the end of it with buckets and folding chairs and the air of having been there since before the fog.",
        "A man pulls something up on his line that is mostly weed, looks at it, and throws all of it back, the weed included, with great care.",
        "The lighthouse on the bluff has a list of names on a plaque at its foot. You can see from here that it is a long list. You do not walk up to read it."
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 26 — PLACEHOLDER TERMINUS, EUREKA. Everything south of here is unwritten:
  // Fortuna, Garberville, Shelter Cove, the Avenue, Leggett, both arms below.
  // ═════════════════════════════════════════════════════════════════════════
  pc_026: {
    location: "Eureka, CA — Old Town",
    tags: ["travel"],
    mile: 449,
    paywall: false,
    isVictory: true,
    ending: 'daylight',
    arrival: "Eureka, CA — end of the written road",
    textFn: (s) => {
      const base = [
        "Eureka is a working town on a big grey bay, with an Old Town of painted Victorian houses at one end of it that were built by men who had cut down a great many trees and wanted everybody to know.",
        "One of the houses is green and has more turrets and scrollwork on it than a house strictly needs. It is the most elaborate building you have seen on this trip. Somebody built it out of redwood to show what redwood could do, and it is standing there showing you."
      ];
      if (s.flags.wet_battery) base.push("Your jeans have finally dried, stiff with salt, in a tide line across both thighs. You think about the lighthouse keeper with the tide table on the kitchen wall, who would have read it the same way you did and then gone home on time.");
      else if (s.flags.walked_battery) base.push("Your shoes are dry. You walked to a lighthouse at low water this morning and you were back in time, and you think about the lighthouse keeper with the tide table on the kitchen wall, and the groceries.");
      base.push(
        "This is as far as the road is built.",
        "Two hundred and seventy-two more miles of it exist on paper: the Avenue of the Giants, a hundred miles of coast with no road on it at all, a dead-end town called Shelter Cove at the bottom of twenty-one miles of switchbacks, and two different ways into San Francisco.",
        "Thank you for driving this far."
      );
      return base;
    },
    choices: []
  }

  }
};

// ═══════════════════════════════════════════════════════════════════════════
// NOTES
//
// MILEAGE. Node `mile` is the US-101 spine. The Capes loop pays the difference
// with `addMiles` on each of its four legs — 5 + 6 + 5 + 5 = 21 — so the
// odometer reads true the whole way round instead of jumping at the entrance.
// Tillamook→Cloverdale is 21.7 on 101 and 43.1 by the loop (both measured by
// Ray, 2026-10-16), so 22 base + 21 extra = 43. Checks out.
//
// PUMPS. Astoria 0.26 · Cannon Beach 0.34 · Tillamook 0.28 · Cloverdale 0.27.
// Nothing on the loop, which is true: Oceanside, Netarts and Pacific City have
// no highway fuel to speak of. This is the route's whole mechanic in four
// numbers and one absence. Tune scarcity here, not `tankPerMile`.
//
// THE LESSON LADDER. The Column is four miles and costs nothing — the player
// should not notice learning anything. Three Capes is twenty-one and costs a
// pump. Shelter Cove, when it exists, is forty-two and costs a pump at the
// bottom of a dead end. Each one is the same lesson at the next volume.
//
// CAPE MEARES is the route's argument stated 600 miles early and for free: a
// road built for looking at something, which lost its argument with the
// hillside, and which the county stopped repairing rather than closed. The
// radio line that sets `heard_road_closed` is the only check-free way to know
// before you turn off.
//
// WHAT IS NOT HERE. Cord. He belongs at the end of the Shelter Cove road, mile
// ~470, with a second conditional sighting on the Albion–Point Reyes stretch.
// Nothing in this slice should foreshadow him; he is an observer and the point
// is that the hurrying player never learns they missed him.
//
// LEG 2 IS MONEY. Leg 1 taught distance; leg 2 puts a price on every stop that
// returns nothing the road can use — a whale boat with no promise on the board,
// a plate of cod, an elevator into a cliff. Fuel is everywhere on this stretch
// (Lincoln City 0.27, Newport 0.29) and that is the trick: the player learns to
// stop watching the needle exactly where the wallet starts going.
//
// THE OREGON COAST IS NOT SCARCE. There is gas every twenty miles or so from
// Astoria to Brookings. The Cloverdale card originally claimed 32 miles to the
// next pump; Lincoln City is 22 and has fuel the length of it. Corrected. The
// real scarcity on this route is California — the Lost Coast, Shelter Cove,
// CA-1 below Leggett — and Oregon's only dry roads are the ones off the highway.
//
// FIRST INCOME: the crab pots at Newport, $24 or $10. Route 3 had none before
// this and the Broke Kid cannot reach California without one.
//
// FIRST DANGER: Thor's Well. A failed Nerve check on the shelf is a sneaker wave
// and a `take: 12` — the sea has the money in your back pocket. Not a stranding;
// this route's harm is meant to be a bill, not a cliff.
//
// LEG 3 IS THE MIDDLE RUNG. Cape Arago is the route's first dead end: 14 miles
// out from Coos Bay to a road that ends in a loop, and 14 back the way you came.
// The ladder now reads Column (4) · Capes (21) · Arago (28, dead end) · Shelter
// Cove (42, dead end, no fuel at the bottom). Same lesson, louder each time.
// Arago's mileage is ESTIMATED (Coos Bay–Charleston 9, Charleston–cape 5) and
// wants Ray's map. So does Coos Bay–Bandon on 101, set at 24 here.
//
// The sand. The BEACH ACCESS sign off the dunes is the Cloverdale card paying
// off: a Gut check in an ordinary car. Failing it costs $20 or a dig, and the
// dig failing costs fuel and nothing else — the man with the strap will not
// watch you do that all afternoon. Nobody on this route leaves you there.
//
// LEG 4 IS THE TURN. Evening into night. Oregon gives away its best twelve
// miles (the Boardman corridor) free, in the last of the light, on the way out.
// Then California: the inspection station at Smith River is open in daylight
// only (CDFA, verified) and waves you through as it shuts; nobody comes to the
// window any more; fuel jumps from ~0.30 to 0.38. The coastal pricing ladder
// was always meant to climb going south, and this is where it does.
//
// THE NIGHT. Crescent City, mile 365, is the route's one night: Astoria to San
// Francisco is two days. A motel at $58 (out of reach for most), the car at the
// harbour (Gut check; failing is a $25 ticket as a `take`), or the redwoods in
// the dark, where the elk are on the road (Gut 6; failing costs fuel and nerve,
// not money -- a scare, not a bill). Two morning stubs, because driving on puts
// you twenty miles further than sleeping in town does.
//
// A PROMISE THE PROSE MAKES. At Brookings: "'Drive safe,' she says. Everybody in
// this state has said it to you today... nobody is going to say it again."
// Nobody in California may say "drive safe" to the player. Ever. Check every
// California scene for it.
//
// A SEED FOR THE BRIDGE. The harbour ticket mentions "a letter to whoever this
// car is registered to." That is the Golden Gate invoice, four hundred miles
// early. Keep the wording; never explain it.
//
// FREE LOOKS CHANGE NOTHING. Every free stop used to give +1 or +2 Gut, and this
// route is mostly free stops, so a player who looked at things maxed Gut by
// mid-Oregon 92-100% of the time -- and a maxed Gut cannot fail a difficulty-5
// check, which switched off the sand trap and the harbour ticket for exactly the
// player the route is written for. It also contradicted leg 2's own thesis. Now:
// looking is free and returns nothing; only what costs money, miles or risk
// changes you. The prose of every free stop is unchanged.
//
// LEG 5 IS THE REDWOODS, and the first leg built to the California rule: its
// dangers are Nerve checks -- the tide at Battery Point (Nerve 5, only offered if
// you carry the tide table from Pacific City, which says when low water is) and
// the bull at Elk Prairie (Nerve 6) -- so the Drifter cannot drive it on
// instinct. Klamath to Trinidad is forty-one miles with no pump in it: the
// first real scarcity, and the man inside the fifty-foot statue will tell you
// so if you can bring yourself to talk to him. Income: the burl table at Orick.
//
// The Drury Parkway is the Avenue of the Giants in miniature -- the old road
// through the park, a parallel that costs almost no distance (+2). It holds the
// elk meadow, so the parallel is where the danger is, not the bypass.
//
// pc_026 IS A STUB, flagged `isVictory` only so the graph terminates. Delete it
// when leg 6 -- Eureka to Leggett, by Shelter Cove -- lands.
// ═══════════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined') module.exports = PACIFIC_COAST;
