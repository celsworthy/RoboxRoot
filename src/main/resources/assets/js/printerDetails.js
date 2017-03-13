var connectedToServer = false;
var isMobile = false; //initiate as false
var connectedPrinterIDs = new Array();
var connectedPrinters = new Array();
var lastPrinterData = null;
var colourDisplayTag = "_colourDisplay";
var nameDisplayTag = "_nameDisplay";
var statusDisplayTag = "_statusDisplay";
var jobDisplayTag = "_jobDisplay";
var etcRowTag = "_etcRow";
var etcDisplayTag = "_etcDisplay";
var headNameDisplayTag = "_headNameDisplay";
var bedTemperatureDisplayTag = "_bedTemperatureDisplay";
var materialRowTag = "_materialRow";
var materialDisplayTag = "_materialDisplay";
var materialEjectButtonTag = "_materialEjectButton";
var nozzleTemperatureTag = "_nozzleTemperature";
var nozzleTemperatureDisplayTag = "_nozzleTemperatureDisplay";
var errorRowTag = "_errorRow";
var errorDisplayTag = "_errorDisplay";
function id2Index(tabsId, srcId)
{
    var index = -1;
    var i = 0, tbH = $(tabsId).find("li a");
    var lntb = tbH.length;
    if (lntb > 0) {
        for (i = 0; i < lntb; i++) {
            o = tbH[i];
            if (o.href.search(srcId) > 0) {
                index = i;
            }
        }
    }
    return index;
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

function printGCodeFile()
{
    var formData = new FormData($('#printGCodeFile')[0]);
    submitFormToRoot(localStorage.getItem(selectedPrinterVar) + '/remoteControl/upload',
            function (returndata) {
                alert('success ' + returndata);
            },
            function (returndata) {
                alert('error ' + returndata);
            },
            formData);
//
//
//    var data = new FormData($('#printGCodeFile').val());
//    sendPostCommandToRoot(selectedPrinterID + '/remoteControl/upload',
//            function (data) {
//                alert(data);
//            },
//            null,
//            data);
}

function openDoor()
{
    sendPostCommandToRoot(localStorage.getItem(selectedPrinterVar) + "/remoteControl/openDoor", null, null, safetiesOn().toString());
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
    sendPostCommandToRoot(localStorage.getItem(selectedPrinterVar) + "/remoteControl/cancel", null, null, null);
}

function removeHead()
{
    sendPostCommandToRoot(localStorage.getItem(selectedPrinterVar) + "/remoteControl/removeHead", null, null, null);
}

function purgeHead()
{
    sendPostCommandToRoot(localStorage.getItem(selectedPrinterVar) + "/remoteControl/purge", null, null, safetiesOn().toString());
}

function eject(materialNumber)
{
    sendPostCommandToRoot(localStorage.getItem(selectedPrinterVar) + "/remoteControl/ejectFilament", null, null, materialNumber);
}

function configurePrinterButtons(printerData)
{
    if ((lastPrinterData === null)
            || printerData.canPause !== lastPrinterData.canPause
            || printerData.canResume !== lastPrinterData.canResume
            || printerData.canRemoveHead !== lastPrinterData.canRemoveHead
            || printerData.canOpenDoor !== lastPrinterData.canOpenDoor
            || printerData.canCancel !== lastPrinterData.canCancel
            || printerData.canCalibrateHead !== lastPrinterData.canCalibrateHead
            || printerData.canPurgeHead !== lastPrinterData.canPurgeHead)
    {
        setButtonVisibility(printerData.canPause, "printer-control-pause");
        setButtonVisibility(printerData.canResume, "printer-control-resume");
        setButtonVisibility(printerData.canCancel, "printer-control-cancel");
        setButtonVisibility(printerData.canOpenDoor, "printer-control-open-door");
        setButtonVisibility(printerData.canRemoveHead, "printer-control-remove-head");
        setButtonVisibility(!isMobile && printerData.canPrint, "fileUpload");
    }
    lastPrinterData = printerData;

}

function setButtonVisibility(test, buttonID)
{
    if (test === true)
    {
        $('#' + buttonID).show();
    } else
    {
        $('#' + buttonID).hide();
    }
}

function firmwareUpdateSubmit(event) {
    event.preventDefault();
    var formData = new FormData($(this)[0]);
    var base64EncodedCredentials = $.base64.encode(defaultUser + ":" + localStorage.getItem(applicationPINVar));
    $.ajax({
        url: 'http://' + hostname + ':' + port + '/api/' + printerID + '/remoteControl/printGCodeFile/',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + base64EncodedCredentials);
        },
        type: 'POST',
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (returndata) {
            alert(returndata);
        },
        error: function () {
            alert("error in ajax form submission");
        }
    });
}

function secondsToHMS(secondsInput)
{
    var minutes = Math.floor(secondsInput / 60);
    var hours = Math.floor(minutes / 60);
    minutes = minutes - (60 * hours);
    var seconds = secondsInput - (minutes * 60) - (hours * 3600);
    if (hours > 0)
    {
        return hours + ":" + minutes + ":" + seconds;
    } else if (minutes > 0)
    {
        return minutes + ":" + seconds;
    } else
    {
        return seconds + " seconds";
    }
}

function updateAndDisplayPrinterStatus(printerID)
{
    getPrinterStatus(printerID, function (printerData) {

        if (printerID !== null)
        {
            var statusText = printerData.printerStatusString;

            if (printerData.printerStatusString.match("^Printing"))
            {
                statusText += " " + printerData.printJobName;
                $('#printer-details-panel').find('#' + etcRowTag).show();
                $('#printer-details-panel').find('#' + etcDisplayTag).text(secondsToHMS(printerData.etcSeconds));
            } else
            {
                $('#printer-details-panel').find('#' + etcRowTag).hide();
            }

            $('#printer-details-panel').find('#' + nameDisplayTag).text(printerData.printerName);
            $('#printer-details-panel').find('#' + statusDisplayTag).text(statusText);
            $('#printer-details-panel').find('#' + headNameDisplayTag).text(printerData.headName);
            $('#printer-details-panel').find('#' + bedTemperatureDisplayTag).text(printerData.bedTemperature + '\xB0' + "C");
            if (printerData.nozzleTemperature)
            {
                for (var nozzleNum = 1; nozzleNum <= printerData.nozzleTemperature.length; nozzleNum++)
                {
                    if (printerData.nozzleTemperature[nozzleNum - 1] !== null)
                    {
                        $('#printer-details-panel').find('#' + nozzleTemperatureDisplayTag + nozzleNum).text(printerData.nozzleTemperature[nozzleNum - 1] + '\xB0' + "C");
                    }
                }
            }

            var numberOfNozzleHeaters = 0;
            if (printerData.nozzleTemperature !== null)
            {
                numberOfNozzleHeaters = printerData.nozzleTemperature.length;
            }

            switch (numberOfNozzleHeaters)
            {
                case 0:
                    $('#nozzle1-div').hide();
                    $('#nozzle2-div').hide();
                    break;
                case 1:
                    $('#nozzle1-div').show();
                    $('#nozzle2-div').hide();
                    break;
                case 2:
                    $('#nozzle1-div').show();
                    $('#nozzle2-div').show();
                    break;
            }

            for (var materialNum = 1; materialNum <= printerData.attachedFilamentNames.length; materialNum++)
            {
                var filamentNameOutput = "";
                var showEjectButton = printerData.canEjectFilament[materialNum - 1];

                if (printerData.attachedFilamentNames[materialNum - 1] !== null)
                {
                    filamentNameOutput = printerData.attachedFilamentNames[materialNum - 1];
                    if (!printerData.materialLoaded[materialNum - 1])
                    {
                        filamentNameOutput += " - " + i18next.t("not-loaded");
                        showEjectButton = false;
                    } else
                    {
                        filamentNameOutput += " - " + i18next.t("loaded");
                    }
                } else
                {
                    if (printerData.materialLoaded[materialNum - 1])
                    {
                        filamentNameOutput = i18next.t("unknown") + " - " + i18next.t("loaded");
                    } else
                    {
                        filamentNameOutput = i18next.t("not-loaded");
                        showEjectButton = false;
                    }
                }

                if (showEjectButton)
                {
                    $('#printer-control-eject-' + materialNum).show();
                } else
                {
                    $('#printer-control-eject-' + materialNum).hide();
                }
                $('#printer-details-panel').find('#' + materialDisplayTag + materialNum).text(filamentNameOutput);
            }

            var numberOfMaterials = 0;
            if (printerData.attachedFilamentNames !== null)
            {
                numberOfMaterials = printerData.attachedFilamentNames.length;
            }

            if (numberOfMaterials == 2)
            {
                $('.material-display-2').show();
            } else
            {
                $('.material-display-2').hide();
            }

            if (printerData.activeErrors !== null)
            {
                var allErrors;
                for (var errorNum = 0; errorNum < printerData.activeErrors.length; errorNum++)
                {
                    var errorString = printerData.activeErrors[errorNum];
                    allErrors += errorString + '\n';
                }
                $('#printer-details-panel').find('#' + errorDisplayTag).text(allErrors);
                $('#printer-details-panel').find('#' + errorRowTag).show();
            } else
            {
                $('#printer-details-panel').find('#' + errorRowTag).hide();
            }

            configurePrinterButtons(printerData);
        }

        var statusText = printerData.printerStatusString;
        $('#' + printerID + nameDisplayTag).text(printerData.printerName);
        $('#' + printerID + statusDisplayTag).text(statusText);
        $('#' + printerID + colourDisplayTag).css("background-color", printerData.printerWebColourString);
    });
}

function getPrinterStatus(printerID, callback)
{
    sendGetCommandToRoot(printerID + '/remoteControl',
            function (data)
            {
                callback(data);
            },
            function ()
            {
                goToPrinterStatusPage();
            },
            null);
}

function getStatus()
{
    var selectedPrinter = localStorage.getItem(selectedPrinterVar);
    if (selectedPrinter !== null)
    {
        updateAndDisplayPrinterStatus(selectedPrinter);
    } else
    {
        goToPrinterStatusPage();
    }
}

function page_initialiser()
{
    $(".server-name-title").text(localStorage.getItem(serverNameVar));

    $(document).on('change', ':file', function () {
        var input = $(this),
                numFiles = input.get(0).files ? input.get(0).files.length : 1,
                label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);
    });

    $(':file').on('fileselect', function (event, numFiles, label) {

        var input = $(this).parents('.input-group').find(':text'),
                log = numFiles > 1 ? numFiles + ' files selected' : label;

        if (input.length) {
            input.val(log);
        } else {
            if (log)
                alert(log);
        }

    });

    $('.numberOfPrintersDisplay').text(i18next.t('printer-status'));
    getStatus();
    setInterval(getStatus, 2000);
}