## Introduction

[Chinese Documentation](README.md) | [English](README_en.md)

A LuCI interface for running [Navidrome](https://github.com/navidrome/navidrome/) on OpenWrt.

## Features

- [x] Run Navidrome
- [x] Binary file auto download
- [x] More configuration options
- [x] Multi-language support
- [x] Log display
- [x] Download binaries based on model
- [x] transcoding(please install ffmpeg manually)

## Instructions

Installing Docker on OpenWrt can cause TPROXY transparent proxy to fail, thus affecting UDP proxy.

However, the official Navidrome release includes binary executable files that can be run directly on OpenWrt.

Here, a LuCI interface for Navidrome binary files is provided for easy setup and installation.

## Download

| Supported OpenWrt Versions | Download Link |
| :-------- | :----- |
| openwrt-19.07.0 ... latest | [![Lastest Release](https://img.shields.io/github/release/tty228/luci-app-navidrome.svg?style=flat)](https://github.com/tty228/luci-app-navidrome/releases)
| openwrt-18.06 | ×

