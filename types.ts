export type View = 'DASHBOARD' | 'COUNTY_OFFICER' | 'SCHOOL_HEAD' | 'TEACHER' | 'STUDENT';

export type UserRole = 'COUNTY_OFFICER' | 'SCHOOL_HEAD' | 'TEACHER' | 'STUDENT';

export interface School {
  id: string;
  name: string;
  county: string;
}

export interface UserData {
  uid: string;
  email: string | null;
  displayName?: string;
  role: UserRole;
  schoolId?: string;
  schoolName?: string;
  county?: string;
}

export interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export interface Resource {
    id: string;
    name: string;
    category: 'Textbooks' | 'Digital Devices' | 'Lab Equipment' | 'Stationery';
    quantity: number;
    status: 'Available' | 'Low Stock' | 'Out of Stock';
}

export interface Class {
    id: number;
    name: string;
    students: number;
    avgPerformance: number;
}

export interface Task {
    id: number;
    task: string;
    class: string;
    dueDate: string;
    completed: boolean;
}

export interface TeacherResource {
    id: string;
    type: 'file' | 'link';
    name: string;
}

export interface TeacherDashboardData {
    classes: Class[];
    tasks: Task[];
    schoolHeadName?: string;
    countyOfficerName?: string;
}

export interface StudentForRegister {
    id: number;
    name: string;
}

export interface Announcement {
    id: number;
    text: string;
    date: string;
}

export interface Initiative {
    id: number;
    title: string;
    status: 'Active' | 'Completed';
}
