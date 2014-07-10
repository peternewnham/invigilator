(function(i) {

	i.common.Extension = {

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

				if (/^Date\|/.test(extension[field])) {

					var time = parseInt(extension[field].replace(/^Date|/, ''), 10);
					extension[field] = new Date(time);

				}

			}

			return extension;

		},

		each: function(callback) {

			chrome.management.getAll(function(extensions) {

				for (var j=0; j<extensions.length; j++) {

					var extension = extensions[j];

					callback(extension);

				}

			});

		},

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

		enable: function(id, callback) {

			this.setEnabled(id, true, callback);

		},

		disable: function(id, callback) {

			this.setEnabled(id, false, callback);

		},

		setEnabled: function(id, enabled, callback) {

			console.log('Extension.setEnabled Request:', id, enabled && 'enabled' || 'disabled');

			chrome.management.setEnabled(id, enabled, callback);

		},

		reload: function(id, callback) {

			console.log('Extension.reload Request:', id);

			var _this = this;

			this.disable(id, function() {

				// set a short timeout as it looks better to see things working :)
				setTimeout(function() {
					_this.enable(id, callback);
				}, 300);

			});

		},

		uninstall: function(id, callback) {

			console.log('Extension.uninstall request:', id);

			chrome.management.uninstall(id, null, callback);

		},

		getIcon: function(extensionId, size, gray) {

			var iconUrl = 'chrome://extension-icon/' + extensionId + '/' + size + '/1';

			if (gray) {
				iconUrl += '?grayscale=true';
			}

			return iconUrl;

			// no icon so show default
			if (!extension.icons) {
				return this.DEFAULT_ICON;
			}
			else {

				var bestSize = 0;
				var bestUrl = '';

				for (var j=0; j<extension.icons.length; j++) {

					var icon = extension.icons[j];

					if (!!size && icon.size == size) {
						bestSize = icon.size;
						bestUrl = icon.url;
						break;
					}
					else if (icon.size > bestSize) {
						bestSize = icon.size;
						bestUrl = icon.url;
					}

				}

				if (gray) {
					bestUrl += '?grayscale=true';
				}

				return bestUrl;

			}

		},

		addExclusion: function(type, extension, forever, callback) {

			i.common.Settings.getSync(type, function(exclusions) {

				if (!exclusions.hasOwnProperty(extension.id)) {

					var date = false;

					if (!forever) {
						date = new Date();
						date.setMonth(date.getMonth()+1);
						date.setHours(0, 0, 0, 0);
						date = date.getTime();
					}

					exclusions[extension.id] = {
						name: extension.name,
						date: date
					};

					i.common.Settings.setSync(type, exclusions, callback);

				}

			});

		},

		removeExclusion: function(type, extensionId, callback) {

			i.common.Settings.getSync(type, function(exclusions) {

				if (exclusions.hasOwnProperty(extensionId)) {

					delete exclusions[extensionId];

					i.common.Settings.setSync(type, exclusions, callback);

				}

			});

		}

	};

})(Invigilator);