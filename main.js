const API_BASE = 'https://script.google.com/macros/s/AKfycby9rHqr-oK_dIsGjU5hR7090nvmy2eUGAwXsWS1lNu3Iq66SW1poENTqH4--TqF8ls/exec';

document.addEventListener('DOMContentLoaded', showHome);

async function showHome() {
  const content = document.getElementById('main-content');
  content.innerHTML = `
    <h1>Selamat Datang di Dashboard Program Magister Program Studi Teknik Geomatika FT UGM</h1>
    <h2>Rekap Nilai SO dan PI</h2>
    <div style="max-width: 800px; margin-bottom: 40px; min-height: 300px;">
      <canvas id="soChart"></canvas>
    </div>
    <div style="max-width: 600px; margin-top: 40px; min-height: 300px;">
      <canvas id="soRadarChart"></canvas>
    </div>
    <div style="max-width: 800px; margin-top: 40px; min-height: 300px;">
      <canvas id="piChart"></canvas>
    </div>
  `;

  const res = await fetch(`${API_BASE}?view=Rekap SO`);
  const data = await res.json();

  // const soLabels = data.map(d => d.SO);
  let soLabels = data.map(d => d.SO); // use `let` instead of `const`
  soLabels = soLabels.slice(0, 8).map((label, i) => `SO-${String.fromCharCode(97 + i)}`);
  const soValues = data.map(d => Number(d.SO_Nilai) * 100);
  const piLabels = data.map(d => d.PI);
  const piValues = data.map(d => Number(d.PI_Nilai) * 100);
  const thresholdSO = Array(soLabels.length).fill(70);
  const thresholdPI = Array(piLabels.length).fill(70);

  new Chart(document.getElementById('soChart'), {
    type: 'bar',
    data: {
      labels: soLabels.slice(0, 8),
      datasets: [
        {
          label: 'Nilai SO',
          data: soValues.slice(0, 8),
          backgroundColor: '#1565c0'
        },
        {
          label: 'Standar (70)',
          data: thresholdSO,
          borderColor: 'rgba(255, 193, 7, 1)',
          borderDash: [5, 5],
          fill: false,
          type: 'line',
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 10 },
          grid: { drawOnChartArea: true }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });

  new Chart(document.getElementById('soRadarChart'), {
    type: 'radar',
    data: {
      labels: soLabels.slice(0, 8),
      datasets: [
        {
          label: 'Nilai SO',
          data: soValues.slice(0, 8),
          backgroundColor: 'rgba(21, 101, 192, 0.2)',
          borderColor: '#1565c0',
          pointBackgroundColor: '#1565c0',
          fill: true
        },
        {
          label: 'Standar (70)',
          data: thresholdSO.slice(0, 8),
          borderColor: 'rgba(255, 193, 7, 1)',
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 10 },
          grid: { circular: true },
          angleLines: { color: '#ccc' },
          pointLabels: { font: { size: 12 } }
        }
      }
    }
  });

  new Chart(document.getElementById('piChart'), {
    type: 'bar',
    data: {
      labels: piLabels,
      datasets: [
        {
          label: 'Nilai PI',
          data: piValues,
          backgroundColor: '#2e7d32'
        },
        {
          label: 'Standar (70)',
          data: thresholdPI,
          borderColor: 'rgba(255, 193, 7, 1)',
          borderDash: [5, 5],
          fill: false,
          type: 'line',
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 10 },
          grid: { drawOnChartArea: true }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });

  content.insertAdjacentHTML('beforeend', `
    <h2>CPL Magister Teknik Geomatika</h2>
    <div style="overflow-x: auto; border: 1px solid #ccc; border-radius: 8px;">
      <iframe 
        src="https://docs.google.com/spreadsheets/d/e/2PACX-1vSOI_sBcVQtLawTdjdy7XgebEbsWH1PtErSsrk4Ku92V6FsyK12p15Uvo35aUSS0KGoGhoUxgHhCi3-/pubhtml?gid=720812548&single=true"
        width="100%" 
        height="600px" 
        style="border: none; min-width: 1000px;">
      </iframe>
    </div>
  `);
}

async function loadCourses() {
  const content = document.getElementById('main-content');
  content.innerHTML = '<p>Loading data...</p>'; 
  const res = await fetch(`${API_BASE}?view=MK`);
  const rawCourses = await res.json();
  content.innerHTML = '<h2>Mata Kuliah</h2>';

  // Group courses by its properties
  const grouped = {};
  rawCourses.forEach(course => {
    const sifat = `Sifat ${course["Sifat"]}`;
    if (!grouped[sifat]) grouped[sifat] = [];
    grouped[sifat].push(course);
  });

  for (let sifat in grouped) {
    content.innerHTML += `<div class="course-block"><h3>${sifat}</h3>`;
    grouped[sifat].forEach((c, index) => {
      content.innerHTML += `
        <div class="course-item">
          <div>${index + 1}.</div>
          <div>${c["Kode MK"]}</div>
          <div>${c["Nama MK"]}</div>
          <div>${c["SKS"]} SKS</div>
          <div class="course-link"><a href="${c["RPKPS"]}" target="_blank">RPKPS</a></div>
        </div>`;
    });
    content.innerHTML += `</div>`;
  }
}

async function loadStudents(year = '') {
  const content = document.getElementById('main-content');
  content.innerHTML = '<p>Loading data...</p>'; 
  let url = `${API_BASE}?view=Mahasiswa`;
  if (year) url += `&year=${year}`;
  const students = await fetch(url).then(res => res.json());

  content.innerHTML = '<h2>Mahasiswa</h2>';

  content.innerHTML += `<div class="student-filters">
    <button onclick="loadStudents('2022')">2022</button>
    <button onclick="loadStudents('2023')">2023</button>
    <button onclick="loadStudents('2024')">2024</button>
    <button onclick="loadStudents()">All</button>
  </div>`;

  if (students.length === 0) {
    content.innerHTML += `<p>Tidak ada data.</p>`;
    return;
  }

  content.innerHTML += `
    <div class="student-item" style="font-weight: bold; border-bottom: 2px solid #ccc; margin-top: 10px; padding-bottom: 5px;">
        <div>No</div>
        <div>Nama Mahasiswa</div>
        <div>NIM</div>
        <div>Tahun</div>
    </div>
    `;
  
  students.forEach((s, index) => {
    content.innerHTML += `
      <div class="student-item">
        <div>${index + 1}.</div>
        <div>${s["Nama Mahasiswa"]}</div>
        <div>${s["NIM"]}</div>
        <div>${s["Tahun Masuk"]}</div>
      </div>`;
  });
}

function loadCurriculumMap() {
const content = document.getElementById('main-content');
content.innerHTML = `
    <h2>Peta Kurikulum</h2>
    <p>Tabel berikut menampilkan peta kurikulum antara mata kuliah dan capaian pembelajaran lulusan.</p>
    <div style="overflow: auto; border: 1px solid #ccc; border-radius: 8px;">
    <iframe 
        src="https://docs.google.com/spreadsheets/d/e/2PACX-1vSOI_sBcVQtLawTdjdy7XgebEbsWH1PtErSsrk4Ku92V6FsyK12p15Uvo35aUSS0KGoGhoUxgHhCi3-/pubhtml?gid=1629814655&single=true"
        width="100%" 
        height="600px" 
        style="border: none;">
    </iframe>
    </div>
`;

content.insertAdjacentHTML('beforeend', `
    <h2>CPL Magister Teknik Geomatika</h2>
    <div style="overflow: auto; border: 1px solid #ccc; border-radius: 8px;">
    <iframe 
        src="https://docs.google.com/spreadsheets/d/e/2PACX-1vSOI_sBcVQtLawTdjdy7XgebEbsWH1PtErSsrk4Ku92V6FsyK12p15Uvo35aUSS0KGoGhoUxgHhCi3-/pubhtml?gid=720812548&single=true"
        width="100%" 
        height="600px" 
        style="border: none;">
    </iframe>
    </div>
  `);
}

function loadScores() {
const content = document.getElementById('main-content');
content.innerHTML = `
    <h2>Nilai Mata Kuliah</h2>
    <p>Tabel berikut menampilkan nilai mahasiswa per mata kuliah per capaian pembelajaran lulusan</p>
    <div style="overflow: auto; border: 1px solid #ccc; border-radius: 8px;">
    <iframe 
        src="https://docs.google.com/spreadsheets/d/e/2PACX-1vSOI_sBcVQtLawTdjdy7XgebEbsWH1PtErSsrk4Ku92V6FsyK12p15Uvo35aUSS0KGoGhoUxgHhCi3-/pubhtml?gid=364854011&single=true"
        width="100%" 
        height="600px" 
        style="border: none;">
    </iframe>
    </div>
`;
}

function toggleDropdown() {
  const dropdown = document.getElementById('portofolio-dropdown');
  dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
}

function PortofolioProdi() {
const content = document.getElementById('main-content');
content.innerHTML = `
    <h2>Portofolio Program Studi</h2>
    <p>Tabel berikut menunjukkan rekapitulasi nilai capaian pembelajaran lulusan untuk setiap mata kuliah</p>
        
    <div class="year-buttons">
      <button onclick="switchIframe('2024')">2024</button>
      <button onclick="switchIframe('2023')">2023</button>
      <button onclick="switchIframe('2022')">2022</button>
    </div>

    <div style="overflow: auto; border: 1px solid #ccc; border-radius: 8px; margin-top: 15px;">
      <iframe 
        id="prodiIframe"
        src="https://docs.google.com/spreadsheets/d/e/2PACX-1vSOI_sBcVQtLawTdjdy7XgebEbsWH1PtErSsrk4Ku92V6FsyK12p15Uvo35aUSS0KGoGhoUxgHhCi3-/pubhtml?gid=196813266&single=true"
        width="100%" 
        height="600px" 
        style="border: none;">
      </iframe>
    </div>
  `;
}

function switchIframe(year) {
  const iframe = document.getElementById('prodiIframe');

  const sources = {
    "2024": "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOI_sBcVQtLawTdjdy7XgebEbsWH1PtErSsrk4Ku92V6FsyK12p15Uvo35aUSS0KGoGhoUxgHhCi3-/pubhtml?gid=196813266&single=true",
    "2023": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQas6fTd9TGzvMuMUrgWLuPNrpHj76PJbEbM3T4RHEXm-iuDO-J1on8MclxVLZDV4q8suAthYwwMfOg/pubhtml?gid=0&single=true",
    "2022": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQas6fTd9TGzvMuMUrgWLuPNrpHj76PJbEbM3T4RHEXm-iuDO-J1on8MclxVLZDV4q8suAthYwwMfOg/pubhtml?gid=1938360914&single=true"
  };

  iframe.src = sources[year];
}

async function PortofolioMK() {
  const content = document.getElementById('main-content');
  content.innerHTML = '<p>Loading data...</p>';

  const res = await fetch('https://script.google.com/macros/s/AKfycbzq0LvssnAI9ZTCf6NkTo8qOmLj9uVWpi1HTPzyrlq6-oL8gURzAZDBJh4yhWAzXVHQ/exec');
  const data = await res.json();

  const grouped = {};
  data.forEach(entry => {
    if (!grouped[entry.Tahun]) grouped[entry.Tahun] = [];
    grouped[entry.Tahun].push(entry);
  });

  content.innerHTML = '<h2>Portofolio Mata Kuliah</h2>';
  for (const year in grouped) {
    content.innerHTML += `<div class="portfolio-block">
      <div class="portfolio-year">${year}</div>`;

    grouped[year].forEach((d, index) => {
      content.innerHTML += `
        <div class="portfolio-card">
          <div>${index + 1}.</div>
          <div>${d.Kode}</div>
          <div>${d.Nama}</div>
          <div><button onclick="openPortfolioDetail('${d.Tahun}', '${d.Kode}')">Lihat Portofolio</button></div>
        </div>`;
    });

    content.innerHTML += `</div>`;
  }

  // Save full data globally
  window._portfolioData = data;
}

function openPortfolioDetail(tahun, kode) {
  const data = window._portfolioData.find(d =>
    String(d.Tahun).trim() === String(tahun).trim() &&
    String(d.Kode).trim() === String(kode).trim()
  );

  if (!data) {
    alert("Data tidak ditemukan.");
    return;
  }
  const content = document.getElementById('main-content');

  const soLabels = Object.keys(data.SO);
  const soValues = soLabels.map(k => Number(data.SO[k]) * 100);
  const piLabels = Object.keys(data.PI);
  const piValues = piLabels.map(k => Number(data.PI[k]) * 100);
  const threshold = Array(soLabels.length).fill(70);
  const thresholdpi = Array(piLabels.length).fill(70);

  content.innerHTML = `<h2>${data.Nama} (${data.Kode})</h2>
    <div style="max-width: 800px; margin-bottom: 40px;">
      <canvas id="soChart"></canvas>
    </div>
    <div style="max-width: 800px;">
      <canvas id="piChart"></canvas>
    </div>`;

  new Chart(document.getElementById('soChart'), {
    type: 'bar',
    data: {
      labels: soLabels,
      datasets: [
        {
          label: 'Capaian',
          data: soValues,
          backgroundColor: 'darkred'
        },
        {
          label: 'Standar',
          data: threshold,
          borderColor: 'rgba(255, 193, 7, 1)',
          borderDash: [5, 5],
          fill: false,
          type: 'line',
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });

  new Chart(document.getElementById('piChart'), {
    type: 'bar',
    data: {
      labels: piLabels,
      datasets: [
        {
          label: 'Capaian PI',
          data: piValues,
          backgroundColor: '#2e7d32'
        },
        {
          label: 'Standar',
          data: thresholdpi,
          borderColor: 'rgba(255, 193, 7, 1)',
          borderDash: [5, 5],
          fill: false,
          type: 'line',
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
}

async function PortofolioMahasiswa() {
  const content = document.getElementById('main-content');
  content.innerHTML = '<p>Loading data...</p>';

  const res = await fetch('https://script.google.com/macros/s/AKfycbz6P_hKMNZzBUlY5b1miMkDQn_YNku1KXlQlLZk2fy6YmlXNlz6-TlcOXvnG6SSyQu0-Q/exec');
  const portofolioMahasiswa = await res.json();

  const grouped = {};
  portofolioMahasiswa.forEach(entry => {
    if (!grouped[entry.Tahun]) grouped[entry.Tahun] = [];
    grouped[entry.Tahun].push(entry);
  });

  content.innerHTML = '<h2>Portofolio Mahasiswa</h2>';
  for (const year in grouped) {
    content.innerHTML += `<div class="portfolio-block">
      <div class="portfolio-year">${year}</div>`;

    grouped[year].forEach((student, index) => {
      content.innerHTML += `
        <div class="portfolio-card">
          <div>${index + 1}</div>
          <div>${student.Nama}</div>
          <div>${student.NIM}</div>
          <div><button onclick="openStudentPortfolio('${student.NIM}')">Lihat</button></div>
        </div>`;
    });

    content.innerHTML += `</div>`; // close portfolio-block
  }

  window._studentPortfolio = portofolioMahasiswa;
}

function openStudentPortfolio(nim) {
  const student = window._studentPortfolio.find(s => s.NIM === nim);
  if (!student) {
    alert('Data tidak ditemukan.');
    return;
  }

  const content = document.getElementById('main-content');
  const labels = Object.keys(student.SO);
  const values = labels.map(label => Number(student.SO[label]));
  const threshold = Array(labels.length).fill(70);

  content.innerHTML = `
    <h2>Portofolio Mahasiswa</h2>
    <p><strong>${student.Nama}</strong> (${student.NIM}) - Angkatan ${student.Tahun}</p>
    <div style="max-width: 800px;">
      <canvas id="studentSOChart"></canvas>
    </div>`;

  new Chart(document.getElementById('studentSOChart'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Standar',
          data: threshold,
          borderColor: 'rgba(255, 193, 7, 1)',
          borderDash: [5, 5],
          fill: false,
          type: 'line',
          pointRadius: 0
        },
        {
          label: 'Capaian',
          data: values,
          backgroundColor: '#2e7d32'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}
