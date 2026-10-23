const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

export const formatPrice = (value) => currency.format(value);

export const initials = (name) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');
