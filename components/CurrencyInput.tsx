import React from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  id?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onChange, id, className, placeholder, required }) => {
  // Formata o valor numérico para string BRL (R$ 1.000,00)
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(val);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    // Remove tudo que não é dígito
    const onlyDigits = inputValue.replace(/\D/g, '');

    if (onlyDigits === '') {
      onChange(0);
      return;
    }

    // Converte para número (os últimos 2 dígitos são centavos)
    const numericValue = parseInt(onlyDigits, 10) / 100;

    onChange(numericValue);
  };

  return (
    <input
      type="text"
      id={id}
      value={value === 0 ? '' : formatCurrency(value)}
      onChange={handleChange}
      className={className}
      placeholder={placeholder || "R$ 0,00"}
      required={required}
      autoComplete="off"
    />
  );
};

export default CurrencyInput;