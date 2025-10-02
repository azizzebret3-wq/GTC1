
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
import { Eye, EyeOff, ArrowRight, Loader } from "lucide-react"
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

      // Set user's display name
      await updateProfile(user, { displayName: fullName });

      // Check if this is the first user
      const usersCollectionRef = collection(db, "users");
      const q = query(usersCollectionRef, limit(2));
      const querySnapshot = await getDocs(q);
      
      const isFirstUser = querySnapshot.docs.length <= 1;
      const userRole = isFirstUser ? 'admin' : 'user';

      if(isFirstUser) {
        toast({
            title: "Super-utilisateur activé !",
            description: "Le premier compte a été créé avec les droits d'administrateur.",
        });
      }

      // Add user to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName,
        email: user.email, // Store the dummy email
        phone: sanitizedPhone,
        competitionType,
        createdAt: new Date(),
        role: userRole,
        subscription_type: 'gratuit', // Default subscription
      });
      
       // Send notification to admin if it's a new user
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
          } catch (notificationError) {
              // Non-blocking error. Log it for debugging but don't show to user.
              console.warn("Could not send admin notification:", notificationError);
          }
      }
      
      toast({
        title: "Compte créé avec succès",
        description: "Vous allez être redirigé vers votre tableau de bord.",
      });
      
      // Force a full page reload to the dashboard to ensure auth state is updated everywhere.
      window.location.href = '/dashboard';

    } catch (error: any) {
      console.error(error);
      let errorMessage = "Une erreur est survenue lors de la création du compte.";
      
      if (error.code === 'auth/email-already-in-use') {
        toast({
            variant: "destructive",
            title: "Ce numéro de téléphone est déjà utilisé",
            description: "Il semble que vous ayez déjà un compte. Essayez de vous connecter.",
            action: <Button variant="secondary" onClick={() => router.push('/login')}>Se connecter</Button>,
        });
        setLoading(false);
        return;

      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Le mot de passe doit contenir au moins 6 caractères."
      } else if (error.code === 'auth/invalid-email') {
         errorMessage = "Le format du numéro de téléphone est invalide. Assurez-vous qu'il ne contient pas d'espaces ou de caractères spéciaux."
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50/50 via-white to-blue-50/50 p-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card className="rounded-2xl shadow-2xl border-0 bg-white/70 backdrop-blur-xl">
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-3xl font-black bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Créez votre compte
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium pt-2">
              Rejoignez des milliers de candidats et commencez à gagner.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6" onSubmit={handleSignup}>
              <div className="grid gap-2">
                <Label htmlFor="full-name" className="font-semibold text-gray-700">Nom & Prénom(s)</Label>
                <Input 
                  id="full-name" 
                  placeholder="John Doe" 
                  required 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-xl h-12"
                />
              </div>
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
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="competition-type" className="font-semibold text-gray-700">Type de concours</Label>
                <Select required onValueChange={setCompetitionType} value={competitionType}>
                  <SelectTrigger id="competition-type" className="rounded-xl h-12">
                    <SelectValue placeholder="Sélectionnez un type de concours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Concours Direct</SelectItem>
                    <SelectItem value="professionnel">Concours Professionnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="font-semibold text-gray-700">Mot de passe</Label>
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
              <div className="grid gap-2">
                <Label htmlFor="confirm-password" className="font-semibold text-gray-700">Confirmer mot de passe</Label>
                <div className="relative">
                  <Input 
                    id="confirm-password" 
                    type={showConfirmPassword ? "text" : "password"} 
                    required 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="rounded-xl h-12"
                  />
                   <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-800"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg group md:col-span-2" disabled={loading}>
                 {loading ? <><Loader className="w-4 h-4 mr-2 animate-spin"/> Création en cours...</> : "Créer mon compte"}
                 {!loading && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm font-medium text-gray-600">
              Vous avez déjà un compte?{" "}
              <Link href="/login" className="text-purple-600 hover:text-purple-800 font-bold hover:underline">
                Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
