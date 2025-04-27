// menu.js - Xử lý trang thực đơn nhà hàng

// Biến toàn cục để lưu thông tin
let currentRestaurant = null;
let menuItems = [];
let cart = [];
let map = null;
let marker = null;

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xác thực
    if (!checkAuth()) return;
    
    // Lấy ID nhà hàng từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantId = urlParams.get('id');
    
    if (!restaurantId) {
        window.location.href = 'restaurants.html';
        return;
    }
    
    // Tải thông tin nhà hàng và thực đơn
    loadRestaurant(restaurantId);
    loadMenu(restaurantId);
    
    // Thiết lập sự kiện cho nút thanh toán
    document.getElementById('checkout-btn').addEventListener('click', function() {
        // Đóng modal giỏ hàng
        const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
        cartModal.hide();
        
        // Mở modal thanh toán và khởi tạo bản đồ
        setTimeout(() => {
            const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
            checkoutModal.show();
            
            // Khởi tạo bản đồ sau khi modal hiển thị
            setTimeout(initMap, 500);
        }, 500);
    });
    
    // Thiết lập sự kiện cho nút đặt hàng
    document.getElementById('place-order-btn').addEventListener('click', placeOrder);
});

// Hàm tải thông tin nhà hàng
async function loadRestaurant(restaurantId) {
    const restaurantInfo = document.getElementById('restaurant-info');
    const errorElement = document.getElementById('error-message');
    
    try {
        // Gọi API để lấy thông tin nhà hàng
        const response = await fetchWithAuth(`http://localhost:8002/branches/${restaurantId}`);
        
        if (!response.ok) {
            throw new Error('Không thể tải thông tin nhà hàng');
        }
        
        currentRestaurant = await response.json();
        
        // Hiển thị thông tin nhà hàng
        restaurantInfo.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <h2>${currentRestaurant.name}</h2>
                <a href="restaurants.html" class="btn btn-outline-primary">
                    <i class="bi bi-arrow-left"></i> Quay lại danh sách nhà hàng
                </a>
            </div>
            <p class="text-muted">
                <i class="bi bi-geo-alt-fill text-danger"></i> 
                Vị trí: ${currentRestaurant.latitude}, ${currentRestaurant.longitude}
            </p>
            <hr>
            <h3>Thực đơn</h3>
        `;
        
    } catch (error) {
        errorElement.textContent = error.message;
        errorElement.classList.remove('d-none');
        console.error('Lỗi khi tải thông tin nhà hàng:', error);
    }
}

// Hàm tải thực đơn
async function loadMenu(restaurantId) {
    const menuList = document.getElementById('menu-list');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error-message');
    
    try {
        // Hiển thị trạng thái đang tải
        loadingElement.classList.remove('d-none');
        menuList.innerHTML = '';
        
        // Gọi API để lấy danh sách món ăn
        const response = await fetchWithAuth(`http://localhost:8002/branches/${restaurantId}/menu-items`);
        
        if (!response.ok) {
            throw new Error('Không thể tải thực đơn');
        }
        
        menuItems = await response.json();
        
        // Ẩn trạng thái đang tải
        loadingElement.classList.add('d-none');
        
        // Kiểm tra nếu không có món ăn
        if (menuItems.length === 0) {
            menuList.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">
                        Nhà hàng này chưa có món ăn nào.
                    </div>
                </div>
            `;
            return;
        }
        
        // Hiển thị danh sách món ăn
        menuItems.forEach(item => {
            const menuItemCard = createMenuItemCard(item);
            menuList.innerHTML += menuItemCard;
        });
        
        // Thêm sự kiện cho các nút "Thêm vào giỏ hàng"
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = parseInt(this.getAttribute('data-id'));
                addToCart(itemId);
            });
        });
        
    } catch (error) {
        // Ẩn trạng thái đang tải và hiển thị lỗi
        loadingElement.classList.add('d-none');
        errorElement.textContent = error.message;
        errorElement.classList.remove('d-none');
        console.error('Lỗi khi tải thực đơn:', error);
    }
}

// Hàm tạo HTML cho thẻ món ăn
function createMenuItemCard(item) {
    const price = parseFloat(item.price).toLocaleString('vi-VN');
    
    return `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text text-muted">
                        ${item.description || 'Không có mô tả'}
                    </p>
                    <p class="card-text fw-bold text-primary">${price}đ</p>
                </div>
                <div class="card-footer bg-white border-top-0">
                    <button class="btn btn-outline-primary add-to-cart-btn" data-id="${item.id}">
                        <i class="bi bi-cart-plus"></i> Thêm vào giỏ hàng
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Hàm thêm sản phẩm vào giỏ hàng
function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    
    if (!item) return;
    
    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingItem = cart.find(i => i.id === itemId);
    
    if (existingItem) {
        // Nếu đã có, tăng số lượng
        existingItem.quantity += 1;
    } else {
        // Nếu chưa có, thêm mới vào giỏ hàng
        cart.push({
            id: item.id,
            name: item.name,
            price: parseFloat(item.price),
            quantity: 1
        });
    }
    
    // Cập nhật giỏ hàng
    updateCart();
    
    // Hiển thị thông báo thành công (có thể thêm một toast message ở đây)
    console.log('Đã thêm vào giỏ hàng:', item.name);
}

// Hàm cập nhật giỏ hàng
function updateCart() {
    const cartItemsElement = document.getElementById('cart-items');
    const emptyCartElement = document.getElementById('empty-cart');
    const cartCountElement = document.getElementById('cart-count');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Tính tổng số lượng và tổng tiền
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Cập nhật biểu tượng giỏ hàng
    if (totalItems > 0) {
        cartCountElement.textContent = totalItems;
        cartCountElement.classList.remove('d-none');
        checkoutBtn.disabled = false;
    } else {
        cartCountElement.classList.add('d-none');
        checkoutBtn.disabled = true;
    }
    
    // Cập nhật tổng tiền
    cartTotalElement.textContent = `${totalAmount.toLocaleString('vi-VN')}đ`;
    
    // Hiển thị danh sách sản phẩm trong giỏ hàng
    if (cart.length === 0) {
        cartItemsElement.innerHTML = '';
        emptyCartElement.classList.remove('d-none');
    } else {
        emptyCartElement.classList.add('d-none');
        
        let cartHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th class="text-center">Số lượng</th>
                        <th class="text-end">Giá</th>
                        <th class="text-end">Thành tiền</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            
            cartHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td class="text-center">
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn-outline-secondary decrease-qty" data-index="${index}">-</button>
                            <span class="btn btn-outline-secondary disabled">${item.quantity}</span>
                            <button type="button" class="btn btn-outline-secondary increase-qty" data-index="${index}">+</button>
                        </div>
                    </td>
                    <td class="text-end">${item.price.toLocaleString('vi-VN')}đ</td>
                    <td class="text-end">${itemTotal.toLocaleString('vi-VN')}đ</td>
                    <td class="text-end">
                        <button type="button" class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        cartHTML += `
                </tbody>
            </table>
        `;
        
        cartItemsElement.innerHTML = cartHTML;
        
        // Thêm sự kiện cho các nút trong giỏ hàng
        document.querySelectorAll('.increase-qty').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                cart[index].quantity += 1;
                updateCart();
            });
        });
        
        document.querySelectorAll('.decrease-qty').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                } else {
                    cart.splice(index, 1);
                }
                updateCart();
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                cart.splice(index, 1);
                updateCart();
            });
        });
    }
}

// Khởi tạo bản đồ cho việc chọn địa điểm giao hàng
function initMap() {
    const mapContainer = document.getElementById('map');
    
    // Nếu đã có bản đồ, không cần khởi tạo lại
    if (map) return;
    
    // Vị trí mặc định (Thành phố Hồ Chí Minh)
    const defaultLocation = [10.7769, 106.7009];
    
    // Khởi tạo bản đồ
    map = L.map('map').setView(defaultLocation, 13);
    
    // Thêm layer bản đồ
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Thêm marker mặc định
    marker = L.marker(defaultLocation).addTo(map);
    
    // Thêm marker khi click vào bản đồ (để người dùng có thể điều chỉnh thủ công)
    map.on('click', function(e) {
        const { lat, lng } = e.latlng;
        
        // Cập nhật vị trí marker
        updateMarkerPosition(lat, lng);
    });
    
    // Thiết lập sự kiện cho nút tìm kiếm địa chỉ
    document.getElementById('search-address-btn').addEventListener('click', searchAddress);
    
    // Thiết lập sự kiện cho phép tìm kiếm khi nhấn Enter trong ô địa chỉ
    document.getElementById('delivery-address').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Ngăn form submit
            searchAddress();
        }
    });
    
    // Cập nhật kích thước bản đồ sau khi nó được hiển thị
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
}

// Hàm tìm kiếm địa chỉ và chuyển đổi thành tọa độ
async function searchAddress() {
    const addressInput = document.getElementById('delivery-address');
    const address = addressInput.value.trim();
    
    if (!address) {
        alert('Vui lòng nhập địa chỉ giao hàng');
        return;
    }
    
    try {
        // Hiển thị trạng thái đang tìm kiếm
        const searchBtn = document.getElementById('search-address-btn');
        const originalBtnText = searchBtn.innerHTML;
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang tìm...';
        
        // Thêm thông báo trong console để debug
        console.log('Đang tìm kiếm địa chỉ:', address);
        
        // Gọi API Nominatim để chuyển đổi địa chỉ thành tọa độ
        // Thêm "Vietnam" vào cuối để tăng độ chính xác nếu người dùng không nhập đầy đủ
        const searchQuery = address.includes('Vietnam') ? address : address + ', Vietnam';
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`;
        
        console.log('Gọi API:', nominatimUrl);
        
        const response = await fetch(nominatimUrl, {
            headers: {
                'Accept-Language': 'vi', // Yêu cầu kết quả bằng tiếng Việt
                'User-Agent': 'FoodDeliveryApp/1.0' // Thêm User-Agent để tránh bị chặn
            }
        });
        
        if (!response.ok) {
            throw new Error(`Lỗi khi gọi API: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Kết quả tìm kiếm:', data);
        
        // Khôi phục trạng thái nút tìm kiếm
        searchBtn.disabled = false;
        searchBtn.innerHTML = originalBtnText;
        
        if (data.length === 0) {
            // Không tìm thấy địa chỉ
            alert('Không tìm thấy địa chỉ. Vui lòng kiểm tra lại hoặc thử với địa chỉ khác.');
            return;
        }
        
        // Lấy tọa độ từ kết quả tìm kiếm
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        // Kiểm tra tọa độ hợp lệ
        if (isNaN(lat) || isNaN(lon)) {
            throw new Error('Tọa độ không hợp lệ từ API');
        }
        
        // Cập nhật vị trí marker và tọa độ
        updateMarkerPosition(lat, lon);
        
        // Hiển thị thông báo thành công
        console.log('Đã tìm thấy địa chỉ:', data[0].display_name);
        alert(`Đã tìm thấy địa chỉ: ${data[0].display_name}`);
        
    } catch (error) {
        // Hiển thị thông báo lỗi chi tiết hơn
        console.error('Lỗi khi tìm kiếm địa chỉ:', error);
        alert(`Có lỗi xảy ra khi tìm kiếm địa chỉ: ${error.message}`);
        
        // Khôi phục trạng thái nút tìm kiếm
        const searchBtn = document.getElementById('search-address-btn');
        searchBtn.disabled = false;
        searchBtn.innerHTML = 'Tìm';
    }
}


function updateMarkerPosition(lat, lon) {
    console.log('Cập nhật vị trí marker:', lat, lon);
    
    // Xóa marker cũ nếu có
    if (marker) {
        map.removeLayer(marker);
    }
    
    // Thêm marker mới
    marker = L.marker([lat, lon]).addTo(map);
    
    // Di chuyển bản đồ đến vị trí mới
    map.setView([lat, lon], 15);
    
    // Cập nhật giá trị tọa độ
    document.getElementById('dropoff-lat').value = lat.toFixed(6);
    document.getElementById('dropoff-lon').value = lon.toFixed(6);
    
    console.log('Đã cập nhật tọa độ:', lat.toFixed(6), lon.toFixed(6));
}

// Hàm đặt hàng
async function placeOrder() {
    const errorElement = document.getElementById('error-message');
    
    try {
        // Kiểm tra xem đã nhập địa chỉ giao hàng chưa
        const deliveryAddress = document.getElementById('delivery-address').value.trim();
        const dropoffLat = document.getElementById('dropoff-lat').value;
        const dropoffLon = document.getElementById('dropoff-lon').value;
        
        if (!deliveryAddress) {
            alert('Vui lòng nhập địa chỉ giao hàng');
            return;
        }
        
        if (!dropoffLat || !dropoffLon) {
            alert('Vui lòng tìm kiếm địa chỉ giao hàng để xác định vị trí');
            return;
        }
        
        // Chuẩn bị dữ liệu đơn hàng
        const orderData = {
            branch_id: currentRestaurant.id,
            dropoff_lat: parseFloat(dropoffLat),
            dropoff_lon: parseFloat(dropoffLon),
            items: cart.map(item => ({
                menu_item_id: item.id,
                quantity: item.quantity,
                note: document.getElementById('notes').value
            }))
        };
        
        // Hiển thị thông báo đang xử lý
        document.getElementById('place-order-btn').disabled = true;
        document.getElementById('place-order-btn').innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Đang xử lý...
        `;
        
        // Gọi API để tạo đơn hàng
        const response = await fetchWithAuth('http://localhost:8003/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            throw new Error('Không thể tạo đơn hàng');
        }
        
        const orderResult = await response.json();
        
        // Đóng modal thanh toán
        const checkoutModal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
        checkoutModal.hide();
        
        // Xóa giỏ hàng
        cart = [];
        updateCart();
        
        // Hiển thị thông báo thành công
        alert('Đơn hàng đã được tạo thành công!');
        
        // Chuyển hướng đến trang chi tiết đơn hàng
        window.location.href = `order-detail.html?id=${orderResult.id}`;
        
    } catch (error) {
        // Hiển thị lỗi
        errorElement.textContent = error.message;
        errorElement.classList.remove('d-none');
        console.error('Lỗi khi đặt hàng:', error);
        
        // Kích hoạt lại nút đặt hàng
        document.getElementById('place-order-btn').disabled = false;
        document.getElementById('place-order-btn').innerHTML = 'Đặt hàng';
    }
}