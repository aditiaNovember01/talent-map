import { useState } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import logo from '../assets/Untitled design.png';

const QUESTIONS = [
  { id: 1, text: 'Saya memiliki kemampuan dalam bidang seni (musik, tari, teater, sastra, dll.)' },
  { id: 2, text: 'Saya percaya diri tampil di depan umum atau panggung' },
  { id: 3, text: 'Saya mampu bekerja sama dalam tim untuk menyukseskan kegiatan organisasi' },
  { id: 4, text: 'Saya memiliki kemampuan memimpin dan mengarahkan anggota lain' },
  { id: 5, text: 'Saya tertarik pada bidang administrasi dan pengelolaan organisasi' },
  { id: 6, text: 'Saya memiliki kemampuan desain grafis atau publikasi media' },
  { id: 7, text: 'Saya memiliki kemampuan fotografi atau videografi' },
  { id: 8, text: 'Saya mampu berkomunikasi dengan baik kepada orang lain' },
  { id: 9, text: 'Saya tertarik mengelola dan merancang sebuah acara atau event' },
  { id: 10, text: 'Saya siap mengembangkan potensi diri untuk kemajuan UKM Senja' },
];

const BIDANG_SENI = [
  // Musik
  'Vokal', 'Gitar / Bass', 'Piano / Keyboard', 'Perkusi / Drum', 'Instrumen Lainnya',
  // Tari
  'Tari Tradisional', 'Tari Kontemporer', 'Koreografi',
  // Teater
  'Akting / Peran', 'Sutradara', 'Penulisan Naskah',
  // Seni Rupa
  'Desain Grafis', 'Ilustrasi / Lukis', 'Fotografi', 'Videografi',
];

const POSISI_ORGANISASI = [
  'Pengurus Inti', 'Humas', 'Sekretaris', 'Bendahara',
  'Publikasi & Dokumentasi', 'Divisi Acara',
  'Divisi Musik', 'Divisi Tari', 'Divisi Teater', 'Divisi Seni Rupa',
];

const LABELS = ['Sangat Tidak Sesuai', 'Tidak Sesuai', 'Cukup Sesuai', 'Sesuai', 'Sangat Sesuai'];

const initialState = {
  nomorBP: '',
  nama: '',
  scores: {},
  bidangSeni: [],
  bidangLainnya: '',
  talentDikembangkan: '',
  posisiOrganisasi: [],
  komentar: '',
};

export default function TalentForm({ onBack }) {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState('idle'); // idle | checking | loading | success | duplicate
  const [errorMsg, setErrorMsg] = useState('');
  const [duplicateInfo, setDuplicateInfo] = useState(null);

  const handleScore = (qId, val) => {
    setForm(f => ({ ...f, scores: { ...f.scores, [qId]: val } }));
  };

  const handleCheckbox = (field, value) => {
    setForm(f => {
      const arr = f[field];
      return {
        ...f,
        [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Nomor BP hanya angka, max 10 digit
    if (name === 'nomorBP') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setForm(f => ({ ...f, nomorBP: cleaned }));
      return;
    }
    setForm(f => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.nomorBP.trim() || form.nomorBP.length < 6)
      return 'Nomor BP wajib diisi (minimal 6 digit).';
    if (!form.nama.trim()) return 'Nama wajib diisi.';
    for (const q of QUESTIONS) {
      if (!form.scores[q.id]) return `Pertanyaan no. ${q.id} belum dijawab.`;
    }
    if (form.bidangSeni.length === 0) return 'Pilih minimal satu bidang seni yang diminati.';
    if (form.posisiOrganisasi.length === 0) return 'Pilih minimal satu posisi organisasi yang diminati.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setErrorMsg(err); return; }
    setErrorMsg('');
    setStatus('checking');

    try {
      // Cek apakah Nomor BP sudah pernah submit
      const bpQuery = query(
        collection(db, 'talent_responses'),
        where('nomorBP', '==', form.nomorBP.trim())
      );
      const existing = await getDocs(bpQuery);

      if (!existing.empty) {
        const prevData = existing.docs[0].data();
        setDuplicateInfo({
          nama: prevData.nama,
          tanggal: prevData.createdAt,
        });
        setStatus('duplicate');
        return;
      }

      setStatus('loading');

      const bidangFinal = form.bidangSeni.includes('Lainnya') && form.bidangLainnya.trim()
        ? [...form.bidangSeni.filter(b => b !== 'Lainnya'), `Lainnya: ${form.bidangLainnya.trim()}`]
        : form.bidangSeni;

      const scoresClean = {};
      Object.entries(form.scores).forEach(([k, v]) => {
        scoresClean[String(k)] = Number(v);
      });

      const docRef = await addDoc(collection(db, 'talent_responses'), {
        nomorBP: form.nomorBP.trim(),
        nama: form.nama.trim(),
        scores: scoresClean,
        bidangSeni: bidangFinal,
        talentDikembangkan: form.talentDikembangkan.trim(),
        posisiOrganisasi: form.posisiOrganisasi,
        komentar: form.komentar.trim(),
        createdAt: serverTimestamp(),
      });

      console.log('Berhasil disimpan:', docRef.id);
      setStatus('success');
      setForm(initialState);
    } catch (err) {
      console.error('Firebase error:', err.code, err.message);
      setErrorMsg(`Gagal menyimpan: ${err.message}`);
      setStatus('idle');
    }
  };

  const handleReset = () => {
    setForm(initialState);
    setStatus('idle');
    setErrorMsg('');
    setDuplicateInfo(null);
  };

  const formatDate = (ts) => {
    if (!ts) return '-';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
  };

  // --- DUPLICATE STATE ---
  if (status === 'duplicate') {
    return (
      <div className="form-page">
        <div className="form-topbar">
          <button className="btn-back" onClick={onBack}>← Kembali</button>
        </div>
        <div className="result-card result-warning">
          <div className="result-icon">⚠️</div>
          <h2>Nomor BP Sudah Terdaftar</h2>
          <p>
            Nomor BP <strong>{form.nomorBP}</strong> atas nama{' '}
            <strong>{duplicateInfo?.nama}</strong> sudah mengisi form ini
            {duplicateInfo?.tanggal ? ` pada ${formatDate(duplicateInfo.tanggal)}` : ''}.
          </p>
          <p className="result-note">
            Setiap anggota hanya dapat mengisi form satu kali. Hubungi pengurus jika ada kesalahan.
          </p>
          <button className="btn-primary" onClick={handleReset}>Coba Nomor BP Lain</button>
        </div>
      </div>
    );
  }

  // --- SUCCESS STATE ---
  if (status === 'success') {
    return (
      <div className="form-page">
        <div className="form-topbar">
          <button className="btn-back" onClick={onBack}>← Kembali</button>
        </div>
        <div className="result-card result-success">
          <div className="result-icon">🎉</div>
          <h2>Terima Kasih!</h2>
          <p>
            Respon kamu sudah berhasil disimpan. Pengurus UKM Senja akan menindaklanjuti pemetaan talent ini.
          </p>
          <p className="result-note">Sampai jumpa di kegiatan UKM Seni Jayanusa berikutnya! 🎭</p>
          <button className="btn-primary" onClick={onBack}>← Kembali ke Beranda</button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      {/* Topbar */}
      <div className="form-topbar">
        <button className="btn-back" onClick={onBack}>← Kembali</button>
        <div className="topbar-brand">
          <img src={logo} alt="" className="topbar-logo" />
          <span>UKM Senja</span>
        </div>
      </div>

      <div className="form-container">
        {/* Header */}
        <div className="form-header">
          <h2>FORM PEMETAAN TALENT</h2>
          <p className="form-org">UKM Seni Jayanusa (Senja)</p>
          <p className="form-subtitle">
            Isi semua bagian dengan jujur sesuai kondisi kamu saat ini.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Nomor BP + Nama */}
          <div className="field-row-2">
            <div className="field-group">
              <label className="field-label" htmlFor="nomorBP">
                Nomor BP <span className="required">*</span>
                <span className="field-hint">Contoh: 2210050</span>
              </label>
              <input
                id="nomorBP"
                name="nomorBP"
                type="text"
                inputMode="numeric"
                className="field-input"
                placeholder="Masukkan nomor BP..."
                value={form.nomorBP}
                onChange={handleChange}
                maxLength={10}
              />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="nama">
                Nama Lengkap <span className="required">*</span>
              </label>
              <input
                id="nama"
                name="nama"
                type="text"
                className="field-input"
                placeholder="Tulis nama lengkapmu..."
                value={form.nama}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Pertanyaan */}
          <section className="section-block">
            <h3 className="section-title">
              <span className="section-icon">📋</span> Penilaian Diri
            </h3>
            <div className="legend-inline">
              {LABELS.map((label, i) => (
                <span key={i} className="legend-inline__item">
                  <span className="legend-inline__num">{i + 1}</span>
                  <span>{label}</span>
                </span>
              ))}
            </div>
            <div className="questions-list">
              {QUESTIONS.map((q) => (
                <div key={q.id} className={`q-card ${form.scores[q.id] ? 'q-card--answered' : ''}`}>
                  <div className="q-card__head">
                    <span className="q-card__num">{q.id}</span>
                    <span className="q-card__text">{q.text}</span>
                    {form.scores[q.id] && (
                      <span className="q-card__check">✓</span>
                    )}
                  </div>
                  <div className="q-card__options">
                    {[1,2,3,4,5].map(val => (
                      <label
                        key={val}
                        className={`q-option ${form.scores[q.id] === val ? 'q-option--selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`q${q.id}`}
                          value={val}
                          checked={form.scores[q.id] === val}
                          onChange={() => handleScore(q.id, val)}
                          aria-label={`${LABELS[val-1]}`}
                        />
                        <span className="q-option__circle">{val}</span>
                        <span className="q-option__label">{LABELS[val-1]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bidang Seni */}
          <section className="section-block">
            <h3 className="section-title">
              <span className="section-icon">🎨</span>
              Bidang Seni yang Diminati <span className="required">*</span>
            </h3>

            {[
              { label: '🎵 Musik', items: ['Vokal', 'Gitar / Bass', 'Piano / Keyboard', 'Perkusi / Drum', 'Instrumen Lainnya'] },
              { label: '💃 Tari', items: ['Tari Tradisional', 'Tari Kontemporer', 'Koreografi'] },
              { label: '🎭 Teater', items: ['Akting / Peran', 'Sutradara', 'Penulisan Naskah'] },
              { label: '🎨 Seni Rupa', items: ['Desain Grafis', 'Ilustrasi / Lukis', 'Fotografi', 'Videografi'] },
            ].map(group => (
              <div key={group.label} className="bidang-group">
                <div className="bidang-group__label">{group.label}</div>
                <div className="checkbox-grid">
                  {group.items.map(b => (
                    <label key={b} className={`checkbox-label ${form.bidangSeni.includes(b) ? 'checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={form.bidangSeni.includes(b)}
                        onChange={() => handleCheckbox('bidangSeni', b)}
                      />
                      <span className="checkbox-box" aria-hidden="true" />
                      {b}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="bidang-group">
              <div className="bidang-group__label">➕ Lainnya</div>
              <div className="checkbox-grid">
                <label className={`checkbox-label ${form.bidangSeni.includes('Lainnya') ? 'checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.bidangSeni.includes('Lainnya')}
                    onChange={() => handleCheckbox('bidangSeni', 'Lainnya')}
                  />
                  <span className="checkbox-box" aria-hidden="true" />
                  Lainnya
                </label>
              </div>
            </div>

            {form.bidangSeni.includes('Lainnya') && (
              <input
                type="text"
                name="bidangLainnya"
                className="field-input mt-sm"
                placeholder="Sebutkan bidang lainnya..."
                value={form.bidangLainnya}
                onChange={handleChange}
              />
            )}
          </section>

          {/* Talent Dikembangkan */}
          <section className="section-block">
            <h3 className="section-title">
              <span className="section-icon">🌟</span> Talent yang Paling Ingin Dikembangkan
            </h3>
            <textarea
              name="talentDikembangkan"
              className="field-textarea"
              placeholder="Ceritakan talent apa yang paling ingin kamu kembangkan di UKM Senja..."
              value={form.talentDikembangkan}
              onChange={handleChange}
              rows={3}
            />
          </section>

          {/* Posisi Organisasi */}
          <section className="section-block">
            <h3 className="section-title">
              <span className="section-icon">🏛️</span>
              Posisi Organisasi yang Diminati <span className="required">*</span>
            </h3>
            <div className="checkbox-grid">
              {POSISI_ORGANISASI.map(p => (
                <label key={p} className={`checkbox-label ${form.posisiOrganisasi.includes(p) ? 'checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.posisiOrganisasi.includes(p)}
                    onChange={() => handleCheckbox('posisiOrganisasi', p)}
                  />
                  <span className="checkbox-box" aria-hidden="true" />
                  {p}
                </label>
              ))}
            </div>
          </section>

          {/* Komentar */}
          <section className="section-block">
            <h3 className="section-title">
              <span className="section-icon">💬</span> Komentar / Saran
            </h3>
            <textarea
              name="komentar"
              className="field-textarea"
              placeholder="Tulis komentar atau saran untuk UKM Senja (opsional)..."
              value={form.komentar}
              onChange={handleChange}
              rows={3}
            />
          </section>

          {errorMsg && (
            <div className="error-banner" role="alert">⚠️ {errorMsg}</div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={handleReset}>
              Reset
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={status === 'loading' || status === 'checking'}
            >
              {status === 'checking' ? '🔍 Mengecek...' :
               status === 'loading' ? '⏳ Menyimpan...' : '✅ Kirim Form'}
            </button>
          </div>
        </form>
      </div>

      <footer className="form-footer">
        <p>© 2025 UKM Seni Jayanusa (Senja) · Data hanya digunakan untuk keperluan pemetaan talent</p>
      </footer>
    </div>
  );
}
