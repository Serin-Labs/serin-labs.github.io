/* Check Your Model — compatibility checker engine + UI wiring.
 *
 * Verdict data is derived from the tables and FAQ on /compatibility.html.
 * When those tables change, update the RULES below to match.
 *
 * The engine (normalizeModel/checkModel) is pure and exported for tests;
 * DOM wiring at the bottom only runs in a browser.
 */
(function (root) {
  'use strict';

  // Strip everything but letters/digits so "msz gl06na", "MSZ-GL06NA" and
  // "MSZGL06NA" all match the same rule.
  function normalizeModel(input) {
    return String(input || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  var CTA_BUY = { label: 'Get the pre-assembled controller', href: '/controller.html', primary: true };
  var CTA_PARTS = { label: 'See the parts list', href: '/parts.html' };
  var CTA_CHECK = { label: 'How to find the CN105 port', href: '#how-to-check', primary: true };
  var CTA_WIRING = { label: 'Wiring reference', href: '/wiring.html' };
  var CTA_COMMUNITY = { label: 'Browse the community list', href: 'https://github.com/SwiCago/HeatPump/wiki/Supported-models', external: true };
  // `report: true` CTAs get their href rebuilt at render time so the typed
  // model prefills a new GitHub discussion (category slug verified: general).
  var CTA_ASK = { label: 'Ask the community', href: 'https://github.com/Serin-Labs/serin-cn105/discussions', external: true, report: true };

  function reportUrl(model) {
    var title = 'Model report: ' + model;
    var body = 'Model number: ' + model +
      '\nUnit type (wall / floor / cassette / ducted): ' +
      '\nRegion: ' +
      '\nDoes it have a CN105 port?: ' +
      '\nDid the controller work?: ';
    return 'https://github.com/Serin-Labs/serin-cn105/discussions/new?category=general' +
      '&title=' + encodeURIComponent(title) +
      '&body=' + encodeURIComponent(body);
  }

  // Ordered: most specific first. First match wins.
  var RULES = [
    // ---- Specific caveats that must beat the broader family rules ----
    {
      id: 'msz-hj', re: /^MSZHJ/, tone: 'caution',
      badge: 'MSZ-HJ series — wall-mounted',
      title: 'Not recommended — CN105 connector missing',
      detail: 'MSZ-HJ boards have the CN105 solder pads, but the connector itself is not installed. Advanced users have soldered one on, but we don’t recommend buying hardware for this series.',
      ctas: [CTA_ASK]
    },
    {
      id: 'china-solder', re: /^(MSHBF|MSZZF)/, tone: 'caution',
      badge: 'China-market series',
      title: 'Probably needs soldering — check first',
      detail: 'Some China-market models (MSH-BF, MSZ-ZF) don’t have the CN105 connector installed, only the empty solder pads. Open the front panel and look at the control board before buying hardware.',
      ctas: [CTA_CHECK, CTA_ASK]
    },
    {
      id: 'mfz-kt', re: /^MFZKT/, tone: 'caution',
      badge: 'MFZ-KT series — floor-mounted',
      title: 'Likely compatible — verify the port first',
      detail: 'MFZ-KT units are generally compatible, but some report a CN104 port only. Open the front panel and confirm a connector labeled <strong>CN105</strong> is present before buying hardware.',
      ctas: [CTA_CHECK, CTA_PARTS]
    },

    // ---- No CN105 at all, per Mitsubishi's own M-Series controls
    // compatibility table (Form# M_M-Series_Compatibility-202406): these
    // series show "NO" for every CN105 accessory option, meaning the port
    // itself isn't populated. Must beat wall-confirmed/wall-likely below.
    {
      id: 'msz-fd', re: /^MSZFD/, tone: 'fail',
      badge: 'MSZ-FD series — wall-mounted',
      title: 'No CN105 port on this series',
      detail: 'Mitsubishi’s own M-Series controls compatibility table shows no CN105 accessory option for MSZ-FD units, meaning this series doesn’t have a usable CN105 port.',
      ctas: [CTA_ASK]
    },
    {
      id: 'msz-he', re: /^MSZHE/, tone: 'fail',
      badge: 'MSZ-HE series — wall-mounted',
      title: 'No CN105 port on this series',
      detail: 'Mitsubishi’s own M-Series controls compatibility table shows no CN105 accessory option for MSZ-HE units, meaning this series doesn’t have a usable CN105 port.',
      ctas: [CTA_ASK]
    },
    {
      id: 'ms-wa', re: /^MSWA/, tone: 'fail',
      badge: 'MS-WA series — wall-mounted',
      title: 'No CN105 port on this series',
      detail: 'Mitsubishi’s own M-Series controls compatibility table shows no CN105 accessory option for MS-WA units, meaning this series doesn’t have a usable CN105 port.',
      ctas: [CTA_ASK]
    },

    // ---- Suffix-dependent wall-mounted series: only certain trims have
    // CN105, per the same Mitsubishi compatibility table. Order matters —
    // the specific "has CN105" pattern must be checked before the
    // "no CN105" fallback for the same family.
    {
      id: 'msz-fe-yes', re: /^MSZFE(09|12)NA8|^MSZFE18NA/, tone: 'success',
      badge: 'MSZ-FE series — wall-mounted',
      title: 'Confirmed working (this trim)',
      detail: 'MSZ-FE18NA and the -8 suffix trims (09NA-8 / 12NA-8) have a CN105 port, per Mitsubishi’s official compatibility table.',
      ctas: [CTA_BUY, CTA_PARTS]
    },
    {
      id: 'msz-fe-no', re: /^MSZFE(09|12)NA(?!\d)/, tone: 'fail',
      badge: 'MSZ-FE series — wall-mounted',
      title: 'This trim has no CN105 port',
      detail: 'Base MSZ-FE09NA / MSZ-FE12NA (no -8 suffix) have no CN105 port, per Mitsubishi’s official compatibility table. Check the model label for an -8 suffix (e.g. MSZ-FE09NA-8) — that trim does have CN105.',
      ctas: [CTA_CHECK, CTA_ASK]
    },
    {
      // European/Asia MSZ-GE trims carry the VA suffix (e.g. MSZ-GE25VA) and
      // have a populated CN105 port — confirmed by an owner report. The
      // suffix-dependent "no CN105" caveat below applies only to NA trims.
      id: 'msz-ge-va-yes', re: /^MSZGE\d+VA/, tone: 'success',
      badge: 'MSZ-GE series — wall-mounted',
      title: 'Confirmed working',
      detail: 'European/Asia MSZ-GE (VA-suffix) units have a CN105 port and are confirmed working. Plug the controller into the CN105 port on the indoor unit’s control board and you’re set.',
      ctas: [CTA_BUY, CTA_PARTS]
    },
    {
      id: 'msz-ge-yes', re: /^MSZGE(06|09|12|15|18)NA[89]|^MSZGE24NA/, tone: 'success',
      badge: 'MSZ-GE series — wall-mounted',
      title: 'Confirmed working (this trim)',
      detail: 'MSZ-GE24NA and the -8/-9 suffix trims have a CN105 port, per Mitsubishi’s official compatibility table.',
      ctas: [CTA_BUY, CTA_PARTS]
    },
    {
      id: 'msz-ge-no', re: /^MSZGE(06|09|12|15|18)NA(?!\d)/, tone: 'fail',
      badge: 'MSZ-GE series — wall-mounted',
      title: 'This trim has no CN105 port',
      detail: 'Base MSZ-GE06&ndash;18NA (no suffix) has no CN105 port, per Mitsubishi’s official compatibility table. Check the model label for an -8 or -9 suffix, which does have CN105.',
      ctas: [CTA_CHECK, CTA_ASK]
    },
    {
      id: 'msz-d-yes', re: /^MSZD\d+NA8/, tone: 'success',
      badge: 'MSZ-D series — wall-mounted',
      title: 'Confirmed working (this trim)',
      detail: 'The -8 suffix trim has a CN105 port, per Mitsubishi’s official compatibility table.',
      ctas: [CTA_BUY, CTA_PARTS]
    },
    {
      id: 'msz-d-no', re: /^MSZD\d+NA(?!\d)/, tone: 'fail',
      badge: 'MSZ-D series — wall-mounted',
      title: 'This trim has no CN105 port',
      detail: 'Base MSZ-D...NA (no suffix) has no CN105 port, per Mitsubishi’s official compatibility table. Check the model label for an -8 suffix, which does have CN105.',
      ctas: [CTA_CHECK, CTA_ASK]
    },

    // ---- Confirmed compatible: wall-mounted ----
    {
      id: 'wall-confirmed',
      re: /^MSZ(FX|GX|HX|WX|EX|JX|FS|GS|GL|FH|EF|AP|AY|LN|HR|SF|YK|BT|DM|RW|FT|GF|WR|HM|JP)/,
      tone: 'success',
      badge: 'MSZ series — wall-mounted',
      title: 'Confirmed working',
      detail: 'This series has a CN105 port and is confirmed working by the community. Plug the controller into the CN105 port on the indoor unit’s control board and you’re set.',
      ctas: [CTA_BUY, CTA_PARTS]
    },
    {
      id: 'msy-confirmed', re: /^MSY/, tone: 'success',
      badge: 'MSY series — wall-mounted, cooling-only',
      title: 'Confirmed working',
      detail: 'MSY cooling-only units use the same control board as their MSZ equivalents, including the CN105 port.',
      ctas: [CTA_BUY, CTA_PARTS]
    },
    {
      id: 'msxy-confirmed', re: /^MSXY/, tone: 'success',
      badge: 'MSXY series — wall-mounted (Asia-Pacific / Starmex)',
      title: 'Confirmed working',
      detail: 'MSXY (Starmex-branded) units are confirmed working with CN105 control.',
      ctas: [CTA_BUY, CTA_PARTS]
    },
    // Unknown MSZ series — likely, verify.
    {
      id: 'wall-likely', re: /^MSZ/, tone: 'caution',
      badge: 'MSZ series — wall-mounted',
      title: 'Likely compatible — verify the port',
      detail: 'We don’t have a confirmed report for this exact series yet, but nearly all Mitsubishi Electric MSZ wall units have a CN105 port. Open the front panel and look for a small 5-pin connector labeled <strong>CN105</strong> — if it’s there, you’re good.',
      ctas: [CTA_CHECK, CTA_ASK]
    },

    // ---- Floor-mounted ----
    {
      id: 'floor-confirmed', re: /^MFZ(KX|KJ|KA)/, tone: 'success',
      badge: 'MFZ series — floor-mounted',
      title: 'Confirmed working',
      detail: 'This floor-mounted series has a CN105 port and is confirmed working by the community.',
      ctas: [CTA_BUY, CTA_PARTS]
    },
    {
      id: 'floor-likely', re: /^MFZ/, tone: 'caution',
      badge: 'MFZ series — floor-mounted',
      title: 'Likely compatible — verify the port',
      detail: 'Most MFZ floor units have a CN105 port, but we don’t have a confirmed report for this exact series. Check the control board for a connector labeled <strong>CN105</strong> before buying hardware.',
      ctas: [CTA_CHECK, CTA_ASK]
    },

    // ---- Ceiling cassettes ----
    {
      id: 'cassette-confirmed', re: /^MLZ(KX|KP|KY|KA)/, tone: 'success',
      badge: 'MLZ series — one-way ceiling cassette',
      title: 'Confirmed working',
      detail: 'This ceiling cassette series has a CN105 port and is confirmed working. Note: horizontal vane control isn’t available on all cassette models.',
      ctas: [CTA_BUY, CTA_PARTS]
    },
    {
      id: 'cassette-likely', re: /^MLZ/, tone: 'caution',
      badge: 'MLZ series — ceiling cassette',
      title: 'Likely compatible — verify the port',
      detail: 'Most MLZ cassettes have a CN105 port, but we don’t have a confirmed report for this exact series. Check the control board for a connector labeled <strong>CN105</strong> before buying hardware.',
      ctas: [CTA_CHECK, CTA_ASK]
    },
    {
      id: 'slz-confirmed', re: /^SLZ/, tone: 'success',
      badge: 'SLZ series — four-way ceiling cassette',
      title: 'Confirmed working',
      detail: 'SLZ four-way cassettes have a CN105 port and are confirmed working by the community.',
      ctas: [CTA_BUY, CTA_PARTS]
    },

    // ---- Ducted / air handlers ----
    {
      id: 'sez-confirmed', re: /^SEZ/, tone: 'success',
      badge: 'SEZ series — ducted',
      title: 'Confirmed working',
      detail: 'SEZ ducted units have a CN105 port and are confirmed working. For metal-bodied units, consider the 50 cm cable option so the controller can sit outside the cabinet for better Wi-Fi.',
      ctas: [CTA_BUY, CTA_PARTS]
    },
    {
      id: 'pead-confirmed', re: /^PEAD/, tone: 'success',
      badge: 'PEAD series — mid-static ducted',
      title: 'Confirmed working',
      detail: 'PEAD ducted units have a CN105 port and are confirmed working. These are metal-bodied — consider the 50 cm cable option so the controller can sit outside the cabinet for better Wi-Fi.',
      ctas: [CTA_BUY, CTA_PARTS]
    },
    {
      id: 'ducted-confirmed', re: /^(SVZ|MVZ|PVA)/, tone: 'success',
      badge: 'Multi-position air handler',
      title: 'Confirmed working',
      detail: 'This air handler series has a CN105 port and is confirmed working. These are metal-bodied — consider the 50 cm cable option so the controller can sit outside the cabinet for better Wi-Fi.',
      ctas: [CTA_BUY, CTA_PARTS]
    },
    {
      id: 'pvfy-confirmed', re: /^PVFY/, tone: 'success',
      badge: 'PVFY series — City Multi air handler',
      title: 'Confirmed working',
      detail: 'PVFY City Multi air handlers have a native CN105 port and are confirmed working.',
      ctas: [CTA_BUY, CTA_PARTS]
    },

    // ---- City Multi indoor units (CN105 on newer, CN100 on older) ----
    {
      id: 'citymulti', re: /^(PEFY|PKFY|PLFY|PFFY|PMFY)/, tone: 'caution',
      badge: 'City Multi (VRF) indoor unit',
      title: 'Check which port your unit has',
      detail: 'Newer City Multi indoor units have a native <strong>CN105</strong> port and work directly. Older ones have <strong>CN100</strong> instead — those need a Mitsubishi <strong>PAC-IT51AD-E</strong> or <strong>PAC-IT52AD-E</strong> signal adapter (they’re not interchangeable; check which one your unit requires). Open the control board and look at the port label.',
      ctas: [CTA_CHECK, CTA_ASK]
    },

    // ---- P-Series light commercial ----
    {
      id: 'pseries-confirmed', re: /^(PKA|PCA|PLA|PEA|PAA)/, tone: 'success',
      badge: 'P-Series — light commercial',
      title: 'Confirmed working',
      detail: 'All P-Series indoor units have a CN105 port, confirmed via Kumo Cloud compatibility.',
      ctas: [CTA_BUY, CTA_PARTS]
    },

    // ---- Trane / American Standard rebrands ----
    {
      id: 'trane', re: /^(NAXWST|NTXWPH|NTXMPH|NTXWST)/, tone: 'success',
      badge: 'Trane / American Standard — rebranded Mitsubishi',
      title: 'Confirmed working',
      detail: 'This is Mitsubishi Electric hardware sold under the Trane / American Standard brand. It has the same CN105 port and is confirmed working.',
      ctas: [CTA_BUY, CTA_PARTS]
    },

    // ---- Not compatible ----
    {
      id: 'mhi', re: /^(SRK|SRC|SRF|SRR)/, tone: 'fail',
      badge: 'Mitsubishi Heavy Industries',
      title: 'No CN105 port on Mitsubishi Heavy units',
      detail: 'This is a <strong>Mitsubishi Heavy Industries</strong> unit — a different company from Mitsubishi Electric. MHI units use an entirely different control protocol and have no CN105 port, so this controller can’t work with them.',
      ctas: []
    },
    {
      // Ecodan air-to-water: PUHZ-W / PUHZ-SW / PUHZ-SHW / PUZ-WM outdoor
      // units and EHS*/EHP*/ERS* hydroboxes & cylinders. Plain PUHZ (Mr Slim)
      // falls through to the outdoor-unit rule below.
      id: 'ecodan', re: /^(PUHZW|PUHZSW|PUHZSHW|PUZWM|EHS|EHP|ERS)/, tone: 'fail',
      badge: 'Ecodan air-to-water system',
      title: 'Ecodan speaks a different protocol',
      detail: 'Ecodan air-to-water heat pumps have a CN105-style connector, but they speak a <strong>different serial protocol</strong> — this controller and the libraries it builds on don’t support it. See <a href="https://github.com/m000c400/Mitsubishi-CN105-Protocol-Decode" target="_blank" rel="noopener">Mitsubishi-CN105-Protocol-Decode</a> for Ecodan-specific projects.',
      ctas: []
    },
    {
      id: 'lossnay', re: /^LGH/, tone: 'fail',
      badge: 'Lossnay energy-recovery ventilator',
      title: 'Ventilators use a different protocol',
      detail: 'Lossnay units are energy-recovery ventilators, not heat pumps — they use a different protocol and don’t work with this controller.',
      ctas: []
    },

    // ---- Outdoor units ----
    {
      id: 'outdoor', re: /^(MXZ|MUZ|MUY|MUFZ|SUZ|PUZ|PUY|PUHZ|PUMY)/, tone: 'info',
      badge: 'Outdoor unit',
      title: 'That’s your outdoor unit — check the indoor one',
      detail: 'The controller connects to the <strong>indoor</strong> unit (one controller per indoor head; the outdoor unit doesn’t need one). Find the model number on the label on your indoor unit — usually on the right side behind the front panel — and check that instead.',
      ctas: []
    },

    // ---- Accessories / wall controllers ----
    {
      id: 'accessory', re: /^(MHK|PAR|PAC)/, tone: 'info',
      badge: 'Controller / accessory',
      title: 'That’s a controller, not the unit itself',
      detail: 'This is a Mitsubishi wall controller or accessory, not an indoor unit. Check the model number on your indoor unit instead — it’s on a label, usually on the right side behind the front panel. If you’re shopping for an MHK2, our controller is a <a href="/blog/mitsubishi-mhk2-wired-controller-alternative.html">cheaper alternative with app and voice control</a>.',
      ctas: []
    }
  ];

  var UNKNOWN = {
    id: 'unknown', tone: 'neutral',
    badge: 'Unrecognized model number',
    title: 'Not in our list yet — it may still work',
    detail: 'That doesn’t mean it won’t work — our list isn’t exhaustive. If it’s a <strong>Mitsubishi Electric</strong> indoor unit, open the front panel and look for a small 5-pin connector labeled <strong>CN105</strong> on the control board (usually red, sometimes white). If it’s there, the controller will almost certainly work. If your unit works, please report it to help others.',
    ctas: [CTA_CHECK, CTA_COMMUNITY, CTA_ASK]
  };

  /**
   * @param {string} input raw user input
   * @returns {object|null} verdict {id, tone, badge, title, detail, ctas}
   *   or null when the input is too short to judge.
   */
  function checkModel(input) {
    var m = normalizeModel(input);
    if (m.length < 2) return null;
    for (var i = 0; i < RULES.length; i++) {
      if (RULES[i].re.test(m)) return RULES[i];
    }
    return UNKNOWN;
  }

  // Datalist suggestions — representative models across unit types.
  var SUGGESTIONS = [
    'MSZ-GL06NA', 'MSZ-GL09NA', 'MSZ-GL12NA', 'MSZ-FH09NA', 'MSZ-FS09NA',
    'MSZ-GS09NA', 'MSZ-EF09NA', 'MSZ-AP25VGK', 'MSZ-AY25VGK', 'MSZ-LN25VG2',
    'MSZ-HR25VF', 'MSZ-SF25VE', 'MSZ-GE25VAD', 'MSZ-GX12NL', 'MSY-GL09NA',
    'MSXY-FN10VE', 'MFZ-KA09NA', 'MFZ-KJ18NA', 'MLZ-KP09NA', 'SLZ-KA12NA',
    'SEZ-KD09NA', 'SVZ-KP18NA', 'MVZ-A36AA7', 'PEAD-A18AA7', 'PVA-A36AA7',
    'PKA-A36KA7', 'PLA-A18BA', 'PEFY-P32VMA-E2', 'PVFY-P36NAMU',
    'NTXWPH09B112AA', 'NAXWST09A112AB'
  ];

  var api = { normalizeModel: normalizeModel, checkModel: checkModel, SUGGESTIONS: SUGGESTIONS };

  // Node (tests)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
    return;
  }
  root.SerinModelChecker = api;

  // ---- DOM wiring (browser only) ----
  if (typeof document === 'undefined') return;

  var ICONS = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    caution: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    fail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    neutral: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
  };

  var TONE_LABELS = {
    success: 'Compatible',
    caution: 'Check first',
    fail: 'Not compatible',
    info: 'Heads up',
    neutral: 'Unknown model'
  };

  function init() {
    var input = document.getElementById('model-checker-input');
    var result = document.getElementById('model-checker-result');
    var form = document.getElementById('model-checker-form');
    if (!input || !result || !form) return;

    // Populate datalist suggestions.
    var datalist = document.getElementById('model-checker-suggestions');
    if (datalist) {
      SUGGESTIONS.forEach(function (s) {
        var opt = document.createElement('option');
        opt.value = s;
        datalist.appendChild(opt);
      });
    }

    function render() {
      var raw = input.value;
      var verdict = checkModel(raw);
      if (!verdict) {
        result.className = 'model-checker-result';
        result.innerHTML = '';
        result.hidden = true;
        return;
      }

      result.hidden = false;
      result.className = 'model-checker-result model-checker-result--' + verdict.tone + ' is-visible';

      var card = document.createElement('div');
      card.className = 'model-checker-card';

      var head = document.createElement('div');
      head.className = 'model-checker-head';
      head.innerHTML =
        '<span class="model-checker-icon" aria-hidden="true">' + ICONS[verdict.tone] + '</span>' +
        '<div><p class="model-checker-tone">' + TONE_LABELS[verdict.tone] + '</p>' +
        '<h3 class="model-checker-title">' + verdict.title + '</h3></div>';
      card.appendChild(head);

      // Echo what we recognized + what the user typed (typed value goes in
      // via textContent — never innerHTML).
      var badge = document.createElement('p');
      badge.className = 'model-checker-badge';
      var typed = document.createElement('strong');
      typed.textContent = raw.trim();
      badge.appendChild(typed);
      badge.appendChild(document.createTextNode(' · ' + verdict.badge));
      card.appendChild(badge);

      var detail = document.createElement('p');
      detail.className = 'model-checker-detail';
      detail.innerHTML = verdict.detail; // static rule copy, no user input
      card.appendChild(detail);

      if (verdict.ctas.length) {
        var actions = document.createElement('p');
        actions.className = 'model-checker-actions';
        verdict.ctas.forEach(function (cta) {
          var a = document.createElement('a');
          a.href = cta.report ? reportUrl(raw.trim()) : cta.href;
          a.textContent = cta.report ? 'Report your model' : cta.label;
          a.className = cta.primary ? 'btn' : 'btn btn-outline';
          if (cta.external) { a.target = '_blank'; a.rel = 'noopener'; }
          actions.appendChild(a);
        });
        card.appendChild(actions);
      }

      result.innerHTML = '';
      result.appendChild(card);

      // Shareable URL (?model=…) without polluting history.
      try {
        var url = new URL(window.location.href);
        if (raw.trim()) url.searchParams.set('model', raw.trim());
        else url.searchParams.delete('model');
        history.replaceState(null, '', url);
      } catch (e) { /* older browsers: non-essential */ }
    }

    var timer = null;
    function debouncedRender() {
      clearTimeout(timer);
      timer = setTimeout(render, 200);
    }

    input.addEventListener('input', debouncedRender);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearTimeout(timer);
      render();
    });

    // Example chips fill the input and check immediately.
    document.querySelectorAll('.model-checker-example').forEach(function (btn) {
      btn.addEventListener('click', function () {
        input.value = btn.getAttribute('data-model');
        clearTimeout(timer);
        render();
        input.focus();
      });
    });

    // Deep link: /compatibility.html?model=MSZ-GL06NA
    try {
      var param = new URL(window.location.href).searchParams.get('model');
      if (param) {
        input.value = param;
        render();
      }
    } catch (e) { /* ignore */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : this);
