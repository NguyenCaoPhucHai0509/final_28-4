// available-deliveries.js - Xử lý trang danh sách đơn hàng chờ giao

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra vai trò và tải danh sách đơn hàng chờ giao
    const user = getCurrentUser();
    if (!user || user.role !== 'driver') {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = 'index.html';
        return;
    }
    
    // Tải danh sách đơn hàng chờ giao
    loadAvailableDeliveries();
    
    // Thiết lập sự kiện cho nút làm mới
    document.getElementById('refresh-btn').addEventListener('click', loadAvailableDeliveries);
});

// Hàm tải danh sách đơn hàng chờ giao
async function loadAvailableDeliveries() {
    const deliveryList = document.getElementById('delivery-list');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error-message');
    
    try {
        // Hiển thị trạng thái đang tải
        loadingElement.classList.remove('d-none');
        deliveryList.innerHTML = '';
        errorElement.classList.add('d-none');
        
        // Gọi API để lấy danh sách đơn hàng chờ giao
        const response = await fetchWithAuth('http://localhost:8004/delivery-requests?is_active=true');
        
        if (!response.ok) {
            throw new Error('Không thể tải danh sách đơn hàng chờ giao');
        }
        
        const deliveries = await response.json();
        
        // Ẩn trạng thái đang tải
        loadingElement.classList.add('d-none');
        
        // Kiểm tra nếu không có đơn hàng chờ giao
        if (!deliveries || deliveries.length === 0) {
            deliveryList.innerHTML = `
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i> Hiện không có đơn hàng nào đang chờ giao.
                </div>
            `;
            return;
        }
        
        // Lọc những đơn hàng chưa có tài xế
        const availableDeliveries = deliveries.filter(delivery => !delivery.driver_id);
        
        if (availableDeliveries.length === 0) {
            deliveryList.innerHTML = `
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i> Hiện không có đơn hàng nào đang chờ giao.
                </div>
            `;
            return;
        }
        
        // Hiển thị danh sách đơn hàng
        let html = `
            <div class="row row-cols-1 row-cols-md-2 g-4">
        `;
        
        availableDeliveries.forEach(delivery => {
            html += createDeliveryCard(delivery);
        });
        
        html += `</div>`;
        
        deliveryList.innerHTML = html;
        
        // Thiết lập sự kiện cho các nút "Nhận đơn"
        document.querySelectorAll('.accept-btn').forEach(button => {
            button.addEventListener('click', function() {
                const deliveryId = this.getAttribute('data-id');
                showAcceptConfirmation(deliveryId);
            });
        });
        
    } catch (error) {
        // Ẩn trạng thái đang tải và hiển thị lỗi
        loadingElement.classList.add('d-none');
        errorElement.textContent = error.message;
        errorElement.classList.remove('d-none');
        console.error('Lỗi khi tải danh sách đơn hàng chờ giao:', error);
    }
}

// Hàm tạo HTML cho thẻ đơn hàng
function createDeliveryCard(delivery) {
    return `
        <div class="col">
            <div class="card h-100 border-danger border-2">
                <div class="card-header bg-danger text-white">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Đơn hàng #${delivery.order_id}</h5>
                        <span class="badge bg-warning text-dark">Chờ giao</span>
                    </div>
                </div>
                <div class="card-body">
                    <p><strong>Khoảng cách:</strong> ${delivery.distance_km} km</p>
                    <p><strong>Phí vận chuyển:</strong> ${parseFloat(delivery.shipping_fee).toLocaleString('vi-VN')}đ</p>
                    <hr>
                    <div class="d-grid">
                        <button class="btn btn-danger accept-btn" data-id="${delivery.order_id}">
                            <i class="bi bi-check-circle"></i> Nhận đơn
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Hàm hiển thị xác nhận nhận đơn
function showAcceptConfirmation(deliveryId) {
    document.getElementById('confirm-order-id').textContent = deliveryId;
    
    // Thiết lập sự kiện cho nút xác nhận
    document.getElementById('confirm-accept-btn').onclick = function() {
        acceptDelivery(deliveryId);
    };
    
    // Hiển thị modal
    const modal = new bootstrap.Modal(document.getElementById('acceptModal'));
    modal.show();
}

// Hàm xác nhận nhận đơn
async function acceptDelivery(deliveryId) {
    const errorElement = document.getElementById('error-message');
    
    try {
        // Gọi API để nhận đơn
        const response = await fetchWithAuth(`http://localhost:8004/delivery-requests/${deliveryId}/accept`, {
            method: 'PATCH'
        });
        
        if (!response.ok) {
            throw new Error('Không thể nhận đơn hàng');
        }
        
        // Đóng modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('acceptModal'));
        modal.hide();
        
        // Hiển thị thông báo thành công
        alert(`Bạn đã nhận đơn hàng #${deliveryId} thành công!`);
        
        // Chuyển hướng đến trang đơn hàng của tôi
        window.location.href = 'my-deliveries.html';
        
    } catch (error) {
        // Hiển thị lỗi
        errorElement.textContent = error.message;
        errorElement.classList.remove('d-none');
        console.error('Lỗi khi nhận đơn hàng:', error);
        
        // Đóng modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('acceptModal'));
        modal.hide();
    }
}