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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `Answer this clearly for an AI student:\n\n${question}` }],
            },
          ],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    const data = await response.json();

    const answer =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
      null;

    if (!answer) {
      console.error("Gemini raw:", JSON.stringify(data));
      return res.status(200).json({
        answer:
          "Gemini did not return text (quota/safety/permission issue). Try again later.",
      });
    }

    return res.status(200).json({ answer });
  } catch (err) {
    console.error("Backend error:", err);
    return res.status(500).json({ error: "AI backend error" });
  }
}
