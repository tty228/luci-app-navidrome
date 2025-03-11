'use strict';
'require form';
'require poll';
'require rpc';
'require uci';
'require view';
'require fs';
'require ui';

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

function renderStatus(isRunning, listen_port, noweb, localVersion) {
	var spanTemp = '<em><span style="color:%s"><strong>%s %s</strong></span></em>';
	var renderHTML;
	if (isRunning) {
    if (localVersion !== "0.0.0") {
        renderHTML = spanTemp.format('green', _('navidrome'), _('RUNNING'));

        // 判断如果 localVersion 不为 "0.0.0"，则添加 Web 接口链接
        if (noweb !== '1') {
            renderHTML += String.format('&#160;<a class="btn cbi-button" href="%s:%s" target="_blank" rel="noreferrer noopener">%s</a>',
                window.location.origin, listen_port, _('Open Web Interface'));
			}
		} else {
			renderHTML = spanTemp.format('green', _('navidrome'), _('Downloading...'));
		}
	} else {
		renderHTML = spanTemp.format('red', _('navidrome'), _('NOT RUNNING'));
	}
	return renderHTML;
}

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('navidrome'),
            fs.exec('/usr/libexec/navidrome-call', ['get_local_version']).then(function(res) { return res.stdout.trim(); })
		]);
	},

	render: function (data) {
		var listen_port = (uci.get(data[0], 'config', 'Port') || '4533'),
			noweb = uci.get(data[0], 'config', 'noweb') || '0';
		var	m, s, o;
		var localVersion = '?';
		if (data[1]) {
            localVersion = data[1].trim();
        }
			m = new form.Map('navidrome', '', '<div style="font-size: 30px; color: #333; font-family: Arial, sans-serif; font-weight: bold; margin-bottom: 15px;">Navidrome</div>' + '<div style="font-size: 12px; line-height: 2; color: #666; font-family: Arial, sans-serif; margin-bottom: 20px;">' +
				_('Welcome to luci-app-navidrome!') + "<br>" + 
				_('For more information, please visit:') + "<br>" + 
				'<a style="color: #007BFF; font-size: 14px; line-height: 1.5; font-family: Arial, sans-serif; display: block;" href="https://github.com/navidrome/navidrome/" target="_blank">' + _('Navidrome') + '</a>' + 
				'<a style="color: #007BFF; font-size: 14px; line-height: 1.5; font-family: Arial, sans-serif; display: block;" href="https://github.com/tty228/luci-app-navidrome" target="_blank">' + _('luci-app-navidrome') + "<br>" + '</a>' + '</div>');

		s = m.section(form.TypedSection);
		s.anonymous = true;
		s.render = function () {
			var statusView = E('p', { id: 'service_status' }, _('Collecting data ...'));
			poll.add(function () {
				return L.resolveDefault(getServiceStatus()).then(function (res) {
					var view = document.getElementById('service_status');
					statusView.innerHTML = renderStatus(res, listen_port, noweb, localVersion);
				});
			});

			setTimeout(function () {
				poll.start();
			}, 100);

			// 增加 margin-bottom 样式来调整间距，并添加细线分隔符
			return E('div', { class: 'cbi-section', id: 'status_bar', style: 'margin-bottom: 20px;' }, [
				statusView,
				E('hr', { style: 'border-top: 0px solid #dddddd; margin-top: 15px; margin-bottom: 15px;' })  // 细线分隔符
			]);
		};

		s = m.section(form.NamedSection, 'config', 'navidrome', _(''));
		s.addremove = false;
		s.anonymous = true;

		// 基本设置
		o = s.option(form.Flag, 'Enable', _('Enabled'));

		o = s.option(form.Value, "Program_path", _("Program path"))
		o.rmempty = false
		o.placeholder = "/usr/share/navidrome/navidrome"
		o.description = _("The binary file size is approximately 30MB to 40MB. If your space is limited, save it to the tmp directory or an external disk.")

		// 定义更新并跳转到日志页面的函数
		function updateAndRedirect() {
			// 创建用于显示日志的元素
			var logContainer = E('pre'); // 使用 <pre> 元素保留文本中的换行符

			// 显示模态框，包含手动关闭按钮
			var modal = ui.showModal(_('Updating'), [
				logContainer, // 将 logContainer 添加到模态框中
				E('div', { 'class': 'right' }, [
					E('button', {
						'class': 'cbi-button cbi-button-primary',
						'click': function () {
							// 清除定时器
							//clearInterval(logUpdateInterval);
							//ui.hideModal(modal);
							//console.log('Timer cleared.');
							location.reload();
						}
					}, [ _('Dismiss') ])
				])
			]);

			// 定义读取日志内容的函数
			function readLogContent() {
				// 读取下载日志的内容并显示在模态框中
				fs.read('/tmp/navidrome/download.log')
					.then(function (logContent) {
						//console.log('Read log content:', logContent); // 添加调试信息
						logContainer.innerText = logContent || 'No log content available.';
					})
					.catch(function (err) {
						logContainer.innerText = 'Waiting for download to start...';
					});
			}

			// 设置定时器，每秒钟读取一次日志内容
			var logUpdateInterval = setInterval(readLogContent, 1000);

			// 发起更新命令
			fs.exec('/usr/libexec/navidrome-call', ['update'])
				.then(function () {
					// 读取一次最终的日志内容
					readLogContent();
				})
				.catch(function (err) {
					// 更新失败时，显示通知
					ui.addNotification(null, [
						E('p', [ _('Update failed:'), err ])
					]);
				});
		}

		o = s.option(form.Button, '_update', (localVersion === "0.0.0") ? _("Click to download") : _("Check for updates"));
		o.inputstyle = 'add';
		o.description = (localVersion === "0.0.0") ? _("Core files missing") : _("Current version:") + ' v' + localVersion;

		o.onclick = function () {
			if (localVersion === "0.0.0") {
				updateAndRedirect();
			} else {
				// 缓存当前上下文
				var _this = this;

				// 发起请求获取最新版本号
				fetch('https://api.github.com/repos/navidrome/navidrome/releases/latest')
					.then(response => response.json())
					.then(data => {
						// 获取最新版本号
						var remoteVersion = data.tag_name;
						
						if ("v" + localVersion !== remoteVersion) {
							_this.description = '<span style="color: #333; font-size: 14px; line-height: 1.5; font-family: Arial, sans-serif;">' + _("Current version:") + ' v' + localVersion + "<br>" +
												_("Latest version:") + '</span>' + '<a style="color: #007BFF; font-size: 14px; line-height: 1.5; font-family: Arial, sans-serif;" href="https://github.com/navidrome/navidrome/releases/tag/' + remoteVersion + '" target="_blank">' + ' ' + remoteVersion + '</a>';
							_this.onclick = updateAndRedirect;
							_this.title = _("Click to download");
						} else {
							_this.description = _("Current version:") + ' v' + localVersion + ' ' + _("Up to date, no update needed.");
						}
						// 重新渲染
						_this.map.save();
					})
					.catch(error => {
						console.error('Error fetching remote version:', error);
					});
			}
		};

		o = s.option(form.Value, "MusicFolder", _("MusicFolder"))
		o.rmempty = false
		o.placeholder = "/opt/music"

		o = s.option(form.Value, "ScanSchedule", _("ScanSchedule"))
		o.rmempty = false
		o.placeholder = "0"
		o.description = _("Schedule for automatic scans. Use Cron syntax. To fully disable it, set it to 0.")

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
		o.description = _('<br />If you want to learn more about the meanings of the setup options, please click here:') + '<a href="https://www.navidrome.org/docs/usage/configuration-options/#available-options" target="_blank">' + _(' Navidrome Configuration Options') + '</a>'+ _('<br/>') + 
						_('Please use the 「Save」 button in the text box.');


		return m.render();
	}
});