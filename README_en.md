## Introduction

[Chinese Documentation](README.md) | [English](README_en.md)

Run Navidrome directly on OpenWrt routers, without using Docker.

## Features

- [√] Run Navidrome
- [√] Partial Navidrome settings and backup during upgrades
- [ ] Binary file download
- [ ] More configuration options
- [ ] Multi-language support
- [ ] Log display (originally intended to write directly to system logs, but the coordination between `procd_set_param` and the pipe symbol seems to be difficult to achieve)

## Instructions

- This is the initial version. If you want to use it, please manually download the binary file to the `/usr/share/navidrome` directory and give it 0755 permissions.
- This is the initial version, and the file paths are not handled, which may consume a significant amount of disk space. Use with caution.
- This is the initial version, and there may be some unexpected errors. Use with caution.
- If transcoding is needed, please install ffmpeg manually (not tested).

## Download

| Supported OpenWrt Versions | Download Link |
| :-------- | :----- |
| openwrt-19.07.0 ... latest | [![Lastest Release](https://img.shields.io/github/release/tty228/luci-app-navidrome.svg?style=flat)](https://github.com/tty228/luci-app-navidrome/releases)
| openwrt-18.06 | ×

