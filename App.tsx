import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { LoadingSpinner } from './components/LoadingSpinner';
import type { View } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/views/DashboardView';
import { CountyOfficerView } from './components/views/AdminView';
import { SchoolHeadView } from './components/views/SchoolHeadView';
import { TeacherView } from './components/views/TeacherView';
import { StudentView } from './components/views/StudentView';
import { TeacherDashboardView } from './components/views/TeacherDashboardView';

const App: React.FC = () => {
  const { userData, loading } = useAuth();
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');

  useEffect(() => {
    if (userData) {
      // Set default view based on user role
      switch (userData.role) {
        case 'COUNTY_OFFICER':
          setCurrentView('COUNTY_OFFICER');
          break;
        case 'SCHOOL_HEAD':
            setCurrentView('SCHOOL_HEAD');
            break;
        case 'TEACHER':
          setCurrentView('TEACHER');
          break;
        case 'STUDENT':
          setCurrentView('STUDENT');
          break;
        default:
          setCurrentView('DASHBOARD');
      }
    }
  }, [userData]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!userData) {
    return <AuthPage />;
  }

  const { role, email, displayName } = userData;

  if (role === 'STUDENT') {
    return (
      <div className="flex h-screen bg-slate-100 font-sans">
        <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-8">
          <StudentView />
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        if (role === 'TEACHER') {
          return <TeacherDashboardView />;
        }
        return <DashboardView />;
      case 'COUNTY_OFFICER':
        return role === 'COUNTY_OFFICER' ? <CountyOfficerView /> : <DashboardView />;
       case 'SCHOOL_HEAD':
        return (role === 'COUNTY_OFFICER' || role === 'SCHOOL_HEAD') ? <SchoolHeadView /> : <DashboardView />;
      case 'TEACHER':
        return (role === 'SCHOOL_HEAD' || role === 'TEACHER') ? <TeacherView /> : <DashboardView />;
      default:
        return <DashboardView />;
    }
  };

  const viewTitle = currentView.charAt(0) + currentView.slice(1).toLowerCase().replace('_', ' ');

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        userRole={role}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header viewTitle={viewTitle} userEmail={email} displayName={displayName} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-6 md:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
