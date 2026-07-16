# Serin Labs – Smart Controller for Mitsubishi Mini-Splits

Cloud-free smart control for Mitsubishi mini-splits. Open source ESPHome and HomeKit-compatible firmware.

## Why?

- **100% Local Control** – Your data stays in your home. No cloud, no fees, no privacy worries.
- **Open Source** – Inspect, modify, and contribute to the firmware and tools.
- **Compact** – Installs inside your heat pump, out of sight.
- **Two Platforms** – ESPHome for Home Assistant. HomeKit-compatible firmware for Apple Home.
- **DIY or Pre-Assembled** – Build it yourself or [order a ready-to-go kit](https://serinlabs.etsy.com/).

## How It Works

This controller talks to your unit over the **CN105 serial port** found on most Mitsubishi Electric indoor units. Unlike cloud adapters or IR blasters, CN105 gives you real-time, two-way control that runs entirely on your own network — about $15–20 in parts.

## Choose Your Platform

| | ESPHome | HomeKit-Compatible |
|---|---|---|
| **Best for** | Home Assistant users | Apple Home users |
| **Built on** | [MitsubishiCN105ESPHome](https://github.com/echavet/MitsubishiCN105ESPHome) by echavet | [esp-homekit-sdk](https://github.com/espressif/esp-homekit-sdk) |
| **Hub required** | Home Assistant | Apple Home Hub (Apple TV or HomePod) |
| **Setup guide** | [ESPHome setup](https://serin-labs.com/esphome/setup) | [HomeKit setup](https://serin-labs.com/homekit/setup) |

## Quick Start

1. **Check your model.** Type your model number into the [instant compatibility checker](https://serin-labs.com/compatibility) to confirm your unit has a CN105 port.
2. **Get the hardware.** One board + one cable, about $15–20 total — see [what you need](https://serin-labs.com/parts), or order the [pre-assembled Serin Controller](https://serinlabs.etsy.com/).
3. **Flash the firmware.** Use the [browser flash tool](https://serin-labs.com/flash) to install ESPHome or HomeKit-compatible firmware directly from your browser.
4. **Follow your setup guide.** [ESPHome](https://serin-labs.com/esphome/setup) or [HomeKit](https://serin-labs.com/homekit/setup) — connect to WiFi and configure your platform.
5. **Install in your HVAC.** Power off, connect the [CN105-to-Grove cable](https://serin-labs.com/wiring), tuck the device inside, and restore power.

Multiple indoor units? You need one controller per indoor head — repeat the steps above for each unit.

## Supported Boards

Both boards work with ESPHome and HomeKit-compatible firmware.

| | NanoC6 *(recommended)* | Atom S3 Lite |
|---|---|---|
| **Chip** | ESP32-C6 | ESP32-S3 |
| **WiFi** | WiFi 6 | WiFi 4 |
| **Size** | 23.5 × 12 mm | 24 × 24 mm |
| **Price** | ~$7 | ~$8 |
| **Buy** | [M5Stack](https://shop.m5stack.com/products/m5stack-nanoc6-dev-kit) | [M5Stack](https://shop.m5stack.com/products/atoms3-lite-esp32s3-dev-kit) |

For most setups the NanoC6 is the better pick: it's smaller, and its WiFi 6 radio holds a stronger signal through metal HVAC enclosures.

## Site & Documentation

The full documentation lives at **[serin-labs.com](https://serin-labs.com)**:

- [Check Your Model](https://serin-labs.com/compatibility) – Instant compatibility checker for your Mitsubishi unit
- [Parts List](https://serin-labs.com/parts) – Complete parts list
- [Flash Firmware](https://serin-labs.com/flash) – Browser-based firmware installer
- [Wiring Reference](https://serin-labs.com/wiring) – Pinout diagram and cable assembly
- [YAML Generator](https://serin-labs.com/esphome/generate-yaml) – Generate a ready-to-use ESPHome config
- [HomeKit Features](https://serin-labs.com/homekit/features) – HomeKit-compatible firmware capabilities
- [Troubleshooting](https://serin-labs.com/troubleshooting) – Solutions to common issues

## Community

- [Discussions](https://github.com/Serin-Labs/serin-cn105/discussions) – Ask questions, share your setup, or suggest features
- [Issues](https://github.com/Serin-Labs/serin-cn105/issues) – Report bugs or request changes

## Credits & Open Source

The ESPHome integration is built on [echavet's MitsubishiCN105ESPHome](https://github.com/echavet/MitsubishiCN105ESPHome). On top of that, Serin Labs adds curated configs, browser flashing, and a YAML generator. The HomeKit-compatible firmware is an independent open-source project ([akifbayram/mitsubishi-cn105-homekit](https://github.com/akifbayram/mitsubishi-cn105-homekit)) built on Espressif's [esp-homekit-sdk](https://github.com/espressif/esp-homekit-sdk).

Both platforms build on foundational work by [SwiCago](https://github.com/SwiCago/HeatPump) and [geoffdavis](https://github.com/geoffdavis/esphome-mitsubishiheatpump).

## Disclaimer & Safety

This is an independent open-source project. It is not developed, endorsed, or certified by Apple Inc. or Mitsubishi Electric Corporation. Working on HVAC systems can be risky and may void warranties. Always turn off power before connecting or disconnecting any cables. This project is provided as-is, without warranty or liability.