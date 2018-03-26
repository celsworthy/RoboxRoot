var hpDebounceFlag = true;
var lastEData = null;

function getHeadText(typeCode, field)
{
    var headText = i18next.t(typeCode + field);
    if (headText === null || headText.length <1)
        headText = "&nbsp;";
    return headText;
}

function setHeadEPPROMData()
{
    if (!hpDebounceFlag && lastEData !== null)
    {
        hpDebounceFlag = true;
        var eData = lastEData;
		   eData.nozzle0XOffset = $('#hp-x-1').val();
		   eData.nozzle0YOffset = $('#hp-y-1').val();
		   eData.nozzle0ZOverrun = $('#hp-z-1').val();
        if (eData.valveFitted)
            eData.nozzle0BOffset = $('#hp-b-1').val();
        if (eData.nozzleCount > 1)
        {
            eData.nozzle1XOffset = $('#hp-x-2').val();
            eData.nozzle1YOffset = $('#hp-y-2').val();
            eData.nozzle1ZOverrun = $('#hp-z-2').val();
            if (eData.valveFitted)
                eData.nozzle1BOffset = $('#hp-b-2').val();
        }
        
        var selectedPrinter = localStorage.getItem(selectedPrinterVar);
        promisePostCommandToRoot(selectedPrinter + "/remoteControl/setHeadEEPROM", eData)
            .then(setupHeadEEPROMPage)
            .catch(reportHEError);
    }
}

function reportHEError(data)
{
    alert("Failed to write to head EEPROM");
    setupHeadEEPROMPage();
    hpDebounceFlag = false;
}

function updateHeadEEPROMData(eData)
{
    var typeCode = eData.typeCode;

    $('#head-title').html(getHeadText(typeCode, "-titleBold") + " " + getHeadText(typeCode, "-titleLight"));
    $('#head-description').html(getHeadText(typeCode, "-description"));
    $('#head-nozzles').html(getHeadText(typeCode, "-nozzles"));
    $('#head-feeds').html(getHeadText(typeCode, "-feeds"));
    $('#head-icon').attr('src', imageRoot + "Icon-" + typeCode + '.svg');
    
    var serial = eData.typeCode +
                     '-' + eData.week + eData.year +
                     '-' + eData.ponumber +
                     '-' + eData.serialNumber +
                     '-' + eData.checksum;
    $('#head-serial-number').html(serial);
    var hoursUnit = i18next.t("hours");
    $('#head-print-hours').html(eData.hourCount.toFixed(0) + ' ' + hoursUnit);
    $('#head-max-temp').html(eData.maxTemp.toFixed(0) + '\xB0' + 'C');
    
    $('#hp-x-1').val(eData.nozzle0XOffset.toFixed(2));
    $('#hp-y-1').val(eData.nozzle0YOffset.toFixed(2));
    $('#hp-z-1').val(eData.nozzle0ZOverrun.toFixed(2));
    if (eData.valveFitted)
        $('#hp-b-1').removeAttr('disabled').val(eData.nozzle0BOffset.toFixed(2));
    else
        $('#hp-b-1').attr('disabled', 'disabled').val('');

    if (eData.nozzleCount > 1)
    {
        $('#hp-x-2').removeAttr('disabled').val(eData.nozzle1XOffset.toFixed(2));
        $('#hp-y-2').removeAttr('disabled').val(eData.nozzle1YOffset.toFixed(2));
        $('#hp-z-2').removeAttr('disabled').val(eData.nozzle1ZOverrun.toFixed(2));
        if (eData.valveFitted)
            $('#hp-b-2').removeAttr('disabled').val(eData.nozzle1BOffset.toFixed(2));
        else
            $('#hp-b-2').attr('disabled', 'disabled').val('');
    }
    else
    {
        $('#hp-x-2').attr('disabled', 'disabled').val('');
        $('#hp-y-2').attr('disabled', 'disabled').val('');
        $('#hp-z-2').attr('disabled', 'disabled').val('');
        $('#hp-b-2').attr('disabled', 'disabled').val('');
    }
    
    $('#right-button').on('click', setHeadEPPROMData);
    hpDebounceFlag = false;
    lastEData = eData;
}

function headEEPromInit()
{
    var selectedPrinter = localStorage.getItem(selectedPrinterVar);
	if (selectedPrinter !== null)
	{
        setMachineLogo();
        $('.rbx-spinner').on('click', onSpinnerClick);
        promiseGetCommandToRoot(selectedPrinter + '/remoteControl/headEEPROM', null)
            .then(updateHeadEEPROMData)
            .catch(goToPrinterStatusPage);
	}
	else
		goToPrinterStatusPage();
}
