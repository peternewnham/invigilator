/**
 * Notification icon element/setting handler
 */
(function(i) {

	i.form.NotificationIcon = {

		/**
		 * Set element value and event listener
		 */
		init: function() {

			// get element
			var $field = $('#notificationIcon')

			// get setting value and set element value
			i.common.Settings.getSync('notificationIcon', function(value) {
				$field.val(value);
			});

			// set change event
			$field.on('change', this.saveValue);

		},

		/**
		 * Save element value
		 */
		saveValue: function() {

			// get value
			var val = $('#notificationIcon').val();

			// save it
			i.common.Settings.setSync('notificationIcon', val, function() {

				// log event
				i.common.Analytics.event('Settings', 'Notification Icon', val);

			});

		}

	};

	// initialise
	$(function() {
		i.form.NotificationIcon.init();
	});

})(Invigilator);