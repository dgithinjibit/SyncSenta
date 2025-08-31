import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DataCard } from '../DataCard';
// FIX: Replaced non-existent AdminIcon with CountyOfficerIcon.
import { CountyOfficerIcon, StudentIcon, TeacherIcon, DashboardIcon } from '../icons';

const engagementData = [
  { name: 'Jan', engagement: 65 },
  { name: 'Feb', engagement: 59 },
  { name: 'Mar', engagement: 80 },
  { name: 'Apr', engagement: 81 },
  { name: 'May', engagement: 56 },
  { name: 'Jun', engagement: 72 },
];

const resourceData = [
  { name: 'Textbooks', available: 4000, needed: 5000 },
  { name: 'Laptops', available: 1200, needed: 2000 },
  { name: 'Projectors', available: 300, needed: 450 },
  { name: 'Lab Kits', available: 800, needed: 800 },
];

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        <DataCard icon={<StudentIcon className="w-6 h-6" />} title="Total Students" value="12,540" change="+5.2%" changeType="increase" />
        <DataCard icon={<TeacherIcon className="w-6 h-6" />} title="Active Teachers" value="873" change="+1.8%" changeType="increase" />
        <DataCard icon={<DashboardIcon className="w-6 h-6" />} title="Resource Availability" value="85%" change="-1.5%" changeType="decrease" />
        {/* FIX: Replaced non-existent AdminIcon with CountyOfficerIcon. */}
        <DataCard icon={<CountyOfficerIcon className="w-6 h-6" />} title="Compliance Rate" value="98.2%" change="+0.5%" changeType="increase" />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Student Engagement Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="engagement" fill="#4f46e5" name="Engagement (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Resource Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resourceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="available" stackId="a" fill="#4f46e5" name="Available" />
                <Bar dataKey="needed" stackId="a" fill="#a5b4fc" name="Total Needed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};