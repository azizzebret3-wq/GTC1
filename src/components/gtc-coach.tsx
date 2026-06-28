'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Minus, 
  Maximize2, 
  Loader2, 
  User,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth.tsx';
import { askCoach } from '@/ai/flows/gtc-coach-flow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import MathText from '@/components/math-text';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function GTCCoach() {
  const { userData } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: `Salut ${userData?.fullName?.split(' ')[0] || 'Champion'} ! Je suis ton Coach GTC. Prêt à décrocher ton concours aujourd'hui ? 🚀` }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isMinimized]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const result = await askCoach({
        message: userMessage,
        userContext: {
          fullName: userData?.fullName,
          competitionType: userData?.competitionType,
          averageScore: 75,
          completedQuizzes: 12,
        },
        history: messages,
      });

      setMessages(prev => [...prev, { role: 'model', content: result.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "Désolé, j'ai une petite perte de connexion. On peut reprendre ? 🙏" }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 lg:bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 shadow-2xl hover:scale-110 transition-transform duration-300 group p-0 overflow-hidden border-4 border-white/20"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <Sparkles className="w-7 h-7 text-white animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500"></span>
        </span>
      </Button>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-24 lg:bottom-6 right-6 z-[60] transition-all duration-300 ease-in-out flex flex-col items-end",
      isMinimized ? "w-72" : "w-80 sm:w-96"
    )}>
      <Card className="glassmorphism shadow-2xl border-primary/20 overflow-hidden flex flex-col w-full h-[500px] max-h-[70vh]">
        <CardHeader className="p-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                <Sparkles className="w-6 h-6 text-white" />
             </div>
             <div>
                <CardTitle className="text-base font-bold">Coach GTC</CardTitle>
                <div className="flex items-center gap-1.5">
                   <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                   <span className="text-[10px] text-white/80 font-medium">En ligne</span>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-1">
             <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10" onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
             </Button>
             <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
             </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="p-0 flex-1 overflow-hidden flex flex-col bg-slate-50/50 dark:bg-black/20">
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <div key={i} className={cn(
                      "flex gap-3 max-w-[85%]",
                      msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}>
                      <Avatar className="h-8 w-8 shrink-0 border-2 border-white/50 shadow-sm">
                        {msg.role === 'model' ? (
                          <>
                            <AvatarImage src="/bot-avatar.png" />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </>
                        ) : (
                          <>
                             <AvatarImage src={userData?.photoURL ?? undefined} />
                             <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-600 text-white">
                                <User className="h-4 w-4" />
                             </AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <div className={cn(
                        "p-3 rounded-2xl text-sm shadow-sm",
                        msg.role === 'user' 
                          ? "bg-indigo-600 text-white rounded-tr-none" 
                          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700"
                      )}>
                        <MathText text={msg.content} />
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 mr-auto max-w-[85%]">
                       <Avatar className="h-8 w-8 shrink-0 border-2 border-white/50 shadow-sm">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                       </Avatar>
                       <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm">
                          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                       </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>

            <CardFooter className="p-3 border-t bg-white dark:bg-slate-900 shrink-0">
               <div className="flex w-full gap-2 relative">
                  <Input 
                    placeholder="Posez une question à votre coach..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    disabled={isLoading}
                  />
                  <Button 
                    size="icon" 
                    onClick={handleSend} 
                    disabled={isLoading || !input.trim()}
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg bg-indigo-600 hover:bg-indigo-700 h-8 w-8"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
               </div>
            </CardFooter>
          </>
        )}
      </Card>
      
      {isMinimized && (
         <div className="mt-2 bg-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 animate-bounce">
            <Sparkles className="h-3 w-3" />
            Clique pour parler au Coach !
         </div>
      )}
    </div>
  );
}