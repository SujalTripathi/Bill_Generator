// Using react-hot-toast directly from App. This file is a re-export for convenience.
import toast from 'react-hot-toast';

export function showSuccess(message) {
  toast.success(message);
}

export function showError(message) {
  toast.error(message || 'Something went wrong');
}

export function showLoading(message) {
  return toast.loading(message);
}

export default toast;
