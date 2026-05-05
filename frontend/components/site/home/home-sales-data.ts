export const homeFeatures = [
  {
    title: "Adisyon ve masa yönetimi",
    body:
      "Masa, paket ve hızlı satış satırları; kısmi tahsilat, ikram ve iptal nedenleri tek fiş üzerinde izlenebilir. Sipariş kapandığında tanımlı kurallarla ERP veya merkez stok sistemine ürün çıkışı gönderilir — stok entegrasyonu için ürün–depo eşlemesi tek kez yapılandırılır. POS tarafı kısa süreli bağlantı kopmalarında yerel tamponda sipariş almaya devam eder (offline çalışma desteği); bağlantı gelince kuyruk güvenli şekilde sunucuya işlenir."
  },
  {
    title: "QR menü sistemi",
    body:
      "Menü, fiyat ve kampanya setleri merkezi panelden versiyonlanır; şube ve dil bazlı varyasyon desteklenir. QR oturumu oturum süresi ve gerektiğinde masa / bölge bağlamıyla sınırlandırılabilir; ödeme ve resmi fiş adımlarında mutlaka cihaz bazlı lisanslı adisyon terminaline yönlendirme korunur. Ağ dalgalanmalarında menü içeriği istemci önbelleğiyle okunabilir kalır."
  },
  {
    title: "Cihaz bazlı lisans kontrolü",
    body:
      "Her terminal (adisyon, mutfak görüntü, kasa yardımcı) benzersiz cihaz kimliği ile etkinleştirilir; süre, ürün paketi ve lokasyondaki aktif cihaz üst sınırı politika olarak tanımlanır. Lisans sunucuda imzalı doğrulama ile denetlenir; politika ihlalinde cihaz çıktı ve kritik işlevler kademeli kısıtlanabilir. Böylece donanım envanteri ile fiili kullanım hizalanır."
  },
  {
    title: "Bulut tabanlı yönetim paneli",
    body:
      "Şube parametreleri, kullanıcı rolleri, menü ağaçları ve raporlar HTTPS üzerinden yönetilir; çok şubede aynı yayın paketi anında devreye alınabilir. İşlem ve yapılandırma değişiklikleri için denetim kayıtları tutulur. Panelden offline çalışma süre eşikleri, senkron sıklığı ve üst uç kısıtları tanımlanır; sahadaki terminaller bağlantı kopmalarında izin verilen pencereyi bu politikalardan okur."
  },
  {
    title: "Mutfak yazıcı entegrasyonu",
    body:
      "Ürün ve kategori bazlı yazıcı yönlendirme kuralları sıcak hat, bar, pastane ve paket için ayrı çıktı üretir. ESC/POS uyumlu yazıcılarda tekrar yazdırma, sıra numarası ve çift kopya politikaları deterministik çalışır; hata veya kağıt kesintisinde tanımlı yedek yazıcıya düşüş yapılabilir. Yoğun dilimde sıra bütünlüğü korunur."
  }
] as const;

export type HomeWhyUsIconId = "years" | "deploy" | "support" | "custom";

export type HomeWhyUsCard = {
  icon: HomeWhyUsIconId;
  title: string;
  explanation: string;
};

export const homeWhyUs: readonly HomeWhyUsCard[] = [
  {
    icon: "years",
    title: "18+ yıl deneyim",
    explanation: "Restoran sektöründe sahada edinilmiş gerçek tecrübe"
  },
  {
    icon: "deploy",
    title: "Hızlı kurulum",
    explanation: "Planlı rollout ile minimum kesinti; kısa sürede güvenilir canlı kullanım."
  },
  {
    icon: "support",
    title: "Yerinde destek",
    explanation: "Uzaktan çözüm yetmezse lokasyonda saha uzmanı ile yüz yüze müdahale."
  },
  {
    icon: "custom",
    title: "Özelleştirilebilir sistem",
    explanation: "Menü, kampanya ve entegrasyonlar işletmenizin kurallarına göre parametrelenir; kilitlenmezsiniz."
  }
];

export const homePreviewProjects = [
  {
    name: "Boğaziçi Meydan Sofrası",
    category: "Restoran zinciri",
    location: "İstanbul · çok şubeli",
    modules: ["POS", "QR", "Paket", "Lisans"],
    outcome: "Kapanış toplama hızlandı; mutfağa giden yanlış ürün oranı yaklaşık %40 düştü.",
    description:
      "On iki şubede merkezi lisans doğrulama ve operasyon görünürlüğü; kesintiye dayanıklı yazıcı yönlendirmesi ile yeni şube açılışları netleştirildi."
  },
  {
    name: "Karadeniz Gross Market",
    category: "Perakende",
    location: "Trabzon · Ortahisar",
    modules: ["POS", "Stok", "Lisans", "Barkod"],
    outcome: "SKT yaklaşan ürün uyarısı ve haftalık satış çıktısı tek tıkta; kasa fiş uyumsuzluğu azaldı.",
    description: "Şube POS ile stok uyarıları ve tedarikçi hareketleri aynı ekrandan; paralel kullanımla kesintisiz geçiş."
  },
  {
    name: "Gazi Caddesi Bistro & Paket",
    category: "Bistro · paket",
    location: "Diyarbakır · Bağlar",
    modules: ["POS", "QR", "Paket", "Lisans"],
    outcome:
      "Paket yoğunluğunda telefon ve defter karmaşası azaldı; mutfak ve bar çıktıları ayrışınca hazırlık süresi kısaldı.",
    description:
      "Masa ile teslimât aynı panelde; kampanya ve zaman pencereleri operasyon için tek kaynak olarak kullanılıyor."
  }
] as const;
