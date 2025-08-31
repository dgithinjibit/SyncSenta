import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SyncsentaIcon, GoogleIcon, MetaMaskIcon } from '../icons';
import type { UserRole, School } from '../../types';
import { kenyanCounties } from '../../data/counties';
import { countyCodes } from '../../data/countyCodes';
import { getSchoolsByCounty, addSchool } from '../../services/schoolService';


export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // State for teacher/officer sign-up flow
  const [county, setCounty] = useState('');
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolId, setSchoolId] = useState<string | ''>('');
  const [schoolSearch, setSchoolSearch] = useState('');
  const [isSubmittingSchool, setIsSubmittingSchool] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);
  const schoolInputContainerRef = useRef<HTMLDivElement>(null);

  const { signIn, signUp, signInWithGoogle, signInWithWallet } = useAuth();

  useEffect(() => {
    // Reset role-specific fields when switching role or view
    if (role !== 'TEACHER' && role !== 'SCHOOL_HEAD' || isLogin) {
        setSchoolId('');
        setSchools([]);
        setSchoolSearch('');
    }
    if (role !== 'COUNTY_OFFICER' && role !== 'TEACHER' && role !== 'SCHOOL_HEAD') {
        setCounty('');
    }
    setError(null);
    setInfoMessage(null);
  }, [role, isLogin]);

  useEffect(() => {
    const fetchSchools = async () => {
        if (county) {
            setIsLoading(true);
            try {
                const schoolData = await getSchoolsByCounty(county);
                setSchools(schoolData);
            } catch (err: any) {
                setError(err.message || "Failed to load schools.");
            } finally {
                setIsLoading(false);
            }
        } else {
            setSchools([]);
        }
    };
    if (!isLogin && (role === 'TEACHER' || role === 'SCHOOL_HEAD')) {
        fetchSchools();
    }
  }, [county, isLogin, role]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (schoolInputContainerRef.current && !schoolInputContainerRef.current.contains(event.target as Node)) {
        setIsSchoolDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddSchool = async (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName || !county) return;
    
    setIsSubmittingSchool(true);
    setError(null);
    setInfoMessage(null);
    
    try {
      const school = await addSchool(trimmedName, county);
      const schoolExistedInLocalList = schools.some(s => s.id === school.id);

      if (!schoolExistedInLocalList) {
        const updatedSchools = [...schools, school].sort((a, b) => a.name.localeCompare(b.name));
        setSchools(updatedSchools);
        setInfoMessage(`Successfully added and selected "${school.name}".`);
      } else {
        setInfoMessage(`"${school.name}" already exists and has been selected.`);
      }

      setSchoolId(school.id);
      setSchoolSearch(school.name);
      setIsSchoolDropdownOpen(false);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmittingSchool(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!isLogin && (role === 'TEACHER' || role === 'SCHOOL_HEAD') && !schoolId) {
        setError("Please select your school to complete registration.");
        return;
    }
    if (!isLogin && role === 'COUNTY_OFFICER' && !county) {
        setError("Please select your county to complete registration.");
        return;
    }
    
    setIsLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        let displayName: string | undefined = undefined;
        if (role !== 'STUDENT' && county) {
            const countyCode = countyCodes[county] || '00';
            const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
            const rolePrefix = role.replace('_', '').toUpperCase();
            displayName = `${rolePrefix}${countyCode}${randomSuffix}`;
        }
        
        await signUp(email, password, role, displayName, schoolId || undefined, county || undefined);
        setInfoMessage('Account created successfully! Please check your email to verify your account before signing in.');
        setIsLogin(true); // Switch to login view after successful sign up
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setInfoMessage(null);
    try {
        await signInWithGoogle();
    } catch (err: any) {
        setError(err.message || 'Failed to sign in with Google.');
    }
  };
  
  const handleMetaMaskSignIn = async () => {
    setError(null);
    setInfoMessage(null);
    // @ts-ignore
    if (typeof window.ethereum === 'undefined') {
        setError('MetaMask is not installed. Please install it to continue.');
        return;
    }

    try {
        // @ts-ignore
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        if (account) {
            await signInWithWallet(account);
        } else {
            setError('Could not get account from MetaMask. Please try again.');
        }
    } catch (err: any) {
        if (err.code === 4001) { // EIP-1193 userRejectedRequest error
            setError('You rejected the connection request in MetaMask.');
        } else {
            setError(err.message || 'Failed to connect with MetaMask.');
        }
    }
  };

  const filteredSchools = schools.filter(s => s.name.toLowerCase().includes(schoolSearch.toLowerCase()));

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
            <div className="inline-flex items-center justify-center">
                <SyncsentaIcon className="w-8 h-8 mr-2 text-indigo-500" />
                <h1 className="text-3xl font-bold text-slate-800">SyncSenta</h1>
            </div>
            <p className="mt-2 text-slate-500">
                {isLogin ? 'Welcome back!' : 'Create your account'}
            </p>
        </div>

        {infoMessage && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md text-center">{infoMessage}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-700">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="password"className="text-sm font-medium text-slate-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          {!isLogin && (
            <>
              <div>
                <label htmlFor="role" className="text-sm font-medium text-slate-700">I am a...</label>
                <select
                  id="role"
                  name="role"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="SCHOOL_HEAD">School Head</option>
                  <option value="COUNTY_OFFICER">County Officer</option>
                </select>
              </div>

              {(role === 'TEACHER' || role === 'SCHOOL_HEAD' || role === 'COUNTY_OFFICER') && (
                <div className="space-y-4 p-4 border rounded-md bg-slate-50">
                  <div>
                    <label htmlFor="county" className="text-sm font-medium text-slate-700">County</label>
                    <select id="county" value={county} onChange={e => { setCounty(e.target.value); setSchoolId(''); setSchoolSearch(''); setSchools([]); }} className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">Select a county</option>
                        {kenyanCounties.sort().map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {(role === 'TEACHER' || role === 'SCHOOL_HEAD') && county && (
                    <div className="relative" ref={schoolInputContainerRef}>
                      <label htmlFor="school" className="text-sm font-medium text-slate-700">School</label>
                      <input 
                        id="school" 
                        type="text" 
                        placeholder="Search for your school" 
                        value={schoolSearch} 
                        onChange={e => { setSchoolSearch(e.target.value); setSchoolId(''); setIsSchoolDropdownOpen(true); }}
                        onFocus={() => setIsSchoolDropdownOpen(true)}
                        className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      />
                      
                      {isSchoolDropdownOpen && schoolSearch && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                           <ul>
                              {filteredSchools.map(s => (
                                <li key={s.id} onClick={() => { setSchoolId(s.id); setSchoolSearch(s.name); setIsSchoolDropdownOpen(false); }} className="px-3 py-2 cursor-pointer hover:bg-indigo-50 text-sm">
                                  {s.name}
                                </li>
                              ))}
                              {filteredSchools.length === 0 && schoolSearch.trim().length > 2 && !isSubmittingSchool && (
                                <li onClick={() => handleAddSchool(schoolSearch)} className="px-3 py-2 cursor-pointer hover:bg-indigo-50 text-sm text-indigo-600">
                                    Add "{schoolSearch.trim()}" as a new school
                                </li>
                              )}
                           </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 flex justify-center"
            >
              {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500">Or</span>
          </div>
        </div>

        <div className="space-y-3">
            <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex justify-center items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                <GoogleIcon className="w-5 h-5 mr-3" />
                Continue with Google
            </button>
            <button
                type="button"
                onClick={handleMetaMaskSignIn}
                disabled={isLoading}
                className="w-full flex justify-center items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                <MetaMaskIcon className="w-5 h-5 mr-3" />
                Continue with MetaMask
            </button>
        </div>

        <p className="text-sm text-center text-slate-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => { setIsLogin(!isLogin); }} className="ml-1 font-medium text-indigo-600 hover:text-indigo-500">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};