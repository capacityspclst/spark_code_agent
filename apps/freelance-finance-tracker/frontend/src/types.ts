export interface UserCreate {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Receipt {
  id: number;
  filename: string;
  amount: number;
  date: string;
  vendor: string;
  category: string;
  created_at: string;
}

export interface Mileage {
  id: number;
  date: string;
  start_location: string;
  end_location: string;
  distance_miles: number;
  purpose?: string;
  created_at: string;
}

export interface DashboardSummary {
  total_income: number;
  total_expenses: number;
  total_mileage_deduction: number;
  per_month: { month: string; income: number; expenses: number }[];
}
