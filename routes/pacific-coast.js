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
      { text: "Ice cream, at nine in the morning", sub: "Requires $5 — there is a queue and you would be in it.", type: "neutral", requires: { walletMin: 5 }, next: "pc_003", deltas: { wallet: -5, gut: +1 }, flags: { had_icecream: true } },
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
        "NEXT GAS 32 MI — THEN 41 — WE ARE NOT KIDDING",
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
      { text: "South — you have enough", sub: "Safe, probably. Thirty-two miles is thirty-two miles.", type: "safe", next: "pc_005" }
    ],
    outcomes: {
      asked: [
        "'I did,' she says. 'Both lines. The second one about four years after the first one.'",
        "She rings up somebody's milk. 'People read the number and they think it's the distance. It's not the distance. It's the distance and then whether the one at the end of it is open.'",
        "'Is it open?'",
        "'Usually,' she says."
      ],
      asked_bad: [
        "'Been there a while,' she says, which is an answer to a question you did not ask, and she goes back to the till.",
        "On the way out you read it again. It does say we are not kidding. You had not misread it."
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 05 — PLACEHOLDER TERMINUS. Everything south of Cloverdale is unwritten:
  // Lincoln City, Newport, the dunes, Coos Bay, Brookings, the California
  // line, Eureka, Shelter Cove, the Avenue, Leggett. See the design spec.
  // ═════════════════════════════════════════════════════════════════════════
  pc_005: {
    location: "US-101 South — Oregon coast",
    tags: ["travel"],
    mile: 100,
    paywall: false,
    isVictory: true,
    ending: 'daylight',
    arrival: "Neskowin, OR — end of the written road",
    text: [
      "The road goes on south through Neskowin and Lincoln City and Depoe Bay and a great deal of water you have not seen yet.",
      "This is as far as it is built.",
      "Six hundred and twenty more miles of it exist on paper — the dunes, the Rogue, the California line, a hundred miles of coast with no road on it at all, a dead-end town called Shelter Cove, and two different ways into San Francisco.",
      "None of it is written. You are standing at the end of the part that is.",
      "Thank you for driving it."
    ],
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
// pc_005 IS A STUB, flagged `isVictory` only so the graph terminates and the
// harness can walk it. Delete it when leg 3 lands.
// ═══════════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined') module.exports = PACIFIC_COAST;
