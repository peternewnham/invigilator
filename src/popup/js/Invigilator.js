// strict mode
"use strict";

var Invigilator = {

	initEvents: function() {

		/**
		 * Open external links in a new tab
		 */
		$('body').on('click', 'a', function(e) {

			var href = $(this).attr('href');

			// link contains :// so is external
			if (/:\/\//.test(href)) {

				e.preventDefault();

				Invigilator.common.Util.openLink(href);

			}

		});

		// sometimes scrollbar does not show
		// this tries to force it to do so
		$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {

			var d = document.createElement('div');
			d.style.setProperty('height', '5px');
			document.body.appendChild(d);
			setTimeout(function() {
				document.body.removeChild(d)
			}, 10);

			// also track tab view
			Invigilator.common.Analytics.pageview('popup.html' + $(e.target).attr('href'), 'Popup ' + $(e.target).data('title'));

		});

	}

};

$(function() {

	// track page view
	Invigilator.common.Analytics.pageview('popup.html#installed', 'Popup Installed');

	Invigilator.initEvents();

});