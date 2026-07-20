/* QR label scanner — scan the indoor unit's nameplate QR instead of typing.
 *
 * Nameplate QR payloads are plain text "MODEL<spaces>SERIAL", e.g.
 * "MSZ-GL09NA-U1         18E18169". Only the model token is used; the
 * serial is discarded and nothing ever leaves the device.
 *
 * The engine (parseLabelPayload) is pure and exported for tests; DOM wiring
 * at the bottom only runs in a browser. The decode library (vendored
 * nimiq/qr-scanner) is lazy-loaded on first use so the page's initial
 * payload is unchanged when the scanner isn't used.
 */
(function (root) {
  'use strict';

  // First whitespace-delimited token, iff it looks like a model number:
  // led by 2–6 letters, alphanumeric/hyphen throughout, contains a digit.
  // Rejects URLs and serial payloads; letter-led non-model strings (e.g. a
  // drawing number) pass the shape check and land on the checker's
  // "unrecognized model" verdict, which tells the user what to do next.
  function parseLabelPayload(text) {
    var token = (String(text || '').trim().split(/\s+/)[0] || '').toUpperCase();
    if (token.length < 4) return null;
    if (!/^[A-Z]{2,6}[A-Z0-9-]{2,}$/.test(token)) return null;
    if (!/\d/.test(token)) return null;
    return token;
  }

  var api = { parseLabelPayload: parseLabelPayload };

  // Node (tests)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
    return;
  }
  root.SerinQrScan = api;

  // ---- DOM wiring (browser only) ----
  if (typeof document === 'undefined') return;

  var VENDOR_SRC = '/assets/js/vendor/qr-scanner.umd.min.js';

  function init() {
    var input = document.getElementById('model-checker-input');
    var scanBtn = document.getElementById('model-checker-scan');
    var panel = document.getElementById('model-checker-scanner');
    var viewport = document.getElementById('model-checker-viewport');
    var video = document.getElementById('model-checker-video');
    var status = document.getElementById('model-checker-scan-status');
    var photoBtn = document.getElementById('model-checker-photo');
    var cancelBtn = document.getElementById('model-checker-scan-cancel');
    var fileInput = document.getElementById('model-checker-file');
    if (!input || !scanBtn || !panel || !viewport || !video || !status ||
        !photoBtn || !cancelBtn || !fileInput) return;

    var scanner = null;
    var libPromise = null;
    // Invalidates in-flight camera starts (double-tap, Cancel or photo mode
    // during startup) so a superseded chain never creates an orphaned
    // scanner holding the camera open.
    var startToken = 0;

    // JS is running, so the scanner can work — reveal the button.
    scanBtn.hidden = false;

    function setStatus(msg) { status.textContent = msg; }

    function loadLib() {
      if (libPromise) return libPromise;
      libPromise = new Promise(function (resolve, reject) {
        if (root.QrScanner) return resolve(root.QrScanner);
        var s = document.createElement('script');
        s.src = VENDOR_SRC;
        s.onload = function () { resolve(root.QrScanner); };
        s.onerror = function () {
          libPromise = null; // allow retry on a later tap
          reject(new Error('script load failed'));
        };
        document.head.appendChild(s);
      });
      return libPromise;
    }

    function teardown() {
      startToken++;
      if (scanner) {
        scanner.stop();
        scanner.destroy();
        scanner = null;
      }
      viewport.hidden = true;
    }

    function closePanel(focusTarget) {
      teardown();
      panel.hidden = true;
      scanBtn.setAttribute('aria-expanded', 'false');
      setStatus('');
      if (focusTarget) focusTarget.focus();
    }

    function succeed(model) {
      input.value = model;
      // Close first so the verdict's scroll position is measured against the
      // final layout. Focus returns to the scan button, not the input —
      // focusing the input would pop the phone keyboard over the verdict.
      closePanel(scanBtn);
      // The existing checker listens for input/submit events and renders the
      // verdict — no coupling to model-checker.js internals. The synthetic
      // submit makes it render immediately and scroll the verdict into view.
      input.dispatchEvent(new Event('input', { bubbles: true }));
      if (input.form) {
        input.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    }

    // Returns true when the payload contained a model number. `report`
    // controls whether a non-model payload surfaces a message (photo mode)
    // or is silently skipped (live mode keeps scanning — nameplates carry a
    // second, non-model QR).
    function handlePayload(data, report) {
      var model = parseLabelPayload(data);
      if (model) { succeed(model); return true; }
      if (report) {
        setStatus('That QR doesn’t look like the model label — scan the QR on the nameplate that lists the model number (if there are two, try the bigger one).');
      }
      return false;
    }

    function startCamera() {
      teardown(); // idempotent: re-tapping Scan restarts cleanly
      var token = startToken;
      viewport.hidden = false;
      setStatus('Starting camera…');
      loadLib().then(function (QrScanner) {
        if (token !== startToken) return; // superseded — don't open the camera
        scanner = new QrScanner(video, function (result) {
          handlePayload(result.data, false);
        }, {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          preferredCamera: 'environment'
        });
        return scanner.start();
      }).then(function () {
        if (token !== startToken) return;
        setStatus('Point the camera at the QR code on the unit’s label.');
      }).catch(function () {
        if (token !== startToken) return; // a newer attempt owns the UI now
        teardown();
        if (!root.QrScanner) {
          setStatus('Couldn’t start the scanner — type the model number instead.');
        } else {
          setStatus('Camera unavailable — upload a photo of the label instead.');
        }
      });
    }

    scanBtn.addEventListener('click', function () {
      panel.hidden = false;
      scanBtn.setAttribute('aria-expanded', 'true');
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // No camera API at all: go straight to the photo picker while we
        // still have the user gesture.
        setStatus('This browser can’t open the camera — upload a photo of the label instead.');
        fileInput.click();
        return;
      }
      startCamera();
    });

    photoBtn.addEventListener('click', function () {
      fileInput.click();
    });

    fileInput.addEventListener('change', function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;
      fileInput.value = ''; // same file can be re-chosen after a failed try
      teardown(); // stop the live camera while we read the photo
      setStatus('Reading photo…');
      loadLib().then(function (QrScanner) {
        return QrScanner.scanImage(file, { returnDetailedScanResult: true });
      }).then(function (result) {
        handlePayload(result.data, true);
      }).catch(function () {
        if (!root.QrScanner) {
          setStatus('Couldn’t start the scanner — type the model number instead.');
        } else {
          setStatus('Couldn’t find a readable QR — get closer so the code fills the frame, or type the model number instead.');
        }
      });
    });

    cancelBtn.addEventListener('click', function () { closePanel(scanBtn); });
    root.addEventListener('pagehide', teardown);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : this);
