/**
 * AI Service
 * Gemini AI integration for trip suggestions
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface TripSuggestionParams {
  destination: string;
  duration: number;
  budget?: number;
  interests?: string[];
  travelStyle?: string;
}

interface ItinerarySuggestionParams {
  cities: string[];
  totalDays: number;
  interests?: string[];
  budget?: number;
}

/**
 * Get AI-powered trip suggestions
 */
export const getTripSuggestions = async (params: TripSuggestionParams) => {
  const { destination, duration, budget, interests, travelStyle } = params;

  const prompt = `As a travel expert, suggest a ${duration}-day trip itinerary for ${destination}.
${budget ? `Budget: $${budget}` : ''}
${interests?.length ? `Interests: ${interests.join(', ')}` : ''}
${travelStyle ? `Travel style: ${travelStyle}` : ''}

Please provide:
1. Best time to visit
2. Must-see attractions (top 5)
3. Recommended activities by day
4. Local food recommendations
5. Budget breakdown estimate
6. Practical tips

Format the response as JSON with the following structure:
{
  "bestTimeToVisit": "string",
  "attractions": [{"name": "string", "description": "string", "estimatedCost": number, "duration": "string"}],
  "dailyItinerary": [{"day": number, "activities": [{"name": "string", "time": "string", "description": "string", "cost": number}]}],
  "foodRecommendations": [{"name": "string", "type": "string", "priceRange": "string"}],
  "budgetBreakdown": {"accommodation": number, "food": number, "activities": number, "transport": number, "total": number},
  "tips": ["string"]
}`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Try to parse as JSON
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Return as text if JSON parsing fails
      return { rawSuggestion: text };
    }

    return { rawSuggestion: text };
  } catch (_error) {
    throw new Error('Failed to generate trip suggestions');
  }
};

/**
 * Get itinerary optimization suggestions
 */
export const optimizeItinerary = async (params: ItinerarySuggestionParams) => {
  const { cities, totalDays, interests, budget } = params;

  const prompt = `As a travel planning expert, optimize this multi-city trip itinerary:

Cities to visit: ${cities.join(' → ')}
Total duration: ${totalDays} days
${interests?.length ? `Interests: ${interests.join(', ')}` : ''}
${budget ? `Budget: $${budget}` : ''}

Please suggest:
1. Optimal order of cities
2. Recommended days per city
3. Best transportation between cities
4. Key activities for each city
5. Time and cost optimization tips

Format as JSON:
{
  "optimizedRoute": [{"city": "string", "days": number, "arrivalMethod": "string"}],
  "cityHighlights": [{"city": "string", "mustDo": ["string"], "estimatedCost": number}],
  "transportSuggestions": [{"from": "string", "to": "string", "method": "string", "estimatedCost": number, "duration": "string"}],
  "optimizationTips": ["string"],
  "totalEstimatedCost": number
}`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      return { rawSuggestion: text };
    }

    return { rawSuggestion: text };
  } catch (_error) {
    throw new Error('Failed to optimize itinerary');
  }
};

/**
 * Get activity suggestions for a city
 */
export const getActivitySuggestions = async (
  city: string,
  country: string,
  category?: string,
  budget?: number
) => {
  const prompt = `Suggest top activities and attractions in ${city}, ${country}.
${category ? `Focus on: ${category}` : 'Include various categories.'}
${budget ? `Budget per activity: up to $${budget}` : ''}

Provide 10 activities in JSON format:
{
  "activities": [
    {
      "name": "string",
      "category": "SIGHTSEEING|FOOD|ADVENTURE|CULTURE|SHOPPING|NIGHTLIFE|RELAXATION",
      "description": "string",
      "estimatedCost": number,
      "duration": number,
      "address": "string",
      "tips": "string",
      "rating": number
    }
  ]
}`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      return { rawSuggestion: text };
    }

    return { rawSuggestion: text };
  } catch (_error) {
    throw new Error('Failed to get activity suggestions');
  }
};

/**
 * Get budget recommendations
 */
export const getBudgetRecommendations = async (
  destination: string,
  duration: number,
  travelStyle: string = 'moderate'
) => {
  const prompt = `Provide a detailed budget breakdown for a ${duration}-day trip to ${destination}.
Travel style: ${travelStyle} (budget/moderate/luxury)

Include realistic costs in USD for:
1. Accommodation per night
2. Food per day
3. Local transportation
4. Activities and entrance fees
5. Miscellaneous expenses

Format as JSON:
{
  "dailyBudget": {
    "accommodation": {"low": number, "mid": number, "high": number},
    "food": {"low": number, "mid": number, "high": number},
    "transport": {"low": number, "mid": number, "high": number},
    "activities": {"low": number, "mid": number, "high": number},
    "misc": {"low": number, "mid": number, "high": number}
  },
  "totalEstimate": {"low": number, "mid": number, "high": number},
  "savingTips": ["string"],
  "splurgeWorthy": ["string"]
}`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      return { rawSuggestion: text };
    }

    return { rawSuggestion: text };
  } catch (_error) {
    throw new Error('Failed to get budget recommendations');
  }
};

/**
 * Chat with AI travel assistant
 */
export const chatWithAssistant = async (
  message: string,
  context?: { tripName?: string; destination?: string; dates?: string }
) => {
  const contextInfo = context
    ? `Context: Planning a trip${context.tripName ? ` called "${context.tripName}"` : ''}${context.destination ? ` to ${context.destination}` : ''}${context.dates ? ` during ${context.dates}` : ''}.`
    : '';

  const prompt = `You are a helpful travel planning assistant for GlobeTrotter app.
${contextInfo}

User question: ${message}

Provide helpful, concise travel advice. If suggesting specific places or activities, include approximate costs and practical tips.`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return { message: response.text() };
  } catch (_error) {
    throw new Error('Failed to get response from AI assistant');
  }
};
