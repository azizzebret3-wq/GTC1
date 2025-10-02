// src/app/dashboard/admin/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Users, FileText, ClipboardList, ArrowRight, Settings } from 'lucide-react';

export default function AdminDashboardPage() {
  
  const adminLinks = [
      {
          title: "Gérer les Utilisateurs",
          description: "Voir, modifier et assigner des rôles.",
          href: "/dashboard/admin/users",
          icon: Users,
          color: "from-amber-500 to-orange-500"
      },
      {
          title: "Gérer la Bibliothèque",
          description: "Gérer les PDF et les vidéos.",
          href: "/dashboard/admin/content",
          icon: FileText,
          color: "from-rose-500 to-pink-500"
      },
       {
          title: "Gérer les Quiz",
          description: "Créer, modifier et générer des quiz.",
          href: "/dashboard/admin/quizzes",
          icon: ClipboardList,
          color: "from-blue-500 to-cyan-500"
      },
  ]

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black gradient-text">
                Tableau de Bord Administrateur
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                Gérez l'ensemble de la plateforme ici.
              </p>
            </div>
          </div>
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminLinks.map((link) => (
            <Card key={link.title} className="card-hover glassmorphism shadow-xl group overflow-hidden border-0">
                <Link href={link.href} passHref>
                    <div className="p-6 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${link.color}`}>
                                <link.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold group-hover:text-purple-600 transition-colors">{link.title}</h2>
                                <p className="text-sm text-muted-foreground">{link.description}</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>
            </Card>
          ))}
      </div>
    </div>
  );
}
