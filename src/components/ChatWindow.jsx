import { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";

export default function ChatWindow({ conversation }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(conversation.messages || []);
  const messagesEndRef = useRef(null);

  const handleSend = () => {
    if (input.trim()) {
      const newMessage = {
        from: "agent",
        text: input.trim(),
        timestamp: new Date().toISOString()
      };
      setMessages([...messages, newMessage]);
      setInput('');
    }
  };

  useEffect(() => {
    setMessages(conversation.messages || []);
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className="w-full flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={`${msg.timestamp || idx}-${idx}`}
              className={`flex ${msg.from === "agent" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.from === "agent"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button onClick={handleSend} size="sm">
          Send
        </Button>
      </div>
    </Card>
  );
}