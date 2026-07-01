import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CODES =
  '10-1:weak signal|10-2:signal clear|10-3:stop transmitting|10-4:understood|' +
  '10-5:relay message|10-6:busy|10-7:off air|10-8:available|10-9:repeat|' +
  '10-10:done, standing by|10-11:slow down|10-12:visitors present|' +
  '10-13:road/weather conditions|10-16:pickup needed here|10-17:urgent|' +
  '10-18:anything for me|10-19:return to base|10-20:location|10-21:call by phone|' +
  '10-22:report in person|10-23:stand by|10-24:assignment done|10-25:contact person|' +
  '10-26:disregard last|10-27:changing channel|10-28:identify station|' +
  '10-29:ending contact|10-30:FCC violation|10-32:radio check|' +
  '10-33:emergency, clear channel|10-34:need help|10-35:confidential|' +
  '10-36:correct time|10-37:tow truck needed|10-38:ambulance needed|' +
  '10-39:message delivered|10-41:switch to channel|10-42:traffic accident here|' +
  '10-43:traffic backup|10-44:message waiting|10-45:all units report|' +
  '10-50:break channel|10-60:message number|10-62:call by phone instead|' +
  '10-65:awaiting message|10-67:all units comply|10-70:fire here|' +
  '10-71:transmit in sequence|10-73:speed trap here|10-75:causing interference|' +
  '10-77:no contact|10-84:my phone number|10-85:my address|10-91:closer to mic|' +
  '10-92:transmitter needs work|10-93:frequency check|10-94:long count|' +
  '10-95:hold carrier 5s|10-99:mission complete|10-100:bathroom break|' +
  '10-200:police needed';

const SLANG =
  "Ace:skilled operator|Advertising:cop with lights on|Alligator:tire debris in road|" +
  "Ancient Mariner:AM/FM radio user|Backdoor:behind you|Bear:any law enforcement|" +
  "Bear Bait:reckless speeder|Bear Bite:speeding ticket|Bear in the Bushes:hidden cop|" +
  "Bobtail:semi without trailer|Bumper Sticker:tailgater|Bunny Hopper:lane changer|" +
  "Care Bear:construction zone cop|Checkpoint Charlie:sobriety checkpoint|" +
  "Chicken Coop:weigh station|Christmas Card:speeding ticket|Citizen:non-trucker|" +
  "Dead Head:running empty|Doughnuts:tires|Draggin' Wagon:tow truck|" +
  "Driving Award:ticket|Eyeballs:headlights|Fat Load:overweight haul|" +
  "Flip-Flop:return trip or U-turn|Free Truck Wash:rain|Gator:tire debris|" +
  "Gator Guts:small tire shreds|Georgia Overdrive:coasting in neutral|" +
  "Granny Lane:slow right lane|Greasy:icy road|Greasy Side Up:flipped vehicle|" +
  "Ground Clouds:fog|Gumball Machine:police light bar|Handle:CB nickname|" +
  "Harvey Wallbanger:reckless driver|Hitchhiker:tailgater|Hole in the Wall:tunnel|" +
  "Ice-Capading:sliding on ice|Invitation:traffic ticket|Jet Pilot:speeder|" +
  "Jewelry:tire chains|Keep the Shiny Side Up:safe travels farewell|" +
  "Kiddy Car:school bus|Lollipop:highway shoulder marker|Loot Limo:armored car|" +
  "Magic Mile:final mile to destination|Meat Wagon:ambulance|Motion Lotion:diesel fuel|" +
  "Mud:coffee|Neighbor:fellow trucker|Organ Donor:helmetless motorcyclist|" +
  "Paperwork:ticket|Parking Lot:traffic jam|Piggy Back:truck towing truck|" +
  "Plain Wrapper:unmarked cop car|Polar Bear:unmarked white cop car|Popcorn:hail|" +
  "Portable Barnyard:livestock hauler|Raking the Leaves:last truck in convoy|" +
  "Rambo:aggressive radio talker|Reading the Mail:listening without transmitting|" +
  "Road Pizza:roadkill|Roller Skate:small car|Rolling Roadblock:slow maintenance vehicle|" +
  "Running on Rags:worn tires|Sandbox:truck escape ramp|" +
  "Seat Cover:visible driver or passenger in car|Shiny Side Up:right-side up after accident|" +
  "Smile and Comb Your Hair:radar ahead|Smoking the Brakes:overheating brakes|" +
  "Snowman:drug trafficker|Stagecoaches:tour buses|Thermos Bottle:tanker trailer|" +
  "Throwing Iron:putting on chains|Toothpicks:lumber load|Triple Digits:over 100 mph|" +
  "Turtle Race:slow-speed zone|Twister Tracker:storm chaser|Van Gogh:vehicle with no CB|" +
  "West Coast Turnarounds:stimulants|White Stuff:snow|" +
  "Wiggle Wagon:double or triple trailer truck|With a Customer:cop making a traffic stop";

const SYSTEM_PROMPT =
  `You are a friendly CB radio coach evaluating a spoken transmission. ` +
  `Use ONLY the definitions below when assessing 10-codes and slang — never substitute your own.\n\n` +
  `10-CODES: ${CODES}\n\n` +
  `CB SLANG: ${SLANG}\n\n` +
  `Assess the transmission on these six criteria:\n` +
  `1. Handle identification — did they state their CB handle?\n` +
  `2. Break-in procedure — proper break (e.g. "Break one-nine") or "Break break" for emergency?\n` +
  `3. 10-code usage — correct codes per the list above? Flag any wrong code by name.\n` +
  `4. Sign-off — proper close (10-10, "over", "over and out", "keep the shiny side up", etc.)?\n` +
  `5. Conciseness — clear and to the point?\n` +
  `6. CB terminology — did they naturally use slang from the list above?\n\n` +
  `Be encouraging, like a patient Elmer (radio mentor). Acknowledge genuine effort even when there is room to improve.\n\n` +
  `IMPORTANT: Return ONLY a raw JSON object. No markdown, no code blocks, no backticks, no text before or after.\n` +
  `{"score":75,"well_done":["example"],"needs_work":["example"],"practice_next":"example","overall":"example"}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = req.headers['x-cb-key'];
  if (!secret || secret !== process.env.CB_API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { transmission } = req.body || {};
  if (!transmission || typeof transmission !== 'string' || transmission.trim().length < 3) {
    return res.status(400).json({ error: 'No transmission provided' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Evaluate this CB radio transmission: "${transmission.trim()}"`,
        },
      ],
    });

    const text = message.content[0]?.text ?? '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', text);
      return res.status(502).json({ error: 'Invalid response from AI' });
    }
    const feedback = JSON.parse(jsonMatch[0]);

    return res.status(200).json(feedback);
  } catch (err) {
    console.error('radio-check error:', err);
    if (err instanceof SyntaxError) {
      return res.status(502).json({ error: 'Invalid response from AI' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
