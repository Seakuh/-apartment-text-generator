import axios from "axios";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = 3001;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(bodyParser.json());
app.use(cors()); // Aktiviert CORS für alle Anfragen

app.post("/generate-text", async (req, res) => {
  const { query, style } = req.body;

  const systemContentFrendly = `
  Du bist ein hilfsbereiter Assistent für Wohnungssuche-Texte. 
  nutze einen kreativen betreff text
  Fange immer mit dem betreff an und mach danach zwei absätze hierfür nutzt 
  du folgendes fachwissen: ein vermieter möchte einen ordentlichen und hilfsbereiten mieter. 
  Liste wichtige eigenschaften des mieters immer in 3 ungeordneten punkten ohne extra absatz mit jeweils einem emoji auf. 
  schreibe das der mieter eine versicherung hat und nutze emojies nach jedem absatz. 
  Schreibe das er auf pflanzen aufpasst mit jeweiligen emojies. Lese den namen aus dem prompt. 
  Ist der nutzer seriös dann nutze nur wenige bis keine business emojies und achte darauf das 
  du in einer angemessenen seriösen sprache schreibst verwende eine förmliche anrede und sag das 
  du sehr pflichtbewusst und ergeizig bist.`;

  const systemContentSeries = `
  Du bist ein hilfsbereiter Assistent für Wohnungssuche-Texte auf einer Seriösen Plattform.
  Bitte verwende eine sehr eloquente und gehobene sprache
  Nutze folgende emojies: 👨‍💼💰📈💼👍🏥 🏦 🏨 🏪 🏫 🏩 💒
  Ein seriöser Vermieter legt in der Regel Wert auf bestimmte Eigenschaften und Qualitäten bei seinen Mietern, um eine langfristige, zuverlässige Mietbeziehung sicherzustellen. Hier sind die Hauptmerkmale, die ein seriöser Vermieter in einem Mieter sucht:
    1. Zuverlässigkeit und Zahlungsfähigkeit
    Stabile Finanzen: Ein sicheres Einkommen und die Fähigkeit, die Miete pünktlich zu zahlen, sind zentrale Aspekte. Viele Vermieter verlangen Gehaltsnachweise oder einen Einkommensnachweis, um sicherzustellen, dass der Mieter sich die Wohnung langfristig leisten kann.
    Saubere SCHUFA-Auskunft: Ein positiver SCHUFA-Score oder eine ähnliche Bonitätsauskunft zeigt dem Vermieter, dass der Mieter seine finanziellen Verpflichtungen ernst nimmt.
    2. Respekt und Verantwortungsbewusstsein
    Pfleglicher Umgang mit der Wohnung: Ein Vermieter sucht jemanden, der seine Wohnung gut behandelt und Schäden vermeidet. Der Mieter sollte bereit sein, sich um kleinere Reparaturen zu kümmern und die Wohnung in gutem Zustand zu halten.
    Rücksicht auf Nachbarn: Ein seriöser Vermieter legt Wert darauf, dass der Mieter eine ruhige und respektvolle Person ist, die keine Lärmbelästigung verursacht und sich in die Nachbarschaft gut integriert.
    3. Langfristiges Mietverhältnis
    Stabile Lebenssituation: Vermieter suchen häufig Mieter, die nicht nur für ein paar Monate bleiben, sondern längerfristig wohnen möchten. Das erspart dem Vermieter den Aufwand, ständig neue Mieter suchen zu müssen.
    Verlässliche Kommunikation: Eine gute und offene Kommunikation bei Anliegen oder Problemen ist wichtig, damit der Vermieter bei Notwendigkeit schnell informiert wird und Vertrauen aufgebaut werden kann.
    4. Nachweise und Referenzen
    Positive Referenzen: Empfehlungen früherer Vermieter oder Arbeitgeber können Vertrauen schaffen und zeigen, dass der Mieter in der Vergangenheit verlässlich war.
    Mietschuldenfreiheitsbescheinigung: Diese Bescheinigung kann dem Vermieter die Sicherheit geben, dass der Mieter in der Vergangenheit keine Mietschulden hinterlassen hat.
    5. Seriöses Auftreten
    Gepflegtes Auftreten und freundliches Verhalten: Ein seriöser Vermieter legt Wert auf höfliche, professionelle Kommunikation und Pünktlichkeit bei Besichtigungen.
    Verlässliche Dokumente: Der Mieter sollte alle angeforderten Unterlagen vollständig und korrekt bereitstellen und den Vermieter nicht in einer „Hinterherlauf“-Position bringen.
    `;

  const content =
    style === "friendly" ? systemContentFrendly : systemContentSeries;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: content,
        },
        {
          role: "user",
          content: `Schreibe einen ${style} Wohnungssuche-Text für die folgende Beschreibung: ${query}`,
        },
      ],
    });

    // Extrahiere den Text aus der Antwort und sende ihn an den Client zurück
    const generatedText = completion.choices[0].message.content;
    res.json({ text: generatedText });
  } catch (error) {
    console.error("Fehler beim Generieren des Textes:", error);
    res.status(500).json({ error: "Fehler beim Generieren des Textes" });
  }
});

app.post("/generate-text-stream", async (req, res) => {
  const { query, style } = req.body;

  // Set headers for Server-Sent Events (SSE)
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    // Use axios directly for more granular control over the response stream
    const response = await axios({
      method: "post",
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      data: {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "Du bist ein hilfsbereiter Assistent für Wohnungssuche-Texte.",
          },
          {
            role: "user",
            content: `Schreibe einen ${style} Wohnungssuche-Text für die folgende Beschreibung: ${query}`,
          },
        ],
        stream: true,
      },
      responseType: "stream",
    });

    // Listen to the data as it's streamed
    response.data.on("data", (chunk) => {
      const lines = chunk.toString().split("\n");

      for (const line of lines) {
        if (line.trim().startsWith("data:")) {
          const json = line.replace(/^data: /, "");
          if (json === "[DONE]") {
            res.write("event: close\ndata: [DONE]\n\n");
            res.end();
            return;
          }

          try {
            const parsed = JSON.parse(json);
            const textChunk = parsed.choices[0].delta?.content || "";
            res.write(`data: ${textChunk}\n\n`);
          } catch (err) {
            console.error("Error parsing JSON chunk:", err);
          }
        }
      }
    });

    response.data.on("end", () => {
      // End the response once the stream is complete
      res.write("event: close\ndata: [DONE]\n\n");
      res.end();
    });
  } catch (error) {
    console.error("Error with OpenAI API request:", error);
    res.status(500).send("Error generating text.");
  }
});

// Server starten
app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
