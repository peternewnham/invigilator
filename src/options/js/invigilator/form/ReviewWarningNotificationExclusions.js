(function(i) {

	i.form.ReviewWarningNotificationExclusions = new i.form.ExclusionTable(
		'reviewWarningNotificationExclusions',
		'review warning notifications'
	);

	$(function() {
		i.form.ReviewWarningNotificationExclusions.generate();
	});

})(Invigilator);