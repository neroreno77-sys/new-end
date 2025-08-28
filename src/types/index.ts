export interface User {
  id: string
  name: string
  password: string
  role: "Admin" | "TU" | "Koordinator" | "Staff"
}

export type ReportStatus = "draft" | "in-progress" | "completed" | "revision-required" | "forwarded-to-tu"

export interface FileAttachment {
  id: string
  fileName: string
  fileUrl: string
  uploadedAt: string
  uploadedBy: string
  type?: "original" | "response" | "revision"
}

export interface TaskAssignment {
  id: string
  staffName: string
  todoList: string[]
  completedTasks: string[]
  progress: number
  status: "pending" | "in-progress" | "completed" | "revision-required"
  notes?: string
  revisionNotes?: string
  needsRevision?: boolean
}

export interface Report {
  id: string
  noSurat: string
  hal: string
  status: ReportStatus
  layanan: string
  dari: string
  tanggalSurat: string
  tanggalAgenda: string
  originalFiles: FileAttachment[]
  assignments: TaskAssignment[]
  workflow: Array<{
    id: string
    action: string
    user: string
    timestamp: string
    status: string
  }>
}

export const SERVICES = [
  "Layanan Perpanjangan Hubungan Kerja PPPK",
  "Layanan Pemutusan Hubungan Kerja PPPK",
  "Layanan Peninjauan Masa Kerja PNS",
  "Layanan Pengangkatan PNS",
  "Layanan Pemensiunan dan Pemberhentian PNS",
  "Layanan Penerbitan SK Tugas Belajar",
  "Layanan Kenaikan Pangkat",
  "Layanan Uji Kompetensi dan Perpindahan Jabatan Fungsional",
  "Layanan Penerbitan Rekomendasi Jabatan Fungsional Binaan KLH/BPLH",
  "Layanan Kenaikan Jenjang Jabatan Fungsional",
  "Layanan Pengangkatan Kembali ke dalam Jabatan Fungsional",
  "Layanan Perpindahan Kelas Jabatan Pelaksana",
  "Layanan Pencantuman Gelar",
  "Layanan Mutasi/Alih Tugas Lingkup KLH/BPLH",
  "Layanan Penugasan PNS pada Instansi Pemerintah dan di Luar Instansi",
  "Layanan Izin untuk Melakukan Perceraian PNS",
  "Layanan Fasilitasi Penganugerahan Tanda Kehormatan oleh Presiden",
  "Layanan Cuti di Luar Tanggungan Negara (CLTN)",
  "Layanan Kartu Istri/Kartu Suami",
  "Layanan Permintaan Data Kepegawaian SIMPEG",
  "Layanan Ralat Nama/NIP pada Aplikasi SIMPEG/SIASN",
  "Layanan Pelatihan Kepemimpinan",
  "Layanan Pengelolaan LHKPN",
  "Layanan Sosialisasi Kebijakan Bidang SDM dan Organisasi",
  "Layanan Perpindahan Jabatan",
  "Layanan Pemberhentian Jabatan Fungsional",
  "Layanan Permohonan Pengambilan Sumpah PNS untuk Koordinator UPT",
  "Layanan Pelantikan Jabatan Fungsional",
]

export const COORDINATORS = ["Suwarti, S.H", "Achamd Evianto", "Adi Sulaksono", "Yosi Yosandi"]

export const STAFF_MEMBERS = [
  "Roza Erlinda",
  "Rita Juwita",
  "Fanni Arlina Sutia",
  "Hendi Inda Karnia",
  "Ainaya Oktaviyanti",
  "Fajar Aris K",
  "Arum Kusuma D",
  "Andryansyah",
  "Ersha R",
  "Ardani Hasan",
  "Siti Nurhaliza",
  "Ahmad Fauzi",
  "Dewi Sartika",
  "Budi Santoso",
  "Rina Marlina",
  "Dedi Kurniawan",
  "Lina Handayani",
  "Agus Setiawan",
  "Maya Sari",
  "Rizki Pratama",
  "Indah Permata",
  "Yoga Aditya",
  "Sari Wulandari",
  "Eko Prasetyo",
]

export const TODO_ITEMS = [
  "Jadwalkan/Agendakan",
  "Bahas dengan saya",
  "Untuk ditindaklanjuti",
  "Untuk diketahui",
  "Siapkan Bahan",
  "Siapkan Jawaban",
  "Diskusikan dengan saya",
  "Hadir Mewakili",
  "Copy Untuk saya",
  "Arsip/File",
]

export const DOCUMENT_REQUIREMENTS: { [key: string]: string[] } = {
  "Layanan Perpanjangan Hubungan Kerja PPPK": [
    "SK PPPK",
    "Perjanjian Kerja PPPK",
    "SKP 1 tahun terakhir",
    "Surat Pertimbangan Perpanjangan dari Unit Kerja",
  ],
  "Layanan Kenaikan Pangkat": [
    "Surat usul unit",
    "SK CPNS",
    "SK PNS",
    "SK Pangkat terakhir",
    "SKP 2 tahun terakhir",
    "Ijazah (untuk penyesuaian)",
    "Daftar riwayat hidup",
  ],
  "Layanan Pensiun": [
    "SK CPNS",
    "SK PNS",
    "SK Pangkat terakhir",
    "SKP terakhir",
    "Surat permohonan & persetujuan atasan",
    "Dokumen pensiun (format BKN)",
    "Surat bebas tanggungan",
  ],
  "Layanan Mutasi": [
    "Surat usulan unit",
    "SK CPNS",
    "SK PNS",
    "SK Pangkat & Jabatan terakhir",
    "SKP 2 tahun terakhir",
    "Surat pernyataan tidak dalam hukuman/tugas belajar",
    "Persetujuan instansi asal & tujuan",
  ],
  "Layanan Cuti": [
    "Surat permohonan CLTN",
    "SK CPNS & PNS",
    "SK Pangkat & Jabatan terakhir",
    "SKP 2 tahun terakhir",
    "Surat pengantar Eselon I",
    "Surat keterangan alasan CLTN",
  ],
}
