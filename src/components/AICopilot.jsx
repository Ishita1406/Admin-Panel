import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function AICopilot({ conversation, setComposerText }) {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [personalizedText, setPersonalizedText] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  // Generate conversation summary on mount
  useEffect(() => {
    const fullText = conversation.messages.map(msg => `${msg.from}: ${msg.text}`).join('\n');
    fetchSummary(fullText);
  }, [conversation]);

  const fetchSummary = async (text) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `Summarize this conversation:\n${text}` }] }],
        }),
      });

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      setSummary(reply);
    } catch (err) {
      setSummary('Error generating summary.');
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;

    const fullText = conversation.messages.map(msg => `${msg.from}: ${msg.text}`).join('\n');

    const newChat = { role: 'user', text: question };
    setChatHistory((prev) => [...prev, newChat]);
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are an AI copilot assisting a support agent.\n\nConversation:\n${fullText}\n\nQuestion: ${question}`,
                },
              ],
            },
          ],
        }),
      });

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      setChatHistory((prev) => [...prev, { role: 'bot', text: reply }]);
    } catch (err) {
      setChatHistory((prev) => [...prev, { role: 'bot', text: 'Error getting response.' }]);
    } finally {
      setLoading(false);
      setQuestion('');
    }
  };

  const handleRewrite = async () => {
    const lastBot = chatHistory.filter(msg => msg.role === 'bot').at(-1);
    if (!lastBot) return;

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Rewrite the following message in a more friendly and human tone:\n\n"${lastBot.text}"`,
                },
              ],
            },
          ],
        }),
      });

      const data = await res.json();
      const rewritten = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      setPersonalizedText(rewritten);
    } catch (err) {
      setPersonalizedText('Error rewriting message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-1/4 p-4 flex flex-col h-full border-l bg-gray-50 overflow-hidden">
      <h3 className="font-semibold mb-1">🤖 Hi, I’m Fin – AI Copilot</h3>
      <p className="text-sm text-gray-600 mb-2">Ask me anything about this conversation.</p>
{/* 
      <div className="mb-4 bg-yellow-100 p-3 rounded text-sm">
        <strong className="text-yellow-900">📌 Summary:</strong>
        <p className="text-gray-800 mt-1">{summary}</p>
      </div> */}

      <div className="flex-1 overflow-y-auto mb-3 space-y-2 pr-1">
        {chatHistory.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded text-sm whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-blue-100 text-blue-900'
                : 'bg-green-100 text-green-900'
            }`}
          >
            <strong>{msg.role === 'user' ? 'You' : 'Copilot'}:</strong>{' '}
            {msg.role === 'bot' ? (
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            ) : (
              msg.text
            )}
             {/* <button
            onClick={() => setComposerText(personalizedText)}
            className="text-xs bg-purple-600 text-white py-1 px-2 rounded hover:bg-purple-700"
          >
            ➕ Add to Composer
          </button> */}
          </div>
        ))}
      </div>

      {personalizedText && (
        <div className="mb-3 bg-purple-100 p-2 rounded text-sm text-purple-900">
          <strong>✨ Personalized:</strong> {personalizedText}
        </div>
      )}

      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 p-2 border rounded text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-sm"
        >
          {loading ? 'Thinking...' : 'Ask'}
        </button>
      </div>

      {/* <button
        onClick={handleRewrite}
        disabled={loading || !chatHistory.some(msg => msg.role === 'bot')}
        className="text-xs bg-purple-600 text-white py-1.5 px-3 rounded hover:bg-purple-700 disabled:opacity-50"
      >
        🎨 Make it sound more like us
      </button> */}
    </div>
  );
}
