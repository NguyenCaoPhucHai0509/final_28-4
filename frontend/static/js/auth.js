// auth.js - Chứa các hàm xác thực và kiểm tra phiên đăng nhập

// Kiểm tra phiên đăng nhập khi tải trang
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    updateUserInfo();
});

// Kiểm tra người dùng đã đăng nhập hay chưa
function checkAuth() {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    // Nếu chưa đăng nhập, chuyển hướng đến trang login
    if (!token || !user) {
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// Cập nhật thông tin người dùng trên thanh điều hướng
function updateUserInfo() {
    const userInfoElement = document.getElementById('user-info');
    if (!userInfoElement) return;
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    userInfoElement.innerHTML = `
        <div class="dropdown">
            <button class="btn btn-light dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown">
                <i class="bi bi-person-circle me-1"></i> ${user.username || 'Người dùng'}
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li><a class="dropdown-item" href="profile.html">Thông tin cá nhân</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" onclick="logout()">Đăng xuất</a></li>
            </ul>
        </div>
    `;
}

// Hàm đăng xuất
function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Hàm lấy token xác thực
function getAuthToken() {
    return localStorage.getItem('access_token');
}

// Hàm lấy thông tin người dùng hiện tại
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('user') || '{}');
}

// Hàm gọi API với xác thực
async function fetchWithAuth(url, options = {}) {
    const token = getAuthToken();
    
    if (!token) {
        throw new Error('Không có token xác thực');
    }
    
    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    
    const mergedOptions = { 
        ...defaultOptions, 
        ...options,
        headers: { ...defaultOptions.headers, ...options.headers }
    };
    
    try {
        const response = await fetch(url, mergedOptions);
        
        if (response.status === 401) {
            // Token hết hạn hoặc không hợp lệ
            logout();
            throw new Error('Phiên đăng nhập đã hết hạn');
        }
        
        return response;
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
}