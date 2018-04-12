var controlSwitches = {'ambientlight':{'state':'on'},
                       'doorlock':{'state':false, 'onCode':'G37 S', 'offCode':'G37 S'},
                       'fan':{'state':false, 'onCode':'M106', 'offCode':'M107'},
                       'heater1':{'state':false, 'onCode':'M104 S', 'offCode':'M104 S0'},
                       'heater2':{'state':false, 'onCode':'M104 T', 'offCode':'M104 T0'},
                       'heaterB':{'state':false, 'onCode':'M140 S', 'offCode':'M140 S0'},
                       'lights':{'state':false, 'onCode':'M129', 'offCode':'M128'},
                       'nozzle':{'state':false, 'onCode':'T0', 'offCode':'T1'},
                       'valve':{'state':false, 'onCode':'G0 B1', 'offCode':'G0 B0'}};

function runMacroFile(macroName)
{
    return promisePostCommandToRoot(localStorage.getItem(selectedPrinterVar) + '/remoteControl/runMacro', macroName);
}

function decodeAxis(element)
{
    switch($(element).attr('axis'))
    {
        case 'x':
        case 'X':
            return 'X'
            break;
        case 'y':
        case 'Y':
            return 'Y'
            break;
        case 'z':
        case 'Z':
            return 'Z'
            break;
        default:
            break;
    }
    return null;
}

function decodeExtruder(element)
{
    switch($(element).attr('extruder'))
    {
        case '1':
            return 'E'
            break;
        case '2':
            return 'D'
            break;
        default:
            break;
    }
    return null;
}

function decodeStep(element)
{
    var step = Number($(element).attr('step'));
    if (step < 100 & step > -100)
        return step;
    return null;
}

function controlJog()
{
    var step = decodeStep(this);
    var extruder = decodeExtruder(this);
    if (step != null && step != 0 && extruder != null)
    {
        var s = 'G91:G1 ' + extruder + step + ' F400:G90';
        console.log('Sending GCode : "' + s + '".');
        sendGCode(s);
    }
}

function controlEject()
{
    console.log('controlEject');
}

function controlHeat()
{
    console.log('controlHeat');
}

function controlMove()
{
    var step = decodeStep(this);
    var axis = decodeAxis(this);
    if (step != null && axis != null)
    {
        if (step == 0)
        {
            s = 'G90:G28' + axis;
        }
        else
        {
            s = 'G91:G0 ' + axis + step + ':G90';
        }
        console.log('Sending GCode : "' + s + '".');
        sendGCode(s);
    }
}

function homeXYZ()
{
    console.log('homeXYZ');
    runMacroFile("HOME_ALL");
}

function toggleSwitch()
{
    var switchName = $(this).attr('switch');
    var switchData = controlSwitches[switchName];
    if (switchData.state)
    {
        console.log(switchName + ' off');
        sendGCode(switchData.offCode);
        switchData.state = false;
    } else
    {
        console.log(switchName + ' on');
        sendGCode(switchData.onCode);
        switchData.state = true;
    }
}

function toggleAmbientLight()
{
    var switchData = controlSwitches['ambientlight'];
    switch(switchData.state)
    {
        case 'on':
            switchData.state = 'white';
            break;
        case 'white':
            switchData.state = 'off';
            break;
        case 'off':
        default:
            switchData.state = 'on';
            break;
    }
    console.log('ambientlight ' + switchData.state);
    promisePostCommandToRoot(localStorage.getItem(selectedPrinterVar) + '/remoteControl/setAmbientLED', switchData.state);
}

function updateControlHeadStatus(headData)
{
    if (headData.headName.length == 0)
    {
        // No head attached
        $('#head-icon').attr('src', imageRoot + 'Icon-NoHead.svg');
        $('.require-head').addClass('disabled');
    }
    else
    {
        // Head attached.
        $('#head-icon').attr('src', imageRoot + "Icon-" + headData.headTypeCode + '.svg');
        $('.require-head').removeClass('disabled');
        if (!headData.dualMaterialHead)
            $('.nozzle-select, .mat2-heat').addClass('disabled');
    }
}

function updateControlFilamentStatus(materialData, index)
{
    var extruder = '[extruder=' + (index + 1) + ']';
    if (materialData.materialLoaded.length > index
        && materialData.materialLoaded[index])
    {
        $('.control-jog' + extruder).removeClass('disabled');
    }
    else
        $('.control-jog' + extruder).addClass('disabled');

    if (materialData.canEjectFilament.length > index
        && materialData.canEjectFilament[index])
    {
        $('.control-eject' + extruder).removeClass('disabled');
    }
    else
        $('.control-eject' + extruder).addClass('disabled');
}

function updateControlMaterialStatus(materialData)
{
    updateControlFilamentStatus(materialData, 0);
    updateControlFilamentStatus(materialData, 1);
}

function controlInit()
{
    $('.control-jog').on('click', controlJog);
    $('.control-eject').on('click', controlEject);
    $('.control-toggle').on('click', toggleSwitch);
    $('.control-move').on('click', controlMove);
    $('.control-home').on('click', homeXYZ);
    $('.control-ambient-light').on('click', toggleAmbientLight);
    getStatusData(null, '/headStatus', updateControlHeadStatus)
	setInterval(function() { getStatusData(null, '/headStatus', updateControlHeadStatus); }, 2000);
    getStatusData(null, '/materialStatus', updateControlMaterialStatus)
	setInterval(function() { getStatusData(null, '/materialStatus', updateControlMaterialStatus); }, 2000);
    startActiveErrorHandling();
}