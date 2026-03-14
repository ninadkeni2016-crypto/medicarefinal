import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';

export interface ButtonProps extends TouchableOpacityProps {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    textClass?: string;
    children: React.ReactNode;
}

export const Button = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, ButtonProps>(
    ({ className, variant = 'default', size = 'default', textClass, children, ...props }, ref) => {

        // Base classes
        let buttonClass = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ';
        let labelClass = 'text-sm font-medium ';

        // Variants
        switch (variant) {
            case 'default':
                buttonClass += 'bg-slate-900 ';
                labelClass += 'text-slate-50 ';
                break;
            case 'destructive':
                buttonClass += 'bg-red-500 ';
                labelClass += 'text-slate-50 ';
                break;
            case 'outline':
                buttonClass += 'border border-slate-200 bg-white ';
                labelClass += 'text-slate-900 ';
                break;
            case 'secondary':
                buttonClass += 'bg-slate-100 ';
                labelClass += 'text-slate-900 ';
                break;
            case 'ghost':
                buttonClass += 'bg-transparent ';
                labelClass += 'text-slate-900 ';
                break;
            case 'link':
                buttonClass += 'underline-offset-4 ';
                labelClass += 'text-slate-900 underline ';
                break;
        }

        // Sizes
        switch (size) {
            case 'default':
                buttonClass += 'h-10 px-4 py-2 ';
                break;
            case 'sm':
                buttonClass += 'h-9 rounded-md px-3 ';
                break;
            case 'lg':
                buttonClass += 'h-11 rounded-md px-8 ';
                break;
            case 'icon':
                buttonClass += 'h-10 w-10 p-0 ';
                break;
        }

        return (
            <TouchableOpacity
                ref={ref}
                className={`${buttonClass} ${className || ''}`}
                {...props}
            >
                <Text className={`${labelClass} ${textClass || ''}`}>{children}</Text>
            </TouchableOpacity>
        );
    }
);
Button.displayName = 'Button';
