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
            alert(i18n('reset-pin-ok'));
            logout();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert(i18n('reset-pin-failed'));
        }
    });
}

function pinResetInit()
{
    $("#middle-button").on('click', resetPIN)
}