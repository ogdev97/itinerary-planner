// Fix the API route structure
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { cities, startDate, endDate, vibe } = await req.json();

    if (process.env.GOOGLE_API_KEY) {
      console.log("Generating with Gemini...");
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `
        You are an expert travel planner. Create a detailed itinerary for a trip to: ${cities}.
        Start Date: ${startDate}. End Date: ${endDate}.
        Vibe: ${vibe || "General sightseeing"}.

        Return ONLY a JSON object with this exact structure (no markdown, no extra text):
        {
          "tripName": "Descriptive Trip Title",
          "cities": [
            {
              "name": "City Name",
              "startDate": "${startDate}", // Use provided dates if single city, or split reasonably
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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const data = JSON.parse(jsonStr);
      return NextResponse.json(data);
    } 
    
    // Fallback if no key
    console.log("Using Mock Data (No API Key found)");
    return NextResponse.json({
      tripName: "Generated Trip (Mock)",
      cities: [
        {
          name: "Tokyo",
          startDate: startDate || "2023-10-01",
          endDate: endDate || "2023-10-02",
          days: [
            {
              date: startDate || "2023-10-01",
              activities: [
                { time: "Morning", title: "Visit Senso-ji Temple", type: "ACTIVITY", cost: 0, notes: "Historic temple in Asakusa" },
                { time: "Lunch", title: "Sushi at Tsukiji Outer Market", type: "FOOD", cost: 30, notes: "Try the fresh tuna!" },
                { time: "Afternoon", title: "Explore TeamLab Planets", type: "ACTIVITY", cost: 25, notes: "Immersive digital art museum" },
                { time: "Dinner", title: "Izakaya Hopping in Shinjuku", type: "FOOD", cost: 40, notes: "Yakitori and drinks in Omoide Yokocho" }
              ]
            }
          ]
        }
      ]
    });

  } catch (error) {
    console.error("Generate Error:", error);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
