(function(i) {

	i.form.Statistics = {

		init: function() {

			var $field = $('#statistics');

			i.common.Settings.getSync('statistics', function(value) {
				$field.prop('checked', value);
			});

			$field.on('change', this.saveValue);

		},

		saveValue: function() {

			var value = $('#statistics').prop('checked');

			// send event before they are disabled
			if (value === false) {
				i.common.Analytics.event('Settings', 'Statistics', 'Off');
			}

			i.common.Settings.setSync('statistics', value, function() {
				if (value === true) {
					i.common.Analytics.event('Settings', 'Statistics', 'On');
				}
			});

		}

	};

	$(function() {
		i.form.Statistics.init();
	});

})(Invigilator);