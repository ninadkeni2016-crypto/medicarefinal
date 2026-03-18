import React from "react";
import { TextInput, TextInputProps, View, Text } from "react-native";

export interface InputProps extends TextInputProps {
    className?: string;
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<TextInput, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <View className="w-full mb-4">
                {label && (
                    <Text className="text-xs font-medium text-text-secondary mb-1.5 ml-1">
                        {label}
                    </Text>
                )}
                <TextInput
                    ref={ref}
                    className={`flex h-11 w-full rounded-lg border bg-white px-4 py-2 text-[15px] transition-all ${error ? "border-danger" : "border-border"
                        } text-text-primary ${className || ""}`}
                    placeholderTextColor="#94A3B8"
                    {...props}
                />
                {error && (
                    <Text className="text-[11px] font-medium text-danger mt-1 ml-1">
                        {error}
                    </Text>
                )}
            </View>
        );
    }
);

Input.displayName = "Input";
