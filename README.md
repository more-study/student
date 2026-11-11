# Quản lý học sinh

Trang web một file (`index.html`) để quản lý hồ sơ học sinh, lưu dữ liệu lên Google Sheet.

## Tính năng
- **Danh sách học sinh**: thêm, xóa, tìm kiếm theo tên / lớp / trường.
- **Thông tin**: họ tên, ngày sinh, giới tính, dân tộc, mã học sinh, địa chỉ, phụ huynh, điện thoại, email, ghi chú.
- **Lịch sử học tập**: mỗi dòng là một năm học ở một trường, một lớp (GVCN, điểm TB, học lực, hạnh kiểm, khen thưởng); có thống kê nhanh.
- **Đang học & xem lại từng năm**: đánh dấu năm *đang học*; ô **Đang xem** chọn một năm học, một trường (tất cả các năm ở trường đó) hoặc tất cả, để lọc Điểm, Thời khóa biểu, Hoạt động.
- **Điểm**: bảng điểm từng năm (TX1–TX4, GK, CK cho 2 học kỳ), tự tính TB môn, TB học kỳ, TB cả năm; xem tổng hợp nhiều năm.
- **Thời khóa biểu theo thời điểm**: trình bày theo mẫu TKB lớp 6B (buổi sáng/chiều, tiết + giờ, gộp tiết, học thêm viền vàng, ngày nghỉ). Bấm vào ô để sửa; "Lưu thành thời điểm mới" giữ lại bản cũ và tạo bản áp dụng từ ngày mới; tự đánh dấu bản **đang áp dụng**; in khổ A4 ngang.
- **Hoạt động đã tham gia**: ngày, năm học, loại, cấp, vai trò, kết quả/giải; lọc nhanh.
- **Lưu trữ**: tự lưu trong trình duyệt và đồng bộ lên Google Sheet; xuất / nhập file JSON để sao lưu; in hồ sơ.

## Kết nối Google Sheet
1. Tạo Google Sheet mới → **Tiện ích mở rộng → Apps Script**.
2. Dán nội dung [`apps-script/Code.gs`](apps-script/Code.gs), bấm Lưu.
3. **Triển khai → Tùy chọn triển khai mới → Ứng dụng web**: *Thực thi với tư cách: Tôi*, *Người có quyền truy cập: Bất kỳ ai*.
4. Sao chép URL `https://script.google.com/macros/s/.../exec`.
5. Trên GitHub mở `index.html` → bấm ✏️ → tìm dòng `var SHEET_URL='';` → dán URL vào giữa hai dấu nháy → Commit changes.

Sheet `HocSinh` chứa mỗi học sinh một dòng (các cột đầu để xem nhanh, dữ liệu đầy đủ ở dạng JSON trong cột `data_*`).
Sheet `NhatKy` ghi lại lịch sử thao tác.

> Lưu ý: ai có URL Apps Script đều đọc/ghi được dữ liệu. Không chia sẻ URL này công khai.

## Xuất bản bằng GitHub Pages
Settings → Pages → Branch: nhánh chứa `index.html`, thư mục `/ (root)`.
