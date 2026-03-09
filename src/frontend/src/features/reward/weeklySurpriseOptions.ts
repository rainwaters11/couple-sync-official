// Single source of truth for Weekly Surprise options with luxury SVG illustrations, cryptic clues, and reveal copy

export interface WeeklySurpriseOption {
  id: string;
  title: string;
  description: string;
  revealCopy: string;
  svg: string;
  clues: string[]; // 7 cryptic clue lines (Day 1-7) — solo mode
  clueSetA: string[]; // 7 cryptic clues for Partner A (room mode)
  clueSetB: string[]; // 7 cryptic clues for Partner B (room mode)
}

export const WEEKLY_SURPRISE_OPTIONS: WeeklySurpriseOption[] = [
  {
    id: "movie_night",
    title: "Cozy Movie Night",
    description: "Pick a movie, grab snacks, no phones.",
    revealCopy: "Cozy Movie Night: pick a movie + snacks + no phones.",
    svg: "<svg width='96' height='96' viewBox='0 0 96 96' xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='g1' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#F2C6B4'/><stop offset='1' stop-color='#E6B566'/></linearGradient></defs><rect x='14' y='22' width='68' height='48' rx='14' fill='url(#g1)'/><rect x='22' y='30' width='52' height='32' rx='10' fill='#FFF3ED' opacity='0.85'/><path d='M44 40 L44 54 L58 47 Z' fill='#B86A4B'/><circle cx='28' cy='28' r='4' fill='#FFF3ED' opacity='0.7'/><circle cx='70' cy='66' r='5' fill='#FFF3ED' opacity='0.6'/></svg>",
    clues: [
      "Tonight, we borrow a world that isn't ours.",
      "The room gets quiet, but our connection gets loud.",
      "No speeches… just presence.",
      "Something soft becomes the setting.",
      "We'll press pause on everything else.",
      "A shared feeling… the kind you can't scroll past.",
      "The treasure isn't a place. It's the moment we choose.",
    ],
    clueSetA: [
      "Something waits in the dark.",
      "Stillness is the invitation.",
      "We'll borrow another world together.",
      "Comfort takes a shape tonight.",
      "The screen becomes a mirror.",
      "Two hearts, one story.",
      "The credits roll. The feeling stays.",
    ],
    clueSetB: [
      "Sound fills the silence between us.",
      "We share without speaking.",
      "A choice made together.",
      "Softness is the setting.",
      "Presence is the price of admission.",
      "What we watch watches us back.",
      "The end is just the beginning.",
    ],
  },
  {
    id: "breakfast_date",
    title: "Breakfast Date",
    description: "Start the day slow, sweet, and connected.",
    revealCopy: "Breakfast Date: start the day slow, sweet, and connected.",
    svg: "<svg width='96' height='96' viewBox='0 0 96 96' xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='g2' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#F6D08A'/><stop offset='1' stop-color='#E8A48A'/></linearGradient></defs><rect x='14' y='18' width='68' height='60' rx='18' fill='url(#g2)'/><path d='M30 58c0-8 6-14 14-14h6c8 0 14 6 14 14v6H30v-6z' fill='#FFF3ED' opacity='0.9'/><path d='M62 46h4c4 0 7 3 7 7s-3 7-7 7h-4' fill='none' stroke='#B86A4B' stroke-width='4' stroke-linecap='round'/><path d='M36 30c3 2 3 5 0 7M46 28c3 2 3 5 0 7M56 30c3 2 3 5 0 7' fill='none' stroke='#FFF3ED' stroke-width='3' stroke-linecap='round' opacity='0.8'/></svg>",
    clues: [
      "We start where most people rush.",
      "Something warm arrives before the world demands anything.",
      "A quiet kind of romance.",
      "Small comforts, big meaning.",
      "We're feeding more than hunger.",
      "A reset wrapped in softness.",
      "The treasure is simple… and that's why it works.",
    ],
    clueSetA: [
      "The morning holds something gentle.",
      "We slow down before the day speeds up.",
      "Warmth arrives before obligation.",
      "This ritual starts early.",
      "A table for two before the world wakes.",
      "Something sweet before something hard.",
      "Dawn was made for this.",
    ],
    clueSetB: [
      "Steam rises. So does softness.",
      "There is no rush here.",
      "The first hour belongs to us.",
      "Light enters slowly.",
      "We nourish more than appetite.",
      "This is what unhurried feels like.",
      "Morning becomes a love language.",
    ],
  },
  {
    id: "spa_night",
    title: "At-Home Spa Night",
    description: "Relax, reset, and be soft together.",
    revealCopy: "At-Home Spa Night: relax, reset, and be soft together.",
    svg: "<svg width='96' height='96' viewBox='0 0 96 96' xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='g3' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#E7B7A0'/><stop offset='1' stop-color='#C9D6D5'/></linearGradient></defs><rect x='14' y='18' width='68' height='60' rx='18' fill='url(#g3)'/><path d='M48 26c6 10 6 16 0 26c-6-10-6-16 0-26z' fill='#FFF3ED' opacity='0.9'/><path d='M32 66c6-10 26-10 32 0' fill='none' stroke='#B86A4B' stroke-width='4' stroke-linecap='round' opacity='0.8'/><circle cx='30' cy='34' r='4' fill='#FFF3ED' opacity='0.65'/><circle cx='66' cy='60' r='5' fill='#FFF3ED' opacity='0.55'/></svg>",
    clues: [
      "We turn the ordinary into a sanctuary.",
      "Softness becomes the plan.",
      "We trade tension for tenderness.",
      "Something warm. Something slow.",
      "The outside world loses access to us.",
      "Peace, but make it shared.",
      "The treasure is relief… the kind you can feel in your shoulders.",
    ],
    clueSetA: [
      "We close the door to everything else.",
      "Tension leaves the room.",
      "The air feels different tonight.",
      "We choose softness over speed.",
      "Rest becomes a form of care.",
      "Everything slows on purpose.",
      "We breathe like we mean it.",
    ],
    clueSetB: [
      "Something warm waits.",
      "The noise fades here.",
      "We tend to what's been neglected.",
      "Stillness is not empty — it's full.",
      "This is where we recover together.",
      "Gentle is the plan.",
      "We surface feeling lighter.",
    ],
  },
  {
    id: "dessert_walk",
    title: "Dessert + Walk Date",
    description: "Move together and end it sweet.",
    revealCopy:
      "Dessert + Walk: move your body, hold hands, eat something sweet.",
    svg: "<svg width='96' height='96' viewBox='0 0 96 96' xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='g4' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#F0B3A1'/><stop offset='1' stop-color='#E6C27A'/></linearGradient></defs><rect x='14' y='18' width='68' height='60' rx='18' fill='url(#g4)'/><path d='M30 60h36l-4 10H34l-4-10z' fill='#FFF3ED' opacity='0.9'/><path d='M36 46c0-6 5-10 12-10s12 4 12 10' fill='none' stroke='#B86A4B' stroke-width='4' stroke-linecap='round'/><path d='M38 46h20' stroke='#B86A4B' stroke-width='4' stroke-linecap='round'/><circle cx='66' cy='30' r='6' fill='#FFF3ED' opacity='0.75'/></svg>",
    clues: [
      "Two steps closer to something sweet.",
      "Movement, but not the exhausting kind.",
      "We follow the feeling, not the schedule.",
      "A little outside. A little inside.",
      "We collect a memory without buying a lot.",
      "A treat… but the real reward is the company.",
      "The treasure tastes like joy, but it isn't just food.",
    ],
    clueSetA: [
      "We move without a destination.",
      "The outside world is the backdrop.",
      "Something sweet marks the path.",
      "Conversation flows with our steps.",
      "We collect a memory on foot.",
      "The journey matters more than the map.",
      "Sweetness follows movement.",
    ],
    clueSetB: [
      "The street holds a small adventure.",
      "We taste as we travel.",
      "Unhurried motion is the gift.",
      "A simple route, a significant moment.",
      "We talk without walls around us.",
      "The walk ends somewhere worth arriving.",
      "Joy comes in small bites.",
    ],
  },
  {
    id: "yes_day",
    title: "Yes Day",
    description: "One small request each, full effort.",
    revealCopy: "Yes Day: you each get one small 'yes' request.",
    svg: "<svg width='96' height='96' viewBox='0 0 96 96' xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='g5' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#E6B566'/><stop offset='1' stop-color='#E7A49A'/></linearGradient></defs><rect x='14' y='18' width='68' height='60' rx='18' fill='url(#g5)'/><path d='M32 50l10 10 22-24' fill='none' stroke='#FFF3ED' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'/><circle cx='28' cy='34' r='3' fill='#FFF3ED' opacity='0.75'/><circle cx='70' cy='34' r='4' fill='#FFF3ED' opacity='0.65'/><circle cx='64' cy='66' r='3' fill='#FFF3ED' opacity='0.7'/></svg>",
    clues: [
      "Somebody's about to get their way.",
      "A little generosity goes a long way.",
      "The word 'no' takes a break.",
      "Kindness… with follow-through.",
      "One request. One effort. One smile.",
      "Today, love sounds like agreement.",
      "The treasure is being chosen—on purpose.",
    ],
    clueSetA: [
      "A wish is about to be granted.",
      "Today, love is spelled Y-E-S.",
      "The request matters less than the willingness.",
      "Generosity is the whole point.",
      "One ask. Full follow-through.",
      "We practice saying yes on purpose.",
      "Being chosen is the surprise.",
    ],
    clueSetB: [
      "Someone is about to be delighted.",
      "The answer is already decided.",
      "Effort is the love language here.",
      "We give without negotiating.",
      "A small yes opens something larger.",
      "Today belongs to the one who asks.",
      "Willingness is a form of devotion.",
    ],
  },
  {
    id: "love_letters",
    title: "Love Letter Exchange",
    description: "Short, real notes you can keep.",
    revealCopy:
      "Love Letter Exchange: 5 minutes each. Say what you really feel.",
    svg: "<svg width='96' height='96' viewBox='0 0 96 96' xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='g6' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#F2C6B4'/><stop offset='1' stop-color='#CFA58E'/></linearGradient></defs><rect x='14' y='18' width='68' height='60' rx='18' fill='url(#g6)'/><rect x='24' y='34' width='48' height='32' rx='10' fill='#FFF3ED' opacity='0.9'/><path d='M24 38l24 18 24-18' fill='none' stroke='#B86A4B' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/><path d='M48 34c4-6 14-4 14 4c0 8-14 14-14 14S34 46 34 38c0-8 10-10 14-4z' fill='#B86A4B' opacity='0.85'/></svg>",
    clues: [
      "The treasure starts as a thought.",
      "Something you feel… finally gets shape.",
      "We slow down long enough to mean it.",
      "This one lives longer than a moment.",
      "A message meant for the heart, not the timeline.",
      "If love could speak clearly, it would sound like this.",
      "The treasure is what we've been holding back.",
    ],
    clueSetA: [
      "Something needs to be written.",
      "We reach for words that usually stay inside.",
      "This one will last longer than the moment.",
      "A letter starts as a feeling.",
      "We say it slowly, on purpose.",
      "The page holds what the mouth couldn't.",
      "Words become a kind of treasure.",
    ],
    clueSetB: [
      "Something is waiting to be received.",
      "We read between lines written just for us.",
      "A message crosses the space between hearts.",
      "Ink makes the invisible visible.",
      "This arrives like a gift.",
      "We find each other in the writing.",
      "What was felt is now real.",
    ],
  },
  {
    id: "playlist_swap",
    title: "Playlist Swap",
    description: "Trade 5 songs and listen together.",
    revealCopy: "Playlist Swap: trade 5 songs + listen together.",
    svg: "<svg width='96' height='96' viewBox='0 0 96 96' xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='g7' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#B9D6D4'/><stop offset='1' stop-color='#E7B7A0'/></linearGradient></defs><rect x='14' y='18' width='68' height='60' rx='18' fill='url(#g7)'/><path d='M56 30v26c0 7-10 9-14 5c-4-4-2-11 5-12c3 0 5 1 5 1V34l18-4z' fill='#FFF3ED' opacity='0.9'/><path d='M66 26v18' stroke='#B86A4B' stroke-width='4' stroke-linecap='round'/><circle cx='30' cy='34' r='3' fill='#FFF3ED' opacity='0.7'/><circle cx='70' cy='62' r='4' fill='#FFF3ED' opacity='0.6'/></svg>",
    clues: [
      "This surprise has a rhythm.",
      "It's a vibe you can't explain… only share.",
      "A soundtrack for the version of us we're becoming.",
      "You'll learn something without asking a question.",
      "A connection you can feel without talking.",
      "We'll listen with our whole selves.",
      "The treasure is harmony—two worlds in sync.",
    ],
    clueSetA: [
      "Five songs are being chosen right now.",
      "Music carries what words can't.",
      "You'll hear something that explains everything.",
      "A soundtrack forms between us.",
      "The shuffle is intentional.",
      "Every song is a sentence.",
      "The playlist is a portrait.",
    ],
    clueSetB: [
      "Something is coming through the speakers.",
      "We listen with our whole selves.",
      "The beat knows something we don't.",
      "A song unlocks a door.",
      "We trade frequencies.",
      "What you hear is what I feel.",
      "The music says: this is us.",
    ],
  },
  {
    id: "no_distractions",
    title: "No Distractions Time",
    description: "30 minutes. No phones. Just us.",
    revealCopy: "No Distractions Time: 30 minutes, no phones, just us.",
    svg: "<svg width='96' height='96' viewBox='0 0 96 96' xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='g8' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#E6C27A'/><stop offset='1' stop-color='#B9D6D4'/></linearGradient></defs><rect x='14' y='18' width='68' height='60' rx='18' fill='url(#g8)'/><rect x='34' y='26' width='28' height='44' rx='8' fill='#FFF3ED' opacity='0.9'/><path d='M32 30l32 40' stroke='#B86A4B' stroke-width='5' stroke-linecap='round'/><path d='M48 62c6-8 16-4 16 4c0 10-16 16-16 16S32 76 32 66c0-8 10-12 16-4z' fill='#B86A4B' opacity='0.85'/></svg>",
    clues: [
      "We remove the noise on purpose.",
      "Attention is the rarest form of love.",
      "Nothing extra. Just real.",
      "A pause that makes space for closeness.",
      "This is where presence becomes the gift.",
      "No performance. No multitasking.",
      "The treasure is time… spent like it matters.",
    ],
    clueSetA: [
      "The phone disappears tonight.",
      "We remove the noise on purpose.",
      "Presence is the only requirement.",
      "Nothing competes with this.",
      "The silence is the point.",
      "Full attention is the rarest gift.",
      "We show up with nothing else.",
    ],
    clueSetB: [
      "Distraction takes a break.",
      "Something undivided is offered.",
      "The screen goes dark so we go bright.",
      "We stop performing and just exist.",
      "Time slows when nothing interrupts.",
      "Eye contact is the whole agenda.",
      "This is what it feels like to be enough.",
    ],
  },
];

// Helper to find option by ID
export function getOptionById(id: string): WeeklySurpriseOption | undefined {
  return WEEKLY_SURPRISE_OPTIONS.find((opt) => opt.id === id);
}

// Helper to get all option IDs
export function getAllOptionIds(): string[] {
  return WEEKLY_SURPRISE_OPTIONS.map((opt) => opt.id);
}

// Helper to get a specific clue for an option by day number (1-7)
export function getClueForDay(
  optionId: string,
  dayNumber: number,
  partnerRole?: "A" | "B" | null,
): string | null {
  const option = getOptionById(optionId);
  if (!option || dayNumber < 1 || dayNumber > 7) return null;

  if (partnerRole === "A") {
    return option.clueSetA[dayNumber - 1] || null;
  }
  if (partnerRole === "B") {
    return option.clueSetB[dayNumber - 1] || null;
  }

  return option.clues[dayNumber - 1] || null;
}
