'use strict';
'require form';
'require poll';
'require rpc';
'require uci';
'require view';
'require fs';

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

		m = new form.Map('navidrome', _('navidrome'), _('Welcome to luci-app-navidrome!<br /><br />If you encounter any issues while using it, please submit them here:') + '<a href="https://github.com/tty228/luci-app-navidrome" target="_blank">' + _(' GitHub Project Address') + '</a>' + _('<br />If you want to learn more about the meanings of the setup options, please click here:') + '<a href="https://www.navidrome.org/docs/usage/configuration-options/#available-options">' + _(' Navidrome Configuration Options') + '</a>');

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

		o = s.option(form.Value, "Program_path", _("Program path"))
		o.rmempty = false
		o.placeholder = "/usr/share/navidrome/navidrome"
		o.description = _("The binary file size is approximately 30MB to 40MB. If your space is limited, save it to the tmp directory or an external disk.")

		o = s.option(form.Button, '_update', _('update'));
		o.inputstyle = 'add';
		o.onclick = function () {
			fs.exec('/usr/libexec/navidrome-call', ['update']);
			// 立即跳转到日志页面
			window.location.href = '/cgi-bin/luci/admin/services/navidrome/log';
		};

		o = s.option(form.Value, "MusicFolder", _("MusicFolder"))
		o.rmempty = false
		o.placeholder = "/opt/music"

		o = s.option(form.Value, "ScanSchedule", _("ScanSchedule"))
		o.rmempty = false
		o.placeholder = "@every 24h"
		o.description = _("Music library scan interval, to fully disable it, set it to 0.")

		o = s.option(form.Value, "DataFolder", _("DataFolder"))
		o.rmempty = false
		o.placeholder = "/opt/navidrome"
		o.description = _("If your available space is limited, use an external disk. To avoid unsuccessful disk mounting, the program will not run when the directory is empty.")

		o = s.option(form.Value, "CacheFolder", _("CacheFolder"))
		o.rmempty = false
		o.placeholder = "/opt/navidrome/cache"

		o = s.option(form.Value, "ImageCacheSize", _("ImageCacheSize"))
		o.rmempty = false
		o.placeholder = "100MB"
		o.description = _("The size of the image (artwork) cache, to fully disable it, set it to 0.")

		o = s.option(form.Value, "TranscodingCacheSize", _("TranscodingCacheSize"))
		o.rmempty = false
		o.placeholder = "100MB"
		o.description = _("The size of the transcoding cache, to fully disable it, set it to 0.")

		o = s.option(form.Value, "Address", _("Address"))
		o.rmempty = false
		o.placeholder = "0.0.0.0"

		o = s.option(form.Value, 'Port', _('Port'));
		o.placeholder = "4533"
		o.optional = false
		o.datatype = "uinteger"
		o.rmempty = false;

		o = s.option(form.Value, "LogLevel", _('LogLevel'))
		o.rmempty = true
		o.value("error", _("error"))
		o.value("warn", _("warn"))
		o.value("info", _("info"))
		o.value("debug", _("debug"))

		o = s.option(form.TextValue, '_config', _('Config File'));
		o.rows = 20;
		o.wrap = 'oft';
		o.cfgvalue = function (section_id) {
			return fs.trimmed('/etc/navidrome/navidrome.toml');
		};
		o.write = function (section_id, formvalue) {
			return this.cfgvalue(section_id).then(function (value) {
				if (value == formvalue) {
					return
				}
				return fs.write('/etc/navidrome/navidrome.toml', formvalue.trim().replace(/\r\n/g, '\n') + '\n');
			});
		};
		o.description = _('<br />If you want to learn more about the meanings of the setup options, please click here:') + '<a href="https://www.navidrome.org/docs/usage/configuration-options/#available-options">' + _(' Navidrome Configuration Options') + '</a>'+ _('<br/>Please use the 「Save」 button in the text box.');


		return m.render();
	}
});