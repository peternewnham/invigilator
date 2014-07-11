(function(i) {

	i.form.NotificationIcon = {

		init: function() {

			var $field = $('#notificationIcon')

			i.common.Settings.getSync('notificationIcon', function(value) {
				$field.val(value);
			});

			$field.on('change', this.saveValue);

		},

		saveValue: function() {

			var val = $('#notificationIcon').val();

			i.common.Settings.setSync('notificationIcon', val, function() {

				i.common.Analytics.event('Settings', 'Notification Icon', val);

			});

		}

	};

	$(function() {
		i.form.NotificationIcon.init();
	});

})(Invigilator);