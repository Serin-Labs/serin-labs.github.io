# Apple Home Trademark Copy Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the Apple-badge phrase "Works with Apple Home", the Serin Labs firmware-authorship claim, and "HomeKit firmware" naming from all site copy, and complete the footer trademark attribution — per the 2026-07-09 legal-risk review.

**Architecture:** Pure copy edits to a Jekyll static site. No URLs, file paths, layouts, or structured-data schema change — only text strings (visible copy, front-matter `title`/`description`, one JSON-LD FAQ `name`, README). Each task is one finding; verification is grep sweeps plus a Jekyll build.

**Tech Stack:** Jekyll (GitHub Pages), plain HTML/Markdown. No test framework exists; "tests" are grep assertions and `bundle exec jekyll build`.

## Global Constraints

- Canonical firmware phrase everywhere: **"HomeKit-compatible firmware"** (in casual prose, "the firmware" is fine once context is set). Never "HomeKit firmware".
- Never use the phrase **"Works with Apple Home"** (Apple's licensed badge program name). Descriptive forms are OK: "control from the Apple Home app", "pairs with Apple Home via HAP", "does it work with Apple Home?" (question form in FAQ stays as-is).
- Never imply the sold controller ships with firmware installed; "pre-assembled" means the cable is attached (see `docs/superpowers/specs/2026-06-17-decouple-buy-cta-design.md`). The homepage hero's "Buy Controller" button + "HomeKit for Apple Home" subhead is a deliberate exception — do NOT touch the hero (`index.html:7-16`).
- Do NOT rename URLs or paths (`/homekit/` stays; Apple's guidelines restrict marks in domain names, not paths). Do NOT touch the nav labels.
- Where a visible string has a JSON-LD twin (troubleshooting FAQ schema), change BOTH so schema matches visible content.
- **Commits:** the working tree already carries unrelated in-progress edits to several target files (`index.html`, `parts.html`, `homekit/features.html`, `_layouts/default.html`; `controller.html` is untracked). Do NOT `git commit` per task — Task 7 is a single review/commit checkpoint where the user decides how to split commits.
- Every `Edit` old_string below was verified against the working tree on 2026-07-09. If one fails to match, re-read the file — do not improvise a different sentence; flag it.

---

### Task 1: Remove "Works with Apple Home" badge phrase

**Files:**
- Modify: `controller.html:4` (front-matter meta description)
- Modify: `homekit/features.html:10` (intro paragraph)

**Interfaces:**
- Consumes: nothing.
- Produces: sitewide guarantee that `grep -ri "works with apple"` over source files returns nothing (Task 7 asserts this).

- [ ] **Step 1: Rewrite the controller page meta description**

Edit `controller.html` — replace:

```
description: "Pre-assembled Wi-Fi controller for Mitsubishi mini-splits. Works with Apple Home (HomeKit + Siri) or Home Assistant via free open-source firmware. $35, free US shipping."
```

with:

```
description: "Pre-assembled Wi-Fi controller for Mitsubishi mini-splits. Control it from the Apple Home app (HomeKit + Siri) or Home Assistant via free open-source firmware. $35, free US shipping."
```

- [ ] **Step 2: Rewrite the features-page intro sentence**

Edit `homekit/features.html` — replace:

```
  <p>Free, open-source firmware you flash yourself. Works with Apple Home through the HomeKit Accessory Protocol (HAP) and includes a full-featured web UI. No third-party bridge or Home Assistant required &mdash; just an <strong>Apple Home Hub</strong> (Apple TV or HomePod) for remote access and automations.</p>
```

with:

```
  <p>Free, open-source firmware you flash yourself. Pairs with the Apple Home app through the HomeKit Accessory Protocol (HAP) and includes a full-featured web UI. No third-party bridge or Home Assistant required &mdash; just an <strong>Apple Home Hub</strong> (Apple TV or HomePod) for remote access and automations.</p>
```

(If the `&mdash;` entity doesn't match, Read the line first — the em dash may be a literal `—` character; use whichever the file actually contains.)

- [ ] **Step 3: Verify the phrase is gone from source**

Run:
```bash
grep -rni "works with apple" --include='*.html' --include='*.md' --include='*.yml' . | grep -vE '_site|node_modules|docs/'
```
Expected: no output (exit code 1).

Also confirm the FAQ question form survived untouched (it is allowed):
```bash
grep -n "Does it work with Apple Home" controller.html
```
Expected: one hit at the `<summary>` line (~line 75).

---

### Task 2: Remove the firmware-authorship claim from README

**Files:**
- Modify: `README.md:69`

**Interfaces:**
- Consumes: nothing.
- Produces: no source file states Serin Labs develops the HomeKit-compatible firmware (Task 7 asserts `grep -ri "developed by serin"` is empty).

**Context for the implementer:** The HomeKit-compatible firmware repo lives under a personal account (`akifbayram/mitsubishi-cn105-homekit`), deliberately separate from the Serin-Labs org. The defensibility of selling the hardware rests on the firmware being an independent project users opt into; a written claim that the hardware vendor develops it undoes that separation. This edit changes attribution wording only — it does not (and cannot) change the underlying facts, which the user has acknowledged.

- [ ] **Step 1: Rewrite the credits sentence**

Edit `README.md` — replace:

```
The ESPHome integration is built on [echavet's MitsubishiCN105ESPHome](https://github.com/echavet/MitsubishiCN105ESPHome). On top of that, Serin Labs adds curated configs, browser flashing, and a YAML generator. The HomeKit-compatible firmware is developed by Serin Labs ([source](https://github.com/akifbayram/mitsubishi-cn105-homekit)), built on Espressif's [esp-homekit-sdk](https://github.com/espressif/esp-homekit-sdk).
```

with:

```
The ESPHome integration is built on [echavet's MitsubishiCN105ESPHome](https://github.com/echavet/MitsubishiCN105ESPHome). On top of that, Serin Labs adds curated configs, browser flashing, and a YAML generator. The HomeKit-compatible firmware is an independent open-source project ([akifbayram/mitsubishi-cn105-homekit](https://github.com/akifbayram/mitsubishi-cn105-homekit)) built on Espressif's [esp-homekit-sdk](https://github.com/espressif/esp-homekit-sdk).
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -rniE 'developed by serin|by serin labs' --include='*.md' --include='*.html' . | grep -vE '_site|node_modules|docs/'
```
Expected: no output.

---

### Task 3: Normalize "HomeKit firmware" → "HomeKit-compatible firmware" (13 sites, 7 files)

**Files:**
- Modify: `index.html:110,121`
- Modify: `parts.html:29,178`
- Modify: `troubleshooting.html:238,325`
- Modify: `licenses.html:55`
- Modify: `homekit/features.html:3,115`
- Modify: `README.md:30,38,59`
- Modify: `_posts/2026-07-06-mitsubishi-mini-split-apple-home-homekit-siri.md:50,102,131`

**Interfaces:**
- Consumes: nothing.
- Produces: `grep -ri "homekit firmware"` over source returns nothing (Task 7 asserts). Note capitalized variant "HomeKit Firmware" (features.html title) is covered by case-insensitive grep.

Do these as individual `Edit` calls (not sed) — several lines have other content that must survive. Exact replacements:

- [ ] **Step 1: `index.html`** (2 edits)

Replace:
```
    <li><strong>Flash the Firmware:</strong> Use the <a href="/flash.html">flash tool</a> to install ESPHome or HomeKit firmware from your browser.</li>
```
with:
```
    <li><strong>Flash the Firmware:</strong> Use the <a href="/flash.html">flash tool</a> to install ESPHome or HomeKit-compatible firmware from your browser.</li>
```

Replace (in the Credits paragraph):
```
esp-homekit-sdk</a> (HomeKit firmware)
```
with:
```
esp-homekit-sdk</a> (HomeKit-compatible firmware)
```

- [ ] **Step 2: `parts.html`** (2 edits)

Replace:
```
  <p>Choose one of the two supported boards. Both work with ESPHome and HomeKit firmware.</p>
```
with:
```
  <p>Choose one of the two supported boards. Both work with ESPHome and HomeKit-compatible firmware.</p>
```

Replace:
```
    <li><a href="/flash.html">Flash the firmware</a> — install ESPHome or HomeKit firmware from your browser.</li>
```
with:
```
    <li><a href="/flash.html">Flash the firmware</a> — install ESPHome or HomeKit-compatible firmware from your browser.</li>
```

- [ ] **Step 3: `troubleshooting.html`** (2 edits — visible `<summary>` AND its JSON-LD twin must both change)

Replace:
```
    <summary>How to switch between ESPHome and HomeKit firmware</summary>
```
with:
```
    <summary>How to switch between ESPHome and HomeKit-compatible firmware</summary>
```

Replace (inside the FAQPage JSON-LD):
```
      "name": "How to switch between ESPHome and HomeKit firmware",
```
with:
```
      "name": "How to switch between ESPHome and HomeKit-compatible firmware",
```

- [ ] **Step 4: `licenses.html`** (1 edit)

Replace:
```
  <h2>HomeKit firmware</h2>
```
with:
```
  <h2>HomeKit-compatible firmware</h2>
```

- [ ] **Step 5: `homekit/features.html`** (2 edits)

Replace (front-matter title — this changes the browser tab / SERP title only, not the URL):
```
title: "HomeKit Firmware Features — Web UI & Native HAP"
```
with:
```
title: "HomeKit-Compatible Firmware Features — Web UI & Native HAP"
```

Replace (flash CTA paragraph):
```
    <p>Use the browser flash tool to install the HomeKit firmware, then follow the setup guide to connect and pair. No hardware yet? Get the <a href="/controller.html">pre-assembled Serin Controller</a>.</p>
```
with:
```
    <p>Use the browser flash tool to install the HomeKit-compatible firmware, then follow the setup guide to connect and pair. No hardware yet? Get the <a href="/controller.html">pre-assembled Serin Controller</a>.</p>
```

- [ ] **Step 6: `README.md`** (3 edits)

Replace:
```
3. **Flash the firmware.** Use the [browser flash tool](https://serin-labs.com/flash) to install ESPHome or HomeKit firmware directly from your browser.
```
with:
```
3. **Flash the firmware.** Use the [browser flash tool](https://serin-labs.com/flash) to install ESPHome or HomeKit-compatible firmware directly from your browser.
```

Replace:
```
Both boards work with ESPHome and HomeKit firmware.
```
with:
```
Both boards work with ESPHome and HomeKit-compatible firmware.
```

Replace:
```
- [HomeKit Features](https://serin-labs.com/homekit/features) – HomeKit firmware capabilities
```
with:
```
- [HomeKit Features](https://serin-labs.com/homekit/features) – HomeKit-compatible firmware capabilities
```

- [ ] **Step 7: `_posts/2026-07-06-mitsubishi-mini-split-apple-home-homekit-siri.md`** (3 edits — keep the blog's conversational voice)

Replace:
```
**1. Direct HomeKit firmware (this guide).**
```
with:
```
**1. Direct HomeKit-compatible firmware (this guide).**
```

Replace:
```
The HomeKit firmware fixes this with an optional **BLE room sensor**:
```
with:
```
The firmware fixes this with an optional **BLE room sensor**:
```
(Context already establishes which firmware; repeating the qualifier here would read stiff.)

Replace:
```
3. [Flash the HomeKit firmware](/flash.html) from your browser and follow the [Apple Home setup guide](/homekit/setup.html).
```
with:
```
3. [Flash the HomeKit-compatible firmware](/flash.html) from your browser and follow the [Apple Home setup guide](/homekit/setup.html).
```

- [ ] **Step 8: Verify zero remaining occurrences in source**

Run:
```bash
grep -rni "homekit firmware" --include='*.html' --include='*.md' --include='*.yml' . | grep -vE '_site|node_modules|docs/'
```
Expected: no output. (This also proves the capitalized title variant in features.html was caught.)

---

### Task 4: Complete the footer trademark attribution

**Files:**
- Modify: `_layouts/default.html:116`

**Interfaces:**
- Consumes: nothing.
- Produces: every rendered page carries the full attribution (the footer is sitewide via the default layout).

- [ ] **Step 1: Broaden the attribution sentence**

Edit `_layouts/default.html` — replace:

```
        <p class="trademark-notice">Independent open-source project — not developed, endorsed, or certified by Apple Inc. or Mitsubishi Electric Corporation. Working on HVAC systems carries risk and may void warranties; proceed at your own risk. Apple, HomeKit, and Apple Home are trademarks of Apple Inc.</p>
```

with:

```
        <p class="trademark-notice">Independent open-source project — not developed, endorsed, or certified by Apple Inc. or Mitsubishi Electric Corporation. Working on HVAC systems carries risk and may void warranties; proceed at your own risk. Apple, Apple Home, HomeKit, Siri, HomePod, Apple TV, iPhone, and iPad are trademarks of Apple Inc., registered in the U.S. and other countries. Mitsubishi Electric is a trademark of Mitsubishi Electric Corporation.</p>
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "Siri, HomePod, Apple TV" _layouts/default.html
```
Expected: `1`.

---

### Task 5: Soften the MFi characterization in the blog post

**Files:**
- Modify: `_posts/2026-07-06-mitsubishi-mini-split-apple-home-homekit-siri.md:86`

**Interfaces:**
- Consumes: nothing.
- Produces: n/a (standalone copy fix).

**Why:** The current line says certification is "not a measure of whether the thing works" — MFi does include compatibility testing, so this is both slightly inaccurate and quotable against the project. Replace the characterization with a neutral, accurate one.

- [ ] **Step 1: Rewrite the sentence**

Replace:

```
One thing to expect here, and I'd rather you hear it from me than be surprised by it: this firmware isn't MFi-certified, so Apple Home shows an **"Uncertified Accessory"** notice and asks you to tap **Add Anyway**. That prompt is normal. Tap it and pairing finishes. The device works exactly like a certified one afterward — the certification is a paid Apple licensing program, not a measure of whether the thing works.
```

with:

```
One thing to expect here, and I'd rather you hear it from me than be surprised by it: this firmware isn't MFi-certified, so Apple Home shows an **"Uncertified Accessory"** notice and asks you to tap **Add Anyway**. That prompt is normal. Tap it and pairing finishes. After that the accessory behaves like any other thermostat in the Home app — MFi is Apple's paid licensing and certification program, and this independent open-source project simply isn't enrolled in it.
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "not a measure of whether" _posts/2026-07-06-mitsubishi-mini-split-apple-home-homekit-siri.md
```
Expected: `0` (grep exits 1).

---

### Task 6: Audit the Etsy listings (off-repo — report only, no edits)

**Files:**
- Create: `/tmp/claude-1000/-home-akifbayram-serin-labs-github-io/2bae1d76-f15d-4653-b738-4506e67f93fc/scratchpad/etsy-listing-audit.md` (findings report; NOT committed to the repo)

**Interfaces:**
- Consumes: nothing.
- Produces: a report the user applies manually in the Etsy seller dashboard. Nothing in the repo changes.

**Why:** Apple enforces trademarks on Etsy via IP takedowns, and Etsy suspends listings first. The listing title/tags are the highest-risk surface. This repo can't edit Etsy; the deliverable is an audit report.

- [ ] **Step 1: Fetch both public listing pages**

Fetch with WebFetch (or `curl -sL` if WebFetch is unavailable):
- `https://www.etsy.com/listing/4518217831/serin-smart-mini-split-wi-fi-controller`
- `https://www.etsy.com/listing/4518377332/cn105-to-grove-cable-pap-05v-s-to-hy20`

If Etsy blocks automated fetches (bot wall / empty body), record that in the report and list what the user should check manually instead — do not retry aggressively.

- [ ] **Step 2: Audit each listing against this checklist and write the report**

For each listing, record pass/fail with the offending text quoted:

1. **Title** contains no Apple marks (no "HomeKit", "Apple", "Apple Home", "Siri", "HomePod").
2. **Tags/keywords** (visible in page metadata) contain no Apple marks. Note: Etsy tags aren't fully visible on the public page — flag as "verify in seller dashboard" if not observable.
3. **Description body** may mention Apple Home/HomeKit descriptively, but must (a) frame HomeKit as free open-source firmware the buyer flashes, (b) never say or imply the unit ships flashed/ready-to-pair, (c) disclose "not MFi-certified; pairing shows a one-time Add Anyway prompt", (d) contain no "Works with Apple Home" phrasing.
4. **Photos** contain no Apple logo, Home-app icon, or Works-with-Apple-Home badge artwork. Screenshots of the Home app in use are acceptable.
5. Include suggested replacement wording for anything that fails, matching the controller.html framing from Task 1.

- [ ] **Step 3: Deliver**

Summarize the report's pass/fail results in the final message to the user with the scratchpad file path. The user applies changes in the Etsy dashboard; there is nothing to commit.

---

### Task 7: Final verification sweep, build, and commit checkpoint

**Files:**
- No new edits. Read-only verification plus a user-facing commit decision.

**Interfaces:**
- Consumes: all edits from Tasks 1–5.
- Produces: verified working tree + commit(s) authorized by the user.

- [ ] **Step 1: Run the full grep assertion sweep**

```bash
cd /home/akifbayram/serin-labs.github.io
grep -rni "works with apple" --include='*.html' --include='*.md' --include='*.yml' . | grep -vE '_site|node_modules|docs/'
grep -rni "homekit firmware" --include='*.html' --include='*.md' --include='*.yml' . | grep -vE '_site|node_modules|docs/'
grep -rniE 'developed by serin' --include='*.html' --include='*.md' . | grep -vE '_site|node_modules|docs/'
```
Expected: all three produce no output. (`docs/` is excluded because this plan file itself quotes the banned phrases.)

- [ ] **Step 2: Build the site**

```bash
bundle exec jekyll build 2>&1 | tail -5
```
Expected: `done in X.XXX seconds.` with no Liquid/YAML errors. If `bundle` isn't installed in this environment, run `ruby -ryaml -e 'YAML.load_file("_config.yml")'` as a front-matter sanity fallback and note the build was skipped.

- [ ] **Step 3: Spot-check rendered output**

```bash
grep -o 'name="description" content="[^"]*"' _site/controller.html 2>/dev/null | head -1
grep -c "Siri, HomePod, Apple TV" _site/index.html 2>/dev/null
```
Expected: the new controller description (no "Works with"); footer count `1`. Skip if the build was skipped.

- [ ] **Step 4: Commit checkpoint (user decision required)**

Show `git status` and `git diff --stat`. The tree contains unrelated in-progress edits to `index.html`, `parts.html`, `homekit/features.html`, `_layouts/default.html`, and `controller.html` is untracked — the trademark edits are interleaved with that work. Present the user two options and WAIT for their choice:
1. Commit everything touched by this plan now (sweeps in the unrelated in-progress changes on shared files), message: `fix(legal): tighten Apple trademark usage — drop badge phrase, decouple firmware authorship, complete attribution`
2. Leave uncommitted for the user to fold into their in-progress work.

Do not commit without an explicit answer.

---

## Self-Review

- **Coverage:** Finding 1 → Task 1; Finding 2 → Task 2; Finding 3 → Task 3 (all 13 grep hits, including the JSON-LD twin and the blog post the original review missed); Finding 4 → Task 4; Finding 5 → Task 6; optional blog soften → Task 5. ✔
- **Placeholders:** none — every edit shows exact old/new strings verified against the working tree on 2026-07-09. ✔
- **Consistency:** all replacements use the single canonical phrase "HomeKit-compatible firmware"; verification greps are case-insensitive so title-case variants can't slip through. ✔
- **Out of scope (deliberate):** homepage hero (user-mandated exception), `/homekit/` URLs, nav labels, FAQ question forms, schema.org Product markup on controller.html (already uses compliant phrasing).
