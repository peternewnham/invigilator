/**
 * Review warning minimum threshold element/setting handler
 */
(function(i) {

	i.form.ReviewWarningMinThreshold = {

		/**
		 * Set element value and event listener
		 */
		init: function() {

			// get element
			var $field = $('#reviewWarningMinThreshold')

			// get setting value and set element value
			i.common.Settings.getSync('reviewWarningMinThreshold', function(value) {
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
			var val = parseInt($('#reviewWarningMinThreshold').val(), 10);

			// save it
			i.common.Settings.setSync('reviewWarningMinThreshold', val, function() {

				// log event
				i.common.Analytics.event('Settings', 'Review Warning Threshold', val);

			});

		},

		toggle: function(show) {

			if (show) {
				$('#reviewWarningMinThresholdContainer').show();
			}
			else {
				$('#reviewWarningMinThresholdContainer').hide();
			}

		}

	};

	// initialise
	$(function() {
		i.form.ReviewWarningMinThreshold.init();
	});

})(Invigilator);