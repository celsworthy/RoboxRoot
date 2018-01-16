 // Note "&nbsp;" (non-breaking space) is used to stop
// empty lines from collapsing to zero height.

var homeStatusText = "";
var homePrinterName = "";
var homeWebColourString = "";
var homeStatusEnumValue = "";
var homeTotalDurationSeconds = 0;
var homeEtcSeconds = 0;
var homeTimeElapsed = 0;
var backgroundColour = 'Black';

// brightness  =  sqrt( .241 R2 + .691 G2 + .068 B2 )
// brightness > 130, use dark colour. Otherwise use light colour.

function getComplimentaryColour(baseColour, darkColour, lightColour)
{
   var rgb = baseColour.match(/\d+/g).slice(0,3);
    var b = Math.sqrt(0.241 * rgb[0] * rgb[0] + 0.691 * rgb[1] * rgb[1] + 0.068 * rgb[2] * rgb[2]);
    if (b > 130)
        return darkColour;
    else
        return lightColour;
}

function updateNameStatus(nameData)
{
    backgroundColour = $('.home-page').css('background-color');
    if (nameData.printerTypeCode == "RBX10")
    {
        $('#rbx01-image').hide();
        $('#rbx10-image').show();  
    }
    else
    {
        $('#rbx01-image').show();
        $('#rbx10-image').hide();  
    }
    homePrinterName = nameData.printerName;
    $('#printer-name-field').html(homePrinterName);
    homeWebColourString = nameData.printerWebColourString;
    $('.printer-name').css('background-color', nameData.printerWebColourString);
    var backgroundCol = $('.printer-name').css('background-color');
    $('.printer-name').css('color', getComplimentaryColour(backgroundCol, 'Black', 'White'));
    var compCol = getComplimentaryColour(backgroundCol, "rgba(0,0,0,0.7)", "rgba(255,255,255,0.7)");
    $('.robox-icon').css({'color' : compCol, 'fill' : compCol});
}

function updateFilamentStatus(materialData, filamentIndex)
{
    var titleValue = null;
    var descriptionValue = null;
    var colourValue = "White";
    var showLoadedIcon = false;
    var showNoneReelIcon = false;
    var showCustomReelIcon = false;

    if (materialData.attachedFilamentNames !== null)
    {
        showLoadedIcon = materialData.materialLoaded[filamentIndex];
        titleValue = "" + (filamentIndex + 1) + ": "
        if (materialData.attachedFilamentMaterials.length > filamentIndex)
        {
            if (materialData.attachedFilamentNames[filamentIndex] !== null)
            {
                titleValue += materialData.attachedFilamentMaterials[filamentIndex];
                descriptionValue = materialData.attachedFilamentNames[filamentIndex];
                colourValue = materialData.attachedFilamentWebColours[filamentIndex];
                showCustomReelIcon = materialData.attachedFilamentCustomFlags[filamentIndex];
            }
            else
            {
                if (showLoadedIcon)
                    descriptionValue = i18next.t("unknown");
                else
                {
                    descriptionValue = i18next.t("unknown-filament");
                    showNoneReelIcon = true;
                }
                colourValue = backgroundColour;
            }
        }
    }
    
    var filamentName = "filament-" + (filamentIndex + 1);
    var titleField = "#" + filamentName + "-title-field";
    var iconClass = "." + filamentName + "-icon";
    var loadedIcon = "#" + filamentName + "-loaded-icon"
    var smartReelIcon = "#" + filamentName + "-smart-icon"
    var customReelIcon = "#" + filamentName + "-custom-icon"
    var unknownReelIcon = "#" + filamentName + "-unknown-icon"
    var noneReelIcon = "#" + filamentName + "-none-icon"
    var descriptionField = "#" + filamentName + "-description-field";
    
    if (titleValue !== null)
    {
        $(titleField).html(titleValue)
        // Read back the computed colour, to get it in RGB.
        if (descriptionValue !== null)
        {
            $(descriptionField).html(descriptionValue);
            $(descriptionField).parent().css('background-color', colourValue);
            var complimentaryColour = getComplimentaryColour($(descriptionField).parent().css('background-color'), backgroundColour, 'White');
            $(descriptionField).parent().css('color', complimentaryColour);
            $(iconClass).css({'fill': colourValue, 'background-color': $('.row.filament').css('background-color')});
        }
        else
        {
            $(descriptionField).html("&nbsp;");
            $(descriptionField).parent().css({'color': 'White', 'background-color': backgroundColour});
            $(iconClass).css({'fill': colourValue, 'background-color': $('.row.filament').css('background-color')});
        }
        
        $(unknownReelIcon).hide();
        if (showNoneReelIcon)
        {
            $(customReelIcon).hide();
            $(smartReelIcon).hide();
            $(noneReelIcon).show();
        }
        else
        {
            $(noneReelIcon).hide();
            if (showCustomReelIcon)
            {
                $(customReelIcon).show();
                $(smartReelIcon).hide();
            }
            else
            {
                $(customReelIcon).hide();
                $(smartReelIcon).show();
            }
        }
 
        if (showLoadedIcon)
            $(loadedIcon).show();
        else
            $(loadedIcon).hide();
    }
    else
    {
        $(titleField).html("&nbsp;")
        $(descriptionField).html("&nbsp");
        $(loadedIcon).css("visibility", "hidden");
    }
}

function eject(materialNumber)
{
    sendPostCommandToRoot(localStorage.getItem(selectedPrinterVar) + "/remoteControl/ejectFilament", null, null, materialNumber + 1);
}

function updateFilamentEjectStatus(materialData)
{
    var enableEject1Button = false;
    var enableEject2Button = false;

    if (materialData.attachedFilamentNames !== null && materialData.canEjectFilament)
    {
        enableEject1Button = (materialData.canEjectFilament.length > 0 && materialData.canEjectFilament[0] === true);
        enableEject2Button = (materialData.canEjectFilament.length > 1 && materialData.canEjectFilament[1] === true);
    }
    
    if (enableEject2Button)
    {
        $('#eject-2-col').show();
        $('#eject-2-button').on('click', function() { eject(1); });
    } else
    {
        $('#eject-2-col').hide();
    }

    if (enableEject1Button)
    {
        $('#eject-1-col').show();
        $('#eject-1-button').removeClass("disabled");
        $('#eject-1-button').on('click', function() { eject(0); });
        $('#eject-1-image').attr('src', imageRoot + 'Icon-Eject-1.svg');
    } else if (enableEject2Button)
    {
        $('#eject-1-col').hide();
    }
    else
    {
        $('#eject-1-col').show();
        $('#eject-1-button').addClass("disabled");
        $('#eject-1-button').on('click');
        $('#eject-1-image').attr('src', imageRoot + 'Icon-Eject-B.svg');
    }
}

function updateMaterialStatus(materialData)
{
    updateFilamentStatus(materialData, 0);
    updateFilamentStatus(materialData, 1);
    updateFilamentEjectStatus(materialData);
}

function updateHeadStatus(headData)
{
    $('#bed-temperature-field').html(headData.bedTemperature + '\xB0' + "C");
    $('#ambient-temperature-field').html(headData.ambientTemperature + '\xB0' + "C");
    var nozzle1Temperature = "&nbsp;";
    var nozzle2Temperature = "&nbsp;";
    if (headData.nozzleTemperature)
    {
        // For some curious reason, the nozzle temperature indices are swapped.
        var nHeaters = headData.nozzleTemperature.length;
        if (nHeaters > 0 && headData.nozzleTemperature[nHeaters - 1] !== null)
        {
            nozzle1Temperature = headData.nozzleTemperature[nHeaters - 1] + '\xB0' + "C";
        }
        if (headData.nozzleTemperature.length > 1)
        {
            if (headData.nozzleTemperature[0] !== null)
                nozzle2Temperature = headData.nozzleTemperature[0] + '\xB0' + "C";
        }
    }
        
    $('#nozzle-1-temperature-field').html(nozzle1Temperature);
    $('#nozzle-2-temperature-field').html(nozzle2Temperature);
    
    var numberOfNozzleHeaters = 0;
    if (headData.nozzleTemperature !== null)
    {
        numberOfNozzleHeaters = headData.nozzleTemperature.length;
    }

    switch (numberOfNozzleHeaters)
    {
        case 0:
            $('#nozzle-1-temperature-field').parent().addClass("dimmed-section");
            $('#nozzle-2-temperature-field').parent().addClass("dimmed-section");
            break;
        case 1:
            $('#nozzle-1-temperature-field').parent().removeClass("dimmed-section");
            $('#nozzle-2-temperature-field').parent().addClass("dimmed-section");
            break;
        case 2:
            $('#nozzle-1-temperature-field').removeClass("dimmed-section");
            $('#nozzle-2-temperature-field').removeClass("dimmed-section");
            break;
    }
}

function updatePrintJobStatus(printJobData)
{
    homeStatusText = printJobData.printerStatusString;
    homeStatusEnumValue = printJobData.printerStatusEnumValue;
    homeTotalDurationSeconds = printJobData.totalDurationSeconds;
    homeEtcSeconds = printJobData.etcSeconds;
    homeTimeElapsed = printJobData.totalDurationSeconds - printJobData.etcSeconds;

    var statusText = "";
    switch(printJobData.printerStatusEnumValue) {
        case "PRINTING_PROJECT":
        case "RESUME_PENDING":
            statusText='<img src="' + imageRoot + 'Icon-Play.svg" class="print-status-icon">';
            break;
        case "PAUSED":
        case "PAUSE_PENDING":
            statusText='<img src="' + imageRoot + 'Icon-Pause.svg" class="print-status-icon">';
            break;
        case "IDLE":
            statusText='<img src="' + imageRoot + 'Icon-Ready.svg" class="print-status-icon">';
            break;

        // These are all the states of which I am aware.
        case "LOADING_FILAMENT_D":
        case "LOADING_FILAMENT_E":
        case "UNLOADING_FILAMENT_D":
        case "UNLOADING_FILAMENT_E":
        case "CALIBRATING_NOZZLE_ALIGNMENT":
        case "CALIBRATING_NOZZLE_HEIGHT":
        case "CALIBRATING_NOZZLE_OPENING":
        case "OPENING_DOOR":
        case "PURGING_HEAD":
        case "REMOVING_HEAD":
        case "RUNNING_MACRO_FILE":
        default:
            break;
    }
    statusText = statusText + printJobData.printerStatusString;
    $("#job-status-field").html(statusText);    

    if ((printJobData.printerStatusEnumValue.match("^PRINTING_PROJECT")
            || printJobData.printerStatusEnumValue.match("^PAUSED")
            || printJobData.printerStatusEnumValue.match("^PAUSE_PENDING")
            || printJobData.printerStatusEnumValue.match("^RESUME_PENDING"))
            && printJobData.totalDurationSeconds >= 0)
    {
        $('#job-title-field').html(printJobData.printJobName);
        $('#job-etc-field').html(secondsToHM(printJobData.etcSeconds));
        var timeElapsed = printJobData.totalDurationSeconds - printJobData.etcSeconds;
        if (timeElapsed < 0)
        {
            timeElapsed = 0;
        }
        if (timeElapsed <= 0 || printJobData.totalDurationSeconds <= 0)
        {
            $("#job-progress-bar .progress-bar").width("0%").html("");
        }
        else
        {
            var progressPercent = Math.round((100 * timeElapsed / printJobData.totalDurationSeconds)) + "%";
            $("#job-progress-bar .progress-bar").width(progressPercent).html("");
        }
        var profileName = printJobData.printJobSettings;
        switch (printJobData.printJobProfile)
        {
            case "DRAFT":
                profileName += '<img src="' + imageRoot + 'Icon-ProfileDraft.svg" style="height:30px;margin:0px 0px 3px 10px">';
                break;

            case "NORMAL":
                profileName += '<img src="' + imageRoot + 'Icon-ProfileNormal.svg" style="height:30px;margin:0px 0px 3px 10px">';
                break;

            case "FINE":
                profileName += '<img src="' + imageRoot + 'Icon-ProfileFine.svg" style="height:30px;margin:0px 0px 3px 10px">';
                break;

            default:
                if (profileName == null)
                    profileName = "";
                profileName += '<img src="' + imageRoot + 'Icon-ProfileCustom.svg" style="height:30px;margin:0px 0px 3px 10px">';
                break;
        } 
        $("#job-profile-field").html(profileName);
    } else
    {
        $('#job-title-field').html("&nbsp;");
        $('#job-etc-field').html("&nbsp;");
        $("#job-progress-bar .progress-bar").width("0%").html("");
        $("#job-profile-field").html("&nbsp;");
    }
}

function safetiesOn()
{
    var booleanStatus = false;
    var safetyStatus = localStorage.getItem(safetiesOnVar);
    if (safetyStatus === 'on')
    {
        booleanStatus = true;
    }
    return booleanStatus;
}

function pausePrint()
{
    sendPostCommandToRoot(localStorage.getItem(selectedPrinterVar) + "/remoteControl/pause", null, null, null);
}

function resumePrint()
{
    sendPostCommandToRoot(localStorage.getItem(selectedPrinterVar) + "/remoteControl/resume", null, null, null);
}

function cancelPrint()
{
    sendPostCommandToRoot(localStorage.getItem(selectedPrinterVar) + "/remoteControl/cancel", null, null, safetiesOn().toString());
}

function updateControlStatus(controlData)
{
    if (controlData.canPause === true)
    {
        $('#pause-resume-button').removeClass("disabled");
        $('#pause-resume-button').on('click', pausePrint);
        $('#pause-resume-image').attr('src', imageRoot + 'Icon-Pause-B.svg');
    } else if (controlData.canResume === true)
    {
        $('#pause-resume-button').removeClass("disabled");
        $('#pause-resume-button').on('click', resumePrint);
        $('#pause-resume-image').attr('src', imageRoot + 'Icon-Play-B.svg');
    }
    else
    {
        $('#pause-resume-button').addClass("disabled");
        $('#pause-resume-button').on('click');
        $('#pause-resume-image').attr('src', imageRoot + 'Icon-Pause-B.svg');
    }
    
    if (controlData.canCancel === true)
    {
        $('#cancel-col').show();
        $('#cancel-button').on('click', cancelPrint);
    }
    else
    {
        $('#cancel-col').hide();
        $('#cancel-button').on('click');
    }

//   if (controlData.canResume === true)
//    {
//        $('#pauseResumeButton').show();
//        $('#pauseResumeButton').off('click');
//        $('#pauseResumeButton').on('click', resumePrint);
//        $('#pauseResumeButton > img').attr('src', 'robox-images/resume.png');
//    } else if (controlData.canPause === true)
//    {
//        $('#pauseResumeButton').show();
//        $('#pauseResumeButton').off('click');
//        $('#pauseResumeButton').on('click', pausePrint;
//        $('#pauseResumeButton > img').attr('src', 'robox-images/pause.png');
//    } else
//    {
//        $('#pauseResumeButton').hide();
//    }
//
//    setElementVisibility(controlData.canCancel, "cancelButton");
//
//    setElementDisabled(controlData.canPrint || controlData.canResume, "jogHeadButton");
//    setElementDisabled(controlData.canPrint, "printJobButton");
//    setElementDisabled(controlData.canPrint, "reprintButton");
//    setElementDisabled(controlData.canPurgeHead, "purgeButton");
//    setElementDisabled(controlData.canRemoveHead, "removeHeadButton");
//
//    if (printerData.canPrint)
//    {
//        $(".disabled-when-printer-busy").each(function ()
//        {
//            $(this).removeClass("disabled");
//        });
//    } else
//    {
//        $(".disabled-when-printer-busy").each(function ()
//        {
//            $(this).addClass("disabled");
//        });
//    }
}

function updateHomeData(printerData)
{
    updateNameStatus(printerData);
    updateFilamentStatus(printerData, 0);
    updateFilamentStatus(printerData, 1);
    updateFilamentEjectStatus(printerData);
    updateHeadStatus(printerData);
    updatePrintJobStatus(printerData);
    updateControlStatus(printerData);
}

function getStatusData(printerID, statusName, callback)
{
    sendGetCommandToRoot(printerID + '/remoteControl' + statusName,
            function (data)
            {
                callback(data);
            },
            goToPrinterStatusPage,
            null);
}

function getHomeData()
{
	var selectedPrinter = localStorage.getItem(selectedPrinterVar);
	if (selectedPrinter !== null)
	{
		// Either get all the data in one lump
		//getPrinterStatus(selectedPrinter, updateHomeData);
		// Or get the data in smaller segments.
		getStatusData(selectedPrinter, '/nameStatus', updateNameStatus)
		getStatusData(selectedPrinter, '/materialStatus', updateMaterialStatus)
		getStatusData(selectedPrinter, '/headStatus', updateHeadStatus)
		getStatusData(selectedPrinter, '/printJobStatus', updatePrintJobStatus)
		getStatusData(selectedPrinter, '/controlStatus', updateControlStatus)
		//setControlButtons(selectedPrinter);
	}
	else
		goToPrinterStatusPage();
}
