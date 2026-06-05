import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "bot" | "user";
  content: string;
  timestamp: Date;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: "สวัสดีครับ! ผมคือผู้ช่วย Fitder ยินดีที่ได้รู้จักครับ มีอะไรให้ผมช่วยไหมครับ?",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Botnoi API Configuration ───────────────────────────────────────────────
  // แนะนำให้ใส่ค่าเหล่านี้ในไฟล์ .env
  const BOTNOI_API_KEY = import.meta.env.VITE_BOTNOI_API_KEY || "YOUR_API_KEY";
  const BOTNOI_BOT_ID = import.meta.env.VITE_BOTNOI_BOT_ID || "YOUR_BOT_ID";
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // ── Integration with Botnoi.ai ──────────────────────────────────────────
      const response = await fetch("https://openapi.botnoi.ai/api/v1/chatbot/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BOTNOI_API_KEY}`,
        },
        body: JSON.stringify({
          bot_id: BOTNOI_BOT_ID,
          message: input,
          user_id: user?.id || "anonymous_user",
        }),
      });

      const data = await response.json();
      
      let botContent = "ขออภัยครับ ระบบ Chatbot ขัดข้องชั่วคราว กรุณาลองใหม่ภายหลังครับ";
      
      // ตรวจสอบรูปแบบ Response จาก Botnoi (ปรับตามความจริงของ API)
      if (data && data.response) {
        botContent = data.response;
      } else if (data && data.message) {
        botContent = data.message;
      }

      const botMsg: Message = {
        role: "bot",
        content: botContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Botnoi API Error:", error);
      const errorMsg: Message = {
        role: "bot",
        content: "ขออภัยครับ ไม่สามารถเชื่อมต่อกับผู้ช่วย AI ได้ในขณะนี้",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between bg-primary p-4 text-primary-foreground">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-white/20 p-1">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold">Fitder AI Assistant</div>
                <div className="text-[10px] opacity-80">Online</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 transition hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex w-max max-w-[80%] flex-col gap-1 rounded-2xl px-4 py-2 text-sm",
                    m.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-muted text-foreground rounded-tl-none"
                  )}
                >
                  {m.content}
                  <div className={cn(
                    "text-[10px] opacity-50",
                    m.role === "user" ? "text-right" : "text-left"
                  )}>
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex w-max max-w-[80%] items-center gap-2 rounded-2xl bg-muted px-4 py-2 text-sm rounded-tl-none">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs italic">กำลังพิมพ์...</span>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-border p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="พิมพ์ข้อความที่นี่..."
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
              <Button size="icon" className="h-8 w-8 rounded-full" disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95",
          isOpen ? "bg-muted text-muted-foreground rotate-90" : "bg-primary text-primary-foreground"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
