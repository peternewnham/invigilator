(function(i) {

	i.form.ShowReviewWarningNotifications = {

		init: function() {

			var $field = $('#showReviewWarningNotifications')

			i.common.Settings.getSync('showReviewWarningNotifications', function(value) {

				$field.val(value && '1' || '0');

				i.form.ReviewWarningNotificationExclusions.toggle(value);

			});

			$field.on('change', this.saveValue);

		},

		saveValue: function() {

			var value = $('#showReviewWarningNotifications').val() === '1';

			i.common.Settings.setSync('showReviewWarningNotifications', value, function() {

				i.form.ReviewWarningNotificationExclusions.toggle(value);

				i.common.Analytics.event('Settings', 'Show Review Warning Notifications', value && 'Yes' || 'No');

			});

		}

	};

	$(function() {
		i.form.ShowReviewWarningNotifications.init();
	});

})(Invigilator);