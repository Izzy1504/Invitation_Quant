const SHEET_ID = "16Ygkcie0B0DWRSgCmJSkT0SqCkvTesV3PgtUJ-t2km0";
const TAB_NAME = "RSVP";
const HEADERS = ["Received at", "Request ID", "Name", "Attendance", "Guests (including guest)", "Note", "Consent"];

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function sheetText(value) {
  // Prevent guest input from becoming a spreadsheet formula.
  return /^[\s\u0000-\u001f]*[=+\-@]/.test(value) ? "'" + value : value;
}

function doPost(event) {
  const secret = PropertiesService.getScriptProperties().getProperty("RSVP_SECRET");
  let data;
  try {
    if (!event || !event.postData || event.postData.contents.length > 8192) return jsonResponse({ ok: false });
    data = JSON.parse(event.postData.contents);
  } catch (error) {
    console.error("Invalid RSVP JSON", error);
    return jsonResponse({ ok: false });
  }
  if (!secret || secret.length < 32 || !data || data.secret !== secret ||
    typeof data.requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.requestId) ||
    typeof data.name !== "string" || !data.name.trim() || data.name.trim().length > 80 ||
    !["yes", "maybe", "no"].includes(data.attendance) || !Number.isInteger(data.guests) ||
    (data.attendance === "no" ? data.guests !== 0 : data.guests < 1 || data.guests > 10) ||
    typeof data.note !== "string" || data.note.trim().length > 500 || data.consent !== true) {
    return jsonResponse({ ok: false });
  }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return jsonResponse({ ok: false });
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getSheetByName(TAB_NAME) || spreadsheet.insertSheet(TAB_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }
    const lastRow = sheet.getLastRow();
    const duplicate = lastRow > 1 && sheet.getRange(2, 2, lastRow - 1, 1)
      .createTextFinder(data.requestId).matchEntireCell(true).findNext();
    if (!duplicate) {
      sheet.appendRow([
        new Date().toISOString(), data.requestId, sheetText(data.name.trim()),
        data.attendance, data.guests, sheetText(data.note.trim()), "yes",
      ]);
      SpreadsheetApp.flush();
    }
    return jsonResponse({ ok: true, requestId: data.requestId });
  } catch (error) {
    console.error("RSVP could not be stored", error);
    return jsonResponse({ ok: false });
  } finally {
    lock.releaseLock();
  }
}
