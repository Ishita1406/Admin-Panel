import { useState } from "react";
import InboxList from "./components/InboxList";
import ChatWindow from "./components/ChatWindow";
import AICopilot from "./components/AICopilot";
import sampleConversations from "./data/sampleConversations";

function App() {
  const [selectedId, setSelectedId] = useState(sampleConversations[0].id);
  const selectedConv = sampleConversations.find(c => c.id === selectedId);

  return (
    <div className="flex h-screen">
      <InboxList
        conversations={sampleConversations}
        onSelect={setSelectedId}
        selectedId={selectedId}
      />
      <ChatWindow conversation={selectedConv} />
      <AICopilot conversation={selectedConv} />

    </div>
  );
}

export default App;
