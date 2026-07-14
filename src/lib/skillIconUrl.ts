const DEVICON_ROOT = `${import.meta.env.BASE_URL}icons/devicon/`;

export function getSkillIconUrl(iconPath?: string): string | null {
  return iconPath ? `${DEVICON_ROOT}${iconPath}` : null;
}
