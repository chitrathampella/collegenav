// src/data/graph.js

// --- CRITICAL ---
// This graph combines your detailed internal block data with an AI-generated
// LANDMARKS_HUB connecting your nodeCoordinates and block portals.
// Connections and weights in LANDMARKS_HUB are ESTIMATES. Some weights have been
// AGGRESSIVELY adjusted to prioritize direct routes and penalize detours via GATES.
// This is a "Sledgehammer" approach for debugging. If this works, you'll
// need to fine-tune these extreme weights back to more realistic relative values.
// YOU MUST REVIEW, TEST, AND CUSTOMIZE THIS GRAPH EXTENSIVELY.
//
// 'nodeKey': { 'connectedNodeKey': estimated_distance, ... }

export const buildingGraphs = {
  "NB": {
    "B309": { "B209": 4.7, "B310": 10.4, "NB_BLOCK": 15 },
    "B209": { "B309": 4.7, "B310": 6.7, "B210": 7.1, "B109": 7.3, "NB_BLOCK": 10 },
    "B310": { "B209": 6.7, "B309": 10.4, "B210": 7.9, "NB_BLOCK": 12 },
    "B210": { "B310": 7.9, "B302,B303": 12.6, "B209": 7.1, "B110": 4, "NB_BLOCK": 8 },
    "B302,B303": { "B210": 12.6, "B110": 13.8, "NB_BLOCK": 5 },
    "B110": { "B302,B303": 13.8, "B210": 4, "B109": 5, "NB_BLOCK": 7 },
    "B109": { "B209": 7.3, "B110": 5, "B107": 12.1, "NB_BLOCK": 9 },
    "B308": { "B207": 5.4, "NB_BLOCK": 18 },
    "B207": { "B308": 5.4, "B107": 5.4, "B206": 20.2, "NB_BLOCK": 12 },
    "B107": { "B109": 12.1, "B207": 5.4, "B106": 15.3, "NB_BLOCK": 10 },
    "B106": { "B107": 15.3, "B105": 2.3, "B206": 5.1, "CANTEEN_NB": 3, "NB_BLOCK": 10 },
    "B105": { "B106": 2.3, "B206": 4.8, "B205": 4.8, "B104": 5.4, "CANTEEN_NB": 2.5, "NB_BLOCK": 11 },
    "B206": { "B207": 20.2, "B106": 5.1, "B105": 4.8, "B205": 1.9, "B307": 4, "NB_BLOCK": 14 },
    "B205": { "B105": 4.8, "B206": 1.9, "B307": 3.7, "B104": 9.5, "NB_BLOCK": 15 },
    "B307": { "B206": 4, "B205": 3.7, "B104": 13, "NB_BLOCK": 16 },
    "B104": { "B105": 5.4, "B205": 9.5, "B307": 13, "CANTEEN_NB": 1.9, "B305": 5.5, "NB_BLOCK": 9 },
    "CANTEEN_NB": { "B104": 1.9, "B305": 6.4, "B106": 3, "B105": 2.5, "NB_BLOCK": 5 },
    "B305": { "B104": 5.5, "CANTEEN_NB": 6.4, "NB_BLOCK": 10 },
    "NB_BLOCK": {
        "B309": 15, "B209": 10, "B310": 12, "B210": 8, "B302,B303": 5, "B110": 7, "B109": 9,
        "B308": 18, "B207": 12, "B107": 10, "B106": 10, "B105":11, "B206":14, "B205":15, "B307":16,
        "B104":9, "B305":10, "CANTEEN_NB": 5
    }
  },
  "NA": {
    "A315": { "A316": 6.9, "A314": 15.2, "NA_BLOCK": 10 },
    "A316": { "A315": 6.9, "A317": 8.1, "A111": 15.4, "NA_BLOCK": 9 },
    "A314": { "A315": 15.2, "A212": 5.1, "A312": 16.2, "NA_BLOCK": 8 },
    "A317": { "A316": 8.1, "A202": 3.9, "A301": 7.1, "NA_BLOCK": 12 },
    "A111": { "A316": 15.4, "A212": 2.2, "A110": 8.4, "NA_BLOCK": 6 },
    "A212": { "A314": 5.1, "A111": 2.2, "A211": 17.2, "NA_BLOCK": 5 },
    "A312": { "A314": 16.2, "A211": 3.7, "A311A": 4.9, "NA_BLOCK": 7 },
    "A202": { "A317": 3.9, "A301": 4.4, "A302": 7, "NA_BLOCK": 11 },
    "A301": { "A317": 7.1, "A202": 4.4, "A302": 7.4, "NA_BLOCK": 10 },
    "A211": { "A212": 17.2, "A312": 3.7, "A311A": 4, "A210": 1, "A110": 5.1, "A311": 5.4, "NA_BLOCK": 4 },
    "A311A": { "A312": 4.9, "A211": 4, "A311": 7.3, "NA_BLOCK": 6 },
    "A302": { "A202": 7, "A301": 7.4, "A112": 13, "NA_BLOCK": 9 },
    "A110": { "A111": 8.4, "A211": 5.1, "A210": 5.1, "A109": 3.8, "NA_BLOCK": 5 },
    "A210": { "A211": 1, "A110": 5.1, "A311": 5.3, "A207": 14.1, "A109": 8.9, "A209": 9.3, "NA_BLOCK": 3 },
    "A311": { "A211": 5.4, "A311A": 7.3, "A210": 5.3, "A310": 8, "NA_BLOCK": 5 },
    "A112": { "A302": 13, "A205": 7.4, "A305": 2.8, "NA_BLOCK": 7 },
    "A205": { "A112": 7.4, "A305": 5.9, "A206": 7.6, "NA_BLOCK": 6 },
    "A305": { "A112": 2.8, "A205": 5.9, "A206": 6.3, "NA_BLOCK": 5 },
    "A207": { "A210": 14.1, "A206": 7.6, "A307": 3.4, "A208": 3.6, "NA_BLOCK": 8 },
    "A109": { "A110": 3.8, "A210": 8.9, "A209": 4.1, "A208": 4.2, "NA_BLOCK": 6 },
    "A209": { "A210": 9.3, "A109": 4.1, "A208": 3.2, "A309": 4, "NA_BLOCK": 7 },
    "A206": { "A205": 7.6, "A305": 6.3, "A207": 7.6, "A307": 9.3, "NA_BLOCK": 7 },
    "A307": { "A207": 3.4, "A206": 9.3, "A308": 7.3, "NA_BLOCK": 9 },
    "A208": { "A207": 3.6, "A109": 4.2, "A209": 3.2, "A308": 3.3, "NA_BLOCK": 8 },
    "A309": { "A209": 4, "A310": 3.8, "A308": 6.7, "NA_BLOCK": 8 },
    "A310": { "A311": 8, "A309": 3.8, "NA_BLOCK": 9 },
    "A308": { "A208": 3.3, "A309": 6.7, "A307": 7.3, "NA_BLOCK": 9 },
    "NA_BLOCK": {
        "A315":10, "A316":9, "A314":8, "A317":12, "A111":6, "A212":5, "A312":7, "A202":11,
        "A301":10, "A211":4, "A311A":6, "A302":9, "A110":5, "A210":3, "A311":5, "A112":7,
        "A205":6, "A305":5, "A207":8, "A109":6, "A209":7, "A206":7, "A307":9, "A208":8,
        "A309":8, "A310":9, "A308":9
    }
  },
  "MAIN": {
    "M401": { "M202": 12.9, "M203": 9.1, "MAIN_BLOCK": 10 },
    "M202": { "M401": 12.9, "M201": 10.9, "M203": 5.4, "RECEPTION": 3.5, "M11": 17.8, "MAIN_BLOCK": 5 },
    "M203": { "M401": 9.1, "M202": 5.4, "M204": 7.1, "RECEPTION": 4.9, "M16": 22.8, "MAIN_BLOCK": 6 },
    "M201": { "M202": 10.9, "M1": 3.1, "MAIN_BLOCK": 7 },
    "RECEPTION": { "M202": 3.5, "M203": 4.9, "M1": 11.7, "M16": 9.2, "WAITING_HALL": 18.2, "MINERAL_WATER": 8.8, "MAIN_BLOCK": 0 },
    "M11": { "M202": 17.8, "M1": 14.3, "MINERAL_WATER": 5.7, "M15": 5.5, "M16": 6.1, "M13": 9.4, "M18": 16.8, "MAIN_BLOCK": 8 },
    "M204": { "M203": 7.1, "M205": 7.6, "WAITING_HALL": 6.7, "M12": 19.9, "MAIN_BLOCK": 7 },
    "M16": { "M203": 22.8, "RECEPTION": 9.2, "M11": 6.1, "M15": 8.7, "M14": 4.1, "M18": 12, "MAIN_BLOCK": 7 },
    "M1": { "M201": 3.1, "RECEPTION": 11.7, "M15": 4.6, "M11": 14.3, "M13": 4.2, "MAIN_BLOCK": 8 },
    "WAITING_HALL": { "RECEPTION": 18.2, "M204": 6.7, "M205": 4.1, "M206": 7.3, "M12": 4.8, "MINERAL_WATER": 22, "MAIN_BLOCK": 0 },
    "MINERAL_WATER": { "M11": 5.7, "RECEPTION": 8.8, "WAITING_HALL": 22, "MAIN_BLOCK": 0 },
    "M15": { "M11": 5.5, "M16": 8.7, "M1": 4.6, "M13": 4.1, "M18": 13.6, "MAIN_BLOCK": 9 },
    "M13": { "M11": 9.4, "M1": 4.6, "M15": 4.1, "M14": 12.7, "M20": 12.7, "M21": 20.4, "MAIN_BLOCK": 10 },
    "M18": { "M11": 16.8, "M16": 12, "M15": 13.6, "M14": 7.4, "M20": 4.9, "M21": 12.6, "M25": 25, "MAIN_BLOCK": 11 },
    "M205": { "M204": 7.6, "WAITING_HALL": 4.1, "M206": 6.2, "M12": 14.3, "MAIN_BLOCK": 8 },
    "M206": { "M205": 6.2, "WAITING_HALL": 7.3, "M12": 14.1, "MAIN_BLOCK": 9 },
    "M12": { "M204": 19.9, "M205": 14.3, "M206": 14.1, "WAITING_HALL": 4.8, "M17": 11.5, "M19": 23.4, "MAIN_BLOCK": 10 },
    "M14": { "M16": 4.1, "M13": 12.7, "M18": 7.4, "M17": 13.7, "M20": 12.1, "MAIN_BLOCK": 10 },
    "M20": { "M13": 12.7, "M18": 4.9, "M14": 12.1, "M21": 7.7, "M23": 12.6, "MAIN_BLOCK": 12 },
    "M21": { "M13": 20.4, "M18": 12.6, "M20": 7.7, "M23": 4.9, "M24": 14.9, "M25": 10.4, "MAIN_BLOCK": 13 },
    "M17": { "M12": 11.5, "M14": 13.7, "M19": 12, "M22": 24.4, "MAIN_BLOCK": 12 },
    "M19": { "M12": 23.4, "M17": 12, "M22": 12.5, "M27": 17, "MAIN_BLOCK": 13 },
    "M25": { "M18": 25, "M21": 10.4, "M23": 6.4, "M24": 10.5, "M26": 10, "MAIN_BLOCK": 14 },
    "M23": { "M20": 12.6, "M21": 4.9, "M25": 6.4, "MAIN_BLOCK": 13 },
    "M22": { "M17": 24.4, "M19": 12.5, "M26": 10.5, "M27": 10.9, "MAIN_BLOCK": 14 },
    "M24": { "M21": 14.9, "M25": 10.5, "MAIN_BLOCK": 15 },
    "M26": { "M25": 10, "M22": 10.5, "M27": 10.9, "MAIN_BLOCK": 15 },
    "M27": { "M19": 17, "M22": 10.9, "M26": 10.9, "M28": 6.8, "MAIN_BLOCK": 16 },
    "M28": { "M27": 6.8, "MAIN_BLOCK": 17 },
    "MAIN_BLOCK": {
        "M401":10, "M202":5, "M203":6, "M201":7, "RECEPTION":0, "M11":8, "M204":7, "M16":7, "M1":8,
        "WAITING_HALL":0, "MINERAL_WATER":0, "M15":9, "M13":10, "M18":11, "M205":8, "M206":9, "M12":10,
        "M14":10, "M20":12, "M21":13, "M17":12, "M19":13, "M25":14, "M23":13, "M22":14, "M24":15,
        "M26":15, "M27":16, "M28":17
    }
  },
  "O": {
    "O401": { "O301": 5.4, "O_BLOCK": 10 },
    "O301": { "O401": 5.4, "O201": 4.9, "O203": 10.3, "O_BLOCK": 8 },
    "O201": { "O301": 4.9, "O203": 4.9, "O206": 17.4, "O_BLOCK": 6 },
    "O203": { "O301": 10.3, "O201": 4.9, "O303": 26.1, "O_BLOCK": 7 },
    "O206": { "O201": 17.4, "O306": 6.8, "O205": 7.9, "O_BLOCK": 5 },
    "O303": { "O203": 26.1, "O403": 7.7, "O_BLOCK": 9 },
    "O306": { "O206": 6.8, "O406": 6.2, "O205": 9.8, "O305": 9.6, "O_BLOCK": 4 },
    "O205": { "O206": 7.9, "O306": 9.8, "O305": 5.4, "O_BLOCK": 6 },
    "O403": { "O303": 7.7, "O405": 29.8, "O_BLOCK": 11 },
    "O406": { "O306": 6.2, "O305": 11.3, "O405": 9.8, "O_BLOCK": 5 },
    "O305": { "O306": 9.6, "O205": 5.4, "O406": 11.3, "O405": 6.6, "O_BLOCK": 7 },
    "O405": { "O403": 29.8, "O406": 9.8, "O305": 6.6, "O_BLOCK": 8 },
    "O_BLOCK": {
        "O401":10, "O301":8, "O201":6, "O203":7, "O206":5, "O303":9, "O306":4,
        "O205":6, "O403":11, "O406":5, "O305":7, "O405":8
    }
  },

  "LANDMARKS_HUB": {
    // === Physical Path Nodes (from nodeCoordinates.js) & their interconnections ===
    "GATES":              { "PHAR_ENT": 15, "FACULTY_PARKING": 5, "BUS_PARKING_AREA": 60, "WATER_HARVESTING_POINT": 35,
                            "MAIN_PATH_ENT": 999, "NB_ENT": 999 }, // VERY EXPENSIVE from GATES deeper

    "NB_ENT":             { "GATES": 999, "NB_EXIT": 10, "NB_BLOCK": 2, "MAIN_PATH_ENT": 30 },
    "NB_EXIT":            { "NB_ENT": 10, "NB_EXIT2": 25, "NB_BLOCK": 2 },
    "NB_EXIT2":           { "NB_EXIT": 25, "PHAR_ENT2": 15, "NB_BLOCK": 2 },

    "PHAR_ENT":           { "GATES": 15, "PHAR_ENT2": 20, "PHARMACY_BLOCK": 2 },
    "PHAR_ENT2":          { "NB_EXIT2": 15, "PHAR_ENT": 20, "PHARMACY_BLOCK": 2 },

    "MAIN_PATH_ENT":      { "GATES": 999, // <<<<<<< FORCEFULLY MAKE GOING TO GATES FROM HERE EXPENSIVE
                            "NA_ENT": 5,    // << VERY CHEAP to NA_ENT (NA Block exit/entry)
                            "MAIN_PATH_ENT2": 5, // << VERY CHEAP to go south on main path
                            "MAIN_BLOCK": 2,
                            "NB_ENT": 30 },
    "MAIN_PATH_ENT2":     { "MAIN_PATH_ENT": 5, "NA_EXIT1": 10, "MAIN_PATH_EXIT1": 10 },
    "NA_ENT":             { "MAIN_PATH_ENT": 5, "NA_EXIT1": 30, "NA_BLOCK": 2 },
    "NA_EXIT1":           { "NA_ENT": 30, "MAIN_PATH_ENT2": 10, "NA_BLOCK": 2 },

    "MAIN_PATH_EXIT1":    { "MAIN_PATH_ENT2": 10, "MAIN_PATH1": 15 },
    "MAIN_PATH1":         { "MAIN_PATH_EXIT1": 15, "MAIN_PATH2": 15, "CANTEEN_PATH1": 40, "SOLAR_POWER_POINT": 60 },
    "MAIN_PATH2":         { "MAIN_PATH1": 15, "MAIN_PATH3": 15, "MAIN_PATH_EXIT2": 10, "NCC_AREA_PLAYGROUND": 35 },
    "MAIN_PATH3":         { "MAIN_PATH2": 15, "O_ENT_PATH1": 5 },

    "O_ENT_PATH1":        { "MAIN_PATH3": 5, "O_ENT_PATH2": 30, "O_BLOCK": 2, "NCC_AREA_PLAYGROUND": 30 },
    "O_ENT_PATH2":        { "O_ENT_PATH1": 30, "O_ENT_PATH3": 10, "WATER_HARVESTING_POINT": 25 },
    "O_ENT_PATH3":        { "O_ENT_PATH2": 10, "O_BLOCK": 2 },

    "CANTEEN_PATH1":      { "MAIN_PATH1": 40, "CANTEEN_MIDDLE": 10 },
    "CANTEEN_MIDDLE":     { "CANTEEN_PATH1": 10, "MAIN_PATH_EXIT2": 8, "CANTEEN_MAIN": 2, "CANTEEN_NEW": 20, "MINERAL_WATER": 5, "O_BLOCK": 1000 },
    "MAIN_PATH_EXIT2":    { "MAIN_PATH2": 10, "CANTEEN_MIDDLE": 8, "BAHUBALI_BUILDING": 25 },


    // === Abstract Block Portals & Major Landmarks ===
    "NB_BLOCK": {
      "NB_ENT": 2, "NB_EXIT": 2, "NB_EXIT2": 2,
      "MAIN_BLOCK": 45,
      "NA_BLOCK": 25,
      "PHARMACY_BLOCK": 20,
      "GATES": 1000, // << SUPER EXPENSIVE
      "BUS_PARKING_AREA": 75
    },
    "NA_BLOCK": {
      "NA_ENT": 2, "NA_EXIT1": 2,
      "MAIN_BLOCK": 1,  // <<<<<<<<<<<<<<<<<<< INSANELY CHEAP TO MAIN_BLOCK
      "NB_BLOCK": 25,
      "GATES": 1000,       // <<<<<<<<<<<<<<<<<<< INSANELY EXPENSIVE TO GATES
      "FACULTY_PARKING": 1000, // <<<<<<<<<<<<<<< INSANELY EXPENSIVE TO FACULTY PARKING
      "NCC_AREA_PLAYGROUND": 25,
      "WATER_HARVESTING_POINT": 55
    },
    "MAIN_BLOCK": {
      "MAIN_PATH_ENT": 2,
      "NB_BLOCK": 45,
      "NA_BLOCK": 1,    // <<<<<<<<<<<<<<<<<<< INSANELY CHEAP (symmetrical)
      "O_BLOCK": 1,     // <<<<<<<<<<<<<<<<<<< INSANELY CHEAP TO O_BLOCK
      "GATES": 1000,       // <<<<<<<<<<<<<<<<<<< INSANELY EXPENSIVE
      "RECEPTION": 0, "WAITING_HALL": 0, "MINERAL_WATER": 0,
      "BUS_PARKING_AREA": 100, "SOLAR_POWER_POINT": 30, "BAHUBALI_BUILDING": 45, "CANTEEN_NEW": 35
    },
    "O_BLOCK": {
      "O_ENT_PATH1": 2, "O_ENT_PATH3": 2,
      "MAIN_BLOCK": 1,  // <<<<<<<<<<<<<<<<<<< INSANELY CHEAP
      "GATES": 1000,       // <<<<<<<<<<<<<<<<<<< INSANELY EXPENSIVE
      "H_BLOCK": 25, "GOVT_MED_COLLEGE": 20,
      "CANTEEN_MAIN": 25,
      "CANTEEN_MIDDLE": 1000
    },
    "PHARMACY_BLOCK": {
      "PHAR_ENT": 2, "PHAR_ENT2": 2,
      "NB_BLOCK": 20, "GATES": 15,
      "FACULTY_PARKING": 15
    },
    "FACULTY_PARKING":    { "GATES": 5,
                            "NA_BLOCK": 1000, // <<<<<<<<<<<<<<< INSANELY EXPENSIVE
                            "PHARMACY_BLOCK": 15,
                            "WATER_HARVESTING_POINT": 30 },

    // --- Other Standalone Landmarks ---
    "BUS_PARKING_AREA":   { "GATES": 45, "NB_BLOCK": 75, "H_BLOCK": 70 },
    "NCC_AREA_PLAYGROUND":{ "NA_BLOCK": 25, "MAIN_PATH2": 35, "O_ENT_PATH1": 25 },
    "CANTEEN_MAIN":       { "CANTEEN_MIDDLE": 2, "O_BLOCK": 25 },
    "WATER_HARVESTING_POINT": { "O_ENT_PATH2": 25, "FACULTY_PARKING": 30, "GATES": 35 },
    "SOLAR_POWER_POINT":  { "MAIN_PATH1": 50, "MAIN_BLOCK": 30, "BAHUBALI_BUILDING": 40 },
    "BAHUBALI_BUILDING":  { "MAIN_PATH_EXIT2": 25, "MAIN_BLOCK": 45, "CANTEEN_NEW": 20, "SOLAR_POWER_POINT": 40 },
    "CANTEEN_NEW":        { "CANTEEN_MIDDLE": 15, "BAHUBALI_BUILDING": 20, "MAIN_BLOCK": 35 },
    "H_BLOCK":            { "O_BLOCK": 25, "GOVT_MED_COLLEGE": 15, "BUS_PARKING_AREA": 70 },
    "GOVT_MED_COLLEGE":   { "O_BLOCK": 20, "H_BLOCK": 15 },
    "RECEPTION":          { "MAIN_BLOCK": 0 },
    "WAITING_HALL":       { "MAIN_BLOCK": 0 },
    "MINERAL_WATER":      { "MAIN_BLOCK": 0, "CANTEEN_MIDDLE": 5 }
  }
};

export default buildingGraphs;