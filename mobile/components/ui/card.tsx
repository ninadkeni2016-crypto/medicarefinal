import React from "react";
import { View, Text, ViewProps, TextProps, Platform } from "react-native";

export const Card = React.forwardRef<View, ViewProps>(({ className, style, ...props }, ref) => (
    <View
        ref={ref}
        style={[{
            ...Platform.select({
                ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
                android: { elevation: 1 },
                web: { boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }
            })
        }, style]}
        className={`rounded-lg border border-border bg-card ${className || ""}`}
        {...props}
    />
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef<View, ViewProps>(
    ({ className, ...props }, ref) => (
        <View
            ref={ref}
            className={`flex flex-col space-y-1.5 p-5 ${className || ""}`}
            {...props}
        />
    )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<Text, TextProps>(
    ({ className, ...props }, ref) => (
        <Text
            ref={ref}
            className={`text-lg font-semibold tracking-tight text-text-primary ${className || ""}`}
            {...props}
        />
    )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<Text, TextProps>(
    ({ className, ...props }, ref) => (
        <Text
            ref={ref}
            className={`text-sm text-text-secondary font-normal ${className || ""}`}
            {...props}
        />
    )
);
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<View, ViewProps>(
    ({ className, ...props }, ref) => (
        <View ref={ref} className={`p-5 pt-0 ${className || ""}`} {...props} />
    )
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<View, ViewProps>(
    ({ className, ...props }, ref) => (
        <View
            ref={ref}
            className={`flex flex-row items-center p-5 pt-0 ${className || ""}`}
            {...props}
        />
    )
);
CardFooter.displayName = "CardFooter";
