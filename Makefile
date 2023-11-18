# SPDX-License-Identifier: GPL-3.0-only
#
# Copyright (C) 2022 ImmortalWrt.org

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-navidrome
PKG_VERSION:=0.1
PKG_RELEASE:=
PKG_MAINTAINER:=tty228 <tty228@yeah.net>
PKG_CONFIG_DEPENDS:=

LUCI_TITLE:=Your Personal Streaming Service
LUCI_PKGARCH:=all
LUCI_DEPENDS:=

define Package/$(PKG_NAME)/conffiles
/etc/config/navidrome
/etc/navidrome/navidrome.db
/etc/navidrome/navidrome.db-shm
/etc/navidrome/navidrome.db-wal
endef

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
