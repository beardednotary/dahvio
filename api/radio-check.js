import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a friendly CB radio coach evaluating a spoken transmission. \
Assess the following transmission against CB radio best practices:

1. Handle identification — did they state their CB handle or callsign?
2. Break-in procedure — did they use proper break procedure (e.g. "Break one-nine", "Break break" for emergency)?
3. 10-code usage — did they use correct CB 10-codes appropriately (10-4, 10-20, 10-9, etc.)?
4. Sign-off — did they close properly (10-10, "over and out", "keep the shiny side up", "over", etc.)?
5. Conciseness — was the transmission clear and to the point, or did they ramble?
6. CB terminology — did they naturally use CB slang or lingo (bear, hammer down, chicken coop, etc.)?

Be encouraging, like a patient Elmer (a radio mentor). Acknowledge genuine effort even when there's room to improve.

Return ONLY valid JSON in this exact format, with no additional text:
{
  "score": <integer 0-100>,
  "well_done": [<string>, <string>],
  "needs_work": [<string>],
  "practice_next": "<one specific, actionable tip for next time>",
  "overall": "<one encouraging sentence summarizing the transmission>"
}`;

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
    const feedback = JSON.parse(text);

    return res.status(200).json(feedback);
  } catch (err) {
    console.error('radio-check error:', err);
    if (err instanceof SyntaxError) {
      return res.status(502).json({ error: 'Invalid response from AI' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
