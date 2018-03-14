function attemptLogin()
{
    var enteredPIN = $("#application-pin-value").val();
    if (enteredPIN !== "")
    {
        localStorage.setItem(applicationPINVar, enteredPIN);
        console.log("Hello " + localStorage.getItem(applicationPINVar));
        goToHomeOrPrinterStatus();
    }
}

function goToPINReset()
{
    location.href = '/pin-reset.html';
}

function indexInit()
{
    titlei18n = "indexPage";
    checkForMobileBrowser();

    var enteredPIN = localStorage.getItem(applicationPINVar);
    if (enteredPIN !== null && enteredPIN !== "")
    {
        var base64EncodedCredentials = $.base64.encode(defaultUser + ":" + enteredPIN);
        $.ajax({
            url: clientURL + printerStatusPage,
            dataType: 'html',
            cache: false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + base64EncodedCredentials);
            },
            type: 'GET',
            success: function (data, textStatus, jqXHR) {
                goToHomeOrPrinterStatus();
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

function loginInit()
{
    var enteredPIN = localStorage.getItem(applicationPINVar);
    $("#application-pin-value").val(enteredPIN);
    if (enteredPIN !== null
        && enteredPIN !== "")
    {
        attemptLogin();
    }

    $("#application-pin-value").on('keyup', function (e) {
        if (e.keyCode === 13) {
            attemptLogin();
        }
    });
}
