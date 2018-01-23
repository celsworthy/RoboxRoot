function sendGCode(gcodeToSend)
{
    sendPostCommandToRoot(localStorage.getItem(selectedPrinterVar) + "/remoteControl/executeGCode", null, null, gcodeToSend);
}

function runMacroFile(macroName)
{
    sendPostCommandToRoot(localStorage.getItem(selectedPrinterVar) + "/remoteControl/runMacro", null, null, macroName);
}

function jogZUp()
{
    sendGCode("G91:G0 Z20:G90");
}

function jogZDown()
{
    sendGCode("G91:G0 Z-20:G90");
}

function jogYForward()
{
    sendGCode("G91:G0 Y10:G90");
}

function jogYBack()
{
    sendGCode("G91:G0 Y-10:G90");
}

function jogXLeft()
{
    sendGCode("G91:G0 X-10:G90");
}

function jogXRight()
{
    sendGCode("G91:G0 X10:G90");
}

function jogExtruder1Out()
{
    sendGCode("G91:G1 E-20 F400:G90");
}

function jogExtruder1In()
{
    sendGCode("G91:G1 E20 F400:G90");
}

function jogExtruder2Out()
{
    sendGCode("G91:G1 D-20 F400:G90");
}

function jogExtruder2In()
{
    sendGCode("G91:G1 D20 F400:G90");
}

function homeXYZ()
{
    runMacroFile("HOME_ALL");
}

function switchNozzles()
{
    if (nozzle0Selected)
    {
        sendGCode("T1");
        nozzle0Selected = false;
    } else
    {
        sendGCode("T0");
        nozzle0Selected = true;
    }
}

function openCloseNozzle()
{
    if (nozzleOpen)
    {
        sendGCode("G0 B0");
        nozzleOpen = false;
    } else
    {
        sendGCode("G0 B1");
        nozzleOpen = true;
    }
}

function sendGCodeFromDialog()
{
    var gcodeToSend = $('#gcode-input').val().toUpperCase();
    sendGCode(gcodeToSend);
    $('#gcode-output').val($('#gcode-output').val() + '\n' + gcodeToSend);
}

function setupMovePage()
{
    $('#jog-z-up-button').on('click', function() { jogZUp(); });
    $('#jog-extruder-1-out-button').on('click', function() { jogExtruder1Out(); });
    $('#jog-extruder-1-in-button').on('click', function() { jogExtruder1In(); });
    $('#jog-extruder-2-out-button').on('click', function() { jogExtruder2Out(); });
    $('#jog-extruder-2-in-button').on('click', function() { jogExtruder2In(); });
    $('#jog-z-down-button').on('click', function() { jogZDown(); });
    $('#jog-y-back-button').on('click', function() { jogYBack(); });
    $('#jog-x-left-button').on('click', function() { jogXLeft(); });
    $('#jog-x-right-button').on('click', function() { jogXRight(); });
    $('#home-xyz-a-button').on('click', function() { homeXYZ(); });
    $('#home-xyz-b-button').on('click', function() { homeXYZ(); });
    $('#switch-nozzles-a-button').on('click', function() { switchNozzles(); });
    $('#switch-nozzles-b-button').on('click', function() { switchNozzles(); });
    $('#open-close-nozzle-a-button').on('click', function() { openCloseNozzle(); });
    $('#open-close-nozzle-b-button').on('click', function() { openCloseNozzle(); });
    $('#jog-y-forward-button').on('click', function() { jogYForward(); });
    $('#send-gcode-button').on('click', function() { sendGCodeFromDialog(); });
    $('#gcode-button').on('click', function() { $('#gcode-dialog').modal('show'); });
}
