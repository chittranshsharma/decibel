// Curated puzzle banks for Harmonies, Wordzic, Lyricles, and Crosszic.

// ============================================================================
// 1. HARMONIES (Music Connections)
// ============================================================================
export const HARMONIES_PUZZLES = [
  {
    id: 1,
    title: "Puzzle #1: Crate Diggers",
    groups: [
      {
        theme: "Wu-Tang Clan Members",
        level: 1, // Yellow (Easiest)
        color: "bg-amber text-black",
        items: ["GZA", "Ghostface Killah", "Raekwon", "Method Man"],
      },
      {
        theme: "Hyperpop Pioneers & Drain Gang",
        level: 2, // Green
        color: "bg-good text-black",
        items: ["SOPHIE", "Charli XCX", "Bladee", "A. G. Cook"],
      },
      {
        theme: "Colors in Iconic Album Titles",
        level: 3, // Blue
        color: "bg-cyan text-black",
        items: ["Blonde", "Blue", "Black", "Pink"],
      },
      {
        theme: "Sampled on Daft Punk's 'Discovery'",
        level: 4, // Purple (Hardest / Niche)
        color: "bg-pink text-black",
        items: ["Edwin Birdsong", "George Duke", "Sister Sledge", "Tavares"],
      },
    ],
  },
  {
    id: 2,
    title: "Puzzle #2: Sound & Fury",
    groups: [
      {
        theme: "Instruments in a Standard Rock Quartet",
        level: 1,
        color: "bg-amber text-black",
        items: ["Lead Guitar", "Bass", "Drums", "Vocals"],
      },
      {
        theme: "Atlanta Trap Heavyweights",
        level: 2,
        color: "bg-good text-black",
        items: ["Future", "Young Thug", "Gucci Mane", "21 Savage"],
      },
      {
        theme: "Artists Named After Animals",
        level: 3,
        color: "bg-cyan text-black",
        items: ["Gorillaz", "Snoop Dogg", "Cat Power", "Arctic Monkeys"],
      },
      {
        theme: "Key Synthesizers in 80s Pop",
        level: 4,
        color: "bg-pink text-black",
        items: ["Jupiter-8", "DX7", "Minimoog", "Fairlight"],
      },
    ],
  },
  {
    id: 3,
    title: "Puzzle #3: Indie & Underground",
    groups: [
      {
        theme: "Post-Punk & Mid-West Cult Bands",
        level: 1,
        color: "bg-amber text-black",
        items: ["Slint", "American Football", "IDLES", "Duster"],
      },
      {
        theme: "Desi Hip Hop Underground Rappers",
        level: 2,
        color: "bg-good text-black",
        items: ["Dhanji", "Chaar Diwaari", "Rawal", "Prabh Deep"],
      },
      {
        theme: "Words Before 'Pop' to Name a Subgenre",
        level: 3,
        color: "bg-cyan text-black",
        items: ["Bedroom", "Dream", "Hyper", "City"],
      },
      {
        theme: "Producers with Iconic Vocal Tags",
        level: 4,
        color: "bg-pink text-black",
        items: ["Metro Boomin", "Pi'erre Bourne", "Mike WiLL", "Murda Beatz"],
      },
    ],
  },
];

// ============================================================================
// 2. WORDZIC (Music Wordle Lexicon)
// ============================================================================
export const WORDZIC_WORDS = [
  "TEMPO", "VINYL", "ALBUM", "INTRO", "OUTRO", "CHORD", "SCALE", "TRACK",
  "AUDIO", "GENRE", "VOCAL", "PIANO", "SYNTH", "SNARE", "FLUTE", "ORGAN",
  "BRASS", "HIHAT", "PITCH", "STAGE", "SOLOS", "REMIX", "DISCO", "RADIO",
  "TUNER", "PEDAL", "CHART", "SCORE", "BEATS", "SONGS", "BANDS", "DRUMS",
  "SOUND", "AMPLY", "NOTES", "CLEFS", "OPERA", "OCTET", "DUETS", "TRIOS",
  "MOTIF", "BLUES", "POPIN", "METAL", "PUNKS", "FUNKY", "HOUSE", "INDIE",
  "HEAVY", "SUITE", "TREMO", "TONAL", "METER", "BARRE", "CHOIR", "FUZZY",
];

// ============================================================================
// 3. LYRICLES (Song Lyrics Progression Guesser)
// ============================================================================
export const LYRICLES_PUZZLES = [
  {
    id: 1,
    artist: "Kendrick Lamar",
    track: "Not Like Us",
    genre: "Hip-Hop",
    year: 2024,
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/96/f8/f8/96f8f80b-dbb5-f2ca-714e-9c39d5dc6846/mzaf_4599292728755362943.plus.aac.p.m4a",
    lines: [
      "Psst, I see dead people",
      "Mustard on the beat, ho",
      "Aye, Mustard on the beat, ho",
      "Deebo, any rap nigga, he a free throw",
      "Man down, call an amberbulance, tell him, 'Breathe, bro'",
      "They not like us, they not like us, they not like us",
    ],
  },
  {
    id: 2,
    artist: "Jeff Buckley",
    track: "Lover, You Should've Come Over",
    genre: "Rock & Alt",
    year: 1994,
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/bf/16/ef/bf16ef67-fb1f-9f79-42bc-5bbd9a2632b7/mzaf_3086968997576575024.plus.aac.p.m4a",
    lines: [
      "Looking out the door I see the rain fall upon the funeral mourners",
      "Parading in a wake of sad relation as their shoes fill up with water",
      "Maybe I'm too young to keep good love from going wrong",
      "Oh, lover, you should've come over",
      "'Cause it's not too late",
      "My kingdom for a kiss upon her shoulder",
    ],
  },
  {
    id: 3,
    artist: "Charli XCX",
    track: "360",
    genre: "Hyperpop & Pop",
    year: 2024,
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/21/df/b5/21dfb5a2-9a3d-4c38-89c5-846109f298cb/mzaf_13508492023533425515.plus.aac.p.m4a",
    lines: [
      "I went to Paris on a whim, but now I'm back in town",
      "Look in the mirror, yeah, I'm cute, I'm lookin' at a stunner",
      "Call me international, call me 360",
      "I'm everywhere, I'm so Julia",
      "Ah-ah-ah, bumpin' that",
      "When you're in the mirror, do you look at me? I'm your favorite reference",
    ],
  },
  {
    id: 4,
    artist: "The Smiths",
    track: "There Is a Light That Never Goes Out",
    genre: "Indie & Rock",
    year: 1986,
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/7c/4f/9a/7c4f9a08-305c-dfb6-52c6-d98c56c2c8f8/mzaf_10332309832717088924.plus.aac.p.m4a",
    lines: [
      "Take me out tonight",
      "Where there's music and there's people and they're young and alive",
      "Driving in your car, I never, never want to go home",
      "Because I haven't got one anymore",
      "And if a double-decker bus crashes into us",
      "To die by your side is such a heavenly way to die",
    ],
  },
  {
    id: 5,
    artist: "Clairo",
    track: "Sofia",
    genre: "Bedroom Pop",
    year: 2019,
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/71/84/f1/7184f183-f32e-5fbb-e3ec-aa0ca1c169eb/mzaf_16035130456108191264.plus.aac.p.m4a",
    lines: [
      "I think we could do it if we tried",
      "If only to say you're mine",
      "Sofia, the things that you do",
      "You know you can't deny we're something special",
      "I just want to say how I love you",
      "Sofia, the things that you do to me",
    ],
  },
];

// ============================================================================
// 4. CROSSZIC (Mini 5x5 Music Crosswords)
// ============================================================================
export const CROSSZIC_PUZZLES = [
  {
    id: 1,
    title: "Mini #1: Studio Sessions",
    size: 5,
    // 5x5 grid: cells with letters; '#' are blacked out
    grid: [
      ["T", "R", "A", "C", "K"],
      ["E", "#", "U", "#", "E"],
      ["M", "I", "D", "I", "Y"],
      ["P", "#", "I", "#", "S"],
      ["O", "U", "T", "R", "O"],
    ],
    across: [
      { num: 1, row: 0, col: 0, len: 5, clue: "One recorded song on an album", answer: "TRACK" },
      { num: 3, row: 2, col: 0, len: 5, clue: "Universal standard for digital music instruments (abbr.)", answer: "MIDI" },
      { num: 5, row: 4, col: 0, len: 5, clue: "Final concluding section of a song", answer: "OUTRO" },
    ],
    down: [
      { num: 1, row: 0, col: 0, len: 5, clue: "Speed or pace of a musical piece (BPM)", answer: "TEMPO" },
      { num: 2, row: 0, col: 2, len: 5, clue: "Sound or acoustic signal", answer: "AUDIO" },
      { num: 4, row: 0, col: 4, len: 5, clue: "Piano buttons or scale tonalities", answer: "KEYS" },
    ],
  },
  {
    id: 2,
    title: "Mini #2: Live on Stage",
    size: 5,
    grid: [
      ["S", "C", "A", "L", "E"],
      ["N", "#", "L", "#", "P"],
      ["A", "L", "B", "U", "M"],
      ["R", "#", "U", "#", "I"],
      ["E", "C", "M", "U", "C"],
    ],
    across: [
      { num: 1, row: 0, col: 0, len: 5, clue: "Sequence of notes in ascending pitch", answer: "SCALE" },
      { num: 3, row: 2, col: 0, len: 5, clue: "Collection of tracks released as a LP", answer: "ALBUM" },
      { num: 5, row: 4, col: 0, len: 5, clue: "Music genre abbreviation or festival pass", answer: "MUSIC" },
    ],
    down: [
      { num: 1, row: 0, col: 0, len: 5, clue: "Crisp drum in a drum kit with metal wires", answer: "SNARE" },
      { num: 2, row: 0, col: 2, len: 5, clue: "A photo or sound collection book", answer: "ALBUM" },
      { num: 4, row: 0, col: 4, len: 5, clue: "Short for microphonic device used on stage", answer: "MIC" },
    ],
  },
];

export function evaluateWordleGuess(guess, target) {
  if (!guess || !target || guess.length !== 5 || target.length !== 5) {
    return Array(5).fill("absent");
  }
  const res = Array(5).fill("absent");
  const letterCounts = {};

  for (let i = 0; i < 5; i++) {
    const char = target[i];
    letterCounts[char] = (letterCounts[char] || 0) + 1;
  }

  // Pass 1: exact matches
  for (let i = 0; i < 5; i++) {
    if (guess[i] === target[i]) {
      res[i] = "correct";
      letterCounts[guess[i]]--;
    }
  }

  // Pass 2: misplaced matches up to remaining letter frequency
  for (let i = 0; i < 5; i++) {
    if (res[i] === "correct") continue;
    const char = guess[i];
    if (letterCounts[char] && letterCounts[char] > 0) {
      res[i] = "present";
      letterCounts[char]--;
    }
  }

  return res;
}
