'use client';

import { useState, useEffect } from 'react'
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Calendar, 
  CalendarPlus, 
  CalendarCheck, 
  User, 
  Settings, 
  LogOut,
  Users,
  BarChart3,
  Shield,
  QrCode,
  Menu,
  X
} from 'lucide-react';
import { mockAPI, getCurrentUser } from '@/lib/mock-data';
import { User as UserType } from '@/lib/types';
import { toast } from 'sonner';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserType>(getCurrentUser());
  const [availableUsers, setAvailableUsers] = useState<UserType[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    loadUsers();
    // Atualizar o usuário atual quando o componente monta
    setCurrentUser(getCurrentUser());
  }, []);

  const loadUsers = async () => {
    try {
      const users = await mockAPI.getUsers();
      setAvailableUsers(users);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleUserSwitch = async (userId: string) => {
    try {
      const user = await mockAPI.switchUser(userId);
      if (user) {
        setCurrentUser(user);
        setUserDropdownOpen(false); // Fechar o dropdown automaticamente
        toast.success(`Logado como ${user.name}`);
        
        // Navegar para a página inicial para refletir as mudanças
        router.push('/');
        
        // Pequeno delay para garantir que a página foi atualizada
        setTimeout(() => {
          setCurrentUser(getCurrentUser());
        }, 100);
      }
    } catch (error) {
      toast.error('Erro ao trocar usuário');
    }
  };

  const isActive = (path: string) => pathname === path;

  // Definir navegação baseada no role
  const getNavigationItems = () => {
    const baseItems = [
      { href: '/', label: 'Eventos', icon: Calendar }
    ];

    if (currentUser.role === 'PARTICIPANT') {
      return [
        ...baseItems,
        { href: '/my-registrations', label: 'Minhas Inscrições', icon: CalendarCheck }
      ];
    }

    if (currentUser.role === 'ORGANIZER') {
      return [
        ...baseItems,
        { href: '/create-event', label: 'Criar Evento', icon: CalendarPlus },
        { href: '/my-events', label: 'Meus Eventos', icon: BarChart3 }
      ];
    }

    if (currentUser.role === 'ADMIN') {
      return [
        ...baseItems,
        { href: '/create-event', label: 'Criar Evento', icon: CalendarPlus },
        { href: '/my-events', label: 'Meus Eventos', icon: BarChart3 },
        { href: '/my-registrations', label: 'Minhas Inscrições', icon: CalendarCheck },
        { href: '/admin', label: 'Administração', icon: Shield },
        { href: '/qr-scanner', label: 'Scanner QR', icon: QrCode }
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-500';
      case 'ORGANIZER': return 'bg-blue-500';
      case 'PARTICIPANT': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Admin';
      case 'ORGANIZER': return 'Organizador';
      case 'PARTICIPANT': return 'Participante';
      default: return role;
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo e Navegação Principal */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">ColaAi</span>
            </Link>

            {/* Navegação Desktop */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Menu e Mobile Toggle */}
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            <DropdownMenu open={userDropdownOpen} onOpenChange={setUserDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative flex items-center space-x-2 hover:bg-gray-50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>
                      {currentUser.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                    <div className="flex items-center space-x-1">
                      <div 
                        className={`w-2 h-2 rounded-full ${getRoleBadgeColor(currentUser.role)}`}
                      />
                      <span className="text-xs text-gray-500">{getRoleLabel(currentUser.role)}</span>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                      <AvatarFallback>
                        {currentUser.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{currentUser.name}</div>
                      <div className="text-sm text-gray-500">{currentUser.email}</div>
                      <div className="flex items-center space-x-1 mt-1">
                        <div 
                          className={`w-2 h-2 rounded-full ${getRoleBadgeColor(currentUser.role)}`}
                        />
                        <span className="text-xs text-gray-500">{getRoleLabel(currentUser.role)}</span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wider">
                  Trocar Usuário (Teste)
                </DropdownMenuLabel>
                
                {availableUsers.map((user) => (
                  <DropdownMenuItem
                    key={user.id}
                    onClick={() => handleUserSwitch(user.id)}
                    className={`cursor-pointer ${currentUser.id === user.id ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-center space-x-2 w-full">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="flex items-center space-x-1">
                          <div 
                            className={`w-1.5 h-1.5 rounded-full ${getRoleBadgeColor(user.role)}`}
                          />
                          <span className="text-xs text-gray-500">{getRoleLabel(user.role)}</span>
                        </div>
                      </div>
                      {currentUser.id === user.id && (
                        <div className="text-blue-600 text-xs">✓</div>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
} 