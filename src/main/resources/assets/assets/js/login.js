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
