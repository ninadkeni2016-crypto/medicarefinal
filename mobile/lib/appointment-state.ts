export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  beforeFood?: boolean;
  notes?: string;
}

export interface AppointmentFlowState {
  currentStep: number; // 0=booked, 1=consultation, 2=prescription, 3=reports, 4=billing, 5=payment, 6=completed
  vitals?: { bp: string; hr: string; temp: string; weight: string };
  symptoms?: string[];
  consultationNotes: string;
  diagnosis: string;
  medicines: Medicine[];
  prescriptionNotes: string;
  reportName: string;
  reportType: string;
  reportDate?: string;
  labName?: string;
  reportRemarks?: string;
  billItems: {
    consultationFee: number;
    treatmentCost: number;
    labCharges: number;
    medicineCost: number;
    otherCharges?: number;
  };
  discount?: number;
  gst?: number;
  paymentDone: boolean;
  paymentMethod?: string;
}

// Simple in-memory store per appointment (keyed by appointment id)
const appointmentStates: Record<string, AppointmentFlowState> = {};

export const getAppointmentState = (id: string): AppointmentFlowState => {
  if (!appointmentStates[id]) {
    appointmentStates[id] = {
      currentStep: 0,
      vitals: { bp: '', hr: '', temp: '', weight: '' },
      symptoms: [],
      consultationNotes: '',
      diagnosis: '',
      medicines: [{ name: '', dosage: '', frequency: 'Once daily', duration: '7 days', beforeFood: false, notes: '' }],
      prescriptionNotes: '',
      reportName: '',
      reportType: 'Blood Test',
      reportDate: new Date().toISOString().split('T')[0],
      labName: '',
      reportRemarks: '',
      billItems: { consultationFee: 500, treatmentCost: 0, labCharges: 0, medicineCost: 0, otherCharges: 0 },
      discount: 0,
      gst: 18,
      paymentDone: false,
    };
  }
  return appointmentStates[id];
};

export const updateAppointmentState = (id: string, updates: Partial<AppointmentFlowState>) => {
  appointmentStates[id] = { ...getAppointmentState(id), ...updates };
};
