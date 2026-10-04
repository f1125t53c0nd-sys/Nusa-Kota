/**
 * NUSA KOTA — Code.gs
 * Tempel di Google Spreadsheet: Ekstensi > Apps Script.
 * Lalu: Deploy > New deployment > Web app
 *   Execute as: Me | Who has access: Anyone
 */
const SHEET_NAME = "Votes";
const CITIES = ["Yogyakarta","Bali (Denpasar)","Bandung","Jakarta","Surabaya","Malang","Medan","Makassar","Semarang","Labuan Bajo"];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(["Waktu", "Nama", "Kota", "Alasan"]);
    sh.getRange("A1:D1").setFontWeight("bold").setBackground("#0a8fc7").setFontColor("#ffffff");
    sh.setFrozenRows(1);
    sh.setColumnWidths(1, 3, 170);
    sh.setColumnWidth(4, 420);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Mencegah rumus berbahaya di spreadsheet
function clean_(v, max) {
  let s = String(v || "").replace(/[\r\n]+/g, " ").trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

// Membaca data (dipanggil website)
function doGet(e) {
  try {
    const sh = getSheet_();
    const last = sh.getLastRow();
    if (last < 2) return json_({ ok: true, rows: [] });
    const values = sh.getRange(2, 1, last - 1, 4).getValues();
    const rows = values.map(r => ({
      time: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
      name: String(r[1]).replace(/^'/, ""),
      city: String(r[2]),
      reason: String(r[3]).replace(/^'/, "")
    }));
    return json_({ ok: true, rows: rows });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// Menyimpan suara baru (dipanggil form website)
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const d = JSON.parse(e.postData.contents);
    const name = clean_(d.name, 40), city = String(d.city || ""), reason = clean_(d.reason, 240);
    if (!name || !reason) throw new Error("Nama dan alasan wajib diisi");
    if (CITIES.indexOf(city) === -1) throw new Error("Kota tidak valid");
    getSheet_().appendRow([new Date(), name, city, reason]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}
