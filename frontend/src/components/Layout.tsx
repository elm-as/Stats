import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, LogOut, User, ChevronDown, 
  Database, Activity, FileText, Settings, 
  Menu, X, Bell, Search, Maximize2, Minimize2, Network, Sparkles
} from 'lucide-react';
import logoOS from '../assets/logoOS.png';
import { useAppSelector, useAppDispatch } from '../hooks';
import { logout } from '../store/slices/authSlice';

export default function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [showMenu, setShowMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1366;
  });
  const [density, setDensity] = useState<'normal' | 'compact'>(() => {
    if (typeof window === 'undefined') return 'normal';
    return localStorage.getItem('density') as 'normal' | 'compact' ?? (window.innerWidth < 1366 ? 'compact' : 'normal');
  });

  useEffect(() => {
    document.documentElement.dataset.density = density;
    localStorage.setItem('density', density);
  }, [density]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isHome = pathname === '/';
  const isWorkflow = pathname.startsWith('/workflow');
  const isCanvas = pathname.startsWith('/canvas');
  const isAnalyzer = pathname.startsWith('/analyzer');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: Home, path: '/', active: isHome },
    { label: 'Auto-Analyse IA', icon: Sparkles, path: '/analyzer', active: isAnalyzer },
    { label: 'Analyses', icon: Activity, path: '/workflow', active: isWorkflow },
    { label: 'Canvas', icon: Network, path: '/canvas', active: isCanvas },
  ];

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 flex overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="bg-mesh absolute inset-0 opacity-40" />
        <div className="bg-hex absolute inset-0 opacity-30" />
        <div className="glow-point top-[-100px] left-[-100px]" />
        <div className="glow-point bottom-[-100px] right-[-100px] !bg-secondary-500/10" />
      </div>

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out border-r border-white/5 bg-surface-950/80 backdrop-blur-xl ${
          isSidebarOpen ? 'translate-x-0 w-56 xl:w-60' : '-translate-x-full lg:translate-x-0 lg:w-16'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="h-14 flex items-center px-4 gap-3 border-b border-white/5">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img src={logoOS} alt="OpenStats" className="w-7 h-7 object-contain group-hover:scale-110 transition-transform duration-500" />
              {isSidebarOpen && (
                <div className="animate-fade-in whitespace-nowrap">
                  <h1 className="text-sm font-black text-surface-50 tracking-tighter leading-none">
                    OPEN<span className="text-accent-400">STATS</span>
                  </h1>
                  <p className="text-[8px] text-surface-500 tracking-[0.2em] uppercase font-bold mt-0.5">Data Systems</p>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto no-scrollbar">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                title={!isSidebarOpen ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group ${
                  item.active 
                    ? 'bg-accent-500/15 text-accent-300 border border-accent-500/25 shadow-[0_0_15px_-3px_rgba(6,182,212,0.2)]' 
                    : 'text-default hover:text-strong hover:bg-white/5 border border-transparent'
                }`}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-accent-400' : 'group-hover:scale-110 transition-transform'}`} />
                {isSidebarOpen && <span className="text-[13px] font-semibold tracking-wide">{item.label}</span>}
              </Link>
            ))}

            <div className="pt-5 pb-2">
              <div className={`px-3 mb-2 text-[9px] font-black text-surface-600 uppercase tracking-[0.3em] ${!isSidebarOpen && 'hidden'}`}>
                Workspace
              </div>
              <Link to="/profile" title={!isSidebarOpen ? 'Paramètres' : undefined} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-surface-400 hover:text-surface-100 hover:bg-white/5 transition-all group">
                <Settings className="w-4 h-4 shrink-0 group-hover:rotate-45 transition-transform" />
                {isSidebarOpen && <span className="text-[13px] font-semibold">Paramètres</span>}
              </Link>
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-white/5">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full p-2 rounded-lg bg-white/5 hover:bg-white/10 text-surface-400 transition-all flex items-center justify-center"
            >
              {isSidebarOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        {/* Top Header */}
        <header className="h-14 border-b border-white/5 bg-surface-950/40 backdrop-blur-md px-4 md:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-surface-300"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 w-48 lg:w-56 focus-within:border-accent-500/40 transition-colors">
              <Search className="w-3.5 h-3.5 text-muted" />
              <input type="text" placeholder="Rechercher…" className="!bg-transparent !border-0 !p-0 !py-0 text-xs focus:!ring-0 w-full placeholder:text-faint text-default" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDensity(d => d === 'normal' ? 'compact' : 'normal')}
              className="p-1.5 text-muted hover:text-accent-400 transition-colors rounded-lg hover:bg-white/5"
              title={`Densité: ${density === 'normal' ? 'normale' : 'compacte'}`}
            >
              {density === 'compact' ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button 
              className="p-1.5 text-muted hover:text-accent-400 transition-colors rounded-lg hover:bg-white/5" 
              title="Documentation"
              onClick={() => window.open('/docs', '_blank')}
            >
              <FileText className="w-4 h-4" />
            </button>
            <Link 
              to="/profile" 
              className="p-1.5 text-muted hover:text-accent-400 transition-colors rounded-lg hover:bg-white/5" 
              title="Paramètres du logiciel"
            >
              <Settings className="w-4 h-4" />
            </Link>
            <button className="relative p-1.5 text-muted hover:text-accent-400 transition-colors rounded-lg hover:bg-white/5" title="Notifications">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-accent-500 rounded-full border border-surface-950" />
            </button>

            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 p-1 pr-2.5 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-brand flex items-center justify-center font-bold text-[10px] text-surface-950 shadow-glow-sm">
                    {user.display_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[11px] font-bold hidden sm:inline text-strong">{user.display_name}</span>
                  <ChevronDown className={`w-3 h-3 text-muted transition-transform ${showMenu ? 'rotate-180' : ''}`} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-full mt-3 w-64 card p-2 z-[100] animate-slide-up border-white/10">
                    <div className="p-3 border-b border-white/5 mb-2">
                      <p className="text-xs font-bold text-strong">{user.display_name}</p>
                      <p className="text-[10px] text-muted">{user.email}</p>
                      <div className="mt-2 flex gap-1">
                        <span className="badge">{user.role}</span>
                        <span className="badge badge-info">Pro</span>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setShowMenu(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-default hover:text-strong hover:bg-white/5 rounded-lg transition-colors text-left"
                    >
                      <User className="w-4 h-4" />
                      Profil & Compte
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto no-scrollbar py-3 md:py-5">
          <div className="container-app">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
