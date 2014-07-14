/**
 * Manages alarms for Invigilator
 * https://developer.chrome.com/extensions/alarms
 */
(function(i) {

	i.Alarms = {

		/**
		 * Alarm store
		 * Keys and callbacks for when an alarm fires
		 */
		alarms: {},

		/**
		 * Sets the alarms for the extension
		 * This is called on Extension startup
		 */
		setAlarms: function() {

			var _this = this;

			/*
			 * Periodic data check
			 */

			// get the next data check time
			i.common.Settings.getLocal('nextDataCheck', function(nextCheck) {

				console.group('nextDataCheck Alarm');

				/**
				 * CAllback to apply on the next data check
				 */
				var nextDataCheckCallback = function() {

					// check all extensions data
					i.Extension.checkAllData();

					// set next check
					i.common.Settings.getSync('dataCheckInterval', function(interval) {

						console.group('nextDataCheck Alarm');

							// get next check time
							var nextCheckTime = (+new Date) + interval;

							console.log('Next check in ', (nextCheckTime  - (+new Date)) / 1000, ' seconds');

							// save next check time
							i.common.Settings.setLocal('nextDataCheck', nextCheckTime);

							// add the next alarm for this time
							_this.addWhen('checkAllData', nextCheckTime, nextDataCheckCallback);

						console.groupEnd();

					});

				};

				// if next check is in the past then we should run the alarm immediately
				if (nextCheck < (+new Date)) {

					console.log('nextCheck in past, running immediately');

					nextDataCheckCallback();

				}
				// not in past so set alarm for future
				else {

					console.log('Next check in ', (nextCheck  - (+new Date)) / 1000, ' seconds');

					_this.addWhen('checkAllData', nextCheck, nextDataCheckCallback);

				}

				console.groupEnd();

			});

		},

		/**
		 * Adds an alarm and callback
		 * @param {String} name			The name of the alarm
		 * @param {Object} info			Alarm info
		 * @param {Function} callback	The callback to apply when the alarm fires
		 */
		add: function(name, info, callback) {

			console.log('Alarm added:', name, info);

			// creata alarm
			chrome.alarms.create(name, info);

			// save callback to alarm store
			this.alarms[name] = callback || function() {};

		},

		/**
		 * Adds a "when" alarm which will fire at a specified date and time
		 * @param {String} name			The name of the alarm
		 * @param {Date} date			The date to fire the alarm
		 * @param {Function} callback	The callback to apply when the alarm fires
		 */
		addWhen: function(name, date, callback) {

			// convert dates to timestamp
			if (date instanceof Date) {
				date = date.getTime();
			}

			// add callback
			this.add(name, {
				when: date
			}, callback);

		},

		/**
		 * Adds a "delay" alarm which will fire after a specific number of minutes
		 * @param {String} name			The name of the alarm
		 * @param {Number} delay		The delay in minutes
		 * @param {Function} callback	The callback to apply when the alarm fires
		 */
		addDelay: function(name, delay, callback) {

			// add callback
			this.add(name, {
				delayInMinutes: delay
			}, callback);

		},

		/**
		 * Adds a "period" alarm which will fire periodically
		 * @param {String} name			The name of the alarm
		 * @param {Number} period		The period of minutes between each firing
		 * @param {Function} callback	The callback to apply when the alarm fires
		 */
		addPeriod: function(name, period, callback) {

			// add callback
			this.add(name, {
				when: (+new Date),
				periodInMinutes: period
			}, callback);

		},

		/**
		 * Executes an alarm callback by matching the alarm name with the alarm store keys
		 * @param {Object} info	Alarm info
		 */
		listen: function(info) {

			console.log('Alarms.listen', info);

			// alarm store exists
			if (!!this.alarms[info.name]) {

				// get callback to fire
				var callback = this.alarms[info.name];

				// cleanup store
				delete this.alarms[info.name];

				// fire the callback
				callback();

			}

		}

	};

	/**
	 * Listen to alarm firing events
	 */
	chrome.alarms.onAlarm.addListener(function(info) {

		// call the listen method to execute the alarm callback
		i.Alarms.listen(info);

	});

})(Invigilator);