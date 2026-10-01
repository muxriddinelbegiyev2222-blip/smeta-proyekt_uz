/* ===== 4-QADAM: INTERFEYS, FORMALAR VA A4 EKSPORT BOSHQARUVI (APP.JS) ===== */

// 1. Standart loyiha parametrlari
let currentProject = {
  clientName: "Akmal Karimov",
  projectAddress: "Toshkent vil., Qibray tumani",
  length: 12,
  width: 10,
  floors: 1,
  floorHeight: 3.2,
  innerWallLength: 22,
  outerWallThick: 0.38,
  innerWallThick: 0.25,
  wallType: "brick",
  fundDepth: 1.0,
  fundWidth: 0.5,
  roofType: "gable",
  bathrooms: 2,
  openings: [
    { type: "window", name: "Zal romi", w: 1.8, h: 1.6, qty: 3, profile: "pvc" },
    { type: "window", name: "Yotoqxona romi", w: 1.4, h: 1.5, qty: 4, profile: "pvc" },
    { type: "window", name: "Oshxona romi", w: 1.2, h: 1.5, qty: 1, profile: "pvc" },
    { type: "window", name: "Sanuzel fortochka", w: 0.6, h: 0.8, qty: 2, profile: "pvc" },
    { type: "door", name: "Asosiy kirish eshigi", w: 1.0, h: 2.1, qty: 1, doorType: "entrance" },
    { type: "door", name: "Xonalararo eshiklar", w: 0.9, h: 2.1, qty: 5, doorType: "interior" },
    { type: "door", name: "Sanuzel eshiklari", w: 0.7, h: 2.0, qty: 2, doorType: "interior" }
  ]
};

let currentTab = 0;
let lastEstimate = null;

// Sonlarni chiroyli formatlash (masalan: 125 000 000 so'm)
function fmt(num) {
  if (isNaN(num)) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// 2. Sahifalarni almashtirish
function switchTab(index) {
  currentTab = index;
  const items = document.querySelectorAll(".nav-item");
  items.forEach((item, i) => {
    item.classList.toggle("active", i === index);
  });

  const titles = [
    "1. Loyiha Pasporti va Boshlang'ich O'lchamlar",
    "2. Rom va Eshiklar (Proyomlar) Konstruktori",
    "3. Konstruksiya, Poydevor va Devorlar",
    "4. Tom va Chordoq Konstruksiyasi",
    "5. O'zbekiston Bozor Narxlari Matritsasi",
    "6. Mijoz uchun Yakuniy Smeta (A4 Hujjat)",
    "7. Bozorlik Ro'yxati (Xaridlar spetsifikatsiyasi)"
  ];
  document.getElementById("page-title").innerText = titles[index];

  renderCurrentTab();
}

// 3. Tablarni render qilish
function renderCurrentTab() {
  const container = document.getElementById("app-view");
  if (!lastEstimate) calculateAll(false);

  switch (currentTab) {
    case 0:
      container.innerHTML = renderPassportTab();
      break;
    case 1:
      container.innerHTML = renderOpeningsTab();
      break;
    case 2:
      container.innerHTML = renderStructureTab();
      break;
    case 3:
      container.innerHTML = renderRoofTab();
      break;
    case 4:
      container.innerHTML = renderPricesTab();
      break;
    case 5:
      container.innerHTML = renderEstimateA4Tab();
      break;
    case 6:
      container.innerHTML = renderShoppingTab();
      break;
  }
}

// TAB 0: Pasport
function renderPassportTab() {
  return `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-title">Bino Umumiy Maydoni</div>
        <div class="kpi-value">${lastEstimate.meta.totalArea} m²</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Poydevor Perimetri</div>
        <div class="kpi-value">${lastEstimate.meta.perimeter} m</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Taxminiy Jami Qiymat</div>
        <div class="kpi-value" style="color:#059669;">${fmt(lastEstimate.meta.totalCost)} so'm</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">1 m² O'rtacha Narxi</div>
        <div class="kpi-value">${fmt(lastEstimate.meta.costPerM2)} so'm</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Mijoz va Obyekt Ma'lumotlari</div>
      <div class="grid-2">
        <div class="form-group">
          <label>Mijoz F.I.SH:</label>
          <input type="text" value="${currentProject.clientName}" onchange="currentProject.clientName=this.value">
        </div>
        <div class="form-group">
          <label>Loyiha / Obyekt Manzili:</label>
          <input type="text" value="${currentProject.projectAddress}" onchange="currentProject.projectAddress=this.value">
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Bino Bosh O'lchamlari</div>
      <div class="grid-4">
        <div class="form-group">
          <label>Uy uzunligi (metr):</label>
          <input type="number" step="0.5" value="${currentProject.length}" onchange="currentProject.length=parseFloat(this.value);calculateAll(false)">
        </div>
        <div class="form-group">
          <label>Uy eni (metr):</label>
          <input type="number" step="0.5" value="${currentProject.width}" onchange="currentProject.width=parseFloat(this.value);calculateAll(false)">
        </div>
        <div class="form-group">
          <label>Qavatlar soni:</label>
          <select onchange="currentProject.floors=parseInt(this.value);calculateAll(false)">
            <option value="1" ${currentProject.floors==1?'selected':''}>1 qavatli uy</option>
            <option value="2" ${currentProject.floors==2?'selected':''}>2 qavatli uy (mansardali)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Shift balandligi (metr):</label>
          <input type="number" step="0.1" value="${currentProject.floorHeight}" onchange="currentProject.floorHeight=parseFloat(this.value);calculateAll(false)">
        </div>
      </div>
      <div class="grid-2" style="margin-top:10px;">
        <div class="form-group">
          <label>Ichki asosiy devorlar umumiy uzunligi (metr):</label>
          <input type="number" step="1" value="${currentProject.innerWallLength}" onchange="currentProject.innerWallLength=parseFloat(this.value);calculateAll(false)">
        </div>
        <div class="form-group">
          <label>Sanuzellar soni:</label>
          <input type="number" value="${currentProject.bathrooms}" onchange="currentProject.bathrooms=parseInt(this.value);calculateAll(false)">
        </div>
      </div>
    </div>
  `;
}

// TAB 1: Rom va Eshiklar (Proyomlar)
function renderOpeningsTab() {
  const op = lastEstimate.openingsSummary;
  return `
    <div class="card" style="border-left:4px solid #2563eb;">
      <div class="card-title">Proyomlar Tahlili (Devordan ayirish nazorati)</div>
      <div style="font-size:13.5px;color:#334155;line-height:1.6;">
        Tizimda jami <b>${op.count} ta</b> eshik va deraza mavjud. Jami oyna maydoni: <b>${op.windowArea} m²</b>, eshiklar maydoni: <b>${op.doorArea} m²</b>.<br>
        🎯 <b>${op.deductedArea} m²</b> devor yuzasi g'isht terish, sement qorishmasi, ichki suvoq va fasad ishlaridan <b>avtomatik chegirib tashlandi</b>!
      </div>
    </div>

    <div class="card">
      <div class="card-title">
        <span>Rom va Eshiklar Ro'yxati</span>
        <button class="btn btn-primary" onclick="addOpeningRow()">+ Yangi rom/eshik qo'shish</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Turi</th>
            <th>Nomi / Xona</th>
            <th>Eni (m)</th>
            <th>Bo'yi (m)</th>
            <th>Soni (dona)</th>
            <th>Material / Profil</th>
            <th>Amallar</th>
          </tr>
        </thead>
        <tbody>
          ${currentProject.openings.map((item, idx) => `
            <tr>
              <td>
                <select onchange="currentProject.openings[${idx}].type=this.value;calculateAll(true)">
                  <option value="window" ${item.type==='window'?'selected':''}>Deraza (Rom)</option>
                  <option value="door" ${item.type==='door'?'selected':''}>Eshik</option>
                </select>
              </td>
              <td><input type="text" value="${item.name}" onchange="currentProject.openings[${idx}].name=this.value" style="width:140px;"></td>
              <td><input type="number" step="0.1" value="${item.w}" onchange="currentProject.openings[${idx}].w=parseFloat(this.value);calculateAll(true)" style="width:70px;"></td>
              <td><input type="number" step="0.1" value="${item.h}" onchange="currentProject.openings[${idx}].h=parseFloat(this.value);calculateAll(true)" style="width:70px;"></td>
              <td><input type="number" value="${item.qty}" onchange="currentProject.openings[${idx}].qty=parseInt(this.value);calculateAll(true)" style="width:60px;"></td>
              <td>
                ${item.type === 'window' ? `
                  <select onchange="currentProject.openings[${idx}].profile=this.value;calculateAll(true)">
                    <option value="pvc" ${item.profile==='pvc'?'selected':''}>Akfa PVC (Plastik)</option>
                    <option value="alu" ${item.profile==='alu'?'selected':''}>Alyuminiy termo</option>
                  </select>
                ` : `
                  <select onchange="currentProject.openings[${idx}].doorType=this.value;calculateAll(true)">
                    <option value="entrance" ${item.doorType==='entrance'?'selected':''}>Tashqi temir eshik</option>
                    <option value="interior" ${item.doorType==='interior'?'selected':''}>Ichki MDF eshik</option>
                  </select>
                `}
              </td>
              <td><button class="btn btn-danger" style="padding:4px 8px;font-size:11px;" onclick="removeOpeningRow(${idx})">O'chirish</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function addOpeningRow() {
  currentProject.openings.push({
    type: "window",
    name: "Yangi rom",
    w: 1.4,
    h: 1.5,
    qty: 1,
    profile: "pvc"
  });
  calculateAll(true);
}

function removeOpeningRow(idx) {
  currentProject.openings.splice(idx, 1);
  calculateAll(true);
}

// TAB 2: Konstruksiya
function renderStructureTab() {
  return `
    <div class="card">
      <div class="card-title">Poydevor (Fundament) Parametrlari</div>
      <div class="grid-3">
        <div class="form-group">
          <label>Poydevor chuqurligi (m):</label>
          <input type="number" step="0.1" value="${currentProject.fundDepth}" onchange="currentProject.fundDepth=parseFloat(this.value);calculateAll(false)">
        </div>
        <div class="form-group">
          <label>Poydevor eni (m):</label>
          <input type="number" step="0.05" value="${currentProject.fundWidth}" onchange="currentProject.fundWidth=parseFloat(this.value);calculateAll(false)">
        </div>
        <div class="form-group">
          <label>Poydevor betoni markasi:</label>
          <select><option>M200 (Standart lentasimon)</option><option>M250 (Mustahkamlangan)</option></select>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Devor va Konstruksiya Turi</div>
      <div class="grid-3">
        <div class="form-group">
          <label>Asosiy devor materiali:</label>
          <select onchange="currentProject.wallType=this.value;calculateAll(false)">
            <option value="brick" ${currentProject.wallType==='brick'?'selected':''}>Pishgan g'isht (Standart 1.5 g'isht)</option>
            <option value="gasoblock" ${currentProject.wallType==='gasoblock'?'selected':''}>Gazoblok D500 (30 sm)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Tashqi devor qalinligi (m):</label>
          <input type="number" step="0.01" value="${currentProject.outerWallThick}" onchange="currentProject.outerWallThick=parseFloat(this.value);calculateAll(false)">
        </div>
        <div class="form-group">
          <label>Ichki yuk ko'taruvchi devor (m):</label>
          <input type="number" step="0.01" value="${currentProject.innerWallThick}" onchange="currentProject.innerWallThick=parseFloat(this.value);calculateAll(false)">
        </div>
      </div>
    </div>
  `;
}

// TAB 3: Tom
function renderRoofTab() {
  return `
    <div class="card">
      <div class="card-title">Tom Shakli va Qoplamasi</div>
      <div class="grid-2">
        <div class="form-group">
          <label>Tom konstruksiyasi turi:</label>
          <select onchange="currentProject.roofType=this.value;calculateAll(false)">
            <option value="gable" ${currentProject.roofType==='gable'?'selected':''}>Oddiy 2 qiyali tom (Dvuskatnaya)</option>
            <option value="hipped" ${currentProject.roofType==='hipped'?'selected':''}>Murakkab 4 qiyali tom (Valmovaya)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Chordoq issiqlik izolyatsiyasi:</label>
          <select><option>Bazalt plita 15 sm (Tavsiya etiladi)</option><option>Shlak / Loy qorishma</option></select>
        </div>
      </div>
    </div>
  `;
}

// TAB 4: Narxlar Matritsasi
function renderPricesTab() {
  const p = CURRENT_PRICES;
  return `
    <div class="card">
      <div class="card-title">
        <span>Bozor Narxlari Matritsasi (O'zbekiston so'mida)</span>
        <button class="btn btn-outline" onclick="resetPricesToDefault();CURRENT_PRICES=getPrices();renderCurrentTab();toast('Narxlar standart holatga qaytarildi')">Standartga qaytarish</button>
      </div>
      <div style="font-size:12px;color:#64748b;margin-bottom:12px;">Narxlarni hududingizga moslab o'zgartirishingiz mumkin. Barcha o'zgarishlar xotirada saqlanadi.</div>
      <div class="grid-3">
        <div class="form-group"><label>Sement M400 (50 kg qop):</label><input type="number" value="${p.cement_bag}" onchange="updatePrice('cement_bag', this.value)"></div>
        <div class="form-group"><label>Elangan qum (1 m³):</label><input type="number" value="${p.sand_m3}" onchange="updatePrice('sand_m3', this.value)"></div>
        <div class="form-group"><label>Pishgan g'isht (1 dona):</label><input type="number" value="${p.brick_baked}" onchange="updatePrice('brick_baked', this.value)"></div>
        <div class="form-group"><label>Armatura A500C (1 tonna):</label><input type="number" value="${p.rebar_ton}" onchange="updatePrice('rebar_ton', this.value)"></div>
        <div class="form-group"><label>Beton M200 zavod (1 m³):</label><input type="number" value="${p.concrete_m200_m3}" onchange="updatePrice('concrete_m200_m3', this.value)"></div>
        <div class="form-group"><label>Rossiya lezi / taxta (1 m³):</label><input type="number" value="${p.wood_lumber_m3}" onchange="updatePrice('wood_lumber_m3', this.value)"></div>
        <div class="form-group"><label>Tom tunukasi 0.45 mm (1 m²):</label><input type="number" value="${p.roof_metal_m2}" onchange="updatePrice('roof_metal_m2', this.value)"></div>
        <div class="form-group"><label>Akfa PVC rom (1 m²):</label><input type="number" value="${p.window_pvc_m2}" onchange="updatePrice('window_pvc_m2', this.value)"></div>
        <div class="form-group"><label>G'isht terish ustasi (1 m³):</label><input type="number" value="${p.labor_brick_m3}" onchange="updatePrice('labor_brick_m3', this.value)"></div>
      </div>
    </div>
  `;
}

function updatePrice(key, val) {
  CURRENT_PRICES[key] = parseFloat(val) || 0;
  savePrices(CURRENT_PRICES);
  calculateAll(false);
}

// TAB 5: Yakuniy Smeta (A4 Chop etish)
function renderEstimateA4Tab() {
  const est = lastEstimate;
  return `
    <div class="no-print" style="margin-bottom:16px;display:flex;justify-content:space-between;">
      <button class="btn btn-primary" onclick="window.print()">🖨️ A4 Smeta Hujjatini Chop Etish (PDF)</button>
      <div style="font-size:13px;color:#64748b;align-self:center;">Chop etishda yon menyu va ortiqcha tugmalar ko'rinmaydi.</div>
    </div>

    <div class="card" style="background:#fff;padding:40px;color:#000;font-family:serif;border:1px solid #cbd5e1;">
      <!-- Hujjat shapkasi -->
      <div style="display:flex;justify-content:space-between;border-bottom:2px solid #0f172a;padding-bottom:14px;margin-bottom:20px;">
        <div>
          <h2 style="margin:0;font-size:20px;text-transform:uppercase;">ARXITEKTURA-QURILISH SMETASI</h2>
          <div style="font-size:13px;margin-top:4px;">Yakka tartibdagi turar joy binosi qurilishi bo'yicha</div>
        </div>
        <div style="text-align:right;font-size:12px;">
          <b>Sana:</b> ${new Date().toLocaleDateString('uz-UZ')}<br>
          <b>Loyiha kodi:</b> ARX-${Math.floor(1000 + Math.random() * 9000)}
        </div>
      </div>

      <!-- Mijoz ma'lumotlari -->
      <div style="font-size:13px;margin-bottom:18px;line-height:1.7;">
        <b>Buyurtmachi (Mijoz):</b> ${currentProject.clientName}<br>
        <b>Qurilish manzili:</b> ${currentProject.projectAddress}<br>
        <b>Bino ko'rsatkichlari:</b> ${est.meta.floors} qavat | Umumiy maydon: ${est.meta.totalArea} m² | Bino o'lchami: ${currentProject.length}×${currentProject.width} m
      </div>

      <!-- Bosqichlar jadvali -->
      <table style="width:100%;border-collapse:collapse;font-size:12.5px;margin-bottom:20px;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="border:1px solid #94a3b8;padding:8px;">№</th>
            <th style="border:1px solid #94a3b8;padding:8px;">Qurilish-montaj bosqichi</th>
            <th style="border:1px solid #94a3b8;padding:8px;text-align:right;">Materiallar (so'm)</th>
            <th style="border:1px solid #94a3b8;padding:8px;text-align:right;">Usta haqi (so'm)</th>
            <th style="border:1px solid #94a3b8;padding:8px;text-align:right;">Jami (so'm)</th>
          </tr>
        </thead>
        <tbody>
          ${est.stages.map((st, i) => `
            <tr>
              <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;">${i+1}</td>
              <td style="border:1px solid #cbd5e1;padding:8px;"><b>${st.name}</b></td>
              <td style="border:1px solid #cbd5e1;padding:8px;text-align:right;">${fmt(st.mat)}</td>
              <td style="border:1px solid #cbd5e1;padding:8px;text-align:right;">${fmt(st.lab)}</td>
              <td style="border:1px solid #cbd5e1;padding:8px;text-align:right;font-weight:bold;">${fmt(st.total)}</td>
            </tr>
          `).join("")}
          <tr style="background:#f8fafc;font-size:14px;">
            <td colspan="2" style="border:1px solid #94a3b8;padding:10px;text-align:right;"><b>UMUMIY YIG'INDI:</b></td>
            <td style="border:1px solid #94a3b8;padding:10px;text-align:right;"><b>${fmt(est.meta.totalMaterials)}</b></td>
            <td style="border:1px solid #94a3b8;padding:10px;text-align:right;"><b>${fmt(est.meta.totalLabor)}</b></td>
            <td style="border:1px solid #94a3b8;padding:10px;text-align:right;color:#0f172a;font-weight:900;"><b>${fmt(est.meta.totalCost)} so'm</b></td>
          </tr>
        </tbody>
      </table>

      <div style="font-size:12px;color:#475569;margin-bottom:30px;line-height:1.5;">
        * Eslatma: Ushbu smeta amaldagi O'zbekiston ShNQ me'yorlari va joriy bozor narxlari asosida tuzildi. Devor hajmidan jami ${est.openingsSummary.deductedArea} m² eshik va deraza proyomlari chiqarib tashlangan.
      </div>

      <!-- Imzolar -->
      <div style="display:flex;justify-content:space-between;margin-top:40px;font-size:13px;">
        <div><b>Loyiha muallifi (Bosh Arxitektor):</b> _________________</div>
        <div><b>Buyurtmachi (Mijoz):</b> _________________</div>
      </div>
    </div>
  `;
}

// TAB 6: Bozorlik Ro'yxati
function renderShoppingTab() {
  const list = lastEstimate.shoppingList;
  return `
    <div class="card">
      <div class="card-title">
        <span>Xaridlar Ro'yxati (Bozorlik spetsifikatsiyasi)</span>
        <button class="btn btn-primary no-print" onclick="window.print()">🖨️ Ro'yxatni chop etish</button>
      </div>
      <div style="font-size:13px;color:#64748b;margin-bottom:12px;">Mijoz qurilish bozoriga borganda ushbu ro'yxat bo'yicha asosiy xomashyolarni xarid qilishi mumkin.</div>
      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>Material nomi</th>
            <th>Kerakli miqdor</th>
            <th>O'lchov birligi</th>
          </tr>
        </thead>
        <tbody>
          ${list.map((item, idx) => `
            <tr>
              <td style="width:40px;">${idx+1}</td>
              <td><b>${item.name}</b></td>
              <td style="font-size:15px;color:#1e3a8a;font-weight:700;">${fmt(item.qty)}</td>
              <td>${item.unit}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

// 4. Umumiy hisoblash chaqiruvi
function calculateAll(needReRender = true) {
  lastEstimate = calculateProjectEstimate(currentProject, CURRENT_PRICES);
  if (needReRender) {
    renderCurrentTab();
  }
}

function toast(msg) {
  alert(msg);
}

function resetDefaults() {
  if (confirm("Barcha parametrlar standart holatga qaytarilsinmi?")) {
    location.reload();
  }
}

// Dastur yuklanganda ishga tushirish
window.addEventListener("DOMContentLoaded", () => {
  calculateAll(true);
});
