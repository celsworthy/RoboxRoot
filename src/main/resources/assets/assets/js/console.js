function sendGCode(gcodeToSend)
{
    sendPostCommandToRoot(localStorage.getItem(selectedPrinterVar) + "/remoteControl/executeGCode", null, null, gcodeToSend);
}

function sendGCodeFromDialog()
{
    var gcodeToSend = $('#gcode-input').val().toUpperCase();
    sendGCode(gcodeToSend);
    $('#gcode-output').val($('#gcode-output').val() + '\n' + gcodeToSend);
}

function consoleInit()
{
    setMachineLogo();
    $('#send-gcode-button').on('click', function() { sendGCodeFromDialog(); });
}