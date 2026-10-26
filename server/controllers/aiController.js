import { GoogleGenAI, Type } from '@google/genai';
import Restaurant from '../models/Restaurant.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

// Single shared client instance, initialized from the API key in .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * @desc    Get AI-powered restaurant recommendations based on a free-text
 *          user query (e.g. "romantic Italian dinner, mid-range budget")
 * @route   POST /api/ai/recommend
 * @access  Public (can be made Private if you want to require login)
 *
 * Flow:
 *  1. Pull active restaurants from MongoDB.
 *  2. Reduce each restaurant to a compact context object (avoid sending
 *     bulky/irrelevant fields like image URLs to the model).
 *  3. Ask Gemini to pick 2-3 best matches, constrained to a strict JSON
 *     schema so the response is directly usable by the frontend.
 */
export const getRecommendations = asyncHandler(async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    throw new ApiError(400, 'A "query" describing preferences (cuisine, budget, mood) is required');
  }

  const restaurants = await Restaurant.find({ isActive: true }).limit(100).select(
    'name description cuisine address.city priceRange tableCapacity openingHours'
  );

  if (restaurants.length === 0) {
    return res.status(200).json({
      success: true,
      data: { recommendations: [], message: 'No active restaurants available to recommend' },
    });
  }

  // Build a compact, clean context block for the model.
  const restaurantContext = restaurants.map((r) => ({
    id: r._id.toString(),
    name: r.name,
    description: r.description,
    cuisine: r.cuisine,
    city: r.address?.city,
    priceRange: r.priceRange,
    capacity: r.tableCapacity,
  }));

  const systemInstruction = `You are Tablero's restaurant concierge. You recommend restaurants ONLY from
the provided list — never invent restaurants that are not in the data. Match the user's stated cuisine,
budget, and mood as closely as possible. Always return 2 to 3 recommendations, ranked best-first, each with
a short reason tailored to the user's request.`;

  const prompt = `User request: "${query}"

Available restaurants (JSON):
${JSON.stringify(restaurantContext)}

Recommend the 2-3 restaurants (by "id" and "name" from the list above) that best match the user's request.`;

  let response;
  try {
    response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ['id', 'name', 'reason'],
              },
            },
          },
          required: ['recommendations'],
        },
      },
    });
  } catch (error) {
    throw new ApiError(502, `AI recommendation service failed: ${error.message}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(response.text);
  } catch (error) {
    throw new ApiError(502, 'AI service returned an unexpected response format');
  }

  // Attach full restaurant documents to the AI's picks so the frontend
  // gets complete data (images, address, etc.), not just the id/name/reason.
  const enriched = parsed.recommendations
    .map((rec) => {
      const match = restaurants.find((r) => r._id.toString() === rec.id);
      return match ? { ...match.toObject(), reason: rec.reason } : null;
    })
    .filter(Boolean);

  res.status(200).json({
    success: true,
    data: { query, recommendations: enriched },
  });
});
