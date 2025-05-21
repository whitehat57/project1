from database import Database
from datetime import datetime
import os
import time
from colorama import init, Fore, Back, Style

# Inisialisasi colorama
init()

class InventoryApp:
    def __init__(self):
        self.db = Database()
    
    def tampilkan_menu(self):
        print(f"\n{Fore.CYAN}=== SISTEM MANAJEMEN INVENTORI ==={Style.RESET_ALL}")
        print(f"{Fore.GREEN}1. Lihat Semua Produk{Style.RESET_ALL}")
        print(f"{Fore.GREEN}2. Tambah Produk{Style.RESET_ALL}")
        print(f"{Fore.GREEN}3. Hapus Produk{Style.RESET_ALL}")
        print(f"{Fore.GREEN}4. Catat Penjualan{Style.RESET_ALL}")
        print(f"{Fore.GREEN}5. Laporan Bulanan{Style.RESET_ALL}")
        print(f"\n{Fore.CYAN}=== MANAJEMEN BBM ==={Style.RESET_ALL}")
        print(f"{Fore.GREEN}6. Penjualan BBM{Style.RESET_ALL}")
        print(f"{Fore.GREEN}7. Tambah Stok BBM{Style.RESET_ALL}")
        print(f"{Fore.GREEN}8. Update Harga BBM{Style.RESET_ALL}")
        print(f"\n{Fore.RED}0. Keluar{Style.RESET_ALL}")
        print(f"{Fore.CYAN}================================{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}Ketik 'kembali' pada input untuk kembali ke menu utama{Style.RESET_ALL}")
    
    def lihat_produk(self):
        print(f"\n{Fore.CYAN}=== DAFTAR PRODUK ==={Style.RESET_ALL}")
        products = self.db.get_all_products()
        if not products:
            print(f"{Fore.RED}Tidak ada produk{Style.RESET_ALL}")
            return
        
        # Menghitung lebar maksimum untuk setiap kolom
        max_id_width = max(len(str(product[0])) for product in products)
        max_nama_width = max(len(str(product[1])) for product in products)
        max_stok_width = max(len(str(product[2])) for product in products)
        max_harga_width = max(len(f"Rp {product[3]}") for product in products)
        
        # Header
        header = f"{Fore.WHITE}{'ID'.ljust(max_id_width)} | {'Nama'.ljust(max_nama_width)} | {'Stok'.ljust(max_stok_width)} | {'Harga'}{Style.RESET_ALL}"
        print(header)
        print("-" * (max_id_width + max_nama_width + max_stok_width + max_harga_width + 9))
        
        # Data produk
        for product in products:
            print(f"{Fore.WHITE}{str(product[0]).ljust(max_id_width)} | {str(product[1]).ljust(max_nama_width)} | {str(product[2]).ljust(max_stok_width)} | Rp {str(product[3])}{Style.RESET_ALL}")
        
        input_kembali = input(f"\n{Fore.YELLOW}Tekan Enter untuk kembali ke menu utama...{Style.RESET_ALL}")
        return
    
    def tambah_produk(self):
        print(f"\n{Fore.CYAN}=== TAMBAH PRODUK ==={Style.RESET_ALL}")
        try:
            nama = input(f"{Fore.GREEN}Nama produk: {Style.RESET_ALL}")
            if nama.lower() == 'kembali':
                return
            stok = int(input(f"{Fore.GREEN}Stok: {Style.RESET_ALL}"))
            harga = float(input(f"{Fore.GREEN}Harga: {Style.RESET_ALL}"))
            
            if nama and stok >= 0 and harga >= 0:
                self.db.add_product(nama, stok, harga)
                print(f"{Fore.GREEN}Produk berhasil ditambahkan!{Style.RESET_ALL}")
            else:
                print(f"{Fore.RED}Error: Data tidak valid{Style.RESET_ALL}")
        except ValueError:
            print(f"{Fore.RED}Error: Masukkan angka yang valid{Style.RESET_ALL}")
        
        input_kembali = input(f"\n{Fore.YELLOW}Tekan Enter untuk kembali ke menu utama...{Style.RESET_ALL}")
        return
    
    def hapus_produk(self):
        print(f"\n{Fore.CYAN}=== HAPUS PRODUK ==={Style.RESET_ALL}")
        self.lihat_produk()
        try:
            id_input = input(f"\n{Fore.GREEN}Masukkan ID produk yang akan dihapus (atau 'kembali' untuk ke menu utama): {Style.RESET_ALL}")
            if id_input.lower() == 'kembali':
                return
            
            id_produk = int(id_input)
            konfirmasi = input(f"{Fore.YELLOW}Anda yakin ingin menghapus produk dengan ID {id_produk}? (y/n): {Style.RESET_ALL}")
            
            if konfirmasi.lower() == 'y':
                self.db.delete_product(id_produk)
                print(f"{Fore.GREEN}Produk berhasil dihapus!{Style.RESET_ALL}")
        except ValueError:
            print(f"{Fore.RED}Error: Masukkan ID yang valid{Style.RESET_ALL}")
        
        input_kembali = input(f"\n{Fore.YELLOW}Tekan Enter untuk kembali ke menu utama...{Style.RESET_ALL}")
        return
    
    def catat_penjualan(self):
        print(f"\n{Fore.CYAN}=== CATAT PENJUALAN ==={Style.RESET_ALL}")
        self.lihat_produk()
        try:
            print(f"\n{Fore.YELLOW}Pilih metode pencarian:{Style.RESET_ALL}")
            print(f"{Fore.GREEN}1. Cari berdasarkan ID{Style.RESET_ALL}")
            print(f"{Fore.GREEN}2. Cari berdasarkan Nama{Style.RESET_ALL}")
            pilihan = input(f"\n{Fore.GREEN}Pilihan (1/2): {Style.RESET_ALL}")
            
            if pilihan not in ['1', '2']:
                print(f"{Fore.RED}Error: Pilihan tidak valid{Style.RESET_ALL}")
                return
            
            produk = None
            if pilihan == '1':
                id_input = input(f"{Fore.GREEN}Masukkan ID produk (atau 'kembali' untuk ke menu utama): {Style.RESET_ALL}")
                if id_input.lower() == 'kembali':
                    return
                id_produk = int(id_input)
                produk = self.db.get_product(id_produk)
                if not produk:
                    print(f"{Fore.RED}Error: Produk tidak ditemukan{Style.RESET_ALL}")
                    return
            else:
                nama_input = input(f"{Fore.GREEN}Masukkan nama produk (atau 'kembali' untuk ke menu utama): {Style.RESET_ALL}")
                if nama_input.lower() == 'kembali':
                    return
                produk_list = self.db.get_product_by_name(nama_input)
                if not produk_list:
                    print(f"{Fore.RED}Error: Produk tidak ditemukan{Style.RESET_ALL}")
                    return
                elif len(produk_list) > 1:
                    print(f"\n{Fore.CYAN}Ditemukan beberapa produk:{Style.RESET_ALL}")
                    for p in produk_list:
                        print(f"{Fore.WHITE}{p[0]}. {p[1]} (Stok: {p[2]}, Harga: Rp {p[3]}){Style.RESET_ALL}")
                    id_input = input(f"\n{Fore.GREEN}Pilih ID produk: {Style.RESET_ALL}")
                    if id_input.lower() == 'kembali':
                        return
                    id_produk = int(id_input)
                    produk = self.db.get_product(id_produk)
                    if not produk:
                        print(f"{Fore.RED}Error: Produk tidak ditemukan{Style.RESET_ALL}")
                        return
                else:
                    produk = produk_list[0]
                    id_produk = produk[0]
            
            jumlah = int(input(f"{Fore.GREEN}Jumlah: {Style.RESET_ALL}"))
            
            if produk[2] >= jumlah and jumlah > 0:
                total_harga = jumlah * produk[3]
                self.db.record_sale(id_produk, jumlah, total_harga)
                print(f"{Fore.GREEN}Penjualan berhasil dicatat! Total: Rp {total_harga}{Style.RESET_ALL}")
            else:
                print(f"{Fore.RED}Error: Stok tidak mencukupi atau jumlah tidak valid{Style.RESET_ALL}")
        except ValueError:
            print(f"{Fore.RED}Error: Masukkan angka yang valid{Style.RESET_ALL}")
        
        input_kembali = input(f"\n{Fore.YELLOW}Tekan Enter untuk kembali ke menu utama...{Style.RESET_ALL}")
        return
    
    def laporan_bulanan(self):
        print(f"\n{Fore.CYAN}=== LAPORAN BULANAN ==={Style.RESET_ALL}")
        try:
            tahun_input = input(f"{Fore.GREEN}Masukkan tahun (YYYY) atau 'kembali' untuk ke menu utama: {Style.RESET_ALL}")
            if tahun_input.lower() == 'kembali':
                return
            
            tahun = int(tahun_input)
            bulan = int(input(f"{Fore.GREEN}Masukkan bulan (1-12): {Style.RESET_ALL}"))
            
            if 1 <= bulan <= 12 and tahun > 0:
                print(f"\n{Fore.CYAN}=== LAPORAN PENJUALAN {bulan}/{tahun} ==={Style.RESET_ALL}")
                sales = self.db.get_monthly_sales(tahun, bulan)
                
                if not sales:
                    print(f"{Fore.YELLOW}Tidak ada data penjualan{Style.RESET_ALL}")
                    return
                
                print(f"{Fore.WHITE}Produk\t\tJumlah\tTotal Pendapatan{Style.RESET_ALL}")
                print("-" * 50)
                for sale in sales:
                    print(f"{Fore.WHITE}{sale[0]}\t\t{sale[1]}\tRp {sale[2]}{Style.RESET_ALL}")
            else:
                print(f"{Fore.RED}Error: Bulan atau tahun tidak valid{Style.RESET_ALL}")
        except ValueError:
            print(f"{Fore.RED}Error: Masukkan angka yang valid{Style.RESET_ALL}")
        
        input_kembali = input(f"\n{Fore.YELLOW}Tekan Enter untuk kembali ke menu utama...{Style.RESET_ALL}")
        return
    
    def clear_screen(self):
        os.system('cls' if os.name == 'nt' else 'clear')
        
    def run(self):
        while True:
            self.clear_screen()
            self.tampilkan_menu()
            pilihan = input("Pilih menu (0-8): ")
            
            if pilihan == '1':
                self.clear_screen()
                self.lihat_produk()
                time.sleep(0.5)
            elif pilihan == '2':
                self.clear_screen()
                self.tambah_produk()
                time.sleep(0.5)
            elif pilihan == '3':
                self.clear_screen()
                self.hapus_produk()
                time.sleep(0.5)
            elif pilihan == '4':
                self.clear_screen()
                self.catat_penjualan()
                time.sleep(0.5)
            elif pilihan == '5':
                self.clear_screen()
                self.laporan_bulanan()
                time.sleep(0.5)
            elif pilihan == '6':
                self.clear_screen()
                self.penjualan_bensin()
                time.sleep(0.5)
            elif pilihan == '7':
                self.clear_screen()
                self.tambah_stok_bbm()
                time.sleep(0.5)
            elif pilihan == '8':
                self.clear_screen()
                self.update_harga_bbm()
                time.sleep(0.5)
            elif pilihan == '0':
                self.clear_screen()
                print("Terima kasih telah menggunakan aplikasi ini!")
                break
            else:
                print("Menu tidak valid")
                time.sleep(0.5)
    
    def penjualan_bensin(self):
        print(f"\n{Fore.CYAN}=== PENJUALAN BBM ==={Style.RESET_ALL}")
        try:
            # Tampilkan daftar BBM yang tersedia
            bbm_list = self.db.get_fuel_products()
            if not bbm_list:
                print(f"{Fore.RED}Error: Tidak ada produk BBM tersedia{Style.RESET_ALL}")
                return
            
            print(f"\n{Fore.YELLOW}BBM Tersedia:{Style.RESET_ALL}")
            for bbm in bbm_list:
                print(f"{Fore.WHITE}{bbm[0]}. {bbm[1]} - Rp {bbm[3]}/liter (Stok: {bbm[2]} liter){Style.RESET_ALL}")
            
            id_input = input(f"\n{Fore.GREEN}Pilih nomor BBM: {Style.RESET_ALL}")
            if id_input.lower() == 'kembali':
                return
            
            id_bbm = int(id_input)
            bbm = next((b for b in bbm_list if b[0] == id_bbm), None)
            if not bbm:
                print(f"{Fore.RED}Error: BBM tidak ditemukan{Style.RESET_ALL}")
                return
            
            print(f"\n{Fore.YELLOW}Pilih metode pembelian:{Style.RESET_ALL}")
            print(f"{Fore.GREEN}1. Berdasarkan Liter{Style.RESET_ALL}")
            print(f"{Fore.GREEN}2. Berdasarkan Nominal Rupiah{Style.RESET_ALL}")
            pilihan = input(f"\n{Fore.GREEN}Pilihan (1/2): {Style.RESET_ALL}")
            
            if pilihan not in ['1', '2']:
                print(f"{Fore.RED}Error: Pilihan tidak valid{Style.RESET_ALL}")
                return
            
            harga_per_liter = bbm[3]  # Harga BBM per liter
            
            if pilihan == '1':
                jumlah_liter = float(input(f"{Fore.GREEN}Masukkan jumlah liter: {Style.RESET_ALL}"))
                if jumlah_liter <= 0:
                    print(f"{Fore.RED}Error: Jumlah liter tidak valid{Style.RESET_ALL}")
                    return
                total_harga = jumlah_liter * harga_per_liter
                print(f"\n{Fore.WHITE}Total Harga: Rp {total_harga:.2f}{Style.RESET_ALL}")
            else:
                nominal = float(input(f"{Fore.GREEN}Masukkan nominal (Rp): {Style.RESET_ALL}"))
                if nominal <= 0:
                    print(f"{Fore.RED}Error: Nominal tidak valid{Style.RESET_ALL}")
                    return
                jumlah_liter = nominal / harga_per_liter
                print(f"\n{Fore.WHITE}Jumlah Liter: {jumlah_liter:.2f} liter{Style.RESET_ALL}")
            
            konfirmasi = input(f"\n{Fore.YELLOW}Konfirmasi penjualan (y/n): {Style.RESET_ALL}")
            if konfirmasi.lower() == 'y':
                if bbm[2] >= jumlah_liter:  # Cek stok
                    total = total_harga if pilihan == '1' else nominal
                    self.db.record_sale(bbm[0], jumlah_liter, total)
                    print(f"{Fore.GREEN}Penjualan berhasil dicatat!{Style.RESET_ALL}")
                else:
                    print(f"{Fore.RED}Error: Stok BBM tidak mencukupi{Style.RESET_ALL}")
        except ValueError:
            print(f"{Fore.RED}Error: Masukkan angka yang valid{Style.RESET_ALL}")
        
        input_kembali = input(f"\n{Fore.YELLOW}Tekan Enter untuk kembali ke menu utama...{Style.RESET_ALL}")
        return

    def tambah_stok_bbm(self):
        print(f"\n{Fore.CYAN}=== TAMBAH STOK BBM ==={Style.RESET_ALL}")
        try:
            # Tampilkan daftar BBM
            bbm_list = self.db.get_fuel_products()
            if not bbm_list:
                print(f"{Fore.RED}Error: Tidak ada produk BBM tersedia{Style.RESET_ALL}")
                return
            
            print(f"\n{Fore.YELLOW}BBM Tersedia:{Style.RESET_ALL}")
            for bbm in bbm_list:
                print(f"{Fore.WHITE}{bbm[0]}. {bbm[1]} (Stok saat ini: {bbm[2]} liter){Style.RESET_ALL}")
            
            id_input = input(f"\n{Fore.GREEN}Pilih nomor BBM: {Style.RESET_ALL}")
            if id_input.lower() == 'kembali':
                return
            
            id_bbm = int(id_input)
            bbm = next((b for b in bbm_list if b[0] == id_bbm), None)
            if not bbm:
                print(f"{Fore.RED}Error: BBM tidak ditemukan{Style.RESET_ALL}")
                return
            
            tambahan = float(input(f"{Fore.GREEN}Masukkan jumlah liter yang ditambahkan: {Style.RESET_ALL}"))
            if tambahan <= 0:
                print(f"{Fore.RED}Error: Jumlah tidak valid{Style.RESET_ALL}")
                return
            
            stok_baru = bbm[2] + tambahan
            self.db.update_product(id_bbm, bbm[1], stok_baru, bbm[3])
            print(f"{Fore.GREEN}Stok BBM berhasil ditambahkan!{Style.RESET_ALL}")
            
        except ValueError:
            print(f"{Fore.RED}Error: Masukkan angka yang valid{Style.RESET_ALL}")
        
        input_kembali = input(f"\n{Fore.YELLOW}Tekan Enter untuk kembali ke menu utama...{Style.RESET_ALL}")
        return

    def update_harga_bbm(self):
        print(f"\n{Fore.CYAN}=== UPDATE HARGA BBM ==={Style.RESET_ALL}")
        try:
            # Tampilkan daftar BBM
            bbm_list = self.db.get_fuel_products()
            if not bbm_list:
                print(f"{Fore.RED}Error: Tidak ada produk BBM tersedia{Style.RESET_ALL}")
                return
            
            print(f"\n{Fore.YELLOW}BBM Tersedia:{Style.RESET_ALL}")
            for bbm in bbm_list:
                print(f"{Fore.WHITE}{bbm[0]}. {bbm[1]} (Harga saat ini: Rp {bbm[3]}/liter){Style.RESET_ALL}")
            
            id_input = input(f"\n{Fore.GREEN}Pilih nomor BBM: {Style.RESET_ALL}")
            if id_input.lower() == 'kembali':
                return
            
            id_bbm = int(id_input)
            bbm = next((b for b in bbm_list if b[0] == id_bbm), None)
            if not bbm:
                print(f"{Fore.RED}Error: BBM tidak ditemukan{Style.RESET_ALL}")
                return
            
            harga_baru = float(input(f"{Fore.GREEN}Masukkan harga baru per liter: {Style.RESET_ALL}"))
            if harga_baru <= 0:
                print(f"{Fore.RED}Error: Harga tidak valid{Style.RESET_ALL}")
                return
            
            konfirmasi = input(f"\n{Fore.YELLOW}Konfirmasi perubahan harga dari Rp {bbm[3]} menjadi Rp {harga_baru} (y/n): {Style.RESET_ALL}")
            if konfirmasi.lower() == 'y':
                self.db.update_fuel_price(id_bbm, harga_baru)
                print(f"{Fore.GREEN}Harga BBM berhasil diupdate!{Style.RESET_ALL}")
            
        except ValueError:
            print(f"{Fore.RED}Error: Masukkan angka yang valid{Style.RESET_ALL}")
        
        input_kembali = input(f"\n{Fore.YELLOW}Tekan Enter untuk kembali ke menu utama...{Style.RESET_ALL}")
        return

if __name__ == '__main__':
    app = InventoryApp()
    app.run()