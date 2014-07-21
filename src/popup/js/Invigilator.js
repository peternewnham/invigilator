// strict mode
"use strict";

var Invigilator = {

	/**
	 * Initialise general popup events
	 */
	initEvents: function() {

		/**
		 * Link click events
		 * Open external links in a new tab
		 */
		$('body').on('click', 'a', function(e) {

			// get url
			var href = $(this).attr('href');

			// link contains :// so is external
			if (/:\/\//.test(href)) {

				e.preventDefault();

				// open it
				Invigilator.common.Util.openLink(href);

			}

		});

		/**
		 * Bootstrap tab show event
		 * Sometimes scrollbar does not show so this tries to force it to do so
		 */
		$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {

			// create a div, add it to the page and then remove it
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

	// initialise events
	Invigilator.initEvents();

	// show about tab if there is an update
	Invigilator.About.checkUpdate();

});