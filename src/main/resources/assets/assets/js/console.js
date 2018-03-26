function console_key()
{
    var key_char = $(this).attr('char');
    var value = $('#gcode-input').val();
    $('#gcode-input').val(value + key_char);
}

function console_backspace()
{
    var value = $('#gcode-input').val();
    $('#gcode-input').val(value.substr(0, value.length - 1));
}

function console_space()
{
    var value = $('#gcode-input').val();
    $('#gcode-input').val(value + ' ');
}

function console_clear()
{
    $('#gcode-input').val('');
}

function sendGCode(gcodeToSend)
{
    promisePostCommandToRoot(localStorage.getItem(selectedPrinterVar) + "/remoteControl/executeGCode", gcodeToSend);
}

function sendGCodeFromDialog()
{
    var gcodeToSend = $('#gcode-input').val().toUpperCase();
    sendGCode(gcodeToSend);
    $('#gcode-output').val($('#gcode-output').val() + '\n' + gcodeToSend);
    console_clear();
}

function consoleInit()
{
    //setMachineLogo();
    $('#send-gcode-button').on('click', function() { sendGCodeFromDialog(); });
    $('.console-key').on('click', console_key);
    $('.space').on('click', console_space);
    $('.bspace').on('click', console_backspace);
    $('.clear').on('click', console_clear);
    addActiveErrorHandling();
}