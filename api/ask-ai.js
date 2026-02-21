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

    const API_KEY = process.env.GROQ_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: "Missing GROQ_API_KEY" });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are an AI tutor for students learning GPUs, CUDA, LLMs, and AI engineering. Give clear, concise explanations." },
          { role: "user", content: question },
        ],
        temperature: 0.4,
        max_tokens: 512,
      }),
    });

    const data = await response.json();

    const answer = data?.choices?.[0]?.message?.content || null;

    if (!answer) {
      console.error("Groq raw:", JSON.stringify(data));
      return res.status(200).json({
        answer: "Groq did not return text. Try again.",
      });
    }

    return res.status(200).json({ answer });
  } catch (err) {
    console.error("Backend error:", err);
    return res.status(500).json({ error: "AI backend error" });
  }
}
