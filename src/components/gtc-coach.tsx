'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot,
  AlertCircle,
  ChevronDown,
  MessageSquare,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth.tsx';
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem('gtc_coach_history');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Erreur chargement historique coach", e);
      }
    } else {
      setMessages([
        { role: 'model', content: `Salut **${userData?.fullName?.split(' ')[0] || 'Champion'}** ! Je suis votre Coach Intégrale. Comment puis-je vous aider à réussir aujourd'hui ? 🚀` }
      ]);
    }
  }, [userData]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('gtc_coach_history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, streamingMessage, isMinimized, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage } as Message];
    setMessages(newMessages);
    setIsLoading(true);
    setStreamingMessage('');

    try {
      // @ts-ignore
      const puter = window.puter;
      
      if (!puter) {
        throw new Error("Initialisation de Puter en cours...");
      }

      const historyContext = messages.slice(-6).map(m => `${m.role === 'user' ? 'Étudiant' : 'Coach'}: ${m.content}`).join('\n');

      const systemPrompt = `Tu es "Coach Intégrale", le mentor expert d'Intégrale Formation au Burkina Faso. 
      Utilisateur: ${userData?.fullName || 'Étudiant'}. Concours: ${userData?.competitionType || 'Direct'}.
      
      DIRECTIVES :
      1. **BRIÈVETÉ** : Tes réponses doivent être courtes, percutantes et aller à l'essentiel. Maximum 3-4 paragraphes.
      2. **FORMATAGE** : Utilise le **gras** (**) pour les points clés et les délimiteurs $ pour TOUTE formule mathématique.
      3. **TON** : Professionnel, motivant, expert. Pas de bavardage inutile.
      4. **CONTEXTE** : Réponds en fonction de l'historique fourni.`;

      const fullPrompt = `${systemPrompt}\n\nHistorique:\n${historyContext}\n\nQuestion: ${userMessage}`;

      const response = await puter.ai.chat(
        fullPrompt,
        { 
            model: "google/gemini-3.5-flash",
            stream: true 
        }
      );

      let fullContent = '';
      for await (const part of response) {
        if (part?.text) {
          fullContent += part.text;
          setStreamingMessage(fullContent);
        }
      }

      setMessages(prev => [...prev, { role: 'model', content: fullContent }]);
      setStreamingMessage('');
    } catch (error: any) {
      console.error("Coach AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', content: `Désolé, une erreur technique est survenue. Vérifie ta connexion.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    const initialMsg: Message = { role: 'model', content: `Historique effacé. Prêt pour une nouvelle stratégie, **${userData?.fullName?.split(' ')[0] || 'Champion'}** ?` };
    setMessages([initialMsg]);
    localStorage.removeItem('gtc_coach_history');
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-32 lg:bottom-6 right-6 z-[60] w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 shadow-[0_10px_40px_rgba(79,70,229,0.4)] hover:scale-110 transition-all duration-300 group p-0 border-2 border-white/20"
      >
        <MessageSquare className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
      </Button>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-20 right-0 lg:bottom-6 lg:right-6 z-[100] transition-all duration-500 ease-out flex flex-col items-end",
      isMinimized ? "w-full sm:w-72" : "w-full sm:w-[400px]"
    )}>
      <Card className={cn(
        "glassmorphism shadow-2xl border-white/20 overflow-hidden flex flex-col w-full transition-all duration-300",
        isMinimized ? "h-16 rounded-t-2xl lg:rounded-2xl" : "h-[80dvh] sm:h-[600px] sm:max-h-[80vh] rounded-t-3xl lg:rounded-3xl"
      )}>
        <CardHeader className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-900 text-white flex flex-row items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
             </div>
             <div>
                <CardTitle className="text-sm font-black tracking-tight">Coach Intégrale</CardTitle>
                <div className="flex items-center gap-1.5">
                   <span className="w-2 h-2 rounded-full bg-green-400"></span>
                   <span className="text-[9px] text-white/60 font-bold uppercase">En ligne</span>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-1">
             <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:bg-white/10" onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <ChevronDown className="h-5 w-5" />}
             </Button>
             <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:bg-white/10" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
             </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="p-0 flex-1 overflow-hidden flex flex-col bg-slate-50/30 dark:bg-zinc-950/40">
              <div className="flex justify-end px-4 py-1">
                <Button variant="link" size="sm" className="text-[10px] h-auto p-0 text-muted-foreground hover:text-red-500" onClick={clearHistory}>
                  Effacer l'historique
                </Button>
              </div>
              <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollRef}>
                <div className="space-y-6 pb-4">
                  {messages.map((msg, i) => (
                    <div key={i} className={cn(
                      "flex gap-3 max-w-[90%]",
                      msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}>
                      <Avatar className={cn(
                          "h-8 w-8 shrink-0 border-2 shadow-sm",
                          msg.role === 'model' ? "border-indigo-500/30" : "border-white/50"
                      )}>
                        {msg.role === 'model' ? (
                          <AvatarFallback className="bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
                             <Bot className="h-5 w-5" />
                          </AvatarFallback>
                        ) : (
                          <>
                             <AvatarImage src={userData?.photoURL ?? undefined} />
                             <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-600 text-white font-bold text-[10px]">
                                {userData?.fullName?.[0]}
                             </AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <div className={cn(
                        "p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                        msg.role === 'user' 
                          ? "bg-indigo-600 text-white rounded-tr-none" 
                          : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 rounded-tl-none border border-zinc-200 dark:border-zinc-800"
                      )}>
                        <MathText text={msg.content} />
                      </div>
                    </div>
                  ))}
                  
                  {streamingMessage && (
                    <div className="flex gap-3 mr-auto max-w-[90%] animate-in fade-in">
                       <Avatar className="h-8 w-8 shrink-0 border-2 border-indigo-500/30">
                          <AvatarFallback className="bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
                            <Bot className="h-5 w-5" />
                          </AvatarFallback>
                       </Avatar>
                       <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl rounded-tl-none border border-zinc-200 dark:border-zinc-800 shadow-sm">
                          <MathText text={streamingMessage} />
                          <span className="inline-block w-1 h-4 ml-1 bg-indigo-500 animate-pulse"></span>
                       </div>
                    </div>
                  )}

                  {isLoading && !streamingMessage && (
                    <div className="flex gap-3 mr-auto">
                       <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl flex gap-1.5 items-center">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                       </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>

            <CardFooter className="p-4 border-t bg-white dark:bg-zinc-950 shrink-0">
               <div className="flex w-full gap-2 relative">
                  <Input 
                    placeholder="Pose ta question ici..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 pr-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200"
                    disabled={isLoading}
                  />
                  <Button 
                    size="icon" 
                    onClick={handleSend} 
                    disabled={isLoading || !input.trim()}
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg bg-indigo-600 h-10 w-10 shadow-lg"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
               </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
