export type ReferenceFilterId = "all" | "restoran" | "otomasyon" | "kurumsal" | "perakende";

export type ReferenceItem = {
  name: string;
  description: string;
  tags: string[];
  imageLabel: string;
  filter: ReferenceFilterId;
  /** Örn: "Diyarbakır · Bağlar" veya "İstanbul · Çok şubeli" */
  location: string;
  /** Kısa etiketler: POS, QR, Paket, Lisans vb. */
  modules: string[];
  /** Kısa ölçülebilir sonuç cümlesi */
  outcome: string;
};

export const referenceFilters: { id: ReferenceFilterId; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "restoran", label: "Restoran & gastronomi" },
  { id: "otomasyon", label: "Otomasyon & üretim" },
  { id: "kurumsal", label: "Kurumsal & portal" },
  { id: "perakende", label: "Perakende & lojistik" }
];

export const referenceItems: ReferenceItem[] = [
  {
    name: "Boğaziçi Meydan Sofrası",
    location: "İstanbul · 12 şube (Avrupa / Anadolu)",
    modules: ["POS", "QR", "Paket", "Lisans"],
    outcome:
      "Şubeler arası kapanış raporları tek saatte toplanıyor; mutfağa giden yanlış ürün sayısı ilk çeyrekte yaklaşık %40 azaldı.",
    description:
      "On iki şubenin günlük kapanış özetleri, merkezi cihaz bazlı lisans doğrulama ve mutfak–servis hatları tek ekrandan izleniyor. Yoğun saatlerde kesintisiz çalışacak şekilde tasarlanan senkron ve yedek yazıcı yönlendirmesi ile yeni şube roll-out süresi kısaldı.",
    tags: ["restoran", "otomasyon", "çok şubeli"],
    imageLabel: "Restoran zinciri",
    filter: "restoran"
  },
  {
    name: "Güneydoğu Dokuma Tekstil",
    location: "Diyarbakır · Kayapınar OSB",
    modules: ["Panel", "MQTT", "Uyarı", "Arşiv"],
    outcome:
      "Hat duruş bildirimi ortalama 3 dakikaya indi; vardiya defterleri manuel yazılmadan günlük arşive işleniyor.",
    description:
      "Üretim hatlarından gelen durum sinyalleri gerçek zamanlı panele düşüyor; kritik eşik aşımlarında bakım ekibine otomatik uyarı gidiyor. Saha günlükleri tek çizgide tutuluyor ve rapor çıktıları yöneticilere sabah özeti olarak iletiliyor.",
    tags: ["otomasyon", "imalat", "izleme"],
    imageLabel: "Endüstriyel panel",
    filter: "otomasyon"
  },
  {
    name: "Karadeniz Gross Market",
    location: "Trabzon · Ortahisar + depo şubesi",
    modules: ["POS", "Stok", "Lisans", "Barkod"],
    outcome:
      "SKT yaklaşan ürün firesi düştü; haftalık satış‑stok PDF’i tek tıkla muhasebeye çıkıyor, kasada fiyat uyumsuzluğu şikâyeti azaldı.",
    description:
      "Son kullanma tarihine göre stok uyarıları, tedarikçi bazlı giriş–çıkış ve haftalık satış özeti tek ekrandan yönetiliyor. Mevcut kasa donanımıyla çakışmayan kontrollü modül geçişi ile iki haftalık paralel kullanımda kesinti yaşanmadı.",
    tags: ["perakende", "stok", "raporlama"],
    imageLabel: "Perakende",
    filter: "perakende"
  },
  {
    name: "Gazi Caddesi Bistro & Paket",
    location: "Diyarbakır · Bağlar",
    modules: ["POS", "QR", "Paket", "Lisans"],
    outcome:
      "Paket yoğunluğunda sipariş defteri karmaşası azaldı; mutfak ve bar yazıcı yönlendirmesi ayrılınca hazırlık süresi kısaldı, iptalli sipariş oranı düştü.",
    description:
      "Paket ve masa servisi tek panel üzerinden; paket zaman pencereleri, kampanya ve garson bildirimi aynı ekrandan yönetiliyor. Hafta sonu yoğunluğunda servis sırası ve mutfak yükü netleştirildi.",
    tags: ["catering", "restoran", "paket"],
    imageLabel: "Bistro · paket",
    filter: "restoran"
  },
  {
    name: "Marmara Aktarma Lojistik A.Ş.",
    location: "Kocaeli · Gebze gümrük hattı",
    modules: ["API", "Kuyruk", "Log", "Lisans"],
    outcome:
      "Gece tarife yükleme süresi 45 dk’dan yaklaşık 8 dk’ya indi; muhasebe tarafına manuel fatura satırı hatası ciddi oranda düştü.",
    description:
      "Aktarma merkezi tarife ve ek ücret tabloları muhasebe yazılımına imzalı ve günlükle imzalı API ile aktarılıyor. Başarısız istekler kuyrukla yeniden deneniyor; operasyon ekibi gece vardiyasında panodan blokaj görebiliyor.",
    tags: ["lojistik", "entegrasyon", "API"],
    imageLabel: "Lojistik",
    filter: "perakende"
  },
  {
    name: "Ege Kampüs Kulüpler Birliği (pilot teslim)",
    location: "İzmir · Bornova (çağrı‑koordinasyon ofisi)",
    modules: ["Portal", "Başvuru", "Jüri", "CSV"],
    outcome:
      "Başvuru ve jüri puanları için e-posta karışıklığı ortadan kalktı; dönem sonu rapor çıktısı kurum şablonuyla dakikalar içinde hazırlanıyor.",
    description:
      "Öğrenci başvuru ve jüri değerlendirme süreçleri zaman damgalı kayıtlarla tutuluyor; rol bazlı erişim ve okuma salt izinleri tanımlandı. Dönem sonu çıktılar kurumsal arşive tek formatta aktarılıyor.",
    tags: ["kurumsal portal", "eğitim", "kimlik"],
    imageLabel: "Kurumsal portal",
    filter: "kurumsal"
  }
];
