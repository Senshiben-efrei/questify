declare module 'react-toastify' {
  import { ReactNode } from 'react';

  export interface ToastOptions {
    position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
    autoClose?: number | false;
    hideProgressBar?: boolean;
    closeOnClick?: boolean;
    pauseOnHover?: boolean;
    draggable?: boolean;
    progress?: number;
    theme?: 'light' | 'dark' | 'colored';
  }

  export interface ToastContainerProps extends ToastOptions {
    enableMultiContainer?: boolean;
    containerId?: string | number;
    className?: string;
    style?: React.CSSProperties;
    closeButton?: boolean | React.ReactElement;
    transition?: any;
    limit?: number;
  }

  export const ToastContainer: React.FC<ToastContainerProps>;
  
  export const toast: {
    (message: ReactNode, options?: ToastOptions): React.ReactText;
    success(message: ReactNode, options?: ToastOptions): React.ReactText;
    error(message: ReactNode, options?: ToastOptions): React.ReactText;
    info(message: ReactNode, options?: ToastOptions): React.ReactText;
    warn(message: ReactNode, options?: ToastOptions): React.ReactText;
    loading(message: ReactNode, options?: ToastOptions): React.ReactText;
  };
}

declare module 'react-toastify/dist/ReactToastify.css'; 