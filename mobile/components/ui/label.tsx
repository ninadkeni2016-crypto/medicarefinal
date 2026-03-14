import React from "react";
import { Text, TextProps } from "react-native";

export const Label = React.forwardRef<Text, TextProps>(
    ({ className, ...props }, ref) => (
        <Text
            ref={ref}
            className={`text-sm font-medium leading-none text-slate-900 ${className || ""
                }`}
            {...props}
        />
    )
);

Label.displayName = "Label";
