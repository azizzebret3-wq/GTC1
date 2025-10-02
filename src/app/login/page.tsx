
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
import { Eye, EyeOff, ArrowRight, Loader } from "lucide-react"
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
        description: "Vous allez être redirigé vers votre tableau de bord.",
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
            description: "Veuillez suivre les instructions envoyées à l'email associé à votre compte. Si vous ne voyez rien, vérifiez vos spams.",
        });
        setIsResetDialogOpen(false);
        setResetPhone("");
    } catch (error: any) {
        console.error(error);
        let description = "Une erreur est survenue."
        if(error.code === 'auth/user-not-found'){
            description = "Aucun utilisateur trouvé avec ce numéro de téléphone."
        } else if (error.code === 'auth/invalid-email') {
          description = "Le format du numéro de téléphone est invalide.";
        }
        toast({
            variant: "destructive",
            title: "Erreur",
            description: description,
        });
    } finally {
        setIsResetting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50/50 via-white to-blue-50/50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card className="rounded-2xl shadow-2xl border-0 bg-white/70 backdrop-blur-xl">
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-3xl font-black bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Heureux de vous revoir
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium pt-2">
              Connectez-vous pour reprendre votre préparation.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form className="grid gap-6" onSubmit={handleLogin}>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="font-semibold text-gray-700">Numéro de téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="70112233"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-xl h-12"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password"  className="font-semibold text-gray-700">Mot de passe</Label>
                   <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                      <DialogTrigger asChild>
                         <span
                            className="ml-auto inline-block text-sm text-purple-600 hover:text-purple-800 hover:underline cursor-pointer"
                          >
                            Mot de passe oublié?
                          </span>
                      </DialogTrigger>
                      <DialogContent>
                        <form onSubmit={handlePasswordReset}>
                            <DialogHeader>
                              <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
                              <DialogDescription>
                                Entrez votre numéro de téléphone. Nous enverrons un lien de réinitialisation à l'email associé.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Label htmlFor="reset-phone">Numéro de téléphone</Label>
                                <Input 
                                    id="reset-phone" 
                                    type="tel" 
                                    placeholder="70112233" 
                                    value={resetPhone}
                                    onChange={(e) => setResetPhone(e.target.value)}
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsResetDialogOpen(false)} disabled={isResetting}>Annuler</Button>
                                <Button type="submit" disabled={isResetting}>
                                    {isResetting ? <><Loader className="w-4 h-4 mr-2 animate-spin" /> Envoi...</> : "Envoyer"}
                                </Button>
                            </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl h-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-800"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg group" disabled={loading}>
                {loading ? <><Loader className="w-4 h-4 mr-2 animate-spin" /> Connexion...</> : <>Se connecter <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /></>}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm font-medium text-gray-600">
              Vous n'avez pas de compte?{" "}
              <Link href="/signup" className="text-purple-600 hover:text-purple-800 font-bold hover:underline">
                S'inscrire
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
