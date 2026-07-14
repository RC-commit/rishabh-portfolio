import { PUBLIC_PHONE_NUMBER } from '../../data/publicProfile';

const PHONE_LIKE_PATTERN = /(?:\+|\p{Nd})[\p{Nd}\p{Zs}\p{Pd}\t()./:\\[\]_*`~\u200B-\u200D\u2060]{8,}\p{Nd}/gu;
const UI_ACTION_TAG_PATTERN = /<ui_action\b[^>]*\/?\s*>/gi;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const TOKEN_PATTERN = /\b(?:gsk_|sk-|github_pat_|ghp_)[A-Za-z0-9_-]{12,}\b/g;
const AWS_KEY_PATTERN = /\bAKIA[A-Z0-9]{16}\b/g;
const BEARER_PATTERN = /\bBearer\s+[A-Za-z0-9._~+/-]{12,}={0,2}\b/gi;
const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g;
const PUBLIC_PHONE_DIGITS = PUBLIC_PHONE_NUMBER.replace(/\D/g, '');
const PUBLIC_PHONE_NATIONAL_DIGITS = PUBLIC_PHONE_DIGITS.slice(-10);

function isPublishedPhoneNumber(candidate: string): boolean {
  const digits = candidate.replace(/\D/g, '');
  return digits === PUBLIC_PHONE_DIGITS || digits === PUBLIC_PHONE_NATIONAL_DIGITS;
}

export function redactPrivateContactData(value: string): string {
  return value
    .replace(UI_ACTION_TAG_PATTERN, '')
    .replace(PHONE_LIKE_PATTERN, (candidate) => {
      const digitCount = candidate.match(/\p{Nd}/gu)?.length ?? 0;
      if (isPublishedPhoneNumber(candidate)) return candidate;
      return digitCount >= 10 ? '[private phone number]' : candidate;
    })
    .trim();
}

export function redactProviderSensitiveData(value: string): string {
  return redactPrivateContactData(value)
    .replace(EMAIL_PATTERN, '[email redacted]')
    .replace(TOKEN_PATTERN, '[secret redacted]')
    .replace(AWS_KEY_PATTERN, '[secret redacted]')
    .replace(BEARER_PATTERN, '[secret redacted]')
    .replace(JWT_PATTERN, '[secret redacted]');
}
