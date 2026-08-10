import { generateObject, gateway } from 'ai';
import { z } from 'zod';

const roomSchema = z.object({
  lengthMeters: z.number().positive().max(100),
  widthMeters: z.number().positive().max(100),
  ceilingHeightMeters: z.number().positive().max(20),
  sunlight: z.enum(['low', 'moderate', 'high']),
  confidence: z.number().min(0).max(1),
  notes: z.string().max(300),
});

const prompt = `Analyze this room photo and estimate its physical dimensions using visible reference objects such as doors, windows, furniture, and ceiling height. Return realistic estimates in meters. Detect sunlight exposure: high for large sunny windows/direct bright light, low for heavy curtains/shade, otherwise moderate. Do not claim survey-grade precision; use reasonable visual estimates and explain uncertainty briefly.`;

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const body = await req.json() as { image?: string };
    if (!body.image || !/^data:image\/(jpeg|jpg|png|webp);base64,/.test(body.image)) {
      return Response.json({ error: 'Please upload a JPG, PNG, or WebP room image.' }, { status: 400 });
    }
    if (body.image.length > 12_000_000) {
      return Response.json({ error: 'Image is too large. Please use an image under 8 MB.' }, { status: 413 });
    }

    const { object } = await generateObject({
      model: gateway('google/gemini-2.5-flash'),
      schema: roomSchema,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image', image: body.image },
        ],
      }],
    });

    return Response.json(object);
  } catch (error) {
    console.error('[room-scanner] analysis failed', error);
    return Response.json({ error: 'The room photo could not be analyzed. Try a clearer, well-lit photo.' }, { status: 500 });
  }
}
