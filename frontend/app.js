const app = document.querySelector('#app');

const state = {
  text: 'Hello World',
  key: '1234567890abcdef',
  mode: 'ecb',
  operation: 'encrypt',
  output: '',
  ciphertext: '',
  error: '',
  activeRound: 0,
};
let revealToken = 0;

const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
const bytes = (value) => new TextEncoder().encode(value);
const hex = (buffer) => Array.from(buffer, (byte) => byte.toString(16).padStart(2, '0')).join('');
const hexToBytes = (value) => {
  const result = new Uint8Array(value.length / 2);
  for (let index = 0; index < result.length; index += 1) result[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  return result;
};
const apiUrl = '/api';
const errorMessage = async (response) => {
  const detail = (await response.json().catch(() => null))?.detail;
  return detail ? String(detail) : `API request failed with status ${response.status}.`;
};

function layout(content) {
  app.innerHTML = content;
  app.focus();
  bindCommon();
}

function bindCommon() {
  document.querySelectorAll('[data-route]').forEach((link) => link.addEventListener('click', () => {
    window.location.hash = link.dataset.route;
  }));
}

function home() {
  layout(`
    <section class="hero page-enter">
      <div class="hero-copy">
        <div class="eyebrow"><span class="pulse"></span> Open-source AES-128 implementation</div>
        <h1>Encryption you can <em>see.</em></h1>
        <p class="hero-lede">A pure-Python AES-128 implementation served by FastAPI — every encipher, decipher, and round pushed through real HTTP requests.</p>
        <div class="hero-actions"><a class="button primary" data-route="#/playground" href="#/playground">Open playground <span>→</span></a><a class="text-link" data-route="#/docs" href="#/docs">Read the docs <span>↗</span></a></div>
        <div class="hero-note mono"><span class="green">●</span> No external crypto libraries · built for inspection</div>
      </div>
      <div class="hero-visual" aria-label="AES state matrix visualization">
        <div class="visual-label mono">STATE / ROUND 04</div>
        <div class="matrix large-matrix">${matrixCells()}</div>
        <div class="visual-foot mono"><span>SUBBYTES</span><span>SHIFTROWS</span><span class="active">MIXCOLUMNS</span></div>
      </div>
    </section>
    <section class="signal-grid">
      <article><span class="signal-icon green">01</span><h3>Transparent by design</h3><p>Every primitive is exposed: S-box, finite field arithmetic, state matrix, and key schedule.</p></article>
      <article><span class="signal-icon orange">02</span><h3>Runs on FastAPI</h3><p>Type real inputs into the playground; every operation is an instrumented request to the Python engine, never a black box.</p></article>
      <article><span class="signal-icon blue">03</span><h3>Built around standards</h3><p>Validated against the NIST FIPS-197 test vector and implemented from the specification in pure Python.</p></article>
    </section>
    <section class="home-bottom"><div><div class="eyebrow">Start with the mental model</div><h2>Plaintext in.<br/><span>State transformation out.</span></h2></div><a class="arrow-card" href="#/docs"><span>Explore the flow</span><b>↗</b></a></section>
  `);
}

function matrixCells() {
  const values = ['63', '7c', '77', '7b', 'f2', '6b', '6f', 'c5', '30', '01', '67', '2b', 'fe', 'd7', 'ab', '76'];
  return values.map((value, index) => `<span class="cell ${index % 5 === 0 ? 'hot' : ''}">${value}</span>`).join('');
}

function docs() {
  layout(`
    <section class="docs-shell page-enter"><aside class="docs-nav"><div class="eyebrow">On this page</div><a class="selected" href="#overview"><span class="docs-icon" aria-hidden="true">⌂</span><span>Overview</span></a><a href="#api"><span class="docs-icon" aria-hidden="true">&lt;/&gt;</span><span>Endpoints</span></a><a href="#try"><span class="docs-icon" aria-hidden="true">⏵</span><span>Try it live</span></a><a href="#flow"><span class="docs-icon" aria-hidden="true">↝</span><span>AES-128 algorithm</span></a><a href="#errors"><span class="docs-icon" aria-hidden="true">!</span><span>Errors &amp; gotchas</span></a><div class="docs-nav-foot mono">FastAPI · pure Python<br/>AES-128 · 10 rounds · 16-byte block</div></aside>
      <div class="docs-content"><div class="eyebrow">Developer docs / 01</div><h1>The AES-128<br/><em>lab API.</em></h1><p class="intro">A FastAPI service with a pure-Python AES-128 implementation — no external crypto libraries. The browser never touches the cipher; every operation is a hex-in / hex-out HTTP request.</p>

        <div class="doc-section" id="overview"><div class="section-number mono">01</div><div>
          <h2>Architecture</h2>
          <p>This documentation page is served by the same process that encrypts. Every operation below flows through the API surface on the left — nothing runs inside the browser.</p>
          <div class="endpoint-grid">
            <div class="endpoint-card"><h3>Server-side cipher</h3><p>SubBytes, ShiftRows, MixColumns, and key schedule all run in pure Python on the API, never in the client.</p><div class="endpoint-tags"><span class="tag">python</span><span class="tag">fastapi</span></div></div>
            <div class="endpoint-card"><h3>Hex in, hex out</h3><p>Both directions are hexadecimal strings. Clients hex-encode UTF-8 text; the engine is bytes-in / bytes-out.</p><div class="endpoint-tags"><span class="tag">bytes</span><span class="tag">hex</span></div></div>
            <div class="endpoint-card"><h3>Self-documenting</h3><p>Live OpenAPI at <span class="mono">/docs</span>, <span class="mono">/redoc</span>, and a machine-readable <span class="mono">/openapi.json</span>.</p><div class="endpoint-tags"><span class="tag">openapi</span><span class="tag">json</span></div></div>
            <div class="endpoint-card"><h3>Standards-verified</h3><p>Validated against the NIST FIPS-197 vector in the pytest suite under <span class="mono">python_api/tests</span>.</p><div class="endpoint-tags"><span class="tag">FIPS-197</span><span class="tag">pytest</span></div></div>
          </div>
        </div></div>

        <div class="doc-section" id="api"><div class="section-number mono">02</div><div>
          <h2>Endpoints</h2>
          <div class="endpoint-grid">
            <div class="endpoint-card"><span class="verb verb-post">POST</span><span class="endpoint-path">/api/encrypt</span><p>Hex plaintext in — hex ciphertext out. Applies PKCS#7 padding, then AES-ECB or AES-CBC.</p><div class="endpoint-tags"><span class="tag">encrypt</span><span class="tag">ecb / cbc</span></div></div>
            <div class="endpoint-card"><span class="verb verb-post">POST</span><span class="endpoint-path">/api/decrypt</span><p>Hex ciphertext in — hex plaintext out. Validates and strips PKCS#7 padding.</p><div class="endpoint-tags"><span class="tag">decrypt</span><span class="tag">pkcs#7</span></div></div>
            <div class="endpoint-card"><span class="verb verb-get">GET</span><span class="endpoint-path">/api/health</span><p>Liveness probe used by the Docker healthcheck. Returns service status.</p><div class="endpoint-tags"><span class="tag">health</span></div></div>
            <div class="endpoint-card"><span class="verb verb-get">GET</span><span class="endpoint-path">/docs · /redoc · /openapi.json</span><p>Interactive and machine-readable API documentation.</p><div class="endpoint-tags"><span class="tag">openapi</span></div></div>
          </div>

          <h2>Request schema</h2>
          <div class="spec"><div class="spec-head mono"><span>application/json</span><span>CipherRequest</span></div>
            <div class="spec-row"><span class="spec-name">key</span><span class="spec-desc">AES-128 key — 32 hex characters (16 bytes).</span><span class="spec-meta req req-yes">REQUIRED</span></div>
            <div class="spec-row"><span class="spec-name">data</span><span class="spec-desc">Secret payload as hex. Encrypt accepts any length; decrypt requires a non-empty multiple of 16 bytes.</span><span class="spec-meta req req-yes">REQUIRED</span></div>
            <div class="spec-row"><span class="spec-name">mode</span><span class="spec-desc">"ecb" or "cbc". Defaults to ecb.</span><span class="spec-meta req req-no">OPTIONAL</span></div>
            <div class="spec-row"><span class="spec-name">iv</span><span class="spec-desc">32 hex characters. Required only when mode is cbc.</span><span class="spec-meta req req-no">CONDITIONAL</span></div>
          </div>

          <h2>Quickstart</h2>
          <div class="endpoint-grid single">
            <div class="endpoint-card"><div class="code-card" style="margin-top:0"><div class="code-head mono"><span>curl</span><span>POST /api/encrypt</span></div><pre>curl -X POST http://localhost:8000/api/encrypt \\
     -H 'Content-Type: application/json' \\
     -d '{"key":"31323334353637383930616263646566",
          "data":"48656c6c6f20576f726c64","mode":"ecb"}'</pre></div><p>Returns JSON with the certified ciphertext.</p></div>
            <div class="endpoint-card"><div class="code-head mono" style="display:flex;justify-content:space-between;border-bottom:1px solid var(--line);padding:12px 15px"><span>python</span><span>round-trip</span></div><pre>import requests
api = "http://localhost:8000/api"
key = b"1234567890abcdef".hex()
enc = requests.post(f"{api}/encrypt", json={
    "key": key, "data": b"Hello World".hex(), "mode": "ecb"}).json()
dec = requests.post(f"{api}/decrypt", json={
    "key": key, "data": enc["data"], "mode": "ecb"}).json()
print(bytes.fromhex(dec["data"]))  # b'Hello World'</pre></div>
          </div>
        </div></div>

        <div class="doc-section" id="try"><div class="section-number mono">03</div><div>
          <h2>Try it live</h2>
          <p>Fire real requests against the running engine. Fields that are not valid hex are hex-encoded automatically.</p>
          <div class="console">
            <div class="console-head"><span class="verb verb-post">POST</span><span class="console-target" id="console-target">/api/encrypt</span></div>
            <div class="console-body">
              <div class="console-fields">
                <div class="console-op"><button type="button" class="operation active" data-console-op="encrypt"><span aria-hidden="true">↗</span> Encrypt</button><button type="button" class="operation" data-console-op="decrypt"><span aria-hidden="true">↙</span> Decrypt</button></div>
                <div class="console-op"><button type="button" class="operation active" data-console-mode="ecb">ECB</button><button type="button" class="operation" data-console-mode="cbc">CBC</button></div>
                <div class="console-field"><label>Key<span>16 bytes</span></label><input id="console-key" value="1234567890abcdef" maxlength="48" /></div>
                <div class="console-field"><label>Data<span>text or hex</span></label><textarea id="console-data" rows="4">Hello World</textarea></div>
                <div class="console-field console-iv"><label>IV<span>cbc only</span></label><input id="console-iv" value="00000000000000000000000000000000" maxlength="48" /></div>
                <button class="button primary console-send" id="console-send" type="button"><span class="play">▶</span> Send request</button>
              </div>
              <div class="console-resp">
                <div class="resp-head"><span class="resp-status" id="console-status"><span class="resp-dot"></span><span id="console-status-text">Ready — no request sent yet</span></span><button type="button" class="resp-copy" id="console-copy">Copy</button></div>
                <div class="resp-body resp-placeholder" id="console-body">Response will appear here.</div>
              </div>
            </div>
          </div>
        </div></div>

        <div class="doc-section" id="flow"><div class="section-number mono">04</div><div>
          <h2>How the Python engine works</h2>
          <p>A 16-byte block becomes a 4×4 <em>state</em> matrix, stored column-major. Source: <span class="mono">python_api/app/core/aes_cipher.py</span>.</p>
          <div class="code-card"><div class="code-head mono"><span>aes_cipher.py</span><span>block &lt;-&gt; state</span></div><pre># plaintext bytes -> 4x4 state
[[block[col * 4 + row] for col in range(4)] for row in range(4)]

# state -> ciphertext bytes
bytes(state[row][col] for col in range(4) for row in range(4))</pre></div>

          <h2>Galois field GF(2^8)</h2>
          <p>All byte math lives in the finite field GF(2^8), with polynomial multiplication modulo x^8 + x^4 + x^3 + x + 1 (0x11B) — implemented as shift-and-XOR with reduction by 0x1B. Source: <span class="mono">python_api/app/core/galois_field.py</span>.</p>
          <div class="code-card"><div class="code-head mono"><span>galois_field.py</span><span>multiply</span></div><pre>def multiply(a, b):
    a, b, product = a & 0xFF, b & 0xFF, 0
    for _ in range(8):
        if b & 1:
            product ^= a
        high = a & 0x80
        a = (a << 1) & 0xFF
        if high:
            a ^= 0x1B
        b >>= 1
    return product</pre></div>

          <h2>The four transformations</h2>
          <div class="endpoint-grid">
            <div class="endpoint-card"><h3>SubBytes</h3><p>Byte substitution via the S-box — an affine transform over GF(2^8). The inverse S-box reverses it. Source: <span class="mono">s_box.py</span>.</p></div>
            <div class="endpoint-card"><h3>ShiftRows</h3><p>Row i rotates left by i bytes; decryption rotates right. Source: <span class="mono">state_matrix.py</span>.</p></div>
            <div class="endpoint-card"><h3>MixColumns</h3><p>Each column is recombined with the MDS matrix {02, 03, 01, 01} over GF(2^8); decryption uses the inverse matrix. Source: <span class="mono">state_matrix.py</span>.</p></div>
            <div class="endpoint-card"><h3>AddRoundKey</h3><p>The state is XOR-ed with a round key. Source: <span class="mono">state_matrix.py</span>.</p></div>
          </div>

          <h2>Key schedule</h2>
          <p>A 16-byte key expands into 44 words — eleven 4×4 round keys. Every fourth word is rotated, byte-substituted, then XOR-ed with a round constant (RCON). Source: <span class="mono">python_api/app/core/key_scheduler.py</span>.</p>

          <h2>Round structure</h2>
          <div class="flow"><span>PAD</span><b>→</b><span>ADD KEY</span><b>→</b><span>SUB BYTES</span><b>→</b><span>SHIFT ROWS</span><b>→</b><span>MIX COLUMNS</span><b>→</b><span>× 9</span><b>→</b><span>SUB BYTES</span><b>→</b><span>SHIFT ROWS</span><b>→</b><span>ADD KEY</span></div>
          <p>AES-128 runs 10 rounds: an initial AddRoundKey, then rounds 1–9 of SubBytes → ShiftRows → MixColumns → AddRoundKey, and a final round without MixColumns.</p>

          <h2>Modes &amp; padding</h2>
          <div class="spec"><div class="spec-head mono"><span>block modes</span><span>semantics</span></div>
            <div class="spec-row"><span class="spec-name">ECB</span><span class="spec-desc">Each block is encrypted independently. Good for learning; identical blocks produce identical ciphertext, so it leaks structure.</span><span class="spec-meta"></span></div>
            <div class="spec-row"><span class="spec-name">CBC</span><span class="spec-desc">Each block is XOR-ed with the previous ciphertext before encryption; the first block chains from the IV.</span><span class="spec-meta"></span></div>
            <div class="spec-row"><span class="spec-name">PKCS#7</span><span class="spec-desc">Adds 1–16 bytes so the input is always a multiple of 16; perfectly aligned data gains a full 16-byte pad block.</span><span class="spec-meta"></span></div>
          </div>

          <h2>Validation</h2>
          <div class="code-card"><div class="code-head mono"><span>validation</span><span>NIST FIPS-197 vector</span></div><pre>key       = 000102030405060708090a0b0c0d0e0f
plaintext = 00112233445566778899aabbccddeeff
ciphertext= 69c4e0d86a7b0430d8cdb78070b4c55a</pre></div>
          <p>Covered by <span class="mono">python_api/tests/</span> — run with <span class="mono">pytest</span> from the <span class="mono">python_api</span> directory.</p>
        </div></div>

        <div class="doc-section" id="errors"><div class="section-number mono">05</div><div>
          <h2>Errors</h2>
          <div class="spec"><div class="spec-head mono"><span>http status</span><span>meaning</span></div>
            <div class="spec-row"><span class="spec-name">422</span><span class="spec-desc">Pydantic rejected the request shape — e.g. a key that is not exactly 32 hex characters, or a mode other than ecb/cbc.</span><span class="spec-meta">validation</span></div>
            <div class="spec-row"><span class="spec-name">400</span><span class="spec-desc">Well-formed JSON but bad payload — malformed hex, non-multiple-of-16 ciphertext on decrypt, CBC without a 16-byte IV, or broken PKCS#7 padding.</span><span class="spec-meta">payload</span></div>
            <div class="spec-row"><span class="spec-name">200</span><span class="spec-desc">Success. Body: { "data": "...", "mode": "ecb" }.</span><span class="spec-meta">success</span></div>
          </div>
          <div class="code-card"><div class="code-head mono"><span>example</span><span>HTTP 400</span></div><pre>{"detail": "Invalid hex in key."}</pre></div>

          <h2>Gotchas</h2>
          <div class="endpoint-grid">
            <div class="endpoint-card"><h3>Keys</h3><p>Clients hex-encode the key; the server expects exactly 32 hex characters (16 bytes).</p></div>
            <div class="endpoint-card"><h3>Data</h3><p>Always hexadecimal. Encrypt accepts any length; decrypt requires a non-empty multiple of 16 bytes.</p></div>
            <div class="endpoint-card"><h3>IVs</h3><p>CBC requires a 16-byte IV. Never reuse an IV with the same key.</p></div>
            <div class="endpoint-card"><h3>Security</h3><p>Educational implementation. For production prefer authenticated encryption (AES-GCM) with server-side keys.</p></div>
          </div>
        </div></div>
      </div></section>
  `);
  document.querySelectorAll('.docs-nav a[href^="#"]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  const sectionLinks = [...document.querySelectorAll('.docs-nav a[href^="#"]')];
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)[0];
    if (!visible) return;
    sectionLinks.forEach((link) => link.classList.toggle('selected', link.getAttribute('href') === `#${visible.target.id}`));
  }, { rootMargin: '-18% 0px -65% 0px', threshold: 0 });
  document.querySelectorAll('.doc-section').forEach((section) => sectionObserver.observe(section));
  bindApiConsole();
}

function bindApiConsole() {
  const send = document.querySelector('#console-send');
  if (!send) return;
  const targetEl = document.querySelector('#console-target');
  const statusText = document.querySelector('#console-status-text');
  const statusDot = document.querySelector('#console-status .resp-dot');
  const bodyEl = document.querySelector('#console-body');
  const keyEl = document.querySelector('#console-key');
  const dataEl = document.querySelector('#console-data');
  const ivEl = document.querySelector('#console-iv');
  const ivField = document.querySelector('.console-iv');
  const copyBtn = document.querySelector('#console-copy');
  const opButtons = [...document.querySelectorAll('[data-console-op]')];
  const modeButtons = [...document.querySelectorAll('[data-console-mode]')];
  let operation = 'encrypt';
  let mode = 'ecb';

  const encodeHex = (value) => (/^[0-9a-fA-F]+$/.test(value) && value.length % 2 === 0)
    ? value.toLowerCase()
    : hex(bytes(value));

  const setStatus = (dotClass, text) => {
    statusDot.className = dotClass ? `resp-dot ${dotClass}` : 'resp-dot';
    statusText.textContent = text;
  };

  const renderBody = (text, placeholder) => {
    bodyEl.classList.toggle('resp-placeholder', placeholder);
    bodyEl.textContent = text;
  };

  targetEl.textContent = `/api/${operation}`;
  ivField.style.display = 'none';

  opButtons.forEach((button) => button.addEventListener('click', () => {
    operation = button.dataset.consoleOp;
    opButtons.forEach((item) => item.classList.toggle('active', item === button));
    targetEl.textContent = `/api/${operation}`;
  }));

  modeButtons.forEach((button) => button.addEventListener('click', () => {
    mode = button.dataset.consoleMode;
    modeButtons.forEach((item) => item.classList.toggle('active', item === button));
    ivField.style.display = mode === 'cbc' ? '' : 'none';
  }));

  copyBtn.addEventListener('click', async () => {
    const content = bodyEl.textContent;
    if (!content || bodyEl.classList.contains('resp-placeholder')) return;
    await navigator.clipboard?.writeText(content);
  });

  send.addEventListener('click', async () => {
    send.disabled = true;
    setStatus('pending', 'Sending request…');
    renderBody('Working…', true);
    const started = performance.now();
    try {
      const payload = {
        key: encodeHex(keyEl.value),
        data: encodeHex(dataEl.value),
        mode,
        iv: mode === 'cbc' ? encodeHex(ivEl.value) : null,
      };
      const response = await fetch(`${apiUrl}/${operation}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const elapsed = Math.max(1, Math.round(performance.now() - started));
      const raw = await response.text();
      let pretty = raw;
      try {
        pretty = JSON.stringify(JSON.parse(raw), null, 2);
      } catch (_) {
        // keep raw text for non-JSON bodies
      }
      setStatus(response.ok ? 'ok' : 'err', `HTTP ${response.status} · ${elapsed} ms`);
      renderBody(pretty, false);
    } catch (error) {
      setStatus('err', 'Request failed');
      renderBody(String((error && error.message) || error), false);
    } finally {
      send.disabled = false;
    }
  });
}

function playground() {
  layout(`
    <section class="playground page-enter"><div class="play-head"><div><div class="eyebrow"><span class="pulse"></span> Live execution environment</div><h1>Run the <em>cipher.</em></h1><p>Put bytes through the machine and inspect the result immediately.</p></div><div class="run-state" aria-live="polite"><span class="green">●</span> Ready to execute</div></div>
      <div class="lab-grid"><form class="control-panel" id="cipher-form"><label for="input-text">${state.operation === 'encrypt' ? 'Input message' : 'Ciphertext (hex)'}</label><textarea id="input-text" rows="5">${esc(state.text)}</textarea><label for="input-key">Secret key <span class="mono hint">16 bytes</span></label><input id="input-key" value="${esc(state.key)}" maxlength="16"/><div class="operation-row"><button type="button" class="operation ${state.operation === 'encrypt' ? 'active' : ''}" data-operation="encrypt"><span aria-hidden="true">↗</span> Encrypt</button><button type="button" class="operation ${state.operation === 'decrypt' ? 'active' : ''}" data-operation="decrypt"><span aria-hidden="true">↙</span> Decrypt</button></div><div class="mode-row"><button type="button" class="mode ${state.mode === 'ecb' ? 'active' : ''}" data-mode="ecb">ECB</button><button type="button" class="mode ${state.mode === 'cbc' ? 'active' : ''}" data-mode="cbc">CBC</button></div><button class="button primary execute" type="submit"><span class="play">▶</span> Execute ${state.operation === 'encrypt' ? 'encryption' : 'decryption'}</button><p class="form-error" id="form-error">${esc(state.error)}</p></form>
        <div class="output-panel"><div class="panel-head"><span class="mono" id="output-label">${state.operation === 'encrypt' ? 'OUTPUT / HEX' : 'OUTPUT / TEXT'}</span><button type="button" class="copy" id="copy-output" aria-label="Copy ${state.operation === 'encrypt' ? 'ciphertext' : 'plaintext'}" title="Copy ${state.operation === 'encrypt' ? 'ciphertext' : 'plaintext'}" ${state.output ? '' : 'disabled'}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button></div><div class="output-value mono ${state.output ? 'has-output' : ''}" id="output-value" aria-live="polite" aria-atomic="true">${state.output ? outputMarkup(state.output) : emptyOutputMarkup()}</div><div class="trace-head"><span>Round trace</span><span class="mono">10 steps</span></div><div class="trace" id="trace">${traceRows()}</div></div></div>
      <div class="play-foot"><span class="mono">⌘ ENTER</span><span>Input is padded with PKCS#7 before encryption.</span><a href="#/docs">Read how it works ↗</a></div></section>
  `);
  const form = document.querySelector('#cipher-form');
  const text = document.querySelector('#input-text');
  const key = document.querySelector('#input-key');
  document.querySelectorAll('.operation').forEach((button) => button.addEventListener('click', () => {
    state.operation = button.dataset.operation;
    if (state.operation === 'decrypt' && state.ciphertext) state.text = state.ciphertext;
    document.querySelectorAll('.operation').forEach((item) => item.classList.toggle('active', item === button));
    document.querySelector('#input-text').value = state.text;
    document.querySelector('#input-text').previousElementSibling.textContent = state.operation === 'encrypt' ? 'Input message' : 'Ciphertext (hex)';
    document.querySelector('.execute').lastChild.textContent = ` Execute ${state.operation === 'encrypt' ? 'encryption' : 'decryption'}`;
    document.querySelector('#output-label').textContent = state.operation === 'encrypt' ? 'OUTPUT / HEX' : 'OUTPUT / TEXT';
    document.querySelector('#copy-output').setAttribute('aria-label', `Copy ${state.operation === 'encrypt' ? 'ciphertext' : 'plaintext'}`);
    document.querySelector('#copy-output').setAttribute('title', `Copy ${state.operation === 'encrypt' ? 'ciphertext' : 'plaintext'}`);
    document.querySelector('#copy-output').disabled = true;
    document.querySelector('#output-value').innerHTML = emptyOutputMarkup();
    state.output = '';
    document.querySelector('.run-state').innerHTML = '<span class="green">●</span> Ready to execute';
    document.querySelector('#form-error').textContent = '';
  }));
  document.querySelectorAll('.mode').forEach((button) => button.addEventListener('click', () => { state.mode = button.dataset.mode; document.querySelectorAll('.mode').forEach((item) => item.classList.toggle('active', item === button)); }));
  form.addEventListener('submit', (event) => { event.preventDefault(); execute(text.value, key.value); });
  document.querySelector('#copy-output').addEventListener('click', async (event) => {
    if (!state.output) return;
    await navigator.clipboard?.writeText(state.output);
    const button = event.currentTarget;
    button.classList.remove('turn');
    void button.offsetWidth;
    button.classList.add('turn');
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"></path></svg>';
    button.setAttribute('aria-label', 'Ciphertext copied');
    button.setAttribute('title', 'Ciphertext copied');
    window.setTimeout(() => {
      button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
      button.classList.remove('turn');
      button.setAttribute('aria-label', 'Copy ciphertext');
      button.setAttribute('title', 'Copy ciphertext');
    }, 1400);
  });
}

function traceRows() {
  return ['AddRoundKey', 'SubBytes', 'ShiftRows', 'MixColumns', 'AddRoundKey', 'SubBytes', 'ShiftRows', 'MixColumns', 'AddRoundKey', 'Final round'].map((name, index) => `<div class="trace-row ${index === state.activeRound ? 'current' : ''}"><span class="trace-dot"></span><span>${name}</span><span class="mono">${String(index + 1).padStart(2, '0')}</span></div>`).join('');
}

function emptyOutputMarkup() {
  const description = state.operation === 'encrypt' ? 'Encrypted bytes will appear here' : 'Decrypted text will appear here';
  return `<div class="output-placeholder"><span class="cipher-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg></span><span>Ready for execution</span><small>${description}</small></div>`;
}

function outputMarkup(value) {
  return `<div class="cipher-result"><span class="cipher-icon complete" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3M9 15l2 2 4-4"></path></svg></span><span>${esc(value)}</span></div>`;
}

function showEncrypting() {
  revealToken += 1;
  const outputElement = document.querySelector('#output-value');
  if (outputElement) {
    document.querySelector('#copy-output').disabled = true;
    outputElement.classList.remove('has-output');
    outputElement.innerHTML = `<div class="encrypting-state"><span class="cipher-icon spinning" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg></span><span>${state.operation === 'encrypt' ? 'Encrypting' : 'Decrypting'}<span class="typing-dots"><i>.</i><i>.</i><i>.</i></span></span><small>${state.operation === 'encrypt' ? 'Transforming plaintext into ciphertext' : 'Restoring plaintext from ciphertext'}</small></div>`;
  }
}

function revealOutput(value) {
  const token = ++revealToken;
  const outputElement = document.querySelector('#output-value');
  if (!outputElement) return;
  outputElement.classList.add('has-output');
  document.querySelector('#copy-output').disabled = false;
  outputElement.innerHTML = outputMarkup('');
  const valueElement = outputElement.querySelector('.cipher-result > span:last-child');
  if (!valueElement) return;
  valueElement.textContent = '';
  value.split('').forEach((character, index) => {
    window.setTimeout(() => {
      if (token === revealToken) valueElement.textContent += character;
    }, index * 12);
  });
}

async function execute(text, key) {
  state.text = text; state.key = key; state.error = '';
  const errorElement = document.querySelector('#form-error');
  const runStateElement = document.querySelector('.run-state');
  const submitButton = document.querySelector('.execute');
  if (bytes(key).length !== 16) {
    state.error = 'Key must encode to exactly 16 UTF-8 bytes.';
    if (errorElement) errorElement.textContent = state.error;
    return;
  }

  if (errorElement) errorElement.textContent = '';
  if (runStateElement) runStateElement.innerHTML = `<span class="orange">●</span> ${state.operation === 'encrypt' ? 'Encrypting' : 'Decrypting'}...`;
  showEncrypting();
  if (submitButton) submitButton.disabled = true;
  try {
    const apiData = state.operation === 'encrypt' ? hex(bytes(text)) : text.trim();
    const apiResponse = await fetch(`${apiUrl}/${state.operation}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: hex(bytes(key)),
        data: apiData,
        mode: state.mode,
        iv: state.mode === 'cbc' ? '00000000000000000000000000000000' : null,
      }),
    });
    if (apiResponse.ok) {
      const apiPayload = await apiResponse.json();
      if (state.operation === 'encrypt') {
        state.ciphertext = apiPayload.data;
        state.output = state.ciphertext;
      } else {
        state.output = new TextDecoder().decode(hexToBytes(apiPayload.data));
      }
      state.activeRound = 9;
      revealOutput(state.output);
      document.querySelectorAll('.trace-row').forEach((row, index) => row.classList.toggle('current', index === state.activeRound));
      if (runStateElement) runStateElement.innerHTML = '<span class="green">●</span> Execution complete';
      return;
    }
    throw new Error(await errorMessage(apiResponse));
  } catch (error) {
    state.error = error.message || 'Encryption failed.';
    if (errorElement) errorElement.textContent = state.error;
    if (runStateElement) runStateElement.innerHTML = '<span class="orange">●</span> Execution failed';
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}

function render() { const route = window.location.hash || '#/'; if (route.startsWith('#/docs')) docs(); else if (route.startsWith('#/playground')) playground(); else home(); }
window.addEventListener('hashchange', render); render();
