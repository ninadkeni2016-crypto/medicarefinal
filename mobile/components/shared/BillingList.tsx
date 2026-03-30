import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Receipt, Calendar, ChevronDown, ChevronUp, CreditCard } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function BillingList() {
    const { role } = useAuth();
    const [bills, setBills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [payingId, setPayingId] = useState<string | null>(null);
    const [paidIds, setPaidIds] = useState<string[]>([]);

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const res = await api.get('/bills');
                setBills(res.data || []);
            } catch (err) {
                console.error(err);
                setBills([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBills();
    }, []);

    const totalPaid = bills.filter(b => b.status === 'Paid' || paidIds.includes(b.id || b._id)).reduce((s, b) => s + b.total, 0);
    const totalPending = bills.filter(b => b.status !== 'Paid' && !paidIds.includes(b.id || b._id)).reduce((s, b) => s + b.total, 0);

    const handlePay = (id: string) => {
        setPayingId(id);
        setTimeout(() => {
            setPayingId(null);
            setPaidIds(prev => [...prev, id]);
            toast({ title: 'Payment Successful! ✅' });
        }, 2000);
    };

    const statusConfig: Record<string, { color: string; bg: string }> = {
        Paid: { color: '#16a34a', bg: '#dcfce7' },
        Pending: { color: '#ca8a04', bg: '#fef9c3' },
        Overdue: { color: '#dc2626', bg: '#fef2f2' },
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0284c7" />
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#0284c7', marginBottom: 4 }}>Billing</Text>
            <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>{bills.length} bills</Text>

            {/* Summary Cards */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                <View style={{ flex: 1, backgroundColor: '#dcfce7', borderRadius: 16, padding: 14 }}>
                    <Text style={{ fontSize: 10, color: '#16a34a', fontWeight: '600', textTransform: 'uppercase' }}>Total Paid</Text>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#16a34a', marginTop: 4 }}>₹{totalPaid.toLocaleString()}</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: '#fef9c3', borderRadius: 16, padding: 14 }}>
                    <Text style={{ fontSize: 10, color: '#ca8a04', fontWeight: '600', textTransform: 'uppercase' }}>Pending</Text>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#ca8a04', marginTop: 4 }}>₹{totalPending.toLocaleString()}</Text>
                </View>
            </View>

            {/* Bills */}
            {bills.map((bill) => {
                const billId = bill.id || bill._id;
                const isPaid = bill.status === 'Paid' || paidIds.includes(billId);
                const status = isPaid ? 'Paid' : bill.status;
                const cfg = statusConfig[status] || statusConfig.Pending;
                const isExpanded = expandedId === bill.id;

                const breakdownItems = [
                    { label: 'Consultation Fee', amount: bill.consultationFee },
                    { label: 'Treatment Cost', amount: bill.treatmentCost },
                    { label: 'Lab Charges', amount: bill.labCharges },
                    { label: 'Medicine Cost', amount: bill.medicineCost },
                ].filter(item => item.amount > 0);

                return (
                    <View key={billId} style={{ backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 8, overflow: 'hidden' }}>
                        <TouchableOpacity onPress={() => setExpandedId(isExpanded ? null : billId)} activeOpacity={0.7} style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#fef9c3', alignItems: 'center', justifyContent: 'center' }}>
                                <Receipt size={20} color="#ca8a04" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontWeight: '600', fontSize: 14, color: '#0284c7' }}>{bill.doctorName}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                    <Calendar size={12} color="#64748b" />
                                    <Text style={{ fontSize: 11, color: '#64748b' }}>{bill.date}</Text>
                                </View>
                            </View>
                            <View style={{ alignItems: 'flex-end', gap: 4 }}>
                                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0284c7' }}>₹{bill.total.toLocaleString()}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: cfg.bg }}>
                                    <Text style={{ fontSize: 10, fontWeight: '600', color: cfg.color }}>{status}</Text>
                                </View>
                            </View>
                            {isExpanded ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                        </TouchableOpacity>

                        {isExpanded && (
                            <View style={{ padding: 14, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
                                {breakdownItems.map((item, i) => (
                                    <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                                        <Text style={{ fontSize: 13, color: '#64748b' }}>{item.label}</Text>
                                        <Text style={{ fontSize: 13, fontWeight: '500', color: '#0284c7' }}>₹{item.amount.toLocaleString()}</Text>
                                    </View>
                                ))}
                                <View style={{ borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 8, marginTop: 4, flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#0284c7' }}>Total</Text>
                                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#0ea5e9' }}>₹{bill.total.toLocaleString()}</Text>
                                </View>
                                {!isPaid && role === 'patient' && (
                                    <TouchableOpacity onPress={() => handlePay(billId)} disabled={payingId === billId} activeOpacity={0.7} style={{ marginTop: 12, width: '100%', paddingVertical: 12, borderRadius: 12, backgroundColor: payingId === billId ? '#818cf8' : '#0ea5e9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        {payingId === billId ? <><ActivityIndicator size="small" color="#fff" /><Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Processing...</Text></> : <><CreditCard size={16} color="#fff" /><Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Pay ₹{bill.total.toLocaleString()}</Text></>}
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                );
            })}
        </ScrollView>
    );
}
