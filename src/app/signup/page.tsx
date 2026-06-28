"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc, getDocs, collection, query, limit } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Logo } from "@/components/logo"
import { Eye, EyeOff, ArrowRight, Loader, User, Phone, Lock, Sparkles, Rocket, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createNotification, getAdminUserId } from "@/lib/firestore.service"

export const dynamic = 'force-dynamic';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [competitionType, setCompetitionType] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
      });
      setLoading(false);
      return;
    }

    if (!competitionType) {
      toast({
        variant: "destructive",
        title: "Champ manquant",
        description: "Veuillez sélectionner un type de concours.",
      });
      setLoading(false);
      return;
    }
    try {
      const sanitizedPhone = phone.replace(/\s+/g, '');
      const email = `${sanitizedPhone}@gagnetonconcours.app`;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullName });

      const usersCollectionRef = collection(db, "users");
      const q = query(usersCollectionRef, limit(2));
      const querySnapshot = await getDocs(q);
      
      const isFirstUser = querySnapshot.docs.length <= 1;
      const userRole = isFirstUser ? 'admin' : 'user';

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName,
        email: user.email,
        phone: sanitizedPhone,
        competitionType,
        createdAt: new Date(),
        role: userRole,
        subscription_type: 'gratuit',
      });
      
      if (userRole === 'user') {
          try {
            const adminId = await getAdminUserId();
            if (adminId) {
                await createNotification({
                    userId: adminId,
                    title: "Nouvel utilisateur inscrit",
                    description: `${fullName} vient de s'inscrire sur la plateforme.`,
                    href: `/dashboard/admin/users`,
                });
            }
          } catch (e) {}
      }
      
      toast({
        title: "Bienvenue sur GTC !",
        description: "Votre compte a été créé avec succès.",
      });
      
      window.location.href = '/dashboard';

    } catch (error: any) {
      console.error(error);
      let errorMessage = "Une erreur est survenue lors de la création du compte.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Ce numéro de téléphone est déjà utilisé.";
      }
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };


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
      `}</style>

      {/* Left Panel: Desktop Branding */}
      <div className="hidden lg:flex lg:w-2/5 auth-gradient relative items-center justify-center p-12 text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 mesh-bg"></div>
        
        <div className="relative z-10 max-w-md space-y-12">
           <div className="flex justify-start">
             <Logo />
           </div>
           
           <div className="space-y-6">
             <h1 className="text-5xl font-black leading-tight">
               Faites le premier pas vers <br />
               <span className="text-yellow-300">votre réussite.</span>
             </h1>
             <p className="text-xl text-white/80 font-medium">
               Rejoignez plus de 10 000 candidats qui se préparent chaque jour avec Gagne Ton Concours.
             </p>
           </div>

           <div className="space-y-4">
              {[
                "Quiz illimités par matière",
                "Simulations en conditions réelles",
                "Corrections détaillées par des experts",
                "Suivi de progression intelligent"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-yellow-300" />
                  </div>
                  <span className="font-bold text-white/90">{text}</span>
                </div>
              ))}
           </div>
           
           <div className="pt-8">
              <div className="inline-block p-6 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md">
                 <p className="text-sm font-medium mb-1">Déjà inscrit ?</p>
                 <Link href="/login" className="text-xl font-black text-yellow-300 hover:underline flex items-center gap-2">
                   Connectez-vous ici <ArrowRight className="w-5 h-5" />
                 </Link>
              </div>
           </div>
        </div>
      </div>

      {/* Right Panel: Signup Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 mesh-bg relative overflow-y-auto">
        <div className="w-full max-w-xl py-12">
          <div className="flex justify-center lg:hidden mb-8">
            <Logo />
          </div>

          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-black/40 backdrop-blur-2xl rounded-3xl overflow-hidden">
            <div className="h-2 auth-gradient w-full"></div>
            <CardHeader className="space-y-2 pt-8 pb-4 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                 <Rocket className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-3xl font-black gradient-text">
                Prêt à devenir un gagnant ?
              </CardTitle>
              <CardDescription className="font-medium">
                Créez votre compte en moins d'une minute.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-8 pb-8 pt-4">
              <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full-name" className="text-xs font-bold uppercase text-muted-foreground ml-1">Nom & Prénom(s)</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="full-name" 
                      placeholder="John Doe" 
                      required 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-11 h-12 rounded-xl bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase text-muted-foreground ml-1">Téléphone</Label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="70112233" 
                      required 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-11 h-12 rounded-xl bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="competition-type" className="text-xs font-bold uppercase text-muted-foreground ml-1">Type de concours</Label>
                  <Select required onValueChange={setCompetitionType} value={competitionType}>
                    <SelectTrigger id="competition-type" className="h-12 rounded-xl bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:ring-primary/20">
                      <SelectValue placeholder="Sélectionnez un type de concours" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="direct">Concours Direct</SelectItem>
                      <SelectItem value="professionnel">Concours Professionnel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-bold uppercase text-muted-foreground ml-1">Mot de passe</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 pr-11 h-12 rounded-xl bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:ring-primary/20 transition-all"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-xs font-bold uppercase text-muted-foreground ml-1">Confirmation</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="confirm-password" 
                      type={showConfirmPassword ? "text" : "password"} 
                      required 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-11 pr-11 h-12 rounded-xl bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:ring-primary/20 transition-all"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-black text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] auth-gradient group md:col-span-2" disabled={loading}>
                   {loading ? <Loader className="w-5 h-5 mr-2 animate-spin"/> : "Commencer l'aventure"}
                   {!loading && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </form>

              <div className="mt-8 text-center pt-4 border-t border-gray-100 dark:border-white/5">
                <p className="text-sm font-medium text-muted-foreground">
                  Déjà membre ?{" "}
                  <Link href="/login" className="text-primary font-black hover:underline ml-1">
                    Se connecter ici
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center mt-8">
             <p className="text-xs text-muted-foreground">En vous inscrivant, vous acceptez nos conditions générales d'utilisation.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
