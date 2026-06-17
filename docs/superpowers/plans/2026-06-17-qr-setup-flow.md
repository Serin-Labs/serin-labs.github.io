# QR Setup Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After HomeKit firmware is flashed, persist device data to localStorage so the flash page shows a clear vertical step-by-step QR banner and the setup page renders WiFi + HomeKit QR codes inline without requiring the user to return to the flash page.

**Architecture:** Three coordinated changes — new CSS classes in `main.css`, banner HTML/JS redesign in `flash.html` (including localStorage save), and setup page restructuring in `homekit/setup.html` (step reorder + localStorage-driven QR injection). No new files; no URL params; one shared localStorage key `serin_last_device`.

**Tech Stack:** Vanilla JS, HTML, CSS custom properties. `qrcodejs` (already loaded on `flash.html` via CDN; must be added to `homekit/setup.html`).

## Global Constraints

- localStorage key: `serin_last_device` (exact string — both files must use this)
- QR library: `https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js` with existing SRI hash already in `flash.html` — use the same tag verbatim on `homekit/setup.html`
- QR sizes: 96×96px in flash banner, 96×96px on setup page (minimum for reliable phone scanning)
- Expiry: 30 days (`30 * 24 * 60 * 60 * 1000` ms) from `savedAt`
- All new CSS classes use existing design tokens (`var(--homekit)`, `var(--border)`, `var(--fg)`, `var(--secondary)`, `var(--radius-md)`)
- Do not touch ESPHome paths, troubleshooting, OTA, or Web UI sections
- Do not rename or remove existing IDs: `wifi-qr`, `homekit-qr`, `flash-ap-ssid`, `flash-hk-code`, `flash-device-banner` — JS references these

---

### Task 1: CSS — Add flash-step and hk-* classes to main.css

**Files:**
- Modify: `assets/css/main.css` (after line 554, after `.flash-device-banner__qr-label` block)

**Interfaces:**
- Produces: `.flash-step`, `.flash-step-pill`, `.flash-step-qr`, `.flash-step-text`, `.flash-step-divider`, `.hk-saved-banner`, `.hk-inline-qr-row`, `.hk-inline-qr-text` — used by Tasks 2 and 3

- [ ] **Step 1: Open `assets/css/main.css` and locate the end of the flash banner block**

  Find line ~554 (`.flash-device-banner__qr-label` closing brace). Insert the following block immediately after:

  ```css
  .flash-step {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.4rem 0;
  }
  .flash-step-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--homekit);
    color: #fff;
    font-size: 0.68rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .flash-step-qr {
    flex-shrink: 0;
    text-align: center;
  }
  .flash-step-text {
    font-size: 0.78rem;
    color: var(--fg);
    line-height: 1.5;
  }
  .flash-step-divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: 0.2rem 0;
  }
  .hk-saved-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #D1FAE5;
    border-left: 3px solid #10B981;
    border-radius: var(--radius-md);
    background: #F0FDF4;
    padding: 0.55rem 0.85rem;
    margin: 0.75rem 0;
    font-size: 0.88rem;
  }
  .hk-saved-banner button {
    font-size: 0.75rem;
    color: var(--secondary);
    text-decoration: underline;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
  }
  .hk-inline-qr-row {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    margin: 0.5rem 0 0.25rem;
  }
  .hk-inline-qr-text {
    font-size: 0.88rem;
    line-height: 1.55;
  }
  ```

- [ ] **Step 2: Verify no existing class names conflict**

  Run:
  ```bash
  grep -n "flash-step\|hk-saved-banner\|hk-inline-qr" assets/css/main.css
  ```
  Expected: only the lines you just added (no pre-existing matches).

- [ ] **Step 3: Commit**

  ```bash
  git add assets/css/main.css
  git commit -m "Add CSS classes for QR setup flow (flash steps, setup page inline QR)"
  ```

---

### Task 2: Flash page — vertical banner, localStorage save, demote next-steps link

**Files:**
- Modify: `flash.html` lines 57–74 (banner body HTML), lines 193–226 (showBanner JS), lines 109–116 (selectPlatform JS), lines 76–79 (next-steps HTML)

**Interfaces:**
- Consumes: `.flash-step`, `.flash-step-pill`, `.flash-step-qr`, `.flash-step-text`, `.flash-step-divider` from Task 1
- Produces: `localStorage['serin_last_device']` — consumed by Task 3

- [ ] **Step 1: Replace the banner body HTML**

  In `flash.html`, find and replace the entire `<div class="flash-device-banner__body">…</div>` block (currently lines 58–74):

  **Remove:**
  ```html
      <div class="flash-device-banner__body">
        <div class="flash-device-banner__qr">
          <div id="wifi-qr"></div>
          <p class="flash-device-banner__qr-label">WiFi Setup</p>
        </div>
        <div class="flash-device-banner__qr">
          <div id="homekit-qr"></div>
          <p class="flash-device-banner__qr-label">HomeKit Pair</p>
        </div>
        <div>
          <p><strong>Flash complete!</strong> Connect to your device's setup network:</p>
          <p>Network: <strong><code id="flash-ap-ssid">Serin-XXXX</code></strong></p>
          <p>Password: <code>serinlabs</code></p>
          <p>HomeKit code: <strong><code id="flash-hk-code">XXX-XX-XXX</code></strong></p>
        </div>
      </div>
  ```

  **Insert:**
  ```html
      <p><strong>Flash complete!</strong> Follow these steps to finish setup:</p>
      <div class="flash-step">
        <span class="flash-step-pill">1</span>
        <div class="flash-step-qr">
          <div id="wifi-qr"></div>
          <p class="flash-device-banner__qr-label">WiFi</p>
        </div>
        <span class="flash-step-text">Scan to join <strong><code id="flash-ap-ssid">Serin-XXXX</code></strong> &middot; pw: <code>serinlabs</code></span>
      </div>
      <hr class="flash-step-divider">
      <div class="flash-step">
        <span class="flash-step-pill">2</span>
        <span class="flash-step-text">A page opens on your phone &mdash; enter your home WiFi credentials</span>
      </div>
      <hr class="flash-step-divider">
      <div class="flash-step">
        <span class="flash-step-pill">3</span>
        <div class="flash-step-qr">
          <div id="homekit-qr"></div>
          <p class="flash-device-banner__qr-label">HomeKit</p>
        </div>
        <span class="flash-step-text">Scan to add to Apple Home &middot; Code: <strong><code id="flash-hk-code">XXX-XX-XXX</code></strong></span>
      </div>
  ```

- [ ] **Step 2: Add localStorage save, extract `hapUri`, and update both QR sizes to 96px**

  In `flash.html` inside `showBanner()`, replace the entire `if (typeof QRCode !== 'undefined')` block:

  **Remove:**
  ```js
      if (typeof QRCode !== 'undefined') {
        new QRCode(document.getElementById('wifi-qr'), {
          text: 'WIFI:T:WPA;S:' + apName + ';P:serinlabs;;',
          width: 128, height: 128,
          colorDark: '#000000', colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });

        if (detectedMac) {
          var digits = deriveSetupCode(detectedMac);
          var formatted = digits.slice(0, 3) + '-' + digits.slice(3, 5) + '-' + digits.slice(5);
          document.getElementById('flash-hk-code').textContent = formatted;
          new QRCode(document.getElementById('homekit-qr'), {
            text: setupCodeToHapUri(digits),
            width: 128, height: 128,
            colorDark: '#000000', colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
          });
        }
      }
  ```

  **Insert:**
  ```js
      if (detectedMac) {
        var digits = deriveSetupCode(detectedMac);
        var formatted = digits.slice(0, 3) + '-' + digits.slice(3, 5) + '-' + digits.slice(5);
        var hapUri = setupCodeToHapUri(digits);
        try {
          localStorage.setItem('serin_last_device', JSON.stringify({
            mac: detectedMac,
            apName: apName,
            setupCode: formatted,
            hapUri: hapUri,
            wifiQrData: 'WIFI:T:WPA;S:' + apName + ';P:serinlabs;;',
            savedAt: Date.now()
          }));
        } catch(e) {}
        document.getElementById('flash-hk-code').textContent = formatted;
      }

      if (typeof QRCode !== 'undefined') {
        new QRCode(document.getElementById('wifi-qr'), {
          text: 'WIFI:T:WPA;S:' + apName + ';P:serinlabs;;',
          width: 96, height: 96,
          colorDark: '#000000', colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });

        if (detectedMac) {
          new QRCode(document.getElementById('homekit-qr'), {
            text: hapUri,
            width: 96, height: 96,
            colorDark: '#000000', colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
          });
        }
      }
  ```

  Note: `hapUri` is declared by `var` before the QRCode block, so it is in scope inside the `if (typeof QRCode !== 'undefined')` block even though it is assigned in the preceding `if (detectedMac)` block. This is safe because the inner `if (detectedMac)` guard ensures `hapUri` is only used when it was set.

- [ ] **Step 3: Demote next-steps link — remove button styling from HTML**

  Find and replace in `flash.html`:

  **Remove:**
  ```html
    <h2>Next Steps</h2>
    <p>
      <a id="next-steps-link" href="/homekit/setup" class="btn btn-homekit">Continue to HomeKit-Compatible Setup</a>
    </p>
  ```

  **Insert:**
  ```html
    <p><a id="next-steps-link" href="/homekit/setup">Continue to HomeKit-Compatible Setup &rarr;</a></p>
  ```

- [ ] **Step 4: Remove next-steps button class toggling from `selectPlatform()`**

  In `flash.html`, inside `selectPlatform()`, find and remove the two `nextBtn` lines:

  **Remove these two lines:**
  ```js
      nextBtn.classList.toggle('btn-esphome', platform === 'esphome');
      nextBtn.classList.toggle('btn-homekit', platform === 'homekit');
  ```

  Also remove the `var nextBtn` declaration that references `next-steps-link`:
  ```js
      var nextBtn = document.getElementById('next-steps-link');
  ```

- [ ] **Step 5: Verify banner and localStorage in browser**

  Open `flash.html` in Chrome. Flash a device (or manually trigger by running in console):
  ```js
  // Simulate what showBanner does
  console.log('MAC: 12:34:56:78:90:AB');
  console.log('DISCONNECT');
  ```
  Check:
  1. Banner shows three vertical steps with numbered orange pills
  2. `localStorage.getItem('serin_last_device')` returns a JSON string with `apName`, `setupCode`, `hapUri`, `wifiQrData`, `savedAt`
  3. "Continue to HomeKit-Compatible Setup →" is a plain text link, not an orange button

- [ ] **Step 6: Commit**

  ```bash
  git add flash.html
  git commit -m "Redesign post-flash banner as vertical steps, save device to localStorage"
  ```

---

### Task 3: Setup page — reorder steps, add QR blocks, localStorage injection JS

**Files:**
- Modify: `homekit/setup.html` (full restructure of steps 1–3, add script tags and JS block)

**Interfaces:**
- Consumes: `localStorage['serin_last_device']` from Task 2; `.hk-saved-banner`, `.hk-inline-qr-row`, `.hk-inline-qr-text` from Task 1
- Produces: working setup page that shows WiFi + HomeKit QR codes when localStorage data is present

- [ ] **Step 1: Add qrcodejs script tag to `homekit/setup.html`**

  Open `homekit/setup.html`. Add the qrcodejs script tag at the top of the page, directly after the front matter block (after `<div class="home theme-homekit">`), before the `<h1>`:

  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" integrity="sha384-3zSEDfvllQohrq0PHL1fOXJuC/jSOO34H46t6UQfobFOmxE5BpjjaIJY5F2/bMnU" crossorigin="anonymous"></script>
  ```

  (This is the identical tag already in `flash.html` — use the exact same SRI hash.)

- [ ] **Step 2: Add the saved-device banner and intro paragraph**

  After the `<p>` intro paragraph (the one ending "…is required for remote access and automations.") and the `<p><strong>Not certified by Apple…</strong></p>` line, and before the first `<hr>`, insert:

  ```html
  <div id="hk-saved-banner" class="hk-saved-banner" style="display:none">
    ✓ Device from last flash: <strong id="hk-saved-device-name"></strong>
    <button onclick="localStorage.removeItem('serin_last_device');location.reload()">clear</button>
  </div>
  ```

- [ ] **Step 3: Reorder — move HVAC section to Step 1**

  The current file has Step 1 as WiFi and Step 2 as HVAC. Swap them so the order is:

  ```
  <h2>1. Connect to Your HVAC Unit</h2>
  [HVAC ol, installation.jpg, etsy link]
  <hr>
  <h2>2. Connect to WiFi</h2>
  [WiFi content]
  <hr>
  <h2>3. Add to Apple Home</h2>
  ...
  ```

  Cut the entire HVAC block (from `<h2>2. Connect to Your HVAC Unit</h2>` through its closing `<hr>`) and paste it before the WiFi block, then renumber headings:
  - "1. Connect to WiFi" → "2. Connect to WiFi"
  - "2. Connect to Your HVAC Unit" → "1. Connect to Your HVAC Unit"

- [ ] **Step 4: Add WiFi QR block and fallback label in Step 2**

  In the WiFi section (now Step 2), insert immediately after the `<h2>2. Connect to WiFi</h2>` heading, before the `<p>On first boot…</p>` paragraph:

  ```html
  <div id="hk-wifi-qr-block" style="display:none">
    <div class="hk-inline-qr-row">
      <div id="hk-wifi-qr"></div>
      <div class="hk-inline-qr-text">
        Scan with your iPhone to join <strong id="hk-ap-name">Serin-XXXX</strong> &middot; pw: <code>serinlabs</code><br>
        A captive portal opens &mdash; enter your home WiFi credentials. The device saves them and reboots.
      </div>
    </div>
  </div>
  <p id="hk-wifi-fallback-label" style="display:none"><em>No QR code? Use these steps:</em></p>
  ```

- [ ] **Step 5: Add HomeKit QR block and wrap manual options in Step 3**

  In the "Add to Apple Home" section (Step 3), insert immediately after the `<h2>3. Add to Apple Home</h2>` heading (before the `<img src="/assets/media/homekit.png"…>`):

  ```html
  <div id="hk-pair-qr-block" style="display:none">
    <div class="hk-inline-qr-row">
      <div id="hk-pair-qr"></div>
      <div class="hk-inline-qr-text">
        Scan with your iPhone after the device reboots onto your home WiFi.<br>
        Code: <code id="hk-setup-code">XXX-XX-XXX</code>
      </div>
    </div>
  </div>
  ```

  Then wrap the existing Options A/B content in a single div with `id="hk-manual-options"`. The full wrapped block must be exactly:

  ```html
  <div id="hk-manual-options">
    <p>Once connected to WiFi:</p>
    <h3>Option A: Scan QR Code (recommended)</h3>
    <ol>
      <li>In a browser, open the device's web UI at <code>http://Serin-XXXX.local</code> &mdash; <strong>XXXX</strong> is the same suffix as the <code>Serin-XXXX</code> network from Step 2. If <code>.local</code> addresses don't resolve on your network, use <code>http://&lt;device-ip&gt;</code> with the IP from your router.</li>
      <li>Scan the QR code shown in the HomeKit panel with your iPhone or iPad.</li>
    </ol>
    <h3>Option B: Manual Setup Code</h3>
    <ol>
      <li>Open the <strong>Home</strong> app on your iPhone or iPad.</li>
      <li>Tap <strong>+</strong> &gt; <strong>Add Accessory</strong>.</li>
      <li>Tap <strong>More options...</strong> and select <strong>Mini Split XXXX</strong>.</li>
      <li>Enter the setup code shown in the web UI's HomeKit panel.</li>
    </ol>
  </div>
  ```

- [ ] **Step 6: Add localStorage JS block at the bottom of `homekit/setup.html`**

  Before the closing `</div>` of the `.home.theme-homekit` wrapper, insert:

  ```html
  <script>
  (function() {
    var KEY = 'serin_last_device';
    var EXPIRE_MS = 30 * 24 * 60 * 60 * 1000;
    var raw = localStorage.getItem(KEY);
    if (!raw) return;
    var data;
    try { data = JSON.parse(raw); } catch(e) { return; }
    if (!data || (Date.now() - data.savedAt) > EXPIRE_MS) return;

    document.getElementById('hk-saved-device-name').textContent = data.apName;
    document.getElementById('hk-saved-banner').style.display = '';

    document.getElementById('hk-ap-name').textContent = data.apName;
    document.getElementById('hk-wifi-qr-block').style.display = '';
    document.getElementById('hk-wifi-fallback-label').style.display = '';
    new QRCode(document.getElementById('hk-wifi-qr'), {
      text: data.wifiQrData,
      width: 96, height: 96,
      colorDark: '#000000', colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });

    document.getElementById('hk-setup-code').textContent = data.setupCode;
    document.getElementById('hk-pair-qr-block').style.display = '';
    document.getElementById('hk-manual-options').style.display = 'none';
    new QRCode(document.getElementById('hk-pair-qr'), {
      text: data.hapUri,
      width: 96, height: 96,
      colorDark: '#000000', colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  })();
  </script>
  ```

- [ ] **Step 7: Verify setup page in browser — with saved data**

  In Chrome DevTools console on `homekit/setup.html`, run:
  ```js
  localStorage.setItem('serin_last_device', JSON.stringify({
    mac: [0x12,0x34,0x56,0x78,0x90,0xAB],
    apName: 'Serin-90AB',
    setupCode: '123-45-678',
    hapUri: 'X-HM://009Q3OZL4MCAC',
    wifiQrData: 'WIFI:T:WPA;S:Serin-90AB;P:serinlabs;;',
    savedAt: Date.now()
  }));
  location.reload();
  ```
  Check:
  1. Green "✓ Device from last flash: Serin-90AB" banner appears
  2. Step 1 is HVAC (installation.jpg visible)
  3. Step 2 shows WiFi QR + "Serin-90AB" text above the manual ol
  4. Step 3 shows HomeKit QR + "123-45-678" code; Options A/B are hidden
  5. Clicking "clear" removes the banner and restores the manual steps

- [ ] **Step 8: Verify setup page in browser — without saved data**

  Run `localStorage.removeItem('serin_last_device')` then reload. Check:
  1. No green banner
  2. Step 2 shows manual WiFi steps only (no QR block)
  3. Step 3 shows Options A/B only (no QR block)
  4. All other steps unchanged

- [ ] **Step 9: Commit**

  ```bash
  git add homekit/setup.html
  git commit -m "Reorder setup steps, add localStorage-driven QR codes for WiFi and HomeKit"
  ```
