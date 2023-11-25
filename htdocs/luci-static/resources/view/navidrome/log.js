'use strict';
'require dom';
'require fs';
'require poll';
'require uci';
'require view';
'require form';

return view.extend({
	render: function () {
		var css = `
			#log_textarea {
				margin-top: 10px;
			}
			#log_textarea pre {
				background-color: #f7f7f7;
				color: #333;
				padding: 10px;
				border: 1px solid #ccc;
				border-radius: 4px;
				font-family: Consolas, Menlo, Monaco, monospace;
				font-size: 14px;
				line-height: 1.5;
				white-space: pre-wrap;
				word-wrap: break-word;
				overflow-y: auto;
				max-height: 400px;
			}
			.cbi-section small {
				margin-left: 10px;
			}
			.cbi-section .cbi-section-actions {
				margin-top: 10px;
			}
			.cbi-section .cbi-section-actions-right {
				text-align: right;
			}
		`;

		var log_textarea = E('div', { 'id': 'log_textarea' },
			E('img', {
				'src': L.resource(['icons/loading.gif']),
				'alt': _('Loading...'),
				'style': 'vertical-align:middle'
			}, _('Collecting data ...'))
		);

		poll.add(L.bind(function () {
			return fs.exec_direct('logread', ['-e', 'navidrome'])
				.then(function (res) {
					// 处理返回的日志数据，只显示前 50 行
					var lines = res.trim().split('\n').slice(-50);
					var log = E('pre', { 'wrap': 'pre' }, [lines.join('\n') || _('The log is empty.')]);
					dom.content(log_textarea, log);
					log.scrollTop = log.scrollHeight;
				}).catch(function (err) {
					var log = E('pre', { 'wrap': 'pre' }, [_('Unknown error: %s').format(err)]);
					dom.content(log_textarea, log);
				});
		}));

		return E('div', { 'class': 'cbi-map' }, [
			E('style', [css]),
			E('div', { 'class': 'cbi-section' }, [
				log_textarea,
				E('small', {}, _('Refresh every 5 seconds.') + " " + _('Show only first 50 rows.').format(L.env.pollinterval)),
				E('div', { 'class': 'cbi-section-actions cbi-section-actions-right' })
			])
		]);
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
