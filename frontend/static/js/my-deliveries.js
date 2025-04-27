// my-deliveries.js - Xử lý trang đơn hàng của tôi (tài xế)

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra vai trò và tải danh sách đơn hàng của tôi
    const user = getCurrentUser();
    if (!user || user.role !== 'driver') {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = 'index.html';
        return;
    }
    
    // Tải danh sách đơn hàng của tôi
    loadMyDeliveries();
    
    // Thiết lập sự kiện cho nút làm mới
    document.getElementById('refresh-btn').addEventListener('click', loadMyDeliveries);
});

// Hàm tải danh sách đơn hàng của tôi
async function loadMyDeliveries() {
    const myDeliveryList = document.getElementById('my-delivery-list');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error-message');
    
    try {
        // Hiển thị trạng thái đang tải
        loadingElement.classList.remove('d-none');
        myDeliveryList.innerHTML = '';
        errorElement.classList.add('d-none');
        
        // Gọi API để lấy danh sách đơn hàng của tôi
        const response = await fetchWithAuth('http://localhost:8004/delivery-requests');
        
        if (!response.ok) {
            throw new Error('Không thể tải danh sách đơn hàng của bạn');
        }
        
        const allDeliveries = await response.json();
        
        // Ẩn trạng thái đang tải
        loadingElement.classList.add('d-none');
        
        // Lọc những đơn hàng của tài xế hiện tại
        const currentDriver = getCurrentUser();
        const myDeliveries = allDeliveries.filter(delivery => delivery.driver_id === currentDriver.id);
        
        // Kiểm tra nếu không có đơn hàng nào
        if (!myDeliveries || myDeliveries.length === 0) {
            myDeliveryList.innerHTML = `
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i> Bạn chưa nhận đơn hàng nào.
                    <a href="available-deliveries.html" class="alert-link">Xem đơn hàng chờ giao</a>
                </div>
            `;
            return;
        }
        
        // Phân loại đơn hàng theo trạng thái
        const deliveringOrders = myDeliveries.filter(delivery => delivery.status === 'delivering');
        const deliveredOrders = myDeliveries.filter(delivery => delivery.status === 'delivered');
        
        // Hiển thị đơn hàng đang giao trước
        let html = '';
        
        if (deliveringOrders.length > 0) {
            html += `
                <h4 class="mt-4 mb-3"><i class="bi bi-truck text-danger"></i> Đơn hàng đang giao (${deliveringOrders.length})</h4>
                <div class="row row-cols-1 row-cols-md-2 g-4 mb-5">
            `;
            
            deliveringOrders.forEach(delivery => {
                html += createMyDeliveryCard(delivery, 'delivering');
            });
            
            html += `</div>`;
        }
        
        // Hiển thị đơn hàng đã giao
        if (deliveredOrders.length > 0) {
            html += `
                <h4 class="mt-4 mb-3"><i class="bi bi-check-circle text-success"></i> Đơn hàng đã giao (${deliveredOrders.length})</h4>
                <div class="row row-cols-1 row-cols-md-2 g-4">
            `;
            
            deliveredOrders.forEach(delivery => {
                html += createMyDeliveryCard(delivery, 'delivered');
            });
            
            html += `</div>`;
        }
        
        myDeliveryList.innerHTML = html;
        
        // Thiết lập sự kiện cho các nút
        document.querySelectorAll('.delivery-action-btn').forEach(button => {
            button.addEventListener('click', function() {
                const deliveryId = this.getAttribute('data-id');
                const action = this.getAttribute('data-action');
                
                if (action === 'confirm-delivery') {
                    showConfirmDeliveryModal(deliveryId);
                } else if (action === 'view-map') {
                    viewDeliveryLocation(deliveryId);
                }
            });
        });
        
    } catch (error) {
        // Ẩn trạng thái đang tải và hiển thị lỗi
        loadingElement.classList.add('d-none');
        errorElement.textContent = error.message;
        errorElement.classList.remove('d-none');
        console.error('Lỗi khi tải danh sách đơn hàng của bạn:', error);
    }
}

// Hàm tạo HTML cho thẻ đơn hàng của tôi
function createMyDeliveryCard(delivery, status) {
    let statusClass = '';
    let statusText = '';
    let buttonHTML = '';
    
    if (status === 'delivering') {
        statusClass = 'bg-info text-dark';
        statusText = 'Đang giao';
        
        const isConfirmed = delivery.is_driver_confirmed;
        
        if (isConfirmed) {
            buttonHTML = `
                <button class="btn btn-outline-secondary mb-2 w-100" disabled>
                    <i class="bi bi-check-circle-fill text-success"></i> Đã xác nhận giao hàng
                </button>
            `;
        } else {
            buttonHTML = `
                <button class="btn btn-success mb-2 w-100 delivery-action-btn" data-id="${delivery.order_id}" data-action="confirm-delivery">
                    <i class="bi bi-check-circle"></i> Xác nhận đã giao
                </button>
            `;
        }
        
        buttonHTML += `
            <button class="btn btn-outline-primary w-100 delivery-action-btn" data-id="${delivery.order_id}" data-action="view-map">
                <i class="bi bi-geo-alt"></i> Xem vị trí giao hàng
            </button>
        `;
    } else {
        statusClass = 'bg-success';
        statusText = 'Đã giao';
        buttonHTML = `
            <button class="btn btn-outline-primary w-100 delivery-action-btn" data-id="${delivery.order_id}" data-action="view-map">
                <i class="bi bi-geo-alt"></i> Xem vị trí giao hàng
            </button>
        `;
    }
    
    return `
        <div class="col">
            <div class="card h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Đơn hàng #${delivery.order_id}</h5>
                    <span class="badge ${statusClass}">${statusText}</span>
                </div>
                <div class="card-body">
                    <p><strong>Khoảng cách:</strong> ${delivery.distance_km} km</p>
                    <p><strong>Phí vận chuyển:</strong> ${parseFloat(delivery.shipping_fee).toLocaleString('vi-VN')}đ</p>
                    <p><strong>Xác nhận của khách hàng:</strong> 
                        ${delivery.is_customer_confirmed 
                            ? '<span class="text-success"><i class="bi bi-check-circle-fill"></i> Đã xác nhận</span>' 
                            : '<span class="text-warning"><i class="bi bi-clock"></i> Chưa xác nhận</span>'}
                    </p>
                    <div class="d-grid gap-2 mt-3">
                        ${buttonHTML}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Hàm hiển thị modal xác nhận đã giao hàng
function showConfirmDeliveryModal(deliveryId) {
    document.getElementById('confirm-delivery-id').textContent = deliveryId;
    
    // Thiết lập sự kiện cho nút xác nhận
    document.getElementById('confirm-delivery-btn').onclick = function() {
        confirmDelivery(deliveryId);
    };
    
    // Hiển thị modal
    const modal = new bootstrap.Modal(document.getElementById('confirmDeliveryModal'));
    modal.show();
}

// Hàm xác nhận đã giao hàng
async function confirmDelivery(deliveryId) {
    const errorElement = document.getElementById('error-message');
    
    try {
        // Gọi API để xác nhận đã giao hàng
        const response = await fetchWithAuth(`http://localhost:8004/delivery-requests/${deliveryId}/confirmed`, {
            method: 'PATCH'
        });
        
        if (!response.ok) {
            throw new Error('Không thể xác nhận giao hàng');
        }
        
        // Đóng modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmDeliveryModal'));
        modal.hide();
        
        // Hiển thị thông báo thành công
        alert(`Bạn đã xác nhận giao hàng thành công cho đơn hàng #${deliveryId}!`);
        
        // Làm mới danh sách đơn hàng
        loadMyDeliveries();
        
    } catch (error) {
        // Hiển thị lỗi
        errorElement.textContent = error.message;
        errorElement.classList.remove('d-none');
        console.error('Lỗi khi xác nhận giao hàng:', error);
        
        // Đóng modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmDeliveryModal'));
        modal.hide();
    }
}

// Hàm xem vị trí giao hàng (thực hiện theo dạng mở popup hoặc trang mới)
function viewDeliveryLocation(deliveryId) {
    // Chuyển hướng đến trang bản đồ với tham số là id đơn hàng
    window.open(`delivery-map.html?id=${deliveryId}`, '_blank');
}