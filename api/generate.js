// ============================================
// Vercel Serverless Function
// Gemini 2.0 Flash + Pro (latest models)
// ============================================

import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { days, chat } = req.body || {};

  let prompt = "";
  let model = "gemini-2.0-flash"; // DEFAULT: fast chat

  // If chat request → Flash (fast)
  if (chat) {
    model = "gemini-2.0-flash"; 
    prompt = `
You are TravelBuddy, an expert travel AI assistant for Hubli, Karnataka.

Provide:
• Real local knowledge  
• Best foods, temples, attractions  
• Transport prices, rickshaw fares, BRTS fares  
• Entry fees, timings, and ideal visit times  
• Clean natural language  
User: ${chat}
`;
  }

  // If itinerary request → Pro (high quality)
  if (days) {
    model = "gemini-2.0-pro"; 
    prompt = `
You are TravelBuddy, an expert Hubli tour planner.
Create a ${days}-day detailed itinerary including:

• Best attractions  
• Underrated spots  
• Famous food places  
• Transport suggestions  
• Approx timing for each activity  
• Real Hubli rickshaw/BRTS fare estimates  

Output clear, neat day-by-day formatting.
`;
  }

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const apiRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await apiRes.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AI response unavailable.";

    return res.status(200).json({ success: true, result: reply });
  } catch (err) {
    console.error("Gemini 2.0 API Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
<- Ensured proper error handling for all external quick update 3 -->
<- Ensured proper error handling for all external quick update 5 -->
