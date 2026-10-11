# 🌼 Mathack on Titan

> Game petualangan matematika side-scrolling bergaya voxel untuk anak usia **Pra-K sampai K (≤ 6 tahun)**. Jawab soal untuk melempar apel ke monster & Titan lucu — kenyang, mereka jadi **teman** dan ikut meramaikan homepage.

*English: a portrait, voxel-style side-scrolling math adventure for kids up to 6. Answer Singapore-curriculum questions to feed apples to cute monsters and Titans until they become friends. Single-file HTML PWA, ID/EN, with parent co-op over WebRTC.*

**▶ Main:** https://sikhsanf.github.io/mathack-on-titan/
**Versi:** v1.3.3 (prototype) · **Platform:** browser HP/tablet (portrait), terinstal sebagai PWA, tanpa APK

---

## Daftar isi
1. [Fitur](#fitur)
2. [Cara main](#cara-main)
3. [Install di HP / tablet](#install-di-hp--tablet)
4. [Dunia, monster & Titan](#dunia-monster--titan)
5. [Soal matematika](#soal-matematika)
6. [Akun orang tua & co-op](#akun-orang-tua--co-op)
7. [Arsitektur](#arsitektur)
8. [Struktur repo](#struktur-repo)
9. [Build & development](#build--development)
10. [Testing](#testing)
11. [Deploy](#deploy)
12. [Keterbatasan & roadmap](#keterbatasan--roadmap)
13. [Kredit](#kredit)

---

## Fitur

**Untuk anak**
- Side-scrolling voxel (Three.js) dengan karakter yang bisa dikustomisasi: rambut, warna rambut, kulit, baju, topi, hewan peliharaan.
- Kamera & UI **portrait**, tombol dan font besar; instruksi soal disederhanakan agar terbaca anak 5 tahun.
- **Duel apel:** jawaban benar = hero melempar apel, monster/Titan makan (bar "kenyang" turun). Kenyang → jadi teman, bukan musuh.
- Monster yang sudah jadi teman **mengikuti hero** di stage sampai ketemu Titan.
- **Homepage ramai:** semua teman (monster + Titan) tampil di homepage. Tap teman → bubble chat ramah acak, reaksi, dan suara khas monster.
- **Toko style dengan coba dulu:** tap aksesoris yang belum dibeli untuk langsung memakainya, lalu tekan *Beli 🪙* jika cocok.
- Koin, bintang per stage, peta dunia, musik & SFX prosedural (Web Audio, tanpa file audio).
- Dua bahasa: **Indonesia / English**.

**Untuk orang tua**
- Akun orang tua **Ayah / Ibu** (maks. 1 per peran) di belakang gerbang hitung sederhana.
- **Co-op real-time:** orang tua bergabung dari HP lain dengan kode 5 karakter, melihat anak berjalan & duel (mirror view), dan bisa memberi bantuan (heal, power, shield, hadiah koin, semangat).
- Auto-reconnect saat app ditutup/dibuka kembali.

## Cara main

1. Buka game → **Main** → buat karakter (nama, laki/perempuan, level **Pra-K** atau **K**).
2. Pilih stage di peta, geser/tekan untuk berjalan di stage.
3. Bertemu monster → panel soal muncul. Jawab dengan benar untuk **melempar apel**; salah → monster menyerang (nyawa ❤️ berkurang).
4. Kalahkan (kenyangkan) monster di tiap titik dan Titan di akhir stage untuk memenangkan koin, bintang, dan teman baru.
5. Belanja aksesoris dengan koin di menu **Style**.

## Install di HP / tablet

1. Buka URL di atas di **Chrome** (Android) atau Safari (iOS).
2. Android: menu ⋮ → **Install app** / **Add to Home screen**. iOS: Share → **Add to Home Screen**.
3. Setelah terpasang, game jalan standalone (portrait) dan bekerja offline (kecuali co-op).

> **Tips Android:** jika muncul *"This app is already installed"* padahal belum, cek **Settings → Apps** dan hapus entri lama. Di Samsung Internet pakai menu → *Add page to Home screen*. Manifest memakai `id` `/mathack-on-titan` agar tidak bentrok dengan PWA lain di origin yang sama.

## Dunia, monster & Titan

Dunia 1 — *Padang Bunga*, 3 stage, masing-masing 2 monster + 1 Titan bos:

| Stage | Monster | Titan (bos) | Soal / duel |
|---|---|---|---|
| 1 | Sprout, Jelly | Matahari | 3 / 3 / 5 |
| 2 | Lebah, Ngengat | Madu | 3 / 3 / 5 |
| 3 | Jamur, Kelinci | Raja | 3 / 4 / 6 |

Titan lain (tunas, tulip, lebah, kupu, jamur, siput) dipakai di homepage & peta. Semua model dibangun dari kotak voxel lewat kode (`monsters.js`, `kit.js`) — tidak ada aset gambar/3D eksternal.

## Soal matematika

- Soal berasal dari **app matematika kurikulum Singapura** milik istri penulis (konten Pra-K halaman 1–30 dan K halaman 1–30 = Dunia 1).
- App aslinya dijalankan **headless sebagai engine** di dalam `<iframe srcdoc>`; game berbicara dengan engine lewat `postMessage`:
  - game → engine: `lang`, `ask {level,no,idx}`, `clear`, `meta`
  - engine → game: `ready`, `asked`, `result {ok}`, `error`, `meta`
- Lapisan lokalisasi/penyederhanaan di `build_engine.py` (`LOCFIX`): instruksi singkat ID/EN, label dan jawaban diterjemahkan, perbaikan tampilan beberapa halaman (mis. urut ukuran, hitung "bukan kubus", lompatan kelinci di garis bilangan).
- Tingkat kesulitan per duel diatur lewat `pickQ` (pecahan halaman menurut urutan duel) sehingga soal makin sulit di akhir stage.

## Akun orang tua & co-op

- **Gerbang orang tua:** soal penjumlahan/pengurangan mudah sebelum membuat/masuk akun.
- **Anak = host.** Kode 5 karakter (`mxt-xxxxx`) disimpan di `localStorage` (`mx_cocode`) dan dipakai ulang; host otomatis menyala jika sebelumnya aktif (`mx_coauto`).
- **Orang tua = guest** (PeerJS / WebRTC data channel). Pesan: `hello / perk / cheer / bye` (P→H) dan `welcome / busy / state / bye` (H→P).
- **Perk:** heal +2, power (serangan 2×), shield 2, hadiah 10 koin, cheer tanpa batas.
- **Mirror view:** HP orang tua merender ulang dunia yang sama (posisi hero, duel, nyawa, kenyang monster, teman yang mengikuti) berdasarkan `coopState`.
- Transport memakai server PeerJS publik; tanpa TURN, jadi pada jaringan tertentu (CGNAT/simetris) koneksi bisa gagal.

## Arsitektur

```
index.html  (satu file, ~1.3 MB, di-generate)
 ├─ ezui.css + game.css            UI kit bergaya kertas/buku cerita
 ├─ three.min.js (r128)            render voxel, Lambert + bayangan PCFSoft
 ├─ peerjs.min.js                  co-op
 ├─ kit.js / p1_data.js            helper, teks ID/EN, STAGES, SFX & musik Web Audio
 ├─ p2_three.js / monsters.js      scene, kamera, dunia, monster & Titan voxel
 ├─ p3_flow.js                     alur game: slot, home, style, peta, play, duel, co-op, parent mirror
 └─ ENGINE_HTML (srcdoc iframe)    engine soal dari app matematika
sw.js + manifest.webmanifest       PWA (offline cache, ikon, id unik)
```

Poin teknis:
- Panel soal (`#duelPanel`) berbentuk kertas dengan tinggi 30% (jalan) / 60% (duel) di portrait; viewport 3D dihitung dari rect panel (`frame()`).
- Teman memakai `slot.prog.friends`; pengikut di stage (`updateFollowers`) berjalan di rumput kanan-depan hero.
- Semua audio disintesis (`tone()`, `noise()`), termasuk suara khas tiap monster (`monVoice`).
- Progress tersimpan di `localStorage` (slot karakter, koin, bintang, teman, akun orang tua).

## Struktur repo

```
.
├── index.html                 # build hasil (diserve GitHub Pages)
├── sw.js, manifest.webmanifest, icon-*.png, favicon.png, apple-touch-icon.png
├── version.json               # versi & timestamp build
├── src/
│   ├── body.html              # markup layar & overlay
│   ├── game.css, engine_theme.css
│   ├── kit.js, p1_data.js, p2_three.js, monsters.js, p3_flow.js
│   ├── engine.html            # engine soal hasil generate
│   └── peerjs.min.js
└── tools/
    ├── build.py               # gabungkan src → index.html + PWA
    ├── build_engine.py        # ubah app matematika asli → src/engine.html
    ├── manifest.webmanifest
    └── test/                  # skrip Playwright (lihat Testing)
```

## Build & development

Prasyarat: Python 3, Node.js, `npm i three@0.128` (untuk `three.min.js`), dan **UI kit Ezventure** (`ezui.css`, `fonts.html`).

> `tools/build.py` saat ini memakai path absolut (`R`, `ez`) dari lingkungan pengembangan penulis — sesuaikan di bagian atas skrip. Sumber app matematika asli **tidak** disertakan di repo; `src/engine.html` adalah hasil generate yang sudah siap pakai.

```bash
# 1) (opsional) regenerasi engine soal dari app matematika asli
python3 tools/build_engine.py <math_app.html> 30

# 2) build game → dist/ (index.html, sw.js, manifest, ikon)
python3 tools/build.py

# 3) jalankan lokal
cd dist && python3 -m http.server 8765      # buka http://localhost:8765
```

Bila hanya mengubah game (bukan engine soal), cukup langkah 2–3. Perubahan pada tampilan engine soal sebaiknya dilakukan di `build_engine.py` / `engine_theme.css` agar tidak hilang saat regenerasi.

## Testing

Tes end-to-end memakai **Playwright** (Chromium headless + SwiftShader untuk WebGL) di `tools/test/`:

| Skrip | Yang dicek |
|---|---|
| `hop.py` | Render halaman soal tertentu: `python3 hop.py prak:29:0 k:7:0` → `shots/q_*.png` |
| `apple.py` | Duel apel & bar kenyang |
| `pal.py` | Teman di homepage, tap, bubble |
| `gate.py` | Gerbang & akun Ayah/Ibu |
| `coop.py`, `coop2.py` | Co-op dua browser, mirror view, reconnect (butuh `peerserver.js`) |
| `try.py` | Coba-dulu sebelum beli aksesoris |

Jalankan server statis dari `dist/` dulu, lalu tes. Contoh co-op: jalankan `node peerserver.js` (PeerJS lokal, port 9000) dan buka `?peerhost=localhost&peerport=9000`.

## Deploy

GitHub Pages dari branch utama (root). Alur rilis:

1. `python3 tools/build.py`
2. Salin `dist/index.html` dan `dist/sw.js` ke root repo (plus `src/` & `tools/` bila berubah).
3. Naikkan `version.json` dan teks versi di layar boot.
4. Commit & push — `sw.js` otomatis memakai nama cache baru sehingga klien mendapat versi terbaru setelah app ditutup-buka.

## Keterbatasan & roadmap

- Baru **Dunia 1** (3 stage); konten K halaman 31+ dan Dunia 2+ belum.
- Co-op belum diuji luas di jaringan seluler nyata; tanpa TURN.
- Sebagian prompt Pra-K versi EN masih bercampur bahasa Indonesia; halaman *ten-frame* masih kecil; hero kecil saat berjalan.
- Spec desain: dokumen "Game Spec" (v0.4) di Claude Docs — belum memuat tuning kesulitan, mirror view, akun Ayah/Ibu, dan coba-dulu aksesoris.

## Kredit

- Ide, desain, dan pengujian bersama Zaid (5 tahun) 👦
- Konten soal: app matematika kurikulum Singapura (Catherine).
- Dibangun bersama Claude (Anthropic). Three.js, PeerJS, Playwright.

*Prototipe pribadi untuk keluarga — belum untuk distribusi komersial.*
