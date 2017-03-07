var isMobile = false; //initiate as false

function page_initialiser() {

    checkForMobileBrowser();

    var enteredPIN = localStorage.getItem(applicationPINVar);
    if (enteredPIN !== null && enteredPIN !== "")
    {
        var base64EncodedCredentials = $.base64.encode(defaultUser + ":" + enteredPIN);
        $.ajax({
            url: printerStatusPage,
            dataType: 'html',
            cache: false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + base64EncodedCredentials);
            },
            type: 'GET',
            success: function (data, textStatus, jqXHR) {
                goToPrinterStatusPage();
            },
            error: function (data, textStatus, jqXHR) {
                logout();
            }
        });
    } else
    {
        logout();
    }
}