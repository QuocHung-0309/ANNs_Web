# Neural Network Game – Multiplayer demo

## Mô hình
- 4 thiết bị học sinh: Lớp đầu vào, Lớp ẩn, Lớp đầu ra, Nhóm phản hồi.
- 1 thiết bị giáo viên: Dashboard điều khiển vòng chơi.
- Các thiết bị cùng vào một mã phòng; dữ liệu truyền qua Firebase Realtime Database theo thời gian thực.
- Đây là bản demo giáo dục, không phải hệ thống xác thực an toàn cho dữ liệu nhạy cảm.

## 1. Tạo Firebase miễn phí
1. Vào https://console.firebase.google.com/ và tạo project.
2. Thêm Web App (biểu tượng </>) và sao chép cấu hình Firebase.
3. Vào Build > Authentication > Sign-in method, bật **Anonymous**.
4. Vào Build > Realtime Database > Create Database.
5. Sao chép `databaseURL` từ Firebase Console.

## 2. Dán cấu hình
Mở `index.html` bằng VS Code hoặc trình soạn thảo. Tìm `const FIREBASE_CONFIG = {` và thay các giá trị mẫu bằng cấu hình của project Firebase:
- `apiKey`
- `authDomain`
- `databaseURL`
- `projectId`
- `appId`

## 3. Quy tắc database cho lớp học thử
Trong Realtime Database > Rules, dùng tạm rules sau cho demo trong lớp (chỉ cho người dùng đã đăng nhập ẩn danh đọc/ghi; mọi người có mã phòng đều có thể truy cập phòng đó). Không dùng cho dữ liệu cá nhân hoặc hệ thống công khai lâu dài.

{
  "rules": {
    "classrooms": {
      "$room": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}

Bấm Publish. Với bản production, cần giới hạn quyền giáo viên/học sinh và quyền ghi theo vai trò.

## 4. Chạy và truy cập từ nhiều thiết bị
Không mở file trực tiếp bằng `file://` nếu trình duyệt chặn một số tính năng. Đăng tải `index.html` lên một static hosting như Firebase Hosting, Netlify hoặc Vercel.
1. Mở URL trên 5 thiết bị.
2. Nhập cùng mã phòng, ví dụ `BANHA01`.
3. Một thiết bị chọn `Giáo viên – Dashboard`; 4 thiết bị còn lại chọn từng vai trò.
4. Giáo viên bấm **Bắt đầu vòng 1**.
5. Lớp đầu vào chọn 4 thẻ và bấm chuyển; Lớp ẩn nhập 2 gợi ý và chuyển; Lớp đầu ra chốt đáp án; Nhóm phản hồi ghi nhận phân tích.
6. Giáo viên công bố đáp án và bấm bắt đầu vòng 2.

## Lưu ý
- Ảnh thẻ từ khóa Cầu Vàng đã được nhúng vào HTML.
- Firebase SDK được tải từ CDN, do đó thiết bị cần có Internet.
- Dùng mã phòng riêng cho mỗi tiết học. Không chia sẻ mã phòng ra ngoài lớp.
