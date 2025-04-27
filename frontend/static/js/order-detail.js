// order-detail.js - Xử lý trang chi tiết đơn hàng

// Biến toàn cục để lưu thông tin
let currentOrder = null;
let deliveryInfo = null;
let paymentInfo = null;
let map = null;

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xác thực
    if (!checkAuth()) return;
    
    // Lấy ID đơn hàng từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    
    if (!orderId) {
        window.location.href = 'my-orders.html';
        return;
    }
    
    // Tải thông tin đơn hàng
    loadOrderDetail(orderId);
    
    // Thiết lập sự kiện cho nút thanh toán
    document.getElementById('pay-button')?.addEventListener('click', function() {
        const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
        paymentModal.show();
    });
    
    // Thiết lập sự kiện cho nút xác nhận đã nhận hàng
    document.getElementById('confirm-delivery-button')?.addEventListener('click', function() {
        confirmDelivery(orderId);
    });
    
    // Thiết lập sự kiện cho nút hoàn tất thanh toán trong modal
    document.getElementById('complete-payment-btn')?.addEventListener('click', function() {
        completePayment(orderId);
    });
    
    // Thiết lập sự kiện khi thay đổi phương thức thanh toán
    document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const cardFields = document.getElementById('card-payment-fields');
            if (this.value === 'credit_card') {
                cardFields.classList.remove('d-none');
            } else {
                cardFields.classList.add('d-none');
            }
        });
    });
});

// Hàm tải thông tin chi tiết đơn hàng
async function loadOrderDetail(orderId) {
    const orderDetailElement = document.getElementById('order-detail');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error-message');
    
    try {
        // Hiển thị trạng thái đang tải
        loadingElement.classList.remove('d-none');
        orderDetailElement.classList.add('d-none');
        errorElement.classList.add('d-none');
        
        // Gọi API để lấy thông tin đơn hàng
        const orderResponse = await fetchWithAuth(`http://localhost:8003/orders/${orderId}`);
        
        if (!orderResponse.ok) {
            throw new Error('Không thể tải thông tin đơn hàng');
        }
        
        currentOrder = await orderResponse.json();
        
        // Lấy thông tin thanh toán
        try {
            const paymentResponse = await fetchWithAuth(`http://localhost:8005/payments/${orderId}`);
            if (paymentResponse.ok) {
                paymentInfo = await paymentResponse.json();
            }
        } catch (error) {
            console.error('Lỗi khi tải thông tin thanh toán:', error);
            // Không cần throw error ở đây, vì có thể đơn hàng chưa có thông tin thanh toán
        }
        
        // Lấy thông tin vận chuyển
        try {
            const deliveryResponse = await fetchWithAuth(`http://localhost:8004/delivery-requests/${orderId}`);
            if (deliveryResponse.ok) {
                deliveryInfo = await deliveryResponse.json();
            }
        } catch (error) {
            console.error('Lỗi khi tải thông tin vận chuyển:', error);
            // Không cần throw error ở đây, vì có thể đơn hàng chưa có thông tin vận chuyển
        }
        
        // Ẩn trạng thái đang tải và hiển thị thông tin đơn hàng
        loadingElement.classList.add('d-none');
        orderDetailElement.classList.remove('d-none');
        
        // Hiển thị thông tin đơn hàng
        displayOrderInfo();
        
    } catch (error) {
        // Ẩn trạng thái đang tải và hiển thị lỗi
        loadingElement.classList.add('d-none');
        errorElement.textContent = error.message;
        errorElement.classList.remove('d-none');
        console.error('Lỗi khi tải thông tin đơn hàng:', error);
    }
}

// Hiển thị thông tin đơn hàng
function displayOrderInfo() {
    if (!currentOrder) return;
    
    // Cập nhật thông tin cơ bản
    document.getElementById('order-id').textContent = currentOrder.id;
    document.getElementById('order-time').textContent = new Date(currentOrder.created_at).toLocaleString('vi-VN');
    
    // Hiển thị trạng thái đơn hàng
    const orderStatus = document.getElementById('order-status');
    let statusText = '';
    let statusClass = '';
    
    switch (currentOrder.status) {
        case 'pending':
            statusText = 'Chờ xác nhận';
            statusClass = 'bg-warning text-dark';
            break;
        case 'preparing':
            statusText = 'Đang chuẩn bị';
            statusClass = 'bg-info text-dark';
            break;
        case 'ready_for_delivery':
            statusText = 'Sẵn sàng giao hàng';
            statusClass = 'bg-primary';
            break;
        case 'canceled':
            statusText = 'Đã hủy';
            statusClass = 'bg-danger';
            break;
        default:
            statusText = currentOrder.status;
            statusClass = 'bg-secondary';
    }
    
    orderStatus.textContent = statusText;
    orderStatus.className = '';
    orderStatus.classList.add('badge', statusClass);
    
    // Hiển thị thông tin thanh toán
    const paymentStatus = document.getElementById('payment-status');
    const paymentMethod = document.getElementById('payment-method');
    const paymentAction = document.getElementById('payment-action');
    
    if (paymentInfo) {
        let paymentStatusText = '';
        let paymentStatusClass = '';
        
        switch (paymentInfo.status) {
            case 'pending':
                paymentStatusText = 'Chưa thanh toán';
                paymentStatusClass = 'text-warning';
                paymentAction.classList.remove('d-none');
                break;
            case 'completed':
                paymentStatusText = 'Đã thanh toán';
                paymentStatusClass = 'text-success';
                paymentAction.classList.add('d-none');
                break;
            case 'failed':
                paymentStatusText = 'Thanh toán thất bại';
                paymentStatusClass = 'text-danger';
                paymentAction.classList.remove('d-none');
                break;
            default:
                paymentStatusText = paymentInfo.status;
                paymentStatusClass = 'text-muted';
        }
        
        paymentStatus.textContent = paymentStatusText;
        paymentStatus.className = '';
        paymentStatus.classList.add('fw-bold', paymentStatusClass);
        
        // Hiển thị phương thức thanh toán
        let paymentMethodText = '';
        
        switch (paymentInfo.payment_method) {
            case 'credit_card':
                paymentMethodText = 'Thẻ tín dụng/ghi nợ';
                break;
            case 'cash':
                paymentMethodText = 'Tiền mặt khi nhận hàng';
                break;
            case 'e_wallet':
                paymentMethodText = 'Ví điện tử';
                break;
            default:
                paymentMethodText = paymentInfo.payment_method || 'Chưa chọn';
        }
        
        paymentMethod.textContent = paymentMethodText;
    } else {
        paymentStatus.textContent = 'Chưa thanh toán';
        paymentStatus.className = 'fw-bold text-warning';
        paymentMethod.textContent = 'Chưa chọn';
        
        // Hiển thị nút thanh toán nếu đơn hàng đang ở trạng thái pending
        if (currentOrder.status === 'pending') {
            paymentAction.classList.remove('d-none');
        } else {
            paymentAction.classList.add('d-none');
        }
    }
    
    // Hiển thị danh sách món ăn
    displayOrderItems();
    
    // Hiển thị thông tin giao hàng
    displayDeliveryInfo();
    
    // Hiển thị tổng thanh toán
    displayPaymentSummary();
}

// Hiển thị danh sách món ăn
function displayOrderItems() {
    const orderItemsElement = document.getElementById('order-items');
    
    if (!currentOrder || !currentOrder.order_items) {
        orderItemsElement.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Không có thông tin món ăn</td>
            </tr>
        `;
        return;
    }
    
    let orderItemsHTML = '';
    let subtotal = 0;
    
    currentOrder.order_items.forEach(item => {
        const price = parseFloat(item.price);
        const total = price * item.quantity;
        subtotal += total;
        
        // Trạng thái món ăn
        let statusText = '';
        let statusClass = '';
        
        switch (item.status) {
            case 'pending':
                statusText = 'Chờ xác nhận';
                statusClass = 'text-warning';
                break;
            case 'preparing':
                statusText = 'Đang chuẩn bị';
                statusClass = 'text-info';
                break;
            case 'ready':
                statusText = 'Đã sẵn sàng';
                statusClass = 'text-success';
                break;
            default:
                statusText = item.status;
                statusClass = 'text-muted';
        }
        
        orderItemsHTML += `
            <tr>
                <td>${item.menu_item_id}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-end">${price.toLocaleString('vi-VN')}đ</td>
                <td class="text-end">${total.toLocaleString('vi-VN')}đ</td>
                <td class="text-center"><span class="badge bg-light ${statusClass}">${statusText}</span></td>
            </tr>
        `;
    });
    
    orderItemsElement.innerHTML = orderItemsHTML;
}

// Hiển thị thông tin giao hàng
function displayDeliveryInfo() {
    const deliveryInfoElement = document.getElementById('delivery-info');
    const confirmDeliveryAction = document.getElementById('confirm-delivery-action');
    
    if (!deliveryInfo) {
        deliveryInfoElement.innerHTML = `
            <div class="col-12">
                <p class="text-muted">Chưa có thông tin giao hàng</p>
            </div>
        `;
        confirmDeliveryAction.classList.add('d-none');
        return;
    }
    
    // Hiển thị trạng thái giao hàng
    let statusText = '';
    let statusClass = '';
    
    switch (deliveryInfo.status) {
        case 'pending':
            statusText = 'Chờ giao hàng';
            statusClass = 'text-warning';
            confirmDeliveryAction.classList.add('d-none');
            break;
        case 'delivering':
            statusText = 'Đang giao hàng';
            statusClass = 'text-info';
            confirmDeliveryAction.classList.remove('d-none');
            break;
        case 'delivered':
            statusText = 'Đã giao hàng';
            statusClass = 'text-success';
            confirmDeliveryAction.classList.add('d-none');
            break;
        default:
            statusText = deliveryInfo.status;
            statusClass = 'text-muted';
            confirmDeliveryAction.classList.add('d-none');
    }
    
    // Kiểm tra xác nhận giao hàng
    if (deliveryInfo.is_customer_confirmed) {
        confirmDeliveryAction.classList.add('d-none');
    }
    
    let html = `
        <div class="col-md-6">
            <p><strong>Trạng thái giao hàng:</strong> <span class="fw-bold ${statusClass}">${statusText}</span></p>
            <p><strong>Địa điểm giao hàng:</strong></p>
            <div id="delivery-map" style="height: 200px; margin-bottom: 1rem;"></div>
        </div>
        <div class="col-md-6">
            <p><strong>Khoảng cách:</strong> ${deliveryInfo.distance_km} km</p>
            <p><strong>Phí vận chuyển:</strong> ${parseFloat(deliveryInfo.shipping_fee).toLocaleString('vi-VN')}đ</p>
    `;
    
    if (deliveryInfo.driver_id) {
        html += `<p><strong>Tài xế:</strong> ID: ${deliveryInfo.driver_id}</p>`;
    } else {
        html += `<p><strong>Tài xế:</strong> Chưa được phân công</p>`;
    }
    
    html += `
            <p><strong>Xác nhận nhận hàng:</strong> ${deliveryInfo.is_customer_confirmed ? '<span class="text-success">Đã xác nhận</span>' : '<span class="text-warning">Chưa xác nhận</span>'}</p>
            <p><strong>Xác nhận của tài xế:</strong> ${deliveryInfo.is_driver_confirmed ? '<span class="text-success">Đã xác nhận</span>' : '<span class="text-warning">Chưa xác nhận</span>'}</p>
        </div>
    `;
    
    deliveryInfoElement.innerHTML = html;
    
    // Khởi tạo bản đồ sau khi HTML đã được thêm vào DOM
    setTimeout(() => {
        initDeliveryMap();
    }, 100);
}

// Khởi tạo bản đồ giao hàng
function initDeliveryMap() {
    if (!deliveryInfo) return;
    
    const mapContainer = document.getElementById('delivery-map');
    
    if (!mapContainer) return;
    
    // Khởi tạo bản đồ
    map = L.map('delivery-map').setView([deliveryInfo.dropoff_lat, deliveryInfo.dropoff_lon], 15);
    
    // Thêm layer bản đồ
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Thêm marker vị trí giao hàng
    L.marker([deliveryInfo.dropoff_lat, deliveryInfo.dropoff_lon])
        .addTo(map)
        .bindPopup('Địa điểm giao hàng')
        .openPopup();
}

// Hiển thị tổng thanh toán
function displayPaymentSummary() {
    const subtotalElement = document.getElementById('subtotal');
    const shippingFeeElement = document.getElementById('shipping-fee');
    const totalAmountElement = document.getElementById('total-amount');
    
    // Tính tổng tiền các món ăn
    let subtotal = 0;
    
    if (currentOrder && currentOrder.order_items) {
        currentOrder.order_items.forEach(item => {
            const price = parseFloat(item.price);
            subtotal += price * item.quantity;
        });
    }
    
    // Hiển thị tổng tiền món ăn
    subtotalElement.textContent = `${subtotal.toLocaleString('vi-VN')}đ`;
    
    // Hiển thị phí vận chuyển
    const shippingFee = deliveryInfo ? parseFloat(deliveryInfo.shipping_fee) : 0;
    shippingFeeElement.textContent = `${shippingFee.toLocaleString('vi-VN')}đ`;
    
    // Hiển thị tổng cộng
    const totalAmount = subtotal + shippingFee;
    totalAmountElement.textContent = `${totalAmount.toLocaleString('vi-VN')}đ`;
}

// Hàm xác nhận đã nhận hàng
async function confirmDelivery(orderId) {
    const errorElement = document.getElementById('error-message');
    const confirmButton = document.getElementById('confirm-delivery-button');
    
    try {
        // Vô hiệu hóa nút xác nhận
        confirmButton.disabled = true;
        confirmButton.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Đang xử lý...
        `;
        
        // Gọi API để xác nhận đã nhận hàng
        const response = await fetchWithAuth(`http://localhost:8004/delivery-requests/${orderId}/confirmed`, {
            method: 'PATCH'
        });
        
        if (!response.ok) {
            throw new Error('Không thể xác nhận giao hàng');
        }
        
        // Cập nhật thông tin giao hàng
        deliveryInfo = await response.json();
        
        // Cập nhật giao diện
        displayDeliveryInfo();
        
        // Thông báo thành công
        alert('Xác nhận nhận hàng thành công!');
        
    } catch (error) {
        // Hiển thị lỗi
        errorElement.textContent = error.message;
        errorElement.classList.remove('d-none');
        console.error('Lỗi khi xác nhận giao hàng:', error);
        
        // Kích hoạt lại nút xác nhận
        confirmButton.disabled = false;
        confirmButton.innerHTML = '<i class="bi bi-check-circle"></i> Xác nhận đã nhận hàng';
    }
}

// Thêm hàm này vào file order-detail.js
// Hàm lấy địa chỉ từ tọa độ (reverse geocoding)
async function getAddressFromCoordinates(lat, lon) {
    try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
        
        const response = await fetch(nominatimUrl);
        const data = await response.json();
        
        return data.display_name || 'Không có thông tin địa chỉ';
    } catch (error) {
        console.error('Lỗi khi lấy địa chỉ từ tọa độ:', error);
        return 'Không thể lấy thông tin địa chỉ';
    }
}

// Sửa đổi hàm displayDeliveryInfo() để hiển thị địa chỉ
async function displayDeliveryInfo() {
    const deliveryInfoElement = document.getElementById('delivery-info');
    const confirmDeliveryAction = document.getElementById('confirm-delivery-action');
    
    if (!deliveryInfo) {
        deliveryInfoElement.innerHTML = `
            <div class="col-12">
                <p class="text-muted">Chưa có thông tin giao hàng</p>
            </div>
        `;
        confirmDeliveryAction.classList.add('d-none');
        return;
    }
    
    // Hiển thị trạng thái giao hàng
    let statusText = '';
    let statusClass = '';
    
    switch (deliveryInfo.status) {
        case 'pending':
            statusText = 'Chờ giao hàng';
            statusClass = 'text-warning';
            confirmDeliveryAction.classList.add('d-none');
            break;
        case 'delivering':
            statusText = 'Đang giao hàng';
            statusClass = 'text-info';
            confirmDeliveryAction.classList.remove('d-none');
            break;
        case 'delivered':
            statusText = 'Đã giao hàng';
            statusClass = 'text-success';
            confirmDeliveryAction.classList.add('d-none');
            break;
        default:
            statusText = deliveryInfo.status;
            statusClass = 'text-muted';
            confirmDeliveryAction.classList.add('d-none');
    }
    
    // Kiểm tra xác nhận giao hàng
    if (deliveryInfo.is_customer_confirmed) {
        confirmDeliveryAction.classList.add('d-none');
    }
    
    // Lấy địa chỉ từ tọa độ
    const deliveryAddress = await getAddressFromCoordinates(deliveryInfo.dropoff_lat, deliveryInfo.dropoff_lon);
    
    let html = `
        <div class="col-md-6">
            <p><strong>Trạng thái giao hàng:</strong> <span class="fw-bold ${statusClass}">${statusText}</span></p>
            <p><strong>Địa chỉ giao hàng:</strong> ${deliveryAddress}</p>
            <div id="delivery-map" style="height: 200px; margin-bottom: 1rem;"></div>
        </div>
        <div class="col-md-6">
            <p><strong>Khoảng cách:</strong> ${deliveryInfo.distance_km} km</p>
            <p><strong>Phí vận chuyển:</strong> ${parseFloat(deliveryInfo.shipping_fee).toLocaleString('vi-VN')}đ</p>
    `;
    
    if (deliveryInfo.driver_id) {
        html += `<p><strong>Tài xế:</strong> ID: ${deliveryInfo.driver_id}</p>`;
    } else {
        html += `<p><strong>Tài xế:</strong> Chưa được phân công</p>`;
    }
    
    html += `
            <p><strong>Xác nhận nhận hàng:</strong> ${deliveryInfo.is_customer_confirmed ? '<span class="text-success">Đã xác nhận</span>' : '<span class="text-warning">Chưa xác nhận</span>'}</p>
            <p><strong>Xác nhận của tài xế:</strong> ${deliveryInfo.is_driver_confirmed ? '<span class="text-success">Đã xác nhận</span>' : '<span class="text-warning">Chưa xác nhận</span>'}</p>
        </div>
    `;
    
    deliveryInfoElement.innerHTML = html;
    
    // Khởi tạo bản đồ sau khi HTML đã được thêm vào DOM
    setTimeout(() => {
        initDeliveryMap();
    }, 100);
}

// Hàm hoàn tất thanh toán
async function completePayment(orderId) {
    const errorElement = document.getElementById('error-message');
    const completeButton = document.getElementById('complete-payment-btn');
    
    try {
        // Lấy phương thức thanh toán
        const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;
        
        // Vô hiệu hóa nút thanh toán
        completeButton.disabled = true;
        completeButton.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Đang xử lý...
        `;
        
        // Gọi API để hoàn tất thanh toán
        const response = await fetchWithAuth(`http://localhost:8005/payments/${orderId}/pay`, {
            method: 'PATCH',
            body: JSON.stringify({ payment_method: paymentMethod })
        });
        
        if (!response.ok) {
            throw new Error('Không thể hoàn tất thanh toán');
        }
        
        // Cập nhật thông tin thanh toán
        paymentInfo = await response.json();
        
        // Đóng modal thanh toán
        const paymentModal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
        paymentModal.hide();
        
        // Tải lại thông tin đơn hàng
        loadOrderDetail(orderId);
        
        // Thông báo thành công
        alert('Thanh toán thành công!');
        
    } catch (error) {
        // Hiển thị lỗi
        errorElement.textContent = error.message;
        errorElement.classList.remove('d-none');
        console.error('Lỗi khi thanh toán:', error);
        
        // Kích hoạt lại nút thanh toán
        completeButton.disabled = false;
        completeButton.innerHTML = 'Hoàn tất thanh toán';
    }
}