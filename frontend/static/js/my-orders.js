// my-orders.js - Xử lý trang danh sách đơn hàng của người dùng

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xác thực và tải danh sách đơn hàng
    if (checkAuth()) {
        loadOrders();
    }
});

// Hàm tải danh sách đơn hàng
async function loadOrders() {
    const ordersList = document.getElementById('orders-list');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error-message');
    
    try {
        // Hiển thị trạng thái đang tải
        loadingElement.classList.remove('d-none');
        ordersList.innerHTML = '';
        errorElement.classList.add('d-none');
        
        // Gọi API để lấy danh sách đơn hàng
        const response = await fetchWithAuth('http://localhost:8003/orders/me');
        
        if (!response.ok) {
            throw new Error('Không thể tải danh sách đơn hàng');
        }
        
        const orders = await response.json();
        
        // Ẩn trạng thái đang tải
        loadingElement.classList.add('d-none');
        
        // Kiểm tra nếu không có đơn hàng
        if (orders.length === 0) {
            ordersList.innerHTML = `
                <div class="alert alert-info">
                    Bạn chưa có đơn hàng nào. <a href="restaurants.html" class="alert-link">Đặt món ngay</a>!
                </div>
            `;
            return;
        }
        
        // Sắp xếp đơn hàng theo thời gian giảm dần (mới nhất lên đầu)
        orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        // Hiển thị danh sách đơn hàng
        let ordersHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Mã đơn hàng</th>
                            <th>Thời gian</th>
                            <th>Trạng thái</th>
                            <th>Số lượng món</th>
                            <th>Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        orders.forEach(order => {
            const orderDate = new Date(order.created_at).toLocaleString('vi-VN');
            const itemCount = order.order_items.length;
            
            // Chuyển đổi trạng thái sang tiếng Việt
            let statusText = '';
            let statusClass = '';
            
            switch (order.status) {
                case 'pending':
                    statusText = 'Chờ xác nhận';
                    statusClass = 'text-warning';
                    break;
                case 'preparing':
                    statusText = 'Đang chuẩn bị';
                    statusClass = 'text-info';
                    break;
                case 'ready_for_delivery':
                    statusText = 'Sẵn sàng giao hàng';
                    statusClass = 'text-primary';
                    break;
                case 'canceled':
                    statusText = 'Đã hủy';
                    statusClass = 'text-danger';
                    break;
                default:
                    statusText = order.status;
                    statusClass = 'text-muted';
            }
            
            ordersHTML += `
                <tr>
                    <td>#${order.id}</td>
                    <td>${orderDate}</td>
                    <td><span class="fw-bold ${statusClass}">${statusText}</span></td>
                    <td>${itemCount} món</td>
                    <td>
                        <a href="order-detail.html?id=${order.id}" class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-eye"></i> Xem chi tiết
                        </a>
                    </td>
                </tr>
            `;
        });
        
        ordersHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        ordersList.innerHTML = ordersHTML;
        
    } catch (error) {
        // Ẩn trạng thái đang tải và hiển thị lỗi
        loadingElement.classList.add('d-none');
        errorElement.textContent = error.message;
        errorElement.classList.remove('d-none');
        console.error('Lỗi khi tải danh sách đơn hàng:', error);
    }
}