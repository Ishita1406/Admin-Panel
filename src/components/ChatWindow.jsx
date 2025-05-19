import { useState, useEffect, useRef } from "react";

export default function ChatWindow({ conversation }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(conversation.messages || []);
  const messagesEndRef = useRef(null);

  const handleSend = () => {
    if (input.trim()) {
      const newMessage = {
        from: "agent",
        text: input.trim(),
      };
      setMessages([...messages, newMessage]);
      setInput('');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-2/4 flex flex-col justify-between border-r h-full">
      <div className="p-4 flex-1 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`my-2 ${msg.from === "agent" ? "text-right" : "text-left"}`}
          >
            <p className={`inline-block p-2 rounded ${msg.from === "agent" ? "bg-blue-100" : "bg-gray-100"}`}>
              {msg.text}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 p-2 border rounded"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
