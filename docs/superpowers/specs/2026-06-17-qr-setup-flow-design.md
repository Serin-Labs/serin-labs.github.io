# QR Code Setup Flow Design

**Date:** 2026-06-17  
**Status:** Approved  
**Scope:** `flash.html` and `homekit/setup.html`

## Overview

After flashing HomeKit firmware, users can now complete WiFi provisioning and HomeKit pairing by scanning two QR codes — no manual network navigation required. This spec covers:

1. A redesigned post-flash banner on `flash.html` (vertical step-by-step layout)
2. localStorage persistence of device data after flash
3. A revised `homekit/setup.html` that reads saved data and renders QR codes inline

## Flash Page Changes (`flash.html`)

### localStorage Persistence

After flash completes and the MAC is detected, save device data to `localStorage` under key `serin_last_device`:

```js
{
  mac: [0x12, 0x34, ...],   // 6-byte array (integers)
  apName: "Serin-90AB",
  setupCode: "XXX-XX-XXX",  // formatted 8-digit HAP code
  hapUri: "X-HM://...",     // full HAP URI for QR generation
  wifiQrData: "WIFI:T:WPA;S:Serin-90AB;P:serinlabs;;",
  savedAt: 1234567890        // Date.now() timestamp
}
```

Save immediately before calling `showBanner()`. Overwrite any previous entry (one device stored at a time).

### Post-Flash Banner Redesign

Replace the current flex-row `flash-device-banner__body` layout with a **vertical step-by-step** layout. Three rows, separated by dividers:

| Row | QR | Text |
|-----|----|------|
| Step 1 | WiFi QR (small, ~44px) | "Scan to join `Serin-XXXX` · pw: `serinlabs`" |
| Step 2 | — (no QR) | "A page opens on your phone — enter your home WiFi credentials" |
| Step 3 | HomeKit QR (small, ~44px) | "Scan to add to Apple Home · Code: `XXX-XX-XXX`" |

Each row: flex row, step number pill (orange circle), optional QR block, text block. Rows separated by `<hr>` styled as a subtle divider.

The "Continue to HomeKit-Compatible Setup →" button is demoted: smaller, secondary style, moved below the banner as a plain text link ("Need the full guide? See setup docs →").

### CSS Changes

Add new CSS classes:
- `.flash-step` — flex row, `align-items: center`, `gap: 0.6rem`, `padding: 0.4rem 0`
- `.flash-step-pill` — 20×20px orange circle with white number
- `.flash-step-qr` — wraps the 44×44 QR div + label underneath
- `.flash-step-text` — `font-size: 0.78rem`, `color: var(--fg)`
- `.flash-step-divider` — `border-top: 1px solid var(--border)`, `margin: 0.2rem 0`

## Setup Page Changes (`homekit/setup.html`)

### On-Load Behaviour

On `DOMContentLoaded`, read `serin_last_device` from localStorage. If present and `savedAt` is less than 30 days old:

1. Show a green saved-device banner below the intro paragraph
2. Generate QR codes and inject them into Steps 2 and 3

If not present (or expired), all steps show the manual path only — no visual change from current.

### Saved Device Banner

```html
<div id="hk-saved-banner" class="hk-saved-banner" style="display:none">
  ✓ Device from last flash: <strong id="hk-saved-device-name"></strong>
  <button onclick="localStorage.removeItem('serin_last_device');location.reload()">clear</button>
</div>
```

- Green left-border callout (`border-left: 3px solid #10B981`, `background: #F0FDF4`)
- `id="hk-saved-banner"` — hidden by default, shown by JS
- `id="hk-saved-device-name"` — filled with `data.apName` by JS
- "clear" button: calls `localStorage.removeItem('serin_last_device')` then `location.reload()`

### Revised Step Order

| # | Step | Change |
|---|------|--------|
| 1 | Connect to Your HVAC Unit | **Moved up** (was step 2) |
| 2 | Connect to WiFi | **WiFi QR injected inline** when localStorage data present |
| 3 | Add to Apple Home | **HomeKit QR injected inline** when localStorage data present |
| 4 | Access Web UI | No change |
| 5 | OTA Updates | No change (was step 5) |
| 6 | Troubleshooting | No change (was step 6) |

### Step 2 — WiFi (with saved data)

Inject before the existing `<ol>` in Step 2:

```html
<div id="hk-wifi-qr-block" style="display:none">
  <div class="hk-inline-qr-row">
    <div id="hk-wifi-qr"></div>
    <div class="hk-inline-qr-text">
      Scan to join <strong id="hk-ap-name">Serin-XXXX</strong>
      · pw: <code>serinlabs</code><br>
      A captive portal opens — enter your home WiFi credentials.
    </div>
  </div>
</div>
```

Existing manual instructions remain below, prefixed with "No QR? " when saved data is present.

### Step 3 — HomeKit (with saved data)

Replace the current Options A/B structure when saved data is present:

```html
<div id="hk-pair-qr-block" style="display:none">
  <div class="hk-inline-qr-row">
    <div id="hk-pair-qr"></div>
    <div class="hk-inline-qr-text">
      Scan with your iPhone after the device reboots.<br>
      Code: <code id="hk-setup-code">XXX-XX-XXX</code>
    </div>
  </div>
</div>
```

Existing Option A/B fallback remains visible below when no saved data, hidden when data present (to reduce clutter).

### New CSS Classes

- `.hk-saved-banner` — green left-border callout, flex row, space-between
- `.hk-inline-qr-row` — flex row, `gap: 0.75rem`, `align-items: flex-start`, `margin: 0.5rem 0`
- `.hk-inline-qr-text` — `font-size: 0.82rem`, `line-height: 1.5`

QR canvases sized at 80×80px (larger than flash banner, since setup page has more room).

### JS on Setup Page

```js
(function() {
  var KEY = 'serin_last_device';
  var EXPIRE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

  var raw = localStorage.getItem(KEY);
  if (!raw) return;

  var data;
  try { data = JSON.parse(raw); } catch(e) { return; }
  if (!data || (Date.now() - data.savedAt) > EXPIRE_MS) return;

  // Show saved-device banner
  document.getElementById('hk-saved-device-name').textContent = data.apName;
  document.getElementById('hk-saved-banner').style.display = '';

  // Inject WiFi QR at step 2
  document.getElementById('hk-ap-name').textContent = data.apName;
  document.getElementById('hk-wifi-qr-block').style.display = '';
  new QRCode(document.getElementById('hk-wifi-qr'), {
    text: data.wifiQrData, width: 80, height: 80,
    colorDark: '#000', colorLight: '#fff',
    correctLevel: QRCode.CorrectLevel.M
  });

  // Inject HomeKit QR at step 3
  document.getElementById('hk-setup-code').textContent = data.setupCode;
  document.getElementById('hk-pair-qr-block').style.display = '';
  new QRCode(document.getElementById('hk-pair-qr'), {
    text: data.hapUri, width: 80, height: 80,
    colorDark: '#000', colorLight: '#fff',
    correctLevel: QRCode.CorrectLevel.M
  });

  // Hide manual Option A/B on step 3
  var manualOptions = document.getElementById('hk-manual-options');
  if (manualOptions) manualOptions.style.display = 'none';
})();
```

The `qrcodejs` library is already loaded on `flash.html`; add the same script tag to `homekit/setup.html`.

## What Does Not Change

- ESPHome flash path is unaffected
- MAC detection logic in `flash.html` is unchanged
- HAP URI / setup code derivation logic is unchanged (just also saved to localStorage)
- Troubleshooting, OTA, and Web UI sections are unchanged
- The `homekit.gif` and `hk_wifi_connect.gif` media remain in place

## Out of Scope

- Multi-device localStorage (one device at a time)
- ESPHome setup page QR codes
- Push notifications or re-pairing flows
