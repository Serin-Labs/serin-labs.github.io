# Serin Labs – Mitsubishi Heat Pump Controller

Cloud-free smart control for Mitsubishi heat pumps. Open source ESPHome and HomeKit-compatible firmware.

## Why?

- **100% Local Control** – Your data stays in your home. No cloud, no fees, no privacy worries.
- **Open Source** – Inspect, modify, and contribute to the firmware and tools.
- **Compact & Clean** – Installs inside your heat pump for a seamless look.
- **Two Platforms** – ESPHome for Home Assistant. HomeKit-compatible firmware for Apple Home.
- **DIY or Pre-Assembled** – Build it yourself or order a ready-to-go kit.

## How It Works

This controller communicates over the **CN105 serial port** found on most Mitsubishi Electric indoor units. Unlike cloud adapters or IR blasters, CN105 serial provides real-time, bidirectional control — fully local, fully open source, for about $15–20 in parts.

## Choose Your Platform

| | ESPHome | HomeKit-Compatible |
|---|---|---|
| **Best for** | Home Assistant users | Apple Home users |
| **Built on** | [MitsubishiCN105ESPHome](https://github.com/echavet/MitsubishiCN105ESPHome) by echavet | [esp-homekit-sdk](https://github.com/espressif/esp-homekit-sdk) |
| **Hub required** | Home Assistant | Apple Home Hub (Apple TV or HomePod) |
| **Setup guide** | [ESPHome setup](https://serin-labs.github.io/esphome/setup) | [HomeKit setup](https://serin-labs.github.io/homekit/setup) |

## Quick Start

1. **Check compatibility.** Confirm your unit has a CN105 port — see the [compatibility list](https://serin-labs.github.io/compatibility).
2. **Get the hardware.** One board + one cable, about $15–20 total — see [what you need](https://serin-labs.github.io/parts).
3. **Flash the firmware.** Use the [browser flash tool](https://serin-labs.github.io/flash) to install ESPHome or HomeKit firmware directly from your browser.
4. **Follow your setup guide.** [ESPHome](https://serin-labs.github.io/esphome/setup) or [HomeKit](https://serin-labs.github.io/homekit/setup) — connect to WiFi and configure your platform.
5. **Install in your HVAC.** Power off, connect the [CN105-to-Grove cable](https://serin-labs.github.io/wiring), tuck the device inside, and restore power.

Multiple indoor units? You need one controller per indoor head — repeat the steps above for each unit.

## Supported Boards

Both boards work with ESPHome and HomeKit firmware.

| | NanoC6 *(recommended)* | Atom S3 Lite |
|---|---|---|
| **Chip** | ESP32-C6 | ESP32-S3 |
| **WiFi** | WiFi 6 | WiFi 4 |
| **Size** | 23.5 × 12 mm | 24 × 24 mm |
| **Price** | ~$7 | ~$8 |
| **Buy** | [M5Stack](https://shop.m5stack.com/products/m5stack-nanoc6-dev-kit) | [M5Stack](https://shop.m5stack.com/products/atoms3-lite-esp32s3-dev-kit) |

The NanoC6 is recommended for most setups — its smaller size and WiFi 6 radio provide better signal through HVAC enclosures.

## Site & Documentation

The full documentation lives at **[serin-labs.github.io](https://serin-labs.github.io)**:

- [Compatibility](https://serin-labs.github.io/compatibility) – Check if your Mitsubishi unit is supported
- [What You Need](https://serin-labs.github.io/parts) – Complete parts list
- [Flash Firmware](https://serin-labs.github.io/flash) – Browser-based firmware installer
- [Wiring Reference](https://serin-labs.github.io/wiring) – Pinout diagram and cable assembly
- [YAML Generator](https://serin-labs.github.io/esphome/generate-yaml) – Generate a ready-to-use ESPHome config
- [HomeKit Features](https://serin-labs.github.io/homekit/features) – HomeKit firmware capabilities
- [Troubleshooting](https://serin-labs.github.io/troubleshooting) – Solutions to common issues

## Community

- [Discussions](https://github.com/Serin-Labs/serin-cn105/discussions) – Ask questions, share your setup, or suggest features
- [Issues](https://github.com/Serin-Labs/serin-cn105/issues) – Report bugs or request changes

## Credits & Open Source

The ESPHome integration is built on [echavet’s MitsubishiCN105ESPHome](https://github.com/echavet/MitsubishiCN105ESPHome) — Serin Labs provides curated configs, browser flashing, and a YAML generator on top of that project. The HomeKit-compatible firmware is developed by Serin Labs ([source](https://github.com/akifbayram/mitsubishi-cn105-homekit)), built on Espressif’s [esp-homekit-sdk](https://github.com/espressif/esp-homekit-sdk).

Both platforms build on foundational work by [SwiCago](https://github.com/SwiCago/HeatPump) and [geoffdavis](https://github.com/geoffdavis/esphome-mitsubishiheatpump).

## Disclaimer & Safety

This is an independent open-source project. It is not developed, endorsed, or certified by Apple Inc. or Mitsubishi Electric Corporation. Working on HVAC systems can be risky and may void warranties. Always turn off power before connecting or disconnecting any cables. This project is provided as-is, without warranty or liability.