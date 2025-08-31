import React from 'react';

interface DataCardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
    change?: string;
    changeType?: 'increase' | 'decrease';
}

export const DataCard: React.FC<DataCardProps> = ({ icon, title, value, change, changeType }) => {
    const changeColor = changeType === 'increase' ? 'text-green-500' : 'text-red-500';
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full mr-4">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <div className="flex items-center">
                    <p className="text-2xl font-bold text-slate-800">{value}</p>
                    {change && (
                        <span className={`ml-2 text-sm font-semibold ${changeColor}`}>{change}</span>
                    )}
                </div>
            </div>
        </div>
    );
};
