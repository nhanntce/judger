$(document).ready(function() {
    let e = $("#dataTable").DataTable({
        columnDefs: [{
            searchable: !1,
            orderable: !1,
            className: "select-checkbox",
            targets: 0
        }],
        select: {
            style: "multi",
            selector: "td:first-child"
        },
        order: [[ 1, 'asc' ]]
    });
    e.on("select deselect draw", function() {
        var t = e.rows({
            search: "applied"
        }).count();
        e.rows({
            selected: !0,
            search: "applied"
        }).count() < t ? $("#MyTableCheckAllButton i").attr("class", "far fa-square") : $("#MyTableCheckAllButton i").attr("class", "far fa-check-square");
        var l = e.rows({
                selected: !0
            }).data().toArray(),
            a = [];
        for (let e = 0; e < l.length; ++e) a.push(l[e][1]);
        if(a.length==0){
            $("#btnconfirm").prop('disabled', true);
        }else {
            $('#btnconfirm').prop('disabled', false);
            document.getElementById("list_rollnumber").value = a, 1 == a.length ? $("#totalrollnumber").text(a.length + " student") : $("#totalrollnumber").text(a.length + " students")
        }
        
    }), $("#MyTableCheckAllButton").click(function() {
        var t = e.rows({
            search: "applied"
        }).count();
        e.rows({
            selected: !0,
            search: "applied"
        }).count() < t ? (e.rows({
            search: "applied"
        }).deselect(), e.rows({
            search: "applied"
        }).select()) : e.rows({
            search: "applied"
        }).deselect()
    })
});