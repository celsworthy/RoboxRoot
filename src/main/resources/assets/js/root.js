var connectedToServer = false;
var isMobile = false; //initiate as false
var connectedPrinterIDs = new Array();
var connectedPrinters = new Array();
var lastPrinterData = null;
var selectedPrinterID = null;
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

function processAddedAndRemovedPrinters(printerIDs)
{
    var printersToDelete = new Array();
    var printersToAdd = new Array();
    for (var printerIDIndex = 0; printerIDIndex < connectedPrinterIDs.length; printerIDIndex++)
    {
        var printerIDToConsider = connectedPrinterIDs[printerIDIndex];
        if (printerIDs.indexOf(printerIDToConsider) < 0)
        {
//Not in the list of discovered printers - we need to delete it
            printersToDelete.push(printerIDToConsider);
        }
    }

    for (var printerIDIndex = 0; printerIDIndex < printerIDs.length; printerIDIndex++)
    {
        var printerIDToConsider = printerIDs[printerIDIndex];
        if (connectedPrinterIDs.indexOf(printerIDToConsider) < 0)
        {
//Not in the list - we need to add it
            printersToAdd.push(printerIDToConsider);
        }
    }

    printersToDelete.forEach(deletePrinter);
    printersToAdd.forEach(addPrinter);
    var printerListChanged = false;
    if (printersToDelete.length > 0
            || printersToAdd.length > 0)
    {
        printerListChanged = true;
    }

    return printerListChanged;
}

function addPrinter(printerID)
{
    console.log("Adding printer " + printerID);
    connectedPrinterIDs.push(printerID);
    getPrinterStatus(printerID, function (data) {
        connectedPrinters.push(data);
        updatePrinterSelector();
    });
}

function deletePrinter(printerID)
{
    var indexToDelete = connectedPrinterIDs.indexOf(printerID);
    connectedPrinterIDs.splice(indexToDelete, 1);
    connectedPrinters.splice(indexToDelete, 1);
    updatePrinterSelector();
}

function removeAllPrinterTabs()
{
    connectedPrinterIDs.forEach(function (connectedPrinter) {
        console.log("Deleting printer  " + connectedPrinter);
        deletePrinter(connectedPrinter);
    });
}

function printGCodeFile()
{
    var data = new FormData($('#fileInput').val());
    sendPostCommandToRoot(selectedPrinterID + '/remoteControl/upload',
            function (data) {
                alert(data);
            },
            null,
            data);
}

function openDoor()
{
    sendPostCommandToRoot(selectedPrinterID + "/remoteControl/openDoor", null, null, safetiesOn().toString());
}

function pausePrint()
{
    sendPostCommandToRoot(selectedPrinterID + "/remoteControl/pause", null, null, null);
}

function resumePrint()
{
    sendPostCommandToRoot(selectedPrinterID + "/remoteControl/resume", null, null, null);
}

function cancelPrint()
{
    sendPostCommandToRoot(selectedPrinterID + "/remoteControl/cancel", null, null, null);
}

function removeHead()
{
    sendPostCommandToRoot(selectedPrinterID + "/remoteControl/removeHead", null, null, null);
}

function purgeHead()
{
    sendPostCommandToRoot(selectedPrinterID + "/remoteControl/purge", null, null, safetiesOn().toString());
}

function eject(materialNumber)
{
    sendPostCommandToRoot(selectedPrinterID + "/remoteControl/ejectFilament", null, null, materialNumber);
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
        setButtonVisibility(printerData.canPause, "printer-control-resume");
        setButtonVisibility(printerData.canPause, "printer-control-cancel");
        setButtonVisibility(printerData.canPause, "printer-control-open-door");
        setButtonVisibility(printerData.canPause, "printer-control-remove-head");
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

function updatePIN()
{
    sendPostCommandToRoot('admin/updatePIN',
            function () {
                logout();
            },
            null,
            $("#pin-update-value").val());
}
function rootRename()
{
    sendPostCommandToRoot('admin/setServerName',
            function () {
                getServerStatus();
            },
            null,
            $("#server-name-input").val());
}

function rootUpgrade()
{
    var formData = new FormData($('#rootUpgrade')[0]);
    submitFormToRoot('admin/updateSystem',
            function (returndata) {
                alert('success ' + returndata);
            },
            function (returndata) {
                alert('error ' + returndata);
            },
            formData);
//    event.preventDefault();
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

        if (printerID === selectedPrinterID)
        {
            var statusText = printerData.printerStatusString;
//            $('#printer-select-button').css("background-color", printerData.printerWebColourString);

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
                    $('#printer-details-panel').find('.' + nozzleTemperatureTag + '1').hide();
                    $('#printer-details-panel').find('.' + nozzleTemperatureTag + '2').hide();
                    break;
                case 1:
                    $('#printer-details-panel').find('.' + nozzleTemperatureTag + '1').show();
                    $('#printer-details-panel').find('.' + nozzleTemperatureTag + '2').hide();
                    break;
                case 2:
                    $('#printer-details-panel').find('.' + nozzleTemperatureTag + '1').show();
                    $('#printer-details-panel').find('.' + nozzleTemperatureTag + '2').show();
                    break;
            }

            for (var materialNum = 1; materialNum <= printerData.attachedFilamentNames.length; materialNum++)
            {
                var filamentNameOutput = "";
                var showEjectButton = printerData.canEjectFilament;
                if (printerData.attachedFilamentNames[materialNum - 1] !== null)
                {
                    filamentNameOutput = printerData.attachedFilamentNames[materialNum - 1];
                    if (!printerData.materialLoaded[materialNum - 1])
                    {
                        filamentNameOutput += " - not loaded";
                        showEjectButton = false;
                    } else
                    {
                        filamentNameOutput += " - loaded";
                    }
                } else
                {
                    if (printerData.materialLoaded[materialNum - 1])
                    {
                        filamentNameOutput = "Unknown - loaded";
                    } else
                    {
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

            switch (numberOfMaterials)
            {
                case 0:
                    $('#printer-details-panel').find('#' + materialRowTag + '1').hide();
                    $('#printer-details-panel').find('#' + materialRowTag + '2').hide();
                    break;
                case 1:
                    $('#printer-details-panel').find('#' + materialRowTag + '1').show();
                    $('#printer-details-panel').find('#' + materialRowTag + '2').hide();
                    break;
                case 2:
                    $('#printer-details-panel').find('#' + materialRowTag + '1').show();
                    $('#printer-details-panel').find('#' + materialRowTag + '2').show();
                    break;
            }

            if (printerData.activeErrors !== null)
            {
                var allErrors;
                for (var errorNum = 0; errorNum < printerData.activeErrors.length; errorNum++)
                {
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
        $('#' + printerID + "_row").css("background-color", printerData.printerWebColourString);
        if (printerData.printerStatusString.match("^Printing"))
        {
            $('#' + printerID + jobDisplayTag).text(printerData.printJobName);
            $('#' + printerID + etcDisplayTag).text(secondsToHMS(printerData.etcSeconds));
        }

//        $('#' + printerID + headNameDisplayTag).text(printerData.headName);
//        $('#' + printerID + bedTemperatureDisplayTag).text(printerData.bedTemperature + '\xB0' + "C");
//        if (printerData.nozzleTemperature)
//        {
//            for (var nozzleNum = 1; nozzleNum <= printerData.nozzleTemperature.length; nozzleNum++)
//            {
//                if (printerData.nozzleTemperature[nozzleNum - 1] !== null)
//                {
//                    $('#printer-details').find('#' + nozzleTemperatureDisplayTag + nozzleNum).text(printerData.nozzleTemperature[nozzleNum - 1] + '\xB0' + "C");
//                }
//            }
//        }
//
//        var numberOfNozzleHeaters = 0;
//        if (printerData.nozzleTemperature !== null)
//        {
//            numberOfNozzleHeaters = printerData.nozzleTemperature.length;
//        }
//
//        switch (numberOfNozzleHeaters)
//        {
//            case 0:
//                $('#printer-details').find('.' + nozzleTemperatureTag + '1').hide();
//                $('#printer-details').find('.' + nozzleTemperatureTag + '2').hide();
//                break;
//            case 1:
//                $('#printer-details').find('.' + nozzleTemperatureTag + '1').show();
//                $('#printer-details').find('.' + nozzleTemperatureTag + '2').hide();
//                break;
//            case 2:
//                $('#printer-details').find('.' + nozzleTemperatureTag + '1').show();
//                $('#printer-details').find('.' + nozzleTemperatureTag + '2').show();
//                break;
//        }

        for (var materialNum = 1; materialNum <= printerData.attachedFilamentNames.length; materialNum++)
        {
            var filamentNameOutput = "";
            var showEjectButton = printerData.canEjectFilament;
            if (printerData.attachedFilamentNames[materialNum - 1] !== null)
            {
                filamentNameOutput = printerData.attachedFilamentNames[materialNum - 1];
                if (!printerData.materialLoaded[materialNum - 1])
                {
                    filamentNameOutput += " - not loaded";
                    showEjectButton = false;
                } else
                {
                    filamentNameOutput += " - loaded";
                }
            } else
            {
                if (printerData.materialLoaded[materialNum - 1])
                {
                    filamentNameOutput = "Unknown - loaded";
                } else
                {
                    showEjectButton = false;
                }
            }

            $('#' + printerID + materialDisplayTag + materialNum).text(filamentNameOutput);
        }

        var numberOfMaterials = 0;
        if (printerData.attachedFilamentNames !== null)
        {
            numberOfMaterials = printerData.attachedFilamentNames.length;
        }

        switch (numberOfMaterials)
        {
            case 0:
                $('#' + printerID + materialRowTag + '1').hide();
                $('#' + printerID + materialRowTag + '2').hide();
                break;
            case 1:
                $('#' + printerID + materialRowTag + '1').show();
                $('#' + printerID + materialRowTag + '2').hide();
                break;
            case 2:
                $('#' + printerID + materialRowTag + '1').show();
                $('#' + printerID + materialRowTag + '2').show();
                break;
        }

//        if (printerData.activeErrors !== null)
//        {
//            var allErrors;
//            for (var errorNum = 0; errorNum < printerData.activeErrors.length; errorNum++)
//            {
//                allErrors += errorString + '\n';
//            }
//            $('#printer-details').find('#' + errorDisplayTag).text(allErrors);
//            $('#printer-details').find('#' + errorRowTag).show();
//        } else
//        {
//            $('#printer-details').find('#' + errorRowTag).hide();
//        }
    });
}

function getPrinterStatus(printerID, callback)
{
    sendGetCommandToRoot(printerID + '/remoteControl',
            function (data)
            {
                callback(data);
            },
            null,
            null);
}

function updatePrinterSelector()
{
    var selectorHTML = "";
    for (var connPrinterIndex = 0; connPrinterIndex < connectedPrinters.length; connPrinterIndex++)
    {
        var printerID = connectedPrinters[connPrinterIndex].printerID;
        selectorHTML += "<tr id=\"" + printerID + "_row" + "\" class=\"ui-link\">";
        selectorHTML += "<th id=\"" + printerID + nameDisplayTag + "\"></th>";
        selectorHTML += "<td id=\"" + printerID + statusDisplayTag + "\"></td>";
        selectorHTML += "<td id=\"" + printerID + etcDisplayTag + "\"></td>";
        selectorHTML += "<td id=\"" + printerID + jobDisplayTag + "\"></td>";
        selectorHTML += "<td id=\"" + printerID + materialDisplayTag + "1\"></td>";
        selectorHTML += "<td id=\"" + printerID + materialDisplayTag + "2\"></td>";
        selectorHTML += "</tr>\n";
    }

    $("#printer-status-body").html(selectorHTML);
    $("#printer-status").table("refresh");
    for (var connPrinterIndex = 0; connPrinterIndex < connectedPrinters.length; connPrinterIndex++)
    {
        var printerID = connectedPrinters[connPrinterIndex].printerID;
        $('#' + printerID + "_row").data("printerID", printerID);
        $('#' + printerID + "_row").click(function () {
            selectPrinter($(this).data("printerID"));
        });
    }
}

function updatePrinterStatuses()
{

    for (var printerIndex = 0; printerIndex < connectedPrinterIDs.length; printerIndex++)
    {
        $("#no-printers-connected-text").hide();
        var printerID = connectedPrinterIDs[printerIndex];
        updateAndDisplayPrinterStatus(printerID);
    }

    if (connectedPrinterIDs.length === 0)
    {
        $("#no-printers-connected-text").show();
        $(".numberOfPrintersDisplay").text("No Robox attached");
    } else
    {
        $(".numberOfPrintersDisplay").text(connectedPrinterIDs.length.valueOf() + " Robox attached");
    }
}

function updateServerStatus(serverData)
{
    if (serverData === null)
    {
        $('#serverVersion').text("");
        $(".serverStatusLine").text("");
        $(".server-name-title").text("");
        $("#server-name-input").val("");
        $(".server-ip-address").val("");
    } else
    {
        $('#serverVersion').text('Server version: ' + serverData.serverVersion);
        $(".serverStatusLine").text(serverData.name);
        $(".server-name-title").text(serverData.name);
        $("#server-name-input").val(serverData.name);
        $(".server-ip-address").text(serverData.serverIP);
    }
}

function getServerStatus()
{
    sendGetCommandToRoot('discovery/whoareyou',
            function (data) {
                $('#serverOnline').text('Server ONLINE');
                updateServerStatus(data);
                connectedToServer = true;
            },
            function (data) {
                connectedToServer = false;
                $('#serverOnline').text('Server OFFLINE');
                removeAllPrinterTabs();
                updateServerStatus(null);
            },
            null);
}

function getPrinters()
{
    sendGetCommandToRoot('discovery/listPrinters',
            function (data) {
                processAddedAndRemovedPrinters(data.printerIDs);
                updatePrinterStatuses();
                connectedToServer = true;
            },
            function (data) {
                connectedToServer = false;
                $('#serverOnline').text('Server OFFLINE');
                removeAllPrinterTabs();
                logout();
            },
            null);
}

function getStatus()
{
    if (!connectedToServer)
    {
        getServerStatus();
    } else
    {
        getPrinters();
    }
}

function safetiesOn()
{
    var safetyStatus = $("#safeties-switch").prop("checked") ? true : false;
    return safetyStatus;
}

function enableWifi(state)
{
    sendPostCommandToRoot("admin/enableDisableWifi", null, null, state);
}

function setWiFiCredentials()
{
    sendPostCommandToRoot("admin/setWiFiCredentials", null, null, $("#wifi-ssid").val() + ":" + $("#wifi-password").val());
}

function updateCurrentWifiState()
{
    sendPostCommandToRoot("admin/getCurrentWifiState",
            function (data) {
                if (data.power == "on")
                {
                    $("#wifi-enabled-switch").val("true")
                    $("#wifi-data-block").removeClass("visuallyhidden");
                    if (data.associated == "yes")
                    {
                        $("#wifi-ssid").val(data.ssid);
                    } else
                    {
                        $("#wifi-ssid").val("Not associated");
                    }
                } else
                {
                    $("#wifi-enabled-switch").val("false")
                    $("#wifi-ssid").val("");
                    $("#wifi-data-block").addClass("visuallyhidden");
                }
            },
            null,
            null);
}

function updateLocalisation()
{
    $('language-label').localize();
}

function selectPrinter(printerID)
{
    selectedPrinterID = printerID;
    lastPrinterData = null;
    updateAndDisplayPrinterStatus(selectedPrinterID);
    $("#printer-details-panel").panel("open");
}

$(document).ready(function ()
{
    i18next.use(i18nextXHRBackend).init({
        debug: true,
        fallbackLng: 'en',
        backend: {
            loadPath: '/locales/{{lng}}/translation.json'
        }
    }, function (t) {
        jqueryI18next.init(i18next, $, {
            tName: 't', // --> appends $.t = i18next.t
            i18nName: 'i18n', // --> appends $.i18n = i18next
            handleName: 'localize', // --> appends $(selector).localize(opts);
            selectorAttr: 'data-i18n', // selector for translating elements
            targetAttr: 'i18n-target', // data-() attribute to grab target element to translate (if diffrent then itself)
            optionsAttr: 'i18n-options', // data-() attribute that contains options, will load/set if useOptionsAttr = true
            useOptionsAttr: false, // see optionsAttr
            parseDefaultValueFromContent: true // parses default values from content ele.val or ele.text
        });
        updateLocalisation();
    });

    checkForMobileBrowser();
    updateCurrentWifiState();
    $("#wifi-enabled-switch").change(function () {
        enableWifi($("#wifi-enabled-switch").val());
        setTimeout(function () {
            updateCurrentWifiState();
        }, 3000);
    });
    $("#pin-update-value").val(localStorage.getItem(applicationPINVar));
    getServerStatus()
    getPrinters();
    setInterval(getStatus, 2000);
    $('#printerTabs').tabs({
        active: 1
    });
    refreshStatusTable();
}
);