/**
 * Backend-controlled demo dataset for CareConnect Pro.
 * Used when DEMO_MODE=true so the Doctor Dashboard and UI always show meaningful data.
 */

export const demoPatients = [
  { _id: 'demo-p1', fullName: 'John Carter', email: 'john.carter@email.com', phone: '+1 555-0101', dateOfBirth: '1992-05-15', gender: 'Male', bloodGroup: 'O+', lastVisit: '2025-03-10', condition: 'Hypertension', avatar: 'https://ui-avatars.com/api/?name=John+Carter&background=E0F2FE&color=0369A1' },
  { _id: 'demo-p2', fullName: 'Sarah Williams', email: 'sarah.w@email.com', phone: '+1 555-0102', dateOfBirth: '1998-08-22', gender: 'Female', bloodGroup: 'A+', lastVisit: '2025-03-11', condition: 'Dermatology follow-up', avatar: 'https://ui-avatars.com/api/?name=Sarah+Williams&background=FCE7F3&color=9D174D' },
  { _id: 'demo-p3', fullName: 'Michael Brown', email: 'm.brown@email.com', phone: '+1 555-0103', dateOfBirth: '1980-01-08', gender: 'Male', bloodGroup: 'B+', lastVisit: '2025-03-05', condition: 'Orthopedic review', avatar: 'https://ui-avatars.com/api/?name=Michael+Brown&background=D1FAE5&color=047857' },
  { _id: 'demo-p4', fullName: 'Emily Davis', email: 'emily.d@email.com', phone: '+1 555-0104', dateOfBirth: '1995-11-30', gender: 'Female', bloodGroup: 'AB+', lastVisit: '2025-03-12', condition: 'Stable', avatar: 'https://ui-avatars.com/api/?name=Emily+Davis&background=E0E7FF&color=3730A3' },
  { _id: 'demo-p5', fullName: 'Robert Johnson', email: 'r.johnson@email.com', phone: '+1 555-0105', dateOfBirth: '1973-04-18', gender: 'Male', bloodGroup: 'O-', lastVisit: '2025-02-28', condition: 'Cardiac follow-up', avatar: 'https://ui-avatars.com/api/?name=Robert+Johnson&background=FEF3C7&color=B45309' },
];

export const demoAppointments = [
  { _id: 'demo-a1', patientName: 'John Carter', doctorName: 'Dr. Smith', specialization: 'Cardiology', date: 'Today', time: '10:30 AM', status: 'upcoming', type: 'In-Person', avatar: 'https://ui-avatars.com/api/?name=John+Carter&background=E0F2FE&color=0369A1' },
  { _id: 'demo-a2', patientName: 'Sarah Williams', doctorName: 'Dr. Smith', specialization: 'Dermatology', date: 'Tomorrow', time: '2:00 PM', status: 'upcoming', type: 'In-Person', avatar: 'https://ui-avatars.com/api/?name=Sarah+Williams&background=FCE7F3&color=9D174D' },
  { _id: 'demo-a3', patientName: 'Michael Brown', doctorName: 'Dr. Smith', specialization: 'Orthopedic', date: '16 June', time: '11:00 AM', status: 'upcoming', type: 'In-Person', avatar: 'https://ui-avatars.com/api/?name=Michael+Brown&background=D1FAE5&color=047857' },
  { _id: 'demo-a4', patientName: 'Emily Davis', doctorName: 'Dr. Smith', specialization: 'General', date: '14 Mar', time: '9:00 AM', status: 'completed', type: 'In-Person', avatar: 'https://ui-avatars.com/api/?name=Emily+Davis&background=E0E7FF&color=3730A3' },
  { _id: 'demo-a5', patientName: 'Robert Johnson', doctorName: 'Dr. Smith', specialization: 'Cardiology', date: '12 Mar', time: '3:30 PM', status: 'completed', type: 'In-Person', avatar: 'https://ui-avatars.com/api/?name=Robert+Johnson&background=FEF3C7&color=B45309' },
  { _id: 'demo-a6', patientName: 'John Carter', doctorName: 'Dr. Smith', specialization: 'Cardiology', date: '18 Mar', time: '4:00 PM', status: 'cancelled', type: 'In-Person', avatar: 'https://ui-avatars.com/api/?name=John+Carter&background=E0F2FE&color=0369A1' },
];

export const demoNotifications = [
  { _id: 'demo-n1', title: 'New appointment request', body: 'Sarah Williams requested an appointment for Dermatology on Tomorrow at 2:00 PM.', type: 'appointment', read: false },
  { _id: 'demo-n2', title: 'Patient uploaded report', body: 'Michael Brown uploaded a new lab report (CBC).', type: 'system', read: false },
  { _id: 'demo-n3', title: 'Appointment reminder', body: 'John Carter – Cardiology appointment today at 10:30 AM.', type: 'appointment', read: true },
  { _id: 'demo-n4', title: 'Payment received', body: 'Payment of ₹1,500 received from Emily Davis.', type: 'billing', read: true },
];

export const demoReports = [
  { _id: 'demo-r1', name: 'Blood Pressure Report', type: 'Blood Test', date: '2025-03-10', doctorName: 'Dr. Smith', status: 'Ready', patientName: 'John Carter' },
  { _id: 'demo-r2', name: 'X-Ray – Chest', type: 'X-Ray', date: '2025-03-08', doctorName: 'Dr. Smith', status: 'Ready', patientName: 'Michael Brown' },
  { _id: 'demo-r3', name: 'CBC Lab Report', type: 'Lab Report', date: '2025-03-11', doctorName: 'Dr. Smith', status: 'Pending', patientName: 'Sarah Williams' },
  { _id: 'demo-r4', name: 'Lipid Profile', type: 'Blood Test', date: '2025-03-05', doctorName: 'Dr. Smith', status: 'Ready', patientName: 'Robert Johnson' },
];

export const demoMessages = [
  { _id: 'demo-msg1', participantName: 'John Carter', lastMessage: 'Thank you for the prescription.', lastMessageTime: '2025-03-13T09:15:00Z', unreadCount: 0 },
  { _id: 'demo-msg2', participantName: 'Sarah Williams', lastMessage: 'Can we reschedule to Friday?', lastMessageTime: '2025-03-13T08:30:00Z', unreadCount: 2 },
  { _id: 'demo-msg3', participantName: 'Emily Davis', lastMessage: 'Reports look good, thanks Doctor.', lastMessageTime: '2025-03-12T16:00:00Z', unreadCount: 0 },
];

export const demoBills = [
  { _id: 'demo-b1', patientName: 'John Carter', doctorName: 'Dr. Smith', date: '2025-03-10', total: 1500, status: 'Paid' },
  { _id: 'demo-b2', patientName: 'Sarah Williams', doctorName: 'Dr. Smith', date: '2025-03-11', total: 1200, status: 'Pending' },
  { _id: 'demo-b3', patientName: 'Emily Davis', doctorName: 'Dr. Smith', date: '2025-03-12', total: 2000, status: 'Paid' },
  { _id: 'demo-b4', patientName: 'Michael Brown', doctorName: 'Dr. Smith', date: '2025-03-05', total: 800, status: 'Paid' },
];

/** Stats for doctor dashboard */
export function getDemoDashboardStats() {
  const todayCount = demoAppointments.filter(a => a.date === 'Today' && (a.status === 'upcoming' || a.status === 'confirmed')).length;
  const pendingReports = demoReports.filter(r => r.status === 'Pending').length;
  const totalRevenue = demoBills.filter(b => b.status === 'Paid').reduce((s, b) => s + b.total, 0);
  return {
    totalPatients: demoPatients.length,
    todayAppointments: todayCount,
    pendingReports,
    totalRevenue,
  };
}

/** Appointments per week for charts (last 7 days) */
export function getDemoAppointmentsPerWeek() {
  return [
    { day: 'Mon', count: 4 },
    { day: 'Tue', count: 6 },
    { day: 'Wed', count: 5 },
    { day: 'Thu', count: 8 },
    { day: 'Fri', count: 7 },
    { day: 'Sat', count: 3 },
    { day: 'Sun', count: 2 },
  ];
}

/** Patient registrations (last 6 months) */
export function getDemoPatientRegistrations() {
  return [
    { month: 'Oct', count: 12 },
    { month: 'Nov', count: 18 },
    { month: 'Dec', count: 15 },
    { month: 'Jan', count: 22 },
    { month: 'Feb', count: 19 },
    { month: 'Mar', count: 25 },
  ];
}

/** Department/specialization visits */
export function getDemoDepartmentVisits() {
  return [
    { name: 'Cardiology', count: 28 },
    { name: 'Dermatology', count: 15 },
    { name: 'Orthopedic', count: 12 },
    { name: 'General', count: 35 },
    { name: 'Pediatrics', count: 10 },
  ];
}
