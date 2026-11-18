export interface PapiAnswerItem {
  questionNumber: number;
  selectedOption: 'A' | 'B';
  traitCode: string; // e.g. "G", "L", "I", "T", etc.
}

export interface PapiEvaluationResult {
  rawScores: Record<string, number>;
  radarLabels: string[];
  radarValues: number[];
  diagnosticSummary: Array<{
    code: string;
    name: string;
    category: 'ROLE' | 'NEED';
    score: number;
    interpretation: string;
  }>;
}

export class PapiEngine {
  public static readonly TRAIT_DEFINITIONS: Record<string, { name: string; category: 'ROLE' | 'NEED'; descHigh: string; descLow: string }> = {
    G: { name: 'Peran Pekerja Keras', category: 'ROLE', descHigh: 'Pekerja keras, tekun, dan mengerahkan energi tinggi dalam tugas.', descLow: 'Cenderung santai atau bekerja sesuai ritme minimal.' },
    L: { name: 'Peran Kepemimpinan', category: 'ROLE', descHigh: 'Proaktif mengambil inisiatif, memimpin orang lain, dan mengarahkan tim.', descLow: 'Lebih nyaman sebagai pelaksana daripada pengambil komando.' },
    I: { name: 'Kecepatan Mengambil Keputusan', category: 'ROLE', descHigh: 'Cepat dan berani dalam memutuskan tindakan di bawah ketidakpastian.', descLow: 'Sangat berhati-hati, membutuhkan banyak data sebelum memutuskan.' },
    T: { name: 'Tempo dan Kecepatan Kerja', category: 'ROLE', descHigh: 'Menyukai dinamika cepat dan multitasking tinggi.', descLow: 'Menyukai tempo yang teratur, tenang, dan stabil.' },
    V: { name: 'Aktivitas Fisik / Vitalitas', category: 'ROLE', descHigh: 'Energetik, aktif bergerak, dan tangkas.', descLow: 'Lebih menyukai aktivitas menetap di meja kerja.' },
    S: { name: 'Keluasan Sosial', category: 'ROLE', descHigh: 'Mudah bergaul, ramah, dan menikmati interaksi dengan orang baru.', descLow: 'Selektif dalam berteman dan lebih pendiam di kelompok baru.' },
    R: { name: 'Tipe Teoretis / Analitis', category: 'ROLE', descHigh: 'Menyukai pemikiran konseptual, analitis, dan pemecahan masalah.', descLow: 'Lebih menyukai pendekatan praktis dan terapan langsung.' },
    D: { name: 'Ketertarikan pada Detail', category: 'ROLE', descHigh: 'Sangat teliti, presisi, dan memeriksa detail terkecil.', descLow: 'Melihat gambaran besar dan kurang menyukai pekerjaan repetitif.' },
    C: { name: 'Tipe Terorganisir', category: 'ROLE', descHigh: 'Terstruktur, rapi, dan memiliki perencanaan kerja yang metodis.', descLow: 'Fleksibel, adaptif, namun terkadang kurang terstruktur.' },
    E: { name: 'Pengendalian Emosi', category: 'ROLE', descHigh: 'Mampu mengendalikan emosi dengan tenang saat menghadapi tekanan.', descLow: 'Ekspresif, respons emosional tampak secara spontan.' },
    N: { name: 'Kebutuhan Menyelesaikan Tugas', category: 'NEED', descHigh: 'Berorientasi kuat pada penyelesaian pekerjaan hingga tuntas.', descLow: 'Dapat berpindah tugas sebelum satu tugas tuntas jika diperlukan.' },
    A: { name: 'Kebutuhan Berprestasi', category: 'NEED', descHigh: 'Memiliki ambisi tinggi untuk mencapai standar prestasi puncak.', descLow: 'Puas dengan pencapaian standar yang wajar.' },
    P: { name: 'Kebutuhan Mengontrol Orang Lain', category: 'NEED', descHigh: 'Menikmati wewenang, pengawasan, dan memegang kontrol atas hasil tim.', descLow: 'Menghindari mendominasi rekan kerja.' },
    X: { name: 'Kebutuhan Menjadi Pusat Perhatian', category: 'NEED', descHigh: 'Percaya diri tampil di depan umum dan senang diapresiasi.', descLow: 'Rendah hati dan tidak mencari sorotan publik.' },
    B: { name: 'Kebutuhan Menjadi Bagian Kelompok', category: 'NEED', descHigh: 'Sangat menjunjung tinggi kerja sama tim dan kohesi kelompok.', descLow: 'Mandiri dan menyukai pekerjaan individual.' },
    O: { name: 'Kebutuhan Hubungan Dekat', category: 'NEED', descHigh: 'Menginginkan hubungan interpersonal yang akrab dan hangat di tempat kerja.', descLow: 'Mempertahankan batasan profesional yang tegas.' },
    Z: { name: 'Kebutuhan Perubahan & Variasi', category: 'NEED', descHigh: 'Menyukai tantangan baru, variasi tugas, dan suasana dinamis.', descLow: 'Menyukai rutinitas yang terprediksi dan stabil.' },
    K: { name: 'Kebutuhan Sikap Asertif / Agresif', category: 'NEED', descHigh: 'Tegas, lugas, dan berani menghadapi konflik secara terbuka.', descLow: 'Menghindari konfrontasi dan mencari kompromi damai.' },
    F: { name: 'Kebutuhan Dukungan Atasan', category: 'NEED', descHigh: 'Loyal, menghormati arahan atasan, dan mengharapkan bimbingan.', descLow: 'Mandiri dan tidak bergantung pada validasi atasan.' },
    W: { name: 'Kebutuhan Aturan & Pengawasan', category: 'NEED', descHigh: 'Disiplin tinggi terhadap SOP dan regulasi perusahaan.', descLow: 'Menyukai keleluasaan improvisasi di luar aturan baku.' },
  };

  /**
   * Menghitung skor dari jawaban PAPI-Kostick
   */
  public static evaluate(answers: PapiAnswerItem[]): PapiEvaluationResult {
    // Inisialisasi 20 dimensi
    const rawScores: Record<string, number> = {};
    for (const code of Object.keys(this.TRAIT_DEFINITIONS)) {
      rawScores[code] = 0;
    }

    // Akumulasi skor berdasarkan traitCode
    for (const ans of answers) {
      if (rawScores[ans.traitCode] !== undefined) {
        rawScores[ans.traitCode] += 1;
      }
    }

    const radarLabels = Object.keys(this.TRAIT_DEFINITIONS).map((code) => `${code} - ${this.TRAIT_DEFINITIONS[code].name.split(' ')[1] || code}`);
    const radarValues = Object.keys(this.TRAIT_DEFINITIONS).map((code) => rawScores[code]);

    const diagnosticSummary = Object.keys(this.TRAIT_DEFINITIONS).map((code) => {
      const def = this.TRAIT_DEFINITIONS[code];
      const score = rawScores[code];
      const interpretation = score >= 5 ? def.descHigh : def.descLow;

      return {
        code,
        name: def.name,
        category: def.category,
        score,
        interpretation,
      };
    });

    return {
      rawScores,
      radarLabels,
      radarValues,
      diagnosticSummary,
    };
  }

  /**
   * Menyediakan kuesioner demo 10 pasang pertanyaan standar representatif
   */
  public static getSampleQuestions() {
    return [
      {
        id: 1,
        optionA: { text: 'Saya seorang pekerja yang tidak kenal lelah.', traitCode: 'G' },
        optionB: { text: 'Saya suka mengambil inisiatif untuk memimpin orang lain.', traitCode: 'L' },
      },
      {
        id: 2,
        optionA: { text: 'Saya cepat dalam mengambil keputusan penting.', traitCode: 'I' },
        optionB: { text: 'Saya menyukai pekerjaan yang bertempo cepat dan dinamis.', traitCode: 'T' },
      },
      {
        id: 3,
        optionA: { text: 'Saya sangat memperhatikan detail dan akurasi data.', traitCode: 'D' },
        optionB: { text: 'Saya selalu merencanakan pekerjaan saya secara terstruktur.', traitCode: 'C' },
      },
      {
        id: 4,
        optionA: { text: 'Saya mampu mengendalikan emosi di bawah situasi menekan.', traitCode: 'E' },
        optionB: { text: 'Saya bertekad menyelesaikan tugas apa pun sampai tuntas.', traitCode: 'N' },
      },
      {
        id: 5,
        optionA: { text: 'Saya memiliki ambisi kuat untuk menjadi yang terbaik.', traitCode: 'A' },
        optionB: { text: 'Saya suka memegang kontrol atas alur kerja tim.', traitCode: 'P' },
      },
      {
        id: 6,
        optionA: { text: 'Saya menikmati saat diperhatikan dan diapresiasi orang lain.', traitCode: 'X' },
        optionB: { text: 'Saya sangat mengutamakan kebersamaan dalam kelompok.', traitCode: 'B' },
      },
      {
        id: 7,
        optionA: { text: 'Saya senang menjalin hubungan pertemanan yang hangat di kantor.', traitCode: 'O' },
        optionB: { text: 'Saya antusias mencoba cara-cara baru yang belum pernah dicoba.', traitCode: 'Z' },
      },
      {
        id: 8,
        optionA: { text: 'Saya berani mengutarakan pendapat secara tegas meskipun berseberangan.', traitCode: 'K' },
        optionB: { text: 'Saya menghormati arahan dan bimbingan dari atasan saya.', traitCode: 'F' },
      },
      {
        id: 9,
        optionA: { text: 'Saya selalu mematuhi aturan dan regulasi yang telah ditetapkan.', traitCode: 'W' },
        optionB: { text: 'Saya mudah bergaul dan memulai percakapan dengan siapa pun.', traitCode: 'S' },
      },
      {
        id: 10,
        optionA: { text: 'Saya menyukai pemecahan masalah yang menuntut logika mendalam.', traitCode: 'R' },
        optionB: { text: 'Saya selalu bersemangat dan memiliki stamina fisik yang prima.', traitCode: 'V' },
      },
    ];
  }
}
