// Títulos dinámicos en la página
const titulos = ["Trabajo práctico", "Predicción de Heladas", "Análisis de Datos Climáticos", "Introducción a las metodologías y procesos de Ciencia de Datos"];
let indice = 0;

const actualizarTitulos = () => {
  indice = (indice + 1) % titulos.length;
  document.title = titulos[indice];
  const elemento = document.getElementById('proyecto-dinamico');
  if (elemento) {
    elemento.style.opacity = '0.5';
    setTimeout(() => {
      elemento.textContent = titulos[indice];
      elemento.style.transition = 'opacity 0.5s ease';
      elemento.style.opacity = '0.9';
    }, 300);
  }
};

setInterval(actualizarTitulos, 3000);

// Scroll suave para los enlaces
document.querySelectorAll('a[href^="#"]').forEach(enlace => {
  enlace.addEventListener('click', (e) => {
    e.preventDefault();
    const destino = document.querySelector(enlace.getAttribute('href'));
    if (destino) {
      destino.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Animación de entrada para elementos al hacer scroll
const observador = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, {
  threshold: 0.1
});

document.querySelectorAll('.card-item, .info-box').forEach(elemento => {
  elemento.style.opacity = '0';
  elemento.style.transform = 'translateY(20px)';
  elemento.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observador.observe(elemento);
});

// ============ DATOS Y GRÁFICOS INTERACTIVOS CON PLOTLY ============

const tpData = {
  g1: null,
  g2: null,
  g4: null,
  g5: null,
  g6: null,
  g8: null,
  g9: null
};

async function fetchJson(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.warn(`No se pudo cargar ${path}:`, error);
    return null;
  }
}

async function fetchText(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    return await response.text();
  } catch (error) {
    console.warn(`No se pudo cargar ${path}:`, error);
    return null;
  }
}

window.addEventListener('load', async () => {
  await cargarDatosTP();
  crearGraficos();
  initVizSelector();
  initImageZoom();
});

function initVizSelector() {
  const buttons = document.querySelectorAll('#viz-selector [data-panel]');
  const panels = document.querySelectorAll('.viz-panel');
  if (!buttons.length || !panels.length) return;

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const panelId = button.dataset.panel;
      buttons.forEach(item => item.classList.remove('active'));
      panels.forEach(panel => panel.classList.toggle('active', panel.id === panelId));
      button.classList.add('active');
    });
  });
}

function initImageZoom() {
  const images = document.querySelectorAll('#viz img');
  const lightbox = document.getElementById('image-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');

  if (!lightbox || !lightboxImg || !closeBtn) return;

  const openLightbox = (src, alt) => {
    lightboxImg.src = src;
    lightboxImg.alt = alt || 'Vista ampliada';
    lightboxImg.classList.remove('zoomed');
    lightboxImg.style.transformOrigin = 'center center';
    lightbox.classList.add('visible');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('visible');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxImg.classList.remove('zoomed');
    lightboxImg.style.transformOrigin = 'center center';
  };

  const toggleZoom = (event) => {
    event.stopPropagation();
    const img = lightboxImg;
    const rect = img.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    const posX = (offsetX / rect.width) * 100;
    const posY = (offsetY / rect.height) * 100;

    if (img.classList.contains('zoomed')) {
      img.classList.remove('zoomed');
      img.style.transformOrigin = 'center center';
    } else {
      img.classList.add('zoomed');
      img.style.transformOrigin = `${posX}% ${posY}%`;
    }
  };


  const vizContainer = document.getElementById('viz');
  if (vizContainer) {
    vizContainer.addEventListener('click', (e) => {
      const clicked = e.target;
      if (clicked && clicked.tagName === 'IMG') {
        openLightbox(clicked.src, clicked.alt);
      }
    });
  } else {
    images.forEach(img => {
      img.addEventListener('click', () => openLightbox(img.src, img.alt));
    });
  }

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  closeBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    closeLightbox();
  });

  lightboxImg.addEventListener('click', toggleZoom);
}

async function cargarDatosTP() {
  const [g1, g2, g4, g5, g6, g8, g9] = await Promise.all([
    fetchJson('src/tablasydatos/g1_tabla_resumen_eda.json'),
    fetchJson('src/tablasydatos/g2_tabla_estadisticas_descriptivas.json'),
    fetchJson('src/tablasydatos/g4_tabla_frecuencias.json'),
    fetchJson('src/tablasydatos/g5_grafico_barra_distribucion_mensual.json'),
    fetchJson('src/tablasydatos/g6_tabla_estadisticas_temperatura_estacion.json'),
    fetchJson('src/tablasydatos/g8_tabla_correlacion_de_pearson.json'),

  ]);

  tpData.g1 = g1;
  tpData.g2 = g2;
  tpData.g4 = g4;
  tpData.g5 = g5;
  tpData.g6 = g6;
  tpData.g8 = g8;
  tpData.g9 = g9;

  if (g1) renderG1(g1);
  if (g2) renderG2(g2);
  if (g4) renderG4(g4);
  if (g6) renderG6(g6);
  if (g8) renderG8(g8);
  if (g9) renderG9(g9);
}

function renderG1(data) {
  const wrapper = document.getElementById('g1-content');
  if (!wrapper) return;

  const categorias = data.tables?.variables_analisis || [];
  if (!categorias.length) {
    wrapper.textContent = 'No hay resumen disponible en g1.';
    return;
  }

  const rows = categorias.map(item => {
    const variables = item.variables
      ? Array.isArray(item.variables)
        ? item.variables.join(', ')
        : item.variables
      : '-';
    const analisis = item.analisis_estadistico
      ? `${item.analisis_estadistico.tipo || ''}${item.analisis_estadistico.medidas ? ` (${item.analisis_estadistico.medidas.join(', ')})` : ''}`
      : '-';
    const graficos = item.graficos?.map(g => g.label || g.tipo).join(', ') || '-';
    return `
      <tr>
        <td>${item.categoria || item.descripcion || 'N/A'}</td>
        <td>${analisis}</td>
        <td>${graficos}</td>
        <td>${item.objetivo || '-'}</td>
      </tr>
    `;
  }).join('');

  wrapper.innerHTML = `
    <div style="overflow-x:auto;">
      <table class="table table-sm table-striped" style="margin-bottom: 0;">
        <thead>
          <tr>
            <th>Categoría</th>
            <th>Análisis estadístico</th>
            <th>Gráficos</th>
            <th>Objetivo</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderG2(data) {
  const wrapper = document.getElementById('g2-table-wrapper');
  if (!wrapper) return;

  const stats = data.estadisticas_descriptivas || {};
  const variables = Object.keys(stats);
  if (!variables.length) {
    wrapper.textContent = 'No hay estadísticas descriptivas disponibles.';
    return;
  }

  const rows = variables.map(variable => {
    const item = stats[variable];
    return `
      <tr>
        <td>${variable}</td>
        <td>${item.count ?? '-'}</td>
        <td>${item.mean ?? '-'}</td>
        <td>${item.std ?? '-'}</td>
        <td>${item.minimo ?? item.min ?? '-'}</td>
        <td>${item.q1_25 ?? item.q1 ?? '-'}</td>
        <td>${item.median_50 ?? item.median ?? '-'}</td>
        <td>${item.q3_75 ?? item.q3 ?? '-'}</td>
        <td>${item.maximo ?? item.max ?? '-'}</td>
      </tr>
    `;
  }).join('');

  wrapper.innerHTML = `
    <div style="overflow-x:auto;">
      <table class="table table-sm table-striped" style="margin-bottom: 0;">
        <thead>
          <tr>
            <th>Variable</th>
            <th>Count</th>
            <th>Media</th>
            <th>Desvío</th>
            <th>Mín</th>
            <th>Q1</th>
            <th>Mediana</th>
            <th>Q3</th>
            <th>Máx</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderG4(data) {
  const wrapper = document.getElementById('g4-table-wrapper');
  if (!wrapper) return;

  const categorias = data.helada_distribution?.categorias || data.charts_ready?.bar_chart || [];
  if (!categorias.length) {
    wrapper.textContent = 'No hay frecuencias disponibles.';
    return;
  }

  const rows = categorias.map(item => `
    <tr>
      <td>${item.label ?? item.categoria ?? item.name ?? 'N/A'}</td>
      <td>${item.frecuencia_absoluta_horas ?? item.cantidad ?? item.value ?? '-'}</td>
      <td>${item.frecuencia_relativa_porcentaje ?? item.porcentaje ?? '-'}</td>
    </tr>
  `).join('');

  wrapper.innerHTML = `
    <div style="overflow-x:auto;">
      <table class="table table-sm table-striped" style="margin-bottom: 0;">
        <thead>
          <tr>
            <th>Clase</th>
            <th>Horas</th>
            <th>Porcentaje</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderG6(data) {
  const wrapper = document.getElementById('g6-table-wrapper');
  if (!wrapper) return;

  const temporadas = data.temperature_statistics_by_season || [];
  if (!temporadas.length) {
    wrapper.textContent = 'No hay estadísticas por estación disponibles.';
    return;
  }

  const rows = temporadas.map(item => `
    <tr>
      <td>${item.season}</td>
      <td>${item.media ?? '-'}</td>
      <td>${item.mediana ?? '-'}</td>
      <td>${item.minimo ?? '-'}</td>
      <td>${item.maximo ?? '-'}</td>
    </tr>
  `).join('');

  wrapper.innerHTML = `
    <div style="overflow-x:auto;">
      <table class="table table-sm table-striped" style="margin-bottom: 0;">
        <thead>
          <tr>
            <th>Estación</th>
            <th>Media</th>
            <th>Mediana</th>
            <th>Mín</th>
            <th>Máx</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderG8(data) {
  const wrapper = document.getElementById('g8-table-wrapper');
  if (!wrapper) return;

  const rows = data.map(row => `
    <tr>
      <td>${row.variable}</td>
      <td>${row.main_temp}</td>
      <td>${row.main_humidity}</td>
      <td>${row.main_pressure}</td>
      <td>${row.wind_speed}</td>
      <td>${row.rain_1h}</td>
      <td>${row.helada}</td>
    </tr>
  `).join('');

  wrapper.innerHTML = `
    <div style="overflow-x:auto;">
      <table class="table table-sm table-striped" style="margin-bottom: 0;">
        <thead>
          <tr>
            <th>Variable</th>
            <th>main.temp</th>
            <th>main.humidity</th>
            <th>main.pressure</th>
            <th>wind.speed</th>
            <th>rain.1h</th>
            <th>helada</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderG9(text) {
  const wrapper = document.getElementById('g9-text-wrapper');
  if (!wrapper) return;

  // Dividir en líneas y procesar cada una
  const lines = text.split('\n').map(line => {
    line = line.trim();
    if (!line) return '<br>';

    // Listas numeradas: "1. ..."
    if (/^\d+\.\s/.test(line)) {
      return `<li style="margin-left: 20px; margin-bottom: 8px;">${parseTextFormatting(line.replace(/^\d+\.\s/, ''))}</li>`;
    }
    // Títulos (líneas que terminan con :)
    if (line.endsWith(':') && line.length > 2) {
      return `<h6 style="color: #005eb6; margin-top: 15px; margin-bottom: 10px; font-weight: 700;">${parseTextFormatting(line)}</h6>`;
    }
    // Párrafos normales
    return `<p style="margin-bottom: 10px;">${parseTextFormatting(line)}</p>`;
  }).join('\n');

  // Envolver listas numeradas en <ul>
  const htmlWithLists = lines.replace(
    /(<li[^>]*>[\s\S]*?<\/li>)/g,
    '<ul style="list-style: none; padding: 0; margin: 15px 0;">$1</ul>'
  );

  wrapper.innerHTML = `
    <div style="font-size: 0.95rem; color: #333; line-height: 1.7; background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #005eb6; text-align: left;">
      ${htmlWithLists}
    </div>
  `;

  // Re-renderizar ecuaciones LaTeX
  if (window.MathJax) {
    MathJax.typesetPromise([wrapper]).catch(err => console.warn('MathJax error:', err));
  }
}




function crearGraficos() {
  if (tpData.g5?.monthly_frost_distribution) {
    const meses = tpData.g5.monthly_frost_distribution.map(item => item.mes);
    const heladasPorMes = tpData.g5.monthly_frost_distribution.map(item => item.horas_helada);

    Plotly.newPlot('g5-chart-mini', [{
      x: meses,
      y: heladasPorMes,
      type: 'bar',
      marker: { color: '#005eb6', opacity: 0.8 }
    }], {
      title: 'Distribución Mensual de Heladas',
      xaxis: { title: 'Mes', tickangle: -45 },
      yaxis: { title: 'Horas de Helada' },
      plot_bgcolor: '#f8f9fa',
      paper_bgcolor: 'white',
      font: { family: 'Segoe UI, sans-serif', size: 11 },
      margin: { t: 30, b: 70, l: 50, r: 30 }
    }, { responsive: true });
  }
}
