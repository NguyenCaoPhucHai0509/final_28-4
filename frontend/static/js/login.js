document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            // Gọi API đăng nhập
            const response = await fetch('http://localhost:8001/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'username': username,
                    'password': password
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || 'Đăng nhập thất bại');
            }
            
            // Lưu token vào localStorage
            localStorage.setItem('access_token', data.access_token);
            
            // Lấy thông tin người dùng
            await fetchUserInfo(data.access_token);
            
            // Chuyển hướng đến trang chủ
            window.location.href = 'index.html';
        } catch (error) {
            // Hiển thị thông báo lỗi
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('d-none');
        }
    });
    
    async function fetchUserInfo(token) {
        try {
            const response = await fetch('http://localhost:8001/auth/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Không thể lấy thông tin người dùng');
            }
            
            const userData = await response.json();
            
            // Lưu thông tin người dùng vào localStorage
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
        }
    }
});