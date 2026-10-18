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
4. Giáo viên kết nối Dashboard. Hai ảnh `VÒNG 1.jpg` và `VÒNG 2.jpg`, cùng bộ thẻ tương ứng, được nạp sẵn. Có thể sửa ảnh, đáp án và từ khóa trong Dashboard.
5. Bấm **Lưu ảnh, bộ thẻ và trọng số**, sau đó **Bắt đầu với ảnh 1**. Lớp đầu vào chọn 4 thẻ; Lớp ẩn tạo 2 cụm gợi ý; Lớp đầu ra chốt đáp án.
6. Giáo viên công bố ảnh và đáp án. Cả lớp dò ngược lại các từ khóa/gợi ý; giáo viên đánh dấu từ đặc trưng là **Bắt buộc ưu tiên** và từ nhiễu là **Loại bỏ ở vòng 2**.
7. Lưu điều chỉnh rồi bấm **Thử lại với ảnh 2**. Từ ưu tiên được chọn sẵn và khóa lựa chọn; từ bị loại không xuất hiện cho Lớp đầu vào.

## Lưu ý
- Trên màn hình học sinh, ảnh được cắt còn phần tranh chính để không lộ bảng đáp án in ở dưới. Dashboard giáo viên vẫn xem được toàn bộ ảnh.
- Hai từ được ưu tiên sẵn cho vòng 2 là **Đèn lồng** và **Phố cổ**; giáo viên có thể thay đổi trọng số sau phần phân tích vòng 1.
- Firebase SDK được tải từ CDN, do đó thiết bị cần có Internet.
- Dùng mã phòng riêng cho mỗi tiết học. Không chia sẻ mã phòng ra ngoài lớp.
