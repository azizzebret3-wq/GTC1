"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { Eye, EyeOff, ArrowRight, Loader, Phone, Lock, Sparkles, Trophy, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetPhone, setResetPhone] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const sanitizedPhone = phone.replace(/\s+/g, '');
      const email = `${sanitizedPhone}@gagnetonconcours.app`;
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Connexion réussie",
        description: "Heureux de vous revoir parmi nous !",
      });
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error(error);
      let description = "Numéro de téléphone ou mot de passe incorrect.";
      if (error.code === 'auth/invalid-email') {
        description = "Le format du numéro de téléphone est invalide.";
      }
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: description,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPhone) {
        toast({ title: "Numéro de téléphone requis", variant: "destructive" });
        return;
    }
    setIsResetting(true);
    try {
        const sanitizedPhone = resetPhone.replace(/\s+/g, '');
        const email = `${sanitizedPhone}@gagnetonconcours.app`;
        await sendPasswordResetEmail(auth, email);
        toast({
            title: "Email de réinitialisation envoyé",
            description: "Vérifiez vos emails pour réinitialiser votre mot de passe.",
        });
        setIsResetDialogOpen(false);
        setResetPhone("");
    } catch (error: any) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "Une erreur est survenue lors de la réinitialisation.",
        });
    } finally {
        setIsResetting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background overflow-hidden">
      <style>{`
        .auth-gradient {
          background: linear-gradient(135deg, hsl(262, 80%, 58%) 0%, hsl(330, 80%, 60%) 100%);
        }
        .mesh-bg {
          background-image: radial-gradient(at 0% 0%, hsla(262, 80%, 58%, 0.15) 0, transparent 50%), 
                            radial-gradient(at 100% 0%, hsla(330, 80%, 60%, 0.15) 0, transparent 50%);
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      {/* Left Panel: Desktop Branding */}
      <div className="hidden lg:flex lg:w-1/2 auth-gradient relative items-center justify-center p-12 text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 mesh-bg"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-black/10 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="relative z-10 max-w-lg space-y-8">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-xs font-bold uppercase tracking-wider">La réussite dans son intégralité</span>
           </div>
           
           <h1 className="text-6xl font-black leading-tight drop-shadow-xl">
             Investissez dans votre avenir avec <br />
             <span className="text-yellow-300">Intégrale Formation.</span>
           </h1>
           
           <p className="text-xl text-white/80 font-medium leading-relaxed">
             Rejoignez la communauté Intégrale et accédez aux meilleurs outils de préparation pour les concours du Burkina Faso.
           </p>

           <div className="grid grid-cols-2 gap-6 pt-8">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Trophy className="w-8 h-8 text-yellow-300 mb-3" />
                <h3 className="font-bold">+1000 Quiz</h3>
                <p className="text-xs text-white/60">Contenu mis à jour</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <BookOpen className="w-8 h-8 text-blue-300 mb-3" />
                <h3 className="font-bold">Concours Blancs</h3>
                <p className="text-xs text-white/60">Conditions réelles</p>
              </div>
           </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 mesh-bg relative">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center lg:hidden">
            <Logo />
          </div>

          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-black/40 backdrop-blur-2xl rounded-3xl overflow-hidden">
            <div className="h-2 auth-gradient w-full"></div>
            <CardHeader className="space-y-2 pt-8 pb-4 text-center">
              <CardTitle className="text-3xl font-black gradient-text">
                Heureux de vous revoir
              </CardTitle>
              <CardDescription className="font-medium">
                Connectez-vous à votre compte Intégrale.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-8 pb-8 pt-4">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase text-muted-foreground ml-1">Numéro de téléphone</Label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="70112233"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-11 h-12 rounded-xl bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:ring-primary/20 focus:border-primary transition-all text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="password"  className="text-xs font-bold uppercase text-muted-foreground">Mot de passe</Label>
                    <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                      <DialogTrigger asChild>
                         <span className="text-xs font-bold text-primary hover:underline cursor-pointer">Oublié ?</span>
                      </DialogTrigger>
                      <DialogContent className="rounded-3xl">
                        <form onSubmit={handlePasswordReset}>
                            <DialogHeader>
                              <DialogTitle>Mot de passe oublié ?</DialogTitle>
                              <DialogDescription>
                                Entrez votre téléphone pour recevoir les instructions.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-6">
                                <Label htmlFor="reset-phone">Téléphone</Label>
                                <Input 
                                    id="reset-phone" 
                                    type="tel" 
                                    placeholder="70112233" 
                                    value={resetPhone}
                                    onChange={(e) => setResetPhone(e.target.value)}
                                    required
                                    className="h-12 rounded-xl mt-2"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setIsResetDialogOpen(false)} disabled={isResetting}>Annuler</Button>
                                <Button type="submit" disabled={isResetting} className="auth-gradient text-white font-bold rounded-xl">
                                    {isResetting ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : "Envoyer"}
                                </Button>
                            </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 pr-11 h-12 rounded-xl bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:ring-primary/20 focus:border-primary transition-all text-base"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-primary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-black text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] auth-gradient group" disabled={loading}>
                  {loading ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <>Se connecter <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /></>}
                </Button>
              </form>
              
              <div className="mt-10 text-center space-y-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Vous n'avez pas encore de compte ?
                </p>
                <Link href="/signup" className="inline-block w-full">
                  <Button variant="outline" className="w-full h-12 rounded-xl border-primary/20 text-primary font-bold hover:bg-primary/5">
                    Créer mon compte gratuitement
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center">
             <p className="text-xs text-muted-foreground">© 2025 Intégrale Formation. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
