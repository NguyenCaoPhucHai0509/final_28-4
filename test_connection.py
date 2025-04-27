import pymysql

try:
    # Kết nối với mật khẩu từ file .env
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password='144819',
        db='auth'
    )
    print("Kết nối thành công với mật khẩu!")
    cursor = conn.cursor()
    cursor.execute("SELECT VERSION()")
    version = cursor.fetchone()
    print(f"Database version: {version[0]}")
    conn.close()
except Exception as e:
    print(f"Lỗi kết nối: {e}")