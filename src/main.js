import JSZip from 'jszip';

// State
const state = {
  files: [],
  currentEditId: null,
  converting: false,
  worker: null
};

// Utils
function sanitizeSlug(name) {
  return name
    .toLowerCase()
    .replace(/\.png$/i, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function createLabel(slug) {
  return slug
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ';
  toast.innerHTML = `<span style="font-size: 1.2rem;">${icon}</span><span>${message}</span>`;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copiado al portapapeles', 'success');
  } catch (err) {
    console.error('Error copying:', err);
    showToast('Error al copiar', 'error');
  }
}

// File handling
function createFileId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function addFiles(files) {
  const pngFiles = Array.from(files).filter(f => f.type === 'image/png');
  
  if (pngFiles.length === 0) {
    showToast('Por favor selecciona archivos PNG', 'warning');
    return;
  }

  pngFiles.forEach(file => {
    const id = createFileId();
    const slug = sanitizeSlug(file.name);
    const label = createLabel(slug);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        state.files.push({
          id,
          file,
          slug,
          label,
          width: img.width,
          height: img.height,
          sizeOriginal: file.size,
          sizeWebp: null,
          status: 'pending',
          originalData: e.target.result,
          webpData: null,
          selected: true
        });
        
        renderFilesList();
        updateUI();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('filesSection').style.display = 'block';
}

function renderFilesList() {
  const container = document.getElementById('filesList');
  const count = document.getElementById('fileCount');
  
  count.textContent = state.files.length;
  
  container.innerHTML = state.files.map(file => `
    <div class="file-item ${file.selected ? 'selected' : ''}" data-id="${file.id}">
      <div class="file-header">
        <input type="checkbox" 
               class="file-checkbox" 
               ${file.selected ? 'checked' : ''} 
               onchange="window.toggleFileSelect('${file.id}')">
        <div class="file-info">
          <div class="file-name">${file.file.name}</div>
          <div class="file-details">
            <div class="file-detail">
              <span>📐</span>
              <span>${file.width}×${file.height}</span>
            </div>
            <div class="file-detail">
              <span>📄</span>
              <span>PNG: ${formatBytes(file.sizeOriginal)}</span>
            </div>
            ${file.sizeWebp ? `
              <div class="file-detail">
                <span>🎯</span>
                <span>WebP: ${formatBytes(file.sizeWebp)}</span>
              </div>
              <div class="file-detail">
                <span>📊</span>
                <span>${((1 - file.sizeWebp / file.sizeOriginal) * 100).toFixed(1)}% menor</span>
              </div>
            ` : ''}
          </div>
          <div class="file-status ${file.status}">
            ${file.status === 'converting' ? '<div class="spinner"></div>' : ''}
            <span>${getStatusText(file.status)}</span>
          </div>
          ${file.status === 'completed' ? `
            <div class="file-actions">
              <button class="btn-small btn-preview" onclick="window.showPreview('${file.id}')">
                👁 Preview
              </button>
              <button class="btn-small btn-edit" onclick="window.showEditModal('${file.id}')">
                ✏️ Editar
              </button>
              <button class="btn-small btn-copy" onclick="window.copyPath('${file.id}')">
                📋 Copiar ruta
              </button>
              <button class="btn-small btn-download" onclick="window.downloadSingle('${file.id}')">
                💾 Descargar
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function getStatusText(status) {
  const texts = {
    pending: 'Pendiente',
    converting: 'Convirtiendo...',
    completed: 'Completado',
    error: 'Error'
  };
  return texts[status] || status;
}

function updateUI() {
  const hasFiles = state.files.length > 0;
  const hasCompleted = state.files.some(f => f.status === 'completed');
  const hasSelected = state.files.some(f => f.selected && f.status === 'completed');
  const allCompleted = state.files.length > 0 && state.files.every(f => f.status === 'completed' || f.status === 'error');
  
  document.getElementById('btnConvertAll').disabled = state.converting || allCompleted;
  document.getElementById('btnDownloadSelected').disabled = !hasSelected;
  document.getElementById('btnDownloadZip').disabled = !hasCompleted;
  document.getElementById('btnCopyJson').disabled = !hasCompleted;
  document.getElementById('btnDownloadJson').disabled = !hasCompleted;
  
  updateProgress();
}

function updateProgress() {
  const total = state.files.length;
  if (total === 0) {
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressText').textContent = '0%';
    return;
  }
  
  const completed = state.files.filter(f => f.status === 'completed' || f.status === 'error').length;
  const percent = Math.round((completed / total) * 100);
  
  document.getElementById('progressFill').style.width = percent + '%';
  document.getElementById('progressText').textContent = percent + '%';
}

// Conversion
async function convertAll() {
  if (state.converting) return;
  
  const pending = state.files.filter(f => f.status === 'pending');
  if (pending.length === 0) {
    showToast('No hay archivos pendientes', 'warning');
    return;
  }
  
  state.converting = true;
  updateUI();
  
  // Initialize worker
  if (!state.worker) {
    state.worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
    
    state.worker.onmessage = (e) => {
      const { type, id, webpData, size, error } = e.data;
      
      if (type === 'complete') {
        const file = state.files.find(f => f.id === id);
        if (file) {
          file.status = 'completed';
          file.webpData = webpData;
          file.sizeWebp = size;
          renderFilesList();
          updateUI();
        }
      } else if (type === 'error') {
        const file = state.files.find(f => f.id === id);
        if (file) {
          file.status = 'error';
          renderFilesList();
          updateUI();
        }
        showToast(`Error: ${error}`, 'error');
      }
    };
  }
  
  // Convert one by one
  for (const file of pending) {
    file.status = 'converting';
    renderFilesList();
    
    state.worker.postMessage({
      id: file.id,
      imageData: file.originalData,
      width: file.width,
      height: file.height
    });
    
    // Wait for completion
    await new Promise(resolve => {
      const check = setInterval(() => {
        const f = state.files.find(x => x.id === file.id);
        if (f && (f.status === 'completed' || f.status === 'error')) {
          clearInterval(check);
          resolve();
        }
      }, 100);
    });
  }
  
  state.converting = false;
  updateUI();
  showToast('Conversión completada', 'success');
}

// Preview
function showPreview(id) {
  const file = state.files.find(f => f.id === id);
  if (!file || file.status !== 'completed') return;
  
  const modal = document.getElementById('previewModal');
  const canvas = document.getElementById('previewCanvas');
  const ctx = canvas.getContext('2d');
  const title = document.getElementById('previewTitle');
  const info = document.getElementById('previewInfo');
  
  title.textContent = file.file.name;
  
  let showingOriginal = true;
  
  function render(isOriginal) {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = isOriginal ? file.originalData : file.webpData;
    
    showingOriginal = isOriginal;
    document.getElementById('btnShowOriginal').classList.toggle('active', isOriginal);
    document.getElementById('btnShowWebp').classList.toggle('active', !isOriginal);
    
    info.innerHTML = `
      <div class="preview-info-row">
        <span class="preview-info-label">Formato:</span>
        <span class="preview-info-value">${isOriginal ? 'PNG Original' : 'WebP Lossless'}</span>
      </div>
      <div class="preview-info-row">
        <span class="preview-info-label">Dimensiones:</span>
        <span class="preview-info-value">${file.width}×${file.height}</span>
      </div>
      <div class="preview-info-row">
        <span class="preview-info-label">Tamaño:</span>
        <span class="preview-info-value">${formatBytes(isOriginal ? file.sizeOriginal : file.sizeWebp)}</span>
      </div>
      ${!isOriginal ? `
        <div class="preview-info-row">
          <span class="preview-info-label">Compresión:</span>
          <span class="preview-info-value">${((1 - file.sizeWebp / file.sizeOriginal) * 100).toFixed(1)}% menor</span>
        </div>
      ` : ''}
    `;
  }
  
  render(true);
  
  document.getElementById('btnShowOriginal').onclick = () => render(true);
  document.getElementById('btnShowWebp').onclick = () => render(false);
  
  modal.classList.add('active');
}

function closePreview() {
  document.getElementById('previewModal').classList.remove('active');
}

// Edit Modal
function showEditModal(id) {
  const file = state.files.find(f => f.id === id);
  if (!file) return;
  
  state.currentEditId = id;
  
  document.getElementById('editSlug').value = file.slug;
  document.getElementById('editLabel').value = file.label;
  
  document.getElementById('editModal').classList.add('active');
}

function saveEdit() {
  if (!state.currentEditId) return;
  
  const file = state.files.find(f => f.id === state.currentEditId);
  if (!file) return;
  
  const slug = sanitizeSlug(document.getElementById('editSlug').value || file.slug);
  const label = document.getElementById('editLabel').value.trim() || createLabel(slug);
  
  file.slug = slug;
  file.label = label;
  
  renderFilesList();
  closeEditModal();
  showToast('Cambios guardados', 'success');
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('active');
  state.currentEditId = null;
}

// Download
function downloadSingle(id) {
  const file = state.files.find(f => f.id === id);
  if (!file || !file.webpData) return;
  
  const filename = `skin_${file.slug}.webp`;
  downloadDataURL(file.webpData, filename);
}

function downloadDataURL(dataURL, filename) {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  link.click();
}

async function downloadSelected() {
  const selected = state.files.filter(f => f.selected && f.status === 'completed');
  if (selected.length === 0) return;
  
  if (selected.length === 1) {
    downloadSingle(selected[0].id);
    return;
  }
  
  // Multiple files - create zip
  await downloadZip(selected);
}

async function downloadAllZip() {
  const completed = state.files.filter(f => f.status === 'completed');
  if (completed.length === 0) return;
  
  await downloadZip(completed);
}

async function downloadZip(files) {
  showToast('Creando ZIP...', 'info');
  
  const zip = new JSZip();
  const skinsFolder = zip.folder('skins');
  
  // Add WebP files
  for (const file of files) {
    const filename = `skin_${file.slug}.webp`;
    const blob = await fetch(file.webpData).then(r => r.blob());
    skinsFolder.file(filename, blob);
  }
  
  // Add index.json
  const catalog = generateCatalog(files);
  zip.file('index.json', JSON.stringify(catalog, null, 2));
  
  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  downloadDataURL(url, 'skinpress_export.zip');
  URL.revokeObjectURL(url);
  
  showToast('ZIP descargado', 'success');
}

function generateCatalog(files) {
  return {
    version: 1,
    items: files.map(f => ({
      file: `skin_${f.slug}.webp`,
      label: f.label
    }))
  };
}

async function copyIndexJson() {
  const completed = state.files.filter(f => f.status === 'completed');
  if (completed.length === 0) return;
  
  const catalog = generateCatalog(completed);
  await copyToClipboard(JSON.stringify(catalog, null, 2));
}

async function downloadIndexJson() {
  const completed = state.files.filter(f => f.status === 'completed');
  if (completed.length === 0) return;
  
  const catalog = generateCatalog(completed);
  const blob = new Blob([JSON.stringify(catalog, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  downloadDataURL(url, 'index.json');
  URL.revokeObjectURL(url);
}

async function copyPath(id) {
  const file = state.files.find(f => f.id === id);
  if (!file) return;
  
  const path = `assets/skins/skin_${file.slug}.webp`;
  await copyToClipboard(path);
}

function toggleFileSelect(id) {
  const file = state.files.find(f => f.id === id);
  if (file) {
    file.selected = !file.selected;
    renderFilesList();
    updateUI();
  }
}

function resetAll() {
  if (state.files.length === 0) return;
  
  if (!confirm('¿Seguro que quieres reiniciar? Se perderán todos los archivos.')) return;
  
  state.files = [];
  renderFilesList();
  updateUI();
  document.getElementById('filesSection').style.display = 'none';
  showToast('Aplicación reiniciada', 'info');
}

// Drag & Drop
function setupDragDrop() {
  const zone = document.getElementById('uploadZone');
  
  zone.addEventListener('click', () => {
    document.getElementById('fileInput').click();
  });
  
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });
  
  zone.addEventListener('dragleave', () => {
    zone.classList.remove('drag-over');
  });
  
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    addFiles(e.dataTransfer.files);
  });
}

// Event Listeners
function setupEventListeners() {
  document.getElementById('fileInput').addEventListener('change', (e) => {
    addFiles(e.target.files);
    e.target.value = '';
  });
  
  document.getElementById('btnSelect').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('fileInput').click();
  });
  
  document.getElementById('btnConvertAll').addEventListener('click', convertAll);
  document.getElementById('btnDownloadSelected').addEventListener('click', downloadSelected);
  document.getElementById('btnDownloadZip').addEventListener('click', downloadAllZip);
  document.getElementById('btnCopyJson').addEventListener('click', copyIndexJson);
  document.getElementById('btnDownloadJson').addEventListener('click', downloadIndexJson);
  document.getElementById('btnReset').addEventListener('click', resetAll);
  
  document.getElementById('btnClosePreview').addEventListener('click', closePreview);
  document.getElementById('previewModal').addEventListener('click', (e) => {
    if (e.target.id === 'previewModal') closePreview();
  });
  
  document.getElementById('btnCloseEdit').addEventListener('click', closeEditModal);
  document.getElementById('btnCancelEdit').addEventListener('click', closeEditModal);
  document.getElementById('btnSaveEdit').addEventListener('click', saveEdit);
  document.getElementById('editModal').addEventListener('click', (e) => {
    if (e.target.id === 'editModal') closeEditModal();
  });
  
  document.getElementById('btnHelp').addEventListener('click', () => {
    document.getElementById('helpModal').classList.add('active');
  });
  document.getElementById('btnCloseHelp').addEventListener('click', () => {
    document.getElementById('helpModal').classList.remove('active');
  });
  document.getElementById('helpModal').addEventListener('click', (e) => {
    if (e.target.id === 'helpModal') {
      document.getElementById('helpModal').classList.remove('active');
    }
  });
}

// Service Worker
function setupServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').then(registration => {
      console.log('SW registered');
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            const btn = document.getElementById('btnUpdate');
            btn.style.display = 'inline-block';
            btn.addEventListener('click', () => {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            });
          }
        });
      });
    });
    
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }
}

// Init
setupDragDrop();
setupEventListeners();
setupServiceWorker();

// Expose to window for onclick handlers
window.toggleFileSelect = toggleFileSelect;
window.showPreview = showPreview;
window.showEditModal = showEditModal;
window.copyPath = copyPath;
window.downloadSingle = downloadSingle;
