import { useContext } from 'react';
import { BillContext } from '../context/BillContext';

export function useBill() {
  const context = useContext(BillContext);
  if (!context) throw new Error('useBill must be used within BillProvider');
  return context;
}
