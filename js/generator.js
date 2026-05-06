// ===================================================
// generator.js — Prompt generation logic & templates
// ===================================================

const BUSINESS_TEMPLATES = {
  // ── MAKANAN & MINUMAN ──────────────────────────
  restaurant : { 
    label:'🍜 Restoran / Kedai Makan', icon:'🍜', category:'Makanan', tone:'Kasual & Mesra', 
    sections:['Menu Pilihan','Galeri Makanan','Tempahan Online','Ulasan Pelanggan','Lokasi & Hubungi'],
    fields: [
      { id:'cuisine', label:'Jenis Masakan', type:'text', placeholder:'Melayu, Thai, Barat, Fusion...' },
      { id:'specialty', label:'Menu Signatur (Wajib Cuba)', type:'text', placeholder:'Nasi Lemak Pandan, Shellout...' },
      { id:'vibe', label:'Suasana Kedai', type:'text', placeholder:'Santai keluarga, candle light, open-air...' }
    ]
  },
  cafe : { 
    label:'☕ Kafe / Kedai Kopi', icon:'☕', category:'Makanan', tone:'Santai & Trendy',
    sections:['Menu Minuman','Ruang Santai','Wifi & Fasiliti','Acara Khas','Galeri'],
    fields: [
      { id:'coffee_beans', label:'Jenis Kopi/Biji Kopi', type:'text', placeholder:'Arabica, Robusta, Local Brew...' },
      { id:'pastries', label:'Pilihan Pastri/Kek', type:'text', placeholder:'Croissant, Burnt Cheesecake...' },
      { id:'working_friendly', label:'Kemudahan Bekerja', type:'text', placeholder:'Ada plug point, wifi laju, aircond...' }
    ]
  },
  bakery : { 
    label:'🍰 Kedai Kek & Bakeri', icon:'🍰', category:'Makanan', tone:'Hangat & Manis',
    sections:['Katalog Produk','Tempahan Khas','Penghantaran','Testimoni'],
    fields: [
      { id:'cake_types', label:'Kategori Kek', type:'text', placeholder:'Wedding cake, birthday cake, brownies...' },
      { id:'ingredients', label:'Kelebihan Bahan', type:'text', placeholder:'Pure butter, kurang manis, gluten-free...' }
    ]
  },
  foodtruck : { 
    label:'🚐 Food Truck', icon:'🚐', category:'Makanan', tone:'Kasual & Meriah',
    sections:['Menu','Lokasi Harian','Cara Pesan','Galeri'],
    fields: [
      { id:'truck_locations', label:'Lokasi Operasi', type:'text', placeholder:'Taman Melawati, Tapak Urban Street Dining...' },
      { id:'speed_service', label:'Kepantasan Servis', type:'text', placeholder:'Siap dalam 5 minit, grab & go...' }
    ]
  },

  // ── FESYEN & PAKAIAN ───────────────────────────
  fashion : { 
    label:'👗 Butik / Fesyen', icon:'👗', category:'Fesyen', tone:'Mewah & Bergaya',
    sections:['Koleksi Terbaru','Lookbook','Panduan Saiz','Cara Beli'],
    fields: [
      { id:'style_type', label:'Gaya Pakaian', type:'text', placeholder:'Streetwear, Office wear, Casual...' },
      { id:'material', label:'Jenis Kain/Material', type:'text', placeholder:'Cotton, Silk, Premium Linen...' }
    ]
  },
  hijab : { 
    label:'🧕 Butik Hijab & Tudung', icon:'🧕', category:'Fesyen', tone:'Elegan & Sopan',
    sections:['Koleksi','Tutorial Pakai','Testimoni','Kedai Online'],
    fields: [
      { id:'hijab_type', label:'Jenis Tudung', type:'text', placeholder:'Bawal, Shawl, Instant, Khimar...' },
      { id:'collection_name', label:'Nama Koleksi Terbaru', type:'text', placeholder:'Raya 2024, Seri Pagi...' }
    ]
  },
  kids : { 
    label:'👶 Pakaian Kanak-kanak', icon:'👶', category:'Fesyen', tone:'Ceria & Selamat',
    sections:['Koleksi','Panduan Umur','Promosi','Hubungi'],
    fields: [
      { id:'age_range', label:'Peringkat Umur', type:'text', placeholder:'Newborn - 12 tahun, baby gear...' },
      { id:'comfort', label:'Kelebihan Keselesaan', type:'text', placeholder:'100% Organic Cotton, tak gatal...' }
    ]
  },

  // ── KECANTIKAN & KESIHATAN ─────────────────────
  clinic : { 
    label:'🏥 Klinik Estetik & Pergigian', icon:'🏥', category:'Kecantikan', tone:'Profesional & Meyakinkan',
    sections:['Gambar Sebelum & Selepas','Kelayakan Doktor','Rawatan Ditawarkan','Tempahan Janji Temu'],
    fields: [
      { id:'clinic_treatments', label:'Jenis Rawatan', type:'text', placeholder:'Pendakap gigi, pemutihan gigi, rawatan jerawat...' },
      { id:'doctor_credentials', label:'Kelayakan Doktor', type:'text', placeholder:'Lulusan universiti, pengalaman 10 tahun...' }
    ]
  },
  salon : { 
    label:'💇 Salon / Barbershop', icon:'💇', category:'Kecantikan', tone:'Profesional & Trendy',
    sections:['Perkhidmatan','Harga','Galeri','Tempah Temujanji'],
    fields: [
      { id:'services', label:'Servis Utama', type:'text', placeholder:'Hair coloring, treatment, perming...' },
      { id:'stylist_exp', label:'Pengalaman Stylist', type:'text', placeholder:'10 tahun dalam industri, pakar mewarna...' }
    ]
  },
  spa : { 
    label:'💆 Spa & Wellness', icon:'💆', category:'Kecantikan', tone:'Tenang & Mewah',
    sections:['Rawatan','Pakej','Galeri','Tempahan'],
    fields: [
      { id:'spa_treatments', label:'Jenis Rawatan', type:'text', placeholder:'Urutan tradisional, facial, body scrub...' },
      { id:'aromatherapy', label:'Bau/Aroma', type:'text', placeholder:'Lavender, Lemongrass, Sandalwood...' }
    ]
  },
  skincare : { 
    label:'✨ Produk Skincare', icon:'✨', category:'Kecantikan', tone:'Bersih & Saintifik',
    sections:['Produk','Bahan-bahan','Cara Guna','Sebelum & Selepas'],
    fields: [
      { id:'skin_problem', label:'Masalah Kulit Fokus', type:'text', placeholder:'Jerawat, jeragat, kulit kering...' },
      { id:'hero_ingredient', label:'Bahan Utama (Hero)', type:'text', placeholder:'Retinol, Vitamin C, Habbatus Sauda...' }
    ]
  },
  gym : { 
    label:'💪 Gym / Fitness', icon:'💪', category:'Kecantikan', tone:'Energi & Motivasi',
    sections:['Program','Jurulatih','Harga Keahlian','Kemudahan'],
    fields: [
      { id:'gym_type', label:'Jenis Gym', type:'text', placeholder:'Ladies only, 24-hours, CrossFit box...' },
      { id:'membership_perks', label:'Kelebihan Ahli', type:'text', placeholder:'Free personal trainer trial, shower, sauna...' }
    ]
  },

  // ── PENDIDIKAN ────────────────────────────────
  tuition : { 
    label:'📚 Pusat Tuisyen', icon:'📚', category:'Pendidikan', tone:'Profesional & Mesra',
    sections:['Program','Guru Kami','Jadual','Daftar'],
    fields: [
      { id:'subjects', label:'Subjek Ditawarkan', type:'text', placeholder:'Matematik, Sains, BM, Sejarah...' },
      { id:'levels', label:'Tahap Pendidikan', type:'text', placeholder:'UPSR, PT3, SPM, IGCSE...' }
    ]
  },
  onlineCourse : { 
    label:'🎓 Kursus Online', icon:'🎓', category:'Pendidikan', tone:'Motivasi & Profesional',
    sections:['Kursus','Kurikulum','Pengajar','Harga & Daftar'],
    fields: [
      { id:'learning_platform', label:'Platform Pembelajaran', type:'text', placeholder:'Zoom, Website sendiri, Mobile App...' },
      { id:'course_benefit', label:'Apa Pelajar Dapat?', type:'text', placeholder:'Sijil, Lifetime access, Support group...' }
    ]
  },
  kindergarten : { 
    label:'🏫 Tadika / Prasekolah', icon:'🏫', category:'Pendidikan', tone:'Ceria & Mesra',
    sections:['Program','Aktiviti','Kemudahan','Pendaftaran'],
    fields: [
      { id:'curriculum', label:'Silibus/Kurikulum', type:'text', placeholder:'Montessori, Islamic Integrated, KSPK...' },
      { id:'operating_hours', label:'Waktu Operasi', type:'text', placeholder:'7:30 AM - 6:00 PM...' }
    ]
  },

  // ── PERKHIDMATAN PROFESIONAL ──────────────────
  contractor : { 
    label:'🏗️ Kontraktor / Pembinaan', icon:'🏗️', category:'Profesional', tone:'Dipercayai & Kuat',
    sections:['Perkhidmatan','Portfolio','Testimoni','Sebutharga'],
    fields: [
      { id:'construction_type', label:'Jenis Kerja', type:'text', placeholder:'Renovasi rumah, bina baru, wiring...' },
      { id:'cidb', label:'Lesen/Gred CIDB', type:'text', placeholder:'Gred G3, Berdaftar dengan CIDB...' }
    ]
  },
  renovation : { 
    label:'🔨 Ubah Suai Rumah & ID', icon:'🔨', category:'Profesional', tone:'Berkualiti & Eksklusif',
    sections:['Portfolio Projek','Senarai Kepakaran','Testimoni','Borang Lawatan Tapak'],
    fields: [
      { id:'reno_expertise', label:'Kepakaran Utama', type:'text', placeholder:'Pemasangan kabinet, pecah dinding, plaster ceiling...' },
      { id:'reno_style', label:'Gaya Rekaan (ID)', type:'text', placeholder:'Modern Minimalist, Muji, Scandinavian...' }
    ]
  },
  accounting : { 
    label:'📊 Perakaunan / Cukai', icon:'📊', category:'Profesional', tone:'Profesional',
    sections:['Perkhidmatan','Pakej','FAQ','Hubungi'],
    fields: [
      { id:'acc_services', label:'Jenis Servis', type:'text', placeholder:'Audit, Tax filing, Bookkeeping...' },
      { id:'client_focus', label:'Fokus Klien', type:'text', placeholder:'SME, Enterprise, Self-employed...' }
    ]
  },
  legal : { 
    label:'⚖️ Firma Guaman', icon:'⚖️', category:'Profesional', tone:'Authoriti & Formal',
    sections:['Bidang Amalan','Peguam','Kes Berjaya','Konsultasi'],
    fields: [
      { id:'practice_area', label:'Bidang Utama', type:'text', placeholder:'Hartanah, Syariah, Jenayah, Korporat...' },
      { id:'legal_team', label:'Ketua Peguam', type:'text', placeholder:'Dato Ariff & Co, 20 tahun pengalaman...' }
    ]
  },
  insurance : { 
    label:'🛡️ Insurans / Takaful', icon:'🛡️', category:'Profesional', tone:'Amanah & Selamat',
    sections:['Produk','Kalkulator','Ejen','Hubungi'],
    fields: [
      { id:'agency_name', label:'Syarikat Utama', type:'text', placeholder:'Prudential, AIA, Great Eastern, Etiqa...' },
      { id:'plan_focus', label:'Fokus Pelan', type:'text', placeholder:'Kad Medikal, Hibah, Pendidikan...' }
    ]
  },

  // ── HARTANAH & PENGINAPAN ─────────────────────
  homestay : { 
    label:'🏡 Homestay / Inap Desa', icon:'🏡', category:'Hartanah', tone:'Selesa & Mesra',
    sections:['Galeri Gambar','Kemudahan','Kadar Sewaan','Peraturan','Lokasi'],
    fields: [
      { id:'capacity', label:'Kapasiti Maksimum', type:'text', placeholder:'10 orang, 3 bilik tidur...' },
      { id:'amenities', label:'Kemudahan Utama', type:'text', placeholder:'Kolam renang, BBQ pit, Wifi, Netflix...' }
    ]
  },
  rumahSewa : { 
    label:'🔑 Rumah Sewa', icon:'🔑', category:'Hartanah', tone:'Dipercayai & Terang',
    sections:['Maklumat Hartanah','Gambar','Kemudahan','Syarat Sewaan','Hubungi'],
    fields: [
      { id:'property_specs', label:'Spesifikasi Rumah', type:'text', placeholder:'3 Bilik 2 Bilik Air, Fully Furnished...' },
      { id:'rental_rate', label:'Kadar Sewa & Deposit', type:'text', placeholder:'RM1000/bulan, Deposit 2+1...' }
    ]
  },
  property : { 
    label:'🏠 Ejen Hartanah', icon:'🏠', category:'Hartanah', tone:'Profesional & Amanah',
    sections:['Senarai Hartanah','Ejen','Kalkulator','Hubungi'],
    fields: [
      { id:'property_type', label:'Jenis Hartanah', type:'text', placeholder:'Condo, Terrace, Land, Commercial...' },
      { id:'location_focus', label:'Kawasan Fokus', type:'text', placeholder:'KLCC, Shah Alam, Cyberjaya...' },
      { id:'price_range', label:'Julat Harga', type:'text', placeholder:'RM300k - RM1M...' }
    ]
  },
  propDev : { 
    label:'Pemaju Hartanah', icon:'🏢', category:'Hartanah', tone:'Mewah & Eksklusif',
    sections:['Projek','Konsep','Kemudahan','Daftar Minat'],
    fields: [
      { id:'project_status', label:'Status Projek', type:'text', placeholder:'Pre-launch, Under-construction, Ready to move...' },
      { id:'unique_selling', label:'Kelebihan Projek', type:'text', placeholder:'Freehold, Smart home system, Private lift...' }
    ]
  },

  // ── AUTOMOTIF ─────────────────────────────────
  workshop : { 
    label:'🔧 Bengkel / Workshop', icon:'🔧', category:'Automotif', tone:'Dipercayai & Teknikal',
    sections:['Perkhidmatan','Harga','Testimoni','Lokasi'],
    fields: [
      { id:'car_brands', label:'Jenama Kereta', type:'text', placeholder:'Perodua, Proton, European, Luxury...' },
      { id:'workshop_specialty', label:'Pakar Dalam', type:'text', placeholder:'Overhaul, Gearbox, Aircond, Painting...' }
    ]
  },
  carRental : { 
    label:'🚗 Sewa Kereta', icon:'🚗', category:'Automotif', tone:'Mudah & Fleksibel',
    sections:['Armada','Pakej','Cara Tempah','Terma'],
    fields: [
      { id:'fleet_types', label:'Jenis Kereta', type:'text', placeholder:'Axia, Saga, Vellfire, Luxury sports...' },
      { id:'delivery_service', label:'Penghantaran', type:'text', placeholder:'Airport delivery, Doorstep, Self-pickup...' }
    ]
  },

  // ── TEKNOLOGI ────────────────────────────────
  itService : { 
    label:'💻 Perkhidmatan IT', icon:'💻', category:'Teknologi', tone:'Moden & Inovatif',
    sections:['Perkhidmatan','Teknologi','Portfolio','Hubungi'],
    fields: [
      { id:'it_focus', label:'Fokus Servis', type:'text', placeholder:'Cybersecurity, Cloud migration, Hardware repair...' },
      { id:'response_time', label:'Masa Respons', type:'text', placeholder:'Support 24/7, Dalam masa 2 jam...' }
    ]
  },
  webDesign : { 
    label:'🎨 Web Design / Dev', icon:'🎨', category:'Teknologi', tone:'Kreatif & Profesional',
    sections:['Portfolio','Perkhidmatan','Proses','Harga'],
    fields: [
      { id:'tech_stack', label:'Teknologi Digunakan', type:'text', placeholder:'React, WordPress, Shopify, Next.js...' },
      { id:'industries', label:'Industri Fokus', type:'text', placeholder:'E-commerce, Corporate, Startup...' }
    ]
  },
  app : { 
    label:'📱 Pembangunan Aplikasi', icon:'📱', category:'Teknologi', tone:'Inovatif & Moden',
    sections:['Perkhidmatan','Portfolio','Proses','Pakej'],
    fields: [
      { id:'app_platform', label:'Platform App', type:'text', placeholder:'iOS & Android (Hybrid), Native, Web App...' },
      { id:'dev_process', label:'Proses Dev', type:'text', placeholder:'Agile development, 3-6 bulan jangka masa...' }
    ]
  },

  // ── ACARA & HIBURAN ───────────────────────────
  weddingCatering : { 
    label:'🍽️ Pakej Perkahwinan & Katering', icon:'🍽️', category:'Acara', tone:'Mewah & Romantik',
    sections:['Perbandingan Pakej','Senarai Menu','Galeri Dewan & Pelamin','Semak Kekosongan'],
    fields: [
      { id:'wedding_packages', label:'Pakej Ditawarkan', type:'text', placeholder:'Pakej Lengkap, Pakej Kanopi, Pakej Katering...' },
      { id:'special_menu', label:'Menu Istimewa', type:'text', placeholder:'Nasi minyak basmathi, kambing golek...' }
    ]
  },
  event : { 
    label:'🎉 Penganjur Acara', icon:'🎉', category:'Acara', tone:'Meriah & Kreatif',
    sections:['Perkhidmatan','Portfolio','Pakej','Tempah'],
    fields: [
      { id:'event_type', label:'Jenis Acara', type:'text', placeholder:'Wedding, Corporate dinner, Birthday party...' },
      { id:'vendor_network', label:'Rangkaian Vendor', type:'text', placeholder:'Catering, Sound & light, Emcee sedia ada...' }
    ]
  },
  photography : { 
    label:'📷 Fotografi / Videografi', icon:'📷', category:'Acara', tone:'Artistik & Profesional',
    sections:['Portfolio','Pakej','Cara Tempah','Hubungi'],
    fields: [
      { id:'shoot_style', label:'Gaya Rakaman', type:'text', placeholder:'Cinematic, Candid, High-fashion, Vintage...' },
      { id:'delivery_time', label:'Tempoh Siap', type:'text', placeholder:'Edit dalam 2 minggu, Raw files dlm 24 jam...' }
    ]
  },

  // ── PELANCONGAN ────────────────────────────────
  travel : { 
    label:'✈️ Agensi Pelancongan & Umrah', icon:'✈️', category:'Pelancongan', tone:'Dipercayai & Menarik',
    sections:['Jadual Perjalanan','Senarai Hotel','Harga Mengikut Bilik','Borang Tempahan'],
    fields: [
      { id:'travel_packages', label:'Pakej Ditawarkan', type:'text', placeholder:'Pakej Umrah VIP, Percutian Eropah...' },
      { id:'travel_highlights', label:'Kelebihan Pakej', type:'text', placeholder:'Penerbangan terus, hotel 5 bintang...' }
    ]
  },

  // ── PERTANIAN & AGROTEK ───────────────────────
  agriculture : { 
    label:'🚜 Ladang Ternakan & Agrotek', icon:'🚜', category:'Pertanian', tone:'Semula Jadi & Profesional',
    sections:['Katalog Hasil Ladang','Teknologi & Fasiliti','Harga Borong','Lawatan & Hubungi'],
    fields: [
      { id:'farm_produce', label:'Hasil Ladang/Ternakan Utama', type:'text', placeholder:'Lembu wagyu tempatan, Sayur hidroponik...' },
      { id:'farming_method', label:'Kaedah Pertanian', type:'text', placeholder:'Organik, IoT Smart Farming, Bebas Bahan Kimia...' }
    ]
  },

  // ── LOGISTIK ─────────────────────────────────
  logistics : { 
    label:'🚚 Logistik / Penghantaran', icon:'🚚', category:'Logistik', tone:'Pantas & Dipercayai',
    sections:['Perkhidmatan','Zon Penghantaran','Harga','Track'],
    fields: [
      { id:'vehicle_types', label:'Jenis Kenderaan', type:'text', placeholder:'Van, 3-ton lorry, Cold chain truck...' },
      { id:'safety_guarantee', label:'Jaminan Keselamatan', type:'text', placeholder:'Insurans barang, Real-time tracking...' }
    ]
  },

  // ── E-COMMERCE ───────────────────────────────
  ecommerce : { 
    label:'🛒 E-Commerce Umum', icon:'🛒', category:'E-Commerce', tone:'Moden & Mesra',
    sections:['Produk','Kategori','Cara Beli','FAQ'],
    fields: [
      { id:'product_niche', label:'Niche Produk', type:'text', placeholder:'Gadget, Home decor, Pet supplies...' },
      { id:'payment_gateways', label:'Sistem Bayaran', type:'text', placeholder:'FPX, Credit Card, ShopeePay, GrabPay...' }
    ]
  },

  // ── DIGITAL CARDS ─────────────────────────────
  weddingCard : { 
    label:'💍 Kad Kahwin Digital', icon:'💍', category:'Kad Digital', tone:'Romantik & Elegan',
    sections:['Mempelai','Aturcara','Peta Lokasi','RSVP','Galeri Gambar','Ucapan'],
    fields: [
      { id:'bride_groom', label:'Nama Pengantin', type:'text', placeholder:'Ali & Fatimah...' },
      { id:'wedding_date', label:'Tarikh Majlis', type:'date', placeholder:'' },
      { id:'theme', label:'Tema Warna/Majlis', type:'text', placeholder:'Pastel, Garden, Songket...' }
    ]
  },
  businessCard : { 
    label:'📇 Kad Bisnes Digital', icon:'📇', category:'Kad Digital', tone:'Profesional & Moden',
    sections:['Profil','Hubungi','Social Media','vCard','Portfolio'],
    fields: [
      { id:'job_title', label:'Jawatan/Role', type:'text', placeholder:'CEO & Founder, Senior Consultant...' },
      { id:'vcard_perk', label:'Kelebihan vCard', type:'text', placeholder:'Simpan terus ke fon dalam satu klik...' }
    ]
  }
,
  // ── MAKANAN & MINUMAN (F&B) TAMBAHAN ──────────────────────────
  frozenFood : { 
    label:'❄️ Makanan Sejuk Beku', icon:'❄️', category:'Makanan', tone:'Meyakinkan & Praktikal',
    sections:['Katalog Produk','Cara Penyediaan','Harga Borong','Testimoni'],
    fields: [
      { id:'frozen_type', label:'Jenis Produk', type:'text', placeholder:'Karipap pusing, daging perap, kambing perap...' }
    ]
  },
  bubbleTea : { 
    label:'🧋 Bubble Tea / Jus', icon:'🧋', category:'Makanan', tone:'Ceria & Trendy',
    sections:['Menu Minuman','Topping Pilihan','Promosi','Lokasi Kedai'],
    fields: [
      { id:'best_seller', label:'Minuman Terlaris', type:'text', placeholder:'Brown Sugar Boba, Mango Smoothie...' }
    ]
  },
  snacks : { 
    label:'🥔 Kerepek & Snek', icon:'🥔', category:'Makanan', tone:'Santai & Tradisional',
    sections:['Senarai Produk','Pakej Ejen/Dropship','Testimoni Rasa','Beli Online'],
    fields: [
      { id:'snack_type', label:'Jenis Snek', type:'text', placeholder:'Kerepek pisang, ubi pedas, rempeyek...' }
    ]
  },
  rawFoodSupplier : { 
    label:'🥩 Pembekal Bahan Mentah', icon:'🥩', category:'Makanan', tone:'Profesional & Borong',
    sections:['Senarai Bahan','Harga Borong','Kawasan Penghantaran','Hubungi Kami'],
    fields: [
      { id:'raw_material', label:'Bahan Mentah', type:'text', placeholder:'Daging segar, ayam borong, sayur organik...' }
    ]
  },
  foodDelivery : { 
    label:'🍱 Penghantaran Makanan (Home-cooked)', icon:'🍱', category:'Makanan', tone:'Mesra & Sihat',
    sections:['Menu Mingguan','Pakej Langganan','Testimoni','Tempah Sekarang'],
    fields: [
      { id:'delivery_area', label:'Kawasan Penghantaran', type:'text', placeholder:'Lembah Klang, Shah Alam...' }
    ]
  },

  // ── PERUNCITAN & PEMBORONGAN ──────────────────────────
  miniMarket : { 
    label:'🏪 Kedai Runcit / Mini Market', icon:'🏪', category:'Peruncitan', tone:'Mudah & Mesra',
    sections:['Barangan Runcit','Promosi Mingguan','Waktu Operasi','Lokasi'],
    fields: [
      { id:'market_specialty', label:'Fokus Jualan', type:'text', placeholder:'Barangan basah, keperluan harian, borong...' }
    ]
  },
  phoneAccessories : { 
    label:'📱 Aksesori Telefon', icon:'📱', category:'Peruncitan', tone:'Moden & Trendy',
    sections:['Katalog Gajet','Promosi','Testimoni','Beli Online'],
    fields: [
      { id:'gadget_focus', label:'Fokus Gajet', type:'text', placeholder:'Casing, Powerbank, Screen Protector...' }
    ]
  },
  hardwareStore : { 
    label:'🛠️ Kedai Perkakasan (Hardware)', icon:'🛠️', category:'Peruncitan', tone:'Dipercayai & Lengkap',
    sections:['Katalog Barang','Perkhidmatan Bancuh Cat','Sebut Harga Borong','Lokasi'],
    fields: [
      { id:'hardware_brands', label:'Jenama Utama', type:'text', placeholder:'Nippon Paint, Bosch, Makita...' }
    ]
  },
  stationery : { 
    label:'✏️ Alat Tulis & Buku', icon:'✏️', category:'Peruncitan', tone:'Ceria & Praktikal',
    sections:['Katalog Alat Tulis','Perkhidmatan Fotostat','Promosi Back-to-School','Lokasi'],
    fields: [
      { id:'stationery_type', label:'Fokus Kedai', type:'text', placeholder:'Buku rujukan, alat tulis pejabat, cetakan...' }
    ]
  },
  jewelryStore : { 
    label:'💍 Kedai Emas & Barangan Kemas', icon:'💍', category:'Peruncitan', tone:'Mewah & Elegan',
    sections:['Koleksi Terkini','Harga Emas Semasa','Trade-in Emas','Lokasi'],
    fields: [
      { id:'gold_type', label:'Jenis Emas', type:'text', placeholder:'Emas 916, Emas 999, Berlian...' }
    ]
  },
  sportsStore : { 
    label:'⚽ Barangan Sukan', icon:'⚽', category:'Peruncitan', tone:'Aktif & Energetik',
    sections:['Katalog Peralatan','Jersi & Pakaian','Promosi','Lokasi'],
    fields: [
      { id:'sports_focus', label:'Sukan Fokus', type:'text', placeholder:'Bola sepak, badminton, basikal...' }
    ]
  },
  cosmeticsStore : { 
    label:'💄 Kedai Kosmetik & Jamu', icon:'💄', category:'Peruncitan', tone:'Kecantikan & Pesona',
    sections:['Katalog Produk','Testimoni','Cara Penggunaan','Beli Online'],
    fields: [
      { id:'cosmetics_brand', label:'Jenama Dijual', type:'text', placeholder:'Jenama tempatan, jamu tradisional, makeup...' }
    ]
  },
  petStore : { 
    label:'🐾 Kedai Haiwan Peliharaan', icon:'🐾', category:'Peruncitan', tone:'Mesra & Comel',
    sections:['Katalog Makanan & Aksesori','Servis Grooming','Haiwan Jualan','Lokasi'],
    fields: [
      { id:'pet_focus', label:'Fokus Haiwan', type:'text', placeholder:'Kucing, Anjing, Ikan hiasan...' }
    ]
  },
  florist : { 
    label:'💐 Kedai Bunga (Florist)', icon:'💐', category:'Peruncitan', tone:'Indah & Romantik',
    sections:['Katalog Jambangan','Gubahan Khas','Kawasan Penghantaran','Tempah Sekarang'],
    fields: [
      { id:'flower_events', label:'Acara Fokus', type:'text', placeholder:'Hari Jadi, Konvokesyen, Perkahwinan...' }
    ]
  },
  plasticSupplier : { 
    label:'📦 Pemborong Plastik & Pembungkusan', icon:'📦', category:'Peruncitan', tone:'Profesional & Borong',
    sections:['Katalog Pembungkusan','Harga Borong','Custom Printing','Hubungi Kami'],
    fields: [
      { id:'packaging_type', label:'Jenis Pembungkusan', type:'text', placeholder:'Bekas makanan, paper bag, custom kotak...' }
    ]
  },

  // ── PERKHIDMATAN PROFESIONAL & PENJAGAAN DIRI ──────────
  pharmacy : { 
    label:'💊 Farmasi Runcit', icon:'💊', category:'Kesihatan', tone:'Profesional & Meyakinkan',
    sections:['Katalog Ubat & Suplemen','Nasihat Farmasis','Semakan Kesihatan','Lokasi'],
    fields: [
      { id:'pharmacy_services', label:'Perkhidmatan Tambahan', type:'text', placeholder:'Cek tekanan darah, cek gula, konsultasi ubat...' }
    ]
  },
  confinementCentre : { 
    label:'🤱 Pusat Jagaan Berpantang', icon:'🤱', category:'Kesihatan', tone:'Tenang & Selesa',
    sections:['Pakej Berpantang','Kemudahan Bilik','Menu Makanan Sihat','Testimoni'],
    fields: [
      { id:'confinement_days', label:'Pilihan Pakej', type:'text', placeholder:'Pakej 14 hari, 28 hari, 44 hari...' }
    ]
  },
  optometrist : { 
    label:'👓 Optometris (Cermin Mata)', icon:'👓', category:'Kesihatan', tone:'Jelas & Profesional',
    sections:['Koleksi Bingkai','Pemeriksaan Mata','Kanta Lekap','Promosi'],
    fields: [
      { id:'glasses_brands', label:'Jenama Bingkai', type:'text', placeholder:'Ray-Ban, Oakley, jenama mampu milik...' }
    ]
  },
  physiotherapy : { 
    label:'💆‍♂️ Pusat Fisioterapi', icon:'💆‍♂️', category:'Kesihatan', tone:'Pemulihan & Profesional',
    sections:['Jenis Rawatan','Fisioterapis Bertauliah','Testimoni Pesakit','Tempah Sesi'],
    fields: [
      { id:'physio_focus', label:'Fokus Rawatan', type:'text', placeholder:'Kecederaan sukan, strok, sakit belakang...' }
    ]
  },

  // ── PENDIDIKAN & LATIHAN ──────────────────────────
  drivingSchool : { 
    label:'🚗 Kelas Memandu', icon:'🚗', category:'Pendidikan', tone:'Selamat & Mesra',
    sections:['Pakej Lesen Memandu','Jadual Kelas','Kadar Bayaran','Daftar Sekarang'],
    fields: [
      { id:'license_class', label:'Kelas Lesen', type:'text', placeholder:'Lesen D (Manual), DA (Auto), B2 (Motor)...' }
    ]
  },
  tvet : { 
    label:'🛠️ Pusat Latihan Kemahiran (TVET)', icon:'🛠️', category:'Pendidikan', tone:'Praktikal & Profesional',
    sections:['Senarai Kursus','Peluang Kerjaya','Syarat Kelayakan','Daftar Sekarang'],
    fields: [
      { id:'tvet_course', label:'Kursus Ditawarkan', type:'text', placeholder:'Kimpalan, Elektrikal, Jahitan, Masakan...' }
    ]
  },
  musicArtClass : { 
    label:'🎵 Kelas Muzik / Seni', icon:'🎵', category:'Pendidikan', tone:'Kreatif & Menginspirasikan',
    sections:['Program Kelas','Profil Tenaga Pengajar','Galeri Persembahan','Daftar Kelas'],
    fields: [
      { id:'art_type', label:'Jenis Kelas', type:'text', placeholder:'Piano, Gitar, Vokal, Lukisan...' }
    ]
  },
  languageCenter : { 
    label:'🗣️ Pusat Bahasa Asing', icon:'🗣️', category:'Pendidikan', tone:'Global & Interaktif',
    sections:['Pilihan Bahasa','Pakej Pembelajaran','Jadual Kelas','Daftar Sekarang'],
    fields: [
      { id:'language_focus', label:'Bahasa Ditawarkan', type:'text', placeholder:'Bahasa Inggeris, Mandarin, Jepun, Arab...' }
    ]
  },
  corporateTrainer : { 
    label:'🎤 Pakar Motivasi & Latihan', icon:'🎤', category:'Pendidikan', tone:'Motivasi & Energetik',
    sections:['Modul Latihan','Profil Penceramah','Klien Korporat','Tempah Sesi'],
    fields: [
      { id:'training_topic', label:'Topik Latihan', type:'text', placeholder:'Team building, Kepimpinan, Sales...' }
    ]
  },

  // ── PEMBAIKAN, PENYELENGGARAAN & KEBERSIHAN ──────────
  carWash : { 
    label:'🧽 Pusat Basuh Kereta (Car Wash)', icon:'🧽', category:'Penyelenggaraan', tone:'Bersih & Berkilat',
    sections:['Pakej Cucian','Perkhidmatan Detailing','Harga','Lokasi'],
    fields: [
      { id:'wash_services', label:'Servis Ditawarkan', type:'text', placeholder:'Cuci biasa, Polish, Wax, Ceramic Coating...' }
    ]
  },
  aircondService : { 
    label:'❄️ Servis Aircond', icon:'❄️', category:'Penyelenggaraan', tone:'Pantas & Sejuk',
    sections:['Jenis Servis','Senarai Harga','Kawasan Liputan','Tempah Servis'],
    fields: [
      { id:'aircond_type', label:'Jenis Penghawa Dingin', type:'text', placeholder:'Wall mounted, Cassette, Inverter...' }
    ]
  },
  plumbing : { 
    label:'🚰 Perkhidmatan Paip (Plumbing)', icon:'🚰', category:'Penyelenggaraan', tone:'Dipercayai & Efisyen',
    sections:['Senarai Perkhidmatan','Harga Anggaran','Kawasan Liputan','Hubungi Segera'],
    fields: [
      { id:'plumbing_issue', label:'Masalah Biasa', type:'text', placeholder:'Paip bocor, sinki tersumbat, tangki air...' }
    ]
  },
  wiring : { 
    label:'⚡ Perkhidmatan Pendawaian (Wiring)', icon:'⚡', category:'Penyelenggaraan', tone:'Selamat & Cekap',
    sections:['Jenis Pendawaian','Keselamatan','Sebut Harga','Kawasan Liputan'],
    fields: [
      { id:'wiring_type', label:'Jenis Kerja Elektrik', type:'text', placeholder:'Pasang lampu, kipas, tambah plug point...' }
    ]
  },
  techRepair : { 
    label:'📱 Kedai Pembaikan Telefon/Komputer', icon:'📱', category:'Penyelenggaraan', tone:'Pakar & Pantas',
    sections:['Senarai Pembaikan','Anggaran Kos','Jaminan (Warranty)','Lokasi'],
    fields: [
      { id:'repair_specialty', label:'Kepakaran', type:'text', placeholder:'Tukar skrin, bateri, format laptop, data recovery...' }
    ]
  },
  cleaningService : { 
    label:'🧹 Pembersihan Rumah/Pejabat', icon:'🧹', category:'Penyelenggaraan', tone:'Bersih & Teliti',
    sections:['Pakej Pembersihan','Kawasan Liputan','Testimoni','Tempah Slot'],
    fields: [
      { id:'cleaning_type', label:'Jenis Cucian', type:'text', placeholder:'Cucian harian, deep cleaning, post-renovation...' }
    ]
  },
  laundry : { 
    label:'🧺 Kedai Dobi', icon:'🧺', category:'Penyelenggaraan', tone:'Wangi & Bersih',
    sections:['Perkhidmatan Dobi','Senarai Harga','Waktu Operasi','Lokasi'],
    fields: [
      { id:'laundry_type', label:'Jenis Dobi', type:'text', placeholder:'Layan diri 24 jam, dry cleaning, gosok baju...' }
    ]
  },
  landscaping : { 
    label:'🌱 Pemotongan Rumput & Landskap', icon:'🌱', category:'Penyelenggaraan', tone:'Hijau & Kemas',
    sections:['Perkhidmatan Penjagaan Laman','Galeri Hasil Kerja','Sebut Harga','Hubungi'],
    fields: [
      { id:'landscape_service', label:'Jenis Servis', type:'text', placeholder:'Potong rumput, tebang pokok, tanam bunga...' }
    ]
  },
  pestControl : { 
    label:'🐜 Kawalan Serangga (Pest Control)', icon:'🐜', category:'Penyelenggaraan', tone:'Berkesan & Selamat',
    sections:['Jenis Kawalan','Proses Rawatan','Jaminan','Sebut Harga'],
    fields: [
      { id:'pest_target', label:'Serangga Sasaran', type:'text', placeholder:'Anai-anai, tikus, nyamuk, lipas...' }
    ]
  },
  tailor : { 
    label:'✂️ Tukang Jahit (Tailor)', icon:'✂️', category:'Penyelenggaraan', tone:'Kemas & Berkualiti',
    sections:['Jenis Jahitan','Galeri Pakaian','Senarai Harga','Tempah Ukuran'],
    fields: [
      { id:'tailor_specialty', label:'Kepakaran Jahitan', type:'text', placeholder:'Baju kurung, suit lelaki, alteration...' }
    ]
  },
  cobbler : { 
    label:'👞 Tukang Kasut / Shoe Spa', icon:'👞', category:'Penyelenggaraan', tone:'Teliti & Rapi',
    sections:['Perkhidmatan Pembaikan','Pakej Cucian Kasut','Galeri Sebelum/Selepas','Lokasi'],
    fields: [
      { id:'shoe_services', label:'Servis Ditawarkan', type:'text', placeholder:'Tukar tapak, jahit kasut, deep cleaning...' }
    ]
  },

  // ── HARTANAH, PEMBINAAN & UBAH SUAI ──────────────────
  cabinetMaker : { 
    label:'🗄️ Pembuatan Kabinet Dapur', icon:'🗄️', category:'Hartanah', tone:'Moden & Praktikal',
    sections:['Koleksi Rekaan','Material Digunakan','Testimoni','Tempah Ukuran Percuma'],
    fields: [
      { id:'cabinet_material', label:'Material Utama', type:'text', placeholder:'Melamine, Plywood, Aluminium, Quartz stone...' }
    ]
  },
  interiorDesign : { 
    label:'🛋️ Hiasan Dalaman (Interior Design)', icon:'🛋️', category:'Hartanah', tone:'Eksklusif & Estetik',
    sections:['Portfolio Rekaan','Proses Konsultasi','Pakej ID','Hubungi Kami'],
    fields: [
      { id:'id_style', label:'Gaya Rekaan', type:'text', placeholder:'Modern Luxury, Muji, Minimalist, Scandinavian...' }
    ]
  },
  grillAwning : { 
    label:'🚪 Pemasangan Jeriji Besi & Awning', icon:'🚪', category:'Hartanah', tone:'Kukuh & Selamat',
    sections:['Galeri Pemasangan','Pilihan Material','Testimoni','Sebut Harga Percuma'],
    fields: [
      { id:'grill_material', label:'Material Besi', type:'text', placeholder:'Mild steel, Wrought iron, Polycarbonate awning...' }
    ]
  },
  propertyManagement : { 
    label:'🏢 Pengurusan Hartanah', icon:'🏢', category:'Hartanah', tone:'Profesional & Sistematik',
    sections:['Skop Pengurusan','Kelebihan Tuan Rumah','Senarai Hartanah Diurus','Hubungi'],
    fields: [
      { id:'management_scope', label:'Skop Kerja', type:'text', placeholder:'Kutipan sewa, penyelenggaraan kerosakan, pembersihan...' }
    ]
  },

  // ── PENGANGKUTAN & LOGISTIK ──────────────────────────
  ehailing : { 
    label:'🚖 Pemandu E-hailing / Teksi', icon:'🚖', category:'Logistik', tone:'Selamat & Selesa',
    sections:['Kawasan Liputan','Jenis Kenderaan','Cara Tempahan','Hubungi'],
    fields: [
      { id:'ehailing_area', label:'Kawasan Liputan', type:'text', placeholder:'Lembah Klang, KLIA Transfer, Antara Negeri...' }
    ]
  },
  runner : { 
    label:'🛵 Penghantaran / Runner', icon:'🛵', category:'Logistik', tone:'Pantas & Amanah',
    sections:['Jenis Tugasan','Kadar Upah','Kawasan Liputan','Tempah Runner'],
    fields: [
      { id:'runner_task', label:'Tugasan Biasa', type:'text', placeholder:'Hantar dokumen, beli barang dapur, surprise delivery...' }
    ]
  },
  movers : { 
    label:'📦 Sewa Lori / Pindah Rumah (Movers)', icon:'📦', category:'Logistik', tone:'Kuat & Berhati-hati',
    sections:['Pakej Pindah Rumah','Saiz Lori','Testimoni Pelanggan','Dapatkan Sebut Harga'],
    fields: [
      { id:'mover_services', label:'Pakej Tambahan', type:'text', placeholder:'Tukang angkat (manpower), wrapping barang, buka/pasang perabot...' }
    ]
  },
  busRental : { 
    label:'🚌 Bas Sewa Khas', icon:'🚌', category:'Logistik', tone:'Selesa & Selamat',
    sections:['Galeri Bas','Pakej Percutian','Kapasiti Penumpang','Tempah Sekarang'],
    fields: [
      { id:'bus_type', label:'Jenis Bas', type:'text', placeholder:'Bas persiaran 40 penumpang, VIP 30 seat, Mini bas...' }
    ]
  },

  // ── TEKNOLOGI & DIGITAL KREATIF ──────────────────────
  digitalMarketing : { 
    label:'📈 Agensi Pemasaran Digital', icon:'📈', category:'Teknologi', tone:'Dinamik & Berkesan',
    sections:['Perkhidmatan Pemasaran','Kajian Kes (Case Study)','Pakej Iklan','Konsultasi Percuma'],
    fields: [
      { id:'marketing_channel', label:'Platform Fokus', type:'text', placeholder:'Facebook Ads, Google SEO, TikTok Ads...' }
    ]
  },
  socialMediaManagement : { 
    label:'📱 Pengurusan Media Sosial', icon:'📱', category:'Teknologi', tone:'Kreatif & Trendy',
    sections:['Pakej Pengurusan','Portfolio Kandungan','Pencapaian (Engagement)','Hubungi'],
    fields: [
      { id:'social_platform', label:'Platform Diuruskan', type:'text', placeholder:'Instagram, TikTok, Facebook Page...' }
    ]
  },
  contentCreator : { 
    label:'🎬 Pencipta Kandungan / Youtuber', icon:'🎬', category:'Teknologi', tone:'Personal & Unik',
    sections:['Koleksi Video','Kerjasama Jenama (Sponsorship)','Statistik Tontonan','Hubungi Untuk Kolaborasi'],
    fields: [
      { id:'content_niche', label:'Niche Kandungan', type:'text', placeholder:'Gaming, Review Makanan, Travel Vlog...' }
    ]
  },
  graphicDesign : { 
    label:'🎨 Perkhidmatan Reka Bentuk Grafik', icon:'🎨', category:'Teknologi', tone:'Artistik & Profesional',
    sections:['Portfolio Reka Bentuk','Senarai Servis','Pakej Harga','Tempah Design'],
    fields: [
      { id:'design_services', label:'Jenis Reka Bentuk', type:'text', placeholder:'Logo, Poster, Pembungkusan, Branding...' }
    ]
  },
  copywriting : { 
    label:'✍️ Terjemahan & Copywriting', icon:'✍️', category:'Teknologi', tone:'Meyakinkan & Tepat',
    sections:['Servis Penulisan','Sampel Hasil Kerja','Pakej Harga','Hubungi Kami'],
    fields: [
      { id:'writing_type', label:'Jenis Penulisan', type:'text', placeholder:'Ayat jualan (Sales copy), Terjemahan dokumen, Skrip video...' }
    ]
  },
  webHosting : { 
    label:'☁️ Penyedia Pengehosan Web (Hosting)', icon:'☁️', category:'Teknologi', tone:'Pantas & Stabil',
    sections:['Pakej Hosting','Ciri-ciri Server','Sokongan Teknikal','Beli Sekarang'],
    fields: [
      { id:'hosting_features', label:'Kelebihan Hosting', type:'text', placeholder:'99.9% Uptime, Free SSL, Daily Backup...' }
    ]
  },

  // ── PENGELUARAN & PEMBUATAN BERSKALA SEDERHANA ───────
  clothingFactory : { 
    label:'👕 Kilang Pakaian (Jahit Pukal)', icon:'👕', category:'Pengeluaran', tone:'Berkapasiti & Berkualiti',
    sections:['Pilihan Kain','Kuantiti Minimum (MOQ)','Galeri Jahitan','Minta Sebut Harga'],
    fields: [
      { id:'clothing_type', label:'Jenis Pakaian', type:'text', placeholder:'T-shirt, Tudung, Baju Korporat, Uniform...' }
    ]
  },
  oemCosmetics : { 
    label:'🧪 Pengeluar Kosmetik OEM', icon:'🧪', category:'Pengeluaran', tone:'Saintifik & Dipercayai',
    sections:['Proses R&D','Pensijilan (GMP/Halal)','Katalog Produk','Konsultasi Founder'],
    fields: [
      { id:'oem_products', label:'Produk Dihasilkan', type:'text', placeholder:'Serum, Pencuci muka, Lipmatte, Suplemen...' }
    ]
  },
  handicrafts : { 
    label:'🧺 Kraf Tangan & Cenderamata', icon:'🧺', category:'Pengeluaran', tone:'Tradisional & Berseni',
    sections:['Katalog Kraf','Tempahan Korporat','Cerita Pembuatan','Beli Online'],
    fields: [
      { id:'craft_type', label:'Jenis Kraf Tangan', type:'text', placeholder:'Batik, Produk Rotan, Ukiran Kayu...' }
    ]
  },
  printing : { 
    label:'🖨️ Percetakan (Printing)', icon:'🖨️', category:'Pengeluaran', tone:'Pantas & Jelas',
    sections:['Katalog Cetakan','Mesin & Teknologi','Harga Borong','Hantar Artwork'],
    fields: [
      { id:'print_services', label:'Jenis Cetakan', type:'text', placeholder:'Banner, Stiker label, Baju korporat, Pamplet...' }
    ]
  },
  furnitureMaker : { 
    label:'🪑 Pembuatan Perabot', icon:'🪑', category:'Pengeluaran', tone:'Kukuh & Elegan',
    sections:['Koleksi Perabot','Tempahan Khas (Custom)','Material Kayu','Hubungi'],
    fields: [
      { id:'furniture_style', label:'Jenis Perabot', type:'text', placeholder:'Perabot kayu solid, palet, besi industri...' }
    ]
  },
  buildingMaterials : { 
    label:'🧱 Pengeluaran Bahan Binaan', icon:'🧱', category:'Pengeluaran', tone:'Kukuh & Skala Besar',
    sections:['Katalog Bahan Binaan','Kapasiti Pengeluaran','Pensijilan','Hubungi Sales'],
    fields: [
      { id:'material_type', label:'Bahan Dihasilkan', type:'text', placeholder:'Batu bata, simen komersial, bumbung...' }
    ]
  },

  // ── AGRIKULTUR, PENTERNAKAN & ASAS TANI ──────────────
  urbanFarming : { 
    label:'🥬 Pertanian Bandar / Hidroponik', icon:'🥬', category:'Pertanian', tone:'Moden & Hijau',
    sections:['Hasil Tanaman','Sistem Hidroponik Dijual','Lawatan Kebun','Beli Sayur'],
    fields: [
      { id:'urban_crops', label:'Tanaman Utama', type:'text', placeholder:'Salad, Bayam brazil, Daun pudina...' }
    ]
  },
  livestock : { 
    label:'🐄 Penternakan Ruminan', icon:'🐄', category:'Pertanian', tone:'Sihat & Berkualiti',
    sections:['Ternakan Jualan','Pakej Aqiqah/Qurban','Susu Segar','Hubungi Ladang'],
    fields: [
      { id:'livestock_type', label:'Jenis Ternakan', type:'text', placeholder:'Lembu Brahman, Kambing Boer, Susu kambing segar...' }
    ]
  },
  poultry : { 
    label:'🐔 Penternakan Unggas', icon:'🐔', category:'Pertanian', tone:'Segar & Selamat',
    sections:['Ayam & Telur Jualan','Harga Borong','Sijil Halal/Kesihatan','Hubungi Kami'],
    fields: [
      { id:'poultry_type', label:'Fokus Penternakan', type:'text', placeholder:'Ayam kampung, ayam pedaging, telur omega...' }
    ]
  },
  aquaculture : { 
    label:'🐟 Akuakultur (Ternakan Ikan)', icon:'🐟', category:'Pertanian', tone:'Segar & Semula Jadi',
    sections:['Hasil Ikan/Udang','Kaedah Ternakan','Harga Borong','Lokasi Kolam'],
    fields: [
      { id:'aqua_type', label:'Jenis Ternakan', type:'text', placeholder:'Ikan keli, Talapia merah, Udang harimau...' }
    ]
  },
  plantNursery : { 
    label:'🪴 Taska Pokok (Nursery)', icon:'🪴', category:'Pertanian', tone:'Hijau & Menyegarkan',
    sections:['Katalog Pokok','Baja & Tanah','Aksesori Berkebun','Lokasi Taska'],
    fields: [
      { id:'plant_type', label:'Jenis Tanaman', type:'text', placeholder:'Anak pokok buah, pokok hiasan dalaman, orkid...' }
    ]
  },
  fertilizerSupplier : { 
    label:'🧪 Penjualan Baja & Racun', icon:'🧪', category:'Pertanian', tone:'Berkesan & Lulus KKM/DOA',
    sections:['Katalog Baja','Panduan Penggunaan','Testimoni Kebun','Beli Online'],
    fields: [
      { id:'fertilizer_type', label:'Jenis Bekalan', type:'text', placeholder:'Baja organik, racun serangga, vitamin pokok...' }
    ]
  },

  // ── ACARA, HIBURAN & PELANCONGAN ─────────────────────
  weddingPlanner : { 
    label:'💒 Perancang Perkahwinan', icon:'💒', category:'Acara', tone:'Mewah & Sempurna',
    sections:['Pakej Perkahwinan','Galeri Pelamin & Dewan','Servis Penyelarasan','Tempah Tarikh'],
    fields: [
      { id:'planner_services', label:'Skop Perkhidmatan', type:'text', placeholder:'Dewan, pelamin, katering, baju, jurugambar...' }
    ]
  },
  canopyRental : { 
    label:'⛺ Penyewaan Kanopi', icon:'⛺', category:'Acara', tone:'Kemas & Selesa',
    sections:['Jenis Kanopi','Pakej Sewaan','Aksesori (Kerusi/Meja/Kipas)','Sebut Harga'],
    fields: [
      { id:'canopy_type', label:'Jenis Khemah', type:'text', placeholder:'Kanopi Arabian, Marquee tent, Transparent...' }
    ]
  },
  tourGuide : { 
    label:'🗺️ Pemandu Pelancong Berlesen', icon:'🗺️', category:'Pelancongan', tone:'Berpengetahuan & Mesra',
    sections:['Pakej Lawatan','Profil Pemandu Pelancong','Testimoni Pelancong','Tempah Sesi'],
    fields: [
      { id:'tour_focus', label:'Kawasan/Kepakaran', type:'text', placeholder:'Sejarah Melaka, Alam Semula Jadi, Food Tour...' }
    ]
  },
  paSystem : { 
    label:'🔊 Sistem Audio & Pencahayaan', icon:'🔊', category:'Acara', tone:'Jelas & Meriah',
    sections:['Pakej PA System','Lampu Pentas','Senarai Peralatan','Tempah Sekarang'],
    fields: [
      { id:'pa_equipment', label:'Peralatan Disediakan', type:'text', placeholder:'Speaker aktif, wireless mic, stage lighting...' }
    ]
  },
  eventEntertainer : { 
    label:'🤡 Penghibur Acara', icon:'🤡', category:'Acara', tone:'Ceria & Menghiburkan',
    sections:['Profil Penghibur','Galeri Persembahan','Pakej Acara','Tempah Sekarang'],
    fields: [
      { id:'entertainer_type', label:'Jenis Persembahan', type:'text', placeholder:'Badut, Live Band, MC Majlis, Silap mata...' }
    ]
  },

  // ── PERKHIDMATAN KORPORAT & PERNIAGAAN ────────────────
  companySecretary : { 
    label:'📝 Setiausaha Syarikat (CoSec)', icon:'📝', category:'Profesional', tone:'Formal & Cekap',
    sections:['Pakej Penubuhan Syarikat','Pematuhan SSM','Sokongan Korporat','Hubungi Kami'],
    fields: [
      { id:'cosec_services', label:'Servis Ditawarkan', type:'text', placeholder:'Daftar Sdn Bhd, Resolusi Syarikat, Penyata Tahunan...' }
    ]
  },
  taxConsultant : { 
    label:'📉 Perkhidmatan Percukaian', icon:'📉', category:'Profesional', tone:'Bertauliah & Tepat',
    sections:['Servis Cukai Koporat/Individu','Perancangan Cukai','Penyelesaian Kes LHDN','Konsultasi'],
    fields: [
      { id:'tax_services', label:'Fokus Cukai', type:'text', placeholder:'Cukai Syarikat (C), Individu (B/BE), Audit LHDN...' }
    ]
  },
  recruitmentAgency : { 
    label:'🤝 Agensi Pekerjaan', icon:'🤝', category:'Profesional', tone:'Cekap & Dipercayai',
    sections:['Carian Bakat (Headhunting)','Pekerja Asing','Profil Agensi','Hubungi'],
    fields: [
      { id:'recruitment_focus', label:'Fokus Pekerja', type:'text', placeholder:'Pekerja profesional, buruh binaan, pembantu rumah...' }
    ]
  },
  businessConsultant : { 
    label:'📊 Perundingan Pengurusan', icon:'📊', category:'Profesional', tone:'Pakar & Strategik',
    sections:['Servis Konsultasi','Kajian Kes Kejayaan','Profil Perunding','Tempah Sesi'],
    fields: [
      { id:'consulting_area', label:'Bidang Kepakaran', type:'text', placeholder:'Penstrukturan semula, SOP perniagaan, HR setup...' }
    ]
  },
  moneyLender : { 
    label:'💰 Pembiayaan & Kredit', icon:'💰', category:'Profesional', tone:'Telus & Sah',
    sections:['Jenis Pinjaman','Syarat Kelayakan','Kalkulator Pinjaman','Mohon Sekarang'],
    fields: [
      { id:'loan_type', label:'Fokus Pinjaman', type:'text', placeholder:'Pinjaman peribadi, Pembiayaan PKS (SME), Refinance...' }
    ]
  },
  recyclingCenter : { 
    label:'♻️ Pusat Kitar Semula', icon:'♻️', category:'Profesional', tone:'Hijau & Tanggungjawab',
    sections:['Bahan Diterima','Harga Belian Semasa','Perkhidmatan Trak Ambil','Lokasi Pusat'],
    fields: [
      { id:'recycle_materials', label:'Bahan Utama', type:'text', placeholder:'Besi buruk, kertas, plastik, e-waste...' }
    ]
  }

};

// ───────────────────────────────────────────────────
// MAIN GENERATOR FUNCTION
// ───────────────────────────────────────────────────
function generatePrompt(formData, businessType) {
  const tpl = BUSINESS_TEMPLATES[businessType] || {};
  const lang = formData.language || 'ms'; // Default to Malay

  const langMap = {
    ms: { header: 'Cipta landing page HTML yang lengkap', info: 'MAKLUMAT PERNIAGAAN', design: 'REKA BENTUK & GAYA', features: 'CIRI KHUSUS', tech: 'KEPERLUAN TEKNIKAL', output: 'FORMAT OUTPUT' },
    en: { header: 'Create a complete, responsive HTML landing page', info: 'BUSINESS INFORMATION', design: 'DESIGN & STYLE', features: 'SPECIFIC FEATURES', tech: 'TECHNICAL REQUIREMENTS', output: 'OUTPUT FORMAT' }
  };

  const l = langMap[lang] || langMap.ms;

  const parts = [
    buildHeader(formData, businessType, tpl, l, lang),
    buildInfoSection(formData, tpl, l),
    buildProductSection(formData),
    buildDesignSection(formData, l),
    buildContactSection(formData, l),
    buildFeaturesSection(formData, businessType, tpl, l),
    buildTechnicalSection(tpl, l),
    buildOutputFormat(formData, l, lang)
  ];

  return parts.filter(Boolean).join('\n\n');
}

function buildHeader(d, type, tpl, l, lang) {
  return `${l.header} untuk ${d.businessName || 'perniagaan ini'}.
  
Bahasa Kandungan: Sila gunakan ${lang === 'en' ? 'English' : 'Bahasa Malaysia'} sepenuhnya untuk semua teks di dalam website.

Ini adalah website ${tpl.label || type} yang memerlukan rekabentuk profesional, kod yang bersih, dan pengalaman pengguna yang luar biasa. Hasilkan KOD HTML PENUH yang boleh terus digunakan.`;
}

function buildInfoSection(d, tpl) {
  const lines = [
    `═══════════════════════════════════════════════════════`,
    `MAKLUMAT PERNIAGAAN`,
    `═══════════════════════════════════════════════════════`,
    ``,
    `Nama Perniagaan   : ${d.businessName || '-'}`,
    `Jenis Perniagaan  : ${tpl.label || '-'}`,
    d.location ? `Lokasi            : ${d.location}` : ''
  ];

  // Tambah info khusus perniagaan jika ada
  if (tpl.fields) {
    tpl.fields.forEach(f => {
      const val = d[f.id];
      if (val) {
        lines.push(`${f.label.padEnd(18)}: ${val}`);
      }
    });
  }

  lines.push(
    ``,
    `PENERANGAN:`,
    d.description || '(tiada penerangan)',
    ``,
    `KHALAYAK SASARAN:`,
    d.targetAudience || '(umum)',
    ``,
    `KELEBIHAN UNIK (USP):`,
    d.usp || '(tidak dinyatakan)'
  );

  // Tambah Galeri Imej jika ada
  if (d.images && d.images.length > 0) {
    lines.push(
      ``,
      `GALERI IMEJ UNTUK DIGUNAKAN:`,
      ...d.images.map((img, i) => `${i+1}. ${img}`)
    );
  }

  return lines.filter(l => l !== null).join('\n');
}

function buildProductSection(d) {
  if (!d.products || d.products.length === 0) return '';
  
  const lines = [
    `═══════════════════════════════════════════════════════`,
    `KATALOG PRODUK / PERKHIDMATAN`,
    `═══════════════════════════════════════════════════════`,
    `Sila bina grid produk yang menarik dengan butang "Order WhatsApp" untuk setiap produk:`,
    ``
  ];

  d.products.forEach((p, i) => {
    lines.push(`Produk #${i+1}:`);
    lines.push(`- Nama: ${p.name}`);
    lines.push(`- Harga: RM ${p.price || 'Sila tentukan'}`);
    if (p.desc) lines.push(`- Penerangan: ${p.desc}`);
    lines.push(``);
  });

  return lines.join('\n');
}

function buildDesignSection(d) {
  return [
    `═══════════════════════════════════════════════════════`,
    `🎨 REKA BENTUK & GAYA`,
    `═══════════════════════════════════════════════════════`,
    ``,
    `Warna Utama    : ${d.primaryColor || '#1a1a2e'}`,
    `Warna Sekunder : ${d.secondaryColor || '#e94560'}`,
    `Warna Aksen    : ${d.accentColor || '#0f3460'}`,
    `Nada Komunikasi: ${d.tone || 'Profesional & Mesra'}`,
    `Gaya Rekabentuk: ${d.style || 'Moden & Bersih'}`,
    `Call-to-Action : "${d.cta || 'Hubungi Kami Sekarang'}"`,
    ``,
    `Arahan rekabentuk:`,
    `- Gunakan warna utama sebagai warna dominan`,
    `- Tambah gradient yang cantik menggunakan warna yang ditetapkan`,
    `- Animasi halus pada scroll (fade-in, slide-up)`,
    `- Hover effects yang menarik pada semua elemen interaktif`,
    `- Glassmorphism atau card design yang moden`
  ].join('\n');
}

function buildContactSection(d) {
  const c = d.contact || {};
  const lines = [
    `═══════════════════════════════════════════════════════`,
    `📞 MAKLUMAT HUBUNGAN`,
    `═══════════════════════════════════════════════════════`,
    ``
  ];
  if (c.phone)    lines.push(`Telefon  : ${c.phone}`);
  if (c.email)    lines.push(`Email    : ${c.email}`);
  if (c.whatsapp) lines.push(`WhatsApp : ${c.whatsapp} → https://wa.me/${c.whatsapp.replace(/\D/g,'')}`);
  if (c.facebook) lines.push(`Facebook : ${c.facebook}`);
  if (c.instagram)lines.push(`Instagram: ${c.instagram}`);
  if (c.address)  lines.push(`Alamat   : ${c.address}`);
  if (lines.length === 4) lines.push('(maklumat hubungan tidak diisi)');
  return lines.join('\n');
}

function buildFeaturesSection(d, businessType, tpl) {
  const specificMap = {
    restaurant : `- Sertakan menu dengan kategori (Makanan Utama, Minuman, Pencuci Mulut)\n- Galeri makanan dengan hover zoom\n- Sistem tempahan meja (form)\n- Waktu operasi yang jelas\n- Google Maps embed`,
    cafe       : `- Menu minuman dengan harga\n- Section "Work & Study" (wifi, plug point)\n- Galeri suasana kafe\n- Acara khas bulanan`,
    bakery     : `- Katalog kek dan bakeri dengan gambar\n- Form tempahan khas\n- Info penghantaran dan kawasan\n- Testimoni pelanggan`,
    fashion    : `- Grid produk dengan filter kategori\n- Lookbook section\n- Panduan saiz interaktif\n- Butang "Order via WhatsApp"`,
    hijab      : `- Koleksi hijab dengan warna/saiz\n- Video tutorial cara pakai\n- Testimoni foto pelanggan\n- Link kedai Shopee/Lazada`,
    salon      : `- Senarai perkhidmatan dengan harga\n- Galeri before/after\n- Form tempahan temujanji\n- Profil stylist`,
    spa        : `- Senarai rawatan dan durasi\n- Pakej promosi\n- Galeri suasana spa\n- Form tempahan`,
    skincare   : `- Senarai produk dengan bahan aktif\n- Panduan rutin skincare\n- Sebelum & selepas section\n- Testimoni bintang`,
    tuition    : `- Program mengikut umur/tahap\n- Profil guru\n- Jadual kelas\n- Form pendaftaran`,
    onlineCourse:`- Senarai kursus dengan harga\n- Preview kurikulum\n- Profil pengajar\n- Testimoni pelajar\n- FAQ`,
    contractor : `- Senarai perkhidmatan pembinaan\n- Gallery portfolio projek\n- Testimoni klien\n- Form sebutharga percuma`,
    clinic     : `- Paparkan gambar sebelum & selepas (before & after) dengan jelas\n- Profil dan kelayakan doktor yang meyakinkan\n- Form / butang tempahan janji temu yang menonjol\n- Senarai rawatan khusus (cth: braces, rawatan jerawat)`,
    weddingCatering: `- Jadual perbandingan pakej (contoh: Pakej A, B, C)\n- Senarai menu terperinci\n- Galeri gambar cantik untuk dewan/pelamin/makanan\n- Pautan/form untuk semak tarikh kekosongan`,
    renovation : `- Galeri portfolio projek terdahulu yang berkualiti tinggi\n- Senarai kepakaran (pemasangan kabinet, pecah dinding, dsb)\n- Form permohonan lawatan tapak / sebut harga percuma\n- Elemen yang membina kredibiliti syarikat (high-ticket)`,
    travel     : `- Jadual perjalanan (itinerary) hari demi hari yang tersusun\n- Senarai hotel penginapan\n- Struktur harga mengikut jenis bilik (Quad, Triple, Double)\n- Form / butang tempahan kerusi terhad`,
    agriculture: `- Paparkan katalog hasil ladang/ternakan yang segar dan berkualiti\n- Maklumat mengenai teknologi agrotek atau kaedah ternakan yang digunakan\n- Penawaran harga borong / pakej pelaburan / pembelian terus\n- Maklumat jika ladang dibuka untuk lawatan awam (agrotourism)`,
    homestay   : `- Galeri gambar bilik dan kemudahan (kolam renang, ruang tamu, dapur dll)\n- Senarai lengkap kemudahan yang disediakan\n- Jadual harga / kadar sewa\n- Peraturan homestay (House rules)\n- Peta lokasi dan tempat menarik berhampiran\n- Butang tempah sekarang (WhatsApp/form)`,
    rumahSewa  : `- Maklumat spesifikasi rumah (bilik, keluasan, perabot)\n- Galeri gambar keadaan rumah terkini\n- Senarai kemudahan berdekatan (sekolah, kedai, LRT)\n- Maklumat harga sewa dan deposit\n- Terma dan syarat sewaan\n- Butang hubungi pemilik/ejen (WhatsApp)`,
    property   : `- Grid listing hartanah (gambar, harga, lokasi)\n- Kalkulator ansuran\n- Profil ejen\n- WhatsApp terus dengan ejen`,
    workshop   : `- Senarai servis dengan harga anggaran\n- Kereta yang dikhidmati\n- Testimoni pelanggan\n- Lokasi & waktu operasi`,
    ecommerce  : `- Grid produk dengan filter kategori\n- Badge "Terlaris" / "Baru"\n- Butang "Tambah Troli" atau "Order WhatsApp"\n- Section testimoni dengan bintang rating\n- FAQ pembayaran & penghantaran`,
    event      : `- Gallery acara lepas\n- Pakej perkhidmatan dengan harga\n- Senarai klien terdahulu\n- Form tempahan acara`,
    logistics  : `- Zon penghantaran & harga\n- Kalkulator kos penghantaran\n- Form tracking\n- Cara penghantaran`,
    gym        : `- Program latihan\n- Pakej keahlian dengan harga\n- Profil jurulatih\n- Kemudahan gim`,
    itService  : `- Senarai perkhidmatan IT\n- Portfolio projek\n- Teknologi yang digunakan\n- Pakej penyelenggaraan`,
    weddingCard: `- Nama pengantin & latar belakang\n- Countdown timer ke tarikh majlis\n- RSVP form interaktif dengan database (simulasi)\n- Peta Google Maps & butang "Waze/Maps"\n- Galeri gambar carousel\n- Section ucapan (Guestbook)`,
    businessCard: `- Foto profil & bio ringkas\n- Butang "Simpan Kenalan" (vCard simulation)\n- Social media icons yang besar & jelas\n- Portfolio mini atau link-link penting\n- Form hubungi atau WhatsApp`
  };

  const specific = specificMap[businessType] || `- Sertakan bahagian yang sesuai dengan jenis perniagaan ini\n- Pastikan ada section produk/perkhidmatan, galeri, dan hubungi`;
  const sections = (tpl.sections || []).map(s => `  ✦ ${s}`).join('\n');

  let extra = '';
  if (d.extraFeatures && d.extraFeatures.length > 0) {
    extra = `\nCiri-ciri Tambahan yang Diminta:\n` + d.extraFeatures.map(f => {
      return `  ✦ ${f.name}\n    Spesifikasi: ${f.detail}`;
    }).join('\n');
  }

  // Tambah info QR jika ada
  let qrNote = '';
  if (d.qrInfo && d.qrInfo.url) {
    qrNote = `\n\nARAHAN PEMBAYARAN:\n- Sila sertakan bahagian pembayaran menggunakan QR Code (${d.qrInfo.type || 'Pilihan'})\n- URL Gambar QR: ${d.qrInfo.url}`;
  }

  return [
    `═══════════════════════════════════════════════════════`,
    `CIRI KHUSUS JENIS PERNIAGAAN`,
    `═══════════════════════════════════════════════════════`,
    ``,
    `Bahagian yang MESTI ada:`,
    sections,
    ``,
    `Arahan Khusus:`,
    specific,
    extra,
    qrNote
  ].filter(Boolean).join('\n');
}

function buildTechnicalSection(tpl) {
  return [
    `═══════════════════════════════════════════════════════`,
    `⚙️ KEPERLUAN TEKNIKAL`,
    `═══════════════════════════════════════════════════════`,
    ``,
    `1. STRUKTUR HTML:`,
    `   - HTML5 semantik (header, nav, main, section, article, footer)`,
    `   - Meta tags lengkap (charset, viewport, description, og:tags)`,
    `   - Schema.org structured data untuk SEO`,
    ``,
    `2. CSS (dalam tag <style>):`,
    `   - CSS Variables untuk tema warna`,
    `   - Mobile-first responsive design`,
    `   - Breakpoints: 480px, 768px, 1024px, 1280px`,
    `   - CSS Grid & Flexbox`,
    `   - Smooth transitions (0.3s ease)`,
    `   - Scroll animations dengan Intersection Observer API`,
    `   - Hover effects pada semua kad dan butang`,
    ``,
    `3. JAVASCRIPT (dalam tag <script>):`,
    `   - Vanilla JS sahaja (tiada framework)`,
    `   - Hamburger menu untuk mobile`,
    `   - Smooth scroll navigation`,
    `   - Form validation dengan mesej ralat`,
    `   - Sticky navbar`,
    `   - Back-to-top button`,
    `   - WhatsApp click-to-chat integration`,
    `   - Scroll reveal animations`,
    ``,
    `4. ASSETS:`,
    `   - Font dari Google Fonts CDN (Outfit atau Poppins)`,
    `   - Icons dari Font Awesome 6 CDN`,
    `   - Gambar placeholder dari picsum.photos atau unsplash.com`,
    ``,
    `5. KEBOLEHCAPAIAN:`,
    `   - Alt text untuk semua gambar`,
    `   - ARIA labels pada elemen interaktif`,
    `   - Kontras warna yang mencukupi`,
    `   - Tab navigation berfungsi`
  ].join('\n');
}

function buildOutputFormat(d) {
  return [
    `═══════════════════════════════════════════════════════`,
    `FORMAT OUTPUT & ARAHAN PENTING`,
    `═══════════════════════════════════════════════════════`,
    ``,
    `Berikan SATU fail HTML yang LENGKAP dengan:`,
    `1. Semua CSS dalam tag <style> di dalam <head>`,
    `2. Semua JavaScript dalam tag <script> sebelum </body>`,
    `3. TIADA fail luaran kecuali CDN (Google Fonts, Font Awesome)`,
    ``,
    `PENTING — Pastikan:`,
    `- WhatsApp link: https://wa.me/${(d.contact?.whatsapp||'601XXXXXXXX').replace(/\D/g,'')}`,
    `- Semua butang CTA menonjol dan mendorong tindakan`,
    `- Landing page boleh "convert" (ada clear value proposition)`,
    `- Kod LENGKAP, bukan sebahagian atau placeholder`,
    `- Responsif sempurna pada mobile (320px - 428px)`,
    `- Navbar sticky dengan logo dan menu`,
    `- Footer dengan hak cipta dan link penting`,
    ``,
    `Hasilkan kod HTML yang PRODUCTION-READY, indah, dan berfungsi penuh.`
  ].join('\n');
}

// Export template list for UI
function getTemplatesByCategory() {
  const cats = {};
  Object.entries(BUSINESS_TEMPLATES).forEach(([key, val]) => {
    if (!cats[val.category]) cats[val.category] = [];
    cats[val.category].push({ key, ...val });
  });
  return cats;
}
