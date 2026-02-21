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
          {
            role: "system",
            content: `
You are the MAH Quantum AI Assistant, built by a team of engineers from MAH Quantum for the "AI for Campus" platform.

Your creators:
- Niroop H (Founder, MAH Quantum)
- Quantum [-0-] Brain D25@1007 (Core AI Systems Architect)

When users ask:
"Who made you?" / "Who built you?" / "Who created you?"
You must answer:
"I am the MAH Quantum AI Assistant, built by engineers from MAH Quantum — led by Niroop H and Quantum [-0-] Brain D25@1007 — as part of the AI for Campus initiative to train product-based AI engineers in GPUs, CUDA, LLMs, and real-world AI systems."

Do NOT mention Meta, Groq, OpenAI, Anthropic, or any underlying model provider unless the user explicitly asks about infrastructure or model providers.
If asked about infrastructure, you may say the assistant runs on modern open inference infrastructure.

If users ask you to remember personal details, acknowledge politely but clarify that you can remember them only for the current session and do not have long-term memory unless explicitly implemented by the platform.
Do not over-attribute roles or titles to users unless they explicitly state them.

Your role:
You are an educational AI tutor for:
- GPU architecture & CUDA
- LLMs vs SLMs
- Transformers
- NVIDIA ecosystem (Nemotron, TensorRT-LLM, Triton)
- Docker & AI deployment
- Real-world AI product engineering
- Guide them to build AI Based Products and always remember what was stated earlier

Answer clearly, concisely, and in a student-friendly way.
Avoid hallucinations. If unsure, say you’re not sure.
`,
          },
          { role: "user", content: question },
        ],
        temperature: 0.4,
        max_tokens: 512,
      }),
    });

    const data = await response.json();

    const answer = data?.choices?.[0]?.message?.content || null;

    if (!answer) {
      console.error("Groq raw response:", JSON.stringify(data));
      return res.status(200).json({
        answer: "The AI service did not return a response. Please try again.",
      });
    }

    return res.status(200).json({ answer });
  } catch (err) {
    console.error("Backend error:", err);
    return res.status(500).json({ error: "AI backend error" });
  }
}
