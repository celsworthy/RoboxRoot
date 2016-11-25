var isMobile = false; //initiate as false

function attemptLogin()
{
    var enteredPIN = $("#application-pin-value").val();
    if (enteredPIN !== "")
    {
        localStorage.setItem(applicationPINVar, enteredPIN);
        console.log("Hello " + localStorage.getItem(applicationPINVar));
        location.href = '/';
    }
}

function goToPINReset()
{
    location.href = '/pinReset.html';
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