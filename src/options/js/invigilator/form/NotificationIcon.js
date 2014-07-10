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

			i.common.Settings.setSync('notificationIcon', $('#notificationIcon').val());

		}

	};

	$(function() {
		i.form.NotificationIcon.init();
	});

})(Invigilator);