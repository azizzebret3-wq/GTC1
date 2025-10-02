// src/app/page.tsx
'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from '@/hooks/useAuth.tsx';
import { 
  Trophy, 
  ArrowRight,
  Sparkles,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12.52.02c1.31-.02 2.61.1 3.82.38a9.42 9.42 0 0 1 5.02 5.02 9.42 9.42 0 0 1-.38 12.38 9.42 9.42 0 0 1-5.02 5.02 9.42 9.42 0 0 1-12.38-.38 9.42 9.42 0 0 1-5.02-5.02 9.42 9.42 0 0 1 .38-12.38A9.42 9.42 0 0 1 12.52.02Z" />
        <path d="M15.54 8.52a3 3 0 0 0-2.03-2.03c.12-.02.24-.03.37-.03 1.09 0 2.18.39 3.03 1.1.2.16.4.32.57.51" />
        <path d="M15.54 8.52a3.01 3.01 0 0 0-3.3-2.43 3 3 0 0 0-2.83 2.83v5.66a3 3 0 0 1-3 3" />
    </svg>
);

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21.1 12.8a8.9 8.9 0 0 0-14.2 8.3L3 22l1.9-4.2a8.9 8.9 0 0 0 16.2-3.3Z" />
        <path d="M5.4 12.8a8.9 8.9 0 0 1 12-4.3" />
        <path d="m11.4 14.8-2-2.2" />
        <path d="M14.8 11.4 17 9.2" />
    </svg>
);

function HomePageContent() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <style>
        {`
          .hero-animation {
            animation: float 4s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }
          
          .pulse-ring {
            animation: pulse-ring 2s infinite;
          }
          
          @keyframes pulse-ring {
            0% { transform: scale(0.33); }
            40%, 50% { opacity: 0; }
            100% { opacity: 0; transform: scale(1.2); }
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .glassmorphism {
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.18);
          }
          
          .text-shadow {
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          }
          
          .background-dots {
            background-image: radial-gradient(circle, rgba(139, 92, 246, 0.15) 1px, transparent 1px);
            background-size: 20px 20px;
          }
        `}
      </style>

      {/* Hero Section Simplifié */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 text-white py-24 px-4 overflow-hidden flex-grow flex items-center">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 background-dots opacity-30"></div>
        
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-pink-400/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl hero-animation">
                <Trophy className="w-9 h-9 text-white drop-shadow-lg" />
              </div>
              <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl opacity-50 pulse-ring"></div>
            </div>
            <Badge className="glassmorphism text-white border-white/30 px-6 py-2 text-sm font-semibold shadow-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Plateforme éducative #1 au Burkina Faso
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-8 text-shadow leading-tight">
            <span className="gradient-text bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
              Gagne ton concours
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
            🚀 La plateforme la plus moderne et interactive pour réussir tes concours directs et professionnels.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-white to-gray-100 text-indigo-600 hover:from-gray-100 hover:to-white font-bold px-10 py-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 text-lg group"
              asChild
            >
              <Link href="/signup">
                <Rocket className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                Commencer gratuitement
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
             <Button 
              size="lg" 
              variant="outline" 
              className="glassmorphism border-white/40 text-white hover:bg-white/20 font-bold px-10 py-6 rounded-2xl text-lg backdrop-blur-md"
              asChild
            >
              <Link href="/login">
                J'ai déjà un compte
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center mb-12">
             <div className="inline-block mb-6">
                <Logo />
             </div>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto text-center">
              La plateforme éducative de nouvelle génération qui révolutionne la préparation aux concours au Burkina Faso.
            </p>
            <div className="flex space-x-6">
                <Link href="https://www.tiktok.com/@prepare.concours?_t=ZM-8zfqR0jZffk&_r=1" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><TikTokIcon className="w-6 h-6"/></Link>
                <Link href="https://chat.whatsapp.com/BS3jCz7dzQ47cljOBRfFRl?mode=ems_copy_t" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><WhatsAppIcon className="w-6 h-6"/></Link>
            </div>
          </div>
          
          <div className="text-center pt-8 border-t border-gray-800">
            <p className="text-gray-400">
              © 2025 Gagne ton concours. Développé par Abdoul Aziz. ✨
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}


export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // This effect runs only on the client, after hydration.
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // While loading, or if the user is logged in, show a loader.
  // This avoids showing the homepage content and then redirecting.
  if (loading || user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-700 to-blue-800 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-pink-400 rounded-full animate-spin" style={{animationDuration: '1.5s', animationDirection: 'reverse'}}></div>
          <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin" style={{animationDuration: '2s'}}></div>
        </div>
      </div>
    );
  }

  // Only render the full homepage content if the user is not logged in and loading is finished.
  return <HomePageContent />;
}
