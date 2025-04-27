// delivery-map.js - Xử lý trang bản đồ giao hàng

let map = null;
let deliveryInfo = null;
let restaurantInfo = null;

document.addEventListener('DOMContentLoaded', function() {
    // Lấy ID đơn hàng từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const deliveryId = urlParams.get('id');
    
    if (!deliveryId) {
        showError('Không tìm thấy thông tin đơn hàng');
        return;
    }
    
    // Tải thông tin đơn hàng và hiển thị bản đồ
    loadDeliveryInfo(deliveryId);
});

// Hàm tải thông tin đơn hàng
async function loadDeliveryInfo(deliveryId) {
    const loadingElement = document.getElementById('loading');
    const deliveryInfoElement = document.getElementById('delivery-info');
    
    try {
        // Hiển thị trạng thái đang tải
        loadingElement.classList.remove('d-none');
        deliveryInfoElement.classList.add('d-none');
        
        // Gọi API để lấy thông tin đơn hàng
        const response = await fetchWithAuth(`http://localhost:8004/delivery-requests/${deliveryId}`);
        
        if (!response.ok) {
            throw new Error('Không thể tải thông tin đơn hàng');
        }
        
        deliveryInfo = await response.json();
        
        // Tải thông tin nhà hàng
        await loadRestaurantInfo(deliveryInfo.branch_id);
        
        // Ẩn trạng thái đang tải và hiển thị thông tin
        loadingElement.classList.add('d-none');
        deliveryInfoElement.classList.remove('d-none');
        
        // Hiển thị thông tin đơn hàng
        displayDeliveryInfo();
        
        // Khởi tạo bản đồ
        initMap();
        
        // Tìm và hiển thị địa chỉ từ tọa độ
        getAddressFromCoordinates(deliveryInfo.dropoff_lat, deliveryInfo.dropoff_lon);
        
    } catch (error) {
        showError(`Lỗi: ${error.message}`);
        console.error('Lỗi khi tải thông tin đơn hàng:', error);
    }
}

// Hàm tải thông tin nhà hàng
async function loadRestaurantInfo(branchId) {
    try {
        const response = await fetchWithAuth(`http://localhost:8002/branches/${branchId}`);
        
        if (!response.ok) {
            throw new Error('Không thể tải thông tin nhà hàng');
        }
        
        restaurantInfo = await response.json();
        
    } catch (error) {
        console.error('Lỗi khi tải thông tin nhà hàng:', error);
        // Không ném lỗi ở đây để tiếp tục xử lý
    }
}

// Hàm hiển thị thông tin đơn hàng
function displayDeliveryInfo() {
    if (!deliveryInfo) return;
    
    document.getElementById('order-id-display').textContent = `#${deliveryInfo.order_id}`;
    document.getElementById('distance-display').textContent = deliveryInfo.distance_km;
    document.getElementById('shipping-fee-display').textContent = `${parseFloat(deliveryInfo.shipping_fee).toLocaleString('vi-VN')}đ`;
    
    // Cập nhật liên kết Google Maps
    const googleMapsLink = document.getElementById('google-maps-link');
    googleMapsLink.href = `https://www.google.com/maps/dir/?api=1&destination=${deliveryInfo.dropoff_lat},${deliveryInfo.dropoff_lon}`;
}

// Hàm khởi tạo bản đồ
function initMap() {
    if (!deliveryInfo) return;
    
    // Tọa độ điểm giao hàng
    const deliveryLocation = [deliveryInfo.dropoff_lat, deliveryInfo.dropoff_lon];
    
    // Khởi tạo bản đồ và đặt view tại vị trí giao hàng
    map = L.map('map').setView(deliveryLocation, 15);
    
    // Thêm layer bản đồ
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Thêm marker vị trí giao hàng
    const deliveryMarker = L.marker(deliveryLocation, {
        icon: L.divIcon({
            html: '<i class="bi bi-pin-map-fill text-danger" style="font-size: 32px;"></i>',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            className: 'delivery-marker'
        })
    }).addTo(map);
    
    deliveryMarker.bindPopup('<strong>Điểm giao hàng</strong>').openPopup();
    
    // Thêm marker vị trí nhà hàng nếu có
    if (restaurantInfo) {
        const restaurantLocation = [restaurantInfo.latitude, restaurantInfo.longitude];
        
        const restaurantMarker = L.marker(restaurantLocation, {
            icon: L.divIcon({
                html: '<i class="bi bi-shop text-primary" style="font-size: 24px;"></i>',
                iconSize: [24, 24],
                iconAnchor: [12, 24],
                className: 'restaurant-marker'
            })
        }).addTo(map);
        
        restaurantMarker.bindPopup(`<strong>${restaurantInfo.name}</strong><br>Nhà hàng`);
        
        // Vẽ đường đi từ nhà hàng đến điểm giao hàng
        const points = [
            restaurantLocation,
            deliveryLocation
        ];
        
        const polyline = L.polyline(points, {
            color: 'blue',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10'
        }).addTo(map);
        
        // Điều chỉnh view để hiển thị cả 2 điểm
        map.fitBounds(polyline.getBounds(), {padding: [50, 50]});
    }
}

// Hàm lấy địa chỉ từ tọa độ
async function getAddressFromCoordinates(lat, lon) {
    try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
        
        const response = await fetch(nominatimUrl, {
            headers: {
                'Accept-Language': 'vi', // Yêu cầu kết quả bằng tiếng Việt
                'User-Agent': 'FoodDeliveryApp/1.0' // Thêm User-Agent để tránh bị chặn
            }
        });
        
        if (!response.ok) {
            throw new Error('Không thể lấy thông tin địa chỉ');
        }
        
        const data = await response.json();
        
        // Hiển thị địa chỉ
        document.getElementById('address-display').textContent = data.display_name || 'Không có thông tin địa chỉ';
        
    } catch (error) {
        console.error('Lỗi khi lấy địa chỉ từ tọa độ:', error);
        document.getElementById('address-display').textContent = 'Không thể tải thông tin địa chỉ';
    }
}

// Hàm hiển thị lỗi
function showError(message) {
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error-message');
    const deliveryInfoElement = document.getElementById('delivery-info');
    
    loadingElement.classList.add('d-none');
    deliveryInfoElement.classList.add('d-none');
    
    errorElement.textContent = message;
    errorElement.classList.remove('d-none');
}