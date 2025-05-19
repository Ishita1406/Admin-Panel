export default function InboxList({ conversations, onSelect, selectedId }) {
    return (
      <div className="w-1/4 border-r overflow-y-auto">
        <div className="flex justify-between m-5">
            <p>5 Open</p>
            <p>Waiting Longest</p>
        </div>
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`p-4 cursor-pointer ${selectedId === conv.id ? 'bg-gray-200' : ''}`}
            onClick={() => onSelect(conv.id)}
          >
            <strong>{conv.sender}</strong>
            <p className="text-sm text-gray-500">{conv.preview}</p>
          </div>
        ))}
      </div>
    );
  }
  