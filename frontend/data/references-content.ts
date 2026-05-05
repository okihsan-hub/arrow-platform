export type ReferenceFilterId = "all" | "restoran" | "otomasyon" | "kurumsal" | "perakende";

export type ReferenceItem = {
  name: string;
  description: string;
  tags: string[];
  imageLabel: string;
  filter: ReferenceFilterId;
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
    name: "Boğaziçi Restoran Grubu",
    description:
      "On iki şubenin günlük kapanış özetleri, merkezi lisans doğrulama ve mutfak–servis hatları için tek ekrandan operasyon görünürlüğü. Yoğun saatlerde kesinti yaşamadan çalışacak şekilde tasarlanan mimari ile mağaza açılışlarını hızlandırdık.",
    tags: ["restoran", "otomasyon", "çok şubeli"],
    imageLabel: "Restoran zinciri",
    filter: "restoran"
  },
  {
    name: "Ege Endüstri Otomasyon",
    description:
      "Üretim hatlarından gelen durum sinyallerinin anlık panoda toplanması, eşik aşımında e-posta ve kurumsal mesaj kanallarına düşen uyarılar. Bakım ekiplerinin saha günlüklerini tek çizgide izleyebilmesi için hafif ve bakımı kolay bir yönetim arayüzü sunduk.",
    tags: ["otomasyon", "imalat", "izleme"],
    imageLabel: "Endüstriyel panel",
    filter: "otomasyon"
  },
  {
    name: "Kıyı Market & Şarküteri",
    description:
      "Son kullanma tarihine göre stok uyarıları, tedarikçi bazlı giriş çıkış kayıtları ve haftalık satış özetinin PDF raporlanması. POS tarafındaki mevcut donanımla çakışmayan, sadece ihtiyaç duyulan modüllerle ilerleyen bir geçiş planı uygulandı.",
    tags: ["perakende", "stok", "raporlama"],
    imageLabel: "Perakende",
    filter: "perakende"
  },
  {
    name: "Yalı Davet Catering",
    description:
      "Etkinlik bazlı menü şablonları, bölgesel personel ataması ve teslimat pencerelerinin takvim üzerinden yönetimi. Müşteri tekliflerinin onay akışı ve sonrasında operasyon ekibine düşen görev listesi tek panelde birleştirildi.",
    tags: ["catering", "restoran", "operasyon"],
    imageLabel: "Catering",
    filter: "restoran"
  },
  {
    name: "Nova Uluslararası Lojistik",
    description:
      "Aktarma merkezlerinde kullanılan tarife ve ek ücret tablolarının muhasebe yazılımına güvenli API ile aktarılması; tekrarlayan manuel girişleri ortadan kaldırdı. Hata günlükleri ve yeniden deneme kuyruğu ile operasyon ekibinin gece vardiyasında müdahale süresini kısalttık.",
    tags: ["lojistik", "entegrasyon", "API"],
    imageLabel: "Lojistik",
    filter: "perakende"
  },
  {
    name: "İztek Ar-Ge Kulübü",
    description:
      "Öğrenci projelerinin başvuru ve jüri değerlendirme süreçleri için zaman damgalı kayıtlar ve rol bazlı erişim. Dönem sonunda oluşan raporların kurum içi arşive aktarılması için dışa aktarım ve salt okunur görünümler tanımlandı.",
    tags: ["kurumsal portal", "eğitim", "kimlik"],
    imageLabel: "Kurumsal portal",
    filter: "kurumsal"
  }
];
