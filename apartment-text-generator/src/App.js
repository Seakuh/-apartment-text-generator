import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef, useState } from "react";
import "./App.css";
const App = () => {
    const [query, setQuery] = useState("");
    const [style, setStyle] = useState("friendly");
    const [generatedText, setGeneratedText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const textAreaRef = useRef(null);
    const apiUrl = "https://apartment-text-generator.onrender.com";
    const handleGenerateText = async () => {
        setGeneratedText("");
        setIsLoading(true);
        try {
            const response = await fetch(`${apiUrl}/generate-text`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query, style }),
            });
            const data = await response.json();
            setGeneratedText(data.text);
        }
        catch (error) {
            console.error("Error generating text:", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleChange = (e) => {
        setQuery(e.target.value);
        // Auto-resize the textarea height based on content
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto"; // Reset height to calculate the new height
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`; // Set height to content height
        }
    };
    const handleCopy = () => {
        navigator.clipboard
            .writeText(generatedText)
            .then(() => console.log("Text copied to clipboard!"))
            .catch((error) => console.error("Failed to copy text:", error));
    };
    return (_jsxs("div", { className: "container", children: [_jsx("h1", { className: "headline", children: "Apartment Genie \uD83C\uDFE0\uD83E\uDDDE\u200D\u2642\uFE0F" }), _jsxs("div", { className: "search", children: [_jsx("div", { className: "input-container", children: _jsx("textarea", { ref: textAreaRef, value: query, onChange: handleChange, placeholder: "Was f\u00FCr ein Zuhause m\u00F6chtest Du finden? Erz\u00E4hle \u00FCber dich :)", className: "text-area", rows: 2 }) }), _jsxs("div", { className: "radio-button-container", children: [_jsxs("label", { className: "radio-button", children: [_jsx("input", { type: "radio", value: "friendly", checked: style === "friendly", onChange: () => setStyle("friendly") }), "Freundlich \uD83D\uDE0A"] }), _jsxs("label", { className: "radio-button", children: [_jsx("input", { type: "radio", value: "serious", checked: style === "serious", onChange: () => setStyle("serious") }), "Seri\u00F6s \uD83E\uDDD0"] })] }), _jsx("div", { className: "button-container", children: _jsx("button", { onClick: handleGenerateText, disabled: isLoading, children: isLoading ? "Generiere Text..." : "Text generieren" }) })] }), _jsx("div", { className: "output-container", children: isLoading ? (_jsxs("div", { className: "loading-dots", children: [_jsx("span", { children: "\u2022" }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: "\u2022" })] })) : (_jsxs(_Fragment, { children: [generatedText.split("\n").map((paragraph, index) => (_jsx("p", { className: "output-paragraph", children: paragraph }, index))), generatedText && (_jsx("button", { className: "copy-button", onClick: handleCopy, title: "Copy text", children: "\uD83D\uDCCB Copy" }))] })) })] }));
};
export default App;
