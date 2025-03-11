# SPDX-License-Identifier: GPL-3.0-only
#
# Copyright (C) 2022 ImmortalWrt.org

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-navidrome
PKG_VERSION:=1.8
PKG_RELEASE:=
PKG_MAINTAINER:=tty228 <tty228@yeah.net>
PKG_CONFIG_DEPENDS:= \
        CONFIG_PACKAGE_$(PKG_NAME)_Enable_Transcoding

LUCI_TITLE:=Your Personal Streaming Service
LUCI_PKGARCH:=all
LUCI_DEPENDS:=+zoneinfo-all \
        +PACKAGE_$(PKG_NAME)_Enable_Transcoding:ffmpeg

define Package/$(PKG_NAME)/config
config PACKAGE_$(PKG_NAME)_Enable_Transcoding
        bool "Enable Transcoding"
        help
                Remember to install ffmpeg in your system, a requirement for Navidrome to work properly. 
        select PACKAGE_ffmpeg
        default n
endef

define Package/$(PKG_NAME)/conffiles
/etc/config/navidrome
/etc/navidrome/navidrome.toml
endef

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
