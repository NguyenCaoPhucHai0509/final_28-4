// restaurants.js - Xử lý trang danh sách nhà hàng

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xác thực và tải danh sách nhà hàng
    if (checkAuth()) {
        loadRestaurants();
    }
});

// Hàm tải danh sách nhà hàng
async function loadRestaurants() {
    const restaurantList = document.getElementById('restaurant-list');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error-message');
    
    try {
        // Hiển thị trạng thái đang tải
        loadingElement.classList.remove('d-none');
        restaurantList.innerHTML = '';
        errorElement.classList.add('d-none');
        
        // Gọi API để lấy danh sách nhà hàng (chi nhánh)
        const response = await fetchWithAuth('http://localhost:8002/branches');
        
        if (!response.ok) {
            throw new Error('Không thể tải danh sách nhà hàng');
        }
        
        const restaurants = await response.json();
        
        // Ẩn trạng thái đang tải
        loadingElement.classList.add('d-none');
        
        // Kiểm tra nếu không có nhà hàng
        if (restaurants.length === 0) {
            restaurantList.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">
                        Không có nhà hàng nào trong hệ thống.
                    </div>
                </div>
            `;
            return;
        }
        
        // Hiển thị danh sách nhà hàng
        restaurants.forEach(restaurant => {
            const restaurantCard = createRestaurantCard(restaurant);
            restaurantList.innerHTML += restaurantCard;
        });
        
        // Thêm sự kiện cho các nút "Xem menu"
        document.querySelectorAll('.view-menu-btn').forEach(button => {
            button.addEventListener('click', function() {
                const restaurantId = this.getAttribute('data-id');
                window.location.href = `menu.html?id=${restaurantId}`;
            });
        });
        
    } catch (error) {
        // Ẩn trạng thái đang tải và hiển thị lỗi
        loadingElement.classList.add('d-none');
        errorElement.textContent = error.message;
        errorElement.classList.remove('d-none');
        console.error('Lỗi khi tải danh sách nhà hàng:', error);
    }
}

// Hàm tạo HTML cho thẻ nhà hàng
function createRestaurantCard(restaurant) {
    return `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${restaurant.name}</h5>
                    <p class="card-text">
                        <i class="bi bi-geo-alt-fill text-danger"></i> 
                        Vị trí: ${restaurant.latitude}, ${restaurant.longitude}
                    </p>
                    <button class="btn btn-primary view-menu-btn" data-id="${restaurant.id}">
                        <i class="bi bi-menu-button-wide"></i> Xem thực đơn
                    </button>
                </div>
            </div>
        </div>
    `;
}