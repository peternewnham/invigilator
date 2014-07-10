(function(i) {

	i.Alarms = {

		alarms: {},

		setAlarms: function() {

			var _this = this;

			/*
			 * Periodic data check
			 */

			i.common.Settings.getLocal('nextDataCheck', function(nextCheck) {

				console.group('nextDataCheck Alarm');

				var nextDataCheckCallback = function() {

					i.Extension.checkAllData();

					// set next check
					i.common.Settings.getSync('dataCheckInterval', function(interval) {

						console.group('nextDataCheck Alarm');

						var nextCheckTime = (+new Date) + interval;

						console.log('Next check in ', (nextCheckTime  - (+new Date)) / 1000, ' seconds');

						i.common.Settings.setLocal('nextDataCheck', nextCheckTime);
						_this.addWhen('checkAllData', nextCheckTime, nextDataCheckCallback);

						console.groupEnd();

					});

				};

				// if next check is in the past then we should run the alarm immediately
				if (nextCheck < (+new Date)) {

					console.log('nextCheck in past, running immediately');

					nextDataCheckCallback();

				}
				// not in past so set alarm
				else {

					console.log('Next check in ', (nextCheck  - (+new Date)) / 1000, ' seconds');

					_this.addWhen('checkAllData', nextCheck, nextDataCheckCallback);

				}

				console.groupEnd();

			});

		},

		add: function(name, info, callback) {

			console.log('Alarm added:', name, info);

			// creata alarm
			chrome.alarms.create(name, info);

			// save callback
			this.alarms[name] = callback || function() {};

		},

		addWhen: function(name, date, callback) {

			// convert dates to timestamp
			if (date instanceof Date) {
				date = date.getTime();
			}

			this.add(name, {
				when: date
			}, callback);

		},

		addDelay: function(name, delay, callback) {

			this.add(name, {
				delayInMinutes: delay
			}, callback);

		},

		addPeriod: function(name, period, callback) {

			this.add(name, {
				periodInMinutes: period
			}, callback);

		},

		listen: function(info) {

			console.log('Alarms.listen', info);

			if (!!this.alarms[info.name]) {

				var callback = this.alarms[info.name];

				delete this.alarms[info.name];

				callback();

			}

		}

	};

	chrome.alarms.onAlarm.addListener(function(info) {
		i.Alarms.listen(info);
	});

})(Invigilator);