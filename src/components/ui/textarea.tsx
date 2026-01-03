import type { TextareaHTMLAttributes } from 'react';

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg px-3 py-2 bg-white/5 border border-white/10 focus:outline-none ${props.className}`}
    />
  );
}