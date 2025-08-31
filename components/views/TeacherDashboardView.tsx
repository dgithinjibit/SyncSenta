import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { getTeacherData } from '../../services/dataService';
import type { TeacherDashboardData } from '../../types';
import { DataCard } from '../DataCard';
import { TeacherIcon, StudentIcon, CalendarIcon, SparklesIcon } from '../icons';

export const TeacherDashboardView: React.FC = () => {
    const { userData } = useAuth();
    const [dashboardData, setDashboardData] = useState<TeacherDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (userData?.uid) {
                setIsLoading(true);
                try {
                    const data = await getTeacherData(userData.uid);
                    setDashboardData(data);
                } catch (error) {
                    console.error("Failed to fetch teacher dashboard data:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchData();
    }, [userData?.uid]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="ml-3 text-slate-500">Loading your dashboard...</p>
            </div>
        );
    }

    if (!dashboardData) {
        return <div className="text-center text-slate-500">Could not load dashboard data.</div>;
    }

    const { classes, tasks } = dashboardData;
    const totalStudents = classes.reduce((sum, currentClass) => sum + currentClass.students, 0);
    const upcomingTasksCount = tasks.filter(task => !task.completed).length;
    
    // Calculate weighted average performance
    const totalWeightedPerformance = classes.reduce((sum, currentClass) => sum + currentClass.avgPerformance * currentClass.students, 0);
    const averagePerformance = totalStudents > 0 ? Math.round(totalWeightedPerformance / totalStudents) : 0;
    
    // Get the next 3 tasks that are not completed
    const nextTasks = tasks.filter(task => !task.completed).slice(0, 3);

    return (
        <div className="space-y-8">
            <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
                <DataCard icon={<TeacherIcon className="w-6 h-6" />} title="My Classes" value={String(classes.length)} />
                <DataCard icon={<StudentIcon className="w-6 h-6" />} title="Total Students" value={String(totalStudents)} />
                <DataCard icon={<CalendarIcon className="w-6 h-6" />} title="Upcoming Tasks" value={String(upcomingTasksCount)} />
                <DataCard icon={<SparklesIcon className="w-6 h-6" />} title="Average Performance" value={`${averagePerformance}%`} change={averagePerformance > 80 ? 'Excellent' : 'Good'} changeType="increase" />
            </div>

            <div className="grid gap-8 md:grid-cols-5">
                <div className="bg-white p-6 rounded-lg shadow-md md:col-span-3">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Class Performance Overview</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={classes} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis unit="%" />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="avgPerformance" fill="#4f46e5" name="Avg. Performance" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">What's Next?</h3>
                    {nextTasks.length > 0 ? (
                        <ul className="space-y-4">
                            {nextTasks.map(task => (
                                <li key={task.id} className="border-l-4 border-indigo-500 pl-4 py-1">
                                    <p className="font-medium text-slate-800">{task.task}</p>
                                    <p className="text-sm text-slate-500">{task.class} &middot; Due: {task.dueDate}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                             <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-green-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                            <p>No upcoming tasks. You're all caught up!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
