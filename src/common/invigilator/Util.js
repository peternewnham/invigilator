(function(i) {

	i.common.Util = {

		openLink: function(url, noTrack) {

			console.info('Opening link: ', url);

			// track event
			if (!noTrack) {
				i.common.Analytics.event('Link', 'click', url);
			}

			chrome.tabs.create({
				url: url
			});

		},

		isEmptyObject: function(obj) {

			return Object.getOwnPropertyNames(obj).length === 0;

		},

		/**
		 * Copies all the properties from one object to another
		 * @param {Object} to	The object to copy properties to
		 * @param {Object} from	The object to copy properties from
		 * @returns {Object}
		 */
		extendObject: function(to, from) {

			for (var field in from) {

				if (from.hasOwnProperty(field)) {

					to[field] = from[field];

				}

			}

			return to;

		}

	};

})(Invigilator);