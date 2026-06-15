export type ToastType = "error" | "success";

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
};

export type ToastApi = {
  error: (message: string) => void;
  success: (message: string) => void;
};
