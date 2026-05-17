import React from 'react';
import { HelpCircle } from 'lucide-react';
import { ICON_MAP } from '../../config/constants';

const DynamicIcon = ({ name, className }) => {
    // If it's a known string name, return the mapped Lucide icon
    const IconComponent = typeof name === 'string' ? (ICON_MAP[name] || HelpCircle) : HelpCircle;
    
    // If it's already a React element, return it directly
    if (React.isValidElement(name)) return name;
    
    return <IconComponent className={className} />;
};

export default DynamicIcon;
