// strict mode
"use strict";

var Invigilator = {

	openExternalLink: function(url) {

		console.log('Opening External Link:', url);

		chrome.tabs.create({
			url: url
		});

	},

	initEvents: function() {

		var _this = this;

		/**
		 * Open external links in a new tab
		 */
		$('body').on('click', 'a', function(e) {

			var href = $(this).attr('href');

			// link contains :// so is external
			if (/:\/\//.test(href)) {

				e.preventDefault();

				_this.openExternalLink(href);

			}

		});

		$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
			var d = document.createElement('div');
			d.style.setProperty('height', '5px');
			document.body.appendChild(d);
			setTimeout(function() {
				document.body.removeChild(d)
			}, 10);
		});

	}

};

$(function() {

	Invigilator.initEvents();

});