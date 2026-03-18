import type React from 'react';

// Type stub for mobile compatibility — toast UI uses native Alert on mobile
export type ToastProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: 'default' | 'destructive';
  className?: string;
};

export type ToastActionElement = React.ReactElement;
