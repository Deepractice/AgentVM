import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MoreHorizontal, Smile, Paperclip, Image, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
}

// 模拟消息数据
const mockMessages: Message[] = [
  {
    id: "1",
    role: "user",
    content: "你好，我想了解一下这个项目的进展",
    timestamp: "14:30",
  },
  {
    id: "2",
    role: "assistant",
    content: "您好！项目目前进展顺利，我们已经完成了核心功能的开发，正在进行测试阶段。",
    timestamp: "14:31",
  },
  {
    id: "3",
    role: "user",
    content: "测试大概需要多长时间？",
    timestamp: "14:32",
  },
  {
    id: "4",
    role: "assistant",
    content: "预计还需要一周左右的时间完成全部测试。我们会确保产品质量达标后再进行发布。",
    timestamp: "14:33",
  },
  {
    id: "5",
    role: "user",
    content: "好的，辛苦了",
    timestamp: "14:35",
  },
];

interface ChatAreaProps {
  sessionId: string;
  sessionName: string;
}

export function ChatArea({ sessionId: _sessionId, sessionName }: ChatAreaProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([...messages, newMessage]);
    setInputValue("");

    // 模拟回复
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "收到您的消息，我会尽快处理。",
        timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, reply]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[var(--border-light)]">
        <span className="text-sm font-medium text-[var(--text-primary)]">{sessionName}</span>
        <button className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[70%] px-3 py-2 rounded-lg text-sm",
                message.role === "user"
                  ? "bg-[#4A7FD4] text-white"
                  : "bg-white text-[var(--text-primary)] border border-[var(--border-light)]"
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - WeChat Style (250px) */}
      <div className="h-[250px] border-t border-[var(--border-light)] bg-[var(--bg-card)] flex flex-col">
        {/* Toolbar */}
        <div className="h-10 px-4 flex items-center gap-1 shrink-0">
          <button className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded transition-colors">
            <Smile className="w-5 h-5" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded transition-colors">
            <Image className="w-5 h-5" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded transition-colors">
            <Scissors className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <div className="flex-1 px-4 pb-3 flex flex-col">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("sessions.inputPlaceholder")}
            className="flex-1 py-2 px-3 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className={cn(
                "h-8 px-4 rounded text-sm font-medium transition-colors",
                inputValue.trim()
                  ? "bg-[#4A7FD4] text-white hover:bg-[#3D6BB3]"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed"
              )}
            >
              {t("sessions.send")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
