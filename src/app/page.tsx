'use client';

import React from "react";
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
  BookOpen,
  User,
  Briefcase,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const features = [
  {
    icon: BrainCircuit,
    title: "Quiz Interactifs",
    description: "Entraînez-vous avec des milliers de questions et recevez des explications d'experts.",
    gradient: "from-[#1D3557] to-[#457B9D]"
  },
  {
    icon: CalendarCheck,
    title: "Concours Blancs",
    description: "Participez à des simulations en conditions réelles pour évaluer votre niveau.",
    gradient: "from-[#D4AF37] to-[#B8860B]"
  },
  {
    icon: BookOpen,
    title: "Ressources Premium",
    description: "Accédez à une bibliothèque exclusive de cours et fiches de révision.",
    gradient: "from-[#1D3557] to-[#D4AF37]"
  }
];

function HomePageContent() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
      <header className="fixed top-0 left-0 right-0 z-50 glassmorphism border-b">
         <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <Logo />
              <div className="flex items-center gap-2">
                 <Button variant="ghost" asChild className="font-bold text-[#1D3557]">
                    <Link href="/login">Connexion</Link>
                 </Button>
                 <Button className="bg-[#1D3557] hover:bg-[#1D3557]/90 text-white font-bold shadow-lg rounded-xl" asChild>
                    <Link href="/signup">S'inscrire</Link>
                 </Button>
              </div>
            </div>
         </div>
      </header>

      <main className="flex-grow pt-24">
          <section className="relative py-20 px-4 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.05),transparent_70%)]"></div>
            
            <div className="relative max-w-4xl mx-auto space-y-8">
              <Badge variant="outline" className="border-[#D4AF37] text-[#D4AF37] px-6 py-2 rounded-full font-black uppercase tracking-widest text-xs bg-[#D4AF37]/5">
                <Star className="w-3 h-3 mr-2 fill-current" />
                Excellence & Prestige
              </Badge>
              
              <h1 className="text-5xl md:text-8xl font-black text-[#1D3557] leading-[0.9] tracking-tighter">
                Investissez dans <br />
                <span className="gradient-text">votre réussite.</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                La plateforme d'élite pour la préparation aux concours de la fonction publique au Burkina Faso.
              </p>
              
              <div className="pt-4">
                <Button 
                  size="lg" 
                  className="bg-[#1D3557] hover:bg-[#1D3557]/90 text-white font-black px-10 py-8 rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 group text-lg"
                  asChild
                >
                  <Link href="/signup">
                    Rejoindre l'élite
                    <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="py-20 container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <Card key={i} className="glassmorphism border-0 shadow-xl glossy-card hover:-translate-y-2 transition-all duration-500 rounded-[2rem]">
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-lg mb-4`}>
                      <f.icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-black text-[#1D3557]">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground font-medium">{f.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
      </main>

      <footer className="bg-[#1D3557] text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="flex justify-center grayscale brightness-200">
             <Logo />
          </div>
          <p className="text-blue-200/60 text-sm max-w-md mx-auto italic">
            "La réussite dans son intégralité."
          </p>
          <div className="pt-8 border-t border-white/10 text-xs text-white/40">
             © 2025 Intégrale Formation. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="min-h-screen bg-[#1D3557] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <HomePageContent />;
}