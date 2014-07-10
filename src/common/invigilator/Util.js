(function(i) {

	i.common.Util = {

		openLink: function(url) {

			console.info('Opening link: ', url);

			// track event
			i.common.Analytics.event('Link', 'click', url);

			chrome.tabs.create({
				url: url
			});

		},

		isEmptyObject: function(obj) {

			return Object.getOwnPropertyNames(obj).length === 0;

		}

	};

})(Invigilator);