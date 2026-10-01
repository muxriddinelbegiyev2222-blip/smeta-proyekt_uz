/* ===== 3-QADAM: ARXITEKTURA VA SMETA HISOB-KITOB YADROSI (CALC_ENGINE) ===== */

/**
 * Arxitektura loyihasini to'liq hisoblash funksiyasi
 * @param {Object} project - Loyiha parametrlari
 * @param {Object} prices - Joriy narxlar (CURRENT_PRICES)
 * @returns {Object} To'liq smeta, materiallar ro'yxati va bosqichlar
 */
function calculateProjectEstimate(project, prices) {
  const P = prices || CURRENT_PRICES;
  const N = NORMS;

  // 1. ASOSIY GEOMETRIYA
  const length = parseFloat(project.length) || 12; // Bino uzunligi (m)
  const width = parseFloat(project.width) || 10;   // Bino eni (m)
  const floors = parseInt(project.floors) || 1;    // Qavatlar soni (1 yoki 2)
  const floorHeight = parseFloat(project.floorHeight) || 3.2; // Shift balandligi (m)
  const innerWallLength = parseFloat(project.innerWallLength) || (length + width) * 0.8; // Ichki devorlar umumiy uzunligi (m)
  
  // Konstruksiya qalinliklari (metrda)
  const outerWallThick = parseFloat(project.outerWallThick) || 0.38; // 1.5 g'isht (0.38 m) yoki gazoblok (0.30 m)
  const innerWallThick = parseFloat(project.innerWallThick) || 0.25; // 1 g'isht yoki 0.5 g'isht (0.12 - 0.25 m)
  const wallType = project.wallType || "brick"; // "brick" yoki "gasoblock"

  // Bino perimetri va poydevor yuzasi
  const perimeter = 2 * (length + width);
  const buildingArea = length * width; // Bino osti maydoni (m2)
  const totalLivingArea = buildingArea * floors; // Umumiy maydon (m2)

  // 2. ESHIK VA DERA polar (PROYOMLARNI ANIQ HISOB-KITOB QILISH VA AYIRISH)
  let openings = project.openings || [];
  let totalWindowArea = 0;
  let totalDoorArea = 0;
  let totalOpeningsVolume = 0;
  let totalOpeningsCount = 0;
  let windowsCost = 0;
  let doorsCost = 0;

  openings.forEach(item => {
    const w = parseFloat(item.w) || 0;
    const h = parseFloat(item.h) || 0;
    const qty = parseInt(item.qty) || 0;
    const itemArea = w * h * qty;
    totalOpeningsCount += qty;

    if (item.type === "window") {
      totalWindowArea += itemArea;
      // Rom narxi (profil turiga qarab)
      const unitPrice = item.profile === "alu" ? P.window_alu_m2 : P.window_pvc_m2;
      windowsCost += itemArea * unitPrice;
    } else {
      totalDoorArea += itemArea;
      // Eshik narxi (kirish yoki ichki)
      const unitPrice = item.doorType === "entrance" ? P.door_entrance_iron : P.door_interior_mdf;
      doorsCost += qty * unitPrice;
    }
  });

  const totalOpeningsArea = totalWindowArea + totalDoorArea;
  // Devor hajmidan ayirish uchun proyomlar kubaturasi (o'rtacha tashqi devor qalinligida)
  totalOpeningsVolume = totalOpeningsArea * outerWallThick;

  // 3. 1-BOSQICH: YER ISHLARI VA POYDEVOR (FUNDAMENT)
  const fundDepth = parseFloat(project.fundDepth) || 1.0;  // Chuqurligi (m)
  const fundWidth = parseFloat(project.fundWidth) || 0.5;  // Eni (m)
  const totalFundLength = perimeter + innerWallLength;     // Jami poydevor uzunligi
  
  // Tuproq qazish va poydevor beton hajmi (m3)
  const fundVolume = totalFundLength * fundDepth * fundWidth;
  const excavationVolume = fundVolume * 1.2; // Qazish zaxirasi bilan
  
  // Armatura (kg va tonnada)
  const fundRebarKg = fundVolume * N.rebar_kg_per_m3_foundation;
  const fundRebarTon = fundRebarKg / 1000;
  const fundWireKg = fundRebarTon * N.wire_kg_per_ton_rebar;
  
  // Gidroizolyatsiya (Gorizontal fundament ustiga bikrost)
  const fundTopArea = totalFundLength * fundWidth;
  const bikrostRolls = Math.ceil(fundTopArea / 9); // 1 rulon ~9 m2 toza yopadi

  const stage1_materials = (fundVolume * P.concrete_m200_m3) + 
                           (fundRebarTon * P.rebar_ton) + 
                           (fundWireKg * P.rebar_wire_kg) + 
                           (bikrostRolls * P.bikrost_roll);
  const stage1_labor = (excavationVolume * P.labor_excavation_m3) + 
                       (fundVolume * P.labor_foundation_m3);
  const stage1_total = stage1_materials + stage1_labor;

  // 4. 2-BOSQICH: DEVORLAR VA KONSTRUKSIYA (PROYOMLAR AYIRILGAN HOLDA)
  const totalWallHeight = floorHeight * floors;
  // Brutto devor yuzalari (eshik-deraza teshiklari bilan)
  const outerWallGrossArea = perimeter * totalWallHeight;
  const innerWallGrossArea = innerWallLength * totalWallHeight;
  
  // Netto devor yuzalari (Proyomlar ayirib tashlandi!)
  const outerWallNetArea = Math.max(0, outerWallGrossArea - totalOpeningsArea);
  
  // G'isht va blok hajmlari (m3)
  const outerWallVolume = outerWallNetArea * outerWallThick;
  const innerWallVolume = innerWallGrossArea * innerWallThick;
  const totalWallVolume = outerWallVolume + innerWallVolume;

  let brickCount = 0;
  let gasoblockVolume = 0;
  let wallMaterialCost = 0;
  let wallMortarCementBags = 0;
  let wallMortarSandM3 = 0;

  if (wallType === "brick") {
    brickCount = Math.round(totalWallVolume * N.brick_per_m3);
    const mortarVolume = totalWallVolume * N.mortar_per_m3_wall;
    wallMortarCementBags = Math.round(mortarVolume * N.cement_per_m3_mortar);
    wallMortarSandM3 = Math.round(mortarVolume * N.sand_per_m3_mortar * 10) / 10;

    wallMaterialCost = (brickCount * P.brick_baked) + 
                       (wallMortarCementBags * P.cement_bag) + 
                       (wallMortarSandM3 * P.sand_m3);
  } else {
    gasoblockVolume = Math.round(totalWallVolume * 1.05); // 5% zaxira bilan
    wallMaterialCost = gasoblockVolume * P.gasoblock_m3;
  }

  // Seysmopoyas va peremichkalar (har bir qavat ustidan t/b kamar)
  const seismicBeltVolume = (perimeter + innerWallLength) * 0.25 * 0.30 * floors; // 25x30 sm kesimli kamar
  const seismicBeltRebarTon = (seismicBeltVolume * N.rebar_kg_per_m3_beam) / 1000;
  const seismicBeltCost = (seismicBeltVolume * P.concrete_m250_m3) + (seismicBeltRebarTon * P.rebar_ton);

  const stage2_materials = wallMaterialCost + seismicBeltCost;
  const stage2_labor = (totalWallVolume * P.labor_brick_m3);
  const stage2_total = stage2_materials + stage2_labor;

  // 5. 3-BOSQICH: QAVATLARARO ORAYOPMA (PEREKRYTIYE)
  let stage3_materials = 0;
  let stage3_labor = 0;
  if (floors > 1) {
    // 2 qavatli uy uchun monolit yoki plita
    const slabArea = buildingArea;
    const slabConcreteVolume = slabArea * 0.16; // 16 sm qalinlikdagi monolit
    const slabRebarTon = (slabArea * 25) / 1000; // 25 kg/m2 armatura
    stage3_materials = (slabConcreteVolume * P.concrete_m250_m3) + (slabRebarTon * P.rebar_ton);
    stage3_labor = slabArea * P.labor_slab_m2;
  }
  const stage3_total = stage3_materials + stage3_labor;

  // 6. 4-BOSQICH: TOM QISMI (KROVLYA)
  const roofType = project.roofType || "gable"; // "gable" (2 qiyali) yoki "hipped" (4 qiyali)
  const roofCoeff = roofType === "hipped" ? N.roof_area_coeff_hipped : N.roof_area_coeff_gable;
  const roofArea = Math.round(buildingArea * roofCoeff); // Qiyalik hisobga olingan haqiqiy yoyilma
  
  const roofWoodM3 = Math.round(roofArea * N.wood_m3_per_m2_roof * 100) / 100;
  const roofInsulationM3 = Math.round(buildingArea * 0.15 * 10) / 10; // 15 sm qalinlikda izolyatsiya
  const roofVodostokM = Math.round(perimeter * 1.1); // Tarnov uzunligi

  const stage4_materials = (roofArea * P.roof_metal_m2) + 
                           (roofWoodM3 * P.wood_lumber_m3) + 
                           (roofArea * P.roof_film_m2) + 
                           (roofInsulationM3 * P.basalt_insulation_m3) + 
                           (roofVodostokM * P.vodostok_m);
  const stage4_labor = roofArea * P.labor_roof_m2;
  const stage4_total = stage4_materials + stage4_labor;

  // 7. 5-BOSQICH: ROM VA ESHIKLAR (PROYOMLAR)
  const stage5_materials = windowsCost + doorsCost;
  const stage5_labor = totalOpeningsCount * 60000; // O'rnatish usta haqi (o'rtacha 60 ming/dona)
  const stage5_total = stage5_materials + stage5_labor;

  // 8. 6-BOSQICH: MUHANDISLIK TARMOQLARI (ELEKTR, SANTEXNIKA, ISITISH)
  const electricPoints = Math.round(totalLivingArea * 0.8); // 1 m2 ga o'rtacha 0.8 ta tochka
  const plumbingPoints = 12 * (project.bathrooms || 1);     // Sanuzel/oshxona nuqtalari
  const heatingPipeM = Math.round(totalLivingArea * 4.5);   // Tyoply pol quvuri

  const stage6_materials = (totalLivingArea * 25000) + (heatingPipeM * P.heating_pipe_m) + 12000000; // Kotyol va shitok bilan
  const stage6_labor = (electricPoints * P.labor_electric_point) + (plumbingPoints * P.labor_plumbing_point);
  const stage6_total = stage6_materials + stage6_labor;

  // 9. 7-BOSQICH: PARDOZLASH ISHLARI (ICHKI VA TASHQI OTDELKA)
  // Devor suvoq maydoni (Eshik va derazalar ayirib tashlangan holda 2 tomondan)
  const plasterWallArea = (outerWallNetArea) + (innerWallGrossArea * 2);
  const plasterBags = Math.round(plasterWallArea * N.plaster_bag_per_m2);
  const screedCementBags = Math.round(totalLivingArea * N.screed_cement_bags_per_m2);
  const laminateArea = Math.round(totalLivingArea * 0.7); // 70% maydon laminat
  const tileArea = Math.round(totalLivingArea * 0.3);     // 30% kafel (oshxona, koridor, vanna)

  const stage7_materials = (plasterBags * P.plaster_rotband_bag) + 
                           (screedCementBags * P.cement_bag) + 
                           (laminateArea * P.laminate_m2) + 
                           (tileArea * P.tile_floor_m2) + 
                           (outerWallNetArea * P.paint_facade_kg * 0.5); // Fasad travertin
  const stage7_labor = (plasterWallArea * P.labor_plaster_m2) + 
                       (totalLivingArea * P.labor_screed_m2) + 
                       (laminateArea * P.labor_laminate_m2) + 
                       (tileArea * P.labor_tile_m2);
  const stage7_total = stage7_materials + stage7_labor;

  // JAMI YIG'INDI VA STRUKTURA
  const totalCost = stage1_total + stage2_total + stage3_total + stage4_total + stage5_total + stage6_total + stage7_total;
  const totalMaterials = stage1_materials + stage2_materials + stage3_materials + stage4_materials + stage5_materials + stage6_materials + stage7_materials;
  const totalLabor = stage1_labor + stage2_labor + stage3_labor + stage4_labor + stage5_labor + stage6_labor + stage7_labor;

  return {
    meta: {
      totalArea: totalLivingArea,
      buildingArea: buildingArea,
      perimeter: perimeter,
      floors: floors,
      totalCost: Math.round(totalCost),
      totalMaterials: Math.round(totalMaterials),
      totalLabor: Math.round(totalLabor),
      costPerM2: Math.round(totalCost / totalLivingArea)
    },
    openingsSummary: {
      count: totalOpeningsCount,
      windowArea: Math.round(totalWindowArea * 10) / 10,
      doorArea: Math.round(totalDoorArea * 10) / 10,
      deductedArea: Math.round(totalOpeningsArea * 10) / 10
    },
    stages: [
      { name: "Poydevor va yer ishlari", mat: Math.round(stage1_materials), lab: Math.round(stage1_labor), total: Math.round(stage1_total) },
      { name: "Devorlar va seysmopoyas", mat: Math.round(stage2_materials), lab: Math.round(stage2_labor), total: Math.round(stage2_total) },
      { name: "Qavatlararo orayopma (Plita)", mat: Math.round(stage3_materials), lab: Math.round(stage3_labor), total: Math.round(stage3_total) },
      { name: "Tom va chordoq izolyatsiyasi", mat: Math.round(stage4_materials), lab: Math.round(stage4_labor), total: Math.round(stage4_total) },
      { name: "Rom va eshiklar (O'rnatish bilan)", mat: Math.round(stage5_materials), lab: Math.round(stage5_labor), total: Math.round(stage5_total) },
      { name: "Muhandislik tarmoqlari (Montaj)", mat: Math.round(stage6_materials), lab: Math.round(stage6_labor), total: Math.round(stage6_total) },
      { name: "Ichki va tashqi pardozlash (Otdelka)", mat: Math.round(stage7_materials), lab: Math.round(stage7_labor), total: Math.round(stage7_total) }
    ],
    shoppingList: [
      { name: "Pishgan g'isht (choklar hisobida)", qty: brickCount, unit: "dona" },
      { name: "Sement M400 (50 kg qopda)", qty: wallMortarCementBags + screedCementBags + 40, unit: "qop" },
      { name: "Tayyor beton M200 / M250", qty: Math.round((fundVolume + seismicBeltVolume) * 10) / 10, unit: "m³" },
      { name: "Armatura A500C (d12 - d16)", qty: Math.round((fundRebarTon + seismicBeltRebarTon) * 100) / 100, unit: "tonna" },
      { name: "Elangan qum (qorishma va to'shama)", qty: Math.round(wallMortarSandM3 + 12), unit: "m³" },
      { name: "Yog'och va taxta (Rossiya lezi)", qty: roofWoodM3, unit: "m³" },
      { name: "Tom qoplamasi (Profnastil / Cherepitsa)", qty: roofArea, unit: "m²" },
      { name: "Gipsli suvoq (Rotband 30 kg)", qty: plasterBags, unit: "qop" },
      { name: "Plastik romlar (Akfa komplekt)", qty: Math.round(totalWindowArea * 10) / 10, unit: "m²" },
      { name: "Bikrost gidroizolyatsiya", qty: bikrostRolls, unit: "rulon" }
    ]
  };
}
