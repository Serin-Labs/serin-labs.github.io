---
layout: post
title: "Every Way to Make a Mitsubishi Mini-Split Smart, Compared (2026)"
description: "Mitsubishi's own Wi-Fi adapter, wall controllers like the MHK2, universal IR controllers like Sensibo and Cielo, and local CN105 control: prices, tradeoffs, and which to buy."
date: 2026-07-15 09:00:00 -0500
image: /assets/og-cover.jpg
cover: /assets/serin_cn105_mvz_aa7_1.webp
related:
  - url: /compatibility.html
    title: Check your unit for a CN105 port
  - url: /parts.html
    title: Get the hardware
  - url: /blog/kumo-cloud-alternative-local-mitsubishi-control.html
    title: The best Kumo Cloud alternative
  - url: /blog/mitsubishi-mhk2-wired-controller-alternative.html
    title: Cheaper alternative to the MHK2
---

I get some version of the same question a lot: "I have a Mitsubishi mini-split, I want it smart, what do I actually buy?" The honest answer is that there are four real options, they cost anywhere from $35 to $400, and almost nobody selling them will tell you where the other three fit better than theirs does.

So here's the straight comparison. I've written full posts on [the MHK2](/blog/mitsubishi-mhk2-wired-controller-alternative.html) and [ditching Kumo Cloud](/blog/kumo-cloud-alternative-local-mitsubishi-control.html) already; this is the page that puts all four side by side so you can see where each one actually wins.

<img src="/assets/serin_cn105_mvz_aa7_1.webp" alt="The CN105 port on a Mitsubishi indoor unit's control board, with an orange cable connected to it" class="screenshot" width="480" height="480">

**Quick Facts: The Four Options**

- **Mitsubishi Wi-Fi adapter (MAC-587IF-E / Kumo Cloud / MELCloud):** OEM. Connects via **CN105**. Around **$227**. Requires a Mitsubishi account.
- **Mitsubishi wall controllers (MHK2, PAC-SDW01RC-1):** physical wall screen. Also connects via **CN105**. **$179–$400**. No app without the Wi-Fi adapter too.
- **Universal IR controllers (Sensibo, Cielo, etc.):** plug-in box, no wiring. Sends infrared commands, doesn't touch CN105. Around **$80–$130**.
- **Serin controller:** ESP32 board on **CN105**. App, Siri, and Home Assistant, fully local. **$35** pre-assembled, or **$15–20** in parts.

## The Four Ways to Do This

**Mitsubishi's own Wi-Fi adapter** gets you the official app, MELCloud or Kumo Cloud depending on your region, with the manufacturer's full backing and zero setup risk. It also puts your thermostat behind a login screen and a subscription-shaped cloud service for the rest of its life.

**Mitsubishi's wall controllers**, the MHK2 and the wired PAC-SDW01RC-1, give you a physical screen on the wall with real scheduling and no network dependency at all. They're the "just works, forever" option, and priced like it.

**Universal IR controllers** like Sensibo and Cielo are the easiest of the four to install: no cover off, no wires, just a box that plugs into an outlet and blasts infrared at your unit like a very persistent remote. Easiest setup, weakest connection to what the unit is actually doing.

**The Serin controller** clips onto the same CN105 port the OEM options use, but skips the cloud and the wall-mount price tag. App, Siri, and Home Assistant, for the cost of a coffee run.

## Option 1: Mitsubishi's Own Wi-Fi Adapter

The **MAC-587IF-E** (sold as the Kumo Cloud adapter in North America, MELCloud elsewhere) is Mitsubishi's factory answer to "can I control this from my phone." It plugs into the **CN105** port on the indoor unit's control board, the same port every other wired option in this article uses, and talks to Mitsubishi's cloud. Setup and remote access both run through the **Kumo Cloud** or **MELCloud** app, and you need a Mitsubishi account to use it. Retail runs around **$227** per adapter, one per indoor unit.

What it gets you right: it's the manufacturer's own hardware, built to their spec, with the fewest compatibility questions of anything here. If "official" matters to you, or you want a support line to call when something's wrong, that's worth paying for.

What it costs you: every command leaves your house. I covered this in more detail in [my Kumo Cloud writeup](/blog/kumo-cloud-alternative-local-mitsubishi-control.html), but the short version is that your thermostat now depends on Mitsubishi's servers staying up, their app staying maintained, and your account staying active. And at $227 a head, it's not even the cheap way to get an official app.

## Option 2: Mitsubishi's Wall Controllers

The **MHK2** (wireless, ~$300–$400) and **PAC-SDW01RC-1** (wired, ~$179) put a real screen on your wall instead of a phone in your pocket. Both connect through CN105 too. I go deep on these in a [dedicated comparison](/blog/mitsubishi-mhk2-wired-controller-alternative.html), but the short version: they sense room temperature where you actually sit instead of up at the ceiling near the indoor unit, and they need no network at all, ever. That's genuinely valuable for a rental, a guest room, or anyone who doesn't want a smartphone in the loop.

The catch is that neither one gives you an app on its own. Want phone control with the MHK2? You still buy the Wi-Fi adapter above and land back on Kumo Cloud. And a $179–$400 wall puck is a lot to spend just to avoid using your phone.

## Option 3: Universal IR Controllers (Sensibo, Cielo, and Similar)

This is the category most people find first, because it's the easiest to buy and install. Devices like the **Sensibo Sky** (around **$80–$130**, sale pricing varies) or **Cielo**'s Breez line sit on a shelf or plug into a nearby outlet, no cover removal, no wiring, no touching the HVAC at all. Point it at the indoor unit, connect it to Wi-Fi, and it drives the unit with infrared signals that mimic the factory remote.

That installation story is the real selling point, and I won't pretend otherwise. If you rent, if you don't want to void a warranty by opening the unit, or if you just want something running in five minutes, this is the least intimidating option on this list.

The tradeoff is what IR can't do. It's a one-way connection: the controller sends a command and assumes it landed, the same way your remote does. It doesn't read the unit's actual internal state back the way a wired CN105 connection can, so it has no visibility into compressor status, error codes, or what's really happening inside. And because it's blind, if someone picks up the original remote and changes a setting while the app isn't looking, the app's idea of what's running and the unit's actual state can drift apart. It also needs a clean line of sight to the unit's IR receiver, same as any remote.

Sensibo and Cielo also lean on their own vendor's cloud for scheduling and remote access, so you're not actually escaping the cloud model here, you're trading Mitsubishi's cloud for theirs. Sensibo layers an optional paid "Plus" plan on top for extra features; the core app functions are free.

## Option 4: The Serin Controller

The **Serin controller** is a small ESP32 board, an [M5Stack NanoC6 or Atom S3 Lite](/parts.html), that clips onto the same CN105 port the OEM adapter and wall controllers use. It's a two-way serial connection, not infrared, so it sees exactly what the unit is doing: compressor frequency, outside air temperature, runtime, error codes, and live logs, all visible in a built-in web UI with no app or cloud in the way.

<img src="/assets/media/webui.png" alt="The Serin controller's built-in web interface showing thermostat, fan, and vane controls in a browser with no app or cloud" class="screenshot" width="240" height="489" loading="lazy">

You flash it from your browser over USB, no soldering, nothing to compile, and pick one of two free, open-source firmwares depending on your platform: **ESPHome** for Home Assistant, or an **Apple Home compatible** build for Siri and the Home app. (That firmware isn't MFi-certified, so pairing shows an "Add Anyway" prompt in the Home app. Expected, and the device works normally right after.) Both are fully local. Neither needs an account.

<img src="/assets/serin_cn105_controller.jpg" alt="The pre-assembled Serin controller: an M5Stack ESP32 board with the CN105-to-Grove cable attached" class="screenshot" width="360" height="360" loading="lazy">

It costs **$15–20** in parts if you build it yourself, or **$35** [pre-assembled](/controller.html) if you'd rather skip that. Either way it's a fraction of every other option here, real diagnostics none of them expose, and it keeps the factory IR remote working alongside it.

What it doesn't do: it's not a wall screen. There's no physical display, so if you specifically want a thermostat mounted on the wall with no phone involved, that's the MHK2's job, not this one, for now. (A Serin wall display is in the works.)

## Side by Side

| | Mitsubishi Wi-Fi adapter | Mitsubishi wall controller | Sensibo / Cielo (IR) | Serin controller |
|---|---|---|---|---|
| **Typical price** | ~$227 | $179–$400 | ~$80–$130 | $35, or $15–20 DIY |
| **Connects via** | CN105 | CN105 | Infrared, no wiring | CN105 |
| **Installation** | Inside the unit | Inside the unit | Plug in, no cover off | Inside the unit |
| **Real unit state (compressor, errors)** | Limited | Error codes only | No, commands only | Yes, live in web UI |
| **Physical wall screen** | No | Yes | No | No |
| **App control** | Yes (Kumo Cloud / MELCloud) | Only with Wi-Fi adapter | Yes (vendor app) | Yes, built in |
| **Voice (Siri, etc.)** | Alexa / Google only | No | Yes, varies by model | Yes (Apple Home firmware) |
| **Home Assistant** | Not officially | No | Third-party integrations | Native, via ESPHome |
| **Cloud / account required** | Yes | No, unless adapter added | Yes, vendor cloud | No, ever |
| **Works without opening the unit** | No | No | Yes | No |
| **Keeps factory IR remote working** | Yes | Yes | Yes | Yes |

## Who Should Buy What

- **You want the manufacturer's own app and don't mind the cloud or the price.** Buy the Mitsubishi Wi-Fi adapter. It's the official path, and $227 buys you Mitsubishi's own support behind it.
- **You want a real screen on the wall and never want a phone or network involved.** Buy the MHK2 or PAC-SDW01RC-1. Neither one is trying to be an app, and that's the point. [Full comparison here](/blog/mitsubishi-mhk2-wired-controller-alternative.html).
- **You rent, can't open the unit, or want something running in five minutes.** Get a Sensibo or Cielo. You're trading real state feedback for zero-install convenience, and for some households that's the right trade.
- **You want app, Siri, or Home Assistant control, with real diagnostics, for the least money, and you don't mind opening the cover once.** Flash the [Serin controller](/parts.html). It's the only option here that's both local and cheap.

One thing worth knowing: the Wi-Fi adapter, the wall controllers, and the Serin controller all use the same **CN105** port, and most indoor units have exactly one. If you go that route, you're picking one interface for the port, not stacking three. IR controllers are the exception. Since they never touch CN105, you could technically run a Sensibo alongside any of the wired options, though at that point you're paying for two smart controllers doing one job.

## Will It Fit Your Unit?

Every wired option on this page, the Wi-Fi adapter, both wall controllers, and the Serin controller, needs the **CN105** port, built into most Mitsubishi Electric indoor units. Quick proxy: if your unit runs on Kumo Cloud or MELCloud today, it almost certainly has one. Universal IR controllers don't care about CN105 at all; they just need line of sight to the unit and don't require opening anything. Either way, take five minutes and [confirm your unit has CN105](/compatibility.html) before you buy anything that depends on it.

## The Short Version

There's no universally "best" answer here, only the right tradeoff for how you actually want to run your heat pump:

- Want it official, and the cloud doesn't bother you? Mitsubishi's Wi-Fi adapter.
- Want a wall screen and zero network dependency? The MHK2 or PAC-SDW01RC-1.
- Want zero installation effort and can live with blind IR commands? Sensibo or Cielo.
- Want real local control, real diagnostics, and the lowest price on this page? [The Serin controller](/parts.html).

If that last one is you:

1. [Check that your unit has a CN105 port](/compatibility.html).
2. Get the [board and cable](/parts.html), one per indoor unit, or the [pre-assembled controller](/controller.html).
3. [Flash the firmware](/flash.html) from your browser. ESPHome for Home Assistant, or the Apple Home compatible build for Apple households.

Same heat pump, four different ways to run it. Pick the one that matches how you actually live with it.
