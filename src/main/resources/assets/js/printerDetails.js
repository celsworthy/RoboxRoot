var connectedToServer = false;
var isMobile = false; //initiate as false
var connectedPrinterIDs = new Array();
var connectedPrinters = new Array();
var lastPrinterData = null;
var colourDisplayTag = "_colourDisplay";
var nameDisplayTag = "_nameDisplay";
var statusDisplayTag = "_statusDisplay";
var durationDisplayTag = "_durationDisplay";
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
var nozzleOpen = true;
var nozzle0Selected = true;

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

function reprintJob(printJobID)
{
    sendPostCommandToRoot(localStorage.getItem(selectedPrinterVar) + "/remoteControl/reprintJob", null, null, printJobID);
}

function showModalPanel(name)
{
    $('#' + name).modal('show');
}

function sendGCode(gcodeToSend)
{
    sendPostCommandToRoot(localStorage.getItem(selectedPrinterVar) + "/remoteControl/executeGCode", null, null, gcodeToSend);
}

function runMacroFile(macroTitle, macroFilePrefix)
{
    sendPostCommandToRoot(localStorage.getItem(selectedPrinterVar) + "/remoteControl/runMacroFile", null, null, macroTitle + ":" + macroFilePrefix);
}

function sendGCodeFromDialog()
{
    var gcodeToSend = $('#gcode-input').val().toUpperCase();
    sendGCode(gcodeToSend);
    $('#gcode-output').val($('#gcode-output').val() + '\n' + gcodeToSend);
}

function showIDPanel()
{
    $('#id-dialog').modal('show');
    $('#printer-name-input').val(lastPrinterData.printerName);
    $('#colourselector').colorselector('setColor', lastPrinterData.printerWebColourString);
}

function renamePrinter()
{
    var newName = $('#printer-name-input').val();
    sendPostCommandToRoot(localStorage.getItem(selectedPrinterVar) + "/remoteControl/renamePrinter", null, null, newName);
}

function changePrinterColour()
{
    var newColour = $('#colourselector').find(":selected").data('color');
    sendPostCommandToRoot(localStorage.getItem(selectedPrinterVar) + "/remoteControl/changePrinterColour", null, null, newColour);
}

function jogZUp()
{
    sendGCode("G91");
    sendGCode("G0 Z20");
    sendGCode("G90");
}

function jogZDown()
{
    sendGCode("G91");
    sendGCode("G0 Z-20");
    sendGCode("G90");
}

function jogYForward()
{
    sendGCode("G91");
    sendGCode("G0 Y10");
    sendGCode("G90");
}

function jogYBack()
{
    sendGCode("G91");
    sendGCode("G0 Y-10");
    sendGCode("G90");
}

function jogXLeft()
{
    sendGCode("G91");
    sendGCode("G0 X-10");
    sendGCode("G90");
}

function jogXRight()
{
    sendGCode("G91");
    sendGCode("G0 X10");
    sendGCode("G90");
}

function jogExtruder1Out()
{
    sendGCode("G91");
    sendGCode("G1 E-20 F400");
    sendGCode("G90");
}

function jogExtruder1In()
{
    sendGCode("G91");
    sendGCode("G1 E20 F400");
    sendGCode("G90");
}

function jogExtruder2Out()
{
    sendGCode("G91");
    sendGCode("G1 D-20 F400");
    sendGCode("G90");
}

function jogExtruder2In()
{
    sendGCode("G91");
    sendGCode("G1 D20 F400");
    sendGCode("G90");
}

function homeXYZ()
{
    runMacroFile("Home", "Home_all");
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

function purgeHead()
{
    runMacroFile("Purge", "Mote_PurgeMaterial");
}

function populateReprintDialog()
{
    sendPostCommandToRoot(localStorage.getItem(selectedPrinterVar) + "/remoteControl/listReprintableJobs", function (suitablePrintJobs) {
        var selectorHTML = "";
        for (var printJobIndex = 0; printJobIndex < suitablePrintJobs.length; printJobIndex++)
        {
            var printJobID = suitablePrintJobs[printJobIndex].printJobID;
            console.log(suitablePrintJobs[printJobIndex].printJobID);
            console.log(suitablePrintJobs[printJobIndex].printJobName);
            console.log(suitablePrintJobs[printJobIndex].printProfileName);
            console.log(suitablePrintJobs[printJobIndex].durationInSeconds);
            console.log(suitablePrintJobs[printJobIndex].eVolume);
            console.log(suitablePrintJobs[printJobIndex].dVolume);
            selectorHTML += "<tr id=\"" + printJobID + "_row" + "\">";
            selectorHTML += "<td>" + suitablePrintJobs[printJobIndex].printJobName + "</td>";
            selectorHTML += "<td>" + suitablePrintJobs[printJobIndex].creationDate + "</td>";
            selectorHTML += "<td>" + secondsToHMS(suitablePrintJobs[printJobIndex].durationInSeconds) + "</td>";
            selectorHTML += "</tr>\n";

            $("#reprint-table-body").html(selectorHTML);
        }
        for (var printJobIndex = 0; printJobIndex < suitablePrintJobs.length; printJobIndex++)
        {
            var printJobID = suitablePrintJobs[printJobIndex].printJobID;
            $('#' + printJobID + "_row").data("printJobID", printJobID);
            $('#' + printJobID + "_row").click(function () {
                $('#reprint-dialog').modal('hide');
                reprintJob($(this).data("printJobID"));
            });

            $('#' + printJobID + "_row").hover(function () {
                $(this).addClass('selector-highlight');
            }, function () {
                $(this).removeClass('selector-highlight');
            });
            $('#' + printJobID + "_row").mousedown(function () {
                $(this).addClass('selector-press');
            }, function () {
                $(this).removeClass('selector-press');
            });
        }
        $('#reprint-dialog').modal('show');
    }, null, null);
}

function configurePrinterButtons(printerData)
{
    if ((lastPrinterData === null)
            || printerData.canPrint !== lastPrinterData.canPrint
            || printerData.canPause !== lastPrinterData.canPause
            || printerData.canResume !== lastPrinterData.canResume
            || printerData.canRemoveHead !== lastPrinterData.canRemoveHead
            || printerData.canOpenDoor !== lastPrinterData.canOpenDoor
            || printerData.canCancel !== lastPrinterData.canCancel
            || printerData.canCalibrateHead !== lastPrinterData.canCalibrateHead
            || printerData.canPurgeHead !== lastPrinterData.canPurgeHead
            || printerData.dualMaterialHead !== lastPrinterData.dualMaterialHead)
    {
        if (printerData.canResume === true)
        {
            $('#pauseResumeButton').show();
            $('#pauseResumeButton').off('click');
            $('#pauseResumeButton').on('click', function () {resumePrint()});
            $('#pauseResumeButton > img').attr('src', 'robox-images/resume.png');
        } else if (printerData.canPause === true)
        {
            $('#pauseResumeButton').show();
            $('#pauseResumeButton').off('click');
            $('#pauseResumeButton').on('click', function () {pausePrint()});
            $('#pauseResumeButton > img').attr('src', 'robox-images/pause.png');
        } else
        {
            $('#pauseResumeButton').hide();
        }

        setElementVisibility(printerData.canCancel, "cancelButton");

        setElementDisabled(printerData.canPrint, "jogHeadButton");
        setElementDisabled(printerData.canPrint, "printJobButton");
        setElementDisabled(printerData.canPrint, "reprintButton");
        setElementDisabled(printerData.canPurgeHead, "purgeButton");
        setElementDisabled(printerData.canRemoveHead, "removeHeadButton");
    }
    lastPrinterData = printerData;

}

function setElementVisibility(test, buttonID)
{
    if (test === true)
    {
        $('#' + buttonID).show();
    } else
    {
        $('#' + buttonID).hide();
    }
}

function setElementDisabled(test, buttonID)
{
    if (test === true)
    {
        $('#' + buttonID).removeClass("disabled");
    } else
    {
        $('#' + buttonID).addClass("disabled");
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
        return hours + ":" + minutes + ":" + Math.trunc(seconds);
    } else if (minutes > 0)
    {
        return "00:" + minutes + ":" + Math.trunc(seconds);
    } else
    {
        return Math.trunc(seconds) + " seconds";
    }
}

function updateAndDisplayPrinterStatus(printerID)
{
    getPrinterStatus(printerID, function (printerData) {

        if (printerID !== null)
        {
            $('.printer-swatch').css('background-color', printerData.printerWebColourString);

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

                if (showEjectButton === true)
                {
                    $('#_material' + materialNum + 'Eject').removeClass('disabled');
                } else
                {
                    $('#_material' + materialNum + 'Eject').addClass('disabled');
                }
                if (printerData.attachedFilamentNames[materialNum - 1] !== null)
                {
                    filamentNameOutput = printerData.attachedFilamentNames[materialNum - 1];
                } else
                {
                    if (printerData.materialLoaded[materialNum - 1])
                    {
                        filamentNameOutput = i18next.t("unknown");
                    }
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

    $('#gcode-input').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $(this).parent().find('button').click();
        }
    });

    $('.numberOfPrintersDisplay').text(i18next.t('printer-status'));
    getStatus();
    setInterval(getStatus, 2000);
}