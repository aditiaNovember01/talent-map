import { useEffect, useRef, useState } from 'react';
import logo from '../assets/Untitled design.png';
import '../landing.css';

const DIVISI = [
  {
    id: 'musik',
    emoji: '🎵',
    title: 'Divisi Musik',
    tagline: 'Harmoni dalam Nada',
    desc: 'Eksplorasi vokal, instrumen, dan komposisi. Dari akustik hingga pertunjukan penuh orkestra.',
    color: '#c0a060',
    bg: 'rgba(192,160,96,.12)',
    border: 'rgba(192,160,96,.3)',
    tags: ['Vokal', 'Gitar', 'Piano', 'Perkusi', 'Komposisi'],
  },
  {
    id: 'tari',
    emoji: '💃',
    title: 'Divisi Tari',
    tagline: 'Ekspresi dalam Gerak',
    desc: 'Dari tari tradisional nusantara hingga kontemporer modern. Tubuhmu adalah panggungmu.',
    color: '#e07090',
    bg: 'rgba(224,112,144,.12)',
    border: 'rgba(224,112,144,.3)',
    tags: ['Tradisional', 'Kontemporer', 'Koreografi', 'Pertunjukan'],
  },
  {
    id: 'teater',
    emoji: '🎭',
    title: 'Divisi Teater',
    tagline: 'Kisah di Atas Panggung',
    desc: 'Peran, sutradara, penulisan naskah, dan produksi pertunjukan. Jadikan cerita nyata.',
    color: '#7090e0',
    bg: 'rgba(112,144,224,.12)',
    border: 'rgba(112,144,224,.3)',
    tags: ['Akting', 'Sutradara', 'Naskah', 'Produksi', 'Monolog'],
  },
  {
    id: 'seni-rupa',
    emoji: '🎨',
    title: 'Divisi Seni Rupa',
    tagline: 'Warna & Bentuk Berbicara',
    desc: 'Desain grafis, ilustrasi, fotografi, videografi, dan instalasi seni visual modern.',
    color: '#60c080',
    bg: 'rgba(96,192,128,.12)',
    border: 'rgba(96,192,128,.3)',
    tags: ['Desain Grafis', 'Ilustrasi', 'Fotografi', 'Videografi', 'Instalasi'],
  },
];

const STEPS = [
  { num: '01', title: 'Masukkan Nomor BP', desc: 'Identitas unik kamu sebagai anggota UKM Senja' },
  { num: '02', title: 'Isi Penilaian Diri', desc: '10 pertanyaan untuk mengukur minat dan kemampuanmu' },
  { num: '03', title: 'Pilih Bidang & Posisi', desc: 'Tentukan divisi dan peran yang paling kamu minati' },
  { num: '04', title: 'Kirim & Selesai', desc: 'Data tersimpan otomatis, pengurus akan menindaklanjuti' },
];

// Simple intersection observer hook for scroll animations
function useVisible() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function DivisiCard({ divisi, index }) {
  const [ref, visible] = useVisible();
  return (
    <div
      ref={ref}
      className={`divisi-card ${visible ? 'divisi-card--visible' : ''}`}
      style={{ '--delay': `${index * 0.1}s`, '--card-color': divisi.color, '--card-bg': divisi.bg, '--card-border': divisi.border }}
    >
      <div className="divisi-card__top">
        <span className="divisi-card__emoji">{divisi.emoji}</span>
        <div className="divisi-card__header">
          <h3 className="divisi-card__title">{divisi.title}</h3>
          <span className="divisi-card__tagline">{divisi.tagline}</span>
        </div>
      </div>
      <p className="divisi-card__desc">{divisi.desc}</p>
      <div className="divisi-card__tags">
        {divisi.tags.map(t => <span key={t} className="divisi-tag">{t}</span>)}
      </div>
      <div className="divisi-card__glow" aria-hidden="true" />
    </div>
  );
}

export default function LandingPage({ onStart }) {
  const [heroRef, heroVisible] = useVisible();
  const [stepsRef, stepsVisible] = useVisible();

  // Marquee text
  const marqueeItems = ['MUSIK', 'TARI', 'TEATER', 'SENI RUPA', 'UKM SENJA', 'JAYANUSA'];

  return (
    <div className="lp-root">

      {/* ── NAV ── */}
      <nav className="lp-nav">
        <div className="lp-nav__inner">
          <div className="lp-nav__brand">
            <img src={logo} alt="Logo Senja" className="lp-nav__logo" />
            <span className="lp-nav__name">UKM <strong>Senja</strong></span>
          </div>
          <button className="lp-nav__cta" onClick={onStart}>Isi Form →</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-hero__noise" aria-hidden="true" />
        <div className="lp-hero__orb lp-hero__orb--1" aria-hidden="true" />
        <div className="lp-hero__orb lp-hero__orb--2" aria-hidden="true" />
        <div className="lp-hero__orb lp-hero__orb--3" aria-hidden="true" />

        <div ref={heroRef} className={`lp-hero__content ${heroVisible ? 'lp-hero__content--visible' : ''}`}>
          <div className="lp-hero__pill">
            <span className="lp-hero__pill-dot" />
            UKM Seni Jayanusa · 2025/2026
          </div>

          <h1 className="lp-hero__heading">
            <span className="lp-hero__heading-sub">PEMETAAN</span>
            <span className="lp-hero__heading-main">TALENT</span>
            <span className="lp-hero__heading-outline">SENJA</span>
          </h1>

          <p className="lp-hero__body">
            Temukan potensi terbaikmu. Isi form pemetaan dan bantu pengurus menempatkanmu di divisi yang paling sesuai dengan bakat dan minatmu.
          </p>

          <div className="lp-hero__actions">
            <button className="lp-btn-primary" onClick={onStart}>
              <span>Mulai Sekarang</span>
              <span className="lp-btn-primary__icon">↗</span>
            </button>
            <div className="lp-hero__meta">
              <span>⏱ ~5 Menit</span>
              <span>·</span>
              <span>📋 10 Pertanyaan</span>
              <span>·</span>
              <span>🔒 1x per anggota</span>
            </div>
          </div>

          <div className="lp-hero__preview">
            <div className="lp-preview-card">
              <div className="lp-preview-card__dot lp-preview-card__dot--red" />
              <div className="lp-preview-card__dot lp-preview-card__dot--yellow" />
              <div className="lp-preview-card__dot lp-preview-card__dot--green" />
              <div className="lp-preview-card__body">
                <div className="lp-preview-row">
                  <span className="lp-preview-label">Nomor BP</span>
                  <span className="lp-preview-val">2210050</span>
                </div>
                <div className="lp-preview-row">
                  <span className="lp-preview-label">Divisi Minat</span>
                  <span className="lp-preview-val lp-preview-val--gold">Musik · Teater</span>
                </div>
                <div className="lp-preview-progress">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <div key={n} className={`lp-pp-bar ${n <= 7 ? 'lp-pp-bar--filled' : ''}`} />
                  ))}
                </div>
                <span className="lp-preview-caption">Penilaian Diri — 7/10 terisi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="lp-marquee" aria-hidden="true">
        <div className="lp-marquee__track">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="lp-marquee__item">
              {item} <span className="lp-marquee__sep">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── DIVISI ── */}
      <section className="lp-divisi">
        <div className="lp-container">
          <div className="lp-section-label">4 DIVISI UTAMA</div>
          <h2 className="lp-section-title">Temukan Divisimu</h2>
          <p className="lp-section-sub">UKM Seni Jayanusa hadir dengan empat divisi seni yang saling melengkapi. Di mana passionmu?</p>
          <div className="lp-divisi__grid">
            {DIVISI.map((d, i) => <DivisiCard key={d.id} divisi={d} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── STEPS ── */}
      <section className="lp-steps">
        <div className="lp-steps__bg" aria-hidden="true" />
        <div className="lp-container">
          <div className="lp-section-label lp-section-label--light">CARA PENGISIAN</div>
          <h2 className="lp-section-title lp-section-title--light">Mudah, Cepat, Tepat</h2>
          <div ref={stepsRef} className={`lp-steps__grid ${stepsVisible ? 'lp-steps__grid--visible' : ''}`}>
            {STEPS.map((s, i) => (
              <div key={s.num} className="lp-step" style={{ '--step-delay': `${i * 0.12}s` }}>
                <div className="lp-step__num">{s.num}</div>
                <div className="lp-step__connector" aria-hidden="true" />
                <h3 className="lp-step__title">{s.title}</h3>
                <p className="lp-step__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta">
        <div className="lp-cta__glow" aria-hidden="true" />
        <div className="lp-container lp-cta__inner">
          <img src={logo} alt="" className="lp-cta__logo" />
          <h2 className="lp-cta__heading">
            Siap Tunjukkan<br />
            <span className="lp-cta__heading-accent">Talentmu?</span>
          </h2>
          <p className="lp-cta__sub">
            Form hanya bisa diisi satu kali. Pastikan Nomor BP dan datamu sudah benar sebelum mengirim.
          </p>
          <button className="lp-btn-primary lp-btn-primary--lg" onClick={onStart}>
            <span>Isi Form Pemetaan Talent</span>
            <span className="lp-btn-primary__icon">↗</span>
          </button>
          <p className="lp-cta__note">Tidak perlu akun · Data aman · Gratis</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer__inner">
          <div className="lp-footer__brand">
            <img src={logo} alt="" className="lp-footer__logo" />
            <div>
              <strong>UKM Seni Jayanusa</strong>
              <span>Senja · Pemetaan Talent 2025/2026</span>
            </div>
          </div>
          <p className="lp-footer__copy">© 2025 UKM Seni Jayanusa. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
