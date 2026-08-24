// Genre registry — accurately curated single source of truth across ingest,
// server settings allowlist, and the client's lobby selector.
//
// Accurately classifies Mainstream (critically/commercially established with millions of listeners)
// vs True Underground / Deep Cuts / Niche Scene artists.

export const GENRE_FAMILIES = {
  "hip-hop": {
    label: "Modern Hip-Hop",
    match: /hip-?hop|rap/i,
    mainstream: [
      "Kendrick Lamar", "Drake", "J. Cole", "Travis Scott", "Kanye West",
      "Eminem", "21 Savage", "Tyler, The Creator", "Lil Baby", "Gunna",
      "Lil Wayne", "Future", "A$AP Rocky", "Megan Thee Stallion", "Doja Cat",
      "Jack Harlow", "Post Malone", "Cardi B", "Roddy Ricch", "Polo G",
      "Lil Durk", "Lil Yachty", "Don Toliver", "YoungBoy Never Broke Again",
      "JID", "Denzel Curry", "JPEGMAFIA", "Earl Sweatshirt", "Danny Brown",
      "Freddie Gibbs", "Mac Miller", "Vince Staples", "Baby Keem", "Schoolboy Q",
      "Joey Bada$$", "Cordae", "Saba", "Smino", "Mick Jenkins", "Noname",
    ],
    underground: [
      "Billy Woods", "Armand Hammer", "Mach-Hommy", "Rome Streetz", "Boldy James",
      "MIKE", "MAVI", "Ka", "Roc Marciano", "Quelle Chris", "Navy Blue", "Wiki",
      "AKAI SOLO", "Elucid", "Fly Anakin", "Pink Siifu", "Lord Apex", "Medhane",
      "YL", "Starker", "ANKHLEJOHN", "Theravada", "Preservation", "Nicholas Craven",
      "Moor Mother", "Defcee", "PremRock", "Redveil", "Paris Texas", "Genesis Owusu",
    ],
  },
  "oldschool-hiphop": {
    label: "Old School Rap",
    match: /hip-?hop|rap/i,
    mainstream: [
      "2Pac", "The Notorious B.I.G.", "Wu-Tang Clan", "Nas", "Snoop Dogg",
      "Dr. Dre", "Ice Cube", "Jay-Z", "A Tribe Called Quest", "Outkast",
      "Cypress Hill", "Fugees", "Eazy-E", "LL Cool J", "Big L", "Mobb Deep",
      "Public Enemy", "Gang Starr", "Busta Rhymes", "N.W.A", "DMX", "Bone Thugs-N-Harmony",
      "MF DOOM", "Mos Def", "Talib Kweli", "Common", "Big Pun", "Warren G",
      "Slick Rick", "Rakim", "KRS-One", "Redman", "The Roots", "De La Soul",
      "Method Man", "Raekwon", "Ghostface Killah", "GZA",
    ],
    underground: [
      "Jeru the Damaja", "Big Daddy Kane", "Kool G Rap", "Camp Lo", "Souls of Mischief",
      "Hieroglyphics", "Pete Rock & CL Smooth", "Smif-N-Wessun", "O.C.", "Lord Finesse",
      "Diamond D", "Jedi Mind Tricks", "Dilated Peoples", "Jurassic 5",
      "Del The Funky Homosapien", "Artifacts", "Brand Nubian", "Company Flow",
      "Blackalicious", "Showbiz & A.G.", "Non Phixion", "Necro", "Ill Bill",
      "Cannibal Ox", "Organized Konfusion", "Cella Dwellas", "Shadez of Brooklyn",
    ],
  },
  trap: {
    label: "Trap & Rage",
    match: null,
    mainstream: [
      "Future", "Young Thug", "Gucci Mane", "Migos", "21 Savage", "Lil Baby",
      "Gunna", "Lil Uzi Vert", "2 Chainz", "Metro Boomin", "Quavo", "Offset",
      "Rae Sremmurd", "Waka Flocka Flame", "T.I.", "Chief Keef", "Young Jeezy",
      "Playboi Carti", "Yeat", "Ken Carson", "Destroy Lonely", "Don Toliver",
      "Sheck Wes", "Roddy Ricch", "Moneybagg Yo", "Kodak Black", "Key Glock", "Young Dolph",
    ],
    underground: [
      "Lucki", "Summrs", "Autumn!", "Kankan", "Homixide Gang", "UnoTheActivist",
      "Thouxanbanfauni", "SahBabii", "Duwap Kaine", "Hardrock", "Osamason", "Che",
      "Lazer Dim 700", "xaviersobound", "Hi-C", "SpaceGhostPurrp", "Black Kray",
      "Sickboyrari", "Tony Shhnow", "10kdunkin", "Slimesito", "Fluhkunxhkos",
      "Lancey Foux", "MDMA", "Izaya Tiji", "Texako", "Rich Amiri", "Glokk40Spaz", "Cartier'God",
    ],
  },
  hyperpop: {
    label: "Hyperpop & Digicore",
    match: /hyperpop|digicore|glitchcore/i,
    mainstream: [
      "Charli XCX", "100 gecs", "SOPHIE", "A. G. Cook", "Bladee", "Ecco2k",
      "Thaiboy Digital", "2hollis", "Jane Remover", "Brakence", "Glaive", "Ericdoa",
      "PinkPantheress", "Dorian Electra", "Caroline Polachek", "Rina Sawayama",
      "Danny L Harle", "Rebecca Black", "Kero Kero Bonito", "Drain Gang",
    ],
    underground: [
      "Underscores", "Midwxst", "Aldn", "Sebii", "Blackwinterwells", "Osquinn",
      "Quinn", "Dltzk", "Alice Gas", "8485", "Fraxiom", "Food House", "Slayyyter",
      "That Kid", "Namasenda", "Hannah Diamond", "GFOTY", "Sega Bodega",
      "Alice Longyu Gao", "Daine", "CMTEN", "Kurtains", "Angelus", "Petal Supply",
      "Frost Children", "Cowgirl Clue", "Snow Strippers", "Six Impala", "Himera",
    ],
  },
  "desi-hip-hop": {
    label: "Desi Hip Hop",
    match: /desi hip hop|indian hip hop|punjabi hip hop/i,
    mainstream: [
      // OG specified keeps
      "KR$NA", "Seedhe Maut", "MC Stan", "Talha Anjum", "Talhah Yunus",
      "Ikka", "King", "Young Stunners", "Raga",
      // Scene-famous, substantial following
      "Arpit Bala", "Chaar Diwaari", "Nanku", "Karun",
      "Yashraj", "Tienas", "Rawal", "Prabh Deep", "Ahmer",
      "Siyaahi", "Swadesi", "Dhanji", "Tarun",
    ],
    underground: [
      // User-requested deep cuts
      "Prathamesh", "Naam Sujal", "Vichaar", "Shauharty", "MC Altaf",
      // True underground / niche scene
      "Frappe Ash", "Full Power", "The Siege", "Bagi Munda",
      "Mark Bhatia", "Darcy", "Qaab", "Sikander Kahlon",
      "SOS", "Straight Outta Srinagar", "Wolf.Cryman", "Tsumyoki",
      "Farhan Khan", "DRV", "Panther", "EPR Iyer", "Umer Anjum",
      "Lil Kabeer", "Smoke", "Ruab", "Sammad", "Rebel 7", "Bharg",
    ],
  },
  rock: {
    label: "Rock & Alt Rock",
    match: /rock|metal|punk|grunge|alternative/i,
    mainstream: [
      "Queen", "AC/DC", "Nirvana", "Linkin Park", "Foo Fighters", "Led Zeppelin",
      "Guns N' Roses", "Red Hot Chili Peppers", "Green Day", "Metallica", "Aerosmith",
      "The Rolling Stones", "Pink Floyd", "The Beatles", "Pearl Jam", "Soundgarden",
      "Blink-182", "System of a Down", "Arctic Monkeys", "The Killers", "Radiohead",
      "Muse", "Fall Out Boy", "Paramore", "My Chemical Romance", "Smashing Pumpkins",
      "Jeff Buckley", "The Smiths", "Depeche Mode", "The Cure",
    ],
    underground: [
      "Black Country, New Road", "Fontaines D.C.", "King Gizzard & The Lizard Wizard",
      "IDLES", "Slint", "Swans", "Parannoul", "Turnstile", "Title Fight",
      "American Football", "Have a Nice Life", "Slowdive", "My Bloody Valentine",
      "Cocteau Twins", "Geese", "Squid", "black midi", "Deafheaven", "Unwound",
      "Fugazi", "Built to Spill", "Dinosaur Jr.", "Neutral Milk Hotel", "The Microphones",
      "Chat Pile", "Protomartyr", "Touché Amoré", "Cap'n Jazz", "Algernon Cadwallader",
      "Snowing", "Narrow Head", "Fleshwater", "Hotline TNT", "Model/Actriz",
    ],
  },
  indie: {
    label: "Indie & Alt",
    match: /alternative|indie/i,
    mainstream: [
      "Arctic Monkeys", "Tame Impala", "The 1975", "The Strokes", "Radiohead",
      "Hozier", "Glass Animals", "Cage The Elephant", "Vampire Weekend",
      "Florence + The Machine", "Two Door Cinema Club", "MGMT", "Foster The People",
      "Phoenix", "The Black Keys", "Lorde", "Lana Del Rey", "Mitski", "Phoebe Bridgers", "boygenius",
      "Jeff Buckley", "Elliott Smith", "Fiona Apple", "The Smiths",
    ],
    underground: [
      "Car Seat Headrest", "Alvvays", "Japanese Breakfast", "Alex G", "Big Thief",
      "Sufjan Stevens", "Weyes Blood", "Lucy Dacus", "Julien Baker", "Beach Fossils",
      "DIIV", "Wild Nothing", "Real Estate", "Porches", "Slaughter Beach, Dog",
      "Pinegrove", "Grizzly Bear", "Fleet Foxes", "Animal Collective", "Deerhunter",
      "Hovvdy", "Wednesday", "MJ Lenderman", "bar italia", "Mount Eerie", "Florist",
      "feeble little horse", "Water From Your Eyes", "Horse Jumper of Love", "Duster", "Panchiko",
    ],
  },
  "bedroom-pop": {
    label: "Bedroom & Dream Pop",
    match: /bedroom pop|dream pop|lo-fi|indie pop/i,
    mainstream: [
      "Clairo", "Rex Orange County", "Cavetown", "Girl In Red", "Cuco",
      "Boy Pablo", "Conan Gray", "Beabadoobee", "Wallows", "Dominic Fike",
      "Gus Dapperton", "Still Woozy", "Omar Apollo", "BENEE", "Mac DeMarco",
      "TV Girl", "The Marías", "Men I Trust",
    ],
    underground: [
      "Crumb", "Current Joys", "Eyedress", "Loving", "Jakob", "Vansire",
      "TEMPOREX", "Monsune", "Goth Babe", "Summer Salt", "Far Caspian",
      "spill tab", "Banes World", "Dream, Ivory", "Strawberry Guy", "No Vacation",
      "Puma Blue", "Feng Suave", "Mild High Club", "HOMESHAKE", "SALES",
      "Cosmo Pyke", "Jakob Ogawa", "Yellow Days", "Beach Vacation", "CASTLEBEAT",
      "Jerry Paper", "Boyscott", "Good Morning", "Paul Cherry",
    ],
  },
  rnb: {
    label: "R&B & Soul",
    match: /r&b|soul|funk|neo-soul/i,
    mainstream: [
      "SZA", "The Weeknd", "Frank Ocean", "Beyoncé", "Brent Faiyaz", "Daniel Caesar",
      "Usher", "Chris Brown", "Alicia Keys", "Rihanna", "Bryson Tiller", "Giveon",
      "H.E.R.", "Summer Walker", "Jhené Aiko", "Bruno Mars", "Silk Sonic",
      "Kehlani", "Khalid", "PARTYNEXTDOOR", "Mariah Carey", "Whitney Houston",
      "Kelela", "Sampha", "FKA twigs", "Snoh Aalegra", "Omar Apollo", "SiR", "Lucky Daye",
    ],
    underground: [
      "Ravyn Lenae", "Liv.e", "Dijon", "Mk.gee", "Rochelle Jordan", "Blood Orange",
      "Cleo Sol", "SAULT", "Choker", "Orion Sun", "Sudan Archives", "Joyce Wrice",
      "serpentwithfeet", "Arlo Parks", "Charlotte Day Wilson", "Moses Sumney",
      "Jamila Woods", "Gallant", "Amber Mark", "Erika de Casier", "Mahalia",
      "Yebba", "Masego", "Syd", "George Maple", "UMI", "Kelsey Lu", "Kadhja Bonet",
    ],
  },
  pop: {
    label: "Mainstream Pop",
    match: /(?<![a-z-])pop\b|singer\/songwriter/i,
    mainstream: [
      "Taylor Swift", "Dua Lipa", "Billie Eilish", "Ariana Grande", "Bruno Mars",
      "Sabrina Carpenter", "Justin Bieber", "Katy Perry", "Lady Gaga", "Rihanna",
      "Ed Sheeran", "Olivia Rodrigo", "Harry Styles", "Miley Cyrus", "Adele",
      "Tate McRae", "Selena Gomez", "Charlie Puth", "Chappell Roan", "Maroon 5",
      "Britney Spears", "Madonna", "Kelly Clarkson", "Shawn Mendes", "Camila Cabello",
    ],
    underground: [
      "Magdalena Bay", "Remi Wolf", "Allie X", "The Japanese House", "Sky Ferreira",
      "Yeule", "Empress Of", "Carly Rae Jepsen", "Marina", "Rina Sawayama",
      "Maisie Peters", "Fletcher", "Gracie Abrams", "Holly Humberstone", "Blu DeTiger",
      "Ethel Cain", "Tori Kelly", "Donna Missal", "CYN", "Lolo Zouaï",
    ],
  },
  "desi-indie": {
    label: "Desi Indie & Alt",
    match: /indian indie|desi indie|indian alternative|fusion/i,
    mainstream: [
      "Prateek Kuhad", "Anuv Jain", "The Local Train", "When Chai Met Toast",
      "Lifafa", "Peter Cat Recording Co.", "Zaeden", "Sanam", "Parekh & Singh",
      "Twin Strings", "Raghav Chaitanya", "Shilpa Rao", "Lucky Ali", "Jasleen Royal",
    ],
    underground: [
      "Begum", "Tejas", "Raghav Meattle", "Cinema of the Abstract", "Dhrruv",
      "Bawari Basanti", "Kamakshi Khanna", "Taba Chake", "Thermal And A Quarter",
      "Bloodywood", "dot.", "Hanita Bhambri", "Swarathma", "Gauley Bhai",
      "Shantanu Pandit", "Midival Punditz", "Karsh Kale", "Aditi Ramesh",
      "Shadow and Light", "Ditty", "The F16s", "Skrat", "The Yellow Diary",
    ],
  },
};

// Ensure backwards compatibility with seedArtists array
for (const key of Object.keys(GENRE_FAMILIES)) {
  const fam = GENRE_FAMILIES[key];
  fam.seedArtists = [...(fam.mainstream || []), ...(fam.underground || [])];
}

// Ordered list of playable genre keys. First entry is the game default.
export const GENRE_KEYS = Object.keys(GENRE_FAMILIES);

// Families whose members can be recognised from Apple's own genre label.
export const MATCHED_GENRE_KEYS = GENRE_KEYS.filter((k) => GENRE_FAMILIES[k].match);

export function familiesForAppleGenre(appleGenre) {
  const name = String(appleGenre ?? "");
  if (!name) return [];
  return MATCHED_GENRE_KEYS.filter((key) => GENRE_FAMILIES[key].match.test(name));
}

export function isGenreKey(key) {
  return Object.prototype.hasOwnProperty.call(GENRE_FAMILIES, String(key ?? "").toLowerCase());
}

export function seedArtistsFor(key, vibe = "all") {
  const fam = GENRE_FAMILIES[String(key ?? "").toLowerCase()];
  if (!fam) return [];
  if (vibe === "mainstream" && Array.isArray(fam.mainstream)) {
    return fam.mainstream.slice();
  }
  if (vibe === "underground" && Array.isArray(fam.underground)) {
    return fam.underground.slice();
  }
  return fam.seedArtists.slice();
}

export function isUndergroundArtist(artistName, genreKey) {
  const fam = GENRE_FAMILIES[String(genreKey ?? "").toLowerCase()];
  if (!fam || !fam.underground) return false;
  const name = String(artistName ?? "").toLowerCase();
  return fam.underground.some((u) => u.toLowerCase() === name);
}

export default GENRE_FAMILIES;
