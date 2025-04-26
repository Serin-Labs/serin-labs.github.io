# Serin: Open Source Mitsubishi HVAC Controller

Serin is an ESP32-based device that connects to Mitsubishi mini split HVAC units via the CN105 port, enabling local control and monitoring using open source software. With Serin, you can:

- Integrate your Mitsubishi HVAC with Home Assistant for automation and remote access
- Use the built-in web interface for direct local control
- Maintain privacy and reliability with no cloud dependency
- Easily update and configure the device using ESPHome and Improv

## Features
- Plug-and-play connection to Mitsubishi mini splits (CN105)
- Local API and web UI
- Home Assistant auto-discovery
- Secure, open source firmware
- No cloud required

## Setup

See the [setup guide](setup.html) for step-by-step instructions and firmware installation using Improv.

## Example ESPHome Configuration

A minimal configuration for Serin (ESP32):
```yaml
esphome:
  name: serin
  friendly_name: Serin
esp32:
  board: esp32doit-devkit-v1
  framework:
    type: esp-idf
uart:
  id: HP_UART
  baud_rate: 2400
  tx_pin: GPIO17
  rx_pin: GPIO16
external_components:
  - source: github://echavet/MitsubishiCN105ESPHome
climate:
  - platform: cn105
    name: "My Heat Pump"
    update_interval: 2s
logger:
  level: INFO
api:
  encryption:
    key: !secret api_key
ota:
  platform: esphome
  password: !secret ota_password
wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password
  ap:
    ssid: "Serin Fallback Hotspot"
    password: !secret fallback_password
captive_portal:
```

## Disclaimer
Serin is not affiliated with Mitsubishi. Use at your own risk. Setup may void your equipment warranty.
