document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        
        try {
            // Gọi API đăng ký
            const response = await fetch('http://localhost:8001/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    username,
                    password,
                    role
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || 'Đăng ký thất bại');
            }
            
            // Hiển thị thông báo thành công
            errorMessage.classList.add('d-none');
            successMessage.textContent = 'Đăng ký thành công! Vui lòng đăng nhập.';
            successMessage.classList.remove('d-none');
            
            // Xóa form
            registerForm.reset();
            
            // Chuyển hướng đến trang đăng nhập sau 3 giây
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
            
        } catch (error) {
            // Hiển thị thông báo lỗi
            successMessage.classList.add('d-none');
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('d-none');
        }
    });
});