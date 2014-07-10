(function(i) {

	i.form.UpdateNotificationExclusions = new i.form.ExclusionTable(
		'updateNotificationExclusions',
		'update notifications'
	);

	$(function() {
		i.form.UpdateNotificationExclusions.generate();
	});

})(Invigilator);