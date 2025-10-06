// src/app/dashboard/layout.tsx
'use client';

import React,  { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth.tsx';
import {
  BookOpen,
  ClipboardList as Play,
  FileText,
  Users,
  Settings,
  LogOut,
  User as UserIcon,
  Crown,
  Trophy,
  Activity,
  Sparkles,
  Menu,
  X,
  Bell,
  Moon,
  Sun,
  CalendarClock,
  UserCircle,
  ClipboardList,
  BrainCircuit,
  CheckCheck,
  Download,
} from 'lucide-react';
import { useTheme } from "next-themes"
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast"
import { Logo } from '@/components/logo';
import WhatsAppFloat from '@/components/whatsapp-float';
import TiktokFloat from '@/components/tiktok-float';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppNotification, getUserNotifications, markAllNotificationsAsRead } from '@/lib/firestore.service';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const userNavItems = [
  { title: "Accueil", url: "/dashboard", icon: Activity, gradient: "from-purple-500 to-pink-500" },
  { title: "Quiz", url: "/dashboard/quizzes", icon: Play, gradient: "from-blue-500 to-cyan-500" },
  { title: "Concours", url: "/dashboard/mock-exams", icon: CalendarClock, gradient: "from-indigo-500 to-blue-500" },
  { title: "Ressources", url: "/dashboard/documents", icon: BookOpen, gradient: "from-orange-500 to-red-500" },
  { title: "Formations", url: "/dashboard/formations", icon: Trophy, gradient: "from-rose-500 to-pink-500" },
];

const adminNavItems = [
  { title: "Gérer Contenu", url: "/dashboard/admin/content", icon: FileText, gradient: "from-rose-500 to-pink-500" },
  { title: "Gérer Users", url: "/dashboard/admin/users", icon: Users, gradient: "from-amber-500 to-orange-500" },
  { title: "Gérer Quiz", url: "/dashboard/admin/quizzes", icon: ClipboardList, gradient: "from-blue-500 to-cyan-500" },
];

const mobileNavItems = [
  { title: "Accueil", url: "/dashboard", icon: Activity },
  { title: "Quiz", url: "/dashboard/quizzes", icon: Play },
  { title: "Concours", url: "/dashboard/mock-exams", icon: CalendarClock },
  { title: "Ressources", url: "/dashboard/documents", icon: BookOpen },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { setTheme, theme } = useTheme();
  const { user, userData, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [installPrompt, setInstallPrompt] = useState<any>(null);


  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
  
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) {
      return;
    }
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: { outcome: 'accepted' | 'dismissed' }) => {
      if (choiceResult.outcome === 'accepted') {
        toast({ title: 'Installation réussie !', description: 'L\'application a été ajoutée à votre écran d\'accueil.' });
      }
      setInstallPrompt(null);
    });
  };

  const fetchNotifications = useCallback(async () => {
    if (user) {
      const userNotifications = await getUserNotifications(user.uid);
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.isRead).length);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté.",
      });
      router.push('/login');
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue.",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    await markAllNotificationsAsRead(user.uid);
    fetchNotifications();
  }

  const isNavItemActive = (itemUrl: string) => {
    if (itemUrl === "/dashboard") {
      return pathname === itemUrl;
    }
    return pathname.startsWith(itemUrl);
  };

  if (loading || !user || !userData) {
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

  
  const getInitials = (name: string | undefined | null) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  }

  const isPremium = userData?.subscription_type === 'premium';
  const isAdmin = userData?.role === 'admin';
  const desktopNavItems = isAdmin ? [...userNavItems.slice(0,1), { title: "Admin", url: "/dashboard/admin", icon: Settings, gradient: "from-gray-500 to-gray-700" }, ...userNavItems.slice(1)] : userNavItems;

  return (
     <div className="min-h-screen bg-background">
      <style>
        {`
          .glassmorphism {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
          
          .dark .glassmorphism {
             background: rgba(10, 10, 20, 0.7);
             backdrop-filter: blur(20px);
             border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .glassmorphism-dark {
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .floating {
            animation: float 4s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          
          .pulse-ring {
            animation: pulse-ring 2s infinite;
          }
          
          @keyframes pulse-ring {
            0% { transform: scale(0.33); opacity: 1; }
            40%, 50% { opacity: 0; }
            100% { opacity: 0; transform: scale(1.2); }
          }
          
          .hover-lift {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .hover-lift:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          }
          
          .nav-glow {
            transition: all 0.3s ease;
          }
          
          .nav-glow:hover {
            box-shadow: 0 0 30px rgba(139, 92, 246, 0.4);
          }
          
          .background-mesh {
            background-image: 
              radial-gradient(circle at 25% 25%, hsl(var(--primary) / 0.1) 0%, transparent 40%),
              radial-gradient(circle at 75% 75%, hsl(var(--accent) / 0.1) 0%, transparent 40%),
              radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.08) 0%, transparent 40%);
          }
        `}
      </style>

      <div className="min-h-screen background-mesh">
        {/* Header */}
        <header className="glassmorphism sticky top-0 z-50 border-b">
          <div className="px-4 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Logo />

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {desktopNavItems.map((item) => (
                  <Link key={item.title} href={item.url}>
                    <Button
                      variant="ghost"
                      className={`nav-glow rounded-xl px-4 py-2 font-semibold text-sm transition-all ${
                        isNavItemActive(item.url)
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-md`
                          : 'text-foreground/70 hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.title}
                    </Button>
                  </Link>
                ))}
              </nav>

              {/* Profile & Actions */}
              <div className="flex items-center gap-3">
                {isPremium && !isAdmin && (
                  <Badge className="hidden sm:flex bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 font-bold shadow-lg px-3 py-1 text-xs">
                    <Crown className="w-3 h-3 mr-1.5" />
                    Premium
                  </Badge>
                )}
                 
                 <Popover onOpenChange={(open) => { if(open) fetchNotifications()}}>
                    <PopoverTrigger asChild>
                       <Button variant="ghost" size="icon" className="relative rounded-xl w-10 h-10 hover:scale-105 transition-all">
                          <Bell className="w-5 h-5" />
                          {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 flex h-4 w-4">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-accent text-xs items-center justify-center text-white">{unreadCount}</span>
                            </span>
                          )}
                       </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium leading-none">Notifications</h4>
                             {unreadCount > 0 && (
                              <Button variant="link" size="sm" className="p-0 h-auto" onClick={handleMarkAllAsRead}>
                                <CheckCheck className="w-4 h-4 mr-1"/>Marquer comme lu
                              </Button>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Vous avez {unreadCount} notification(s) non lue(s).
                          </p>
                        </div>
                        <div className="grid gap-2 max-h-64 overflow-y-auto">
                           {notifications.length > 0 ? (
                            notifications.map(notif => (
                              <Link key={notif.id} href={notif.href} className={`group block p-2 rounded-md hover:bg-accent/50 ${!notif.isRead && 'bg-primary/5'}`}>
                                <div className="grid grid-cols-[25px_1fr] items-start gap-3">
                                  <span className={`mt-1 flex h-2 w-2 translate-y-1 rounded-full ${!notif.isRead ? 'bg-primary' : 'bg-muted'}`} />
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">{notif.title}</p>
                                    <p className="text-sm text-muted-foreground">{notif.description}</p>
                                    <p className="text-xs text-muted-foreground/80">{formatDistanceToNow(notif.createdAt, { addSuffix: true, locale: fr })}</p>
                                  </div>
                                </div>
                              </Link>
                            ))
                          ) : (
                            <p className="text-sm text-center text-muted-foreground py-4">Aucune notification pour le moment.</p>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}  className="rounded-xl w-10 h-10 hover:scale-105 transition-all">
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="hidden md:flex items-center gap-3 cursor-pointer">
                            <Avatar className="w-9 h-9 ring-2 ring-white/50 shadow-lg hover-lift">
                                <AvatarImage src={userData?.photoURL ?? undefined} />
                                <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold">
                                {getInitials(userData?.fullName)}
                                </AvatarFallback>
                            </Avatar>
                             <div className="text-left hidden lg:block">
                                <p className="font-bold text-foreground text-sm">
                                {userData?.fullName?.split(' ')[0] || 'Utilisateur'}
                                </p>
                                <p className="text-xs text-muted-foreground font-medium">
                                {isAdmin ? '👑 Admin' : (isPremium ? '🌟 Premium' : '🆓 Gratuit')}
                                </p>
                            </div>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href="/dashboard/profile" passHref>
                            <DropdownMenuItem><UserIcon className="w-4 h-4 mr-2" />Mon Profil</DropdownMenuItem>
                        </Link>
                        <Link href="/dashboard/settings" passHref>
                            <DropdownMenuItem><Settings className="w-4 h-4 mr-2" />Paramètres</DropdownMenuItem>
                        </Link>
                        {installPrompt && (
                          <DropdownMenuItem onClick={handleInstallClick}>
                            <Download className="w-4 h-4 mr-2" />
                            Installer l'App
                          </DropdownMenuItem>
                        )}
                        {!isAdmin && !isPremium && (
                            <>
                            <DropdownMenuSeparator />
                            <Link href="/dashboard/premium" passHref>
                                <DropdownMenuItem className="text-purple-600 focus:text-purple-600">
                                <Crown className="w-4 h-4 mr-2" />
                                Passer Premium
                                </DropdownMenuItem>
                            </Link>
                            </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                            <LogOut className="w-4 h-4 mr-2" />
                            Se déconnecter
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden glassmorphism rounded-xl w-10 h-10 hover:scale-105 transition-all shadow-md"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        <div className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
            ></div>
            <div 
                className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] glassmorphism-dark text-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="p-6 flex-shrink-0">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-bold text-lg">Menu</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 rounded-xl"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <X className="w-6 h-6" />
                        </Button>
                    </div>

                    <Card className="glassmorphism mb-8 border-white/20">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="w-12 h-12 ring-2 ring-white/30 shadow-lg">
                                    <AvatarImage src={userData?.photoURL ?? undefined} />
                                    <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold">
                                        {getInitials(userData?.fullName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-bold text-white text-sm">{userData?.fullName || 'Utilisateur'}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge className={`text-xs font-bold border-0 ${isAdmin ? 'bg-indigo-500 text-white' : (isPremium ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : 'bg-white/20 text-white border-white/30')}`}>
                                            {isAdmin ? <><Crown className="w-3 h-3 mr-1" />Admin</> : (isPremium ? <><Crown className="w-3 h-3 mr-1" />Premium</> : 'Gratuit')}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    <div className="space-y-3 mb-8">
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />Navigation
                        </h3>
                        {userNavItems.map((item) => (
                            <Link key={item.title} href={item.url}>
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start rounded-2xl p-4 font-semibold text-sm transition-all hover-lift ${
                                        isNavItemActive(item.url)
                                            ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${
                                        isNavItemActive(item.url) ? 'bg-white/20' : `bg-gradient-to-r ${item.gradient} text-white shadow-sm`
                                    }`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    {item.title}
                                </Button>
                            </Link>
                        ))}
                    </div>

                    {isAdmin && (
                        <div className="space-y-3 mb-8">
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                <Settings className="w-4 h-4" />Administration
                            </h3>
                            {adminNavItems.map((item) => (
                                <Link key={item.title} href={item.url}>
                                    <Button
                                        variant="ghost"
                                        className={`w-full justify-start rounded-2xl p-4 font-semibold text-sm transition-all hover-lift ${
                                            isNavItemActive(item.url)
                                                ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                                                : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${
                                            isNavItemActive(item.url) ? 'bg-white/20' : `bg-gradient-to-r ${item.gradient} text-white shadow-sm`
                                        }`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        {item.title}
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    )}
                    
                    <div className="space-y-3 border-t border-white/20 pt-6">
                        {!isPremium && !isAdmin && (
                            <Link href="/dashboard/premium">
                                <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold rounded-2xl p-4 shadow-lg">
                                    <Crown className="w-5 h-5 mr-3" />Passer Premium
                                    <Sparkles className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        )}
                         {installPrompt && (
                           <Button onClick={handleInstallClick} className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold rounded-2xl p-4 shadow-lg">
                                <Download className="w-5 h-5 mr-3" />
                                Installer l'Application
                            </Button>
                        )}
                        <Link href="/dashboard/settings">
                            <Button variant="ghost" className="w-full justify-start text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-xl p-4">
                                <Settings className="w-5 h-5 mr-4" />Paramètres
                            </Button>
                        </Link>
                        <Link href="/dashboard/profile">
                            <Button variant="ghost" className="w-full justify-start text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-xl p-4">
                                <UserIcon className="w-5 h-5 mr-4" />Mon Profil
                            </Button>
                        </Link>
                        <Button variant="ghost" className="w-full justify-start text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl p-4" onClick={handleLogout}>
                            <LogOut className="w-5 h-5 mr-4" />Se déconnecter
                        </Button>
                    </div>
                </div>
            </div>
        </div>


        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>

        <TiktokFloat />
        <WhatsAppFloat />
        
         {/* Bottom mobile navigation */}
         <div className="lg:hidden fixed bottom-0 left-0 right-0 glassmorphism border-t z-30">
             <div className="grid grid-cols-4 gap-1 p-2">
                 {mobileNavItems.map((item) => {
                     const fullItem = userNavItems.find(nav => nav.title.startsWith(item.title))!;
                     return (
                         <Link key={item.title} href={fullItem.url}>
                             <Button
                                 variant="ghost"
                                 className={`flex flex-col gap-1 h-auto py-2 px-1 rounded-xl font-medium text-xs transition-all w-full ${
                                     isNavItemActive(fullItem.url)
                                         ? `bg-gradient-to-r ${fullItem.gradient} text-white shadow-lg`
                                         : 'text-muted-foreground hover:bg-white/60'
                                 }`}
                             >
                                 <item.icon className="w-5 h-5" />
                                 <span className="text-[10px] font-semibold">{item.title}</span>
                             </Button>
                         </Link>
                     )
                 })}
             </div>
         </div>
      </div>
    </div>
  );
}
