# Jivamera — Landing Page

Landing page statis untuk **Jivamera**, brand kecantikan botani dari Bali.
Dibangun dengan HTML, CSS, dan JavaScript murni — tanpa build step dan tanpa
dependensi eksternal selain Google Fonts.

## Menjalankan

Karena produk dan testimoni dimuat dengan `fetch()` dari folder `data/`,
halaman **harus dijalankan lewat server lokal**. Membuka `index.html` langsung
lewat `file://` akan menampilkan pesan bahwa data gagal dimuat.

Dari folder proyek:

```powershell
python -m http.server 5500
```

Lalu buka <http://127.0.0.1:5500/>.

## Struktur

```
index.html               Markup halaman, template kartu, dan ilustrasi SVG
styles.css               Semua styling, animasi, dan breakpoint responsif
script.js                Navigasi, scroll reveal, render JSON, keranjang demo
data/products.json       Data produk (nama, harga, badge, jenis ilustrasi)
data/testimonials.json   Data testimoni pelanggan
assets/jivamera-logo.svg Logo lengkap (SVG transparan)
assets/jivamera-mark.svg Emblem/logo mark (SVG transparan)
assets/favicon.svg       Favicon
assets/editorial-portrait.webp  Foto editorial (WebP)
assets/editorial-portrait.jpg   Fallback JPEG
```

## Bagian halaman

1. **Hero** — panggung utama dengan ilustrasi candi Bali, emblem lotus, dan
   dua ajakan utama.
2. **Marquee** — pita nilai brand (BPOM, botani, cruelty-free, reef safe).
3. **Filosofi** — cerita brand, potret editorial, tanda tangan founder, dan
   statistik.
4. **Koleksi** — tiga produk unggulan dengan tombol tambah ke tas ritual
   (disembunyikan sementara mengikuti permintaan brand).
5. **Bahan** — empat botani utama beserta manfaatnya.
6. **Ritual** — tiga langkah perawatan harian.
7. **Quote & Testimoni** — bukti sosial dan kutipan founder.
8. **Newsletter** — formulir dengan validasi email di sisi klien.
9. **Footer** — navigasi, kontak, sosial media, dan info legal.

## Interaksi & scroll

- Header kaca yang memadat saat halaman digulir, progress bar emas, dan
  penanda bagian aktif di navigasi.
- Hero memakai parallax halus: panggung candi, kelopak, dan salinan memudar
  saat pengguna meninggalkan hero.
- Reveal bertahap untuk judul, kartu, dan statistik; angka statistik
  berhitung saat pertama kali terlihat.
- Tombol kembali ke atas muncul setelah melewati 85% tinggi viewport.
- Semua efek dinonaktifkan otomatis saat `prefers-reduced-motion: reduce`.

## Data produk & testimoni

Kartu produk dan testimoni dirender secara dinamis oleh `script.js` dari dua
file JSON. Template markup-nya ada di akhir `index.html` (`productCardTemplate`,
`testimonialTemplate`, dan `art-*` untuk ilustrasi botol).

### `data/products.json`

```json
{
  "locale": "id-ID",
  "currency": "IDR",
  "items": [
    {
      "id": "frangipani-day-cream",
      "name": "Frangipani Day Cream",
      "category": "Pelembap Wajah",
      "size": "50 ml",
      "description": "Krim ringan dengan ekstrak kamboja ...",
      "price": 289000,
      "badge": { "label": "Best Seller", "tone": "gold" },
      "art": "cream"
    }
  ]
}
```

| Field | Wajib | Keterangan |
| --- | --- | --- |
| `locale` | tidak | Format harga, default `id-ID`. |
| `currency` | tidak | Kode mata uang, default `IDR`. |
| `items[].id` | tidak | Identitas unik; belum dipakai, berguna saat menghubungkan keranjang/analytics. |
| `items[].name` | ya | Nama produk. |
| `items[].price` | ya | Angka tanpa titik/koma, mis. `289000`. |
| `items[].category` | tidak | Ditampilkan bersama `size`. |
| `items[].size` | tidak | Contoh `50 ml`. |
| `items[].description` | tidak | Deskripsi singkat. |
| `items[].badge` | tidak | `{ "label": "...", "tone": "gold \| new \| soft" }`. Tanpa badge, label disembunyikan. |
| `items[].art` | tidak | Ilustrasi botol: `cream`, `serum`, atau `lotion`. |

Harga diformat otomatis dengan `Intl.NumberFormat`. Menambah produk cukup
dengan menambah objek di `items`; urutan JSON menentukan urutan kartu.

### `data/testimonials.json`

```json
{
  "items": [
    {
      "name": "Nadia S.",
      "initials": "NS",
      "location": "Jakarta",
      "product": "Frangipani Day Cream",
      "rating": 5,
      "quote": "“Aroma kamboja-nya seperti ...”
    }
  ]
}
```

| Field | Wajib | Keterangan |
| --- | --- | --- |
| `items[].quote` | ya | Isi testimoni. |
| `items[].name` | tidak | Default `Pelanggan Jivamera`. |
| `items[].initials` | tidak | Inisial avatar; dibuat otomatis dari nama bila kosong. |
| `items[].location` | tidak | Ditampilkan bersama `product`. |
| `items[].product` | tidak | Nama produk yang diulas. |
| `items[].rating` | tidak | Angka 1–5; jumlah bintang mengikuti nilai ini. |

Semua nilai dirender dengan `textContent` (bukan `innerHTML`), sehingga teks
dari JSON tidak bisa menyisipkan markup. JSON-LD `makesOffer` pada
`index.html` ikut diperbarui otomatis dari `data/products.json`. Bila salah
satu file gagal dimuat, bagian terkait menampilkan pesan kesalahan.

> Teks section seperti “Tiga langkah, satu ritual.” tidak ikut berubah saat
> jumlah produk ditambah. Sesuaikan juga blok JSON-LD statis di `<head>`
> sebagai fallback untuk crawler yang tidak menjalankan JavaScript.

## Kustomisasi cepat

- **Warna & tipografi** — semua token ada di `:root` pada `styles.css`
  (`--forest`, `--gold`, `--cream`, `--serif`, `--sans`).
- **Produk** — sunting `data/products.json` (lihat skema di atas). Untuk
  varian ilustrasi botol baru, tambahkan `<template id="art-...">` di
  `index.html` lalu daftarkan pemetaannya di `artMap` pada `script.js`.
- **Testimoni** — sunting `data/testimonials.json`; kartu dan bintang dibuat
  otomatis.
- **Hero** — ilustrasi candi berada di `<svg class="hero-scene">`; bisa
  diganti dengan foto `background-image` pada `.hero-bg` bila diinginkan.
- **Identitas** — ganti alamat, email, nomor telepon, dan tautan sosial di
  footer sebelum publikasi.
- **Logo** — emblem transparan tersedia di `assets/jivamera-mark.svg`, lockup
  lengkap di `assets/jivamera-logo.svg`, dan favicon di `assets/favicon.svg`.
  Di halaman, emblem memakai SVG inline dan wordmark memakai tipografi situs
  agar teks tetap tajam dan proporsinya mudah diatur.
- **Foto editorial** — ganti `assets/editorial-portrait.webp` dan `.jpg`
  (rasio mendekati 1:1). Bingkai memakai `object-fit: cover` dengan fokus
  vertikal di `38%`; ubah `object-position` pada `.art-portrait` bila perlu.
- **Newsletter & keranjang** — saat ini demo sisi klien. Hubungkan
  `#newsletterForm` dan tombol `.add-btn` ke layanan email/keranjang Anda.
  Tombol dinamis tetap bekerja karena klik ditangani lewat event delegation.

## Catatan produksi

- Ganti tautan `href="#"` pada footer dan tautan sosial dengan URL sebenarnya.
- `og:image` memakai potret editorial dengan URL absolut `https://jivamera.com`.
  Sesuaikan domain tersebut bila situs dipublikasikan di alamat lain.
- Keranjang hanya menghitung item di memori; muat ulang halaman akan
  meresetnya.
- Hormati `prefers-reduced-motion` — animasi sudah dimatikan otomatis.
- `index.html` memuat `styles.css?v=7` dan `script.js?v=2`. Naikkan angka
  versi tersebut setelah mengubah CSS/JS agar browser tidak memakai cache lama.

## Kredit

- Font: [Cormorant Garamond & Jost](https://fonts.google.com/) (SIL Open Font License).
- Seluruh ilustrasi, ikon, ornamen, dan logo dibuat sebagai SVG di proyek ini.
- Foto editorial: aset AI-generated yang disediakan brand.
