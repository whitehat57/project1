import sqlite3
from datetime import datetime

class Database:
    def __init__(self):
        self.conn = sqlite3.connect('inventory.db')
        self.cursor = self.conn.cursor()
        self.create_tables()
    
    def create_tables(self):
        # Tabel Kategori BBM
        self.cursor.execute('''
        CREATE TABLE IF NOT EXISTS fuel_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')

        # Tabel Produk dengan tambahan kolom tipe BBM
        self.cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            stock REAL NOT NULL,
            price REAL NOT NULL,
            fuel_type_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (fuel_type_id) REFERENCES fuel_types (id)
        )
        ''')

        # Tabel Penjualan
        self.cursor.execute('''
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            quantity REAL NOT NULL,
            total_price REAL NOT NULL,
            sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products (id)
        )
        ''')

        # Tabel Riwayat Harga BBM
        self.cursor.execute('''
        CREATE TABLE IF NOT EXISTS fuel_price_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            old_price REAL NOT NULL,
            new_price REAL NOT NULL,
            change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products (id)
        )
        ''')
        self.conn.commit()

        # Inisialisasi tipe BBM jika belum ada
        self.initialize_fuel_types()
    
    def initialize_fuel_types(self):
        # Cek apakah tipe BBM sudah ada
        self.cursor.execute('SELECT COUNT(*) FROM fuel_types')
        count = self.cursor.fetchone()[0]
        
        if count == 0:
            # Inisialisasi tipe BBM default
            fuel_types = [
                ('Pertamax', 'BBM RON 92'),
                ('Pertalite', 'BBM RON 90'),
                ('Solar', 'BBM Diesel')
            ]
            self.cursor.executemany('INSERT INTO fuel_types (name, description) VALUES (?, ?)', fuel_types)
            self.conn.commit()
            
            # Tambahkan produk BBM default
            self.cursor.execute('SELECT id FROM fuel_types WHERE name = ?', ('Pertamax',))
            pertamax_id = self.cursor.fetchone()[0]
            self.add_product('Pertamax', 10, 13900, pertamax_id)
            
            self.cursor.execute('SELECT id FROM fuel_types WHERE name = ?', ('Pertalite',))
            pertalite_id = self.cursor.fetchone()[0]
            self.add_product('Pertalite', 10, 10000, pertalite_id)
            
            self.cursor.execute('SELECT id FROM fuel_types WHERE name = ?', ('Solar',))
            solar_id = self.cursor.fetchone()[0]
            self.add_product('Solar', 10, 6800, solar_id)
    
    def add_product(self, name, stock, price, fuel_type_id=None):
        # Pembulatan stok ke 2 angka desimal
        stock = round(float(stock), 2)
        
        # Cek apakah produk dengan nama yang sama sudah ada
        self.cursor.execute('SELECT id FROM products WHERE name = ?', (name,))
        existing_product = self.cursor.fetchone()
        
        if existing_product:
            # Update stok jika produk sudah ada
            self.cursor.execute('UPDATE products SET stock = ROUND(stock + ?, 2) WHERE id = ?',
                               (stock, existing_product[0]))
        else:
            # Tambah produk baru
            self.cursor.execute('INSERT INTO products (name, stock, price, fuel_type_id) VALUES (?, ?, ?, ?)',
                               (name, stock, price, fuel_type_id))
        self.conn.commit()
    
    def get_fuel_types(self):
        self.cursor.execute('SELECT * FROM fuel_types')
        return self.cursor.fetchall()
    
    def update_fuel_price(self, product_id, new_price):
        # Dapatkan harga lama
        self.cursor.execute('SELECT price FROM products WHERE id = ?', (product_id,))
        old_price = self.cursor.fetchone()[0]
        
        # Catat perubahan harga
        self.cursor.execute('INSERT INTO fuel_price_history (product_id, old_price, new_price) VALUES (?, ?, ?)',
                           (product_id, old_price, new_price))
        
        # Update harga produk
        self.cursor.execute('UPDATE products SET price = ? WHERE id = ?', (new_price, product_id))
        self.conn.commit()
    
    def get_fuel_products(self):
        self.cursor.execute('''
        SELECT p.*, ft.name as fuel_type_name 
        FROM products p 
        JOIN fuel_types ft ON p.fuel_type_id = ft.id
        ''')
        return self.cursor.fetchall()
    
    def update_product(self, id, name, stock, price):
        # Pembulatan stok ke 2 angka desimal
        stock = round(float(stock), 2)
        
        self.cursor.execute('UPDATE products SET name=?, stock=?, price=? WHERE id=?',
                           (name, stock, price, id))
        self.conn.commit()
    
    def delete_product(self, id):
        self.cursor.execute('DELETE FROM products WHERE id=?', (id,))
        self.conn.commit()
    
    def get_all_products(self):
        self.cursor.execute('SELECT * FROM products')
        return self.cursor.fetchall()
    
    def get_product(self, id):
        self.cursor.execute('SELECT * FROM products WHERE id=?', (id,))
        return self.cursor.fetchone()
    
    def get_product_by_name(self, name):
        self.cursor.execute('SELECT * FROM products WHERE name LIKE ?', ('%' + name + '%',))
        return self.cursor.fetchall()
    
    def record_sale(self, product_id, quantity, total_price):
        # Pembulatan quantity ke 2 angka desimal
        quantity = round(float(quantity), 2)
        
        # Kurangi stok
        self.cursor.execute('UPDATE products SET stock = ROUND(stock - ?, 2) WHERE id = ?',
                           (quantity, product_id))
        
        # Catat penjualan
        self.cursor.execute('INSERT INTO sales (product_id, quantity, total_price) VALUES (?, ?, ?)',
                           (product_id, quantity, total_price))
        self.conn.commit()
    
    def get_monthly_sales(self, year, month):
        self.cursor.execute('''
        SELECT p.name, SUM(s.quantity) as total_quantity, SUM(s.total_price) as total_revenue
        FROM sales s
        JOIN products p ON s.product_id = p.id
        WHERE strftime('%Y', s.sale_date) = ? AND strftime('%m', s.sale_date) = ?
        GROUP BY p.id, p.name
        ''', (str(year), str(month).zfill(2)))
        return self.cursor.fetchall()
    
    def __del__(self):
        self.conn.close()