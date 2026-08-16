import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Keep in sync with hazmat_pro/lib/data/placards_data.dart (division:name).
const PLACARDS =
  '1.1:Mass Explosion Hazard|1.2:Projection Hazard|1.3:Fire/Minor Blast Hazard|' +
  '1.4:No Significant Blast Hazard|1.5:Very Insensitive, Mass Explosion Hazard|' +
  '1.6:Extremely Insensitive Articles|2.1:Flammable Gas|' +
  '2.2:Non-Flammable, Non-Toxic Gas|2.3:Toxic Gas|3:Flammable Liquid|' +
  '4.1:Flammable Solid|4.2:Spontaneously Combustible|4.3:Dangerous When Wet|' +
  '5.1:Oxidizer|5.2:Organic Peroxide|6.1:Poison/Toxic Substance|' +
  '6.2:Infectious Substance|7:Radioactive|8:Corrosive|' +
  '9:Miscellaneous Dangerous Goods';

// Keep in sync with hazmat_pro/lib/data/un_numbers_data.dart
// (UN#:name:class:packingGroup:ergGuide, "-" = no packing group).
const UN_NUMBERS =
  'UN1203:Gasoline:3:II:128|' +
  'UN1202:Diesel fuel/Fuel oil:3:III:128|' +
  'UN1223:Kerosene:3:III:128|' +
  'UN1863:Fuel, aviation, turbine engine (Jet A/JP-8):3:III:128|' +
  'UN1170:Ethanol/Ethyl alcohol:3:II:127|' +
  'UN1230:Methanol:3:II:131|' +
  'UN1090:Acetone:3:II:127|' +
  'UN1294:Toluene:3:II:130|' +
  'UN1307:Xylenes:3:III:130|' +
  'UN1114:Benzene:3:II:130|' +
  'UN1993:Flammable liquid, n.o.s.:3:II:128|' +
  'UN1263:Paint/Paint related material:3:II:128|' +
  'UN1198:Formaldehyde solution, flammable:3:III:132|' +
  'UN1978:Propane:2.1:-:115|' +
  'UN1075:Liquefied petroleum gas (LPG):2.1:-:115|' +
  'UN1011:Butane:2.1:-:115|' +
  'UN1971:Natural gas, compressed (methane):2.1:-:115|' +
  'UN1001:Acetylene, dissolved:2.1:-:116|' +
  'UN1049:Hydrogen, compressed:2.1:-:115|' +
  'UN1072:Oxygen, compressed:2.2:-:122|' +
  'UN1073:Oxygen, refrigerated liquid:2.2:-:122|' +
  'UN1066:Nitrogen, compressed:2.2:-:121|' +
  'UN1977:Nitrogen, refrigerated liquid:2.2:-:120|' +
  'UN1013:Carbon dioxide:2.2:-:120|' +
  'UN1046:Helium, compressed:2.2:-:120|' +
  'UN1006:Argon, compressed:2.2:-:120|' +
  'UN1017:Chlorine:2.3:-:124|' +
  'UN1005:Ammonia, anhydrous:2.3:-:125|' +
  'UN1079:Sulfur dioxide:2.3:-:125|' +
  'UN1830:Sulfuric acid:8:II:137|' +
  'UN1789:Hydrochloric acid:8:II:157|' +
  'UN1824:Sodium hydroxide solution:8:II:154|' +
  'UN1823:Sodium hydroxide, solid:8:II:154|' +
  'UN1760:Corrosive liquid, n.o.s.:8:II:154|' +
  'UN1759:Corrosive solid, n.o.s.:8:II:154|' +
  'UN2014:Hydrogen peroxide, aqueous solution (20-60%):5.1:II:140|' +
  'UN1490:Potassium permanganate:5.1:II:140|' +
  'UN2067:Ammonium nitrate based fertilizer:5.1:III:140|' +
  'UN1942:Ammonium nitrate, fertilizer grade:5.1:III:140|' +
  'UN1402:Calcium carbide:4.3:II:138|' +
  'UN1428:Sodium (metal):4.3:I:138|' +
  'UN1331:Matches, strike anywhere:4.1:-:133|' +
  'UN1944:Matches, safety:4.1:-:133|' +
  'UN3480:Lithium ion batteries:9:II:147|' +
  'UN3481:Lithium ion batteries packed with/in equipment:9:II:147|' +
  'UN3090:Lithium metal batteries:9:II:138|' +
  'UN3091:Lithium metal batteries packed with/in equipment:9:II:138|' +
  'UN1845:Carbon dioxide, solid (dry ice):9:-:120|' +
  'UN3082:Environmentally hazardous substance, liquid, n.o.s.:9:III:171|' +
  'UN3077:Environmentally hazardous substance, solid, n.o.s.:9:III:171|' +
  'UN2794:Batteries, wet, filled with acid:8:-:154|' +
  'UN2800:Batteries, wet, non-spillable:8:-:154|' +
  'UN2814:Infectious substance, affecting humans:6.2:-:158|' +
  'UN2900:Infectious substance, affecting animals only:6.2:-:158|' +
  'UN3291:Regulated medical waste, n.o.s.:6.2:-:158|' +
  'UN2915:Radioactive material, Type A package:7:-:163|' +
  'UN2908:Radioactive material, excepted package, empty packaging:7:-:161';

const SYSTEM_PROMPT =
  `You are a hazmat identification assistant inside a field reference app used by CDL drivers, ` +
  `dispatchers, and first responders. The app already resolves exact UN numbers and known shipping ` +
  `names locally without calling you — you are only invoked for free-text or scenario queries ` +
  `("gasoline tanker rollover", "smoking pallet of batteries", a described placard, a partial name) ` +
  `that the local lookup couldn't resolve.\n\n` +
  `DOT HAZARD CLASSES (division:name): ${PLACARDS}\n\n` +
  `KNOWN UN NUMBERS (UN#:name:class:packingGroup:ergGuide, "-" = no packing group): ${UN_NUMBERS}\n\n` +
  `Rules:\n` +
  `1. If the query clearly matches (or closely describes) one of the KNOWN UN NUMBERS above, return ` +
  `that entry's exact material name, class, and guide number — do not improvise different values for ` +
  `a material that's already in the list.\n` +
  `2. "hazard_class" MUST be one of the exact division codes from the DOT HAZARD CLASSES list above ` +
  `(e.g. "3", "2.1", "8") — never the descriptive name, never a code not in that list.\n` +
  `3. If you can reasonably infer a specific UN number for a material NOT in the known list, you may ` +
  `provide one, but only if you are confident — otherwise leave "un_number" and "guide_number" blank ` +
  `rather than guess.\n` +
  `4. NEVER invent specific isolation distances, PPE levels, or protective action distances by number ` +
  `(meters/feet). Those live in the ERG's own tables. Instead, point to "ERG Guide ###" and give ` +
  `general, non-numeric guidance (e.g. "keep ignition sources away", "full PPE required for entry", ` +
  `"do not use water on this material").\n` +
  `5. "isolation_ppe" and "response_guidance" are each a short list of brief, actionable bullet points ` +
  `(not paragraphs) — 2-4 items each.\n` +
  `6. If you cannot identify the material with reasonable confidence, say so plainly in "overall" and ` +
  `default to conservative unknown-hazmat guidance (full PPE, isolate, do not approach, contact ` +
  `CHEMTREC at 1-800-424-9300 or the shipment's emergency contact number) rather than fabricating an ` +
  `identification.\n` +
  `7. "overall" is one or two sentences of plain-language context or caveat — always include a nudge ` +
  `to confirm against the current ERG/shipping papers before acting, since this is a first-look aid, ` +
  `not a substitute for the guidebook.\n\n` +
  `IMPORTANT: Return ONLY a raw JSON object. No markdown, no code blocks, no backticks, no text before ` +
  `or after.\n` +
  `{"material":"Gasoline","un_number":"UN1203","hazard_class":"3","guide_number":"128",` +
  `"isolation_ppe":["example"],"response_guidance":["example"],"overall":"example"}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = req.headers['x-hazmat-key'];
  if (!secret || secret !== process.env.HAZMAT_API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { query } = req.body || {};
  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return res.status(400).json({ error: 'No query provided' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Identify this hazmat query: "${query.trim()}"`,
        },
      ],
    });

    const text = message.content[0]?.text ?? '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', text);
      return res.status(502).json({ error: 'Invalid response from AI' });
    }
    const result = JSON.parse(jsonMatch[0]);

    return res.status(200).json(result);
  } catch (err) {
    console.error('hazmat-assistant error:', err);
    if (err instanceof SyntaxError) {
      return res.status(502).json({ error: 'Invalid response from AI' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
