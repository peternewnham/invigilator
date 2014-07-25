var Invigilator = {

	form: {}

};

$(function() {

	// track page view
	Invigilator.common.Analytics.pageview('options.html', 'Options');


});

// set error handling
window.onerror = function(message, url, linenumber) {
	Invigilator.common.Util.logError(message, url, linenumber);
}