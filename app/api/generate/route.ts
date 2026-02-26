import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    // 1. Parse Request Body
    const body = await req.json();
    const { cities, vibe, language } = body; // language: 'en' | 'zh'

    console.log("API Route Hit. Generating for:", cities.length, "cities. Lang:", language);
    
    // Determine language instruction
    const langInstruction = language === 'zh' 
      ? "Respond in Simplified Chinese (简体中文). Use Chinese characters for names/descriptions." 
      : "Respond in English.";

    // ... key check ...

    // Format cities for prompt
    const citiesPrompt = cities.map((c: any) => 
      `${c.name} (from ${c.startDate} to ${c.endDate})`
    ).join(", ");

    // 4. Construct Prompt
    const prompt = `
      You are an expert travel planner. Create a detailed itinerary for a multi-city trip:
      Cities & Dates: ${citiesPrompt}.
      Vibe: ${vibe || "General sightseeing"}.
      Language: ${langInstruction}

      CRITICAL INSTRUCTIONS:
      1. ${langInstruction}
      2. For EACH day, provide specific activities for: Breakfast, Morning, Lunch, Afternoon, Dinner, Evening.
      2. For "Morning", "Afternoon", and "Evening" slots, suggest at least 2-3 specific spots/activities if time permits.
      3. For "Breakfast", "Lunch", and "Dinner", suggest SPECIFIC FAMOUS RESTAURANTS or street food areas known in that city.
      4. Ensure the flow makes geographical sense (don't jump across the city).

      Return ONLY a JSON object with this exact structure:
      {
        "tripName": "Descriptive Trip Title (e.g. 'Japow Ski Trip')",
        "cities": [
          {
            "name": "City Name",
            "startDate": "YYYY-MM-DD",
            "endDate": "YYYY-MM-DD",
            "days": [
              {
                "date": "YYYY-MM-DD",
                "activities": [
                  { 
                    "time": "Breakfast", 
                    "title": "Restaurant Name / Activity", 
                    "type": "FOOD", 
                    "notes": "Must try: [Dish Name]" 
                  },
                  { 
                    "time": "Morning", 
                    "title": "Spot 1, Spot 2, Spot 3", 
                    "type": "ACTIVITY", 
                    "notes": "Description of the area" 
                  },
                  { 
                    "time": "Lunch", 
                    "title": "Restaurant Name", 
                    "type": "FOOD", 
                    "notes": "Famous for..." 
                  },
                  { 
                    "time": "Afternoon", 
                    "title": "Spot A, Spot B", 
                    "type": "ACTIVITY", 
                    "notes": "Description" 
                  },
                  { 
                    "time": "Dinner", 
                    "title": "Restaurant Name", 
                    "type": "FOOD", 
                    "notes": "Reservation recommended?" 
                  },
                  { 
                    "time": "Evening", 
                    "title": "Nightlife / Walk / View", 
                    "type": "ACTIVITY", 
                    "notes": "Open late" 
                  }
                ]
              }
            ]
          }
        ]
      }
    `;

    // 5. Generate Content with JSON Mode
    console.log("Sending prompt to Gemini (2.0-flash)...");
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const response = await result.response;
    const text = response.text();
    
    console.log("Gemini Response received (length):", text.length);

    // 6. Return JSON directly
    return NextResponse.json(JSON.parse(text));

  } catch (error: any) {
    console.error("Critical API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
