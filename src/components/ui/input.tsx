import type { InputHTMLAttributes } from 'react';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg px-3 py-2 bg-white/5 border border-white/10 focus:outline-none ${props.className}`}
    />
  );
}