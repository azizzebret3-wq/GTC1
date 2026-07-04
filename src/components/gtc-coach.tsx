'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Loader2, 
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

  // Charger l'historique au montage
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
        { role: 'model', content: `Bonjour ${userData?.fullName?.split(' ')[0] || 'Champion'}. Je suis votre Coach GTC spécialisé. Quelle stratégie souhaitez-vous aborder aujourd'hui ? 🚀` }
      ]);
    }
  }, [userData]);

  // Sauvegarder l'historique à chaque changement
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('gtc_coach_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll constant lors de la génération
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
      // @ts-ignore - Puter chargé via script layout.tsx
      const puter = window.puter;
      
      if (!puter) {
        throw new Error("Initialisation en cours...");
      }

      // Construire le contexte avec l'historique (limité aux 10 derniers messages pour la performance)
      const historyContext = messages.slice(-10).map(m => `${m.role === 'user' ? 'Étudiant' : 'Coach'}: ${m.content}`).join('\n');

      const systemPrompt = `Tu es "Coach GTC", le mentor d'élite pour la réussite aux concours d'État au Burkina Faso. 
      Utilisateur: ${userData?.fullName || 'Étudiant'}. 
      Objectif: ${userData?.competitionType || 'Concours Direct/Pro'}.
      Style: Professionnel, hautement stratégique, motivant mais rigoureux. 
      CONSIGNE: Utilise impérativement les délimiteurs $ pour TOUTE expression mathématique ou symbole technique. 
      Réponds directement et de manière structurée. Souviens-toi de la conversation précédente ci-dessous.`;

      const fullPrompt = `${systemPrompt}\n\nHistorique récent:\n${historyContext}\n\nQuestion actuelle de l'étudiant: ${userMessage}`;

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
      setMessages(prev => [...prev, { role: 'model', content: `Désolé, une interruption de service est survenue. Veuillez réessayer.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    const initialMsg: Message = { role: 'model', content: `Historique effacé. Comment puis-je vous aider à nouveau, ${userData?.fullName?.split(' ')[0] || 'Champion'} ?` };
    setMessages([initialMsg]);
    localStorage.removeItem('gtc_coach_history');
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 shadow-[0_10px_40px_rgba(79,70,229,0.4)] hover:scale-110 transition-all duration-300 group p-0 border-2 border-white/20"
      >
        <MessageSquare className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500 border-2 border-white"></span>
        </span>
      </Button>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-0 right-0 lg:bottom-6 lg:right-6 z-[100] transition-all duration-500 ease-out flex flex-col items-end",
      isMinimized ? "w-full sm:w-72" : "w-full sm:w-[400px]"
    )}>
      <Card className={cn(
        "glassmorphism shadow-2xl border-white/20 overflow-hidden flex flex-col w-full transition-all duration-300",
        isMinimized ? "h-16 rounded-t-2xl lg:rounded-2xl" : "h-[100dvh] sm:h-[600px] sm:max-h-[80vh] rounded-t-3xl lg:rounded-3xl"
      )}>
        {/* Header Elite */}
        <CardHeader className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-900 text-white flex flex-row items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
             </div>
             <div>
                <CardTitle className="text-sm font-black tracking-tight flex items-center gap-2">
                    Coach Stratégique GTC
                </CardTitle>
                <div className="flex items-center gap-1.5">
                   <span className="w-2 h-2 rounded-full bg-green-400"></span>
                   <span className="text-[9px] text-white/60 font-bold uppercase tracking-widest">IA Experte Active</span>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-1">
             <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white" onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <ChevronDown className="h-5 w-5" />}
             </Button>
             <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white" onClick={() => setIsOpen(false)}>
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
                      "flex gap-3 max-w-[88%]",
                      msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}>
                      <Avatar className={cn(
                          "h-8 w-8 sm:h-9 sm:w-9 shrink-0 border-2 shadow-sm",
                          msg.role === 'model' ? "border-indigo-500/30" : "border-white/50"
                      )}>
                        {msg.role === 'model' ? (
                          <AvatarFallback className="bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
                            <Bot className="h-5 w-5" />
                          </AvatarFallback>
                        ) : (
                          <>
                             <AvatarImage src={userData?.photoURL ?? undefined} />
                             <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-600 text-white font-bold text-xs">
                                {userData?.fullName?.[0] || 'U'}
                             </AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <div className={cn(
                        "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                        msg.role === 'user' 
                          ? "bg-indigo-600 text-white rounded-tr-none" 
                          : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 rounded-tl-none border border-zinc-200 dark:border-zinc-800"
                      )}>
                        <MathText text={msg.content} />
                      </div>
                    </div>
                  ))}
                  
                  {/* Message en cours de streaming */}
                  {streamingMessage && (
                    <div className="flex gap-3 mr-auto max-w-[88%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                       <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 border-2 border-indigo-500/30 shadow-sm">
                          <AvatarFallback className="bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
                            <Bot className="h-5 w-5" />
                          </AvatarFallback>
                       </Avatar>
                       <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl rounded-tl-none border border-zinc-200 dark:border-zinc-800 shadow-sm">
                          <MathText text={streamingMessage} />
                          <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-500 animate-pulse align-middle"></span>
                       </div>
                    </div>
                  )}

                  {isLoading && !streamingMessage && (
                    <div className="flex gap-3 mr-auto">
                       <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 border-2 border-indigo-500/30">
                          <AvatarFallback className="bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
                            <Bot className="h-5 w-5" />
                          </AvatarFallback>
                       </Avatar>
                       <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl rounded-tl-none border border-zinc-200 dark:border-zinc-800 flex gap-1.5 items-center">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                       </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="px-4 py-2 bg-indigo-50/50 dark:bg-indigo-900/10 border-t border-indigo-100/50 dark:border-indigo-900/30 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-indigo-500" />
                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
                    Conseils stratégiques personnalisés actifs.
                </p>
              </div>
            </CardContent>

            <CardFooter className="p-4 sm:p-5 border-t bg-white dark:bg-zinc-950 shrink-0">
               <div className="flex w-full gap-2 relative">
                  <Input 
                    placeholder="Posez votre question stratégique..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 pr-12 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    disabled={isLoading}
                  />
                  <Button 
                    size="icon" 
                    onClick={handleSend} 
                    disabled={isLoading || !input.trim()}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl bg-indigo-600 hover:bg-indigo-700 h-11 w-11 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
               </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
