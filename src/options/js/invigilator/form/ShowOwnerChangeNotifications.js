(function(i) {

	i.form.ShowOwnerChangeNotifications = {

		init: function() {

			var $field = $('#showOwnerChangeNotifications')

			i.common.Settings.getSync('showOwnerChangeNotifications', function(value) {

				$field.val(value && '1' || '0');

				i.form.OwnerChangeNotificationExclusions.toggle(value);

			});

			$field.on('change', this.saveValue);

		},

		saveValue: function() {

			var value = $('#showOwnerChangeNotifications').val() === '1';

			i.common.Settings.setSync('showOwnerChangeNotifications', value, function() {

				i.form.OwnerChangeNotificationExclusions.toggle(value);

			});

		}

	};

	$(function() {
		i.form.ShowOwnerChangeNotifications.init();
	});

})(Invigilator);