import React, { useState, useEffect } from 'react';
import type { Resource, Initiative } from '../../types';
import { getCountyOfficerReport, getEquityAnalysis } from '../../services/geminiService';
import { addSchool } from '../../services/schoolService';
import { getCountyData } from '../../services/dataService';
import { kenyanCounties } from '../../data/counties';
import { SparklesIcon, TargetIcon, PlusIcon } from '../icons';
import { useAuth } from '../../context/AuthContext';

const getStatusColor = (status: Resource['status']) => {
    switch (status) {
        case 'Available': return 'bg-green-100 text-green-800';
        case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
        case 'Out of Stock': return 'bg-red-100 text-red-800';
    }
}

interface EquityItem {
    ward: string;
    resource: number;
    score: number;
}

const getColorForValue = (value: number) => {
    if (value > 80) return 'bg-green-500';
    if (value > 60) return 'bg-yellow-400';
    return 'bg-red-500';
}

export const CountyOfficerView: React.FC = () => {
    const { userData } = useAuth();
    const [query, setQuery] = useState('');
    const [report, setReport] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const [newSchoolName, setNewSchoolName] = useState('');
    const [newSchoolCounty, setNewSchoolCounty] = useState('');
    const [isAddingSchool, setIsAddingSchool] = useState(false);
    const [addSchoolMessage, setAddSchoolMessage] = useState({ type: '', text: '' });
    
    const [equityData, setEquityData] = useState<EquityItem[]>([]);
    const [isEquityLoading, setIsEquityLoading] = useState(true);

    const [countyData, setCountyData] = useState<{ resources: Resource[] } | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);
    
    // New state for initiatives
    const [initiatives, setInitiatives] = useState<Initiative[]>([
        { id: 1, title: "Digital Literacy Program Q3", status: 'Active' },
        { id: 2, title: "Textbook Distribution Drive Q2", status: 'Completed' },
    ]);
    const [newInitiative, setNewInitiative] = useState('');
    
    const handleAddInitiative = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newInitiative.trim()) return;
        const initiative: Initiative = {
            id: Date.now(),
            title: newInitiative.trim(),
            status: 'Active',
        };
        setInitiatives([initiative, ...initiatives]);
        setNewInitiative('');
    };

    useEffect(() => {
        const fetchCountyData = async () => {
            if (userData?.county) {
                setIsDataLoading(true);
                try {
                    const data = await getCountyData(userData.county);
                    setCountyData(data);
                } catch (error) {
                    console.error("Failed to fetch county data:", error);
                } finally {
                    setIsDataLoading(false);
                }
            }
        };
        fetchCountyData();
    }, [userData?.county]);

    useEffect(() => {
        const fetchEquityData = async () => {
            setIsEquityLoading(true);
            try {
                const context = `Current county resource data: ${JSON.stringify(countyData?.resources || [])}`;
                const data = await getEquityAnalysis(context);
                setEquityData(data);
            } catch (error) {
                console.error("Failed to fetch AI equity data:", error);
            } finally {
                setIsEquityLoading(false);
            }
        };
        if (countyData) {
            fetchEquityData();
        }
    }, [countyData]);


    const handleAnalyze = async () => {
        if (!query.trim() || !countyData) return;
        setIsLoading(true);
        setReport('');
        const context = `County data: ${JSON.stringify(countyData)}. Equity data (resource level % vs avg score %): ${JSON.stringify(equityData)}`;
        const result = await getCountyOfficerReport(query, context);
        setReport(result);
        setIsLoading(false);
    };
    
    const handleAddSchool = async (e: React.FormEvent) => {
        e.preventDefault();
        const countyForNewSchool = userData?.role === 'COUNTY_OFFICER' && userData.county ? userData.county : newSchoolCounty;

        if (!newSchoolName.trim() || !countyForNewSchool) {
            setAddSchoolMessage({ type: 'error', text: 'Please provide a school name and ensure a county is selected.' });
            return;
        }
        setIsAddingSchool(true);
        setAddSchoolMessage({ type: '', text: '' });
        try {
            await addSchool(newSchoolName, countyForNewSchool);
            setAddSchoolMessage({ type: 'success', text: `Successfully added ${newSchoolName}!` });
            setNewSchoolName('');
            if (!(userData?.role === 'COUNTY_OFFICER' && userData.county)) {
                setNewSchoolCounty('');
            }
            // TODO: In a real app, we would refetch the county data here to include the new school
            setTimeout(() => setAddSchoolMessage({ type: '', text: '' }), 5000);
        } catch (err: any) {
            setAddSchoolMessage({ type: 'error', text: err.message });
        } finally {
            setIsAddingSchool(false);
        }
    };


    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                    <SparklesIcon className="w-6 h-6 mr-2 text-indigo-500" />
                    AI Strategic Advisor
                </h3>
                <p className="text-sm text-slate-500 mb-4">Ask a question about county-wide resources or learning outcomes for an AI-driven analysis.</p>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., Recommend resource shifts to improve literacy in Ward C."
                        className="flex-grow p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        disabled={isLoading || isDataLoading}
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || isDataLoading || !countyData}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Analyze'}
                    </button>
                </div>
                {report && (
                     <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-md">
                        <p className="text-slate-700 whitespace-pre-wrap font-mono text-sm">{report}</p>
                    </div>
                )}
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">County-Wide Resource Inventory</h3>
                    {isDataLoading ? (
                        <div className="text-center text-slate-500">Loading resources...</div>
                    ) : (
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
                                {countyData?.resources.map(res => (
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
                    )}
                </div>
                
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Add a New School</h3>
                    <form onSubmit={handleAddSchool} className="space-y-4">
                        <div>
                            <label htmlFor="schoolName" className="block text-sm font-medium text-slate-700">School Name</label>
                            <input
                                type="text"
                                id="schoolName"
                                value={newSchoolName}
                                onChange={(e) => setNewSchoolName(e.target.value)}
                                placeholder="e.g., Nairobi Primary School"
                                className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        {!(userData?.role === 'COUNTY_OFFICER' && userData.county) ? (
                            <div>
                                <label htmlFor="schoolCounty" className="block text-sm font-medium text-slate-700">County</label>
                                <select
                                    id="schoolCounty"
                                    value={newSchoolCounty}
                                    onChange={(e) => setNewSchoolCounty(e.target.value)}
                                    className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select a county</option>
                                    {kenyanCounties.sort().map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        ) : (
                             <div className="p-2 bg-slate-100 rounded-md">
                                <p className="text-sm text-slate-600">County: <span className="font-semibold">{userData.county}</span></p>
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={isAddingSchool}
                            className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 flex justify-center"
                        >
                            {isAddingSchool ? 'Adding...' : 'Add School'}
                        </button>
                        {addSchoolMessage.text && (
                            <p className={`text-sm text-center ${addSchoolMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                                {addSchoolMessage.text}
                            </p>
                        )}
                    </form>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                        <TargetIcon className="w-5 h-5 mr-2 text-slate-600"/>
                        County-Wide Initiatives
                    </h3>
                    <ul className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                        {initiatives.map(item => (
                            <li key={item.id} className="flex items-center justify-between p-2 rounded-md bg-slate-50 text-sm">
                                <span className="font-medium text-slate-700">{item.title}</span>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.status === 'Active' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'}`}>{item.status}</span>
                            </li>
                        ))}
                    </ul>
                     <form onSubmit={handleAddInitiative} className="flex space-x-2">
                        <input
                            type="text"
                            value={newInitiative}
                            onChange={(e) => setNewInitiative(e.target.value)}
                            placeholder="New initiative title..."
                            className="flex-grow p-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                        <button type="submit" className="p-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                           <PlusIcon className="w-5 h-5"/>
                        </button>
                    </form>
                </div>


                 <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2 lg:col-span-3">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                        <SparklesIcon className="w-5 h-5 mr-2 text-indigo-500" />
                        AI-Powered Equity Heatmap
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">Correlation between resource availability and average student scores by ward.</p>
                     {isEquityLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="ml-3 text-slate-500">Generating AI analysis...</p>
                        </div>
                    ) : (
                    <div className="space-y-3">
                        <div className="flex font-bold text-xs text-slate-600">
                            <div className="w-1/3">Ward</div>
                            <div className="w-1/3 text-center">Resource Level</div>
                            <div className="w-1/3 text-center">Avg. Score</div>
                        </div>
                        {equityData.map(item => (
                            <div key={item.ward} className="flex items-center text-sm">
                                <div className="w-1/3 font-medium text-slate-800">{item.ward}</div>
                                <div className="w-1/3 flex justify-center items-center">
                                    <div className="w-2/3 bg-slate-200 rounded-full h-4">
                                        <div className={`${getColorForValue(item.resource)} h-4 rounded-full`} style={{ width: `${item.resource}%` }}></div>
                                    </div>
                                    <span className="ml-2 text-slate-600 text-xs">{item.resource}%</span>
                                </div>
                                <div className="w-1/3 flex justify-center items-center">
                                     <div className="w-2/3 bg-slate-200 rounded-full h-4">
                                        <div className={`${getColorForValue(item.score)} h-4 rounded-full`} style={{ width: `${item.score}%` }}></div>
                                    </div>
                                    <span className="ml-2 text-slate-600 text-xs">{item.score}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
};