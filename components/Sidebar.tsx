import React from 'react';
import type { View, UserRole } from '../types';
import { DashboardIcon, CountyOfficerIcon, SchoolIcon, TeacherIcon, SyncsentaIcon } from './icons';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  userRole: UserRole;
}

const NavItem: React.FC<{
  view: View;
  currentView: View;
  setCurrentView: (view: View) => void;
  icon: React.ReactNode;
  label: string;
}> = ({ view, currentView, setCurrentView, icon, label }) => {
  const isActive = currentView === view;
  return (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-150 ${
        isActive
          ? 'text-white bg-indigo-600'
          : 'text-slate-300 hover:text-white hover:bg-slate-700'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {icon}
      <span className="ml-4">{label}</span>
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, userRole }) => {
  return (
    <aside className="z-20 hidden w-64 overflow-y-auto bg-slate-800 md:block flex-shrink-0">
      <div className="py-4 text-slate-400">
        <a className="ml-6 text-lg font-bold text-white flex items-center" href="#">
          <SyncsentaIcon className="w-6 h-6 mr-2 text-indigo-400" />
          SyncSenta
        </a>
        <nav className="mt-8" aria-label="Main Navigation">
          <ul>
            {(userRole === 'COUNTY_OFFICER' || userRole === 'SCHOOL_HEAD' || userRole === 'TEACHER') && (
              <li>
                <NavItem
                  view="DASHBOARD"
                  currentView={currentView}
                  setCurrentView={setCurrentView}
                  icon={<DashboardIcon className="w-5 h-5" />}
                  label="Dashboard"
                />
              </li>
            )}
            {userRole === 'COUNTY_OFFICER' && (
              <li>
                <NavItem
                  view="COUNTY_OFFICER"
                  currentView={currentView}
                  setCurrentView={setCurrentView}
                  icon={<CountyOfficerIcon className="w-5 h-5" />}
                  label="County Officer"
                />
              </li>
            )}
            {userRole === 'SCHOOL_HEAD' && (
              <li>
                <NavItem
                  view="SCHOOL_HEAD"
                  currentView={currentView}
                  setCurrentView={setCurrentView}
                  icon={<SchoolIcon className="w-5 h-5" />}
                  label="School Head"
                />
              </li>
            )}
            {(userRole === 'SCHOOL_HEAD' || userRole === 'TEACHER') && (
               <li>
                <NavItem
                  view="TEACHER"
                  currentView={currentView}
                  setCurrentView={setCurrentView}
                  icon={<TeacherIcon className="w-5 h-5" />}
                  label="Teacher"
                />
              </li>
            )}
          </ul>
        </nav>
      </div>
    </aside>
  );
};