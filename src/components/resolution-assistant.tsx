"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, MessageSquare, Send, X, FileText, Phone, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
}

export function ResolutionAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      sender: "ai",
      text: "Halo, saya Resolution Assistant (SOP Mining Agent). Ada kendala inventaris atau operasional hari ini?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    
    // Add User Message
    const userMsg: Message = { id: Date.now().toString(), sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    // Simulate AI Response based on Azure AI Search / SOPs
    setTimeout(() => {
      let aiText = "Sistem saat ini sedang memproses direktif. Berdasarkan SOP standar, harap karantina area terdampak dan hubungi supervisi.";
      
      if (text.toLowerCase().includes("reject") || text.toLowerCase().includes("sop")) {
         aiText = "Berdasarkan SOP Kualitas (PDF-DOC-92): 'Barang dengan status REJECT harus disingkirkan dari Zona Climate Controlled dalam kurun 24 jam untuk meminimalisasi pemborosan energi HVAC.'";
      } else if (text.toLowerCase().includes("lot #")) {
         aiText = `Pengecekan Lot dilakukan via Azure... Status: ON-HOLD. Harap memverifikasi ulang hasil scan dokumen Azure Document Intelligence.`;
      }

      setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "ai", text: aiText }]);
    }, 1000);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 right-6 w-[380px] h-[550px] bg-white border border-black shadow-2xl z-50 flex flex-col font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-black text-white p-4 shrink-0">
              <div className="flex items-center gap-3">
                 <div className="bg-white text-black p-1.5 flex items-center justify-center">
                    <Bot className="h-5 w-5" />
                 </div>
                 <div>
                    <h3 className="font-bold uppercase tracking-widest text-sm leading-tight">Resolution Assistant</h3>
                    <p className="text-[10px] text-white/50 font-mono">SOP Data Mining Active</p>
                 </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white hover:text-white/70 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat History */}
            <ScrollArea className="flex-1 p-4 bg-[#fafafa]">
              <div className="flex flex-col gap-4" ref={scrollRef}>
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                    {/* Avatar */}
                    <Avatar className={`h-8 w-8 rounded-none border shrink-0 ${msg.sender === "ai" ? "bg-black text-white border-black" : "bg-white text-black border-black"}`}>
                       <AvatarFallback className="rounded-none bg-transparent font-bold">
                         {msg.sender === "ai" ? "AI" : "ME"}
                       </AvatarFallback>
                    </Avatar>

                    {/* Bubble */}
                    <div className={`p-3 text-sm rounded-none border border-black ${msg.sender === "ai" ? "bg-black text-white" : "bg-white text-black leading-relaxed"}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Quick Suggestions */}
            <div className="px-4 py-3 bg-white border-t border-black/10 shrink-0">
               <p className="text-[10px] uppercase font-bold tracking-widest text-black/40 mb-2">SOP Suggestions</p>
               <div className="flex flex-wrap gap-2">
                 <button 
                   onClick={() => handleSendMessage("Cek SOP Reject")}
                   className="flex items-center gap-1.5 border border-black px-2 py-1 text-xs font-bold hover:bg-black/5 transition-colors"
                 >
                   <FileText className="h-3 w-3" /> Cek SOP Reject
                 </button>
                 <button 
                   onClick={() => handleSendMessage("Hubungi Manager")}
                   className="flex items-center gap-1.5 border border-black px-2 py-1 text-xs font-bold hover:bg-black/5 transition-colors"
                 >
                   <Phone className="h-3 w-3" /> Hubungi Manager
                 </button>
                 <button 
                   onClick={() => handleSendMessage("Status Lot #102")}
                   className="flex items-center gap-1.5 border border-black px-2 py-1 text-xs font-bold hover:bg-black/5 transition-colors"
                 >
                   <Search className="h-3 w-3" /> Status Lot #102
                 </button>
               </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-black shrink-0">
               <form 
                 onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }} 
                 className="flex items-center gap-2"
               >
                 <Input 
                   value={inputValue}
                   onChange={(e) => setInputValue(e.target.value)}
                   placeholder="Type your issue or query..." 
                   className="flex-1 rounded-none border-black focus-visible:ring-black h-10"
                 />
                 <Button type="submit" disabled={!inputValue.trim()} className="rounded-none bg-black text-white hover:bg-black/80 h-10 w-10 p-0 shrink-0">
                   <Send className="h-4 w-4" />
                   <span className="sr-only">Send</span>
                 </Button>
               </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 h-14 w-14 bg-black text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex items-center justify-center z-50 border-2 border-white"
        aria-label="Open Resolution Assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </motion.button>
    </>
  );
}
