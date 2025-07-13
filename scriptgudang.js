document.addEventListener('DOMContentLoaded', function() {
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Dapatkan elemen tbody untuk setiap tabel
    const stokBarangTableBody = document.getElementById('stok-barang-table-body');
    const barangMasukTableBody = document.getElementById('barang-masuk-table-body');
    const barangKeluarTableBody = document.getElementById('barang-keluar-table-body');
    const restockBarangTableBody = document.getElementById('restock-barang-table-body');
    const pengirimanTableBody = document.getElementById('pengiriman-table-body'); // Dapatkan elemen tbody pengiriman

    // --- DATA UTAMA (Sumber Kebenaran untuk Stok Barang) ---
    let stockData = [
        {
            nama: 'Laptop ASUS ROG',
            kode: 'LP-ROG-001',
            jumlah: 15,
            lokasi: 'Rak A1'
        },
        {
            nama: 'Monitor Samsung 24"',
            kode: 'MN-SAM-005',
            jumlah: 30,
            lokasi: 'Rak B2'
        }
    ];

    // --- Data Riwayat Transaksi ---
    let incomingItems = [
        {
            tanggal: '2023-11-01',
            nama: 'Laptop ASUS ROG',
            kode: 'LP-ROG-001',
            jumlah: 10,
            supplier: 'PT. Teknologi Maju',
            lokasi: 'Rak A1'
        },
        {
            tanggal: '2023-10-28',
            nama: 'Monitor Samsung 24"',
            kode: 'MN-SAM-005',
            jumlah: 20,
            supplier: 'CV. Elektronik Jaya',
            lokasi: 'Rak B2'
        }
    ];

    let outgoingItems = [
        {
            tanggal: '2023-10-26',
            nama: 'Laptop ASUS ROG',
            kode: 'LP-ROG-001',
            jumlah: 5,
            penerima: 'Budi'
        },
        {
            tanggal: '2023-10-27',
            nama: 'Monitor Samsung 24"',
            kode: 'MN-SAM-005',
            jumlah: 10,
            penerima: 'Citra'
        }
    ];

    let restockItems = [
        {
            tanggal: '2023-11-05',
            nama: 'Laptop ASUS ROG',
            kode: 'LP-ROG-001',
            jumlah: 8,
            sumber: 'Produksi',
            lokasi: 'Rak A1'
        }
    ];

    // --- Data Pengiriman (Barang Sedang Dikirim) ---
    let shipments = [
        // Contoh data awal
        {
            tanggal_kirim: '2023-10-26',
            nama: 'Laptop ASUS ROG',
            kode: 'LP-ROG-001',
            jumlah: 5,
            tujuan: 'Budi',
            tanggal_tiba: '2023-10-30'
        },
        {
            tanggal_kirim: '2023-10-27',
            nama: 'Monitor Samsung 24"',
            kode: 'MN-SAM-005',
            jumlah: 10,
            tujuan: 'Citra',
            tanggal_tiba: '2023-11-02'
        }
    ];

    // Fungsi Utilitas: Update Stok Barang
    function updateStock(kode, nama, jumlahPerubahan, lokasiBaru = null) {
        let itemIndex = stockData.findIndex(item => item.kode === kode);

        if (itemIndex > -1) {
            // Barang sudah ada, update jumlahnya
            stockData[itemIndex].jumlah += jumlahPerubahan;
            // Opsional: update lokasi jika disediakan
            if (lokasiBaru) {
                stockData[itemIndex].lokasi = lokasiBaru;
            }
        } else {
            // Barang belum ada, tambahkan sebagai item baru di stok
            stockData.push({
                nama: nama,
                kode: kode,
                jumlah: jumlahPerubahan,
                lokasi: lokasiBaru || 'Unknown' // Beri lokasi default jika tidak ada
            });
        }
        renderStokBarangTable(); // Render ulang tabel stok setelah perubahan
    }


    // Fungsi untuk mengaktifkan section dan link sidebar yang sesuai
    function activateSection(targetId) {
        sidebarLinks.forEach(item => item.classList.remove('active'));
        contentSections.forEach(section => section.classList.remove('active'));

        const targetLink = document.querySelector(`.sidebar-nav a[data-content="${targetId}"]`);
        const targetSection = document.getElementById(targetId);

        if (targetLink) {
            targetLink.classList.add('active');
        }
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Panggil fungsi render tabel yang sesuai saat section diaktifkan
        if (targetId === 'stok-barang') {
            renderStokBarangTable();
        } else if (targetId === 'barang-masuk') {
            renderBarangMasukTable();
            // Set default date to today for input fields
            document.getElementById('tanggal-masuk').valueAsDate = new Date(); 
        } else if (targetId === 'barang-keluar') {
            renderBarangKeluarTable();
            // Set default date to today for input fields
            document.getElementById('tanggal-keluar').valueAsDate = new Date();
            // Also set default for tanggal-tiba-keluar, maybe a few days from now
            let futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 5); // 5 days from now
            document.getElementById('tanggal-tiba-keluar').valueAsDate = futureDate;
        } else if (targetId === 'restock-barang') {
            renderRestockBarangTable();
            // Set default date to today for input fields
            document.getElementById('tanggal-restock').valueAsDate = new Date();
        } else if (targetId === 'barang-sedang-dikirim') {
            renderShipmentTable(); // Panggil fungsi render pengiriman
        }
    }

    // Event listener untuk klik pada link sidebar
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = this.getAttribute('data-content');
            activateSection(targetId);
        });
    });

    // Otomatis aktifkan "Stok Barang" saat halaman pertama kali dimuat
    activateSection('stok-barang');

    // --- Fungsi untuk me-render tabel Stok Barang ---
    function renderStokBarangTable() {
        stokBarangTableBody.innerHTML = ''; // Kosongkan tabel sebelum mengisi ulang

        if (stockData.length === 0) {
            stokBarangTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Tidak ada barang dalam stok.</td></tr>';
            return;
        }

        stockData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.nama}</td>
                <td>${item.kode}</td>
                <td>${item.jumlah}</td>
                <td>${item.lokasi || '-'}</td>
            `;
            stokBarangTableBody.appendChild(row);
        });
    }

    // --- Fungsi untuk me-render tabel Pengiriman Barang ---
    function renderShipmentTable() {
        pengirimanTableBody.innerHTML = '';

        if (shipments.length === 0) {
            pengirimanTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Tidak ada barang yang sedang dikirim.</td></tr>';
            return;
        }

        shipments.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.tanggal_kirim}</td>
                <td>${item.nama}</td>
                <td>${item.kode}</td>
                <td>${item.jumlah}</td>
                <td>${item.tujuan || '-'}</td>
                <td>${item.tanggal_tiba || '-'}</td>
            `;
            pengirimanTableBody.appendChild(row);
        });
    }

    // --- Fungsi untuk me-render tabel Barang Masuk ---
    function renderBarangMasukTable() {
        barangMasukTableBody.innerHTML = '';

        if (incomingItems.length === 0) {
            barangMasukTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Tidak ada data barang masuk.</td></tr>';
            return;
        }

        incomingItems.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.tanggal}</td>
                <td>${item.nama}</td>
                <td>${item.kode}</td>
                <td>${item.jumlah}</td>
                <td>${item.supplier || '-'}</td>
                <td>${item.lokasi || '-'}</td>
            `;
            barangMasukTableBody.appendChild(row);
        });
    }

    // --- Fungsi untuk me-render tabel Barang Keluar ---
    function renderBarangKeluarTable() {
        barangKeluarTableBody.innerHTML = '';

        if (outgoingItems.length === 0) {
            barangKeluarTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Tidak ada data barang keluar.</td></tr>';
            return;
        }

        outgoingItems.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.tanggal}</td>
                <td>${item.nama}</td>
                <td>${item.kode}</td>
                <td>${item.jumlah}</td>
                <td>${item.penerima || '-'}</td>
            `;
            barangKeluarTableBody.appendChild(row);
        });
    }

    // --- Fungsi untuk me-render tabel Restock Barang ---
    function renderRestockBarangTable() {
        restockBarangTableBody.innerHTML = '';

        if (restockItems.length === 0) {
            restockBarangTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Tidak ada data restock barang.</td></tr>';
            return;
        }

        restockItems.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.tanggal}</td>
                <td>${item.nama}</td>
                <td>${item.kode}</td>
                <td>${item.jumlah}</td>
                <td>${item.sumber || '-'}</td>
                <td>${item.lokasi || '-'}</td>
            `;
            restockBarangTableBody.appendChild(row);
        });
    }


    // --- LOGIKA FORM BARANG MASUK ---
    const formBarangMasuk = document.getElementById('form-barang-masuk');
    if (formBarangMasuk) {
        formBarangMasuk.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const newEntry = {
                tanggal: document.getElementById('tanggal-masuk').value,
                nama: document.getElementById('nama-barang-masuk').value,
                kode: document.getElementById('kode-barang-masuk').value,
                jumlah: parseInt(document.getElementById('jumlah-masuk').value),
                supplier: document.getElementById('supplier').value,
                lokasi: document.getElementById('lokasi-penyimpanan-masuk').value
            };

            // Update Stock Data
            updateStock(newEntry.kode, newEntry.nama, newEntry.jumlah, newEntry.lokasi);

            incomingItems.push(newEntry);
            renderBarangMasukTable();

            console.log("Data Barang Masuk Dikirim:", newEntry);
            
            alert(`Barang "${newEntry.nama}" (${newEntry.kode}) sejumlah ${newEntry.jumlah} unit berhasil dicatat sebagai barang masuk dan update stok!`);
            
            formBarangMasuk.reset();
            // document.getElementById('tanggal-masuk').valueAsDate = new Date(); // Sudah diset di activateSection
        });
    }

    // --- LOGIKA FORM BARANG KELUAR ---
    const formBarangKeluar = document.getElementById('form-barang-keluar');
    if (formBarangKeluar) {
        formBarangKeluar.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const newOutgoingEntry = {
                tanggal: document.getElementById('tanggal-keluar').value,
                nama: document.getElementById('nama-barang-keluar').value,
                kode: document.getElementById('kode-barang-keluar').value,
                jumlah: parseInt(document.getElementById('jumlah-keluar').value),
                penerima: document.getElementById('penerima').value
            };
            
            const newShipmentEntry = {
                tanggal_kirim: newOutgoingEntry.tanggal,
                nama: newOutgoingEntry.nama,
                kode: newOutgoingEntry.kode,
                jumlah: newOutgoingEntry.jumlah,
                tujuan: newOutgoingEntry.penerima,
                tanggal_tiba: document.getElementById('tanggal-tiba-keluar').value || 'Belum Ditentukan'
            };

            // 1. Update Stok Barang
            updateStock(newOutgoingEntry.kode, newOutgoingEntry.nama, -newOutgoingEntry.jumlah);

            // 2. Tambahkan ke riwayat Barang Keluar
            outgoingItems.push(newOutgoingEntry);
            renderBarangKeluarTable();

            // 3. Tambahkan ke daftar Barang Sedang Dikirim
            shipments.push(newShipmentEntry);
            // Tidak perlu panggil renderShipmentTable di sini, karena sudah dipanggil saat menu 'barang-sedang-dikirim' diklik
            
            console.log("Data Barang Keluar Dikirim:", newOutgoingEntry);
            console.log("Data Pengiriman Dicatat:", newShipmentEntry);
            
            alert(`Barang keluar (${newOutgoingEntry.jumlah} unit ${newOutgoingEntry.nama}) berhasil dicatat! Data pengiriman juga sudah dimasukkan.`);
            
            formBarangKeluar.reset();
            // document.getElementById('tanggal-keluar').valueAsDate = new Date(); // Sudah diset di activateSection
        });
    }

    // --- LOGIKA FORM RESTOCK BARANG ---
    const formRestockBarang = document.getElementById('form-restock-barang');
    if (formRestockBarang) {
        formRestockBarang.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const newEntry = {
                tanggal: document.getElementById('tanggal-restock').value,
                nama: document.getElementById('nama-barang-restock').value,
                kode: document.getElementById('kode-barang-restock').value,
                jumlah: parseInt(document.getElementById('jumlah-restock').value),
                sumber: document.getElementById('sumber-restock').value,
                lokasi: document.getElementById('lokasi-penyimpanan-restock').value
            };

            // Update Stock Data (tambahkan jumlah)
            updateStock(newEntry.kode, newEntry.nama, newEntry.jumlah, newEntry.lokasi);

            restockItems.push(newEntry);
            renderRestockBarangTable();

            console.log("Data Restock Barang Dikirim:", newEntry);
            
            alert(`Restock barang "${newEntry.nama}" (Kode: ${newEntry.kode}) sejumlah ${newEntry.jumlah} unit berhasil dicatat dan stok diupdate!`);
            
            formRestockBarang.reset();
            // document.getElementById('tanggal-restock').valueAsDate = new Date(); // Sudah diset di activateSection
        });
    }
});
