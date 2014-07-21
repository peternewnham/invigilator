/**
 * History tab functionality
 */
(function(i) {

	i.History = {

		/**
		 * Extension id to filter the history with
		 * @var {String}
		 */
		extensionFilter: '',

		/**
		 * Generate the tab content
		 */
		generate: function() {

			var _this = this;

			console.log('History.generate');

			// wipe existing content
			$('#history').html('');

			/**
			 * Create filter dropdown
			 */

			var filterHtml = '<select id="history-filter" class="form-control"><option value="">Show All</option></select>';
			$('#history').append(filterHtml);

			var optGroups = {};

			/**
			 * Adds an option to the option groups
			 * @param {String} title		Option group title
			 * @param {Object} extension	Extension details
			 */
			var addOption = function(title, extension) {

				// new option group so create it and add to the dropdown
				if (!optGroups[title]) {
					optGroups[title] = $(document.createElement('optgroup'));
					optGroups[title].attr('label', title);
					$('#history-filter').append(optGroups[title]);
				}

				// add extension to the option group
				optGroups[title].append('<option value="' + extension.id + '">' + extension.name + '</option>');

			};

			// idb options
			var options = {
				direction: 'next',
				index: 'name'
			};

			// get each extension from the idb and add them to the select
			i.common.IndexedDB.eachFromStore('extensions', options, function(extension) {
				switch (extension.type) {

					// extensions
					case 'extension':
						addOption('Extensions', extension);
						break;

					// apps
					case 'hosted_app':
					case 'packaged_app':
					case 'legacy_packaged_app':
						addOption('Apps', extension);
						break;

					// themes
					case 'theme':
						addOption('Themes', extension);
						break;

				}
			});

			// add change event to the dropdown
			$('#history-filter').on('change', function() {

				// save filter
				_this.extensionFilter = this.value;

				// apply filter
				_this.filter();

			});

			/*
			 * Create history table html
			 */

			var tableHtml = [
				'<table id="history-table" class="table table-condensed table-striped">',
					'<thead>',
						'<tr>',
							'<th>Date</th>',
							'<th>Extension</th>',
							'<th>Version</th>',
							'<th>Action</th>',
							'<th>Owner</th>',
							'<th>Enabled</th>',
						'</tr>',
					'</thead>',
					'<tbody></tbody>',
				'</table>'
			].join('');

			// add table to the tab
			$('#history').append(tableHtml);

			// apply filter
			_this.filter();

		},

		/**
		 * Generates the html for a row in the history table
		 * @param {Object} history	History details
		 * @returns {string}
		 */
		addRow: function(history) {

			var rowHtml = '<tr>';

				// date
				rowHtml += '<td>' + moment(history.date).format('D MMM YYYY HH:mm') + '</td>';

				// name
				rowHtml += '<td>' + history.name + '</td>';

				// version
				rowHtml += '<td>' + history.version + '</td>';

				// action
				rowHtml += '<td>' + history.action + '</td>';

				// owner
				rowHtml += '<td>' + (history.owner || '<em>Unknown</em>') + '</td>';

				// enabled
				rowHtml += '<td>' + (history.enabled && 'Yes' || 'No') + '</td>';

			rowHtml += '</tr>';

			return rowHtml;

		},

		/**
		 * Filters and populates the history table
		 */
		filter: function() {

			var _this = this;

			// get history table body
			var tbody = $('tbody', '#history-table');

			// wipe it
			tbody.html('');

			// idb options
			// go in reverse order so newest is at top
			var options = {
				direction: 'prev'
			};

			// if there is an extension filter selected then only show history for that extension
			if (this.extensionFilter !== '') {

				options.index = 'extensionId';
				options.range = {
					type: 'only',
					value: this.extensionFilter
				};

			}

			// get each history item
			i.common.IndexedDB.eachFromStore('history', options, function(history) {

				// add row to table
				tbody.append(_this.addRow(history));

			});

		}

	};

	// initialise
	$(function() {
		i.History.generate();
	});

})(Invigilator);