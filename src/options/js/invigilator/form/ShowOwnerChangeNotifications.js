/**
 * Show owner change notification element/setting handler
 */
(function(i) {

	i.form.ShowOwnerChangeNotifications = {

		/**
		 * Set element value and event listener
		 */
		init: function() {

			// get element
			var $field = $('#showOwnerChangeNotifications')

			// get setting value and set element value
			i.common.Settings.getSync('showOwnerChangeNotifications', function(value) {

				// convert value to boolean
				$field.val(value && '1' || '0');

				// show or hide the exclusion table
				i.form.OwnerChangeNotificationExclusions.toggle(value);

			});

			// set change event
			$field.on('change', this.saveValue);

		},

		/**
		 * Save element value
		 */
		saveValue: function() {

			// get value as boolean
			var value = $('#showOwnerChangeNotifications').val() === '1';

			// save it
			i.common.Settings.setSync('showOwnerChangeNotifications', value, function() {

				// show or hide the exclusion table
				i.form.OwnerChangeNotificationExclusions.toggle(value);

				// log event
				i.common.Analytics.event('Settings', 'Show Owner Change Notifications', value && 'Yes' || 'No');

			});

		}

	};

	// initialise
	$(function() {
		i.form.ShowOwnerChangeNotifications.init();
	});

})(Invigilator);