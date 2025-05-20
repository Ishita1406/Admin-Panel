import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Card, CardContent } from "./ui/card";

export default function InboxList({ conversations, onSelect, selectedId }) {
  return (
    <div className="w-1/4 border-r h-full flex flex-col">
      <div className="p-4 flex justify-between text-sm text-muted-foreground">
        <p>5 Open</p>
        <p>Waiting Longest</p>
      </div>
      <Separator />

      <ScrollArea className="flex-1">
        {conversations.map((conv) => (
          <Card
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`m-2 cursor-pointer transition-colors ${
              selectedId === conv.id
                ? 'bg-muted border-primary'
                : 'hover:bg-accent'
            }`}
          >
            <CardContent className="p-4">
              <strong className="block text-sm font-medium">{conv.sender}</strong>
              <p className="text-sm text-muted-foreground">{conv.preview}</p>
            </CardContent>
          </Card>
        ))}
      </ScrollArea>
    </div>
  );
}
