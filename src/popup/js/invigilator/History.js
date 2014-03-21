(function(i) {

	i.History = {

		extensionFilter: '',

		generate: function() {

			var _this = this;

			console.log('History.generate');

			/**
			 * Create filter
			 */

			var filterHtml = '<select id="history-filter" class="form-control"><option value="">Show All Extensions</option></select>';
			$('#history').append(filterHtml);

			var options = {
				direction: 'next',
				index: 'name'
			};

			i.common.IndexedDB.eachFromStore('extensions', options, function(extension) {
				$('#history-filter').append('<option value="' + extension.id + '">' + extension.name + '</option>');

			});

			$('#history-filter').on('change', function() {
				_this.extensionFilter = this.value;
				_this.filter();
			});

			/**
			 * Create table
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
					'<tbody>'
			].join('');

			tableHtml += '</tbody></table>';

			$('#history').append(tableHtml);

			_this.filter();

		},

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

		filter: function() {

			var _this = this;

			var tbody = $('tbody', '#history-table');

			tbody.html('');

			var options = {
				direction: 'prev'
			};

			if (this.extensionFilter !== '') {

				options.index = 'extensionId';
				options.range = {
					type: 'only',
					value: this.extensionFilter
				};

			}

			i.common.IndexedDB.eachFromStore('history', options, function(history) {

				tbody.append(_this.addRow(history));

			});

		}

	};

	$(function() {
		i.History.generate();
	});

})(Invigilator);