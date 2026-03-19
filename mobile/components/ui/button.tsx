import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, View, ActivityIndicator, Platform } from 'react-native';
import { Shadows } from '@/lib/theme';

export interface ButtonProps extends TouchableOpacityProps {
    variant?: 'primary' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    loading?: boolean;
    textClass?: string;
    children: React.ReactNode;
}

export const Button = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, ButtonProps>(
    ({ className, variant = 'primary', size = 'default', loading, textClass, children, disabled, style, ...props }, ref) => {

        // Base classes
        let buttonClass = 'inline-flex items-center justify-center rounded-xl transition-all active:scale-[0.98] ';
        let labelClass = 'font-semibold ';

        // Variant styles
        switch (variant) {
            case 'primary':
                buttonClass += 'bg-primary ';
                labelClass += 'text-white ';
                break;
            case 'destructive':
                buttonClass += 'bg-danger ';
                labelClass += 'text-white ';
                break;
            case 'outline':
                buttonClass += 'border border-border bg-white ';
                labelClass += 'text-text-primary ';
                break;
            case 'secondary':
                buttonClass += 'bg-slate-100 ';
                labelClass += 'text-text-primary ';
                break;
            case 'ghost':
                buttonClass += 'bg-transparent ';
                labelClass += 'text-text-primary ';
                break;
            case 'link':
                buttonClass += 'bg-transparent ';
                labelClass += 'text-primary underline ';
                break;
        }

        // Size styles
        switch (size) {
            case 'default':
                buttonClass += 'h-11 px-5 ';
                labelClass += 'text-[15px] ';
                break;
            case 'sm':
                buttonClass += 'h-9 px-3 ';
                labelClass += 'text-xs ';
                break;
            case 'lg':
                buttonClass += 'h-14 px-8 ';
                labelClass += 'text-base ';
                break;
            case 'icon':
                buttonClass += 'h-11 w-11 ';
                break;
        }

        if (disabled || loading) {
            buttonClass += 'opacity-50 ';
        }

        // Elevation: primary/secondary get light shadow; ghost/link get none
        const needsShadow = variant === 'primary' || variant === 'destructive' || variant === 'secondary' || variant === 'outline';
        const elevationStyle = needsShadow ? Shadows.sm : {};

        return (
            <TouchableOpacity
                ref={ref}
                disabled={disabled || loading}
                activeOpacity={0.82}
                className={`${buttonClass} ${className || ''}`}
                style={[elevationStyle as any, style]}
                {...props}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={variant === 'outline' || variant === 'ghost' ? '#2563EB' : '#FFFFFF'} />
                ) : (
                    <Text className={`${labelClass} ${textClass || ''}`}>{children}</Text>
                )}
            </TouchableOpacity>
        );
    }
);
Button.displayName = 'Button';
