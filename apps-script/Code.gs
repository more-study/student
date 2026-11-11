/**
 * Google Apps Script – máy chủ lưu dữ liệu cho "Quản lý học sinh" (index.html).
 *
 * Cài đặt:
 *  1. Tạo một Google Sheet mới → Tiện ích mở rộng → Apps Script.
 *  2. Dán toàn bộ file này vào Code.gs, bấm Lưu.
 *  3. Triển khai → Tùy chọn triển khai mới → Loại: Ứng dụng web
 *       - Thực thi với tư cách: Tôi
 *       - Người có quyền truy cập: Bất kỳ ai
 *  4. Sao chép URL dạng https://script.google.com/macros/s/.../exec
 *     và dán vào ô "Google Sheet URL" trong trang index.html (nút ⚙ Cài đặt).
 *
 * Dữ liệu:
 *  - Sheet "HocSinh": mỗi học sinh 1 dòng. Các cột đầu để xem nhanh,
 *    toàn bộ dữ liệu chi tiết nằm ở dạng JSON trong các cột "data_1", "data_2"...
 *    (chia nhỏ vì mỗi ô Google Sheet tối đa 50.000 ký tự).
 *  - Sheet "NhatKy": lịch sử thao tác (thời gian, hành động, học sinh).
 */

var SHEET_HS = 'HocSinh';
var SHEET_LOG = 'NhatKy';
var FIXED = ['id', 'Họ và tên', 'Ngày sinh', 'Giới tính', 'Trường hiện tại', 'Lớp hiện tại', 'Năm học', 'Cập nhật'];
var CHUNK = 45000;
var MAX_CHUNKS = 20;

function sheet_(name, header) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(header);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, header.length).setFontWeight('bold');
  }
  return sh;
}

function hsSheet_() {
  var header = FIXED.slice();
  for (var i = 1; i <= MAX_CHUNKS; i++) header.push('data_' + i);
  return sheet_(SHEET_HS, header);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function readAll_() {
  var sh = hsSheet_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var rows = sh.getRange(2, 1, last - 1, FIXED.length + MAX_CHUNKS).getValues();
  var out = [];
  rows.forEach(function (r) {
    if (!r[0]) return;
    var txt = r.slice(FIXED.length).join('');
    try { out.push(JSON.parse(txt)); } catch (e) { /* bỏ qua dòng lỗi */ }
  });
  return out;
}

function findRow_(sh, id) {
  var last = sh.getLastRow();
  if (last < 2) return -1;
  var ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(id)) return i + 2;
  return -1;
}

function current_(s) {
  var c = (s.history || []).filter(function (h) { return h.current; })[0];
  if (c) return c;
  var h = (s.history || []).slice().sort(function (a, b) { return String(b.year || '').localeCompare(String(a.year || '')); })[0] || {};
  return h;
}

function writeStudent_(s) {
  var sh = hsSheet_();
  var txt = JSON.stringify(s);
  var chunks = [];
  for (var i = 0; i < txt.length; i += CHUNK) chunks.push(txt.substr(i, CHUNK));
  if (chunks.length > MAX_CHUNKS) throw new Error('Dữ liệu học sinh quá lớn');
  while (chunks.length < MAX_CHUNKS) chunks.push('');
  var cur = current_(s);
  var row = [s.id, s.name || '', s.dob || '', s.gender || '', cur.school || '', cur.cls || '', cur.year || '', new Date()].concat(chunks);
  var r = findRow_(sh, s.id);
  if (r < 0) sh.appendRow(row);
  else sh.getRange(r, 1, 1, row.length).setValues([row]);
}

function log_(action, name) {
  sheet_(SHEET_LOG, ['Thời gian', 'Hành động', 'Học sinh']).appendRow([new Date(), action || '', name || '']);
}

function doGet() {
  return json_({ ok: true, students: readAll_(), updated: Date.now() });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var req = JSON.parse(e.postData.contents || '{}');
    if (req.action === 'save' && req.student && req.student.id) {
      writeStudent_(req.student);
      log_(req.note || 'Cập nhật', req.student.name);
    } else if (req.action === 'delete' && req.id) {
      var sh = hsSheet_();
      var r = findRow_(sh, req.id);
      if (r > 0) sh.deleteRow(r);
      log_('Xóa học sinh', req.name);
    } else if (req.action === 'saveAll' && req.students) {
      req.students.forEach(writeStudent_);
      log_('Nhập dữ liệu (' + req.students.length + ' học sinh)', '');
    } else {
      return json_({ ok: false, error: 'Yêu cầu không hợp lệ' });
    }
    return json_({ ok: true, updated: Date.now() });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
