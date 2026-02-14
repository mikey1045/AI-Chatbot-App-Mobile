useCaseDiagram
    actor User as "Người dùng (User)"
    actor Admin as "Quản trị viên (Admin)"
    
    package "Hệ thống VIA AI" {
        usecase "Đăng nhập (Google)" as UC1
        usecase "Chat với AI" as UC2
        usecase "Xem lịch sử Chat" as UC3
        usecase "Chỉnh sửa tin nhắn" as UC4
        usecase "Chọn Model AI" as UC5
        usecase "Cấu hình Theme (Sáng/Tối)" as UC6
        usecase "Đăng xuất" as UC7
        usecase "Cấu hình API Key" as UC8
        usecase "Quản lý User (Firebase)" as UC9
    }

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7

    Admin --> UC8
    Admin --> UC9
