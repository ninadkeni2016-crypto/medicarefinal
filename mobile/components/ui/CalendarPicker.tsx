import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, spacing, radius, typography, Shadows } from '@/lib/theme';

interface CalendarPickerProps {
    onDateSelect: (dateStr: string) => void;
    selectedDate: string;
}

export const CalendarPicker = ({ onDateSelect, selectedDate }: CalendarPickerProps) => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const renderHeader = () => {
        return (
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity 
                        onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                        disabled={currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()}
                        style={[styles.navButton, (currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()) && { opacity: 0.3 }]}
                    >
                        <ChevronLeft size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                        style={styles.navButton}
                    >
                        <ChevronRight size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderDays = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (
            <View style={styles.daysHeader}>
                {days.map(day => (
                    <Text key={day} style={styles.dayText}>{day}</Text>
                ))}
            </View>
        );
    };

    const renderGrid = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const numDays = daysInMonth(year, month);
        const firstDay = firstDayOfMonth(year, month);
        const rows = [];
        let cells = [];

        // Padding for the first week
        for (let i = 0; i < firstDay; i++) {
            cells.push(<View key={`empty-${i}`} style={styles.cell} />);
        }

        for (let d = 1; d <= numDays; d++) {
            const dateObj = new Date(year, month, d);
            const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            // Fix for inconsistent formatting (e.g., "Apr 08" vs "Apr 8")
            // Most JS engines return "Apr 8". 
            
            const isToday = dateObj.toDateString() === today.toDateString();
            const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const isSelected = selectedDate === dateStr;

            cells.push(
                <TouchableOpacity
                    key={d}
                    disabled={isPast}
                    onPress={() => onDateSelect(dateStr)}
                    style={[
                        styles.cell,
                        isSelected && styles.selectedCell,
                        isToday && !isSelected && styles.todayCell
                    ]}
                >
                    <Text style={[
                        styles.cellText,
                        isSelected && styles.selectedCellText,
                        isPast && styles.pastCellText,
                        isToday && !isSelected && styles.todayCellText
                    ]}>
                        {d}
                    </Text>
                </TouchableOpacity>
            );

            if (cells.length === 7) {
                rows.push(<View key={d} style={styles.row}>{cells}</View>);
                cells = [];
            }
        }

        // Fill out the last row
        if (cells.length > 0) {
            while (cells.length < 7) {
                cells.push(<View key={`empty-end-${cells.length}`} style={styles.cell} />);
            }
            rows.push(<View key="last" style={styles.row}>{cells}</View>);
        }

        return <View style={styles.grid}>{rows}</View>;
    };

    return (
        <View style={styles.container}>
            {renderHeader()}
            {renderDays()}
            {renderGrid()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.md,
        ...Shadows.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    headerTitle: {
        ...typography.section,
        color: colors.primary,
        fontFamily: typography.section.fontFamily,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    navButton: {
        padding: 6,
        backgroundColor: colors.background,
        borderRadius: 8,
    },
    daysHeader: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.sm,
    },
    dayText: {
        ...typography.label,
        width: 40,
        textAlign: 'center',
        color: colors.textMuted,
    },
    grid: {
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 4,
    },
    cell: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    todayCell: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.secondary,
    },
    selectedCell: {
        backgroundColor: colors.primary,
        ...Shadows.sm,
    },
    cellText: {
        ...typography.bodyMedium,
        fontSize: 14,
    },
    selectedCellText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    todayCellText: {
        color: colors.secondary,
        fontWeight: 'bold',
    },
    pastCellText: {
        color: colors.disabled,
    },
});
