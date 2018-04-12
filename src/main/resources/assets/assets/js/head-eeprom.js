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
		   eData.rightNozzleXOffset = $('#hp-right-x').val();
		   eData.rightNozzleYOffset = $('#hp-right-y').val();
		   eData.rightNozzleZOverrun = $('#hp-right-z').val();
        if (eData.valveFitted)
            eData.rightNozzleBOffset = $('#hp-right-b').val();
        if (eData.nozzleCount > 1)
        {
            eData.leftNozzleXOffset = $('#hp-left-x').val();
            eData.leftNozzleYOffset = $('#hp-left-y').val();
            eData.leftNozzleZOverrun = $('#hp-left-z').val();
            if (eData.valveFitted)
                eData.leftNozzleBOffset = $('#hp-left-b').val();
        }
        
        var selectedPrinter = localStorage.getItem(selectedPrinterVar);
        promisePostCommandToRoot(selectedPrinter + "/remoteControl/setHeadEEPROM", eData)
            .then(headEEPromInit)
            .catch(reportHEError);
    }
}

function reportHEError(data)
{
    alert("Failed to write to head EEPROM");
    setupHeadEEPROMPage();
    hpDebounceFlag = false;
}

function setSpinnerValue(spinner, value)
{
//     $(spinner).removeClass('disabled')
//               .val(value.toFixed(2))
//               .parent()
//               .find('.rbx-spinner')
//               .removeClass('disabled')
//               .on('click', onSpinnerClick);
     $(spinner).val(value.toFixed(2))
               .parent()
               .removeClass('rbx-invisible');
}

function disableSpinnerValue(spinner)
{
//     $(spinner).addClass('disabled')
//               .val('')
//               .parent()
//               .find('.rbx-spinner')
//               .addClass('disabled')
//               .off('click');
     $(spinner).val('')
               .parent()
               .addClass('rbx-invisible');
}

function updateHeadEEPROMData(eData)
{
    var typeCode = eData.typeCode;

    $('#head-title-bold').html(getHeadText(typeCode, "-titleBold"));
    $('#head-title-light').html(getHeadText(typeCode, "-titleLight"));
    $('#head-title-edition').html(getHeadText(typeCode, "-titleEdition"));
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
    
    setSpinnerValue('#hp-right-x', eData.rightNozzleXOffset);
    setSpinnerValue('#hp-right-y', eData.rightNozzleYOffset);
    setSpinnerValue('#hp-right-z', eData.rightNozzleZOverrun);
    if (eData.valveFitted)
    {
        $('#b-heading').removeClass('dimmed-section');
        setSpinnerValue('#hp-right-b', eData.rightNozzleBOffset);
    }
    else
    {
        $('#b-heading').addClass('dimmed-section');
        disableSpinnerValue('#hp-right-b');
    }
    if (eData.nozzleCount > 1)
    {
        $('#left-nozzle-heading').removeClass('dimmed-section');
        setSpinnerValue('#hp-left-x', eData.leftNozzleXOffset);
        setSpinnerValue('#hp-left-y', eData.leftNozzleYOffset);
        setSpinnerValue('#hp-left-z', eData.leftNozzleZOverrun);
        if (eData.valveFitted)
            setSpinnerValue('#hp-left-b', eData.leftNozzleBOffset);
        else
            disableSpinnerValue('#hp-left-b');
    }
    else
    {
        $('#left-nozzle-heading').addClass('dimmed-section');
        disableSpinnerValue('#hp-left-x');
        disableSpinnerValue('#hp-left-y');
        disableSpinnerValue('#hp-left-z');
        disableSpinnerValue('#hp-left-b');
    }
    
    hpDebounceFlag = false;
    lastEData = eData;
}

function removeHead()
{
    performPrinterAction('/removeHead',
                         removeHeadStatus,
                         safetiesOn().toString());
}

function headEEPromInit()
{
    var selectedPrinter = localStorage.getItem(selectedPrinterVar);
	if (selectedPrinter !== null)
	{
        setMachineLogo();
        $('#right-button').on('click', setHeadEPPROMData);
        $('.rbx-spinner').on('click', onSpinnerClick);
        $('.rbx-head-change').on('click', removeHead);
        promiseGetCommandToRoot(selectedPrinter + '/remoteControl/headEEPROM', null)
            .then(updateHeadEEPROMData)
            .catch(goToHomeOrPrinterSelectPage);
	}
	else
		goToHomeOrPrinterSelectPage();
}
