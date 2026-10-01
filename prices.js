/* ===== 2-QADAM: O'ZBEKISTON QURILISH BOZORI NARXLARI VA BAZAVIY ME'YORLAR ===== */

// 1. Standart narxlar bazasi (O'zbekiston so'mida, 2026-yilgi o'rtacha bozor ko'rsatkichlari)
const DEFAULT_PRICES = {
  // --- Asosiy xomashyolar ---
  cement_bag: 68000,          // Sement M400 (50 kg qopda)
  sand_m3: 95000,             // Elangan qum (1 m3)
  gravel_m3: 110000,          // Shag'al / sheben (1 m3)
  brick_baked: 1150,          // Pishgan g'isht (1 dona, standart 250x120x65)
  brick_raw: 600,             // Xom g'isht (1 dona)
  gasoblock_m3: 780000,       // Gazoblok D500/D600 (1 m3)
  rebar_ton: 9200000,         // Armatura A500C (1 tonna o'rtacha aralash d12-d16)
  rebar_wire_kg: 18000,       // Bog'lovchi sim (1 kg)
  concrete_m200_m3: 560000,   // Tayyor beton M200 (1 m3, zavod)
  concrete_m250_m3: 620000,   // Tayyor beton M250 (1 m3, zavod)
  wood_lumber_m3: 3400000,    // Yog'och-taxta (rossiyskiy les, 1 m3)

  // --- Izolyatsiya va tom materiallari ---
  bikrost_roll: 220000,       // Bikrost gidroizolyatsiya (1 rulon ~10 m2)
  primer_kg: 24000,           // Bitum praymer (1 kg)
  roof_metal_m2: 65000,       // Profnastil / metallocherepitsa (0.45 mm, 1 m2)
  roof_film_m2: 7000,         // Gidro-bug' to'siq plyonkasi (1 m2)
  basalt_insulation_m3: 450000,// Bazalt issiqlik izolyatsiyasi (chordoq uchun, 1 m3)
  vodostok_m: 55000,          // Tarnov va suv oqava tizimi (1 pogonometr)

  // --- Rom va eshiklar ---
  window_pvc_m2: 650000,      // Plastik rom (Akfa/Engelberg 60-seriya 2 qavat shisha bilan, 1 m2)
  window_alu_m2: 1200000,     // Alyuminiy termo-rom (1 m2)
  door_entrance_iron: 2800000,// Asosiy kirish temir-bronlangan eshigi (1 dona komplekt)
  door_interior_mdf: 750000,  // Ichki xona eshigi MDF (zamok, nalichnik bilan, 1 dona)

  // --- Muhandislik kommunikatsiyalari (nuqta / m2 bo'yicha taqribiy) ---
  electric_wire_m: 6500,      // Mis kabel VVGng 3x2.5 (1 metr)
  pipe_water_m: 14000,        // Suv trubasi PP-R d25 (1 metr)
  pipe_sewer_m: 32000,        // Kanalizatsiya trubasi PVX d110 (1 metr)
  heating_pipe_m: 9000,       // Tyoply pol PEX trubasi (1 metr)

  // --- Pardozlash (Otdelka) materiallari ---
  plaster_rotband_bag: 52000, // Gipsli suvoq (Rotband 30 kg qopda)
  spackle_finish_bag: 42000,  // Finish shpaklyovka (25 kg qopda)
  laminate_m2: 110000,        // Laminat 8 mm 32-klass (1 m2)
  tile_floor_m2: 125000,      // Keramogranit pol kafeli (1 m2)
  tile_glue_bag: 38000,       // Kafel yelimi (25 kg qopda)
  paint_facade_kg: 32000,     // Fasad bo'yog'i / travertin (1 kg)

  // --- Usta va mehnat haqlari (Ish haqi) ---
  labor_excavation_m3: 45000, // Tuproq qazish va tekislash (1 m3 qo'lda/texnikada)
  labor_foundation_m3: 140000,// Poydevor quyish (opalubka, armatura to'qish, beton, 1 m3)
  labor_brick_m3: 130000,     // G'isht terish ustasi (1 m3)
  labor_slab_m2: 50000,       // Plita montaj yoki monolit orayopma (1 m2)
  labor_roof_m2: 75000,       // Tom yopish karkas va tunukasi bilan (1 m2)
  labor_plaster_m2: 30000,    // Devor suvoqi (mayak bo'yicha, 1 m2)
  labor_screed_m2: 25000,     // Pol styajkasi (1 m2)
  labor_electric_point: 45000,// Elektr montaji (1 nuqta/tochka)
  labor_plumbing_point: 90000,// Santexnika montaji (1 nuqta)
  labor_tile_m2: 60000,       // Kafel yotqizish (1 m2)
  labor_laminate_m2: 18000    // Laminat terish (1 m2)
};

// 2. Qurilish-texnik me'yorlari va sarf koeffitsiyentlari (ShNQ bo'yicha)
const NORMS = {
  // 1 m3 g'isht terish uchun:
  brick_per_m3: 400,          // 1 m3 devorga o'rtacha 400 dona pishgan g'isht (choklari bilan)
  mortar_per_m3_wall: 0.23,   // 1 m3 devorga 0.23 m3 qorishma ketadi
  cement_per_m3_mortar: 7,    // 1 m3 qorishma uchun 7 qop (350 kg) sement
  sand_per_m3_mortar: 1.15,   // 1 m3 qorishma uchun 1.15 m3 qum

  // Poydevor armaturasi:
  rebar_kg_per_m3_foundation: 45, // 1 m3 lentasimon poydevorga o'rtacha 45 kg armatura
  wire_kg_per_ton_rebar: 15,      // 1 tonna armaturaga 15 kg bog'lovchi sim

  // Seysmopoyas va peremichkalar:
  rebar_kg_per_m3_beam: 75,       // Seysmik kamarga 1 m3 betonga 75 kg armatura

  // Tom yog'och sarfi:
  wood_m3_per_m2_roof: 0.035,     // 1 m2 tom yuzasiga o'rtacha 0.035 m3 yog'och (stropila, mauerlat, reykalar)
  roof_area_coeff_gable: 1.25,    // 2 qiyali tomning bino maydoniga nisbatan yoyilma koeffitsiyenti (qiyalik bilan)
  roof_area_coeff_hipped: 1.35,   // 4 qiyali (valmoviy) tom yoyilma koeffitsiyenti

  // Pardozlash sarflari:
  plaster_bag_per_m2: 0.45,       // 1 m2 devorga 2 sm qalinlikda ~0.45 qop gips suvoq
  screed_cement_bags_per_m2: 0.35 // 1 m2 polga (5 sm styajka) 0.35 qop sement
};

// 3. Narxlarni yuklash va saqlash funksiyalari (localStorage)
function getPrices() {
  try {
    const saved = localStorage.getItem("arx_smeta_prices");
    if (saved) return Object.assign({}, DEFAULT_PRICES, JSON.parse(saved));
  } catch (e) {
    console.warn("Narxlarni xotiradan yuklashda xatolik:", e);
  }
  return Object.assign({}, DEFAULT_PRICES);
}

function savePrices(newPrices) {
  try {
    localStorage.setItem("arx_smeta_prices", JSON.stringify(newPrices));
    return true;
  } catch (e) {
    console.error("Narxlarni saqlashda xatolik:", e);
    return false;
  }
}

function resetPricesToDefault() {
  try {
    localStorage.removeItem("arx_smeta_prices");
  } catch (e) {}
  return Object.assign({}, DEFAULT_PRICES);
}

// Global joriy narxlar obyekti
let CURRENT_PRICES = getPrices();
