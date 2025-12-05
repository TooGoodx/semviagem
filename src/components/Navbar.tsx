import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // User profile computed values
  const userProfile = {
    name: user?.name || user?.email?.split('@')[0] || '',
    email: user?.email || ''
  };

  const userAvatar = (user as any)?.picture as string | undefined;
  const displayLabel = isLoading ? 'Carregando...' : (userProfile.email || userProfile.name || 'Conta autenticada');

  // Generate user initials for avatar

  const closeUserMenu = () => setIsUserMenuOpen(false);

  const menuLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Buscar voos', path: '/buscarvoos' },
    { label: 'Perfil & Alertas', path: '/profile' },
  ];

  const userInitials = React.useMemo(() => {
    if (userProfile.name) {
      return userProfile.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    } else if (userProfile.email) {
      return userProfile.email[0].toUpperCase();
    }
    return '?';
  }, [userProfile.name, userProfile.email]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setMobileMenuOpen(false);
      closeUserMenu();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Handle navigation to home sections
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen && userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        closeUserMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const navigateToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      // If not on home page, navigate to home first, then scroll to section
      navigate('/', { replace: true });
      
      // Wait longer and use multiple attempts to ensure page has loaded
      const scrollToSection = (attempts = 0) => {
        const element = document.getElementById(sectionId);
        if (element && attempts < 10) {
          // Check if element is visible and page is loaded
          if (element.offsetHeight > 0) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            // Try again after 100ms if element not ready
            setTimeout(() => scrollToSection(attempts + 1), 100);
          }
        } else if (attempts >= 10) {
          console.warn(`Could not scroll to section '${sectionId}' after multiple attempts`);
        }
      };
      
      // Initial delay increased to 300ms
      setTimeout(() => scrollToSection(), 300);
    } else {
      // Already on home page, just scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <header 
      className="bg-white border-b border-gray-100 sticky top-0 z-50"
      role="banner"
      aria-label="Cabeçalho principal"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="flex items-center space-x-2 group hover:opacity-80 transition-opacity"
              aria-label="Página Inicial"
              onClick={() => {
                if (location.pathname !== '/') {
                  navigate('/');
                } else {
                  const homeSection = document.getElementById('topo');
                  if (homeSection) {
                    homeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }
              }}
            >
              <img src="/logo-nova.svg" alt="SemViagem" className="h-12 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex items-center space-x-8">
              {isAuthenticated ? (
                <>
                  <button 
                    onClick={() => navigateToSection('buscar')} 
                    className="transition-colors"
                    style={{ color: '#060D1C' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#F0C72F'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#060D1C'}
                  >
                    Buscar
                  </button>
                  <button 
                    onClick={() => navigateToSection('sobre')} 
                    className="transition-colors"
                    style={{ color: '#060D1C' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#F0C72F'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#060D1C'}
                  >
                    Sobre Nós
                  </button>
                  <button 
                    onClick={() => navigateToSection('impacto')} 
                    className="transition-colors"
                    style={{ color: '#060D1C' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#F0C72F'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#060D1C'}
                  >
                    Impacto Social
                  </button>
                  <button 
                    onClick={() => navigateToSection('faq')} 
                    className="transition-colors"
                    style={{ color: '#060D1C' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#F0C72F'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#060D1C'}
                  >
                    FAQ
                  </button>
                  <button 
                    onClick={() => navigateToSection('contato')} 
                    className="transition-colors"
                    style={{ color: '#060D1C' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#F0C72F'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#060D1C'}
                  >
                    Contato
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => navigateToSection('buscar')} 
                    className="transition-colors"
                    style={{ color: '#060D1C' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#F0C72F'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#060D1C'}
                  >
                    Buscar
                  </button>
                  <button 
                    onClick={() => navigateToSection('sobre')} 
                    className="transition-colors"
                    style={{ color: '#060D1C' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#F0C72F'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#060D1C'}
                  >
                    Sobre Nós
                  </button>
                  <button 
                    onClick={() => navigateToSection('impacto')} 
                    className="transition-colors"
                    style={{ color: '#060D1C' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#F0C72F'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#060D1C'}
                  >
                    Impacto Social
                  </button>
                  <button 
                    onClick={() => navigateToSection('faq')} 
                    className="transition-colors"
                    style={{ color: '#060D1C' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#F0C72F'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#060D1C'}
                  >
                    FAQ
                  </button>
                  <button 
                    onClick={() => navigateToSection('contato')} 
                    className="transition-colors"
                    style={{ color: '#060D1C' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#F0C72F'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#060D1C'}
                  >
                    Contato
                  </button>
                </>
              )}
            </nav>
            
            {/* Auth Section */}
            <div className="flex items-center gap-2">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium transition-colors"
                    style={{ color: '#060D1C' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#F0C72F'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#060D1C'}
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
                    style={{ backgroundColor: '#F0C72F', color: '#060D1C' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d8b329'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F0C72F'}
                  >
                    Cadastrar-se
                  </Link>
                </>
              ) : (
                <>
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen((prev) => !prev)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100"
                      aria-haspopup="menu"
                      aria-expanded={isUserMenuOpen}
                      aria-controls="user-dropdown-menu"
                    >
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={userProfile.name || userProfile.email || 'Usuário'}
                          className="h-9 w-9 rounded-full object-cover shadow-sm"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#060D1C] text-white shadow-sm">
                          {userInitials}
                        </div>
                      )}
                      <div className="flex flex-col items-start">
                        <span className="text-[11px] uppercase tracking-wide text-gray-500">Logado como</span>
                        <span className="text-sm font-medium text-gray-900">{displayLabel}</span>
                      </div>
                      <svg
                        className={`h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 8l4 4 4-4" />
                      </svg>
                    </button>
                    {isUserMenuOpen && (
                      <div
                        id="user-dropdown-menu"
                        className="absolute right-0 mt-2 w-60 origin-top-right rounded-xl border border-gray-100 bg-white shadow-xl"
                        style={{ zIndex: 9999 }}
                      >
                        <div className="border-b border-gray-100 px-4 py-3">
                          <p className="text-xs uppercase tracking-wider text-gray-400">Sessão ativa</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{displayLabel}</p>
                        </div>
                        <div className="py-2">
                          {menuLinks.map((item) => (
                            <button
                              key={item.path}
                              onClick={() => {
                                navigate(item.path)
                                closeUserMenu()
                              }}
                              className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                              style={{ minHeight: '44px', WebkitTapHighlightColor: 'transparent' }}
                            >
                              {item.label}
                            </button>
                          ))}
                          <hr className="my-2 border-gray-100" />
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 active:bg-red-100"
                            style={{ minHeight: '44px', WebkitTapHighlightColor: 'transparent' }}
                          >
                            Sair da conta
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleLogout}
                    className="bg-[#F0C72F] text-[#060D1C] hover:bg-[#d8b329]"
                  >
                    Sair
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Mobile Auth Info */}
            {isAuthenticated && (
              <div className="flex items-center">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userProfile.name || userProfile.email || 'Usuário'}
                    className="mr-2 h-8 w-8 rounded-full object-cover shadow-md"
                  />
                ) : (
                  <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#060D1C] text-xs font-medium text-white shadow-md" aria-hidden="true">
                    {userInitials}
                  </div>
                )}
                <span className="sr-only text-sm font-medium text-gray-700">
                  {displayLabel}
                </span>
              </div>
            )}
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleMobileMenu();
              }}
              className={`p-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                mobileMenuOpen ? 'bg-gray-100' : ''
              }`}
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-haspopup="true"
            >
              <div className="w-6 h-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          id="mobile-menu"
          className="fixed inset-0 z-40 bg-gray-800/95 backdrop-blur-sm md:hidden overflow-y-auto pt-20 pb-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="container mx-auto px-4">
            {/* User Info (if logged in) */}
            {isAuthenticated && (
              <div className="flex items-center p-4 mb-6 bg-gray-700/30 rounded-xl border border-gray-600/50">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-medium text-base shadow-lg mr-3 flex-shrink-0"
                  style={{ backgroundColor: '#060D1C' }}
                  aria-hidden="true"
                >
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{userProfile.name || 'Usuário'}</p>
                  <p className="text-xs text-gray-300 truncate">{userProfile.email || 'usuario@exemplo.com'}</p>
                </div>
              </div>
            )}
            
            {/* Navigation Links */}
            <nav className="space-y-1 mb-6">
              {isAuthenticated ? (
                <>
                  <button 
                    onClick={() => { navigateToSection('buscar'); setMobileMenuOpen(false); }} 
                    className="block w-full text-left px-4 py-3 text-white hover:bg-gray-700 rounded-md transition-colors"
                  >
                    Buscar
                  </button>
                  <button 
                    onClick={() => { navigateToSection('sobre'); setMobileMenuOpen(false); }} 
                    className="block w-full text-left px-4 py-3 text-white hover:bg-gray-700 rounded-md transition-colors"
                  >
                    Sobre Nós
                  </button>
                  <button 
                    onClick={() => { navigateToSection('impacto'); setMobileMenuOpen(false); }} 
                    className="block w-full text-left px-4 py-3 text-white hover:bg-gray-700 rounded-md transition-colors"
                  >
                    Impacto Social
                  </button>
                  <button 
                    onClick={() => { navigateToSection('contato'); setMobileMenuOpen(false); }} 
                    className="block w-full text-left px-4 py-3 text-white hover:bg-gray-700 rounded-md transition-colors"
                  >
                    Contato
                  </button>
                  <button 
                    onClick={() => { navigateToSection('faq'); setMobileMenuOpen(false); }} 
                    className="block w-full text-left px-4 py-3 text-white hover:bg-gray-700 rounded-md transition-colors"
                  >
                    FAQ
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => { navigateToSection('buscar'); setMobileMenuOpen(false); }} 
                    className="block w-full text-left px-4 py-3 text-white hover:bg-gray-700 rounded-md transition-colors"
                  >
                    Buscar
                  </button>
                  <button 
                    onClick={() => { navigateToSection('sobre'); setMobileMenuOpen(false); }} 
                    className="block w-full text-left px-4 py-3 text-white hover:bg-gray-700 rounded-md transition-colors"
                  >
                    Sobre Nós
                  </button>
                  <button 
                    onClick={() => { navigateToSection('impacto'); setMobileMenuOpen(false); }} 
                    className="block w-full text-left px-4 py-3 text-white hover:bg-gray-700 rounded-md transition-colors"
                  >
                    Impacto Social
                  </button>
                  <button 
                    onClick={() => { navigateToSection('contato'); setMobileMenuOpen(false); }} 
                    className="block w-full text-left px-4 py-3 text-white hover:bg-gray-700 rounded-md transition-colors"
                  >
                    Contato
                  </button>
                  <button 
                    onClick={() => { navigateToSection('faq'); setMobileMenuOpen(false); }} 
                    className="block w-full text-left px-4 py-3 text-white hover:bg-gray-700 rounded-md transition-colors"
                  >
                    FAQ
                  </button>
                </>
              )}
              
              {/* Auth buttons for mobile */}
              {!isAuthenticated && (
                <div className="border-t border-gray-600 pt-4 space-y-2">
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-white hover:bg-gray-700 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full text-left px-4 py-3 rounded-md transition-colors"
                    style={{ backgroundColor: '#F0C72F', color: '#060D1C' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Cadastrar-se
                  </Link>
                </div>
              )}
              
              {/* User menu for mobile */}
              {isAuthenticated && (
                <div className="border-t border-gray-600 pt-4 space-y-2">
                  {menuLinks.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path)
                        setMobileMenuOpen(false)
                      }}
                      className="flex w-full items-center px-4 py-3 text-left text-white hover:bg-gray-700 rounded-md transition-colors"
                      style={{ minHeight: '44px' }}
                    >
                      {item.label}
                    </button>
                  ))}
                  <hr className="my-2 border-gray-600" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-red-300 hover:bg-red-900/30 rounded-md transition-colors"
                    style={{ minHeight: '44px' }}
                  >
                    Sair da Conta
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
