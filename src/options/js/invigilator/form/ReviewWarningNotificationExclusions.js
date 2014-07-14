/**
 * Review warning exclusion table/setting handler
 */
(function(i) {

	// create exclusion table
	i.form.ReviewWarningNotificationExclusions = new i.form.ExclusionTable(
		'reviewWarningNotificationExclusions',
		'review warning notifications'
	);

	// generate table
	$(function() {
		i.form.ReviewWarningNotificationExclusions.generate();
	});

})(Invigilator);