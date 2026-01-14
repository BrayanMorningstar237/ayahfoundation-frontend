import { CheckCircle, XCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
}

const Toast = ({ message, type = 'success' }: ToastProps) => {
  return (
    <div
      className={`
        fixed top-4 right-4 z-50
        flex items-center gap-3
        px-4 py-3 rounded-xl shadow-lg
        text-sm font-medium
        transition-all
        ${
          type === 'success'
            ? 'bg-green-600 text-white'
            : 'bg-red-600 text-white'
        }
      `}
    >
      {type === 'success' ? (
        <CheckCircle size={18} />
      ) : (
        <XCircle size={18} />
      )}
      {message}
    </div>
  );
};

export default Toast;
