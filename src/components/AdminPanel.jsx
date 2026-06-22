import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import logo from '../assets/Untitled design.png';

const QUESTIONS = [
  'Kemampuan seni (musik, tari, teater, sastra, dll.)',
  'Percaya diri tampil di depan umum',
  'Mampu bekerja sama dalam tim',
  'Kemampuan memimpin dan mengarahkan',
  'Tertarik administrasi & pengelolaan organisasi',
  'Kemampuan desain grafis atau publikasi',
  'Kemampuan fotografi atau videografi',
  'Kemampuan berkomunikasi dengan baik',
  'Tertarik mengelola / merancang acara (event)',
  'Siap mengembangkan potensi untuk UKM Senja',
];

export default function AdminPanel({ onLogout }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null); // detail modal
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'talent_responses'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setResponses(data);
    } catch (err) {
      console.error('Gagal mengambil data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Filter ---
  const filtered = responses.filter(r =>
    r.nama?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Total score helper ---
  const totalScore = (scores) =>
    Object.values(scores || {}).reduce((s, v) => s + Number(v), 0);

  // --- Format tanggal ---
  const formatDate = (ts) => {
    if (!ts) return '-';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  };

  // --- Export Excel ---
  const exportExcel = () => {
    const rows = responses.map((r, i) => {
      const row = {
        No: i + 1,
        'Nomor BP': r.nomorBP || '-',
        Nama: r.nama,
        'Total Skor': totalScore(r.scores),
        'Tanggal Isi': formatDate(r.createdAt),
      };
      QUESTIONS.forEach((q, qi) => {
        row[`Q${qi + 1}: ${q}`] = r.scores?.[qi + 1] ?? '-';
      });
      row['Bidang Seni Diminati'] = (r.bidangSeni || []).join(', ');
      row['Talent Ingin Dikembangkan'] = r.talentDikembangkan || '';
      row['Posisi Diminati'] = (r.posisiOrganisasi || []).join(', ');
      row['Komentar/Saran'] = r.komentar || '';
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);

    // Auto column width
    const colWidths = Object.keys(rows[0] || {}).map(key => ({
      wch: Math.max(key.length, 15),
    }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Talent Mapping');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `Pemetaan_Talent_UKM_Senja_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // --- Delete ---
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'talent_responses', id));
      setResponses(prev => prev.filter(r => r.id !== id));
      setDeleteConfirm(null);
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      console.error('Gagal hapus:', err);
    }
  };

  const avgScore = responses.length
    ? (responses.reduce((s, r) => s + totalScore(r.scores), 0) / responses.length).toFixed(1)
    : 0;

  return (
    <div className="admin-page">
      {/* Admin Header */}
      <div className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <img src={logo} alt="" className="admin-logo" />
            <div>
              <span className="admin-title">Panel Admin</span>
              <span className="admin-subtitle">UKM Seni Jayanusa · Pemetaan Talent</span>
            </div>
          </div>
          <button className="btn-logout" onClick={onLogout}>🔒 Keluar</button>
        </div>
      </div>

      <div className="admin-container">
      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value">{responses.length}</span>
          <span className="stat-label">Total Responden</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{avgScore}</span>
          <span className="stat-label">Rata-rata Skor</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">50</span>
          <span className="stat-label">Skor Maksimum</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Cari nama..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <div className="toolbar-actions">
          <button className="btn-secondary" onClick={fetchData} disabled={loading}>
            {loading ? '⏳ Memuat...' : '🔄 Refresh'}
          </button>
          <button
            className="btn-excel"
            onClick={exportExcel}
            disabled={responses.length === 0}
          >
            📥 Export Excel
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Memuat data...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <p>{searchQuery ? 'Tidak ada hasil pencarian.' : 'Belum ada data responden.'}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{width:'40px'}}>No</th>
                <th style={{width:'100px'}}>Nomor BP</th>
                <th>Nama</th>
                <th style={{width:'90px'}}>Skor</th>
                <th>Bidang Seni</th>
                <th>Posisi Diminati</th>
                <th style={{width:'130px'}}>Tanggal</th>
                <th style={{width:'110px'}}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const score = totalScore(r.scores);
                const pct = Math.round((score / 50) * 100);
                const bidang = r.bidangSeni || [];
                const posisi = r.posisiOrganisasi || [];
                return (
                  <tr key={r.id}>
                    <td className="td-center">{i + 1}</td>
                    <td className="td-bp">{r.nomorBP || '-'}</td>
                    <td className="td-nama">{r.nama}</td>
                    <td className="td-center">
                      <div className="score-cell">
                        <span className={`score-badge ${pct >= 80 ? 'high' : pct >= 60 ? 'mid' : 'low'}`}>
                          {score}/50
                        </span>
                        <div className="score-bar">
                          <div className="score-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="td-tags-inline">
                      {bidang.slice(0, 1).map(b => (
                        <span key={b} className="tag tag-truncate">{b}</span>
                      ))}
                      {bidang.length > 1 && (
                        <span className="tag tag-more">+{bidang.length - 1}</span>
                      )}
                    </td>
                    <td className="td-tags-inline">
                      {posisi.slice(0, 1).map(p => (
                        <span key={p} className="tag tag-pos tag-truncate">{p}</span>
                      ))}
                      {posisi.length > 1 && (
                        <span className="tag tag-more">+{posisi.length - 1}</span>
                      )}
                    </td>
                    <td className="td-date">{formatDate(r.createdAt)}</td>
                    <td className="td-actions">
                      <button className="btn-detail" onClick={() => setSelected(r)}>Detail</button>
                      <button className="btn-delete" onClick={() => setDeleteConfirm(r.id)}>Hapus</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detail: {selected.nama}</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h4>Penilaian Diri</h4>
                {QUESTIONS.map((q, qi) => (
                  <div key={qi} className="modal-q-row">
                    <span className="modal-q-text">{qi + 1}. {q}</span>
                    <span className="modal-q-score">
                      {[1,2,3,4,5].map(v => (
                        <span
                          key={v}
                          className={`dot ${selected.scores?.[qi+1] === v ? 'dot-active' : ''}`}
                        >
                          {v}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
                <div className="modal-total">
                  Total Skor: <strong>{totalScore(selected.scores)} / 50</strong>
                </div>
              </div>

              <div className="modal-section">
                <h4>Bidang Seni Diminati</h4>
                <div className="tag-list">
                  {(selected.bidangSeni || []).map(b => <span key={b} className="tag">{b}</span>)}
                </div>
              </div>

              {selected.talentDikembangkan && (
                <div className="modal-section">
                  <h4>Talent yang Ingin Dikembangkan</h4>
                  <p className="modal-text">{selected.talentDikembangkan}</p>
                </div>
              )}

              <div className="modal-section">
                <h4>Posisi Organisasi Diminati</h4>
                <div className="tag-list">
                  {(selected.posisiOrganisasi || []).map(p => <span key={p} className="tag tag-pos">{p}</span>)}
                </div>
              </div>

              {selected.komentar && (
                <div className="modal-section">
                  <h4>Komentar / Saran</h4>
                  <p className="modal-text">{selected.komentar}</p>
                </div>
              )}

              <p className="modal-date">Dikirim: {formatDate(selected.createdAt)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-card modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Konfirmasi Hapus</h3>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Apakah kamu yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Batal</button>
                <button className="btn-delete-confirm" onClick={() => handleDelete(deleteConfirm)}>
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
