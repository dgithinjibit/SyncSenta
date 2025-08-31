import React from 'react';
import { AiTutor } from '../AiTutor';

export const StudentView: React.FC = () => {
    // In a real app, this would come from the user's school profile data.
    const schoolResourceLevel = 'low'; 

    return (
        <div className="h-full flex flex-col">
            <AiTutor resourceLevel={schoolResourceLevel} />
        </div>
    );
};