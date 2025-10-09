// src/app/dashboard/premium/page.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Crown, Sparkles, CheckCircle, BookOpen, Video, ArrowRight, Copy, Star, Wallet, MessageCircle, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.tsx';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const premiumFeatures = [
    { icon: BookOpen, text: "Accès illimité à toute la bibliothèque" },
    { icon: Video, text: 'Accès illimité à toutes les formations vidéo' },
    { icon: CheckCircle, text: 'Suivi de performance avancé' },
    { icon: CheckCircle, text: 'Support prioritaire' },
];

const mobileMoneyOptions = [
    { name: "Orange Money", instruction: (amount: number) => `*144*10*54808048*MONTANT#`},
    { name: "Moov Money", instruction: (amount: number) => `*555*2*1*53017160*${amount}#`},
    { name: "Wave", instruction: (amount: number) => `22654808048`},
];

const adminContacts = [
    { name: "Support Admin", number: "22654808048" },
];

const whatsAppMessage = "Bonjour, je viens d'effectuer le paiement pour l'abonnement Premium. Voici ma preuve de paiement.";
const encodedMessage = encodeURIComponent(whatsAppMessage);


export default function PremiumPage() {
  const { userData } = useAuth();
  const { toast } = useToast();

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text).then(() => {
        toast({ title: 'Copié !', description: `La syntaxe de paiement pour ${name} a été copiée.` });
    });
  };
  
  const isPremium = userData?.subscription_type === 'premium';
  const expiryDate = userData?.subscription_expires_at ? format(new Date(userData.subscription_expires_at as any), 'dd MMMM yyyy', { locale: fr }) : null;


  return (
      <div className="p-4 sm:p-6 md:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black gradient-text">
                  GTC Premium
                </h1>
                <p className="text-sm sm:text-base text-gray-600 font-medium">
                  Débloquez votre plein potentiel et maximisez vos chances de succès.
                </p>
              </div>
            </div>
          </div>
        </div>
        
         {isPremium ? (
            <Card className="glassmorphism shadow-xl border-2 border-green-400/50">
                <CardHeader>
                    <CardTitle className="text-xl text-green-600">Félicitations, vous êtes membre Premium !</CardTitle>
                    {expiryDate && 
                        <CardDescription>Votre abonnement est actif jusqu'au <span className="font-bold">{expiryDate}</span>.</CardDescription>
                    }
                </CardHeader>
            </Card>
        ) : (
          <Card className="glassmorphism shadow-lg border-primary/20">
            <CardContent className="p-6">
              <div className="text-center">
                 <h2 className="text-xl font-bold">Bienvenue dans l'espace d'activation Premium !</h2>
                 <p className="text-muted-foreground mt-1">Suivez les étapes ci-dessous pour devenir membre.</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <Card className="glassmorphism shadow-xl border-2 border-purple-400/50">
              <CardHeader className="text-center p-6 bg-gradient-to-br from-purple-400/10 to-pink-400/10">
                  <Star className="w-10 h-10 mx-auto text-purple-500" />
                  <CardTitle className="text-2xl font-bold mt-2">Premium Mensuel</CardTitle>
                  <p className="text-4xl font-black gradient-text mt-2">
                      1000 <span className="text-xl text-gray-500 font-medium">FCFA/mois</span>
                  </p>
              </CardHeader>
              <CardContent className="p-6">
                  <h3 className="text-md font-semibold text-center mb-4">Accès complet pour 30 jours.</h3>
                  <ul className="space-y-2 text-sm">
                      {premiumFeatures.map((feature, index) => (
                          <li key={index} className="flex items-center gap-3">
                              <feature.icon className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="font-medium">{feature.text}</span>
                          </li>
                      ))}
                  </ul>
              </CardContent>
            </Card>
            <Card className="glassmorphism shadow-xl border-2 border-yellow-400/50">
               <CardHeader className="text-center p-6 bg-gradient-to-br from-yellow-400/10 to-orange-400/10">
                  <Crown className="w-10 h-10 mx-auto text-yellow-500" />
                  <CardTitle className="text-2xl font-bold mt-2">Premium Annuel</CardTitle>
                  <p className="text-4xl font-black gradient-text mt-2">
                      5000 <span className="text-xl text-gray-500 font-medium">FCFA/an</span>
                  </p>
              </CardHeader>
               <CardContent className="p-6">
                  <h3 className="text-md font-semibold text-center mb-4">Économisez sur l'année !</h3>
                  <ul className="space-y-2 text-sm">
                      {premiumFeatures.map((feature, index) => (
                          <li key={index} className="flex items-center gap-3">
                              <feature.icon className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="font-medium">{feature.text}</span>
                          </li>
                      ))}
                  </ul>
              </CardContent>
            </Card>
        </div>

        {/* Payment Instructions */}
        <Card className="glassmorphism shadow-xl">
          <CardHeader>
              <CardTitle className="text-2xl">Comment s'abonner ?</CardTitle>
              <CardDescription>Suivez ces étapes simples pour activer votre compte Premium.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 rounded-lg border bg-background/50">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Wallet className="w-5 h-5 text-primary"/>Étape 1 : Effectuez le paiement</h3>
                <p className="text-muted-foreground mb-4">Choisissez votre méthode de paiement préférée ci-dessous (pour l'abonnement mensuel de 1000F ou annuel de 5000F).</p>
                
                <div className="space-y-3 pt-4">
                    {mobileMoneyOptions.map(method => (
                        <div key={method.name} className="flex items-center justify-between p-3 rounded-lg bg-background/60 border">
                            <span className="font-semibold">{method.name}</span>
                            <div className="flex items-center gap-2">
                                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{method.instruction(1000).replace('1000', 'Montant')}</code>
                                <Button size="icon" variant="ghost" onClick={() => copyToClipboard(method.instruction(1000), method.name)}>
                                    <Copy className="w-4 h-4"/>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 rounded-lg border bg-background/50">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-green-500"/>Étape 2 : Envoyez la preuve</h3>
                <p className="text-muted-foreground mb-4">Après le paiement, faites une capture d'écran de la confirmation et envoyez-la à notre administrateur via WhatsApp.</p>
                <div className="flex justify-center">
                    {adminContacts.map(admin => (
                        <Button key={admin.number} asChild className="w-full sm:w-auto h-11 bg-green-500 hover:bg-green-600 text-white px-8">
                            <Link href={`https://wa.me/${admin.number}?text=${encodedMessage}`} target="_blank">
                                {admin.name} <ArrowRight className="w-4 h-4 ml-2"/>
                            </Link>
                        </Button>
                    ))}
                </div>
            </div>

            <div className="p-6 rounded-lg border bg-background/50">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Check className="w-5 h-5 text-blue-500"/>Étape 3 : Activation</h3>
                <p className="text-muted-foreground">Un administrateur vérifiera votre paiement et activera votre compte Premium dans les plus brefs délais. Vous recevrez une notification une fois que c'est fait.</p>
            </div>
            
          </CardContent>
       </Card>
      </div>
  );
}
