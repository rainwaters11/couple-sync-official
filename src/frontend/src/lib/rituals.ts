// Each ritual is a paired object: prompt + its correct love language category.
// IMPORTANT: always select the whole object with one hash — never pick prompt and
// category with separate hash calls, or the two values will drift out of sync.
interface RitualEntry {
  prompt: string;
  category: string;
}

const DAILY_RITUALS: RitualEntry[] = [
  {
    prompt:
      "Give each other a genuine compliment about something you noticed today.",
    category: "Words of Affirmation",
  },
  {
    prompt:
      "Tell your partner one thing you truly appreciate about them right now.",
    category: "Words of Affirmation",
  },
  {
    prompt: "Tell each other one thing you are looking forward to tomorrow.",
    category: "Words of Affirmation",
  },
  {
    prompt: "Compliment something specific about your partner's character.",
    category: "Words of Affirmation",
  },
  {
    prompt: "Tell your partner why you chose them.",
    category: "Words of Affirmation",
  },
  {
    prompt: "Spend 10 minutes talking about your day without any distractions.",
    category: "Quality Time",
  },
  {
    prompt: "Ask each other: What made you smile today?",
    category: "Quality Time",
  },
  {
    prompt: "Share a favorite memory from your time together.",
    category: "Quality Time",
  },
  {
    prompt: "Talk about a place you would like to visit together someday.",
    category: "Quality Time",
  },
  {
    prompt: "Share something new you learned recently.",
    category: "Quality Time",
  },
  {
    prompt: "Do one small task for your partner today without being asked.",
    category: "Acts of Service",
  },
  {
    prompt:
      "Give each other a sincere thank you for something they did recently.",
    category: "Acts of Service",
  },
  {
    prompt: "Express one way your partner made your life better this week.",
    category: "Acts of Service",
  },
  {
    prompt: "Share a hug that lasts at least 20 seconds.",
    category: "Physical Touch",
  },
  {
    prompt: "Hold hands for 5 minutes while sitting together — no phones.",
    category: "Physical Touch",
  },
  {
    prompt: "Share a song that reminds you of your partner and why.",
    category: "Thoughtful Gift",
  },
  {
    prompt: "Share a hope you have for your future together.",
    category: "Thoughtful Gift",
  },
  {
    prompt: "Share three things you are grateful for today with each other.",
    category: "Gratitude",
  },
  {
    prompt: "Share what you appreciate most about your relationship right now.",
    category: "Gratitude",
  },
  {
    prompt: "Tell each other about a dream or goal you have.",
    category: "Gratitude",
  },
  {
    prompt:
      "Express appreciation for a quality your partner brings to the relationship.",
    category: "Gratitude",
  },
];

// 7 Wild Sync Thursday prompts (rotating by week number mod 7)
const WILD_SYNC_PROMPTS = [
  "Write your partner a 3-sentence love note. No editing allowed — just send it raw.",
  "Plan one surprise for your partner to happen this week. Tell them it's coming, just not what.",
  "Recreate your first date meal together, or the closest thing to it.",
  "Give each other 10 uninterrupted minutes of full attention — no agenda, just listening.",
  "Exchange one playlist of 5 songs that describe how you feel about each other right now.",
  "Cook or order something your partner loves and eat together without screens.",
  "Take one photo together today that captures how you feel, no posing.",
];

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Get the ISO week number for a date
 */
function getISOWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Check if a given dateKey (YYYY-MM-DD) falls on a Thursday
 */
export function isThursday(dateKey: string): boolean {
  const date = new Date(`${dateKey}T00:00:00`);
  return date.getDay() === 4; // 0=Sun, 4=Thu
}

/**
 * Internal: select the paired ritual entry for a date using a single hash.
 * Never call getDailyRitual and getRitualCategory with separate hashes —
 * always use this function so prompt and category stay in sync.
 */
function getRitualEntry(dateKey: string): RitualEntry {
  const hash = simpleHash(dateKey);
  const index = hash % DAILY_RITUALS.length;
  // Guaranteed non-undefined: modulo keeps index within bounds
  return DAILY_RITUALS[index] as RitualEntry;
}

export function getDailyRitual(dateKey: string): string {
  // If Thursday, use Wild Sync prompt
  if (isThursday(dateKey)) {
    const date = new Date(`${dateKey}T00:00:00`);
    const weekNum = getISOWeekNumber(date);
    // Safe indexing: modulo + fallback so it never returns undefined
    const safeIndex = Math.abs(weekNum) % WILD_SYNC_PROMPTS.length;
    return (
      WILD_SYNC_PROMPTS[safeIndex] ??
      WILD_SYNC_PROMPTS[0] ??
      "Connect with your partner in a meaningful way today."
    );
  }
  return getRitualEntry(dateKey).prompt;
}

export function getRitualCategory(dateKey: string): string {
  if (isThursday(dateKey)) {
    return "Wild Sync";
  }
  // Use the same entry as getDailyRitual — one hash, one object, always matched
  return getRitualEntry(dateKey).category;
}
