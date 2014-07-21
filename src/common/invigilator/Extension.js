/**
 * Extension utilities
 */
(function(i) {

	i.common.Extension = {

		/**
		 * Default icon to use for extensions if an extension doesn't have it's own icon
		 */
		DEFAULT_ICON: 'images/extension.png',

		/**
		 * Returns whether the extension is a development extension
		 * @param extension
		 * @returns {boolean}
		 */
		isDev: function(extension) {

			if (extension.installType === 'development') {
				console.warn('Extension', extension.name, ' is in development mode');
				return true;
			}
			else {
				return false;
			}

		},

		/**
		 * Wraps the extension object so it is safe to send via a message
		 * @param extension
		 * @returns {object}
		 */
		wrap: function(extension) {

			for (var field in extension) {

				// convert dates to timestamps
				if (extension[field] instanceof Date) {
					extension[field] = 'Date|' + extension[field].getTime();
				}

			}

			return extension;

		},

		/**
		 * Unwraps the extension object after it has been sent via a message
		 * @param extension
		 * @returns {object}
		 */
		unwrap: function(extension) {

			for (var field in extension) {

				// convert timestamps back to date objects
				if (/^Date\|/.test(extension[field])) {

					var time = parseInt(extension[field].replace(/^Date|/, ''), 10);
					extension[field] = new Date(time);

				}

			}

			return extension;

		},

		/**
		 * Loop through each "live" installed extension and apply a callback with the extension as the only parameter
		 * @param {Function} callback
		 */
		each: function(callback) {

			chrome.management.getAll(function(extensions) {

				for (var j=0; j<extensions.length; j++) {

					var extension = extensions[j];

					callback(extension);

				}

			});

		},

		/**
		 * Returns all "live" installed extensions, sorted by name
		 * @param {Function} callback
		 */
		getAll: function(callback) {

			// sort extensions by name as it's more convenient
			var sorter = function(a, b) {
				if (a.name < b.name) return -1
				else if (a.name > b.name) return 1
				else return 0;
			}

			chrome.management.getAll(function(extensions) {

				callback(extensions.sort(sorter));

			});

		},

		/**
		 * Returns the details of a specific "live" extension
		 * @param {String} id			Extension id
		 * @param {Function} callback	Callback function with extension details passed as parameter
		 */
		get: function(id, callback) {

			chrome.management.getAll(function(extensions) {

				for (var j=0; j<extensions.length; j++) {

					var extension = extensions[j];

					if (extension.id === id) {
						callback(extension);
						break;
					}

				}

			});

		},

		/**
		 * Enables a specific extension
		 * @param {String} id			Extension ID
		 * @param {Function} callback	Callback after extension is enabled
		 */
		enable: function(id, callback) {

			this.setEnabled(id, true, callback);

		},

		/**
		 * Disables a specific extension
		 * @param {String} id			Extension ID
		 * @param {Function} callback	Callback after extension is disabled
		 */
		disable: function(id, callback) {

			this.setEnabled(id, false, callback);

		},

		/**
		 * Sets the enabled status for an extension
		 * @param {String} id			Extension ID
		 * @param {Boolean} enabled		Whether extension is enabled
		 * @param {Function} callback	Callback function after extension is enabled/disabled
		 */
		setEnabled: function(id, enabled, callback) {

			console.log('Extension.setEnabled Request:', id, enabled && 'enabled' || 'disabled');

			chrome.management.setEnabled(id, enabled, callback);

		},

		/**
		 * "Reloads" an extension.
		 * Not a real reload as such - it will just disable and then enable the extension quickly
		 * @param {String} id			Extension id
		 * @param {Function} callback	Callback after reload
		 */
		reload: function(id, callback) {

			console.log('Extension.reload Request:', id);

			var _this = this;

			// first disable
			this.disable(id, function() {

				// set a short timeout as it looks better to see things working :)
				setTimeout(function() {

					// then enable
					_this.enable(id, callback);

				}, 300);

			});

		},

		/**
		 * Uninstalls an extension
		 * @param {String} id			Extension ID
		 * @param {Function} callback	Callback after extension is uninstalled
		 */
		uninstall: function(id, callback) {

			console.log('Extension.uninstall request:', id);

			chrome.management.uninstall(id, null, callback);

		},

		/**
		 * Gets the icon for an extension, in a specified size and optionally grey
		 * @param {String} extensionId	Extension ID
		 * @param {Number} size			The size of icon to return
		 * @param {Boolean} gray		Whether to return the icon in grayscale
		 * @returns {string}
		 */
		getIcon: function(extensionId, size, gray) {

			var iconUrl = 'chrome://extension-icon/' + extensionId + '/' + size + '/1';

			if (gray) {
				iconUrl += '?grayscale=true';
			}

			return iconUrl;

		},

		/**
		 * Adds a notification exclusion for an extension
		 * @param {String} key				The storage key for the type of exclusion
		 * @param {String} extensionId		The extension ID
		 * @param {String} extensionName	The extension name
		 * @param {Boolean} forever			Whether the exclusion is forever, or just for 1 month
		 * @param {Function} callback		Callback once exclusion is added
		 */
		addExclusion: function(key, extensionId, extensionName, forever, callback) {

			// get exclusion settings
			i.common.Settings.getSync(key, function(exclusions) {

				// default to forever exclusion
				var date = false;

				// set date 1 month in future if not forever
				if (!forever) {
					date = new Date();
					date.setMonth(date.getMonth()+1);
					date.setHours(0, 0, 0, 0);
					date = date.getTime();
				}

				// add exclusion
				exclusions[extensionId] = {
					name: extensionName,
					date: date
				};

				// and save
				i.common.Settings.setSync(key, exclusions, callback);

			});

		},

		/**
		 * Removes a notification exclusion for an extension
		 * @param {String} key			The storage key for the type of exclusion
		 * @param {String} extensionId	The extension ID
		 * @param {Function} callback	Callback once exclusion is added
		 */
		removeExclusion: function(key, extensionId, callback) {

			// get exclusion settings
			i.common.Settings.getSync(key, function(exclusions) {

				// if exclusion exists
				if (exclusions.hasOwnProperty(extensionId)) {

					// remove it
					delete exclusions[extensionId];

					// and save
					i.common.Settings.setSync(key, exclusions, callback);

				}

			});

		},

		/**
		 * Removes the extension and history from the idb
		 * @param {String} extensionId	The extension id to remove
		 * @param {Function} callback	Callback to apply once removed
		 */
		remove: function(extensionId, callback) {

			// remove extension
			i.common.IndexedDB.removeFromStore('extensions', extensionId, function() {

				// remove history
				i.common.IndexedDB.removeByIndex('history', 'extensionId', extensionId, callback);

			});

		}

	};

})(Invigilator);