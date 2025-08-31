import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  viewTitle: string;
  userEmail: string | null;
  displayName?: string;
}

export const Header: React.FC<HeaderProps> = ({ viewTitle, userEmail, displayName }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
        await signOut();
        // The AuthContext will handle redirecting the user to the login page
    } catch (error) {
        console.error("Error signing out:", error);
        // Optionally show an error message to the user
    }
  }

  const userIdentifier = displayName || userEmail;

  return (
    <header className="z-10 py-4 bg-white shadow-md">
      <div className="container flex items-center justify-between h-full px-6 mx-auto text-slate-600">
        <h1 className="text-2xl font-semibold text-slate-700">{viewTitle}</h1>
        <div className="flex items-center">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="align-middle rounded-full focus:shadow-outline-purple focus:outline-none"
              aria-label="Account"
              aria-haspopup="true"
            >
              <img className="object-cover w-8 h-8 rounded-full" src={`https://api.dicebear.com/8.x/initials/svg?seed=${userIdentifier}`} alt="User avatar" aria-hidden="true" />
            </button>
            {isMenuOpen && (
              <div
                className="absolute right-0 w-56 p-2 mt-2 space-y-2 text-slate-600 bg-white border border-slate-100 rounded-md shadow-lg"
                aria-label="submenu"
              >
                <div className="px-4 py-2 border-b">
                  <p className="text-sm">Signed in as</p>
                  <p className="text-sm font-medium text-slate-900 truncate">{userIdentifier}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-2 text-sm font-medium text-left text-red-600 hover:bg-red-50 rounded-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
