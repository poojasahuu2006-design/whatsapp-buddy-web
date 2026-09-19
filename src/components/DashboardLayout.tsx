import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Zap,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Logo from '@/components/Logo';
import Avatar from '@/components/ui/Avatar';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  label: string;
  icon: LucideIcon;
  to: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Personas', icon: Users, to: '/dashboard/personas' },
  { label: 'Automations', icon: Zap, to: '/dashboard/automations' },
  { label: 'Settings', icon: Settings, to: '/dashboard/settings' },
  { label: 'Billing', icon: CreditCard, to: '/dashboard/billing' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarMenu, setAvatarMenu] = useState(false);
  const { user, connectedNumber, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="px-5 py-6">
        <Logo to="/dashboard" />
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-whatsapp-50 text-whatsapp-700'
                  : 'text-ink-500 hover:bg-cream-200 hover:text-ink-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`h-5 w-5 ${isActive ? 'text-whatsapp-600' : 'text-ink-400'}`}
                />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="ml-auto h-2 w-2 rounded-full bg-whatsapp-500"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-cream-300/60 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-ink-500 transition-all hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('') ?? 'WB';

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-cream-300/60 bg-cream-100 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-cream-300/60 bg-cream-100 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-cream-300/60 bg-cream-50/85 px-5 py-4 backdrop-blur-md lg:px-8">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-700 transition-colors hover:bg-cream-200 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Connected number + status */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-whatsapp-50 px-3 py-1.5 sm:flex">
              <span className="flex h-2 w-2 rounded-full bg-whatsapp-500">
                <span className="h-full w-full animate-ping rounded-full bg-whatsapp-500 opacity-75" />
              </span>
              <span className="text-xs font-bold text-whatsapp-700">Connected</span>
            </div>
            <span className="hidden text-sm font-medium text-ink-600 md:block">
              {connectedNumber ?? '+1 (555) 014-2893'}
            </span>
          </div>

          {/* Avatar dropdown */}
          <div className="relative">
            <button
              onClick={() => setAvatarMenu((v) => !v)}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-cream-200"
            >
              <Avatar initials={initials} size="sm" />
              <span className="hidden text-sm font-semibold text-ink-700 sm:block">
                {user?.name ?? 'Demo User'}
              </span>
              <ChevronDown className="h-4 w-4 text-ink-400" />
            </button>

            <AnimatePresence>
              {avatarMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setAvatarMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full z-40 mt-2 w-56 rounded-2xl border border-cream-300/70 bg-cream-50 p-2 shadow-xl"
                  >
                    <div className="border-b border-cream-300/60 px-3 py-3">
                      <p className="text-sm font-bold text-ink-900">{user?.name}</p>
                      <p className="text-xs text-ink-400">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setAvatarMenu(false);
                        navigate('/dashboard/settings');
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-600 transition-colors hover:bg-cream-200"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page content */}
        <main className="px-5 py-8 lg:px-8 lg:py-10">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
