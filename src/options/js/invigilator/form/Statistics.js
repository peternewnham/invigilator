/**
 * Statistics element/setting handler
 */
(function(i) {

	i.form.Statistics = {

		/**
		 * Set element value and event listener
		 */
		init: function() {

			// get element
			var $field = $('#statistics');

			// get setting value and set element value
			i.common.Settings.getSync('statistics', function(value) {
				$field.prop('checked', value);
			});

			// set change event
			$field.on('change', this.saveValue);

		},

		/**
		 * Save element value
		 */
		saveValue: function() {

			// get value
			var value = $('#statistics').prop('checked');

			// send event before they are disabled
			if (value === false) {
				i.common.Analytics.event('Settings', 'Statistics', 'Off');
			}

			// save it
			i.common.Settings.setSync('statistics', value, function() {
				// send event if enabling
				if (value === true) {
					i.common.Analytics.event('Settings', 'Statistics', 'On');
				}
			});

		}

	};

	// initialise
	$(function() {
		i.form.Statistics.init();
	});

})(Invigilator);