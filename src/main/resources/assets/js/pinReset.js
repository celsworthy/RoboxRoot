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

function page_initialiser()
{
}