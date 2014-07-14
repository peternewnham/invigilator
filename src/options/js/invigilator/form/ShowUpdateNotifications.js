/**
 * Show extension update notification element/setting handler
 */
(function(i) {

	i.form.ShowUpdateNotifications = {

		/**
		 * Set element value and event listener
		 */
		init: function() {

			// get element
			var $field = $('#showUpdateNotifications')

			// get setting value and set element value
			i.common.Settings.getSync('showUpdateNotifications', function(value) {

				// convert value to boolean
				$field.val(value && '1' || '0');

				// show or hide the exclusion table
				i.form.UpdateNotificationExclusions.toggle(value);

			});

			// set change event
			$field.on('change', this.saveValue);

		},

		/**
		 * Save element value
		 */
		saveValue: function() {

			// get value as boolean
			var value = $('#showUpdateNotifications').val() === '1';

			// save it
			i.common.Settings.setSync('showUpdateNotifications', value, function() {

				// show or hide the exclusion table
				i.form.UpdateNotificationExclusions.toggle(value);

				// log event
				i.common.Analytics.event('Settings', 'Show Update Notifications', value && 'Yes' || 'No');

			});

		}

	};

	// initialise
	$(function() {
		i.form.ShowUpdateNotifications.init();
	});

})(Invigilator);