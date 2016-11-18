var isMobile = false; //initiate as false

function attemptLogin()
{
    var enteredPIN = $("#application-pin-value").val();
    if (enteredPIN !== "")
    {
        localStorage.setItem(applicationPINVar, enteredPIN);
        location.href = 'http://' + hostname + ':' + port + '/';
    }
}

function goToPINReset()
{
    location.href = 'http://' + hostname + ':' + port + '/pinReset.html';
}

$(document).ready(function ()
{
    checkForMobileBrowser();

    var enteredPIN = localStorage.getItem(applicationPINVar);
    $("#application-pin-value").val(enteredPIN);

    if (enteredPIN !== null
            && enteredPIN !== "")
    {
        attemptLogin();
    }

});