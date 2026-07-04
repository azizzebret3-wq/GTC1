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
  Bot,
  BrainCircuit,
  AlertCircle
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
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: `Salut ${userData?.fullName?.split(' ')[0] || 'Champion'} ! Je suis ton Coach GTC (Gemini 3.5). Pose-moi ta question, je te réponds instantanément ! 🚀` }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages, streamingMessage, isMinimized]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setStreamingMessage('');

    try {
      // @ts-ignore - Puter est chargé globalement via script dans layout.tsx
      const puter = window.puter;
      
      if (!puter) {
        throw new Error("Puter.js n'est pas encore chargé.");
      }

      // Construction du prompt système ultra-rapide
      const systemPrompt = `Tu es "Coach GTC", mentor n°1 pour la réussite aux concours au Burkina Faso. 
      Étudiant: ${userData?.fullName || 'inconnu'}. 
      Concours: ${userData?.competitionType || 'Général'}.
      Sois direct, motivant et stratégique. 
      Utilise $ pour les maths.`;

      // Appel en mode STREAMING pour une réponse instantanée
      const response = await puter.ai.chat(
        `${systemPrompt}\n\nUtilisateur: ${userMessage}`,
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
      console.error("Erreur Puter AI:", error);
      setMessages(prev => [...prev, { role: 'model', content: `Désolé, une erreur est survenue : ${error.message || "Connexion perdue"}.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 lg:bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 shadow-2xl hover:scale-110 transition-transform duration-300 group p-0 overflow-hidden border-4 border-white/20"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <BrainCircuit className="w-7 h-7 text-white animate-pulse" />
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
      <Card className="glassmorphism shadow-xl border-primary/20 overflow-hidden flex flex-col w-full h-[550px] max-h-[75vh]">
        <CardHeader className="p-4 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-600 text-white flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                <Sparkles className="w-6 h-6 text-white" />
             </div>
             <div>
                <CardTitle className="text-base font-black tracking-tight">Coach GTC (Ultra-Rapide)</CardTitle>
                <div className="flex items-center gap-1.5">
                   <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                   <span className="text-[10px] text-white/80 font-bold uppercase tracking-widest">Streaming Actif</span>
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
                <div className="space-y-6 pb-4">
                  {messages.map((msg, i) => (
                    <div key={i} className={cn(
                      "flex gap-3 max-w-[90%]",
                      msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}>
                      <Avatar className="h-9 w-9 shrink-0 border-2 border-white/50 shadow-md">
                        {msg.role === 'model' ? (
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-500 text-white">
                            <Bot className="h-5 w-5" />
                          </AvatarFallback>
                        ) : (
                          <>
                             <AvatarImage src={userData?.photoURL ?? undefined} />
                             <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-600 text-white font-bold">
                                {userData?.fullName?.[0] || 'U'}
                             </AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <div className={cn(
                        "p-4 rounded-2xl text-sm leading-relaxed",
                        msg.role === 'user' 
                          ? "bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/20" 
                          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm"
                      )}>
                        <MathText text={msg.content} />
                      </div>
                    </div>
                  ))}
                  
                  {/* Message en cours de streaming */}
                  {streamingMessage && (
                    <div className="flex gap-3 mr-auto max-w-[90%]">
                       <Avatar className="h-9 w-9 shrink-0 border-2 border-white/50 shadow-md">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-500 text-white">
                            <Bot className="h-5 w-5" />
                          </AvatarFallback>
                       </Avatar>
                       <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm">
                          <MathText text={streamingMessage} />
                          <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse align-middle"></span>
                       </div>
                    </div>
                  )}

                  {isLoading && !streamingMessage && (
                    <div className="flex gap-3 mr-auto max-w-[90%]">
                       <Avatar className="h-9 w-9 shrink-0 border-2 border-white/50 shadow-md">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-500 text-white">
                            <Bot className="h-5 w-5" />
                          </AvatarFallback>
                       </Avatar>
                       <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm">
                          <div className="flex gap-1.5 items-center">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-950/20 border-t border-yellow-100 dark:border-yellow-900 flex items-center gap-2">
                <AlertCircle className="w-3 h-3 text-yellow-600" />
                <p className="text-[9px] font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-tighter">
                    Streaming activé pour des réponses en temps réel.
                </p>
              </div>
            </CardContent>

            <CardFooter className="p-4 border-t bg-white dark:bg-slate-900 shrink-0">
               <div className="flex w-full gap-2 relative">
                  <Input 
                    placeholder="Posez votre question..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 pr-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <Button 
                    size="icon" 
                    onClick={handleSend} 
                    disabled={isLoading || !input.trim()}
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 hover:bg-blue-700 h-10 w-10 shadow-lg"
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
