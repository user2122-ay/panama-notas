let state = {
  user: null,
  materias: [],
  trimestre: 1,
  materiaActual: null
};

const MATERIAS_COMUNES = [
  'Español', 'Matemática', 'Ciencias Naturales', 'Estudios Sociales',
  'Inglés', 'Educación Física', 'Expresiones Artísticas', 'Cátedra de la Paz',
  'Religión, Moral y Valores', 'Informática'
];

function promedio(valores) {
  if (!valores.length) return null;
  return Math.round((valores.reduce((a, b) => a + b, 0) / valores.length) * 100) / 100;
}

function calcularNotaMateria(notas) {
  const diarias = notas.filter(n => n.tipo === 'diaria').map(n => n.valor);
  const apreciacion = notas.filter(n => n.tipo === 'apreciacion').map(n => n.valor);
  const examen = notas.filter(n => n.tipo === 'examen').map(n => n.valor);
  const promDiaria = promedio(diarias);
  const promApreciacion = promedio(apreciacion);
  const promExamen = promedio(examen);
  const completo = promDiaria !== null && promApreciacion !== null && promExamen !== null;
  const notaFinal = completo ? Math.round(((promDiaria + promApreciacion + promExamen) / 3) * 100) / 100 : null;
  return { promDiaria, promApreciacion, promExamen, notaFinal, completo };
}

async function init() {
  try {
    state.user = await apiFetch('/auth/me');
  } catch (err) {
    window.location.href = '/index.html';
    return;
  }
  document.getElementById('user-name').textContent = state.user.nombre;
  await cargarMaterias();
  bindEvents();
  render();
}

async function cargarMaterias() {
  state.materias = await apiFetch('/materias');
}

function bindEvents() {
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await apiFetch('/auth/logout', { method: 'POST' });
    window.location.href = '/index.html';
  });

  document.getElementById('trimestre-select').addEventListener('change', (e) => {
    state.trimestre = Number(e.target.value);
    const boletinVisible = document.getElementById('view-boletin').classList.contains('active');
    if (boletinVisible) renderBoletin();
  });

  document.querySelectorAll('.view-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('view-' + tab.dataset.view).classList.add('active');
      if (tab.dataset.view === 'boletin') renderBoletin();
    });
  });

  document.getElementById('add-materia-btn').addEventListener('click', abrirModalMateria);
  document.getElementById('materia-cancel').addEventListener('click', cerrarModalMateria);
  document.getElementById('materia-guardar').addEventListener('click', guardarMateria);

  document.getElementById('detalle-cerrar').addEventListener('click', cerrarModalDetalle);
  document.getElementById('detalle-eliminar').addEventListener('click', eliminarMateriaActual);

  document.querySelectorAll('.detalle-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.detalle-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.detalle-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('detalle-' + tab.dataset.detalle).classList.add('active');
    });
  });

  document.getElementById('form-nota').addEventListener('submit', agregarNota);
  document.getElementById('form-ausencia').addEventListener('submit', agregarAusencia);
}

function render() {
  const grid = document.getElementById('materias-grid');
  if (!state.materias.length) {
    grid.innerHTML = '<p class="empty-state">Aún no tienes materias. Agrega la primera con el botón de arriba.</p>';
    return;
  }
  grid.innerHTML = '';
  state.materias.forEach(m => {
    const card = document.createElement('div');
    card.className = 'materia-card';
    card.innerHTML = `<h3>${m.nombre}</h3><p class="materia-profesor">${m.profesor || ''}</p>`;
    card.addEventListener('click', () => abrirModalDetalle(m));
    grid.appendChild(card);
  });
}

// --- Modal: Agregar materia ---
function abrirModalMateria() {
  document.getElementById('materia-nombre').value = '';
  document.getElementById('materia-profesor').value = '';
  const list = document.getElementById('quick-add-list');
  list.innerHTML = '';
  MATERIAS_COMUNES.forEach(nombre => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = nombre;
    chip.addEventListener('click', () => { document.getElementById('materia-nombre').value = nombre; });
    list.appendChild(chip);
  });
  document.getElementById('modal-materia').classList.add('show');
}
function cerrarModalMateria() {
  document.getElementById('modal-materia').classList.remove('show');
}
async function guardarMateria() {
  const nombre = document.getElementById('materia-nombre').value.trim();
  const profesor = document.getElementById('materia-profesor').value.trim();
  if (!nombre) return;
  await apiFetch('/materias', { method: 'POST', body: JSON.stringify({ nombre, profesor }) });
  await cargarMaterias();
  render();
  cerrarModalMateria();
}

// --- Modal: Detalle de materia ---
async function abrirModalDetalle(materia) {
  state.materiaActual = materia;
  document.getElementById('detalle-materia-nombre').textContent = materia.nombre;
  await cargarDetalleNotas();
  await cargarDetalleAusencias();
  document.getElementById('modal-detalle').classList.add('show');
}
function cerrarModalDetalle() {
  document.getElementById('modal-detalle').classList.remove('show');
  state.materiaActual = null;
}
async function eliminarMateriaActual() {
  if (!state.materiaActual) return;
  if (!confirm(`¿Eliminar "${state.materiaActual.nombre}" y todas sus notas/ausencias?`)) return;
  await apiFetch('/materias/' + state.materiaActual._id, { method: 'DELETE' });
  await cargarMaterias();
  render();
  cerrarModalDetalle();
}

async function cargarDetalleNotas() {
  const notas = await apiFetch(`/notas?materia=${state.materiaActual._id}&trimestre=${state.trimestre}`);
  const calc = calcularNotaMateria(notas);
  const resumen = document.getElementById('resumen-notas');
  resumen.innerHTML = `
    <div class="resumen-grid">
      <div><span>Diarias</span><strong>${calc.promDiaria ?? '—'}</strong></div>
      <div><span>Apreciación</span><strong>${calc.promApreciacion ?? '—'}</strong></div>
      <div><span>Examen</span><strong>${calc.promExamen ?? '—'}</strong></div>
      <div class="resumen-final"><span>Nota final</span><strong>${calc.notaFinal ?? 'Pendiente'}</strong></div>
    </div>`;

  const lista = document.getElementById('lista-notas');
  lista.innerHTML = '';
  notas.forEach(n => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = `[${etiquetaTipo(n.tipo)}] ${n.valor}${n.descripcion ? ' — ' + n.descripcion : ''}`;
    const del = document.createElement('button');
    del.textContent = '✕';
    del.className = 'btn-icon';
    del.addEventListener('click', async () => {
      await apiFetch('/notas/' + n._id, { method: 'DELETE' });
      await cargarDetalleNotas();
    });
    li.appendChild(span);
    li.appendChild(del);
    lista.appendChild(li);
  });
}

function etiquetaTipo(tipo) {
  return { diaria: 'Diaria', apreciacion: 'Apreciación', examen: 'Examen' }[tipo] || tipo;
}

async function agregarNota(e) {
  e.preventDefault();
  const tipo = document.getElementById('nota-tipo').value;
  const valor = Number(document.getElementById('nota-valor').value);
  const descripcion = document.getElementById('nota-descripcion').value.trim();
  if (valor < 0 || valor > 100) { alert('La nota debe estar entre 0 y 100'); return; }
  await apiFetch('/notas', {
    method: 'POST',
    body: JSON.stringify({ materia: state.materiaActual._id, trimestre: state.trimestre, tipo, valor, descripcion })
  });
  document.getElementById('form-nota').reset();
  await cargarDetalleNotas();
}

async function cargarDetalleAusencias() {
  const ausencias = await apiFetch(`/ausencias?materia=${state.materiaActual._id}&trimestre=${state.trimestre}`);
  const lista = document.getElementById('lista-ausencias');
  lista.innerHTML = '';
  ausencias.forEach(a => {
    const li = document.createElement('li');
    const fecha = new Date(a.fecha).toLocaleDateString('es-PA');
    const span = document.createElement('span');
    span.textContent = `${fecha} ${a.justificada ? '✅ Justificada' : ''} ${a.motivo ? '— ' + a.motivo : ''}`;
    const del = document.createElement('button');
    del.textContent = '✕';
    del.className = 'btn-icon';
    del.addEventListener('click', async () => {
      await apiFetch('/ausencias/' + a._id, { method: 'DELETE' });
      await cargarDetalleAusencias();
    });
    li.appendChild(span);
    li.appendChild(del);
    lista.appendChild(li);
  });
}

async function agregarAusencia(e) {
  e.preventDefault();
  const fechaInput = document.getElementById('ausencia-fecha').value;
  const fecha = fechaInput ? fechaInput : new Date().toISOString();
  const justificada = document.getElementById('ausencia-justificada').checked;
  const motivo = document.getElementById('ausencia-motivo').value.trim();
  await apiFetch('/ausencias', {
    method: 'POST',
    body: JSON.stringify({ materia: state.materiaActual._id, trimestre: state.trimestre, fecha, justificada, motivo })
  });
  document.getElementById('form-ausencia').reset();
  await cargarDetalleAusencias();
}

// --- Boletín ---
async function renderBoletin() {
  const labels = { 1: '1er Trimestre', 2: '2do Trimestre', 3: '3er Trimestre' };
  document.getElementById('boletin-trimestre-label').textContent = labels[state.trimestre];
  const data = await apiFetch('/boletin/' + state.trimestre);

  const body = document.getElementById('boletin-body');
  body.innerHTML = '';
  data.materias.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${m.materia}</td>
      <td>${m.promDiaria ?? '—'}</td>
      <td>${m.promApreciacion ?? '—'}</td>
      <td>${m.promExamen ?? '—'}</td>
      <td class="${m.notaFinal !== null && m.notaFinal < 61 ? 'nota-baja' : ''}"><strong>${m.notaFinal ?? 'Pendiente'}</strong></td>
      <td>${m.ausencias}</td>
    `;
    body.appendChild(tr);
  });

  document.getElementById('boletin-summary').innerHTML = `
    <div class="summary-card">
      <span>Promedio general</span>
      <strong>${data.promedioGeneral ?? '—'}</strong>
    </div>`;
}

init();
