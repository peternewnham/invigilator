(function(i) {

	i.form.OwnerChangeNotificationExclusions = new i.form.ExclusionTable(
		'ownerChangeNotificationExclusions',
		'owner change notifications'
	);

	$(function() {
		i.form.OwnerChangeNotificationExclusions.generate();
	});

})(Invigilator);