// Call the dataTables jQuery plugin
$(document).ready(function () {
    let myTable = $('#dataTable').DataTable({
        columnDefs: [{
            searchable: false,
            orderable: false,
            className: 'select-checkbox',
            targets: 0,
        }],
        select: {
            style: 'multi', // 'single', 'multi', 'os', 'multi+shift'
            selector: 'td:first-child',
        },
        order: [
            [1, 'asc'],
        ],
        columns: [
            { width: '5%' },
            { width: '5%' },
            null,
            null,
            null
        ]
    });

    myTable.on('select deselect draw', function () {
        var all = myTable.rows({ search: 'applied' }).count(); // get total count of rows
        var selectedRows = myTable.rows({ selected: true, search: 'applied' }).count(); // get total count of selected rows

        if (selectedRows < all) {
            $('#MyTableCheckAllButton i').attr('class', 'far fa-square');
        } else {
            $('#MyTableCheckAllButton i').attr('class', 'far fa-check-square');
        }
        var dataTableRows = myTable.rows({ selected: true }).data().toArray();
        var list = []
        for (let i = 0; i < dataTableRows.length; ++i) {
            list.push(dataTableRows[i][2])
        }
        document.getElementById('list_rollnumber').value = list;
        if (list.length == 1) {
            document.getElementById('totalrollnumber').innerHTML = list.length + ' student';
        } else {
            document.getElementById('totalrollnumber').innerHTML = list.length + ' students';
        }
    });

    $('#MyTableCheckAllButton').click(function () {
        var all = myTable.rows({ search: 'applied' }).count(); // get total count of rows
        var selectedRows = myTable.rows({ selected: true, search: 'applied' }).count(); // get total count of selected rows


        if (selectedRows < all) {
            //Added search applied in case user wants the search items will be selected
            myTable.rows({ search: 'applied' }).deselect();
            myTable.rows({ search: 'applied' }).select();
        } else {
            myTable.rows({ search: 'applied' }).deselect();
        }
    });
    myTable.on('order.dt search.dt', function () {
        myTable.column(1, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
            cell.innerHTML = i + 1;
        });
    }).draw();
});