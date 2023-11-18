'use strict';
'require form';
'require poll';
'require rpc';
'require uci';
'require view';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('navidrome'), {}).then(function (res) {
		console.log(res);
		var isRunning = false;
		try {
			isRunning = res['navidrome']['instances']['instance1']['running'];
		} catch (e) { }
		return isRunning;
	});
}

function renderStatus(isRunning) {
	var spanTemp = '<em><span style="color:%s"><strong>%s %s</strong></span></em>';
	var renderHTML;
	if (isRunning) {
		renderHTML = String.format(spanTemp, 'green', _('navidrome'), _('RUNNING'));
	} else {
		renderHTML = String.format(spanTemp, 'red', _('navidrome'), _('NOT RUNNING'));
	}

	return renderHTML;
}

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('navidrome')
		]);
	},

	render: function (data) {
		var hosts = data[0],
			m, s, o,
			programPath = '/usr/share/navidrome/navidrome';

		m = new form.Map('navidrome', _('navidrome'), _('Welcome to Navidrome!<br /><br />If you encounter any issues while using it, please submit them here:') + '<a href="https://github.com/tty228/luci-app-navidrome" target="_blank">' + _('GitHub Project Address') + '</a>');

		s = m.section(form.TypedSection);
		s.anonymous = true;
		s.render = function () {
			var statusView = E('p', { id: 'service_status' }, _('Collecting data ...'));
			poll.add(function () {
				return L.resolveDefault(getServiceStatus()).then(function (res) {
					statusView.innerHTML = renderStatus(res);
				});
			});

			setTimeout(function () {
				poll.start();
			}, 100);

			return E('div', { class: 'cbi-section', id: 'status_bar' }, [
				statusView
			]);
		}

		s = m.section(form.NamedSection, 'config', 'navidrome', _(''));
		s.addremove = false;
		s.anonymous = true;

		// 基本设置
		o = s.option(form.Flag, 'Enable', _('Enabled'));

		o = s.option(form.Value, "MusicFolder", _("MusicFolder"))
		o.rmempty = false
		o.placeholder = "/opt/music"

		//o = s.option(form.Value, "DataFolder", _("DATAFOLDER"))
		//o.rmempty = false
		//o.placeholder = "/etc/navidrome"

		o = s.option(form.Value, "CacheFolder", _("CACHEFOLDER"))
		o.rmempty = false
		o.placeholder = "/tmp/navidrome"

		o = s.option(form.Value, "ScanSchedule", _("ScanSchedule"))
		o.rmempty = false
		o.placeholder = "@every 24h"

		o = s.option(form.Value, "TranscodingCacheSize", _("TranscodingCacheSize"))
		o.rmempty = false
		o.placeholder = "150MiB"

		o = s.option(form.Value, "Address", _("ADDRESS"))
		o.rmempty = false
		o.placeholder = "0.0.0.0"

		o = s.option(form.Value, 'Port', _('PORT'));
		o.placeholder = "4533"
		o.optional = false
		o.datatype = "uinteger"
		o.rmempty = false;

		//o = s.option(form.Value, "LogLevel", _('LogLevel'))
		//o.rmempty = true
		//o.value("error", _("error"))
		//o.value("warn", _("warn"))
		//o.value("info", _("info"))
		//o.value("debug", _("debug"))

		return m.render();
	}
});

