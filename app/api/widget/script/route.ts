export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const captchaId = searchParams.get('id');
  const theme = searchParams.get('theme') || 'light';
  const size = searchParams.get('size') || 'normal';

  if (!captchaId) {
    return new Response('Missing captcha ID parameter', { status: 400 });
  }

  const widgetScript = `
(function() {
  const CAPTCHA_API_BASE = '${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/widget';
  const CAPTCHA_ID = '${captchaId}';
  const THEME = '${theme}';
  const SIZE = '${size}';

  // CSS para el widget
  const CSS = \`
    .art-captcha-widget {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      max-width: 400px;
      margin: 20px 0;
      border: 1px solid \${THEME === 'dark' ? '#374151' : '#d1d5db'};
      border-radius: 8px;
      background: \${THEME === 'dark' ? '#1f2937' : '#ffffff'};
      color: \${THEME === 'dark' ? '#f9fafb' : '#111827'};
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }

    .art-captcha-header {
      padding: 16px;
      border-bottom: 1px solid \${THEME === 'dark' ? '#374151' : '#e5e7eb'};
      font-weight: 600;
      font-size: 14px;
    }

    .art-captcha-content {
      padding: 16px;
    }

    .art-captcha-image-container {
      position: relative;
      margin-bottom: 16px;
    }

    .art-captcha-image {
      width: 100%;
      height: auto;
      border-radius: 6px;
      display: block;
    }

    .art-captcha-grid {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: grid;
      gap: 2px;
      padding: 2px;
      pointer-events: auto;
    }

    .art-captcha-cell {
      background: transparent;
      border: 2px solid rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .art-captcha-cell:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.8);
    }

    .art-captcha-cell.selected {
      background: rgba(34, 197, 94, 0.5);
      border-color: rgba(34, 197, 94, 0.8);
    }

    .art-captcha-instructions {
      font-size: 12px;
      color: \${THEME === 'dark' ? '#9ca3af' : '#6b7280'};
      margin-bottom: 12px;
    }

    .art-captcha-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .art-captcha-button {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .art-captcha-verify-btn {
      background: \${THEME === 'dark' ? '#2563eb' : '#3b82f6'};
      color: white;
    }

    .art-captcha-verify-btn:hover {
      background: \${THEME === 'dark' ? '#1d4ed8' : '#2563eb'};
    }

    .art-captcha-verify-btn:disabled {
      background: \${THEME === 'dark' ? '#374151' : '#9ca3af'};
      cursor: not-allowed;
    }

    .art-captcha-refresh-btn {
      background: transparent;
      color: \${THEME === 'dark' ? '#9ca3af' : '#6b7280'};
      border: 1px solid \${THEME === 'dark' ? '#374151' : '#d1d5db'};
    }

    .art-captcha-refresh-btn:hover {
      background: \${THEME === 'dark' ? '#374151' : '#f3f4f6'};
    }

    .art-captcha-status {
      font-size: 12px;
      padding: 8px;
      border-radius: 6px;
      margin-top: 12px;
      text-align: center;
    }

    .art-captcha-status.success {
      background: rgba(34, 197, 94, 0.1);
      color: \${THEME === 'dark' ? '#4ade80' : '#16a34a'};
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .art-captcha-status.error {
      background: rgba(239, 68, 68, 0.1);
      color: \${THEME === 'dark' ? '#f87171' : '#dc2626'};
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .art-captcha-loading {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid \${THEME === 'dark' ? '#374151' : '#e5e7eb'};
      border-radius: 50%;
      border-top-color: \${THEME === 'dark' ? '#60a5fa' : '#3b82f6'};
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .art-captcha-small .art-captcha-widget {
      max-width: 300px;
    }

    .art-captcha-large .art-captcha-widget {
      max-width: 500px;
    }
  \`;

  class ArtCaptchaWidget {
    constructor(container, options = {}) {
      this.container = container;
      this.captchaId = CAPTCHA_ID;
      this.selectedCells = [];
      this.captchaData = null;
      this.verified = false;
      this.sessionToken = this.generateSessionToken();
      this.options = {
        onSuccess: options.onSuccess || (() => {}),
        onError: options.onError || (() => {}),
        onReset: options.onReset || (() => {}),
        ...options
      };

      this.init();
    }

    generateSessionToken() {
      return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    async init() {
      this.injectStyles();
      await this.loadCaptcha();
      this.render();
    }

    injectStyles() {
      if (!document.getElementById('art-captcha-styles')) {
        const style = document.createElement('style');
        style.id = 'art-captcha-styles';
        style.textContent = CSS;
        document.head.appendChild(style);
      }
    }

    async loadCaptcha() {
      try {
        const response = await fetch(\`\${CAPTCHA_API_BASE}/captcha/\${this.captchaId}\`);
        if (!response.ok) throw new Error('Failed to load captcha');
        this.captchaData = await response.json();
      } catch (error) {
        console.error('Error loading captcha:', error);
        this.showError('Failed to load captcha. Please try again.');
      }
    }

    render() {
      if (!this.captchaData) return;

      const [rows, cols] = this.captchaData.gridType.split('x').map(Number);

      this.container.className = \`art-captcha-container art-captcha-\${SIZE}\`;
      this.container.innerHTML = \`
        <div class="art-captcha-widget">
          <div class="art-captcha-header">
            🛡️ Security Verification
          </div>
          <div class="art-captcha-content">
            <div class="art-captcha-instructions">
              Select all squares that match the criteria for "\${this.captchaData.name}".
              Required accuracy: \${this.captchaData.accuracyPercentage}%
            </div>
            <div class="art-captcha-image-container">
              <img
                src="\${this.captchaData.imageUrl}"
                alt="Captcha challenge"
                class="art-captcha-image"
                crossorigin="anonymous"
              >
              <div
                class="art-captcha-grid"
                style="grid-template-columns: repeat(\${cols}, 1fr); grid-template-rows: repeat(\${rows}, 1fr);"
              >
                \${Array.from({length: rows * cols}, (_, i) =>
                  \`<button
                    type="button"
                    class="art-captcha-cell"
                    data-index="\${i}"
                    onclick="window.artCaptchaInstance.toggleCell(\${i})"
                  ></button>\`
                ).join('')}
              </div>
            </div>
            <div class="art-captcha-footer">
              <button
                type="button"
                class="art-captcha-button art-captcha-refresh-btn"
                onclick="window.artCaptchaInstance.reset()"
              >
                🔄 Reset
              </button>
              <button
                type="button"
                class="art-captcha-button art-captcha-verify-btn"
                onclick="window.artCaptchaInstance.verify()"
                id="art-captcha-verify-btn"
              >
                Verify
              </button>
            </div>
            <div id="art-captcha-status" class="art-captcha-status" style="display: none;"></div>
          </div>
        </div>
      \`;

      // Almacenar la instancia globalmente para los event handlers
      window.artCaptchaInstance = this;
    }

    toggleCell(index) {
      if (this.verified) return;

      const cell = this.container.querySelector(\`[data-index="\${index}"]\`);
      const isSelected = this.selectedCells.includes(index);

      if (isSelected) {
        this.selectedCells = this.selectedCells.filter(i => i !== index);
        cell.classList.remove('selected');
      } else {
        this.selectedCells.push(index);
        cell.classList.add('selected');
      }
    }

    async verify() {
      if (this.selectedCells.length === 0) {
        this.showError('Please select at least one cell.');
        return;
      }

      this.showLoading();

      try {
        const response = await fetch(\`\${CAPTCHA_API_BASE}/verify\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            captchaId: this.captchaId,
            selectedCells: this.selectedCells,
            sessionToken: this.sessionToken
          })
        });

        const result = await response.json();

        if (result.success) {
          this.verified = true;
          this.showSuccess(\`Verification successful! Accuracy: \${result.accuracy}%\`);
          this.options.onSuccess(result.verificationToken);
          this.disableInteraction();
        } else {
          this.showError(result.message || 'Verification failed. Please try again.');
          this.options.onError(result);
        }
      } catch (error) {
        console.error('Error verifying captcha:', error);
        this.showError('Network error. Please try again.');
        this.options.onError(error);
      }
    }

    reset() {
      this.selectedCells = [];
      this.verified = false;
      this.sessionToken = this.generateSessionToken();

      // Limpiar selecciones visuales
      this.container.querySelectorAll('.art-captcha-cell').forEach(cell => {
        cell.classList.remove('selected');
      });

      this.hideStatus();
      this.enableInteraction();
      this.options.onReset();
    }

    showLoading() {
      const btn = this.container.querySelector('#art-captcha-verify-btn');
      btn.disabled = true;
      btn.innerHTML = '<div class="art-captcha-loading"></div> Verifying...';
      this.hideStatus();
    }

    showSuccess(message) {
      const status = this.container.querySelector('#art-captcha-status');
      status.className = 'art-captcha-status success';
      status.textContent = '✅ ' + message;
      status.style.display = 'block';

      const btn = this.container.querySelector('#art-captcha-verify-btn');
      btn.disabled = true;
      btn.textContent = '✅ Verified';
    }

    showError(message) {
      const status = this.container.querySelector('#art-captcha-status');
      status.className = 'art-captcha-status error';
      status.textContent = '❌ ' + message;
      status.style.display = 'block';

      const btn = this.container.querySelector('#art-captcha-verify-btn');
      btn.disabled = false;
      btn.textContent = 'Verify';
    }

    hideStatus() {
      const status = this.container.querySelector('#art-captcha-status');
      if (status) status.style.display = 'none';
    }

    disableInteraction() {
      this.container.querySelectorAll('.art-captcha-cell').forEach(cell => {
        cell.style.pointerEvents = 'none';
        cell.style.opacity = '0.6';
      });
    }

    enableInteraction() {
      this.container.querySelectorAll('.art-captcha-cell').forEach(cell => {
        cell.style.pointerEvents = 'auto';
        cell.style.opacity = '1';
      });
    }

    isVerified() {
      return this.verified;
    }
  }

  // API pública para inicializar el widget
  window.ArtCaptcha = {
    init: function(container, options = {}) {
      const element = typeof container === 'string'
        ? document.querySelector(container)
        : container;

      if (!element) {
        console.error('ArtCaptcha: Container element not found');
        return null;
      }

      return new ArtCaptchaWidget(element, options);
    }
  };

  // Auto-inicializar si hay elementos con data-art-captcha
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-art-captcha]').forEach(element => {
      const captchaId = element.getAttribute('data-art-captcha');
      if (captchaId === CAPTCHA_ID) {
        window.ArtCaptcha.init(element);
      }
    });
  });
})();
`;

  return new Response(widgetScript, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
    },
  });
}
