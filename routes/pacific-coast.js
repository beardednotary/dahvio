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
      { text: "Walk down to the rock", sub: "Free. Twenty minutes. Your shoes will be wet after.", type: "neutral", next: "pc_003", deltas: { gut: +1 }, outcome: "walked", flags: { walked_beach: true } },
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
      { text: "Walk around the barriers", sub: "Free. Two miles on foot, there and back. The car stays here.", type: "neutral", addMiles: 5, next: "pc_c2", deltas: { gut: +2, nerve: +1 }, outcome: "walked", flags: { walked_meares: true } },
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
      { text: "Take a tide table", sub: "Free. It is a month of highs and lows for water you are leaving.", type: "neutral", addMiles: 5, next: "pc_004", deltas: { gut: +1 }, flags: { took_tidetable: true } },
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
      { text: "Walk the whole length of the D River", sub: "Free. It will not take long. That is the point of it.", type: "neutral", next: "pc_006", deltas: { gut: +1 }, outcome: "river" },
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
      { text: "Down to the docks to look at the sea lions", sub: "Free. Loud.", type: "neutral", next: "pc_007b", deltas: { gut: +1 }, outcome: "lions" },
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
      { text: "Watch it from the end of the trail", sub: "Free. From here it is just the most remarkable thing you have seen all day.", type: "neutral", next: "pc_009", deltas: { gut: +1 }, outcome: "trail" },
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
      { text: "Stand at the pullout and look at the lighthouse", sub: "Free. Everybody else is.", type: "neutral", next: "pc_010", deltas: { gut: +1 }, outcome: "light" },
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
  // 10 — PLACEHOLDER TERMINUS, FLORENCE. Everything south of here is unwritten:
  // the dunes, Reedsport, Coos Bay, the Rogue, Brookings, the California line,
  // Eureka, Shelter Cove, the Avenue, Leggett. See the design spec.
  // ═════════════════════════════════════════════════════════════════════════
  pc_010: {
    location: "Florence, OR — the Siuslaw bridge",
    tags: ["travel"],
    mile: 184,
    paywall: false,
    isVictory: true,
    ending: 'daylight',
    arrival: "Florence, OR — end of the written road",
    textFn: (s) => {
      const base = [
        "Florence is an old town on a river with another of the green bridges over it, and south of the bridge the land changes all at once.",
        "Sand. Not beach. Dunes, inland, as high as the trees and higher, going south for forty miles between the highway and the sea. Every half mile along 101 there is somebody renting something with big tyres that will take you out into them for an hour, and the price of an hour is on a banner."
      ];
      if (s.flags.worked_pots) base.push("Your hands still smell of the dock at Newport.");
      if (s.flags.went_down) base.push("You can still hear the cave if you think about it, which you keep doing.");
      base.push(
        "This is as far as the road is built.",
        "Five hundred and forty more miles of it exist on paper: the dunes, Coos Bay, the Rogue River, the California line, the redwoods, a hundred miles of coast with no road on it at all, a dead-end town called Shelter Cove, and two different ways into San Francisco.",
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
// pc_010 IS A STUB, flagged `isVictory` only so the graph terminates and the
// harness can walk it. Delete it when leg 3 lands.
// ═══════════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined') module.exports = PACIFIC_COAST;
