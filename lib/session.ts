export interface SessionUser {
  name: string;
}

export interface SavedScore {
  game: string;
  score: number;
  name: string;
  at: number;
}

export const USER_KEY = "av_user";
export const SCORES_KEY = "av_scores";

export function readUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.name === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function writeUser(user: SessionUser | null): void {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    /* localStorage no disponible: la sesión vive solo en memoria */
  }
}

export function appendScore(entry: Omit<SavedScore, "at">): void {
  try {
    const all: SavedScore[] = JSON.parse(
      localStorage.getItem(SCORES_KEY) || "[]",
    );
    all.push({ ...entry, at: Date.now() });
    localStorage.setItem(SCORES_KEY, JSON.stringify(all));
  } catch {
    /* sin persistencia */
  }
}

export function toUserName(raw: string): string {
  return (raw.trim() || "PLAYER1").toUpperCase().slice(0, 10);
}
