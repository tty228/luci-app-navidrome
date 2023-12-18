## 简介

[中文文档](README.md) | [English](README_en.md)

用于 OpenWrt 上运行 [Navidrome](https://github.com/navidrome/navidrome/) 的 LuCI 界面

## 功能

- [x] 运行 Navidrome
- [x] 二进制文件自动下载
- [x] 更多的设置项
- [x] 多语言支持
- [x] 日志显示
- [x] 根据机型下载二进制文件
- [x] 转码（需自行安装 ffmpeg）

## 说明

在 OpenWrt 上安装 Docker 会导致 TPROXY 透明代理失效，从而影响 UDP 代理。

但 Navidrome 官方提供了二进制执行文件，可以直接在 OpenWrt 上运行。

这里提供了  二进制文件的 LuCI 界面，以方便设置和安装。

## 下载

| 支持的 OpenWrt 版本 | 下载地址 |
| :-------- | :----- |
| openwrt-19.07.0 ... latest | [![Lastest Release](https://img.shields.io/github/release/tty228/luci-app-navidrome.svg?style=flat)](https://github.com/tty228/luci-app-navidrome/releases)
| openwrt-18.06 | ×

