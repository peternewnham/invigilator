/**
 * Utility helper functions
 */
(function(i) {

	i.common.Util = {

		/**
		 * Opens an external link in a new tab and log an event
		 * @param {String} url		The url to open
		 * @param {Boolean} noTrack	Whether not to track the link event
		 */
		openLink: function(url, noTrack) {

			console.info('Opening link: ', url);

			// track event
			if (!noTrack) {
				i.common.Analytics.event('Link', 'click', url);
			}

			// open url in new tab
			chrome.tabs.create({
				url: url
			});

		},

		/**
		 * Returns whether the object is empty (i.e. has no properties set)
		 * @param {Object} obj	The object to check
		 * @returns {Boolean}
		 */
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