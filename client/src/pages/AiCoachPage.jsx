import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { apiClient } from "../lib/api/client";

export function AiCoachPage() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I'm your AI Fitness Coach. I can help you build workout plans, give nutrition advice, or analyze your daily stats. How can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMsg = inputValue.trim();
    setInputValue("");
    
    // Add user message
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", text: userMsg },
    ]);
    setIsTyping(true);

    try {
      const response = await apiClient.post("/assistant", { message: userMsg });
      const replyText = response.data?.data?.reply || "I'm having trouble connecting right now.";
      
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "_ai", role: "assistant", text: replyText },
      ]);
    } catch (error) {
      console.error("AI Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { 
          id: Date.now().toString() + "_err", 
          role: "assistant", 
          text: "Something went wrong on my end! Please try again." 
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-dark-950 font-sans relative">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-glass-black border-b border-white/5 z-50 flex items-center px-4 max-w-lg mx-auto">
        <Link to="/home" className="w-10 h-10 flex items-center justify-center text-dark-200 hover:text-white transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div className="ml-2 flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-lg shadow-[0_0_10px_rgba(0,212,255,0.3)]">
              🤖
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-neon-green border-2 border-dark-900" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">NutriSnap AI</h1>
            <p className="text-[10px] text-neon-blue font-medium tracking-wide">FITNESS COACH</p>
          </div>
        </div>
      </header>

      {/* Chat History */}
      <main className="flex-1 overflow-y-auto px-4 pt-20 pb-24 max-w-lg mx-auto w-full hide-scrollbar flex flex-col gap-4">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div key={msg.id} className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-glass-light flex items-center justify-center text-sm flex-shrink-0 border border-white/5">
                  🤖
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-2xl p-3.5 ${
                  isUser
                    ? "bg-gradient-to-br from-neon-blue to-neon-teal text-dark-900 rounded-br-sm shadow-lg shadow-neon-blue/20"
                    : "bg-glass-static border border-white/5 text-dark-50 rounded-bl-sm"
                }`}
              >
                <div className={`prose prose-sm max-w-none leading-relaxed ${isUser ? "prose-invert text-dark-900 font-medium" : "text-dark-100"}`}>
                  <ReactMarkdown
                    components={{
                      p: ({ node: _node, ...props }) => <p className="m-0" {...props} />,
                      ul: ({ node: _node, ...props }) => <ul className="pl-4 my-2 list-disc" {...props} />,
                      ol: ({ node: _node, ...props }) => <ol className="pl-4 my-2 list-decimal" {...props} />,
                      li: ({ node: _node, ...props }) => <li className="my-0.5" {...props} />,
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-end gap-2.5">
            <div className="w-8 h-8 rounded-full bg-glass-light flex items-center justify-center text-sm flex-shrink-0 border border-white/5">
              🤖
            </div>
            <div className="bg-glass-static border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 min-w-[60px] flex items-center justify-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-dark-300 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-dark-300 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-dark-300 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="fixed bottom-0 left-0 right-0 bg-dark-950 border-t border-white/5 z-50 p-4 pb-safe max-w-lg mx-auto">
        <form onSubmit={handleSend} className="relative flex items-center bg-glass-light border border-white/10 rounded-full focus-within:border-neon-blue/50 focus-within:ring-1 focus-within:ring-neon-blue/50 transition-all pl-4 pr-1.5 py-1.5">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask your coach anything..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white placeholder:text-dark-400 py-2 h-10"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="w-10 h-10 rounded-full bg-neon-blue text-dark-900 flex items-center justify-center disabled:opacity-50 disabled:bg-dark-500 disabled:text-dark-300 transition-colors ml-2 flex-shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}
