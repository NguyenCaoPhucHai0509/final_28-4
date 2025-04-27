document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra người dùng đã đăng nhập chưa
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    // Nếu chưa đăng nhập, chuyển hướng đến trang login
    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Nếu đã đăng nhập, tải giao diện chính
    loadMainInterface();
});

async function loadMainInterface() {
    try {
        // Lấy thông tin người dùng từ localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        
        // Tải giao diện dựa vào vai trò người dùng
        let dashboardHtml = '';
        
        switch (user.role) {
            case 'customer':
                dashboardHtml = await loadCustomerDashboard();
                break;
            case 'owner':
                dashboardHtml = await loadOwnerDashboard();
                break;
            case 'kitchen_staff':
                dashboardHtml = await loadKitchenStaffDashboard();
                break;
            case 'driver':
                dashboardHtml = await loadDriverDashboard();
                break;
            case 'admin':
                dashboardHtml = await loadAdminDashboard();
                break;
            default:
                dashboardHtml = `
                    <div class="container mt-5">
                        <h2>Chào mừng, ${user.username}!</h2>
                        <p>Vai trò của bạn (${user.role}) chưa được hỗ trợ.</p>
                        <button class="btn btn-danger" onclick="logout()">Đăng xuất</button>
                    </div>
                `;
        }
        
        // Hiển thị giao diện
        document.getElementById('app').innerHTML = dashboardHtml;
        
    } catch (error) {
        console.error('Lỗi khi tải giao diện:', error);
        // Nếu có lỗi, đăng xuất và quay lại trang đăng nhập
        logout();
    }
}

// Hàm đăng xuất
function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Các hàm tải giao diện theo vai trò
async function loadCustomerDashboard() {
    return `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
            <div class="container">
                <a class="navbar-brand" href="#">Hệ Thống Giao Đồ Ăn</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link active" href="#">Trang chủ</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" onclick="loadRestaurants()">Nhà hàng</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" onclick="loadOrders()">Đơn hàng của tôi</a>
                        </li>
                    </ul>
                    <div class="d-flex">
                        <button class="btn btn-light" onclick="logout()">Đăng xuất</button>
                    </div>
                </div>
            </div>
        </nav>
        
        <div class="container mt-4">
            <h2>Trang chủ Khách hàng</h2>
            <p>Chào mừng đến với hệ thống giao đồ ăn. Hãy chọn một nhà hàng để đặt món.</p>
            
            <div id="restaurants-list" class="row mt-4">
                <!-- Danh sách nhà hàng sẽ được tải ở đây -->
                <div class="col-12">
                    <div class="alert alert-info">
                        Đang tải danh sách nhà hàng...
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function loadOwnerDashboard() {
    return `
        <nav class="navbar navbar-expand-lg navbar-dark bg-success">
            <div class="container">
                <a class="navbar-brand" href="#">Quản lý Nhà hàng</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link active" href="#">Trang chủ</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" onclick="loadBranches()">Chi nhánh</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" onclick="loadMenu()">Thực đơn</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" onclick="loadStaff()">Nhân viên</a>
                        </li>
                    </ul>
                    <div class="d-flex">
                        <button class="btn btn-light" onclick="logout()">Đăng xuất</button>
                    </div>
                </div>
            </div>
        </nav>
        
        <div class="container mt-4">
            <h2>Trang quản lý Nhà hàng</h2>
            <p>Chào mừng đến với hệ thống quản lý nhà hàng.</p>
        </div>
    `;
}

async function loadKitchenStaffDashboard() {
    return `
        <nav class="navbar navbar-expand-lg navbar-dark bg-warning">
            <div class="container">
                <a class="navbar-brand" href="#">Nhà bếp</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link active" href="#">Đơn hàng đang chờ</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" onclick="loadCompletedOrders()">Đơn hàng đã xong</a>
                        </li>
                    </ul>
                    <div class="d-flex">
                        <button class="btn btn-light" onclick="logout()">Đăng xuất</button>
                    </div>
                </div>
            </div>
        </nav>
        
        <div class="container mt-4">
            <h2>Trang Nhà bếp</h2>
            <p>Hãy xử lý các đơn hàng đang chờ.</p>
        </div>
    `;
}

async function loadDriverDashboard() {
    return `
        <nav class="navbar navbar-expand-lg navbar-dark bg-danger">
            <div class="container">
                <a class="navbar-brand" href="#">Tài xế</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link active" href="#">Đơn hàng chờ giao</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" onclick="loadMyDeliveries()">Đơn hàng của tôi</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" onclick="loadDeliveryHistory()">Lịch sử giao hàng</a>
                        </li>
                    </ul>
                    <div class="d-flex">
                        <button class="btn btn-light" onclick="logout()">Đăng xuất</button>
                    </div>
                </div>
            </div>
        </nav>
        
        <div class="container mt-4">
            <h2>Trang Tài xế</h2>
            <p>Hãy chọn đơn hàng để giao.</p>
        </div>
    `;
}

async function loadAdminDashboard() {
    return `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container">
                <a class="navbar-brand" href="#">Quản trị viên</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link active" href="#">Trang chủ</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" onclick="loadUsers()">Quản lý người dùng</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" onclick="loadRestaurants()">Quản lý nhà hàng</a>
                        </li>
                    </ul>
                    <div class="d-flex">
                        <button class="btn btn-light" onclick="logout()">Đăng xuất</button>
                    </div>
                </div>
            </div>
        </nav>
        
        <div class="container mt-4">
            <h2>Trang Quản trị viên</h2>
            <p>Chào mừng đến với bảng điều khiển quản trị.</p>
        </div>
    `;
}

// Hàm tải danh sách nhà hàng (cho khách hàng)
async function loadRestaurants() {
    // Code tải danh sách nhà hàng sẽ được thêm sau
}