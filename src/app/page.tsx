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
  Rocket,
  CheckCircle,
  BrainCircuit,
  CalendarCheck,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

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

const features = [
  {
    icon: BrainCircuit,
    title: "Quiz Interactifs et IA",
    description: "Entraînez-vous avec des milliers de questions et recevez des explications détaillées générées par l'IA.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: CalendarCheck,
    title: "Concours Blancs",
    description: "Participez à des simulations de concours en conditions réelles pour évaluer votre niveau et gérer votre stress.",
    gradient: "from-indigo-500 to-blue-500"
  },
  {
    icon: BookOpen,
    title: "Ressources Pédagogiques",
    description: "Accédez à une riche bibliothèque de cours, fiches de révision et sujets d'annales pour approfondir vos connaissances.",
    gradient: "from-orange-500 to-red-500"
  }
];

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
            background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .text-shadow {
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          }
          
          .background-dots {
            background-image: radial-gradient(circle, hsla(var(--primary) / 0.1) 1px, transparent 1px);
            background-size: 20px 20px;
          }

          .glassmorphism {
            background: hsl(var(--card) / 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid hsl(var(--border) / 0.2);
          }
        `}
      </style>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glassmorphism">
         <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <Logo />
              <div className="flex items-center gap-2">
                 <Button variant="ghost" asChild>
                    <Link href="/login">Se connecter</Link>
                 </Button>
                 <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg" asChild>
                    <Link href="/signup">S'inscrire</Link>
                 </Button>
              </div>
            </div>
         </div>
      </header>

      <main className="flex-grow">
          {/* Hero Section */}
          <section className="relative pt-32 pb-24 px-4 overflow-hidden text-center bg-background">
            <div className="absolute inset-0 background-dots opacity-30"></div>
            <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
            
            <div className="relative max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl hero-animation">
                    <Trophy className="w-9 h-9 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl opacity-50 pulse-ring"></div>
                </div>
                <Badge className="border-border/50 px-6 py-2 text-sm font-semibold shadow-lg">
                  <Sparkles className="w-4 h-4 mr-2 text-primary" />
                  Plateforme éducative #1 au Burkina Faso
                </Badge>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black mb-8 text-shadow leading-tight">
                <span className="gradient-text">
                  Gagne ton concours
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
                La plateforme la plus moderne et interactive pour réussir tes concours directs et professionnels.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold px-10 py-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 text-lg group"
                  asChild
                >
                  <Link href="/signup">
                    <Rocket className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                    Commencer gratuitement
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 px-4 bg-background">
            <div className="container mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-4xl font-black gradient-text">Pourquoi nous choisir ?</h2>
                <p className="text-lg text-muted-foreground mt-4">Nous avons conçu la meilleure expérience d'apprentissage pour vous aider à atteindre vos objectifs.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <Card key={index} className="glassmorphism shadow-xl text-center hover:-translate-y-2 transition-transform duration-300">
                    <CardHeader>
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-r ${feature.gradient} mx-auto mb-4`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="py-20 px-4">
              <div className="container mx-auto">
                  <div className="text-center max-w-3xl mx-auto mb-12">
                      <h2 className="text-4xl font-black gradient-text">Un tarif simple et accessible</h2>
                      <p className="text-lg text-muted-foreground mt-4">Choisissez le plan qui vous convient et débloquez votre plein potentiel.</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                      <Card className="glassmorphism shadow-xl border-border/30">
                          <CardHeader>
                              <CardTitle className="text-2xl">Découverte</CardTitle>
                              <CardDescription>Parfait pour commencer</CardDescription>
                              <p className="text-4xl font-black pt-4">Gratuit</p>
                          </CardHeader>
                          <CardContent className="space-y-3">
                              <p className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2"/>Accès aux quiz gratuits</p>
                              <p className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2"/>Accès aux documents gratuits</p>
                              <p className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2"/>Participation aux concours blancs</p>
                          </CardContent>
                          <CardFooter>
                              <Button variant="outline" className="w-full" asChild>
                                  <Link href="/signup">Commencer</Link>
                              </Button>
                          </CardFooter>
                      </Card>
                      <Card className="glassmorphism shadow-2xl border-2 border-primary">
                           <CardHeader>
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Premium</CardTitle>
                                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">Recommandé</Badge>
                              </div>
                              <CardDescription>L'expérience complète pour les gagnants</CardDescription>
                              <p className="text-4xl font-black pt-4">1000 FCFA<span className="text-lg text-muted-foreground">/mois</span></p>
                          </CardHeader>
                          <CardContent className="space-y-3">
                              <p className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2"/>Génération de quiz illimitée avec l'IA</p>
                              <p className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2"/>Accès à TOUS les quiz et documents</p>
                              <p className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2"/>Corrections détaillées par l'IA</p>
                              <p className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2"/>Analyse de performance</p>
                              <p className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2"/>Support prioritaire</p>
                          </CardContent>
                           <CardFooter>
                              <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg" asChild>
                                  <Link href="/dashboard/premium">Passer Premium</Link>
                              </Button>
                          </CardFooter>
                      </Card>
                  </div>
              </div>
          </section>

          {/* Final CTA */}
          <section className="py-20 px-4 text-center">
             <div className="container mx-auto">
                  <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-12 text-white shadow-2xl">
                      <h2 className="text-4xl font-black">Prêt à transformer ta réussite ?</h2>
                      <p className="text-xl mt-4 mb-8 max-w-2xl mx-auto text-indigo-200">Rejoins dès maintenant la communauté des futurs lauréats.</p>
                      <Button 
                          size="lg" 
                          className="bg-white text-indigo-600 hover:bg-gray-100 font-bold px-10 py-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 text-lg group"
                          asChild
                      >
                          <Link href="/signup">
                              <Rocket className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                              Je m'inscris maintenant
                              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                          </Link>
                      </Button>
                  </div>
             </div>
          </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
             <div className="mb-6 md:mb-0">
                <Logo />
             </div>
            <p className="text-gray-400 text-sm max-w-md text-center md:text-left">
              La plateforme éducative de nouvelle génération qui révolutionne la préparation aux concours au Burkina Faso.
            </p>
            <div className="flex space-x-6 mt-6 md:mt-0">
                <Link href="https://www.tiktok.com/@prepare.concours?_t=ZM-8zfqR0jZffk&_r=1" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><TikTokIcon className="w-6 h-6"/></Link>
                <Link href="https://chat.whatsapp.com/BS3jCz7dzQ47cljOBRfFRl?mode=ems_copy_t" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><WhatsAppIcon className="w-6 h-6"/></Link>
            </div>
          </div>
          
          <div className="text-center pt-8 border-t border-gray-800">
            <p className="text-gray-500 text-sm">
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
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

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

  return <HomePageContent />;
}
