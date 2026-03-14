export interface Conversation {
  id: string;
  participantName: string;
  participantAvatar: string;
  participantRole: 'doctor' | 'patient';
  specialization?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
}

export interface ChatMsg {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  time: string;
  isOwn: boolean;
  type: 'text' | 'image' | 'report';
}

// Conversations from patient's perspective
export const patientConversations: Conversation[] = [
  { id: 'conv-1', participantName: 'Dr. Sameer Mahadik', participantAvatar: 'https://ui-avatars.com/api/?name=SM&background=e0f2fe&color=0284c7', participantRole: 'doctor', specialization: 'Cardiologist', lastMessage: 'Keep up the good work and continue the medication.', lastMessageTime: '10:36 AM', unreadCount: 0, online: true },
  { id: 'conv-2', participantName: 'Dr. Vikram Patel', participantAvatar: 'https://randomuser.me/api/portraits/men/43.jpg', participantRole: 'doctor', specialization: 'Dermatologist', lastMessage: 'Apply the cream twice daily for best results.', lastMessageTime: 'Yesterday', unreadCount: 2, online: false },
  { id: 'conv-3', participantName: 'Dr. Meera Iyer', participantAvatar: 'https://randomuser.me/api/portraits/women/68.jpg', participantRole: 'doctor', specialization: 'Pediatrician', lastMessage: 'The test results look normal. Nothing to worry about.', lastMessageTime: 'Mar 5', unreadCount: 0, online: true },
  { id: 'conv-4', participantName: 'Dr. Priya Nair', participantAvatar: 'https://randomuser.me/api/portraits/women/65.jpg', participantRole: 'doctor', specialization: 'Neurologist', lastMessage: 'Let me know if the headaches persist after this week.', lastMessageTime: 'Mar 3', unreadCount: 1, online: false },
];

// Conversations from doctor's perspective
export const doctorConversations: Conversation[] = [
  { id: 'conv-d1', participantName: 'Arjun Verma', participantAvatar: 'https://randomuser.me/api/portraits/men/75.jpg', participantRole: 'patient', lastMessage: 'Yes, it\'s been around 120/80 consistently.', lastMessageTime: '10:35 AM', unreadCount: 0, online: true },
  { id: 'conv-d2', participantName: 'Kavya Reddy', participantAvatar: 'https://randomuser.me/api/portraits/women/26.jpg', participantRole: 'patient', lastMessage: 'Thank you, Doctor! I\'ll follow your advice.', lastMessageTime: 'Yesterday', unreadCount: 3, online: true },
  { id: 'conv-d3', participantName: 'Rohan Gupta', participantAvatar: 'https://randomuser.me/api/portraits/men/22.jpg', participantRole: 'patient', lastMessage: 'When should I come for the next check-up?', lastMessageTime: 'Mar 6', unreadCount: 1, online: false },
  { id: 'conv-d4', participantName: 'Sneha Joshi', participantAvatar: 'https://randomuser.me/api/portraits/women/33.jpg', participantRole: 'patient', lastMessage: 'The pain has reduced a lot. Thank you!', lastMessageTime: 'Mar 4', unreadCount: 0, online: false },
  { id: 'conv-d5', participantName: 'Aditya Kumar', participantAvatar: 'https://randomuser.me/api/portraits/men/85.jpg', participantRole: 'patient', lastMessage: 'I\'ve attached the MRI report.', lastMessageTime: 'Mar 2', unreadCount: 0, online: false },
];

// Messages per conversation
export const conversationMessages: Record<string, ChatMsg[]> = {
  'conv-1': [
    { id: 'm1', conversationId: 'conv-1', senderId: 'doctor', content: 'Hello! How are you feeling today?', time: '10:30 AM', isOwn: false, type: 'text' },
    { id: 'm2', conversationId: 'conv-1', senderId: 'patient', content: 'Hi Doctor! I have been feeling much better after the medication.', time: '10:32 AM', isOwn: true, type: 'text' },
    { id: 'm3', conversationId: 'conv-1', senderId: 'doctor', content: 'That\'s great to hear! Have you been monitoring your blood pressure regularly?', time: '10:33 AM', isOwn: false, type: 'text' },
    { id: 'm4', conversationId: 'conv-1', senderId: 'patient', content: 'Yes, it\'s been around 120/80 consistently.', time: '10:35 AM', isOwn: true, type: 'text' },
    { id: 'm5', conversationId: 'conv-1', senderId: 'doctor', content: 'Excellent! That\'s well within the normal range. Keep up the good work and continue the medication for the prescribed duration.', time: '10:36 AM', isOwn: false, type: 'text' },
  ],
  'conv-2': [
    { id: 'mc1', conversationId: 'conv-2', senderId: 'doctor', content: 'Hi, how is the skin rash now?', time: '2:00 PM', isOwn: false, type: 'text' },
    { id: 'mc2', conversationId: 'conv-2', senderId: 'patient', content: 'It\'s getting better with the prescribed cream.', time: '2:05 PM', isOwn: true, type: 'text' },
    { id: 'mc3', conversationId: 'conv-2', senderId: 'doctor', content: 'Good. Apply the cream twice daily for best results.', time: '2:07 PM', isOwn: false, type: 'text' },
  ],
  'conv-3': [
    { id: 'me1', conversationId: 'conv-3', senderId: 'doctor', content: 'I\'ve reviewed the blood work results.', time: '11:00 AM', isOwn: false, type: 'text' },
    { id: 'me2', conversationId: 'conv-3', senderId: 'patient', content: 'Is everything okay, Doctor?', time: '11:02 AM', isOwn: true, type: 'text' },
    { id: 'me3', conversationId: 'conv-3', senderId: 'doctor', content: 'The test results look normal. Nothing to worry about.', time: '11:03 AM', isOwn: false, type: 'text' },
  ],
  'conv-4': [
    { id: 'mp1', conversationId: 'conv-4', senderId: 'patient', content: 'Doctor, I\'ve been having frequent headaches lately.', time: '9:00 AM', isOwn: true, type: 'text' },
    { id: 'mp2', conversationId: 'conv-4', senderId: 'doctor', content: 'How often and how severe? Any visual disturbances?', time: '9:15 AM', isOwn: false, type: 'text' },
    { id: 'mp3', conversationId: 'conv-4', senderId: 'patient', content: 'About 3-4 times a week. No visual issues though.', time: '9:20 AM', isOwn: true, type: 'text' },
    { id: 'mp4', conversationId: 'conv-4', senderId: 'doctor', content: 'Let me know if the headaches persist after this week.', time: '9:22 AM', isOwn: false, type: 'text' },
  ],
  // Doctor's conversations (isOwn is flipped - doctor is the sender)
  'conv-d1': [
    { id: 'dd1', conversationId: 'conv-d1', senderId: 'doctor', content: 'Hello! How are you feeling today?', time: '10:30 AM', isOwn: true, type: 'text' },
    { id: 'dd2', conversationId: 'conv-d1', senderId: 'patient', content: 'Hi Doctor! I have been feeling much better after the medication.', time: '10:32 AM', isOwn: false, type: 'text' },
    { id: 'dd3', conversationId: 'conv-d1', senderId: 'doctor', content: 'That\'s great! Have you been monitoring your blood pressure regularly?', time: '10:33 AM', isOwn: true, type: 'text' },
    { id: 'dd4', conversationId: 'conv-d1', senderId: 'patient', content: 'Yes, it\'s been around 120/80 consistently.', time: '10:35 AM', isOwn: false, type: 'text' },
  ],
  'conv-d2': [
    { id: 'dj1', conversationId: 'conv-d2', senderId: 'doctor', content: 'Kavya, I\'ve prescribed a new moisturizer for you.', time: '3:00 PM', isOwn: true, type: 'text' },
    { id: 'dj2', conversationId: 'conv-d2', senderId: 'patient', content: 'Thank you, Doctor! How often should I apply it?', time: '3:10 PM', isOwn: false, type: 'text' },
    { id: 'dj3', conversationId: 'conv-d2', senderId: 'doctor', content: 'Twice daily, morning and night. Avoid direct sunlight after application.', time: '3:12 PM', isOwn: true, type: 'text' },
    { id: 'dj4', conversationId: 'conv-d2', senderId: 'patient', content: 'Thank you, Doctor! I\'ll follow your advice.', time: '3:15 PM', isOwn: false, type: 'text' },
  ],
  'conv-d3': [
    { id: 'dr1', conversationId: 'conv-d3', senderId: 'patient', content: 'Doctor, my son still has a slight fever.', time: '8:00 AM', isOwn: false, type: 'text' },
    { id: 'dr2', conversationId: 'conv-d3', senderId: 'doctor', content: 'Continue the medication for 2 more days. If it persists, bring him in.', time: '8:30 AM', isOwn: true, type: 'text' },
    { id: 'dr3', conversationId: 'conv-d3', senderId: 'patient', content: 'When should I come for the next check-up?', time: '8:35 AM', isOwn: false, type: 'text' },
  ],
  'conv-d4': [
    { id: 'da1', conversationId: 'conv-d4', senderId: 'doctor', content: 'How is the knee after the physiotherapy sessions?', time: '4:00 PM', isOwn: true, type: 'text' },
    { id: 'da2', conversationId: 'conv-d4', senderId: 'patient', content: 'The pain has reduced a lot. Thank you!', time: '4:20 PM', isOwn: false, type: 'text' },
  ],
  'conv-d5': [
    { id: 'dt1', conversationId: 'conv-d5', senderId: 'patient', content: 'I\'ve attached the MRI report.', time: '10:00 AM', isOwn: false, type: 'text' },
    { id: 'dt2', conversationId: 'conv-d5', senderId: 'doctor', content: 'Thanks Aditya, I\'ll review it and get back to you by tomorrow.', time: '11:30 AM', isOwn: true, type: 'text' },
  ],
};
