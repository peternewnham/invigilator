/**
 * Show review warning notification element/setting handler
 */
(function(i) {

	i.form.ShowReviewWarningNotifications = {

		/**
		 * Set element value and event listener
		 */
		init: function() {

			// get element
			var $field = $('#showReviewWarningNotifications')

			// get setting value and set element value
			i.common.Settings.getSync('showReviewWarningNotifications', function(value) {

				// convert value to boolean
				$field.val(value && '1' || '0');

				// show or hide the exclusion table
				i.form.ReviewWarningNotificationExclusions.toggle(value);

				// show or hide the threshold
				i.form.ReviewWarningMinThreshold.toggle(value);

			});

			// set change event
			$field.on('change', this.saveValue);

		},

		/**
		 * Save element value
		 */
		saveValue: function() {

			// get value as boolean
			var value = $('#showReviewWarningNotifications').val() === '1';

			// save it
			i.common.Settings.setSync('showReviewWarningNotifications', value, function() {

				// show or hide the exclusion table
				i.form.ReviewWarningNotificationExclusions.toggle(value);

				// show or hide the threshold
				i.form.ReviewWarningMinThreshold.toggle(value);

				// log event
				i.common.Analytics.event('Settings', 'Show Review Warning Notifications', value && 'Yes' || 'No');

			});

		}

	};

	// initialise
	$(function() {
		i.form.ShowReviewWarningNotifications.init();
	});

})(Invigilator);