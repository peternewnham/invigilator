(function(i) {

	i.common.Settings = {

		defaultSyncSettings: {

			/**
			 * Interval in seconds to check for owner/spam
			 */
			dataCheckInterval: 60 * 60 * 24 * 1000, // 1 day

			notificationIcon: 'self',

			showUpdateNotifications: true,

			updateNotificationExclusions: {},

			showReviewWarningNotifications: true,

			reviewWarningNotificationExclusions: {},

			showOwnerChangeNotifications: true,

			ownerChangeNotificationExclusions: {},

			statistics: true

		},

		defaultLocalSettings: {

			//nextDataCheck: (+new Date) + (60 * 60 * 24 * 1000)
			nextDataCheck: (+new Date) + (60 * 1000)

		},

		show: function() {

			chrome.storage.sync.get(null, function(items) {
				console.log('storage.sync:', items);
			});

			chrome.storage.local.get(null, function(items) {
				console.log('storage.local:', items);
			});

		},

		set: function(type, item, value, callback) {

			var data = {};
			data[item] = value;

			chrome.storage[type].set(data, function() {

				console.log('Setting:', type, item, value);

				if (typeof callback === 'function') {
					callback();
				}
			});

		},

		setSync: function(item, value, callback) {

			this.set('sync', item, value, callback);

		},

		setLocal: function(item, value, callback) {

			this.set('local', item, value, callback);

		},

		get: function(type, item, callback) {

			var defaultSettings = type === 'sync' ? this.defaultSyncSettings : this.defaultLocalSettings;

			chrome.storage[type].get(item, function(items) {

				if (item === null) {
					callback(items);
				}
				else {

					var value = items.hasOwnProperty(item) ? items[item] : defaultSettings[item];
					callback(value);

				}

			});

		},

		getSync: function(item, callback) {

			this.get('sync', item, callback);

		},

		getLocal: function(item, callback) {

			this.get('local', item, callback);

		},

		init: function() {

			var _this = this;

			chrome.storage.sync.clear(function() {
				chrome.storage.sync.set(_this.defaultSyncSettings);
			});

			chrome.storage.local.clear(function() {
				chrome.storage.local.set(_this.defaultLocalSettings);
			});

		},

		removeExclusion: function(key, id) {

			this.getSync(key, function(exclusions) {

				if (exclusions.hasOwnProperty(id)) {

					delete exclusions[id];

					this.setSync(key, exclusions);

				}

			});

		}

	};

})(Invigilator);