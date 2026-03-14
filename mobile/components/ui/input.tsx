import React from "react";
import { TextInput, TextInputProps, View } from "react-native";

export interface InputProps extends TextInputProps {
    className?: string;
    error?: boolean;
}

export const Input = React.forwardRef<TextInput, InputProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <View className="w-full">
                <TextInput
                    ref={ref}
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${error ? "border-red-500" : "border-slate-200"
                        } text-slate-900 bg-white ${className || ""}`}
                    placeholderTextColor="#94a3b8"
                    {...props}
                />
            </View>
        );
    }
);

Input.displayName = "Input";
