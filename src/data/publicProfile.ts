import { PROFILE } from './resumeData';

export const OFFICIAL_CURRENT_TITLE = 'Lead Software Engineer';
export const LEAD_SCOPE_LABEL = 'Lead Engineer scope';
export const PUBLIC_RESUME_URL = PROFILE.resumeUrl;
export const PUBLIC_PHONE_NUMBER = PROFILE.phone;
export const PUBLIC_PHONE_URL = `tel:${PROFILE.phone.replace(/[^\d+]/g, '')}`;
