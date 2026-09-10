import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Briefcase, ChevronDown, Map, TrendingUp, FileQuestion, User, Compass } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavItemData {
  name: string;
  link: string;
  icon: React.ReactNode;
}

const navItems: NavItemData[] = [
  { name: 'Roadmap', link: '/roadmap', icon: <Map size={17} aria-hidden="true" /> },
  { name: 'Progress', link: '/progress', icon: <TrendingUp size={17} aria-hidden="true" /> },
  { name: 'Resume', link: '/resume', icon: <Briefcase size={17} aria-hidden="true" /> },
  { name: 'Profile', link: '/profile', icon: <User size={17} aria-hidden="true" /> },
];

const serviceItems: NavItemData[] = [
  { name: 'Take A Quiz', link: '/quiz', icon: <FileQuestion size={17} aria-hidden="true" /> },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggleMenu = useCallback(() => setIsOpen(prev => !prev), []);
  const toggleServicesDropdown = useCallback(() => setShowServicesDropdown(prev => !prev), []);

  return (
    <>
      <div className="h-20" />
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 font-sans transition-all duration-300 ease-in-out
          ${isScrolled ? 'glass-nav shadow-soft-lg py-0' : 'bg-transparent bg-brand-gradient py-1'}
        `}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link
              to="/"
              className="group flex flex-shrink-0 items-center gap-2.5"
              aria-label="Roadmap.ai Home"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-amber-300 ring-1 ring-inset ring-white/25 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6">
                <Compass className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                Roadmap<span className="text-amber-300">.ai</span>
              </span>
            </Link>
            <DesktopNav location={location} showServicesDropdown={showServicesDropdown} toggleServicesDropdown={toggleServicesDropdown} />
            <div className="flex items-center space-x-2 sm:space-x-4">
              <MobileMenuToggle isOpen={isOpen} toggleMenu={toggleMenu} />
            </div>
          </div>
        </div>
        <MobileMenu isOpen={isOpen} location={location} toggleMenu={toggleMenu} />
      </motion.nav>
    </>
  );
}

interface DesktopNavProps {
  location: ReturnType<typeof useLocation>;
  showServicesDropdown: boolean;
  toggleServicesDropdown: () => void;
}

function DesktopNav({ location, showServicesDropdown, toggleServicesDropdown }: DesktopNavProps) {
  return (
    <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-1.5">
      {navItems.map((item, index) => (
        <NavItem
          key={item.name}
          to={item.link}
          text={item.name}
          icon={item.icon}
          index={index}
          isActive={location.pathname === item.link}
        />
      ))}
      <ServicesDropdown
        showServicesDropdown={showServicesDropdown}
        toggleServicesDropdown={toggleServicesDropdown}
        location={location}
      />
    </div>
  );
}

interface NavItemProps {
  to: string;
  text: string;
  icon: React.ReactNode;
  index: number;
  isActive: boolean;
}

function NavItem({ to, text, icon, index, isActive }: NavItemProps) {
  return (
    <motion.div
      className="relative"
      whileTap={{ scale: 0.96 }}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 * index }}
    >
      <Link
        to={to}
        className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
          isActive ? 'text-white' : 'text-teal-50/80 hover:text-white'
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        {isActive && (
          <motion.span
            layoutId="nav-active-pill"
            className="absolute inset-0 rounded-full bg-white/15 ring-1 ring-inset ring-white/20"
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          />
        )}
        <span className={`relative ${isActive ? 'text-amber-300' : ''}`}>{icon}</span>
        <span className="relative">{text}</span>
      </Link>
    </motion.div>
  );
}

interface ServicesDropdownProps {
  showServicesDropdown: boolean;
  toggleServicesDropdown: () => void;
  location: ReturnType<typeof useLocation>;
}

function ServicesDropdown({ showServicesDropdown, toggleServicesDropdown, location }: ServicesDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showServicesDropdown) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        toggleServicesDropdown();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        toggleServicesDropdown();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showServicesDropdown, toggleServicesDropdown]);

  return (
    <div className="relative ml-1" ref={dropdownRef}>
      <motion.button
        type="button"
        className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
          showServicesDropdown ? 'bg-white/15 text-white ring-1 ring-inset ring-white/20' : 'text-teal-50/80 hover:text-white'
        }`}
        onClick={toggleServicesDropdown}
        whileTap={{ scale: 0.96 }}
        aria-expanded={showServicesDropdown}
        aria-haspopup="true"
      >
        <Briefcase size={17} aria-hidden="true" />
        <span>Services</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${showServicesDropdown ? 'rotate-180' : ''}`} aria-hidden="true" />
      </motion.button>
      <AnimatePresence>
        {showServicesDropdown && (
          <motion.div
            className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft-lg"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.16 }}
          >
            {serviceItems.map((item) => (
              <Link
                key={item.name}
                to={item.link}
                className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.link ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => toggleServicesDropdown()}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MobileMenuToggleProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

function MobileMenuToggle({ isOpen, toggleMenu }: MobileMenuToggleProps) {
  return (
    <motion.button
      onClick={toggleMenu}
      type="button"
      className="inline-flex justify-center items-center p-2.5 ml-4 rounded-full bg-white/10 sm:hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-300"
      whileTap={{ scale: 0.9 }}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
    >
      <span className="sr-only">{isOpen ? 'Close main menu' : 'Open main menu'}</span>
      {isOpen ? <X className="w-5 h-5 text-white" aria-hidden="true" /> : <Menu className="w-5 h-5 text-white" aria-hidden="true" />}
    </motion.button>
  );
}

interface MobileMenuProps {
  isOpen: boolean;
  location: ReturnType<typeof useLocation>;
  toggleMenu: () => void;
}

function MobileMenu({ isOpen, location, toggleMenu }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="mobile-menu"
          className="glass-nav sm:hidden border-t border-white/10"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] as [number, number, number, number] }}
        >
          <div className="px-3 pt-3 pb-4 space-y-1">
            {navItems.map((item) => (
              <MobileNavItem
                key={item.name}
                to={item.link}
                text={item.name}
                icon={item.icon}
                isActive={location.pathname === item.link}
                onClick={toggleMenu}
              />
            ))}
            {serviceItems.map((item) => (
              <MobileNavItem
                key={item.name}
                to={item.link}
                text={item.name}
                icon={item.icon}
                isActive={location.pathname === item.link}
                onClick={toggleMenu}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface MobileNavItemProps {
  to: string;
  text: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

function MobileNavItem({ to, text, icon, isActive, onClick }: MobileNavItemProps) {
  return (
    <motion.div className="block overflow-hidden rounded-xl" whileTap={{ scale: 0.98 }}>
      <Link to={to} className="block" onClick={onClick} aria-current={isActive ? 'page' : undefined}>
        <div
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
            isActive ? 'bg-white/15 text-white ring-1 ring-inset ring-white/20' : 'text-teal-50/80'
          }`}
        >
          <span className={isActive ? 'text-amber-300' : ''}>{icon}</span>
          <span>{text}</span>
        </div>
      </Link>
    </motion.div>
  );
}
