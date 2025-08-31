import type { Resource, Class, Task, TeacherDashboardData } from '../types';

// ============================================================================
// DATA SERVICE
// ============================================================================
// This service simulates fetching data from a backend like Supabase.
// In a real application, these functions would make authenticated API calls
// to fetch data relevant to the logged-in user. For now, they return
// consistent, structured mock data to power the UI and AI context.
// ============================================================================


/**
 * Simulates fetching aggregated data for an entire county.
 * @param county - The name of the county to fetch data for.
 */
export const getCountyData = async (county: string): Promise<{ resources: Resource[] }> => {
    console.log(`Fetching data for ${county} county...`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In a real app, this would query Supabase for all resources within the given county.
    const mockCountyResources: Resource[] = [
      { id: '1', name: 'Grade 8 Science Textbooks', category: 'Textbooks', quantity: 1500, status: 'Available' },
      { id: '2', name: 'County Chromebooks', category: 'Digital Devices', quantity: 320, status: 'Low Stock' },
      { id: '3', name: 'Chemistry Lab Kits', category: 'Lab Equipment', quantity: 90, status: 'Low Stock' },
      { id: '4', name: 'A4 Paper (Reams)', category: 'Stationery', quantity: 50, status: 'Out of Stock' },
      { id: '5', name: 'Grade 7 History Textbooks', category: 'Textbooks', quantity: 1800, status: 'Available' },
    ];
    
    return { resources: mockCountyResources };
};


/**
 * Simulates fetching operational data for a specific school.
 * @param schoolId - The UUID of the school to fetch data for.
 */
export const getSchoolData = async (schoolId: string): Promise<{
    complianceStatus: { value: number; change: number };
    learningPulse: { status: string; topic: string };
    studentTeacherRatio: { value: number; change: number };
    resourceStatus: { value: number; summary: string };
    resources: Resource[];
}> => {
    console.log(`Fetching data for school ID: ${schoolId}...`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, this data would be calculated from various tables in Supabase related to the schoolId.
    const mockResources: Resource[] = [
        { id: '1', name: 'Grade 8 Science Textbook', category: 'Textbooks', quantity: 230, status: 'Available' },
        { id: '2', name: 'Student Chromebook', category: 'Digital Devices', quantity: 45, status: 'Low Stock' },
        { id: '3', name: 'Microscope Kit', category: 'Lab Equipment', quantity: 15, status: 'Low Stock' },
        { id: '4', name: 'A4 Paper Ream', category: 'Stationery', quantity: 0, status: 'Out of Stock' },
    ];

    return {
        complianceStatus: { value: 85, change: -2 },
        learningPulse: { status: "Low Engagement", topic: "Geometry" },
        studentTeacherRatio: { value: 45, change: 3 },
        resourceStatus: { value: 70, summary: "Needs Review" },
        resources: mockResources,
    };
};

/**
 * Helper to get a date string in YYYY-MM-DD format.
 * @param offsetDays - Number of days to offset from today.
 */
const getDateString = (offsetDays: number = 0): string => {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString().split('T')[0];
};


/**
 * Simulates fetching data specific to a single teacher, including their administrators.
 * @param userId - The UUID of the teacher.
 */
export const getTeacherData = async (userId: string): Promise<TeacherDashboardData> => {
    console.log(`Fetching data for teacher ID: ${userId}...`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In a real app, this would query Supabase for classes and tasks assigned to the userId.
    const classes: Class[] = [
        { id: 1, name: 'Grade 8 - Science', students: 32, avgPerformance: 85 },
        { id: 2, name: 'Grade 7 - History', students: 28, avgPerformance: 78 },
        { id: 3, name: 'Grade 8 - Mathematics', students: 30, avgPerformance: 81 },
    ];
    const tasks: Task[] = [
        { id: 1, task: 'Grade Chapter 5 Quizzes', class: 'Grade 8 - Science', dueDate: getDateString(1), completed: false },
        { id: 2, task: 'Prepare lesson on The Roman Empire', class: 'Grade 7 - History', dueDate: getDateString(3), completed: false },
        { id: 3, task: 'Parent-Teacher Meeting', class: 'All Classes', dueDate: getDateString(7), completed: false },
    ];

    // In a real app, you would fetch the school based on the teacher's schoolId,
    // then find the user with the 'SCHOOL_HEAD' role for that school.
    // Similarly, you'd find the 'COUNTY_OFFICER' for the school's county.
    const schoolHeadName = "Mrs. Agnes Wanjiru";
    const countyOfficerName = "Mr. David Omondi";

    return { 
        classes, 
        tasks,
        schoolHeadName,
        countyOfficerName
    };
};