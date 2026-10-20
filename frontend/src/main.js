const API = 'http://127.0.0.1:8000';

const $ = (id) => document.getElementById(id);

const searchInput = $('search-input');
const searchBtn = $('search-btn');
const searchResults = $('search-results');
const searchMeta = $('search-meta');
const docInput = $('doc-input');
const addDocsBtn = $('add-docs-btn');
const clearDocsBtn = $('clear-docs-btn');
const docStatus = $('doc-status');
const docCount = $('doc-count');
const docList = $('doc-list');
const statDocs = $('stat-docs');

async function fetchDocuments() {
  try {
    const res = await fetch(`${API}/documents`);
    const data = await res.json();
    renderDocList(data.documents);
    docCount.textContent = data.count;
    statDocs.textContent = data.count;
  } catch {
    docList.innerHTML = '<div class="doc-empty">Could not load documents. Is the backend running?</div>';
  }
}

function renderDocList(docs) {
  if (!docs || docs.length === 0) {
    docList.innerHTML = '<div class="doc-empty">No documents in the index yet.</div>';
    return;
  }
  docList.innerHTML = docs.map((d, i) => `
    <div class="doc-item">
      <span class="doc-num">${i + 1}</span>
      <span class="doc-text">${esc(d)}</span>
    </div>
  `).join('');
}

function esc(t) {
  const d = document.createElement('div');
  d.textContent = t;
  return d.innerHTML;
}

function setLoading(show) {
  searchBtn.disabled = show;
  searchBtn.textContent = show ? 'Searching...' : 'Search';
}

async function search() {
  const q = searchInput.value.trim();
  if (!q) return;

  setLoading(true);
  searchMeta.innerHTML = '<span class="spinner"></span>Embedding query and computing cosine similarity...';
  searchResults.innerHTML = '';

  try {
    const res = await fetch(`${API}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q, top_k: 5 }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }

    const data = await res.json();
    renderResults(data, q);
  } catch (e) {
    searchMeta.innerHTML = '';
    searchResults.innerHTML = `
      <div class="error-box">
        <p>Search failed: ${esc(e.message)}</p>
        <p style="margin-top:8px;font-size:0.8rem;">Make sure the Python service is running on port 8000.</p>
      </div>`;
  } finally {
    setLoading(false);
  }
}

function renderResults(data, query) {
  const { results, elapsed_ms, model, dimensions } = data;

  searchMeta.innerHTML = `
    ${results.length} results &middot; ${elapsed_ms}ms &middot; model: ${model} &middot; ${dimensions}d vectors`;

  if (!results || results.length === 0) {
    searchResults.innerHTML = `<div class="no-results">No results for "${esc(query)}". Try adding more documents.</div>`;
    return;
  }

  searchResults.innerHTML = results.map((r, i) => {
    const pct = (r.score * 100).toFixed(1);
    return `
      <div class="result-card ${i === 0 ? 'top-result' : ''}">
        <div class="result-header">
          <span class="result-rank">${i === 0 ? 'Best Match' : 'Rank ' + (i + 1)}</span>
          <div class="result-score-wrap">
            <div class="score-bar-bg">
              <div class="score-bar" style="width:0%"></div>
            </div>
            <span class="result-score">${r.score.toFixed(4)}</span>
          </div>
        </div>
        <p class="result-text">${esc(r.text)}</p>
      </div>`;
  }).join('');

  requestAnimationFrame(() => {
    searchResults.querySelectorAll('.score-bar').forEach((bar, i) => {
      setTimeout(() => {
        bar.style.width = (results[i].score * 100).toFixed(1) + '%';
      }, i * 80);
    });
  });
}

function setStatus(msg, type) {
  docStatus.textContent = msg;
  docStatus.className = 'status-bar ' + (type || '');
}

async function addDocuments() {
  const text = docInput.value.trim();
  if (!text) { setStatus('Enter at least one document.', 'error'); return; }

  const docs = text.split('\n').map(s => s.trim()).filter(Boolean);
  if (docs.length === 0) { setStatus('No valid documents found.', 'error'); return; }

  addDocsBtn.disabled = true;
  addDocsBtn.textContent = 'Adding...';
  setStatus(`Embedding ${docs.length} document(s)...`, '');

  try {
    const res = await fetch(`${API}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documents: docs }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }

    const data = await res.json();
    docInput.value = '';
    setStatus(`Added ${data.added_count} document(s). Total: ${data.documents.length}`, 'success');
    renderDocList(data.documents);
    docCount.textContent = data.documents.length;
    statDocs.textContent = data.documents.length;
  } catch (e) {
    setStatus(`Failed: ${e.message}`, 'error');
  } finally {
    addDocsBtn.disabled = false;
    addDocsBtn.textContent = 'Add to Index';
  }
}

async function clearDocuments() {
  if (!confirm('Clear all documents from the index?')) return;

  clearDocsBtn.disabled = true;
  clearDocsBtn.textContent = 'Clearing...';

  try {
    const res = await fetch(`${API}/documents`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    renderDocList([]);
    docCount.textContent = '0';
    statDocs.textContent = '0';
    searchResults.innerHTML = '';
    searchMeta.innerHTML = '';
    setStatus('All documents cleared.', 'success');
  } catch (e) {
    setStatus(`Failed: ${e.message}`, 'error');
  } finally {
    clearDocsBtn.disabled = false;
    clearDocsBtn.textContent = 'Clear All';
  }
}

searchBtn.addEventListener('click', search);
searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') search(); });
addDocsBtn.addEventListener('click', addDocuments);
clearDocsBtn.addEventListener('click', clearDocuments);

document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    searchInput.value = chip.dataset.query;
    search();
  });
});

fetchDocuments();

searchResults.innerHTML = '<div class="no-results">Enter a query or click a suggestion to start searching.</div>';
