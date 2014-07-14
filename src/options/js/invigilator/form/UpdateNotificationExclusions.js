/**
 * Extension update exclusion table/setting handler
 */
(function(i) {

	// create exclusion table
	i.form.UpdateNotificationExclusions = new i.form.ExclusionTable(
		'updateNotificationExclusions',
		'update notifications'
	);

	// generate table
	$(function() {
		i.form.UpdateNotificationExclusions.generate();
	});

})(Invigilator);