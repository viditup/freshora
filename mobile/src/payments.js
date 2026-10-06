// PART 8: demo payment methods. Keys must match the backend OrderIn.payment_method Literal.
// Nothing here touches a real gateway - every "online" method is a mock and settles instantly.
export const PAYMENT_METHODS = [
  { key: 'upi', label: 'UPI', sub: 'GPay, PhonePe, Paytm - demo', icon: 'phone-portrait-outline' },
  { key: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay - demo', icon: 'card-outline' },
  { key: 'wallet', label: 'Wallet', sub: 'Paytm, PhonePe, Amazon Pay - demo', icon: 'wallet-outline' },
  { key: 'COD', label: 'Cash on Delivery', sub: 'Pay when your order arrives', icon: 'cash-outline' },
];

// Falls back gracefully for older orders saved as 'online'.
export const payLabel = (m) => (m === 'online' ? 'Online (Demo)' : (PAYMENT_METHODS.find((p) => p.key === m) || {}).label || m);
