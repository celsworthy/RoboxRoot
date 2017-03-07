var isMobile = false; //initiate as false
var applicationPINVar = "applicationPIN";
var defaultUser = "root";
var printerStatusPage = "/printerStatus.html";

function attemptLogin()
{
    var enteredPIN = $("#application-pin-value").val();
    if (enteredPIN !== "")
    {
        localStorage.setItem(applicationPINVar, enteredPIN);
        console.log("Hello " + localStorage.getItem(applicationPINVar));
        goToPrinterStatusPage();
    }
}

function goToPINReset()
{
    location.href = '/pinReset.html';
}

function page_initialiser()
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