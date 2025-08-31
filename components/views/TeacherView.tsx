import React, { useState, useEffect, useRef } from 'react';
import { createTeacherAssistantChat } from '../../services/geminiService';
import { getTeacherData } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import type { TeacherDashboardData, Task, TeacherResource, Message, Class, StudentForRegister } from '../../types';
import type { Chat } from '@google/genai';
import { SparklesIcon, CountyOfficerIcon, SchoolIcon, UploadIcon, LinkIcon, TrashIcon, TeacherIcon, ClipboardListIcon, ArrowLeftIcon, PlusIcon } from '../icons';

// Mock student names for the register
const studentNames = [
    "Juma Otieno", "Asha Wanjiru", "Peter Musyoka", "Fatuma Ali", "David Kiprop",
    "Mary Akinyi", "Samuel Maina", "Esther Nafula", "Brian Kibet", "Catherine Mwende",
    "Joseph Kariuki", "Rehema Yusuf", "Daniel Mutua", "Grace Wangari", "Kevin Omondi"
];

const generateMockStudents = (classId: number, studentCount: number): StudentForRegister[] => {
    const seededStudents: StudentForRegister[] = [];
    // Use a simple seeding mechanism to get consistent student lists per class
    for (let i = 0; i < studentCount; i++) {
        const nameIndex = (classId * 3 + i * 5) % studentNames.length;
        seededStudents.push({
            id: (classId * 100) + i,
            name: studentNames[nameIndex],
        });
    }
    return seededStudents.sort((a,b) => a.name.localeCompare(b.name));
};


export const TeacherView: React.FC = () => {
    const { userData } = useAuth();
    const [teacherData, setTeacherData] = useState<TeacherDashboardData | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<'classes' | 'tasks' | 'ai'>('classes');
    
    // Local state for interactive elements
    const [classes, setClasses] = useState<Class[]>([]);
    const [newClassName, setNewClassName] = useState('');
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [mockStudents, setMockStudents] = useState<StudentForRegister[]>([]);
    const [attendance, setAttendance] = useState<Record<number, { morning: boolean, evening: boolean }>>({});
    
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState('');
    const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);
    const [resources, setResources] = useState<TeacherResource[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // AI Assistant State
    const [aiChat, setAiChat] = useState<Chat | null>(null);
    const [aiMessages, setAiMessages] = useState<Message[]>([]);
    const [aiInput, setAiInput] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const aiMessagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchTeacherData = async () => {
            if (userData?.uid) {
                setIsDataLoading(true);
                try {
                    const data = await getTeacherData(userData.uid);
                    setTeacherData(data);
                    setTasks(data.tasks);
                    setClasses(data.classes);
                } catch (error) {
                    console.error("Failed to fetch teacher data:", error);
                } finally {
                    setIsDataLoading(false);
                }
            }
        };
        fetchTeacherData();
    }, [userData?.uid]);
    
    useEffect(() => {
        try {
            const chatSession = createTeacherAssistantChat();
            setAiChat(chatSession);
            setAiMessages([{ sender: 'ai', text: "Hello! I'm your AI Teaching Assistant. How can I help you with your lessons today?" }]);
        } catch (error) {
            console.error("Failed to initialize AI Assistant:", error);
            setAiMessages([{ sender: 'ai', text: "Sorry, the AI assistant couldn't be loaded. Please ensure the API key is configured correctly." }]);
        }
    }, []);

    useEffect(() => {
        if (selectedClass) {
            setMockStudents(generateMockStudents(selectedClass.id, selectedClass.students));
            // Reset attendance when class changes
            setAttendance({});
        } else {
            setMockStudents([]);
        }
    }, [selectedClass]);

    useEffect(() => {
        aiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [aiMessages]);
    
    const handleAddNewClass = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClassName.trim()) return;
        const newClass: Class = {
            id: Date.now(),
            name: newClassName.trim(),
            students: Math.floor(Math.random() * 15) + 20, // Random students between 20-35
            avgPerformance: Math.floor(Math.random() * 20) + 70, // Random performance 70-90
        };
        setClasses([newClass, ...classes]);
        setNewClassName('');
    };

    const handleAttendanceChange = (studentId: number, session: 'morning' | 'evening') => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [session]: !prev[studentId]?.[session],
            },
        }));
    };

    const handleToggleTask = (taskId: number) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
            )
        );
    };

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim() || !newDueDate) return;
        const newTaskObject: Task = {
            id: Date.now(),
            task: newTask.trim(),
            class: 'General',
            dueDate: newDueDate,
            completed: false,
        };
        setTasks([newTaskObject, ...tasks]);
        setNewTask('');
        setNewDueDate(new Date().toISOString().split('T')[0]);
    };

    const handleAddFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const newResource: TeacherResource = { id: `file-${Date.now()}`, type: 'file', name: file.name };
            setResources([...resources, newResource]);
        }
        event.target.value = '';
    };

    const handleAddLink = () => {
        const url = prompt("Please enter the URL:");
        if (url && url.trim()) {
             const newResource: TeacherResource = { id: `link-${Date.now()}`, type: 'link', name: url.trim() };
            setResources([...resources, newResource]);
        }
    };
    
    const handleRemoveResource = (resourceId: string) => {
        setResources(resources.filter(r => r.id !== resourceId));
    };
    
    const handleSendAiMessage = async () => {
        if (!aiInput.trim() || !aiChat || isAiLoading) return;

        const userMessage: Message = { sender: 'user', text: aiInput };
        setAiMessages(prev => [...prev, userMessage]);
        setAiInput('');
        setIsAiLoading(true);

        try {
            const response = await aiChat.sendMessage({ message: userMessage.text });
            const aiMessage: Message = { sender: 'ai', text: response.text };
            setAiMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Error sending AI message:", error);
            const errorMessage: Message = { sender: 'ai', text: 'I seem to be having trouble thinking. Please try again.' };
            setAiMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsAiLoading(false);
        }
    };

    const formatDueDate = (dueDate: string) => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
            const date = new Date(dueDate + 'T00:00:00');
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
            if (date.getTime() === today.getTime()) return 'Today';
            if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
            const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
            if (date.getFullYear() !== today.getFullYear()) formatOptions.year = 'numeric';
            return new Intl.DateTimeFormat('en-US', formatOptions).format(date);
        }
        return dueDate;
    };

    if (isDataLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="ml-3 text-slate-500">Loading your dashboard...</p>
            </div>
        )
    }

    if (!teacherData) {
        return <div className="text-center text-slate-500">Could not load teacher data.</div>
    }
    
    const TabButton: React.FC<{ tabName: typeof activeTab; label: string; icon: React.ReactNode; }> = ({ tabName, label, icon }) => (
      <button
        onClick={() => setActiveTab(tabName)}
        className={`flex-1 flex items-center justify-center p-3 text-sm font-medium border-b-2 transition-colors ${
          activeTab === tabName
            ? 'border-indigo-600 text-indigo-600'
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
        }`}
      >
        {icon}
        <span className="ml-2">{label}</span>
      </button>
    );

    const renderClassRegister = () => (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <button onClick={() => setSelectedClass(null)} className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-4">
                <ArrowLeftIcon className="w-4 h-4 mr-2"/>
                Back to All Classes
            </button>
            <h3 className="text-xl font-bold text-slate-800 mb-1">{selectedClass?.name} Register</h3>
            <p className="text-slate-500 mb-6">Today's Date: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Morning Attendance */}
                <div>
                    <h4 className="font-semibold text-slate-700 border-b pb-2 mb-3">Morning Session</h4>
                    <ul className="space-y-2 max-h-96 overflow-y-auto">
                        {mockStudents.map(student => (
                            <li key={student.id} className="flex items-center p-2 rounded-md hover:bg-slate-50">
                                <input
                                    type="checkbox"
                                    id={`morning-${student.id}`}
                                    checked={!!attendance[student.id]?.morning}
                                    onChange={() => handleAttendanceChange(student.id, 'morning')}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor={`morning-${student.id}`} className="ml-3 text-sm font-medium text-slate-800">{student.name}</label>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Evening Attendance */}
                <div>
                    <h4 className="font-semibold text-slate-700 border-b pb-2 mb-3">Evening Session</h4>
                    <ul className="space-y-2 max-h-96 overflow-y-auto">
                        {mockStudents.map(student => (
                            <li key={student.id} className="flex items-center p-2 rounded-md hover:bg-slate-50">
                                <input
                                    type="checkbox"
                                    id={`evening-${student.id}`}
                                    checked={!!attendance[student.id]?.evening}
                                    onChange={() => handleAttendanceChange(student.id, 'evening')}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor={`evening-${student.id}`} className="ml-3 text-sm font-medium text-slate-800">{student.name}</label>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
    
    const renderContent = () => {
        if (activeTab === 'classes' && selectedClass) {
            return renderClassRegister();
        }
        
        switch (activeTab) {
            case 'classes':
                return (
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-slate-700 mb-4">My Classes</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                {classes.map(c => (
                                    <div key={c.id} onClick={() => setSelectedClass(c)} className="p-4 border rounded-md hover:bg-slate-50 transition cursor-pointer">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-slate-800">{c.name}</p>
                                            <span className="text-sm font-bold text-indigo-600">{c.avgPerformance}%</span>
                                        </div>
                                        <p className="text-sm text-slate-500">{c.students} students</p>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleAddNewClass} className="flex space-x-2 border-t pt-4">
                                <input type="text" value={newClassName} onChange={e => setNewClassName(e.target.value)} placeholder="Add a new class name..." className="flex-grow p-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500" required />
                                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Add Class</button>
                            </form>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-slate-700 mb-4">My Administration</h3>
                             <div className="flex space-x-8">
                                {teacherData.schoolHeadName && (
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 bg-slate-100 rounded-full p-2"> <SchoolIcon className="w-5 h-5 text-slate-600" /> </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-slate-500">School Head</p>
                                            <p className="font-medium text-slate-800">{teacherData.schoolHeadName}</p>
                                        </div>
                                    </div>
                                )}
                                {teacherData.countyOfficerName && (
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 bg-slate-100 rounded-full p-2"> <CountyOfficerIcon className="w-5 h-5 text-slate-600" /> </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-slate-500">County Officer</p>
                                            <p className="font-medium text-slate-800">{teacherData.countyOfficerName}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'tasks':
                return (
                     <div className="grid lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-slate-700 mb-4">Upcoming Tasks</h3>
                            <form onSubmit={handleAddTask} className="space-y-3 mb-4">
                                <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add a new task..." className="w-full p-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500" required />
                                <div className="flex items-center space-x-2">
                                    <input type="date" value={newDueDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setNewDueDate(e.target.value)} className="flex-grow p-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500" required aria-label="Due date" />
                                    <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Add</button>
                                </div>
                            </form>
                            <ul className="space-y-3 max-h-96 overflow-y-auto">
                                {tasks.map(task => (
                                    <li key={task.id} className="flex items-start">
                                        <input type="checkbox" checked={task.completed} onChange={() => handleToggleTask(task.id)} className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                        <div className="ml-3">
                                            <p className={`font-medium text-slate-800 ${task.completed ? 'line-through text-slate-400' : ''}`}>{task.task}</p>
                                            <p className={`text-sm text-slate-500 ${task.completed ? 'line-through' : ''}`}>{task.class} &middot; Due: {formatDueDate(task.dueDate)}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-slate-700 mb-4">My Resources</h3>
                            <div className="flex space-x-2 mb-4">
                                <input type="file" ref={fileInputRef} onChange={handleAddFile} className="hidden" />
                                <button onClick={() => fileInputRef.current?.click()} className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition"> <UploadIcon className="w-4 h-4 mr-2" /> Upload </button>
                                <button onClick={handleAddLink} className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition"> <LinkIcon className="w-4 h-4 mr-2" /> Add Link </button>
                            </div>
                            <ul className="space-y-2 max-h-48 overflow-y-auto">
                                {resources.map(res => (
                                    <li key={res.id} className="flex items-center justify-between p-2 rounded-md bg-slate-50 text-sm">
                                        <div className="flex items-center truncate">
                                            {res.type === 'file' ? <UploadIcon className="w-4 h-4 mr-2 text-slate-500 flex-shrink-0" /> : <LinkIcon className="w-4 h-4 mr-2 text-slate-500 flex-shrink-0" />}
                                            <span className="truncate" title={res.name}>{res.name}</span>
                                        </div>
                                        <button onClick={() => handleRemoveResource(res.id)} className="ml-2 p-1 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-500"> <TrashIcon className="w-4 h-4" /> </button>
                                    </li>
                                ))}
                                {resources.length === 0 && <p className="text-center text-xs text-slate-400 pt-2">No resources added yet.</p>}
                            </ul>
                        </div>
                     </div>
                );
            case 'ai':
                 return (
                    <div className="bg-white rounded-lg shadow-md h-[calc(100vh-12rem)] flex flex-col">
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            {aiMessages.map((msg, index) => (
                              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-md lg:max-w-xl px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                </div>
                              </div>
                            ))}
                            {isAiLoading && (
                               <div className="flex justify-start">
                                 <div className="max-w-md px-4 py-2 rounded-lg bg-slate-100 text-slate-800 flex items-center">
                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></div>
                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                                 </div>
                               </div>
                            )}
                            <div ref={aiMessagesEndRef} />
                        </div>
                        <div className="p-4 border-t bg-white">
                            <div className="flex space-x-2">
                              <input type="text" value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendAiMessage()} placeholder="Ask for a quiz, lesson plan, or idea..." className="flex-grow p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-slate-100" disabled={isAiLoading || !aiChat} />
                              <button onClick={handleSendAiMessage} disabled={isAiLoading || !aiInput.trim() || !aiChat} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed">Send</button>
                            </div>
                        </div>
                     </div>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="bg-white rounded-t-lg shadow-md">
                <nav className="flex" aria-label="Tabs">
                    <TabButton tabName="classes" label="My Classes" icon={<TeacherIcon className="w-5 h-5"/>} />
                    <TabButton tabName="tasks" label="Tasks & Resources" icon={<ClipboardListIcon className="w-5 h-5"/>} />
                    <TabButton tabName="ai" label="AI Assistant" icon={<SparklesIcon className="w-5 h-5"/>} />
                </nav>
            </div>
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};