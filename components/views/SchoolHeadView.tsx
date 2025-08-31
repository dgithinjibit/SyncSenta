import React, { useState, useEffect } from 'react';
import { DataCard } from '../DataCard';
import { SparklesIcon, TeacherIcon, StudentIcon, MegaphoneIcon, PlusIcon } from '../icons';
import { getSchoolHeadReport } from '../../services/geminiService';
import { getSchoolData } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import type { Resource, Announcement } from '../../types';

const getStatusColor = (status: Resource['status']) => {
    switch (status) {
        case 'Available': return 'bg-green-100 text-green-800';
        case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
        case 'Out of Stock': return 'bg-red-100 text-red-800';
    }
}

interface SchoolData {
    complianceStatus: { value: number; change: number };
    learningPulse: { status: string; topic: string };
    studentTeacherRatio: { value: number; change: number };
    resourceStatus: { value: number; summary: string };
    resources: Resource[];
}

export const SchoolHeadView: React.FC = () => {
    const { userData } = useAuth();
    const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);

    const [query, setQuery] = useState('');
    const [report, setReport] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // New state for announcements
    const [announcements, setAnnouncements] = useState<Announcement[]>([
        { id: 1, text: "Staff meeting tomorrow at 8 AM in the library.", date: new Date(Date.now() - 86400000).toISOString() },
        { id: 2, text: "Please submit Grade 8 final marks by end of day Friday.", date: new Date(Date.now() - 172800000).toISOString() },
    ]);
    const [newAnnouncement, setNewAnnouncement] = useState('');
    
    const handleAddAnnouncement = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAnnouncement.trim()) return;
        const announcement: Announcement = {
            id: Date.now(),
            text: newAnnouncement.trim(),
            date: new Date().toISOString(),
        };
        setAnnouncements([announcement, ...announcements]);
        setNewAnnouncement('');
    };


    useEffect(() => {
        const fetchSchoolData = async () => {
            if (userData?.schoolId) {
                setIsDataLoading(true);
                try {
                    const data = await getSchoolData(userData.schoolId);
                    setSchoolData(data);
                } catch (error) {
                    console.error("Failed to fetch school data:", error);
                } finally {
                    setIsDataLoading(false);
                }
            }
        };
        fetchSchoolData();
    }, [userData?.schoolId]);

    const handleAnalyze = async () => {
        if (!query.trim() || !schoolData) return;
        setIsLoading(true);
        setReport('');
        const context = `School Operational Data: ${JSON.stringify(schoolData)}`;
        const result = await getSchoolHeadReport(query, context);
        setReport(result);
        setIsLoading(false);
    };
    
    const formatAnnouncementDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
        if (diffSeconds < 60) return `${diffSeconds}s ago`;
        const diffMinutes = Math.round(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        const diffHours = Math.round(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (isDataLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="ml-3 text-slate-500">Loading school data...</p>
            </div>
        )
    }

    if (!schoolData) {
        return <div className="text-center text-slate-500">Could not load school data. Please ensure you are assigned to a school.</div>
    }

    const { complianceStatus, learningPulse, studentTeacherRatio, resourceStatus, resources } = schoolData;

    return (
        <div className="space-y-8">
            <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
                <DataCard icon={<StudentIcon className="w-6 h-6" />} title="Compliance Status" value={`${complianceStatus.value}%`} change={`${complianceStatus.change > 0 ? '+' : ''}${complianceStatus.change}%`} changeType={complianceStatus.change > 0 ? 'increase' : 'decrease'} />
                <DataCard icon={<SparklesIcon className="w-6 h-6" />} title="Learning Pulse" value={learningPulse.status} change={learningPulse.topic} changeType="decrease" />
                <DataCard icon={<TeacherIcon className="w-6 h-6" />} title="Student-Teacher Ratio" value={`${studentTeacherRatio.value}:1`} change={`+${studentTeacherRatio.change}`} changeType="decrease" />
                <DataCard icon={<StudentIcon className="w-6 h-6" />} title="Resource Status" value={`${resourceStatus.value}%`} change={resourceStatus.summary} changeType="decrease" />
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                 <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                        <SparklesIcon className="w-6 h-6 mr-2 text-indigo-500" />
                        AI Operational Consultant
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">Ask questions to connect operational data with learning impact.</p>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., How does our student-teacher ratio impact math scores?"
                            className="flex-grow p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                             {isLoading ? 'Analyzing...' : 'Get Insights'}
                        </button>
                    </div>
                     {report && (
                         <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-md">
                            <p className="text-slate-700 whitespace-pre-wrap font-mono text-sm">{report}</p>
                        </div>
                    )}
                </div>
                
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                       <MegaphoneIcon className="w-5 h-5 mr-2 text-slate-600" />
                        School Announcements
                    </h3>
                    <ul className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                        {announcements.map(item => (
                            <li key={item.id} className="p-2 rounded-md bg-slate-50 text-sm">
                                <p className="text-slate-800">{item.text}</p>
                                <p className="text-xs text-slate-400 mt-1">{formatAnnouncementDate(item.date)}</p>
                            </li>
                        ))}
                    </ul>
                    <form onSubmit={handleAddAnnouncement} className="flex space-x-2 border-t pt-4">
                        <input
                            type="text"
                            value={newAnnouncement}
                            onChange={(e) => setNewAnnouncement(e.target.value)}
                            placeholder="New announcement..."
                            className="flex-grow p-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                        <button type="submit" className="p-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                           <PlusIcon className="w-5 h-5"/>
                        </button>
                    </form>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">School Resource Inventory</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Resource Name</th>
                                <th scope="col" className="px-6 py-3">Quantity</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resources.map(res => (
                                <tr key={res.id} className="bg-white border-b hover:bg-slate-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{res.name}</th>
                                    <td className="px-6 py-4">{res.quantity}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(res.status)}`}>
                                            {res.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};