function resetPIN()
{
    var printerURL = "/api/admin/resetPIN/";

    $.ajax({
        url: printerURL,
        cache: false,
        processData: false,
        contentType: "application/json", // send as JSON
        type: 'POST',
        data: $("#printer-serial").val(),
        success: function (data, textStatus, jqXHR) {
            alert("Successfully reset PIN");
            logout();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("Failed to reset PIN");
        }
    });
}

//function resetPIN()
//{
//    $.ajax({
//        url: "http://" + hostname + ":" + port + "/api/admin/resetPIN/",
//        dataType: "xml/html/script/json", // expected format for response
//        contentType: "application/json", // send as JSON
//        type: 'POST',
//        data: JSON.stringify($("#printer-serial").val()),
//        success: function (data, textStatus, jqXHR) {
//        },
//        error: function (xhr, ajaxOptions, thrownError) {
//        }
//    });
//}

function page_initialiser()
{
    createHeader("has-pin-reset-header", "pin-reset");
    createFooter();
}