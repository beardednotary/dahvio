// ═══════════════════════════════════════════════════════════════════════════
// MILE MARKER — ROUTE 2 — DEEP SOUTH BACKROADS
// Memphis, TN → Mobile, AL · US-61 down the Delta, US-98 through the pines,
// south to the Gulf.
//
// Content module. Same schema as mile-marker-v2.html. Nothing in here touches
// the engine; see INTEGRATION at the bottom for the handful of places the
// engine assumes Route 1.
//
// Voice: the desert was absence. This is presence — too much of everything,
// and above all people, whose wanting you can't read. Sentences run longer
// and wetter, and stop short only when something is wrong.
//
// Cross-route reads use `s.carried?.x` (optional chaining) so nothing here
// throws if the carried-state key hasn't been added yet.
// ═══════════════════════════════════════════════════════════════════════════

const DEEP_SOUTH = {
  id: 'south',
  label: 'Route 2',
  name: 'Deep South Backroads',
  start: 'ds_001',
  victory: 'ds_014',
  miles: 547,                 // Memphis→Clarksdale→Greenville→Natchez→Columbia→Mobile on 61/98. Verified by Ray.
  tankPerMile: 0.30,          // 547 x 0.30 = 164 fuel (Route 1: 142 at 0.21). Higher because Delta gas is cheap. See TUNING at bottom — burn is not the Planner lever.
  strandReturnDefault: 'ds_011',

  // ── What you came away holding. Route 1's objects are not these. ────────
  // Highest rank wins, same shape as Route 1's keepsakeFor: an id, a label for the
  // victory badge, a short tag for the sign square, and the line the arrival speaks.
  keepsakeFor: (s) => {
    if (s.flags.took_photograph) return {
      id: 'photograph', tag: 'PHOTO', label: 'A photograph off a wall in Natchez',
      line: "The photograph rides in the visor the whole way down. A two-lane, a grade, a guardrail with three things wired to it. You have not taken it out again and you are not going to tonight."
    };
    if (s.flags.took_other_photo) return {
      id: 'photograph', tag: 'PHOTO', label: 'A photograph off a wall in Natchez',
      line: "The photograph rides in the visor the whole way down. A road, going away. You could not say which one, and you have stopped being sure that was ever the point."
    };
    if (s.flags.stayed_natchez) return {
      id: 'map', tag: 'MAP', label: 'A photocopied map',
      line: "There's a photocopied map in the door pocket that she pressed on you at the door, folded to the part you were driving, with a biro line down it in somebody else's hand. You did not need it once. You still have it."
    };
    if (s.flags.bought_gas) return {
      id: 'receipt', tag: 'RCPT', label: 'A gas receipt',
      line: "There's a receipt folded in the door pocket. Thermal paper, the kind that goes. In a month it will be blank and you will still have it."
    };
    return null;
  },

  // ── The radio. Same station. It shouldn't come in here. ──────────────────
  // Same rules as Route 1: at most one line, only while moving, never
  // confirmed. The livestock numbers in the last band are the Arizona
  // numbers, which the player may or may not have heard, and which nobody
  // in the game will ever remark on.
  radioBands: [
    { from: 0, to: 150, lines: [
      "The station comes in before you're out of the county. Cotton futures. A man reads them like he's reading them to the cotton.",
      "A gospel quartet, live or close to it. The bass singer is a half-step under everybody and nobody's fixing it.",
      "A boil-water notice for a county. He gives the county and he gives the reason and the reason is 'precautionary,' and that's the whole notice.",
      "The river stage for three towns, read in the order the water comes to them. He gets the middle one wrong, says so, and starts over from the top. The last number is the biggest and he reads it the same as the others."
    ]},
    { from: 150, to: 300, lines: [
      "A lost dog. Brown, some white, answers to a name. The description goes on longer than a dog needs — a scar, a way of holding one ear, a habit with screen doors. Whoever wrote it had time.",
      "The church schedule for a town you're not going through. Sunday school, worship, Wednesday supper. He reads the whole thing. Then he reads it again for the people who missed it.",
      "A funeral. Time, place, the family asks. He doesn't say what the family asks. He goes to a commercial for a car lot.",
      "The river stage again. Lower than before. He says it like that's good news, and maybe it is."
    ]},
    { from: 300, to: 430, lines: [
      "A preacher, mid-sermon, on how far a man can travel before he's actually gone anywhere. You've heard it. You can't place where. He doesn't finish it.",
      "The hog report. Barrows and gilts. A long pause with the mic open — you can hear a fan going in the room — and then the same numbers again.",
      "A weather report for Shelby County, Tennessee. Where you started. Highs in the nineties. It's night and you're four hundred miles south of there.",
      "A woman reads a list of names. First and last. No reason given. Eleven of them, and then a hymn.",
      // The only check-free, conduct-free way to learn the river is there at all.
      { text: "River stages, read as part of a longer list. He gets to the Pascagoula and says it twice — once the way it is spelled and once the way people down there say it — and goes straight on to the next one.", sets: 'heard_of_the_river' },
      // Pays off asking the clerk in Memphis about the pickup with the door open.
      // Never confirmed as that truck. Nothing follows it up.
      { text: "An abandoned vehicle advisory. A pickup, make and colour, left at a pump on Lamar Avenue in Memphis. Owner is asked to contact. He reads the plate twice because he misreads it the first time.", needs: 'asked_pickup' }
    ]},
    { from: 430, to: 600, lines: [
      "The tide table for Mobile Bay. Tonight. High at 11:40, he says, and you look at the clock, and you're going to be on the causeway around then.",
      "Road closures. One of them is 98 at the bay. He says it's been closed since Tuesday. You're on 98.",
      "Livestock prices. Feeder cattle, slaughter cows. The numbers are the same numbers. You couldn't say what you mean by that.",
      "A swap meet. Saturday, eight to two. He gives the town, and it's a town you drove through this morning, and it's behind you.",
      // Pays off calling it in at the crossroads on 49W.
      { text: "A sheriff's department thanks the public for its cooperation and says the matter on the county line is closed. He does not say what the matter was. The next thing is a feed store.", needs: 'called_checkpoint' }
    ]}
  ],

  // Scenes that handle the radio in their own prose, or where the engine is
  // off and the player is standing outside the car.
  radioSilent: ['ds_009a', 'ds_014', 'strand_1', 'strand_end', 'strand_resume'],

  nodes: {

  // ═════════════════════════════════════════════════════════════════════════
  // 01 — MEMPHIS. Before it's light. Somebody's already at the next pump.
  // ═════════════════════════════════════════════════════════════════════════
  ds_001: {
    location: "Memphis, TN — Lamar Avenue, 4:50 AM",
    tags: ["opening","money"],
    mile: 0,
    paywall: false,
    text: [
      "Memphis before it's light is a different city than the one on the signs. Lamar Avenue is warehouses and a rail yard and a gas station with a canopy that hums, and the air is already something you could wring out.",
      "There's a pickup at the other pump. Engine off, nobody in it, the driver's door standing open the way people leave a door when they mean to be right back.",
      "You've been here four minutes. Nobody has come back.",
      "Inside, the coffee is fresh because the clerk just made it for herself. She pours you one before you ask and says it's on the house, and looks at the pickup through the window while she says it.",
      "The radio behind the counter is on an AM station. A man reading something. Prices, or a schedule. You'd know the voice if you'd heard it before."
    ],
    choices: [
      { text: "Take the coffee and go", sub: "Free — she meant it. Small Gut.", type: "safe", next: "ds_002", deltas: { gut: +1 } },
      { text: "Buy a plate — whatever's under the lamp", sub: "Requires $6 — biscuits, something fried. Gut.", type: "neutral", requires: { walletMin: 6 }, next: "ds_002", deltas: { wallet: -6, gut: +2 } },
      { text: "Fill up before you leave the city", sub: (s) => pumpSub(s, { rate: 0.30 }, "City prices. The next pump is Clarksdale."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.30 }, next: "ds_002" },
      { text: "Ask about the pickup", sub: "Nerve check — it's none of your business. That's why you're asking.", type: "neutral", check: { stat: "nerve", difficulty: 5 }, road: +1,
        success: { next: "ds_002", outcome: "asked", deltas: { nerve: +1 }, flags: { asked_pickup: true } },
        failure: { next: "ds_002", outcome: "asked_bad", deltas: { nerve: -1 } } }
    ],
    outcomes: {
      asked: [
        "She says he went to check on something. She doesn't say what and she doesn't say when.",
        "The door on the pickup is still open when you pull out. The dome light's been on the whole time. It'll be dead by the time he gets back, whenever that is."
      ],
      asked_bad: [
        "She looks at you like you've asked what she makes an hour.",
        "'Couldn't tell you,' she says, and goes back to the register, and the pickup's door is still open when you leave."
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 02 — HIGHWAY 61. The Delta opens. A marquee.
  // ═════════════════════════════════════════════════════════════════════════
  ds_002: {
    location: "US-61 South — the Delta",
    tags: ["travel","tension"],
    mile: 35,
    paywall: false,
    text: [
      "Highway 61 south of the city goes flat in a way that takes about ten miles to believe. Cotton on both sides. Kudzu on everything that isn't cotton — poles, fences, a barn it has already finished with.",
      "The heat here is wet. It doesn't come off the road at you. It's already in the car.",
      "A church comes up on the right. White, small, a sign out front with the changeable black letters.",
      "REVIVAL THIS WEEK — ALL WELCOME — EVEN YOU"
    ],
    choices: [
      { text: "Slow down and read the rest", sub: "Gut check — there's a second line. Smaller.", type: "neutral", check: { stat: "gut", difficulty: 5 },
        success: { next: "ds_003", outcome: "read", deltas: { gut: +1 }, flags: { read_marquee: true } },
        failure: { next: "ds_003", outcome: "missed", deltas: { nerve: -1 } } },
      { text: "Keep the speed you've got", sub: "Safe — it's a church sign. They all say something.", type: "safe", next: "ds_003" }
    ],
    outcomes: {
      read: [
        "Underneath, smaller: TRAVELERS ESPECIALLY.",
        "The letters on that line are newer than the rest. Blacker. Somebody went and bought them."
      ],
      missed: [
        "You're past it before you get the second line.",
        "In the mirror it says the same thing backwards, and then the cotton has it."
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 03 — CLARKSDALE. The crossroads, 61 and 49. A man with a folding table.
  // ═════════════════════════════════════════════════════════════════════════
  ds_003: {
    location: "Clarksdale, MS — the Crossroads",
    tags: ["character","money","tension"],
    mile: 75,
    paywall: false,
    text: [
      "Clarksdale announces the crossroads with three guitars welded to a pole, because somebody sold his soul here, allegedly, and the town has decided to be about it.",
      "It's the junction of 61 and 49. A gas station, a tire place, a lot where a building used to be.",
      "There's a man at a folding table in the lot. Card table, two chairs, a hand-lettered sign: MAPS — DIRECTIONS — LOCAL KNOWLEDGE. A thermos. A stack of something photocopied.",
      "He's already looking at your plates when you pull in.",
      "'Mobile,' he says. Not a question. Then: 'You'll want to know about the bridge.'"
    ],
    choices: [
      { text: "Sit down and hear him out", sub: "Nerve check — he wants something. You don't know what yet.", type: "neutral", check: { stat: "nerve", difficulty: 6 }, road: +1,
        success: { next: "ds_004", outcome: "heard", deltas: { nerve: +1 }, flags: { crossroads_talked: true } },
        failure: { next: "ds_004", outcome: "heard_badly", deltas: { nerve: -1, wallet: -5 } } },
      { text: "Buy a map and don't sit", sub: "Requires $5 — a photocopy with a road drawn on it.", type: "neutral", requires: { walletMin: 5 }, next: "ds_004", outcome: "map", deltas: { wallet: -5 }, flags: { bought_map: true } },
      { text: "Fill up and leave him to it", sub: (s) => pumpSub(s, { rate: 0.24 }, "Delta prices. The pump's right there. He isn't."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.24 }, next: "ds_004", outcome: "left" }
    ],
    outcomes: {
      heard: [
        "He tells you 61 is fine to Vicksburg and the bridge is fine and there's nothing to know about the bridge.",
        "Then he tells you about a county road that cuts the corner off the Delta and saves you an hour, and draws it on the back of a photocopy without being asked, and doesn't charge you for it.",
        "You're the one who says thanks. He's already looking at the next car."
      ],
      heard_badly: [
        "You sit. He talks.",
        "It costs five dollars, which he mentions at the end, and the directions are for a road that as far as you can tell goes north."
      ],
      map: [
        "The map is a photocopy of a photocopy with one road drawn in by hand in ballpoint.",
        "'That one's the one,' he says, and taps it. He doesn't say the one what."
      ],
      left: [
        "You pump. He watches you pump.",
        "When you pull out he lifts the thermos an inch, which is either goodbye or a toast."
      ]
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FORK A opens. His road or yours. Neither is the right answer.
  // ─────────────────────────────────────────────────────────────────────────
  ds_004: {
    location: "Clarksdale, MS — South Edge of Town",
    tags: ["navigation"],
    mile: 78,
    paywall: false,
    text: [
      "Two roads out of Clarksdale go where you're going.",
      "Sixty-one keeps on being 61. Forty-nine West goes down the middle of the Delta past the state farm.",
      "And there's a county road east of both of them that nobody's put a number on."
    ],
    choices: [
      { text: "Take the county road", sub: (s) => (s.flags.crossroads_talked || s.flags.bought_map) ? "The one he drew. Saves an hour, he said." : "You don't know anything about it. That's the appeal.", type: "risky", next: "ds_004a", flags: { took_his_road: true } },
      { text: "Stay on the numbered roads", sub: "Safe — 49 West. The state farm, then Greenville.", type: "safe", next: "ds_004b", flags: { stayed_numbered: true } }
    ]
  },

  // ═════════════════════════════════════════════════════════════════════════
  // FORK A · HIS ROAD — a town with its name painted over, and a store where
  // the man knows which way you came in.
  // ═════════════════════════════════════════════════════════════════════════
  ds_004a: {
    location: "County Road — Off 49",
    tags: ["travel","tension"],
    mile: 95,
    paywall: false,
    text: [
      "The road is real. Blacktop, then chip-seal, then blacktop again where somebody had money one year.",
      "Cotton to the edge of the pavement on both sides, high enough that you're driving in a trench with the sky for a lid.",
      "A town comes up that isn't on your map or his. Two blocks. A post office with the flag up. A store.",
      "The sign at the town limit has been painted over. Whatever it was called, it isn't anymore."
    ],
    choices: [
      { text: "Stop at the store", sub: "There's a pump. There's a man. One of those you need.", type: "neutral", next: "ds_004a2" },
      { text: "Drive through", sub: "Safe — it's two blocks. You'll be out of it before you've decided.", type: "safe", next: "ds_004a3" }
    ]
  },

  ds_004a2: {
    location: "Unnamed Town — the Store",
    tags: ["character","money","tension"],
    mile: 100,
    paywall: false,
    text: [
      "The store has one pump out front and a screen door that announces you.",
      "The man behind the counter is doing a crossword. He doesn't look up. He says, 'You came in from the west.'",
      "You did. There's no window on that side.",
      "'Most people come in from the west,' he says, to the crossword."
    ],
    choices: [
      { text: "Buy gas", sub: (s) => pumpSub(s, { rate: 0.22 }, "The price isn't posted. He tells you after, and it is what he says it is."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.22 }, next: "ds_004a3" },
      { text: "Ask how far to 61", sub: "Nerve check — he'll answer. Whether it's an answer is another thing.", type: "neutral", check: { stat: "nerve", difficulty: 6 },
        success: { next: "ds_004a3", outcome: "told", deltas: { gut: +1, nerve: +1 }, flags: { store_directions: true } },
        failure: { next: "ds_004a3", outcome: "not_told", deltas: { nerve: -2 } } },
      { text: "Leave", sub: "The screen door announces you on the way out too.", type: "neutral", next: "ds_004a3" }
    ],
    outcomes: {
      told: [
        "'Twenty-two miles,' he says. 'Left at the gin.'",
        "He still hasn't looked up. You find out later he was right to the tenth."
      ],
      not_told: [
        "'Depends which way you go,' he says.",
        "That's all you get. You stand there long enough to understand it's all you're getting."
      ]
    }
  },

  ds_004a3: {
    location: "County Road — the Gin",
    tags: ["travel"],
    mile: 135,
    paywall: false,
    textFn: (s) => {
      const base = [];
      if (s.flags.store_directions) base.push("The county road finds 61 again at a cotton gin, twenty-two miles on, left at the gin, exactly where a man doing a crossword said it would.");
      else if (s.flags.crossroads_talked || s.flags.bought_map) base.push("The county road finds 61 again at a cotton gin, somewhere near where a man at a card table drew it in ballpoint.");
      else base.push("The county road finds 61 again at a cotton gin. You didn't know it would. It just does.");
      base.push(
        "It saved you an hour or it didn't. You're not sure you can tell anymore.",
        "The mirror has cotton in it and nothing else."
      );
      return base;
    },
    choices: [
      { text: "Gas at the gin", sub: (s) => pumpSub(s, { rate: 0.24 }, "One pump, a Coke machine, nobody."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.24 }, next: "ds_005" },
      { text: "South on 61", sub: "Greenville. A meal. The river after that.", type: "neutral", next: "ds_005" }
    ]
  },

  // ═════════════════════════════════════════════════════════════════════════
  // FORK A · YOUR ROAD — 49 West past Parchman, and a checkpoint that isn't.
  // ═════════════════════════════════════════════════════════════════════════
  ds_004b: {
    location: "US-49W — Past the State Farm",
    tags: ["travel","tension"],
    mile: 95,
    paywall: false,
    textFn: (s) => {
      const base = [
        "Forty-nine West runs straight down the Delta with the state penitentiary on the right for eleven miles.",
        "Parchman. You know the name from songs. From the road it's fields — the same cotton as everywhere else — and a fence a long way back, and men in the fields who don't look up because they've seen a car.",
        "A sign says DO NOT PICK UP HITCHHIKERS."
      ];
      base.push(s.carried?.hitchhiker_picked_up ? "You weren't going to. Not again." : "You weren't going to.");
      return base;
    },
    choices: [
      { text: "Keep it at the limit", sub: "Safe — eleven miles of fence. Nobody's in a hurry here.", type: "safe", next: "ds_004b2" },
      { text: "Get through it fast", sub: "Costs Fuel — you'd rather be past this.", type: "risky", next: "ds_004b2", deltas: { tank: -8, nerve: +1 } }
    ]
  },

  ds_004b2: {
    location: "US-49W — a Crossroads",
    tags: ["tension","character"],
    mile: 118,
    paywall: false,
    text: [
      "There's a car at a crossroads. Not across the road. Angled. A man in a vest standing beside it with a flashlight, though it's full day.",
      "He waves you down. No badge you can see. No light bar on the car.",
      "'Road's out ahead,' he says. 'Bridge.' He points east. 'Go around.'",
      "There's no water on the map for the next thirty miles."
    ],
    choices: [
      { text: "Do what he says", sub: "Safe — costs Fuel. Whoever he is, he's the one with the flashlight.", type: "safe", next: "ds_004b3", deltas: { tank: -10 }, flags: { went_around: true } },
      { text: "Say you'd like to see the bridge", sub: "Nerve check — there is no bridge. You both know it.", type: "risky", check: { stat: "nerve", difficulty: 7 },
        success: { next: "ds_004b3", outcome: "called_it", deltas: { nerve: +2 }, flags: { called_checkpoint: true } },
        failure: { next: "ds_004b3", outcome: "folded", deltas: { nerve: -2, tank: -10 } } },
      { text: "Turn around and find another way", sub: "Costs Fuel — the long way, on purpose.", type: "neutral", next: "ds_004b3", deltas: { tank: -14 } }
    ],
    outcomes: {
      called_it: [
        "He looks at you for a while.",
        "Then he says 'suit yourself' and steps back, and you drive on, and there's no bridge and nothing out and nothing wrong with the road at all.",
        "A mile on you check the mirror. He's gone. So is the car."
      ],
      folded: [
        "'Sir,' he says.",
        "That's all. Something about the way he says it puts you on the detour before you've decided to be."
      ]
    }
  },

  ds_004b3: {
    location: "US-49W — Indianola",
    tags: ["travel"],
    mile: 135,
    paywall: false,
    text: [
      "Forty-nine finds 61 at a town with a water tower and a Sonic.",
      "The Delta is the same in every direction and you have been in it for four hours.",
      "You did not save an hour. You're not sure anybody does."
    ],
    choices: [
      { text: "Gas by the Sonic", sub: (s) => pumpSub(s, { rate: 0.24 }, "Kids in the lot in a truck, going nowhere."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.24 }, next: "ds_005" },
      { text: "South on 61", sub: "Greenville. A meal. The river after that.", type: "neutral", next: "ds_005" }
    ]
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 05 — GREENVILLE. The diner where somebody pays. Hospitality as a bill.
  // The man in the tie is the face that comes back at Hattiesburg.
  // ═════════════════════════════════════════════════════════════════════════
  ds_005: {
    location: "Greenville, MS — Highway Diner",
    tags: ["money","character"],
    mile: 150,
    paywall: false,
    text: [
      "Greenville has a diner on the highway with a counter and six booths and a waitress who calls you baby and means nothing by it.",
      "You eat. It's good. It's the first thing since Memphis that was.",
      "When you go to pay, she says it's been taken care of.",
      "You ask by who. She tips her head at the door. There's a man getting into a sedan in the lot. Gray hair, short-sleeved dress shirt, the kind of tie a man wears to something. He doesn't look back.",
      "'He said you looked like you were going a long way,' she says."
    ],
    choices: [
      { text: "Let it stand", sub: "It's a meal. Somebody bought it. That's allowed.", type: "neutral", next: "ds_005b", outcome: "stood", deltas: { gut: +1 }, flags: { check_accepted: true } },
      { text: "Pay anyway", sub: "Requires $9 — nobody's carrying you.", type: "neutral", requires: { walletMin: 9 }, next: "ds_005b", outcome: "paid", deltas: { wallet: -9 }, flags: { check_refused: true } },
      { text: "Go out and thank him", sub: "Nerve check — he's halfway into the car and he wasn't waiting.", type: "neutral", check: { stat: "nerve", difficulty: 5 }, road: +1,
        success: { next: "ds_005b", outcome: "thanked", deltas: { nerve: +1, wallet: +20 }, flags: { thanked_him: true, check_accepted: true } },
        failure: { next: "ds_005b", outcome: "missed_him", deltas: { nerve: -1 }, flags: { check_accepted: true } } }
    ],
    outcomes: {
      stood: [
        "You leave a tip that's bigger than it needed to be, because you can't leave nothing.",
        "The sedan's gone when you get to the lot. You didn't hear it go."
      ],
      paid: [
        "'He already —' she says, and then stops, because you've put it down and you're not picking it up.",
        "She takes it. She doesn't say anything else. On the way out you understand that you've been a little rude and you couldn't say to whom."
      ],
      thanked: [
        "You catch him with the door open. He says it's nothing. He says he did the same drive once.",
        "He doesn't say when or why or which direction. He says 'Mobile,' and you didn't tell him Mobile. He hands you a folded twenty through the window without looking at it. 'Gas,' he says.",
        "Then he's in the car and the car's on 61 south ahead of you, and you follow it for six miles before it turns off, and you don't know why you were counting."
      ],
      missed_him: [
        "He's in the car before you're across the lot.",
        "You stand there. The waitress watches you do it through the window."
      ]
    }
  },

  ds_005b: {
    location: "Vicksburg, MS — Below the Bluffs",
    tags: ["money","travel"],
    mile: 229,
    paywall: false,
    text: [
      "Eighty miles of Delta and then the ground starts to rise, which it hasn't done since Tennessee, and Vicksburg is on top of it.",
      "There's a station at the bottom of the hill before the town proper. Two pumps. A man hosing the concrete for no reason you can see.",
      "Past it the road climbs, and past that is the river, and past that is the other state."
    ],
    choices: [
      { text: "Fill up here", sub: (s) => pumpSub(s, { rate: 0.26 }, "Last pump you know about for a while. The bluffs eat fuel."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.26 }, next: "ds_006" },
      { text: "Straight up to the bridge", sub: "Safe — costs nothing now. Might cost something later.", type: "safe", next: "ds_006" }
    ]
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 06 — VICKSBURG. The river. Cord is on the far end of the bridge.
  // Rules: he doesn't wave you down. He knows you're bound for Mobile. He
  // does not remember you unless you helped him. He doesn't explain.
  // ═════════════════════════════════════════════════════════════════════════
  ds_006: {
    location: "Vicksburg, MS — the Mississippi",
    tags: ["elcamino","travel"],
    mile: 230,
    paywall: false,
    textFn: (s) => {
      const base = [
        "Sixty-one drops out of the Delta at Vicksburg like it's been let go of. Bluffs. Trees. The first hill in two hundred miles, and the river under it, wider than it has any business being.",
        "The old bridge and the new one run side by side. You take the one you're allowed to.",
        "At the far end there's a pull-off. A historical marker. One car in it."
      ];
      // took_his_road / stayed_numbered, set at Clarksdale 150 miles back. He never
      // comments on where you have been, so this is the waitress's trick instead: an
      // observation that is only about the road.
      if (s.flags.took_his_road) base.push("There's red dust up the sills of your car that there wasn't in Clarksdale. Whatever that road was, it was not on the map the way he drew it.");
      else if (s.flags.stayed_numbered) base.push("You came in on the numbered roads the whole way, which cost you two hours and bought you nothing you can name, and you would do it again.");
      if (s.carried?.knows_cord_name) base.push("You know the shape of him before you know the car.");
      else base.push("An El Camino. Dark. Dusty in a way that doesn't match the weather here.");
      base.push("He's sitting on the hood with his back to the river, looking at the road you're on.");
      if (s.carried?.elcamino_debt) base.push("He lifts two fingers off his knee. That's all. It's more than he's given anybody.");
      base.push("He isn't going to wave you down. That isn't what he does.");
      return base;
    },
    choices: [
      { text: "Pull in", sub: "He's not going anywhere. That's the whole reason to.", type: "neutral", next: "ds_006a" },
      { text: "Keep going", sub: "Safe — you've had this conversation. Or one like it.", type: "safe", next: "ds_007", flags: { cord_passed_r2: true } }
    ]
  },

  ds_006a: {
    location: "Vicksburg, MS — the Pull-off",
    tags: ["elcamino","character"],
    mile: 231,
    paywall: false,
    textFn: (s) => {
      const base = [
        "You park two spaces down. He doesn't get off the hood.",
        "'Mobile,' he says. You didn't say Mobile. Nobody in this state has needed you to."
      ];
      if (s.carried?.knows_cord_name) base.push("'Cord,' you say. He nods like it's a thing that's true. He doesn't ask yours.");
      base.push(
        "'Ninety-eight's the road,' he says. 'Past Natchez. It goes through pines a while. Everybody wants to cut it.' He looks at the river. 'Don't cut it.'",
        "That's the whole conversation."
      );
      if (s.carried?.elcamino_debt) base.push("Before you go he says, 'We're square.' You didn't ask. You've been wondering since Arizona.");
      return base;
    },
    choices: [
      { text: "Ninety-eight, then", sub: "He said don't cut it. You heard him.", type: "neutral", next: "ds_007", deltas: { gut: +1 }, flags: { cord_warned_pines: true } }
    ]
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 07 — NATCHEZ. The house. Nobody knocks; you're invited in before you ask.
  // Route 2's object is earned here or not at all.
  // ═════════════════════════════════════════════════════════════════════════
  ds_007: {
    location: "Natchez, MS — a Street of Houses",
    tags: ["night","character","tension"],
    mile: 300,
    paywall: false,
    text: [
      "Natchez is where the money stopped in 1860 and stayed, in the form of houses. Big ones. White ones. Columns.",
      "It's dark by the time you get in. The gas station on the bypass is closed. The one downtown is closed. You're on a street of houses with lights in a few windows, and it's the kind of tired where the road keeps moving after you've stopped.",
      "A porch light comes on.",
      "A woman on the porch. Seventy, maybe. Housecoat. She says, 'You're the one from Memphis,' and you don't know how she'd know that and she doesn't say, and she says there's a room, and she says it the way you'd say the sky is blue."
    ],
    choices: [
      { text: "Go in", sub: "A room. A door that locks, probably. Costs a little Nerve to cross the porch.", type: "neutral", next: "ds_007a", deltas: { nerve: -1 }, flags: { stayed_natchez: true } },
      { text: "Thank her and sleep in the car", sub: "Safe — you know what a car is.", type: "safe", next: "ds_007c", deltas: { gut: -1 }, flags: { slept_car_natchez: true } },
      { text: "Ask how she knew", sub: "Nerve check — she might tell you. You might wish she hadn't.", type: "risky", check: { stat: "nerve", difficulty: 7 },
        success: { next: "ds_007a", outcome: "plates", deltas: { nerve: +1 }, flags: { stayed_natchez: true } },
        failure: { next: "ds_007c", outcome: "light_off", deltas: { nerve: -2 }, flags: { slept_car_natchez: true } } }
    ],
    outcomes: {
      plates: [
        "'Plates,' she says. 'Shelby County.'",
        "She's right. You'd forgotten they say that. She holds the screen door."
      ],
      light_off: [
        "She looks at you for a while.",
        "Then she says goodnight, and the porch light goes off with you still on the walk."
      ]
    }
  },

  ds_007a: {
    location: "Natchez, MS — the House",
    tags: ["night","character"],
    mile: 300,
    paywall: false,
    textFn: (s) => {
      const base = [
        "The house is bigger inside than the street let on, and the room is made up. Turned-down bed, a glass of water on the nightstand, a fan going.",
        "Downstairs the table is set. Three places. She sits at one. You sit at another. Nobody comes for the third and she doesn't clear it.",
        "You eat. She talks — about the river, about a flood in a year you don't know, about a son. She doesn't say where the son is. You don't ask.",
        "After, she brings a shoebox.",
        "'Pick one,' she says. 'Everybody who stays picks one.'",
        "Photographs. Hundreds. Black and white, some of them, and color gone orange. Roads, mostly. Roads and the things beside roads.",
        "One of them is a two-lane on a grade, at night. A guardrail with something wired to it. Three somethings."
      ];
      if (s.carried?.saw_turnout) base.push("You've stood somewhere like that. Or you've stood there. You put it down and you pick it up again.");
      return base;
    },
    choices: [
      { text: "Take the one with the guardrail", sub: "Costs Nerve — she'll see which one.", type: "neutral", next: "ds_008", outcome: "guardrail", deltas: { nerve: -1, gut: +1 }, flags: { took_photograph: true } },
      { text: "Take a different one — any of them", sub: "Safe — a road. There are hundreds.", type: "safe", next: "ds_008", outcome: "other", flags: { took_other_photo: true } },
      { text: "Say you couldn't", sub: "Nerve — it's her son's, or somebody's. You don't know that. You feel it.", type: "neutral", next: "ds_008", outcome: "refused", deltas: { nerve: +1 } }
    ],
    outcomes: {
      guardrail: [
        "She looks at which one.",
        "'That one,' she says. 'All right.' She puts the lid on the box."
      ],
      other: [
        "She doesn't look at which one.",
        "'All right,' she says."
      ],
      refused: [
        "'They all say that,' she says, and puts the lid on."
      ]
    }
  },

  ds_007c: {
    location: "Natchez, MS — the Street",
    tags: ["night","tension"],
    mile: 300,
    paywall: false,
    text: [
      "You sleep in the car on a street of houses with columns.",
      "At some point the porch light goes off. At some point it comes back on. You don't see anybody do either.",
      "In the morning there's a glass of water on your hood. Sweating. Full.",
      "You drink it. It's water.",
      "Under the glass, folded twice so it'd fit under the base, a ten."
    ],
    choices: [
      { text: "Get moving", sub: "The back seat was what it was. You slept anyway, some. The ten's real.", type: "neutral", next: "ds_008", deltas: { nerve: -1, wallet: +10 } }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FORK B opens. Ninety-eight, or the county route somebody told you not
  // to take.
  // ─────────────────────────────────────────────────────────────────────────
  ds_008: {
    location: "Natchez, MS — US-98 East",
    tags: ["navigation","morning"],
    mile: 305,
    paywall: false,
    textFn: (s) => {
      const base = [
        "Ninety-eight leaves Natchez going east, and within ten miles the pines close over it.",
        "The map shows two ways to Hattiesburg. Ninety-eight, which is the road. And a county route that swings south and picks 98 up again past Columbia, which the map draws thinner."
      ];
      if (s.flags.cord_warned_pines) base.push("Don't cut it, he said. He was looking at the river when he said it.");
      else if (s.flags.crossroads_talked) base.push("The man at the card table didn't mention this part. You're not sure that means anything.");
      return base;
    },
    choices: [
      { text: "Stay on 98", sub: "Safe — the road. Log trucks and no shoulder.", type: "safe", next: "ds_008a", flags: { stayed_98: true } },
      { text: "Cut south on the county route", sub: (s) => s.flags.cord_warned_pines ? "He said not to. It's a better road on the map." : "Thinner on the map. Maybe shorter. Maybe not.", type: "risky", next: "ds_008b", flags: { cut_pines: true } }
    ]
  },

  // ═════════════════════════════════════════════════════════════════════════
  // FORK B · NINETY-EIGHT — no shoulder, log trucks, a town with a dog.
  // ═════════════════════════════════════════════════════════════════════════
  ds_008a: {
    location: "US-98 East — Homochitto",
    tags: ["travel","tension"],
    mile: 330,
    paywall: false,
    text: [
      "The pines come to the edge of the pavement. Not near it. To it. There's no shoulder because there's nowhere for a shoulder to be.",
      "Log trucks. Every few minutes one comes the other way at sixty with the chains slapping, and the wind off it moves your car a foot toward the trees, and then it's gone and the pines close behind it like water.",
      "Forty miles of this. There's nothing to stop for because there is nothing."
    ],
    choices: [
      { text: "Hold the line", sub: "Safe — costs Nerve and a little Fuel. Brake, accelerate, brake. Every truck.", type: "safe", next: "ds_008a1", deltas: { nerve: -1, tank: -4 } },
      { text: "Tuck in behind a log truck going your way", sub: "Gut check — let him break the wind. If you pick the right one.", type: "neutral", check: { stat: "gut", difficulty: 6 },
        success: { next: "ds_008a1", outcome: "drafted", deltas: { tank: +6, gut: +1 } },
        failure: { next: "ds_008a2", outcome: "bark", deltas: { tank: -4, nerve: -2 } } }
    ],
    outcomes: {
      drafted: [
        "You tuck in behind one loaded heavy, and the road opens up ahead of him like he's the one clearing it, and for twenty miles you don't touch the brake."
      ],
      bark: [
        "The one you pick is empty and light and throws bark.",
        "A piece the size of a hand hits your windshield and doesn't break it. You drop back. Your hands are wrong on the wheel for a while."
      ]
    }
  },

  ds_008a2: {
    location: "US-98 East — Bude",
    tags: ["money","character"],
    mile: 355,
    paywall: false,
    text: [
      "A town. Bude. One light, a store, a mill that isn't running.",
      "The store has gas. The price is on a board, in chalk.",
      "There's a man on the bench out front with a dog. The dog looks at you. The man doesn't."
    ],
    choices: [
      { text: "Gas", sub: (s) => pumpSub(s, { rate: 0.24 }, "Chalk prices. Last pump before Hattiesburg that you can be sure of."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.24 }, next: "ds_008a3" },
      { text: "Ask the man about the road ahead", sub: "Nerve check — he hasn't looked at you. The dog has.", type: "neutral", check: { stat: "nerve", difficulty: 5 }, road: +1,
        success: { next: "ds_008a3", outcome: "warned", deltas: { gut: +1 }, flags: { bude_warned: true } },
        failure: { next: "ds_008a3", outcome: "dog", deltas: { nerve: -1 } } },
      { text: "Keep going", sub: "It's a bench. It's a dog.", type: "neutral", next: "ds_008a3" }
    ],
    outcomes: {
      warned: [
        "'Revival past Columbia,' he says. 'Big one. Tent. Cars in the field.'",
        "He looks at the dog. 'Don't stop.'",
        "The dog looks at you."
      ],
      dog: [
        "He says something to the dog.",
        "The dog keeps looking at you."
      ]
    }
  },

  ds_008a3: {
    location: "US-98 East — Open Ground",
    tags: ["travel"],
    mile: 380,
    paywall: false,
    text: [
      "Ninety-eight opens out past Bude the way a held breath does.",
      "Farms again. A sky again. Columbia ahead."
    ],
    choices: [
      { text: "On to Columbia", sub: "Past that, Hattiesburg. Past that, the Gulf.", type: "neutral", next: "ds_009" }
    ]
  },

  // ═════════════════════════════════════════════════════════════════════════
  // FORK B · THE COUNTY ROUTE — the better road, which is the first thing
  // wrong with it. It adds forty miles and ends at a church.
  // ═════════════════════════════════════════════════════════════════════════
  ds_008b: {
    location: "County Route — South of 98",
    tags: ["travel","tension"],
    mile: 330,
    paywall: false,
    text: [
      "The county route is the better road. That's the first thing wrong with it. Fresh blacktop, a line down the middle, a shoulder wide enough to park on.",
      "It goes south when Hattiesburg is east. The map said it swings back. The map was drawn by somebody.",
      "Twenty miles, and it hasn't swung."
    ],
    choices: [
      { text: "Trust the map", sub: "It has got to turn sometime. The county route is the shorter way if the map is telling the truth.", type: "neutral", next: "ds_008c" },
      { text: "Turn around now", sub: "Safe — costs Fuel twice. Back to 98 with nothing to show.", type: "safe", next: "ds_008a", deltas: { tank: -10 }, flags: { turned_back_pines: true } }
    ]
  },

  ds_008b2: {
    location: "County Route — the Church",
    tags: ["tension","night"],
    mile: 360,
    paywall: false,
    textFn: (s) => {
      const base = [
        "The road ends at a church.",
        "Not ends. Turns. But the church is what it turns around, and the church is why the road is good — the lot is paved and lit and big enough for two hundred cars, and there are two hundred spaces painted on it, and there's nobody.",
        "The sign out front has the changeable letters. It says the same thing the one on 61 said, three hundred miles ago. And then it says something else."
      ];
      base.push(s.flags.read_marquee
        ? "TRAVELERS ESPECIALLY. Then, under that: WE KNOW THE WAY."
        : "ALL WELCOME — EVEN YOU. Then, under that: WE KNOW THE WAY.");
      base.push("The road picks up again on the far side of the lot. East, finally.");
      return base;
    },
    choices: [
      { text: "Drive through the lot", sub: "It's a parking lot. Costs a little Gut to say that and mean it.", type: "neutral", next: "ds_008b3", deltas: { gut: -1 }, flags: { drove_the_lot: true } },
      { text: "Go around on the grass", sub: "Costs Fuel — the long way around two hundred empty spaces.", type: "safe", next: "ds_008b3", deltas: { tank: -3, nerve: +1 } }
    ]
  },

  ds_008b3: {
    location: "US-98 East — Near Columbia",
    tags: ["travel"],
    mile: 385,
    paywall: false,
    text: [
      "The county route finds 98 four miles short of Columbia. Forty miles later than 98 would have brought you, with the better road behind you and nothing to show for it.",
      "Or one thing. You know what's back there now."
    ],
    choices: [
      { text: "On to Columbia", sub: "Past that, Hattiesburg. Past that, the Gulf.", type: "neutral", next: "ds_009" }
    ]
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 08b2 — THE LOW PLACE. Water over the county route.
  //
  // Route 2's first failure state. The mountain grade's Deep South cousin: ordinary,
  // everywhere, and the depth is genuinely unreadable from inside a car. Paying the man
  // with the tractor is the certain way through, which is the point — it is the first
  // thing on this route that money buys and nothing else will.
  // ═════════════════════════════════════════════════════════════════════════
  ds_008c: {
    location: "County Route — the Low Place",
    tags: ["tension","money"],
    mile: 345,
    paywall: false,
    textFn: (s) => {
      const base = [
        "The road goes down into trees and the trees stand in water.",
        "Not a flood. Nothing dramatic. The blacktop runs on ahead of you and about forty yards of it is under, flat and brown and absolutely still, and it comes back out the other side and keeps going like nothing happened.",
        "There is no way to tell how deep it is. That is the entire problem and it is the same problem every time: still water over a road you can't see the bottom of looks identical at four inches and at four feet.",
        "A county sign leans in the ditch where somebody has backed into it. Nothing on it about water.",
        "Off to the right there's a house set back with a yard full of equipment, and a man in it on a tractor who has stopped what he was doing to watch you decide."
      ];
      if (s.flags.turned_back_pines)
        base.push("You already turned around once today. You know what turning around costs now, which is the problem with knowing things.");
      base.push("He doesn't wave you on and he doesn't wave you off. He just sits there with the engine running.");
      return base;
    },
    choices: [
      { text: "Pay him to pull you through", sub: "Requires $20 — he's done it before. The chain is already on the drawbar.", type: "safe", requires: { walletMin: 20 }, next: "ds_008b2", outcome: "tractor", road: +1, deltas: { wallet: -20, nerve: +1, tank: +12 }, flags: { paid_the_tractor: true } },
      { text: "Walk out into it and find the bottom", sub: "Gut check — you'll know in ten feet. You'll also be wet to the waist and it will be dark in an hour.", type: "risky", check: { stat: "gut", difficulty: 6 },
        success: { next: "ds_008b2", outcome: "waded", deltas: { gut: +2, tank: +8 } },
        failure: { next: "ds_008b2", outcome: "drowned_it", deltas: { nerve: -3, gut: -1 }, strand: true, strandReturn: "ds_008b2" } },
      { text: "Drive it", sub: "Nerve check — people do this every day. People also don't, every year, and that is in the paper.", type: "risky", check: { stat: "nerve", difficulty: 8 }, road: -1,
        success: { next: "ds_008b2", outcome: "drove_it", deltas: { nerve: +2, tank: +12 } },
        failure: { next: "ds_008b2", outcome: "drowned_it", deltas: { nerve: -3, gut: -2 }, strand: true, strandReturn: "ds_008b2" } },
      { text: "Back out and take the long way round", sub: "Costs fuel and the rest of the light. The map owes you nothing.", type: "safe", next: "ds_008b2", outcome: "backed_out", deltas: { tank: -24, nerve: -1 }, flags: { went_the_long_way: true } }
    ],
    outcomes: {
      tractor: [
        "He has the chain on your frame before you've finished saying it, and he doesn't take the twenty until afterwards, which is somehow worse than taking it first.",
        "The tractor goes in and the water comes up over the top of its rear tyres, which tells you what you wanted to know and did not want to know.",
        "On the far side he unhooks you and folds the bill into his shirt pocket without looking at it.",
        "'Culvert's been out since the spring,' he says. 'They know.'",
        "He is already turning around when you pull away."
      ],
      waded: [
        "You take your shoes off, which feels stupid, and then your socks, which feels worse, and you go in.",
        "Eleven inches at the deepest, over a hard bottom, and you can feel the painted line under your feet the whole way.",
        "You drive it at a walking pace with the window down and the wake going out ahead of you in a flat V, and the man on the tractor watches the entire thing and does not move.",
        "He lifts two fingers off the wheel when you pass. That's all."
      ],
      drove_it: [
        "You go in slow and steady in second with your foot on the gas, which is the thing everybody says, and the water comes up the door and the car gets light under you for about a second and a half.",
        "Then the tyres find it again and you're climbing out the other side with water running off the sills.",
        "Your hands do not come off the wheel for another mile.",
        "In the mirror the man on the tractor has gone back to whatever he was doing."
      ],
      drowned_it: [
        "It is deeper in the middle. It is always deeper in the middle.",
        "The engine takes a mouthful of it and stops being an engine — not a stall, a stop, final and mechanical and over.",
        "You sit in a car that is filling slowly around your ankles in the last of the light, forty yards from either side.",
        "The tractor is already coming. He has not hurried, and he does not say anything when he hooks you up, and the not saying anything is the whole conversation."
      ],
      backed_out: [
        "You back up two hundred yards to a field gate because there is nowhere to turn, and you go out the way you came in.",
        "The long way is forty miles and most of what's left of the light, and it runs you past the same church twice.",
        "The man on the tractor is still sitting there when you go back past. He raises his hand. You raise yours.",
        "Neither of you pretends it was anything else."
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 08a1 — THE BURN. Smoke across 98 at night.
  //
  // The mirror of the low place, and for the same reason: the safe line on this branch
  // had no price. Here the safe thing is the expensive thing — a room — because that is
  // what safe costs on a road with no shoulder. Prescribed burns are everywhere in the
  // Piney Woods and the pile-ups are in the paper every autumn. You cannot tell from
  // inside a car what is standing in smoke, which is the same problem as the water.
  // ═════════════════════════════════════════════════════════════════════════
  ds_008a1: {
    location: "US-98 East — the Burn",
    tags: ["tension","money","night"],
    mile: 345,
    paywall: false,
    textFn: (s) => {
      const base = [
        "You smell it a mile before you're in it. Not woodsmoke — green smoke, wet and resinous, the smell of something burning that did not want to.",
        "Then the headlights stop working the way headlights work. The beams go solid about thirty feet out and sit there, two white cones with nothing on the end of them.",
        "They've been burning the understory. Somewhere off to the south there's an orange seam low in the trees that comes and goes.",
        "The smoke lies across both lanes in bands. It thins and you can see a hundred yards and then it closes and you cannot see the line."
      ];
      if (s.flags.turned_back_pines)
        base.push("Second time tonight the road has told you it would rather you didn't.");
      base.push(
        "A pickup is stopped on the pavement ahead of you with its flashers going because there is nowhere to pull off. You come up on it at twenty and still too fast.",
        "There's a sign back at the county line for a motel in Lumberton. Eleven miles. On the other side of this."
      );
      return base;
    },
    choices: [
      // The safe option is the one that costs money. That is the whole point of it.
      { text: "Turn back for the motel in Lumberton", sub: "Requires $22 — eleven miles the wrong way, a bed, and the smoke will have lifted by six.", type: "safe", requires: { walletMin: 22 }, next: "ds_008a2", outcome: "motel", deltas: { wallet: -22, nerve: +1, tank: -6 }, flags: { lumberton_motel: true } },
      { text: "Pull in behind him and wait it out", sub: "Free, and it costs most of a tank — you are not sitting in that with the windows down.", type: "neutral", next: "ds_008a2", outcome: "waited", deltas: { tank: -20, gut: -1 }, flags: { waited_the_burn: true } },
      { text: "Go through it", sub: "Nerve check — twenty miles an hour, hazards on, and whatever is stopped in there is stopped in there.", type: "risky", check: { stat: "nerve", difficulty: 7 }, road: -1,
        success: { next: "ds_008a2", outcome: "through", deltas: { nerve: +2, gut: +1 } },
        failure: { next: "ds_008a2", outcome: "hit_it", deltas: { nerve: -3, gut: -2 }, strand: true, strandReturn: "ds_008a2" } }
    ],
    outcomes: {
      motel: [
        "You turn around in a logging cut and go back the eleven miles with the smoke behind you, which is worse, because now it's in the mirror and you keep checking it.",
        "The motel in Lumberton has eight rooms and four cars and a man who takes cash and does not ask where you're going.",
        "You sleep badly and the room smells faintly of the burn by morning anyway, because the whole county does.",
        "At six the road is clear and ordinary and there is nothing on it to show for any of it except a black margin either side of the pavement and the smell."
      ],
      waited: [
        "You pull in behind the pickup and put your flashers on and that is the entire plan.",
        "You run the engine because the alternative is sitting in it with the windows down, and you watch the gauge do what the gauge does.",
        "Nobody gets out of the pickup. For two hours nobody gets out of the pickup.",
        "When it finally lifts enough to move, he goes first, and he does not wave, and you follow his lights for nine miles without either of you going above thirty."
      ],
      through: [
        "You go in at twenty with the hazards on and both hands on the wheel and your window cracked an inch, because the smell tells you more than the light does.",
        "Twice something comes up out of it that turns out to be a reflector on a post.",
        "Once it is not a post. It is the back of a trailer, stopped, no lights, and you have time and you do not have much of it.",
        "You come out the far side into clean black air and the relief arrives about a mile later, all at once, and you have to slow down because of it."
      ],
      hit_it: [
        "The thing in the smoke is stopped and it is not a post.",
        "You get most of the way onto the margin before you reach it, which is the difference between this and the other version of tonight.",
        "The noise is small. That's what you won't get over — how small a noise it is.",
        "You are off the pavement with the pines right there and something underneath is dragging, and the man whose trailer it is comes back along the verge with a flashlight and says, before anything else, 'You all right?'"
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 09 — THE REVIVAL. A tent in a field at midnight. It's just a revival.
  // There are a hundred of these a summer down here.
  // ═════════════════════════════════════════════════════════════════════════
  ds_009: {
    location: "US-98 East — Past Columbia",
    tags: ["night","tension","choice"],
    mile: 392,
    paywall: false,
    textFn: (s) => {
      const base = [
        "Past Columbia the sound comes first. Then the light.",
        "A tent in a field, big enough for a circus, lit from inside so the canvas glows. Cars on the grass in rows. A generator you can hear under the singing, and the singing is a lot of people who know the words.",
        "There's a boy at the gate with a flashlight, waving cars in."
      ];
      if (s.flags.bude_warned) base.push("Don't stop, the man said. The dog agreed.");
      // Fork B rejoins here, so this is where the two roads can be told apart.
      if (s.flags.cut_pines && s.flags.paid_the_tractor) base.push("Your doors are wet to the handles and there is a chain mark on the frame you will find later. The boy with the flashlight looks at the water line on your car and then at you, and waves you in anyway.");
      else if (s.flags.went_the_long_way) base.push("You came the long way round and the long way round took the light with it. Every car in that field got here before you did.");
      else if (s.flags.cut_pines) base.push("There is pine straw in your wipers and a smell of standing water coming off the car that you have stopped noticing.");
      else if (s.flags.lumberton_motel) base.push("You slept eleven miles back the wrong way and you are still earlier than you would have been.");
      else if (s.flags.waited_the_burn) base.push("Two hours behind a stranger's flashers and you can still taste it. The singing is the first clean thing since the county line.");
      if (s.flags.drove_the_lot) base.push("You think about the church with the gravel lot and the cars in it at that hour, and this is the second one tonight, and this one has a boy at the gate who is glad to see you.");
      base.push("It's a revival. That's all it is. There are a hundred of these a summer down here.");
      return base;
    },
    choices: [
      { text: "Pull in", sub: "The boy's waving. It'd be strange not to.", type: "neutral", next: "ds_009a", flags: { revival_stopped: true } },
      { text: "Drive past", sub: "Safe — it's not for you. It said it was. It isn't.", type: "safe", next: "ds_010", outcome: "passed", flags: { revival_passed: true } }
    ],
    outcomes: {
      passed: [
        "The singing stays with you a mile. Then two.",
        "Then it's the tires, and you turn the radio up to be sure, and it's just the tires."
      ]
    }
  },

  ds_009a: {
    location: "The Revival — Inside",
    tags: ["night","character","money"],
    mile: 392,
    paywall: false,
    text: [
      "The boy puts you in a row. You sit in the car a minute with the windows down and the singing coming in.",
      "You go in. Nobody looks at you. That's the thing you'd remember, later, if anybody asked — nobody looked. Three hundred people and a preacher and a woman at a piano, and you walked down the side of it and nobody turned.",
      "The preacher is on the road. What it takes from a man. How far a man can go before he's gone anywhere.",
      "You've heard it. You can't place where. He doesn't finish it either.",
      "A plate comes around.",
      "There's a bill on it. Folded once. It wasn't there when the plate started down the row, and nobody's looking at it, and nobody's looking at you."
    ],
    choices: [
      // The overshoot is the joke: you reach for five and the plate takes ten.
      // scaleToWallet caps it at what you have, and the receipt says so.
      { text: "Put something in", sub: "Requires $5 — it'll be more than you meant.", type: "neutral", intentionalPrice: true, requires: { walletMin: 5 }, road: +1, next: "ds_010", outcome: "gave", deltas: { wallet: -10, gut: +1 }, flags: { gave_at_revival: true } },
      { text: "Pass it on", sub: "Costs Nerve — three hundred people and you're the one who passed it.", type: "safe", next: "ds_010", outcome: "passed_plate", deltas: { nerve: -1 } },
      { text: "Take what's on it", sub: "It was put there for somebody. Costs Gut to decide that's you.", type: "risky", road: -1, next: "ds_010", outcome: "took_it", deltas: { wallet: +15, gut: -1 }, flags: { took_from_plate: true } },
      { text: "Leave before it gets to you", sub: "Nerve check — the side of the tent is right there.", type: "neutral", check: { stat: "nerve", difficulty: 5 },
        success: { next: "ds_010", outcome: "slipped_out", deltas: { nerve: +1 } },
        failure: { next: "ds_010", outcome: "stood_up", deltas: { nerve: -2, gut: -1 } } }
    ],
    outcomes: {
      gave: [
        "It's more than you meant to give. Nobody says anything.",
        "A man at the end of the row nods once. At the plate, not at you."
      ],
      took_it: [
        "You take it. Nobody sees. That's the part you'll think about — that in three hundred people, nobody saw, and you can't decide if that means it was yours.",
        "The plate goes on down the row lighter."
      ],
      passed_plate: [
        "You pass it. The woman next to you doesn't look at you and doesn't look at the plate. She's looking at the front."
      ],
      slipped_out: [
        "You're out the side before the plate's halfway down the row. Nobody looks.",
        "The boy at the gate waves you out the same way he waved you in."
      ],
      stood_up: [
        "You stand up and the singing stops.",
        "Not for you. The song ended. But you're standing in three hundred people in the quiet, and you walk out in it, and it starts again when you're at the tent flap."
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 10 — COLUMBIA. The flat. This one has a cause, and that's worse.
  // ═════════════════════════════════════════════════════════════════════════
  ds_010: {
    location: "US-98 East — Shoulder",
    tags: ["money","tension"],
    mile: 400,
    shield: "US 98 EAST",
    paywall: false,
    textFn: (s) => {
      const base = [
        "Six miles on, the car pulls left.",
        "You know it. Everybody does.",
        "Rear driver's side, down to the rim. You get out and turn the tire and find it on the second turn: a nail. Roofing nail. New. The head's still bright."
      ];
      if (s.flags.revival_stopped) base.push("You know where you picked it up. The grass lot. Three hundred cars and one of them was yours.");
      else base.push("You don't know where you picked it up. There's nowhere in fifty miles you've been that had a nail in it. That's worse, somehow, than the other way around.");
      base.push("The pines are quiet. Nothing goes by.");
      return base;
    },
    choices: [
      { text: "Put the spare on", sub: "Free. It's a donut. Hattiesburg is thirty miles and you'll feel every one.", type: "safe", next: "ds_011", deltas: { nerve: -1 }, flags: { ds_on_donut: true } },
      { text: "Plug it — you've got a kit", sub: "Gut check — you've done this once. Maybe twice.", type: "neutral", check: { stat: "gut", difficulty: 6 },
        success: { next: "ds_011", outcome: "plugged", deltas: { gut: +1 } },
        failure: { next: "ds_011", outcome: "plug_failed", deltas: { tank: -6, nerve: -1 }, flags: { ds_on_donut: true } } },
      { text: "Run it to a tire shop in Hattiesburg", sub: "Requires $22 — Gut check. It might hold to town. It might not.", type: "risky", requires: { walletMin: 22 }, check: { stat: "gut", difficulty: 7 },
        success: { next: "ds_011", outcome: "ran_it", deltas: { wallet: -22 } },
        failure: { next: "ds_011", outcome: "rim", deltas: { tank: -14, nerve: -2 }, flags: { ds_on_donut: true } } }
    ],
    outcomes: {
      plugged: [
        "The plug goes in like it's supposed to. You air it off the little compressor for ten minutes with the engine running and it holds, and it keeps holding.",
        "You put the nail in your pocket. You don't know why."
      ],
      plug_failed: [
        "The plug goes in crooked and the air goes out around it, slower than before, which isn't the same as not at all.",
        "You put the donut on in the dark with the hazards going and nobody passing."
      ],
      ran_it: [
        "It holds. Barely, and loud, and you drive thirty miles at forty with your window down listening to it.",
        "The tire shop in Hattiesburg is open and the man says it's a wonder and charges you like it isn't."
      ],
      rim: [
        "It comes apart on the rim eleven miles short of town. You feel it go.",
        "You put the donut on in the dark. The tire's in three pieces on the shoulder behind you and you leave it there."
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 11 — HATTIESBURG. Who remembers you. The hidden number becomes a face.
  // The choices are gated on `road` with in-fiction lock text; the player
  // never sees a number, only what Loyce does or doesn't do.
  // ═════════════════════════════════════════════════════════════════════════
  ds_011: {
    location: "Hattiesburg, MS — Hardy Street",
    tags: ["money","character","tension"],
    mile: 430,
    paywall: false,
    textFn: (s) => {
      const base = [
        "Hattiesburg is a real city, the first since Memphis, and you feel it — lanes, lights, a Waffle House, people who don't look at you because there are too many of you.",
        "Gas on the strip. You pull in."
      ];
      // Greenville is on every road, so you passed him. Only one of the three choices
      // there had you look at him, and this is worth that much and no more.
      if (s.flags.thanked_him)
        base.push("The man at the register is in a short-sleeved dress shirt and a tie, and it's the tie you know before you know the face. You stood in a lot in Greenville and shook this man's hand.");
      else if (s.flags.check_refused)
        base.push("The man at the register is in a short-sleeved dress shirt and a tie. You put nine dollars on a counter in Greenville rather than let him buy your lunch. You didn't look at him properly then either.");
      else
        base.push("The man at the register is in a short-sleeved dress shirt and a tie. You have never seen him before in your life.");
      if (s.flags.thanked_him) base.push("He knows you too. 'Made it,' he says. Not a question.");
      else if (s.flags.check_refused) base.push("He looks at you the way you'd look at a bill somebody wouldn't let you pay.");
      else base.push("He looks at you the way you'd look at a bill you'd already paid.", "He knows you. You are certain of that and of nothing else about him.");
      base.push(s.flags.thanked_him || s.flags.check_refused
        ? "His name tag says LOYCE. It didn't, in Greenville. He wasn't wearing one."
        : "His name tag says LOYCE, which is a name you have never heard, and he wears it like a man who has been here for years.");
      const r = s.road || 0;
      if (r >= 3) base.push("'Reader on three's bad,' he says. 'Just tell me what you put in.'");
      else if (r <= 0) base.push("'Card's declined,' he says, before you've handed it to him. He's looking at the reader. 'Cash only on three.'", "There's nothing wrong with three.");
      else base.push("'Three's open,' he says.");
      return base;
    },
    choices: [
      { text: "Tell him what you put in", sub: (s) => pumpSub(s, { rate: 0.14 }, "You put in more than you say. He knows. He rings what you said."), type: "safe",
        requires: (s) => (s.road || 0) >= 3 && pumpOpen(s), lockText: (s) => (s.road || 0) >= 3 ? pumpClosed(s) : "He doesn't offer",
        pump: { rate: 0.14 }, next: "ds_fork", outcome: "rang_it_low", deltas: { nerve: +1 }, flags: { loyce_kind: true } },
      { text: "Fill up on three", sub: (s) => pumpSub(s, { rate: 0.32 }, "A pump. A price. The ordinary version."), type: "neutral",
        requires: (s) => (s.road || 0) > 0 && pumpOpen(s), lockText: (s) => (s.road || 0) > 0 ? pumpClosed(s) : "Card's declined, he says. He hasn't tried it.",
        pump: { rate: 0.32 }, next: "ds_fork", outcome: "ordinary" },
      { text: "Pay cash on three", sub: (s) => pumpSub(s, { rate: 0.38 }, "It's the same pump. It costs more today."), type: "neutral",
        requires: (s) => (s.road || 0) <= 0 && pumpOpen(s), lockText: (s) => (s.road || 0) <= 0 ? pumpClosed(s) : "You don't need to",
        pump: { rate: 0.38 }, next: "ds_fork", outcome: "cash_only", deltas: { nerve: -1 }, flags: { loyce_cold: true } },
      // Only for a player who knows who he is. The one who never looked up in Greenville
      // cannot ask about it, and gets the question that belongs to the scene he is in.
      { text: "Ask him if he remembers Greenville", sub: "Nerve check — you know he does. You want to hear him say it.", type: "risky", showIf: (s) => !!(s.flags.thanked_him || s.flags.check_refused), check: { stat: "nerve", difficulty: 7 },
        success: { next: "ds_fork", outcome: "remembers", deltas: { nerve: +1, gut: +1 }, flags: { loyce_spoke: true } },
        failure: { next: "ds_fork", outcome: "does_not", deltas: { nerve: -2 } } },
      { text: "Ask him how he knows you", sub: "Nerve check — he has called you by something close to your name and you have never seen him before.", type: "risky", showIf: (s) => !(s.flags.thanked_him || s.flags.check_refused), check: { stat: "nerve", difficulty: 7 },
        success: { next: "ds_fork", outcome: "how_he_knows", deltas: { nerve: +1, gut: +1 }, flags: { loyce_spoke: true } },
        failure: { next: "ds_fork", outcome: "does_not", deltas: { nerve: -2 } } }
    ],
    outcomes: {
      rang_it_low: (s) => s.lastShort
        ? ["You tell him what you have, and it is not a number either of you pretends is enough.",
           "He rings about half of it and waves the rest off, and doesn't look at the pump, and doesn't look at you while he does it.",
           "'Long way yet,' he says. 'Not as long as it was.'",
           "Then, while you are getting your keys out: 'You don't have to go to Mobile, you know. Sixty-three runs down to the river. Ain't much down there.' He says ain't much the way other men say you should see it."]
        : ["You say a number that's about half. He rings it. He doesn't look at the pump.",
           "'Long way yet,' he says. 'Not as long as it was.'",
           "Then, while you are getting your keys out: 'You don't have to go to Mobile, you know. Sixty-three runs down to the river.'"],
      ordinary: (s) => s.lastShort
        ? ["You put in what you have, which the pump works out before you do and stops on its own.",
           "He takes it without counting it and there is no change to give you.",
           "'That'll get you some of the way,' he says, and goes back to the reader that isn't broken."]
        : ["You pump. You pay. He gives you the receipt and the change and nothing else, and it's exactly what it should be, and you stand there a second longer than a person does."],
      cash_only: (s) => s.lastShort
        ? ["You count it out on the counter and it does not take long.",
           "He counts it again anyway, which is either courtesy or arithmetic, and sets the pump to stop where the money stops.",
           "'Have a good one,' he says, to the register."]
        : ["You count it out. He counts it again.",
           "'Have a good one,' he says, to the register."],
      remembers: [
        "He looks at you a long time.",
        "'I remember everybody I buy lunch for,' he says. 'Ain't that many.' Then: 'Gulf's ninety miles. Fill it here. There's nothing you'd want to stop at.'",
        "He doesn't say what there is that you wouldn't."
      ],
      how_he_knows: [
        "He takes his time. He wipes the counter, which does not need it.",
        "'Bought you lunch,' he says. 'Greenville. You were sat in the window.'",
        "You tell him you don't remember and he says that's all right, people don't, and he says it without any edge on it at all, which is the part that gets you.",
        "'Gulf's ninety miles,' he says. 'Fill it here. There's nothing you'd want to stop at.'",
        "He doesn't say what there is that you wouldn't."
      ],
      does_not: [
        "'Greenville,' he says, like it's a word he's heard.",
        "He rings you up. You pay. You get back in the car with the certain knowledge that he did, and chose not to, and that this was a decision he made about you."
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 11b — THE SPLIT. Hattiesburg lets go and the signs stop agreeing.
  //
  // Which roads are open is decided by who talked to you. Loyce or the man at Bude
  // for the river; the woman in Natchez and her photocopied map for the Pass. Nobody
  // is kept off a road for having been bad — that would make one of these a sentence.
  // ═════════════════════════════════════════════════════════════════════════
  ds_fork: {
    location: "Hattiesburg, MS — the Split",
    tags: ["navigation","choice"],
    mile: 435,
    paywall: false,
    textFn: (s) => {
      const base = [
        "Hattiesburg lets go of you at a light with nobody else at it, and a mile later the signs stop agreeing with each other.",
        "98 EAST — MOBILE 112. That's the one you've been on since Natchez without ever deciding to be.",
        "49 SOUTH — GULFPORT. A green sign the same size, pointing the other way down a road just as wide.",
        "The thing about this part of the state is that all of it ends in water. Every road down here does. The map has no opinion about which one you take."
      ];
      if (s.flags.loyce_spoke || s.flags.bude_warned)
        base.push(s.flags.heard_of_the_river && !(s.flags.loyce_spoke || s.flags.bude_warned || s.flags.loyce_kind)
          ? "There's a third. 63 SOUTH, smaller sign, lower down the post. You would have gone straight past it if a man on the radio had not said the name twice, hours ago, in a list of rivers."
          : "There's a third. 63 SOUTH, smaller sign, lower down the post. You'd have gone past it if somebody hadn't said the name to you out loud.");
      if (s.flags.stayed_natchez)
        base.push("The photocopied map is in the door pocket with a biro line down it in somebody else's hand, and the line does not go to Mobile. It never did. You have had it since Natchez and you are only looking at it now.");
      base.push("The light behind you changes for nobody.");
      return base;
    },
    choices: [
      { text: "East on 98", sub: "Mobile. The city, the bay, the bridge across it. The road you were already on.", type: "neutral", next: "ds_012" },
      { text: "South on 63", sub: "Pascagoula. A shipyard town on a river with a story attached to it.", type: "neutral", showIf: (s) => !!(s.flags.loyce_spoke || s.flags.bude_warned || s.flags.loyce_kind || s.flags.heard_of_the_river), next: "ds_p1" },
      { text: "Southwest on 49, and then west", sub: "The Pass. No city at the end of it. That appears to be the entire recommendation.", type: "neutral", showIf: (s) => !!s.flags.stayed_natchez, next: "ds_b1" }
    ]
  },

  // ═════════════════════════════════════════════════════════════════════════
  // PASCAGOULA — the river that is supposed to make a sound.
  // ═════════════════════════════════════════════════════════════════════════
  ds_p1: {
    location: "MS-63 South — Toward the Coast",
    tags: ["travel","night"],
    mile: 478,
    shield: "MS 63 SOUTH",
    heading: "Pascagoula",
    miles: 528,
    paywall: false,
    textFn: (s) => {
      const base = [
        "Sixty-three is two lanes and a centre line and nothing else for a long time.",
        "Then the smell arrives, which is the mill at Moss Point, and it is not a smell you can be neutral about. Sulphur and wet cardboard and something sweet underneath it that is worse than either.",
        "People live in it. There are porches with people on them in it.",
        "Further down, the sky over the trees goes a colour the sky does not go on its own — a low sodium orange with white in it, steady, not moving."
      ];
      if (s.flags.loyce_spoke) base.push("Loyce said the name like it was a place and not a story. You have been turning that over since the light at Hattiesburg.");
      base.push("That's the yard. They build ships there, at night, all night, and the glow off it is the brightest thing in the county.");
      return base;
    },
    choices: [
      { text: "Pull over and look at it a while", sub: "Costs a little fuel idling. You have come a long way to look at an industrial light.", type: "safe", next: "ds_p2", outcome: "looked", deltas: { tank: -4, gut: +1 } },
      { text: "Keep going. You can smell the water now.", sub: "Salt, under the mill. It has been getting stronger for ten miles.", type: "neutral", next: "ds_p2" }
    ],
    outcomes: {
      looked: [
        "You stop on the verge with the engine off and the window down and the mill in your sinuses.",
        "The yard throws enough light to read by from four miles off. Cranes. A hull up on blocks with a shape to it that does not make sense until you work out the scale, and then does not make sense any more after that.",
        "Welding light comes off it in bursts, blue-white, too bright to look at, and arrives without any sound at all.",
        "You sit there longer than you meant to, watching men you cannot see build something you cannot see the end of."
      ]
    }
  },

  ds_p2: {
    location: "Pascagoula, MS — the River",
    tags: ["tension","character","night"],
    mile: 508,
    heading: "Pascagoula",
    paywall: false,
    textFn: (s) => [
      "The road crosses the river on a low bridge and you pull off onto the gravel at the far end because there is a gravel place to pull off and because it is nearly over.",
      "Brackish water, wide and slow and black, going out to a sound you can't see yet.",
      "There's a man fishing off the bank with two rods in holders and a radio going, turned down to almost nothing.",
      "He nods. You nod. That is the whole of it for about four minutes.",
      "Then he says, without turning round: 'You hear that?'",
      "You say you don't know.",
      "'Singin' river,' he says. 'Summer evenings mostly. My daddy heard it. His daddy heard it.' He checks a rod that does not need checking. 'People'll tell you what it is. Catfish, gas off the bottom. Whatever you want.'",
      "You ask him what he thinks it is.",
      "He takes long enough that you think he is not going to answer.",
      "'I think there was people here before us,' he says, 'and something happened to 'em, and they told it the way you'd tell it.' He reels in two turns. 'That's about as far as I go with it.'",
      "The radio says something and he turns it down further, which you did not think was possible."
    ],
    choices: [
      { text: "Stay until you hear it", sub: "Gut check — you have nowhere to be and eleven miles left. It is a sound or it is not.", type: "risky", check: { stat: "gut", difficulty: 6 }, road: +1,
        success: { next: "ds_p3", outcome: "heard", deltas: { gut: +2, tank: -3 }, flags: { heard_the_river: true } },
        failure: { next: "ds_p3", outcome: "didnt_hear", deltas: { nerve: -1, tank: -3 } } },
      { text: "Say goodnight and drive the last of it", sub: "He isn't selling it to you. That is most of why you believe him.", type: "safe", next: "ds_p3", outcome: "left_him" }
    ],
    outcomes: {
      heard: [
        "You stay. He does not mind and does not make conversation about it.",
        "It comes up somewhere past the middle of the river about twenty minutes later and it is not singing. It is lower than that and it is not coming from one place.",
        "It is more like a room with people in it two streets away. You can hear that there is something and you cannot hear what.",
        "It goes for a while and then it is not there, and you only notice it has stopped a good minute after it has.",
        "He does not say anything. He does not look over. He has heard it before and he is not going to perform it for you."
      ],
      didnt_hear: [
        "You stay forty minutes and the river does what rivers do, which is move and smell and be dark.",
        "A shrimp boat goes down the middle with one light on it and the wake comes in and slaps the bank for a while and then stops.",
        "Nothing else. He doesn't apologise for it and you understand why — it would mean he had promised you something.",
        "You get in the car more disappointed than you expected to be, which is its own piece of information about you."
      ],
      left_him: [
        "You say goodnight. He says it back and lifts a hand off the rod about an inch.",
        "In the mirror, the two rods and the one man and the water going out past him, all of it getting smaller and none of it changing."
      ]
    }
  },

  ds_p3: {
    location: "Pascagoula, MS — Mile 528",
    tags: ["victory"],
    mile: 528,
    arrival: "Pascagoula, MS",
    heading: "Pascagoula",
    paywall: false,
    isVictory: true,
    ending: 'pascagoula',
    textFn: (s) => {
      const base = [
        "Mile 528.",
        "The road runs out at a public landing with four parking spaces and a concrete ramp going down into the Mississippi Sound.",
        "You park facing the water because everybody parks facing the water.",
        "You turn the engine off.",
        "Out past the end of the ramp the sound is flat and black and goes on until it stops being water and starts being sky, and there is no line where that happens.",
        "Barrier islands out there somewhere. You cannot see them. The yard glow is behind you now, over your shoulder, orange on the underside of the clouds."
      ];
      if (s.strandings >= 1)
        base.push("You ran dry once between here and Memphis and somebody put enough in your tank to finish it. You never got a name. It did not occur to you to want one until about an hour ago.");
      if (s.flags.heard_the_river)
        base.push("You heard it. You are not going to be able to describe it to anybody, and you have already started trying, and every version you try is worse than the last one.");
      else
        base.push("You did not hear it. That is the more common outcome and you knew it going in, and knowing it going in turns out not to help at all.");
      if (s.stats.tank <= 15) base.push("The needle is under the peg. You spent the last of it getting to a car park.");
      if (s.stats.wallet <= 0) base.push("There is nothing in your wallet but the license and the card that doesn't work.");
      if (s.stats.nerve <= 3) base.push("Something in you is quieter than it was on Lamar Avenue. Not broken. Quieter.");
      const kept = (typeof keepsakeFor === 'function') ? keepsakeFor(s) : null;
      if (kept) base.push(kept.line);
      const r = s.road || 0;
      if (r >= 3) base.push("A car comes down to the landing behind you, dark, and sits at the top of the ramp with its lights off for a minute, and then backs out and goes. You do not turn round. You find you do not need to.");
      else if (r <= 0) base.push("Nobody comes down to the landing. Nothing marks it. The water does what it was doing before you got here and will do after, and the only thing that is different about tonight is you, and that is not a difference the water is required to notice.");
      else base.push("A gull goes over, low, the way they do at night when something has disturbed them, and you watch it until it is gone.");
      base.push(
        "The mill is still going. It will be going at four in the morning. There are people on shift out there right now building a ship you will never see finished.",
        "You could sleep in the car. People do. Nobody would come.",
        "You start the car.",
        "That's enough.",
        "That's the whole thing."
      );
      return base;
    },
    choices: []
  },

  // ═════════════════════════════════════════════════════════════════════════
  // THE PASS — the one with nothing at the end of it.
  // [PROSE — the storm is referred to once and not explained. If that reads wrong,
  //  it is one line and it comes out.]
  // ═════════════════════════════════════════════════════════════════════════
  ds_b1: {
    location: "US-49 South — Through Wiggins",
    tags: ["travel","night"],
    mile: 472,
    shield: "US 49 SOUTH",
    heading: "the Pass",
    miles: 522,
    paywall: false,
    textFn: (s) => [
      "Forty-nine south is a wide fast road and it is going somewhere it clearly believes in.",
      "Wiggins. Then the national forest, which at this hour is forty minutes of your own headlights on pine trunks at the same spacing, over and over, until your eyes start inventing a rhythm that isn't there.",
      "The biro line on the photocopied map does not go to Gulfport either. It goes past it, west along the coast, to a place she wrote one word next to in a hand that had done a lot of writing.",
      "The Pass. That's all it says.",
      "You have been following a stranger's pen for an hour and you have not once considered doing anything else."
    ],
    choices: [
      { text: "Follow the line", sub: "West at the water. She did not explain it and you did not ask.", type: "neutral", next: "ds_b2" },
      { text: "Stop in Gulfport instead — there's a city right there", sub: "Costs nothing but the line. You could be on a beach in fifteen minutes with a sign on it.", type: "safe", next: "ds_b2", outcome: "gulfport", deltas: { gut: -1 }, flags: { skipped_the_pass: true } }
    ],
    outcomes: {
      gulfport: [
        "You come down into Gulfport where the road meets the beach highway and there it is: sand, a pier, lit hotels, a sign telling you what beach it is.",
        "It is a beach. It is a perfectly good beach. People are on it at this hour in ones and twos the way they are anywhere with sand and a parking space.",
        "You sit in the lot for six minutes with the water in front of you and the line on the map in the door pocket beside you.",
        "Then you turn west anyway, because it turns out you did not drive five hundred miles for a beach with a sign on it."
      ]
    }
  },

  ds_b2: {
    location: "Beach Highway — West of the Harbour",
    tags: ["travel","night"],
    mile: 502,
    shield: "US 90 WEST",
    heading: "the Pass",
    paywall: false,
    textFn: (s) => {
      const base = [
        "The beach highway runs west with the Gulf on your left the whole way and almost nothing on your right.",
        "Live oaks on the inland side, enormous, older than anything else here and growing sideways out of the wind in a way that looks deliberate.",
        "And then a stretch where there are front steps.",
        "Concrete steps going up from the road, four or five of them, with a landing at the top and a path behind, and nothing standing on any of it. Then a gap. Then more steps.",
        "Nobody has put up a sign about it. Everybody who lives here knows what it is and the road is not in the business of explaining itself to you."
      ];
      if (s.flags.skipped_the_pass) base.push("You are twenty minutes later than you had to be and you are glad about it in a way you are not going to examine.");
      base.push("The water on your left has no edge to it at night. You can only tell where it is by where the dark stops having anything in it.");
      return base;
    },
    choices: [
      { text: "Keep west until the road runs out", sub: "It does run out. That is what she wrote down.", type: "neutral", next: "ds_b3" },
      { text: "Stop at one of the sets of steps", sub: "Costs Nerve. Nobody is going to mind and that is not why it is hard.", type: "risky", next: "ds_b3", outcome: "steps", road: +1, deltas: { nerve: -2, gut: +2 }, flags: { stopped_at_the_steps: true } }
    ],
    outcomes: {
      steps: [
        "You pull onto the shell and walk back along the verge to the nearest set and stand at the bottom of them.",
        "Five steps. A landing. A path of the same concrete going back twenty feet and stopping at grass.",
        "There is a boot scraper set into the landing, iron, rusted thin, still bolted down.",
        "You do not go up them. It would not be trespassing and that is not the reason either.",
        "On the way back to the car you pass two more sets and you look at both, and then you stop looking at them, and you drive the rest of it with your eyes on the road."
      ]
    }
  },

  ds_b3: {
    location: "Bay St. Louis, MS — Mile 522",
    tags: ["victory"],
    mile: 522,
    arrival: "Bay St. Louis, MS",
    heading: "Bay St. Louis",
    paywall: false,
    isVictory: true,
    ending: 'pass',
    textFn: (s) => {
      const base = [
        "Mile 522.",
        "The road ends at a seawall with a gap in it and a set of steps going down onto sand.",
        "There is no city. There is a bait shop with the shutters down, a church two streets back, and a street light doing its job over an empty crossing.",
        "You park. You turn the engine off.",
        "The quiet comes in through the windows like something that had been waiting for the engine to be done."
      ];
      if (s.strandings >= 1)
        base.push("You ran dry once, four hundred miles back, and a stranger put enough in your tank to get you to a car park with a bait shop on it. You have been thinking about the arithmetic of that and it does not come out.");
      base.push("You walk down the steps because there is nothing else to do and nobody to see you do it.");
      if (s.stats.tank <= 15) base.push("The needle is under the peg. Whatever happens tomorrow happens on foot or it happens after somebody helps you.");
      if (s.stats.wallet <= 0) base.push("Nothing in the wallet. You check it on the sand, which is a stupid place to check a wallet, and you check it anyway.");
      if (s.stats.nerve <= 3) base.push("Something in you is quieter than it was in Memphis. Down here there is nothing to be loud at.");
      if (s.flags.stopped_at_the_steps) base.push("Five steps and a landing and a boot scraper still bolted down. You have brought it with you the last twenty miles and you are going to be carrying it a while.");
      const kept = (typeof keepsakeFor === 'function') ? keepsakeFor(s) : null;
      if (kept) base.push(kept.line);
      base.push(
        "The Gulf here is not dramatic. It is brown and warm and it comes in about four inches at a time and goes out again, and it does that whether or not anybody is standing in it.",
        "There is no line out there either. Water, then a darker thing that is also water, then sky.",
        "Nothing is going to happen. You understood that before you got out of the car and you got out of the car anyway."
      );
      const r = s.road || 0;
      if (r >= 3) base.push("Somewhere behind you a car door shuts, once, up on the road. When you turn round there is nothing at the crossing but the street light, doing its job.");
      else if (r <= 0) base.push("You stand in it to the ankles and wait to feel something about it and the feeling does not arrive. The water keeps coming in four inches at a time. That is not the water's fault.");
      else base.push("You stand in it to the ankles for a while. It is warmer than the air, which is the thing about the Gulf nobody tells you.");
      base.push(
        "A woman in Natchez made up a bed for you and drew a line on a photocopy and this is where the line went.",
        "You still do not know why.",
        "You go back up the steps and start the car.",
        "That's enough.",
        "That's the whole thing."
      );
      return base;
    },
    choices: []
  },


  // ═════════════════════════════════════════════════════════════════════════
  // 12 — THE GULF. Humidity changes. The land runs out of height.
  // Last decision with fuel in it.
  // ═════════════════════════════════════════════════════════════════════════
  ds_012: {
    location: "US-98 East — Lucedale",
    tags: ["travel","tension","final"],
    mile: 490,
    paywall: false,
    textFn: (s) => {
      const base = [
        "Somewhere past Hattiesburg the air changes. It was wet before. Now it's salt.",
        "The land runs out of height. The pines thin to something scrubbier and the ditches have water in them that isn't going anywhere.",
        "Lucedale. A pump. A sign that says MOBILE 57."
      ];
      if (s.flags.loyce_spoke) base.push("Fill it here, Loyce said. There's nothing you'd want to stop at. This is here.");
      else if (s.flags.loyce_kind) base.push("He rang it at about half and didn't look at the pump. You have been doing the arithmetic on that for sixty miles and it keeps coming out the same, which is that he decided something about you and didn't say what.");
      else if (s.flags.loyce_cold) base.push("Cash only on three, he said, with the reader working fine. You have been carrying that for sixty miles and it has not got any lighter.");
      base.push("Your tank is what it is. Your wallet is what it is. Fifty-seven miles, and a bay at the end of it with a bridge across.");
      return base;
    },
    choices: [
      { text: "Top off", sub: (s) => pumpSub(s, { rate: 0.28 }, "The last pump you can count on."), type: "neutral", requires: (s) => pumpOpen(s), lockText: (s) => pumpClosed(s), pump: { rate: 0.28 }, next: "ds_013" },
      // The donut used to lock the only free way across and offer nothing in its place,
      // which left a player with fuel, no cash and a spare with no option that spoke to
      // any of it. Route 1's rule: the donut closes the fast road, not every road.
      { text: "Take the causeway on the spare", sub: "Gut check — fifty miles an hour over seven miles of water with trucks behind you. It is not the spare that worries you.", type: "risky", showIf: (s) => !!s.flags.ds_on_donut, check: { stat: "gut", difficulty: 6 },
        success: { next: "ds_013", outcome: "donut_held", deltas: { gut: +1, nerve: +1 } },
        failure: { next: "ds_013", outcome: "donut_went", deltas: { tank: -14, nerve: -3 } } },
      { text: "You've got enough. Go.", sub: "Gut check — fifty-seven miles. The needle says yes. The needle's said that before.", type: "neutral", requires: { ds_on_donut: false }, lockText: "Not on the donut. Not across seven miles of water.", check: { stat: "gut", difficulty: 6 },
        success: { next: "ds_013", deltas: { gut: +1 } },
        failure: { next: "ds_013", deltas: { tank: -18, gut: -1 } } },
      // Only when fuel is the thing you lack. Offering to spot a man who has three
      // quarters of a tank and a flat spare reads as the game not watching.
      { text: "Ask the kid at the register to spot you", sub: "Nerve check — no money, no pride. Last chance to spend the second one.", type: "risky", showIf: (s) => (s.stats.wallet || 0) < 10 && (s.stats.tank || 0) < 60, check: { stat: "nerve", difficulty: 8 }, road: +1,
        success: { next: "ds_013", outcome: "spotted", deltas: { tank: +28, nerve: -1 } },
        failure: { next: "ds_013", outcome: "not_spotted", deltas: { nerve: -2 } } }
    ],
    outcomes: {
      donut_held: [
        "You take the right lane at fifty with the hazards on and let everything in Mobile County go past you.",
        "The spare hums at a pitch the other three don't. Over the water it comes back off the rail and sits in the car with you.",
        "Seven miles is not long. It is long enough to work out that there is nowhere to stop, and then to work out that you already knew that."
      ],
      donut_went: [
        "Somewhere out over the water the spare lets go of its shape — not a blowout, a softening, the car leaning into the rail side and staying leaned.",
        "You get it down to twenty with both hands and the hazards going and a truck behind you laying on the horn for a quarter mile before it decides to go round.",
        "You come off the causeway at a walking pace on a rim that is not quite round any more, and the city is right there, which is almost worse."
      ],
      spotted: [
        "He's nineteen and it's not his money and he does it anyway. Ten dollars on three, out of his own pocket, and he doesn't want to talk about it.",
        "You don't know his name. You don't ask. You've stopped asking."
      ],
      not_spotted: [
        "'Can't do that,' he says. He means it kindly. It doesn't help.",
        "You stand at the pump with the nozzle in your hand and the numbers not moving."
      ]
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 13 — THE CAUSEWAY. Mobile Bay. Water on both sides. Something two lanes
  // over that is not confirmed as anything.
  // ═════════════════════════════════════════════════════════════════════════
  ds_013: {
    location: "Mobile Bay — the Causeway",
    tags: ["travel","elcamino","night"],
    mile: 537,
    paywall: false,
    textFn: (s) => {
      const base = [
        "The bay comes up all at once. One minute it's scrub and the next the road is on water, low, with water on both sides and the city out ahead lit up like it's expecting somebody.",
        "The causeway is seven miles. Wind off the Gulf pushes the car. There's nowhere to pull over, which is fine, because there's nothing to pull over for."
      ];
      const r = s.road || 0;
      if (r >= 3) base.push("Two lanes over there's a dark El Camino, keeping your speed exactly. It doesn't pass. It doesn't drop back. At the far end, where the lanes split for downtown, it slows and lets you go first.");
      else if (r <= 0) base.push("Two lanes over there's a dark El Camino, or something like one. It passes you halfway across and doesn't look, and by the far end it's gone into the city ahead of you, and you're not sure it was ever anything.");
      else base.push("You check the mirror halfway across. Headlights, a long way back. They stay a long way back the whole seven miles.");
      base.push("The radio comes in clear for the first time since Memphis. A man reading the tide table. High water, he says, right about now.");
      return base;
    },
    choices: [
      { text: "The city", sub: "Seven miles of bridge, and then it's just streets.", type: "neutral", next: "ds_014" }
    ]
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 14 — MOBILE. Arrival. Same system as sw_012: the run reports itself in
  // prose or not at all.
  // ═════════════════════════════════════════════════════════════════════════
  ds_014: {
    ending: 'mobile',
    location: "Mobile, AL — Mile 547",
    tags: ["victory"],
    mile: 547,
    arrival: "Mobile, AL",
    paywall: false,
    isVictory: true,
    textFn: (s) => {
      const base = [
        "Mile 547.",
        "Mobile is oaks over the streets and the smell of the paper mill and the bay behind everything. Old. Older than Memphis, older than most of it. It doesn't announce that. It doesn't announce anything.",
        "You take the first exit off the causeway and you're on a street with live oaks meeting over it, and you pull into a lot under one, and you turn the engine off.",
        "You sit there."
      ];

      // ── What the road took. ──
      if (s.strandings >= 1)
        base.push("You ran dry once, somewhere in the pines, and somebody you'll never see again put enough in your tank to get you here. You didn't get a name. It didn't seem like the kind of place you asked.");
      if (s.stats.tank <= 15)
        base.push("The needle's under the peg. You crossed seven miles of water watching it. Now it doesn't matter and you look at it anyway.");
      if (s.stats.wallet <= 0)
        base.push("There's a gas receipt in your wallet and a photocopied map behind it and nothing behind that.");
      if (s.stats.nerve <= 3)
        base.push("Something in you is quieter than it was in Memphis. Not broken. Quieter. You notice it when the man walking his dog past the car says evening and you don't answer in time.");
      if (s.stats.gut <= 3)
        base.push("You stopped trusting your read on people somewhere around Natchez. Down here that's a thing you need. It comes back, probably.");
      if (s.flags.ds_on_donut)
        base.push("You came the last hundred miles on a donut with a nail in your pocket. You take the nail out and look at it. It's a nail.");
      // The cost block, Route 1's sw_012 pattern: what the road took, named plainly.
      if (s.flags.slept_car_natchez)
        base.push("A woman made up a room for you in Natchez and you slept in the car outside her house. You have not decided yet whether that was the sensible thing. You keep arriving at sensible and then going round again.");
      if (s.flags.check_accepted && !s.flags.thanked_him)
        base.push("Somebody bought your lunch in Greenville and you let it stand and never found out why. It is four hundred miles back and it is still the thing you cannot put down.");
      if (s.flags.gave_at_revival)
        base.push("You put money on a plate in a tent in a field for reasons you could not explain at the time and cannot now, and you have thought about it more than you have thought about the money.");
      else if (s.flags.revival_passed)
        base.push("The singing followed you about a mile past the field. Sound does that over flat ground at night. You know that, and you checked the mirror anyway.");
      if (s.flags.paid_the_tractor)
        base.push("Twenty dollars to a man on a tractor to be pulled through forty yards of water. Cheapest thing you bought all week, and you knew it while you were handing it over.");
      if (s.flags.lumberton_motel || s.flags.waited_the_burn)
        base.push("You stopped for the smoke. Some people didn't. You read about one of them in the paper on the counter in Lucedale and you did not pick it up.");
      if (s.flags.took_from_plate)
        base.push((s.stats && s.stats.wallet > 0)
          ? "There's money in your pocket that came off a collection plate in a tent past Columbia. Some of it went in the tank. It spent like money."
          : "Fifteen dollars came off a collection plate in a tent past Columbia and every cent of it is gone into the tank between there and here. It spent like money. That is the part you will keep turning over.");
      if (s.flags.took_photograph)
        base.push("The photograph is in the visor. A two-lane, a grade, a guardrail with three things wired to it. You don't take it out. You know it's there.");
      if (s.flags.took_other_photo)
        base.push("The photograph is in the visor. A road. You couldn't say which one. You're not sure that's the point.");
      if (!s.strandings && s.stats.tank > 50)
        base.push("You never once stood on a shoulder with your hazards going. Down here, in this, that's a thing. You don't know yet that it's worth saying.");

      // ── Who you met. ──
      // The two that are the absence of a decision rather than a decision. Route 1 keeps
      // a couple of these too; they are worth a line each precisely because nothing happened.
      if (s.flags.stayed_98)
        base.push("You stayed on the numbered road the whole way through the pines. There was a county route that went south when south was wrong, and you will never know what was down it, and that is the correct amount to know.");
      if (s.flags.went_around)
        base.push("You went around the thing at the crossroads on 49W without slowing and without being stopped, and nothing about it was ever explained, and nothing about it ever needed to be.");
      if (s.flags.asked_pickup)
        base.push("The pickup on Lamar Avenue with the door standing open. Nobody ever came back for it while you were there. The radio said so too, eventually, in a voice that had read a hundred of them.");
      if (s.flags.loyce_spoke)
        base.push("Loyce. Ain't that many, he said. You wonder how many, and whether they all got here, and whether he'd tell you.");
      else if (s.flags.thanked_him)
        base.push("The man in the tie. He said he did the same drive once. You believe him now in a way you didn't in Greenville.");
      if (s.flags.stayed_natchez)
        base.push("Three places set. You keep coming back to that. Not who the third was for. That she didn't clear it.");
      if (s.carried?.knows_cord_name)
        base.push("Cord. Ninety-eight's the road, he said. It was. You wonder what he'd have said if you'd asked him about this one, and you know he wouldn't have.");
      if (s.flags.cord_passed_r2)
        base.push("You drove past him at Vicksburg. He didn't wave. That isn't what he does. You've been wondering since whether he watched you go.");

      base.push("The oaks over the street are older than the country. That's a real thing about Mobile — some of them were here before there was a here.", "You didn't know that before tonight.", "You know it now.");

      // ── Conduct. ──
      if ((s.road || 0) >= 3) base.push("At the light at the end of the block, a dark El Camino is two lanes over. Not impossible. Just unlikely. The driver doesn't look your way. When the light changes, he lets you go first.");
      else if ((s.road || 0) <= 0) base.push("You expected something to feel different when you got here. It doesn't. The car ticks under the oak. Your hands smell like gas and the vinyl of a stranger's screen door. Behind you the causeway keeps its lights on for nobody.");
      else base.push("At the light, you check the mirror. Nothing behind you but a city going to bed. For once that feels like enough.");

      base.push("Your phone has bars.", "You could call someone.", "You sit with that a while.");
      if (s.stats.wallet > 8) base.push("There's a place on the corner with the lights on. Oysters, the sign says. You've been driving all day and you're hungry and you have just enough for a plate.");
      else base.push("There's a place on the corner with the lights on. Oysters, the sign says. You're hungry enough to notice and broke enough to sit there and look at it.");
      base.push("You start the car.", "That's enough.", "That's the whole thing.");
      return base;
    },
    choices: []
  }

  } // end nodes
};

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION — where the engine currently assumes Route 1
//
// None of this is done here. This is the list of places that need to read
// from a route object instead of a constant. Each is one or two lines.
//
//   1. startGame()      loadNode('sw_001')          → loadNode(route.start)
//   2. updateOdometer() / 675                        → / route.miles
//   3. header HTML      "Route 1" / "Southwest Desert" → route.label / route.name
//   4. RADIO_BANDS      const                        → route.radioBands
//   5. RADIO_SILENT     const                        → route.radioSilent
//   6. strandOut()      default 'sw_011'             → route.strandReturnDefault
//   7. loadNode('__RESUME__') fallback 'sw_011'      → same
//   8. NODES            Object.assign(NODES, DEEP_SOUTH.nodes) after NODES is defined
//   9. strand_1 / strand_end / strand_resume         location text says "I-40
//                                                    Eastbound" — either make it
//                                                    route-aware or give each route
//                                                    its own three strand nodes
//
// CARRIED STATE (new, small) — read here via `s.carried?.x`, never written:
//
//   state.carried = {
//     knows_cord_name:       set on a Route 1 win where knows_cord_name was true
//     elcamino_debt:         same
//     hitchhiker_picked_up:  same
//     saw_turnout:           set if sw_0105d was reached
//     jacket / note / seat_money / photograph:  the objects
//   }
//
//   Persist alongside completed routes in AsyncStorage. Route 2 degrades
//   gracefully without it — every read is optional-chained and the fallback
//   prose is the "first time through" version.
//
// TUNING (crude harness, 6,000 runs/cell, tankPerMile 0.30 — confirm in yours)
//
//                careful  careless  always-green   strand>=1 on careful
//   drifter        83%      21%         8%              17%
//   planner        97%      56%        64%               7%      <-- too safe
//   broke          69%      14%         6%              34%
//   Route 1 ref    66/64/55 26/11/14    0/0/0           44–51%
//
//   Drifter and Broke Kid are in range. The Planner buys through: $44 against
//   Delta gas at $22–26 is ~two tanks in the wallet on top of a full tank in
//   the car. Raising tankPerMile to 0.34 moved the Planner 97→95 and the Broke
//   Kid's strand rate 34→56, so burn is not the lever. The lever is money:
//     (a) a per-route starting wallet — Planner $30 on this route — if the
//         engine grows route-level stat overrides, or
//     (b) one cash sink the Planner can't Nerve past. Candidates in-fiction:
//         the crossroads man charges for directions on a failed check (built);
//         Hattiesburg cash-only at road<=0 (built, $38); a Vicksburg bridge
//         toll would be fiction — the I-20 bridge is free.
//   Recommend (a). It's one line in the archetype table and it's what Route 1
//   did when it cut the Planner from $65 to $44.
//
// ROUTE 4 LOCK — unchanged: requires two completed routes.
// ═══════════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined') module.exports = DEEP_SOUTH;
