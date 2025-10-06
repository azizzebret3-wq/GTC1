// src/app/dashboard/premium/page.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Crown, Sparkles, CheckCircle, BrainCircuit, BookOpen, Video, ArrowRight, Copy, Star, Wallet, MessageCircle, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.tsx';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const premiumFeatures = [
    { icon: BrainCircuit, text: "Génération de quiz intelligente et illimitée" },
    { icon: BookOpen, text: 'Accès à toute la bibliothèque de documents' },
    { icon: Video, text: 'Accès à toutes les formations vidéo' },
    { icon: Sparkles, text: 'Corrections intelligentes et détaillées' },
    { icon: CheckCircle, text: 'Suivi de performance avancé' },
    { icon: CheckCircle, text: 'Support prioritaire' },
];

const mobileMoneyOptions = [
    { name: "Orange Money", instruction: (amount: number) => `*144*2*1*75204647*${amount}#`, logo: "/logos/orange-money.svg" },
    { name: "Moov Money", instruction: (amount: number) => `*555*2*1*50586160*${amount}#`, logo: "/logos/moov-money.svg" },
];

const adminContacts = [
    { name: "Admin 1", number: "22675204647" },
    { name: "Admin 2", number: "22654808048" },
    { name: "Admin 3", number: "22654776805" }
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
                  Passez à Premium
                </h1>
                <p className="text-sm sm:text-base text-gray-600 font-medium">
                  Débloquez votre plein potentiel et maximisez vos chances de succès.
                </p>
              </div>
            </div>
          </div>
        </div>
        
         {isPremium && (
            <Card className="glassmorphism shadow-xl border-2 border-green-400/50">
                <CardHeader>
                    <CardTitle className="text-xl text-green-600">Vous êtes déjà membre Premium !</CardTitle>
                    {expiryDate && 
                        <CardDescription>Votre abonnement est actif jusqu'au <span className="font-bold">{expiryDate}</span>.</CardDescription>
                    }
                </CardHeader>
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
                <p className="text-muted-foreground mb-4">Choisissez votre méthode de paiement préférée ci-dessous.</p>
                
                {/* Paydunia Button */}
                <Button 
                    asChild 
                    className="w-full h-14 mb-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold"
                >
                    <Link href="https://paydunia.net/p/YOUR_PAYMENT_LINK" target="_blank">
                        Payer avec Paydunia
                        <ArrowRight className="w-5 h-5 ml-2"/>
                    </Link>
                </Button>

                {/* Other payment methods */}
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Autres moyens de paiement (Mobile Money)</AccordionTrigger>
                    <AccordionContent>
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
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
            </div>

            <div className="p-6 rounded-lg border bg-background/50">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-green-500"/>Étape 2 : Envoyez la preuve</h3>
                <p className="text-muted-foreground mb-4">Après le paiement, faites une capture d'écran de la confirmation et envoyez-la à l'un de nos administrateurs via WhatsApp.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {adminContacts.map(admin => (
                        <Button key={admin.number} asChild className="w-full h-11 bg-green-500 hover:bg-green-600 text-white">
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
