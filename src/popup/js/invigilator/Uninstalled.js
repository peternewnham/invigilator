/**
 * Uninstalled tab functionality
 */
(function(i) {

	i.Uninstalled = {

		/**
		 * Generate content
		 */
		generate: function() {

			var _this = this;

			// wipe existing content
			$('#uninstalled').html('');

			// get all extensions from the store
			i.common.IndexedDB.getAllFromStore('extensions', { direction: 'next' }, function(extensions) {

				// group uninstalled extensions by type
				var types = {
					extension: {
						title:	'Uninstalled Extensions',
						icon:	'images/extension.png',
						items:	[]
					},
					app: {
						title:	'Uninstalled Apps',
						icon:	'images/app.png',
						items:	[]
					},
					theme: {
						title:	'Uninstalled Themes',
						icon:	'',
						items:	[]
					}
				};

				// track whether anything has been uninstalled
				var hasUninstalled = false;

				console.group('Uninstalled.generate');

				// loop through each extension
				for (var j=0; j<extensions.length; j++) {

					// get current extension
					var extension = extensions[j];

					// if extension has been uninstalled add it to one of the groups
					if (extension.dateUninstalled !== null) {

						console.log(extension.name, extension);

						// update has uninstalled flag
						hasUninstalled = true;

						switch (extension.type) {

							// extensions
							case 'extension':
								types.extension.items.push(extension);
								break;

							// apps
							case 'hosted_app':
							case 'packaged_app':
							case 'legacy_packaged_app':
								types.app.items.push(extension);
								break;

							// themes
							case 'theme':
								types.theme.items.push(extension);
								break;

						}

					}

					console.groupEnd();

				}

				// if something has been uninstalled
				if (hasUninstalled) {

					// loop through each group
					for (var type in types) {

						// if group has items
						if (types[type].items.length > 0) {

							// add content for the group
							_this.addType(types[type]);

						}

					}

				}
				// nothing uninstalled
				else {

					// add the empty message
					_this.addEmpty();

				}

				console.groupEnd();

			});

		},

		/**
		 * Adds an extension type group
		 * @param {Object} type		The type and extensions in it
		 */
		addType: function(type) {

			// generate html

			var typeHtml = '<div class="type">';

			typeHtml += '<h3';
			if (type.icon) {
				typeHtml += ' style="background:url(' + type.icon + ') left top no-repeat;"';
			}
			typeHtml += '>' + type.title + '</h3>';

			typeHtml += '<div class="items">';

			for (var j=0; j<type.items.length; j++) {

				// add extension
				typeHtml += this.addItem(type.items[j]);

			}

			typeHtml += '</div>';

			typeHtml += '</div>';

			// add it to the tab content
			$('#uninstalled').append(typeHtml);

		},

		/**
		 * Generates the html for an uninstalled extension
		 * @param {Object} item		The extension details
		 * @returns {string}
		 */
		addItem: function(item) {

			// open item
			var itemHtml = '<div id="uninstalled-' + item.id + '" class="item clearfix">';

			itemHtml += this.generateItemHtml(item);

			// close item
			itemHtml += '</div>';

			return itemHtml;

		},

		/**
		 * Generate the html for an uninstalled extension
		 * @todo Looks like it should be combined with addItem but they were made as separate functions and not sure why now
		 * @param {Object} item		Extension details
		 * @returns {string}
		 */
		generateItemHtml: function(item) {

			var itemHtml = '';

			// icon
			itemHtml += '<div class="icon">';
			itemHtml += '<img src="' + (item.iconDataUrl || i.common.Extension.DEFAULT_ICON) + '">';
			itemHtml += '</div>';

			// details
			itemHtml += '<div class="details">';

			// name + version
			itemHtml += '<h4>' + item.name + ' <span class="version">' + item.version + '</span></h4>';

			// description
			itemHtml += '<p class="description">' + item.description + '</p>';

			// open owner and sites
			itemHtml += '<div class="additional">';

			// owner
			itemHtml += '<label><span class="glyphicon glyphicon-user"></span> Owner:</label>';
			itemHtml += '<span>';
			if (item.owner) {
				itemHtml += item.owner;
			}
			else {
				itemHtml += '<em>Unknown</em>';
			}
			itemHtml += '</span>';

			// urls
			var homepageUrl = item.homepageUrl;
			var webstoreUrl = homepageUrl;
			//
			if (/^https:\/\/chrome\.google\.com\/webstore/.test(webstoreUrl)) {
				homepageUrl = '';
			}
			else {
				webstoreUrl = 'https://chrome.google.com/webstore/detail/' + item.id;
			}

			if (webstoreUrl !== '') {
				itemHtml += '<span><a href="' + webstoreUrl + '">Visit Webstore Page</a></span>';
			}

			if (homepageUrl !== '') {
				itemHtml += '<span><a href="' + homepageUrl + '">Visit Homepage</a></span>';
			}

			// close additional details
			itemHtml += '</div>';

			// open dates
			itemHtml += '<div class="additional">';

			// date installed
			itemHtml += '<label><span class="glyphicon glyphicon-calendar"></span> Date Installed:</label>';
			itemHtml += '<span>';
			if (item.dateInstalled) {
				itemHtml += moment(item.dateInstalled).format('D MMM YYYY HH:mm');
			}
			else {
				itemHtml += '<em>Unknown</em>';
			}
			itemHtml += '</span>';

			// date uninstalled
			itemHtml += '<label><span class="glyphicon glyphicon-calendar"></span> Date Uninstalled:</label>';
			itemHtml += '<span>';
			if (item.dateUninstalled) {
				itemHtml += moment(item.dateUninstalled).format('D MMM YYYY HH:mm');
			}
			else {
				itemHtml += '<em>Unknown</em>';
			}
			itemHtml += '</span>';

			// close dates
			itemHtml += '</div>';

			// close details
			itemHtml += '</div>';

			// open actions
			itemHtml += '<div class="actions">';

			// reinstalled
			itemHtml += '<div>';
			itemHtml += '<a href="https://chrome.google.com/webstore/detail/' + item.id + '" class="btn btn-info">Reinstall <span class="glyphicon glyphicon-play-circle"></span></a>';
			itemHtml += '</div>';

			// close actions
			itemHtml += '</div>';

			return itemHtml;

		},

		/**
		 * Adds a "nothing uninstalled" message to the tab content
		 */
		addEmpty: function() {

			$('#uninstalled').html([
				'<h2>No extensions have been uninstalled yet</h2>'
			].join(''));

		}

	};

	// initialise
	$(function() {
		i.Uninstalled.generate();
	});

})(Invigilator);