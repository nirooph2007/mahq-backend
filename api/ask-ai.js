export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "No question provided" });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: "Missing API key" });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: question }],
          },
        ],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 512,
        },
      }),
    });

    const data = await response.json();

    // Helpful debug (remove later)
    console.log("Gemini raw response:", JSON.stringify(data));

    const answer =
      data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") ||
      null;

    if (!answer) {
      return res.status(200).json({
        answer:
          "Gemini returned no text. This may be due to quota limits or safety filters. Try a different question.",
      });
    }

    return res.status(200).json({ answer });
  } catch (err) {
    console.error("AI backend error:", err);
    return res.status(500).json({ error: "AI backend error" });
  }
}
