var connectedToServer = false;
var isMobile = false; //initiate as false
var connectedPrinterIDs = new Array();
var connectedPrinters = new Array();
var lastPrinterData = null;
var selectedPrinterID = null;
var colourDisplayTag = "_colourDisplay";
var nameDisplayTag = "_nameDisplay";
var statusDisplayTag = "_statusDisplay";
var controlsDisplayTag = "_controlsDisplay";
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

function pausePressed(caller)
{
    sendPostCommandToRoot(caller.data("printerid") + "/remoteControl/pause", null, null, null);
}

function resumePressed(caller)
{
    sendPostCommandToRoot(caller.data("printerid") + "/remoteControl/resume", null, null, null);
}

function cancelPressed(caller)
{
    sendPostCommandToRoot(caller.data("printerid") + "/remoteControl/cancel", null, null, null);
}

function updateControlButtons(printerData)
{
    $('#' + printerData.printerID + controlsDisplayTag).html("");
    if (printerData.canPause)
    {
        $('#' + printerData.printerID + controlsDisplayTag).append("<button type='button' class='btn btn-default' onclick='pausePressed($(this))' data-printerid='" + printerData.printerID + "'><span class='glyphicon glyphicon-pause'></span></button>");
    } else if (printerData.canResume)
    {
        $('#' + printerData.printerID + controlsDisplayTag).append("<button type='button' class='btn btn-default' onclick='resumePressed($(this))' data-printerid='" + printerData.printerID + "'><span class='glyphicon glyphicon-play'></span></button>");
    }
    if (printerData.canCancel)
    {
        $('#' + printerData.printerID + controlsDisplayTag).append("<button type='button' class='btn btn-default' onclick='stopPressed($(this))' data-printerid='" + printerData.printerID + "'><span class='glyphicon glyphicon-stop'></span></button>");
    }
}

function updateAndDisplayPrinterStatus(printerID)
{
    getPrinterStatus(printerID, function (printerData)
    {
        var statusText = printerData.printerStatusString;
        $('#' + printerID + nameDisplayTag).text(printerData.printerName);
        $('#' + printerID + statusDisplayTag).text(statusText);
        $('#' + printerID + colourDisplayTag).css("background-color", printerData.printerWebColourString);
        updateControlButtons(printerData);
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
        selectorHTML += "<tr id=\"" + printerID + "_row" + "\" class=\"printer-selector\">";
        selectorHTML += "<td id=\"" + printerID + colourDisplayTag + "\" class=\"printer-selector\"></th>";
        selectorHTML += "<td id=\"" + printerID + nameDisplayTag + "\" class=\"printer-selector\"></th>";
        selectorHTML += "<td id=\"" + printerID + statusDisplayTag + "\" class=\"printer-selector\"></td>";
        selectorHTML += "<td id=\"" + printerID + controlsDisplayTag + "\" class=\"printer-selector\"></td>";
        selectorHTML += "</tr>\n";
    }

    $("#printer-status-body").html(selectorHTML);
    for (var connPrinterIndex = 0; connPrinterIndex < connectedPrinters.length; connPrinterIndex++)
    {
        var printerID = connectedPrinters[connPrinterIndex].printerID;
        $('#' + printerID + "_row").data("printerID", printerID);

        $('#' + printerID + colourDisplayTag).data("printerID", printerID);
        $('#' + printerID + colourDisplayTag).click(function () {
            selectPrinter($(this).data("printerID"));
        });

        $('#' + printerID + nameDisplayTag).data("printerID", printerID);
        $('#' + printerID + nameDisplayTag).click(function () {
            selectPrinter($(this).data("printerID"));
        });

        $('#' + printerID + statusDisplayTag).data("printerID", printerID);
        $('#' + printerID + statusDisplayTag).click(function () {
            selectPrinter($(this).data("printerID"));
        });
        $('#' + printerID + "_row").hover(function () {
            $(this).addClass('selector-highlight');
        }, function () {
            $(this).removeClass('selector-highlight');
        });
        $('#' + printerID + "_row").mousedown(function () {
            $(this).addClass('selector-press');
        }, function () {
            $(this).removeClass('selector-press');
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
        $(".numberOfPrintersDisplay").text(i18next.t("no") + " " + i18next.t("robox-attached"));
    } else
    {
        $(".numberOfPrintersDisplay").text(connectedPrinterIDs.length.valueOf() + " " + i18next.t("robox-attached"));
    }
}

function getServerStatus()
{
    sendGetCommandToRoot('discovery/whoareyou',
            function (data) {
                $('#serverOnline').text(i18next.t('online'));
                updateServerStatus(data);
                connectedToServer = true;
            },
            function (data) {
                connectedToServer = false;
                $('#serverOnline').text(i18next.t('offline'));
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

function selectPrinter(printerID)
{
    selectedPrinterID = printerID;
    lastPrinterData = null;
    localStorage.setItem(selectedPrinterVar, printerID);
    window.location.href = "printerDetails.html";
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
        $('#serverVersion').text(serverData.serverVersion);
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
                $('#serverOnline').text(i18next.t('online'));
                updateServerStatus(data);
                connectedToServer = true;
            },
            function (data) {
                connectedToServer = false;
                $('#serverOnline').text(i18next.t('offline'));
                removeAllPrinterTabs();
                updateServerStatus(null);
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
                if (data.poweredOn === true)
                {
                    $("#wifi-enabled-switch").val("true")
                    $("#wifi-data-block").removeClass("visuallyhidden");
                    if (data.associated === true)
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

$(document).on("pageinit", "#server-status-page", function () {
    $('div[data-role="tabs"] [data-role="navbar"] a').click(function (e) {
        e.preventDefault();
        $('div[data-role="tabs"] [data-role="navbar"] .ui-btn-active').removeClass('ui-btn-active ui-state-persist');
        $(this).addClass('ui-btn-active ui-state-persist');
    });
});

function page_initialiser()
{
    $('#printer-select').change(function () {
        var optionSelected = $(this).find('option:selected');
        var optValueSelected = optionSelected.val();
        if (optValueSelected)
        {
            selectPrinter(optValueSelected);
        }
    });

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
}