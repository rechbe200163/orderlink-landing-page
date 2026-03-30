export type FormState = {
  success: boolean;
  message?: string;
  data?: string | number;
  errors?: {
    [key: string]: string[];
  };
};

export const initialState: FormState = {
  success: false,
};
