/**
 * Owner change exclusion table/setting handler
 */
(function(i) {

	// create exclusion table
	i.form.OwnerChangeNotificationExclusions = new i.form.ExclusionTable(
		'ownerChangeNotificationExclusions',
		'owner change notifications'
	);

	// generate table
	$(function() {
		i.form.OwnerChangeNotificationExclusions.generate();
	});

})(Invigilator);