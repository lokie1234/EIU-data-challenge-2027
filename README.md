# EIU Data Challenge 2027 — UI draft

Dự án độc lập, tái sử dụng headline, scene robot 3D, quỹ đạo và palette navy / gold của landing page trong project gốc. Nội dung và cấu trúc tham khảo https://eiudatachallenge.com/ và https://eiudatachallenge.com/challenge-structure/.

## Chạy local

Yêu cầu Node.js >= 20. Scene 3D đã được đóng gói trong `assets/landing-scene.js`, chạy local không cần cài package.

```powershell
cd "C:\Users\THINKPAD X1\Desktop\eiu-data-challenge-2027"
npm run dev
```

Mở http://localhost:2027. Đổi cổng bằng biến môi trường PORT nếu cần. Server chỉ lắng nghe trên loopback.

## Phạm vi bản nháp

- Màn mở đầu toàn màn hình dùng scene robot 3D và headline “Beyond Intelligence / Into Innovation” từ landing page EIU gốc. CTA mở khung thông tin cuộc thi bằng view transition; reduced motion bỏ hiệu ứng chuyển động và dùng đồ họa tĩnh dự phòng.
- Khung nội dung desktop chia hai cột: thông điệp và CTA cố định bên trái, 5 tab Tổng quan / Vòng thi / Lịch trình / Giải thưởng / FAQ bên phải. Chỉ hiện một tab tại một thời điểm, không cần cuộn qua landing page dài. Panel cho phép cuộn khi zoom hoặc chiều cao không đủ.
- Mobile thu gọn phần giới thiệu, giữ tab phía trên khi cuộn; nội dung được cuộn tự nhiên để dễ đọc.
- Tab chính và tab vòng thi hỗ trợ phím mũi tên / Home / End. FAQ native, modal đăng ký có validation, nút quay lại landing, URL hash và lịch sử Back/Forward.
- Scene 3D được tạm dừng khi mở nội dung; không nối đăng nhập khóa học hoặc API xác thực.
- Form không gửi request, không lưu dữ liệu. Chưa tích hợp đăng nhập, đăng ký thật, email hay hệ thống thi.
- Lịch, giải thưởng, đối tác và thể lệ 2027 cần Ban tổ chức xác nhận. Chưa dùng ngày thi hoặc số tiền mùa trước cho năm mới.
- Font Be Vietnam Pro tải từ Google Fonts; có font hệ thống dự phòng khi offline. Logo được sao chép local từ public/branding/EIU-logo-white.png. Khi scene 3D không tải được, dùng ảnh robot tĩnh; đã bỏ quả cầu SVG 2027 và các thẻ nổi của landing page cũ.

## Chỉnh sửa

- `index.html`: màn mở đầu, khung 5 tab, panel nội dung và form demo. Không còn các phần landing page dài bị xóa bằng JavaScript khi tải trang.
- `styles.css`: design tokens và style nền tảng.
- `compact.css`: màn mở đầu và layout nội dung compact / responsive.
- `app.js`: điều khiển tab có sẵn trong HTML, chuyển màn, lịch sử điều hướng, nội dung vòng thi và form demo.
- `src/scene.tsx`: adapter scene gốc cho trang độc lập.
- `src/landing/`: bản sao HeroScene, GuardianRobot3D, AgentWorld3D và landingDroneFlight từ project gốc, đã đổi đường dẫn nội bộ và assets.
- `bundle-scene.mjs`: đóng gói scene; khi sửa source 3D, chạy `npm install` rồi `npm run bundle:scene`. Lệnh này chỉ cần khi chỉnh source scene, không cần cho nội dung / CSS.
- `server.mjs`: server local không dependency.

Thư mục có thể sao chép ra ngoài repo và chạy độc lập. Không sử dụng biến môi trường, Supabase, Convex hay xác thực của project khóa học. Đây là bản review local, chưa publish.

Theo yêu cầu, lần chỉnh sửa layout compact không chạy trình duyệt, preview tự động, test, lint hoặc typecheck.
