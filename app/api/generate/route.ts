import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    // 1. Parse Request Body
    const body = await req.json();
    const { cities, startDate, endDate, vibe } = body;

    console.log("API Route Hit. Cities:", cities);
    
    // 2. Check API Key
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.warn("Missing GOOGLE_API_KEY in environment variables.");
      return NextResponse.json(
        { error: "Server Error: API Key missing. Please configure GOOGLE_API_KEY in Vercel settings." },
        { status: 500 }
      );
    }

    // 3. Configure Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.0-flash as seen in reference repo (fast, stable, JSON-native)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 4. Construct Prompt
    const prompt = `
      You are an expert travel planner. Create a detailed itinerary for a trip to: ${cities}.
      Start Date: ${startDate}. End Date: ${endDate}.
      Vibe: ${vibe || "General sightseeing"}.

      Return ONLY a JSON object with this exact structure:
      {
        "tripName": "Descriptive Trip Title",
        "cities": [
          {
            "name": "City Name",
            "startDate": "${startDate}",
            "endDate": "${endDate}",
            "days": [
              {
                "date": "YYYY-MM-DD",
                "activities": [
                  { "time": "Morning", "title": "Activity Name", "type": "ACTIVITY", "cost": 0, "notes": "Short description" },
                  { "time": "Afternoon", "title": "Activity Name", "type": "FOOD", "cost": 0, "notes": "Short description" },
                  { "time": "Evening", "title": "Activity Name", "type": "OTHER", "cost": 0, "notes": "Short description" }
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

    // 6. Return JSON directly (Native JSON mode guarantees valid JSON)
    return NextResponse.json(JSON.parse(text));

  } catch (error: any) {
    console.error("Critical API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
