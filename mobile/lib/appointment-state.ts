export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface AppointmentFlowState {
  currentStep: number; // 0=booked, 1=consultation, 2=prescription, 3=reports, 4=billing, 5=payment, 6=completed
  consultationNotes: string;
  diagnosis: string;
  medicines: Medicine[];
  prescriptionNotes: string;
  reportName: string;
  reportType: string;
  billItems: {
    consultationFee: number;
    treatmentCost: number;
    labCharges: number;
    medicineCost: number;
  };
  paymentDone: boolean;
}

// Simple in-memory store per appointment (keyed by appointment id)
const appointmentStates: Record<string, AppointmentFlowState> = {};

export const getAppointmentState = (id: string): AppointmentFlowState => {
  if (!appointmentStates[id]) {
    appointmentStates[id] = {
      currentStep: 0,
      consultationNotes: '',
      diagnosis: '',
      medicines: [{ name: '', dosage: '', frequency: 'Once daily', duration: '7 days' }],
      prescriptionNotes: '',
      reportName: '',
      reportType: 'Blood Test',
      billItems: { consultationFee: 500, treatmentCost: 0, labCharges: 0, medicineCost: 0 },
      paymentDone: false,
    };
  }
  return appointmentStates[id];
};

export const updateAppointmentState = (id: string, updates: Partial<AppointmentFlowState>) => {
  appointmentStates[id] = { ...getAppointmentState(id), ...updates };
};
