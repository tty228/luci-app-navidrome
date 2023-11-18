## 简介

[中文文档](README.md) | [English](README_en.md)

在 OpenWrt 路由器上直接运行 Navidrome，而不是通过 Docker

## 功能

- [√] 运行 Navidrome
- [√] 部分 Navidrome 设置项和加入升级时备份
- [ ] 二进制文件下载
- [ ] 更多的设置项
- [ ] 多语言支持
- [ ] 日志显示（本来想直接写入系统日志中，但 procd_set_param 和管道符的配合好像怎么都搞不定）

## 说明

- 当前为初始版本，如果你要使用，请手动下载二进制文件到 /usr/share/navidrome 目录下，并给予 0755 权限
- 当前为初始版本，文件路径未做处理，将会占用大量磁盘空间，谨慎使用
- 当前为初始版本，可能会产生某些预期外的错误，谨慎使用
- 如需要转码，请自行安装 ffmpeg（未测试）

## 下载

| 支持的 OpenWrt 版本 | 下载地址 |
| :-------- | :----- |
| openwrt-19.07.0 ... latest | [![Lastest Release](https://img.shields.io/github/release/tty228/luci-app-navidrome.svg?style=flat)](https://github.com/tty228/luci-app-navidrome/releases)
| openwrt-18.06 | ×

