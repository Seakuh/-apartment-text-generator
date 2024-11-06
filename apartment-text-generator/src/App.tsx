import React, { useRef, useState } from "react";
import "./App.css";

const App: React.FC = () => {
  const [query, setQuery] = useState("");
  const [style, setStyle] = useState("friendly");
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerateText = async () => {
    setGeneratedText("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3001/generate-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, style }),
      });

      const data = await response.json();
      setGeneratedText(data.text);
    } catch (error) {
      console.error("Error generating text:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGeneratedText("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3001/generate-text-stream",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query, style }),
        }
      );

      // Server-Sent Events (SSE) lesen
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { value, done } = await reader?.read()!;
        if (done) break;

        const chunk = decoder.decode(value);
        chunk.split("\n").forEach((line) => {
          if (line.startsWith("data: ")) {
            const text = line.replace("data: ", "").trim();
            if (text === "[DONE]") return;

            setGeneratedText((prev) => prev + " " + text); // Text stückweise hinzufügen
          }
        });
      }
    } catch (error) {
      console.error("Error generating text:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);

    // Auto-resize the textarea height based on content
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto"; // Reset height to calculate the new height
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`; // Set height to content height
    }
  };

  const streamText = (text: string) => {
    let index = 0;
    const interval = setInterval(() => {
      setGeneratedText((prev) => prev + text.charAt(index));
      index++;
      if (index === text.length) clearInterval(interval);
    }, 50); // Adjust the delay for a slower or faster streaming effect
  };

  return (
    <div className="container">
      <h1 className="headline">Apartment Genie 🏠🧞‍♂️</h1>
      <div className="search">
        <div className="input-container">
          <textarea
            ref={textAreaRef}
            value={query}
            onChange={handleChange}
            placeholder="Was für ein Zuhause möchtest Du finden? Erzähle über dich :)"
            className="text-area"
            rows={2} // Start with a single row, will expand automatically
          />
        </div>

        <div className="radio-button-container">
          <label className="radio-button">
            <input
              type="radio"
              value="friendly"
              checked={style === "friendly"}
              onChange={() => setStyle("friendly")}
            />
            Freundlich 😊
          </label>
          <label className="radio-button">
            <input
              type="radio"
              value="serious"
              checked={style === "serious"}
              onChange={() => setStyle("serious")}
            />
            Seriös 🧐
          </label>
        </div>
        <div className="button-container">
          <button onClick={handleGenerateText} disabled={isLoading}>
            {isLoading ? "Generiere Text..." : "Text generieren"}
          </button>
        </div>
      </div>
      <div className="output-container">
        {isLoading ? (
          <div className="loading-dots">
            <span>•</span>
            <span>•</span>
            <span>•</span>
          </div>
        ) : (
          generatedText.split("\n").map((paragraph, index) => (
            <p key={index} className="output-paragraph">
              {paragraph}
            </p>
          ))
        )}
      </div>
    </div>
  );
};

export default App;
