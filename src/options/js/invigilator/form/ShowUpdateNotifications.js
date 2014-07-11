(function(i) {

	i.form.ShowUpdateNotifications = {

		init: function() {

			var $field = $('#showUpdateNotifications')

			i.common.Settings.getSync('showUpdateNotifications', function(value) {

				$field.val(value && '1' || '0');

				i.form.UpdateNotificationExclusions.toggle(value);

			});

			$field.on('change', this.saveValue);

		},

		saveValue: function() {

			var value = $('#showUpdateNotifications').val() === '1';

			i.common.Settings.setSync('showUpdateNotifications', value, function() {

				i.form.UpdateNotificationExclusions.toggle(value);

				i.common.Analytics.event('Settings', 'Show Update Notifications', value && 'Yes' || 'No');

			});

		}

	};

	$(function() {
		i.form.ShowUpdateNotifications.init();
	});

})(Invigilator);