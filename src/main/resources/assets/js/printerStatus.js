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
var progressDisplayTag = "_progressDisplay";
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
        createPrinterSelector();
    }

    return printerListChanged;
}

function addPrinter(printerID)
{
    connectedPrinterIDs.push(printerID);
//    getPrinterStatus(printerID, function (data) {
//        connectedPrinters.push(data);
//    });
}

function deletePrinter(printerID)
{
    var indexToDelete = connectedPrinterIDs.indexOf(printerID);
    connectedPrinterIDs.splice(indexToDelete, 1);
    connectedPrinters.splice(indexToDelete, 1);
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
        $('#' + printerData.printerID + controlsDisplayTag).append("<a class='btn no-padding' onclick='pausePressed($(this))' data-printerid='" + printerData.printerID + "'><img class='img-fluid root-icon' alt='Pause' src='robox-images/pause.png'></a>");
    } else if (printerData.canResume)
    {
        $('#' + printerData.printerID + controlsDisplayTag).append("<a class='btn no-padding' onclick='resumePressed($(this))' data-printerid='" + printerData.printerID + "'><img class='img-fluid root-icon' alt='Pause' src='robox-images/resume.png'></a>");
    }
    if (printerData.canCancel)
    {
        $('#' + printerData.printerID + controlsDisplayTag).append("<a class='btn no-padding' onclick='cancelPressed($(this))' data-printerid='" + printerData.printerID + "'><img class='img-fluid root-icon' alt='Pause' src='robox-images/cancel.png'></a>");
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
        if ((printerData.printerStatusEnumValue.match("^PRINTING_PROJECT")
                || printerData.printerStatusEnumValue.match("^PAUSED")
                || printerData.printerStatusEnumValue.match("^PAUSE_PENDING")
                || printerData.printerStatusEnumValue.match("^RESUME_PENDING"))
                && printerData.totalDurationSeconds > 0)
        {
            var timeElapsed = printerData.totalDurationSeconds - printerData.etcSeconds;
            if (timeElapsed < 0)
            {
                timeElapsed = 0;
            }
            var progressPercent = (timeElapsed * 1.0 / printerData.totalDurationSeconds) * 100;
            $('#' + printerID + progressDisplayTag).css("width", progressPercent + "%");
        } else
        {
            $('#' + printerID + progressDisplayTag).css("width", "0%");
        }
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

function createPrinterSelector()
{
    var selectorHTML = "";
    for (var connectedPrinterIndex = 0; connectedPrinterIndex < connectedPrinterIDs.length; connectedPrinterIndex++)
    {
        var printerID = connectedPrinterIDs[connectedPrinterIndex];
        selectorHTML += "<div class='status-row no-margin' id=\"" + printerID + "_row\">";
        selectorHTML += "<div class='status-line no-padding no-margin' style='width: 5%;' id=\"" + printerID + colourDisplayTag + "\"></div>";
        selectorHTML += "<span class='status-line status-line-text no-margin' style='width: 45%;' id=\"" + printerID + nameDisplayTag + "\"></span>";
        selectorHTML += "<span class='status-line status-line-text no-margin' style='width: 22%;' id=\"" + printerID + statusDisplayTag + "\"></span>";
        selectorHTML += "<div class='status-line no-padding' style='width: 28%;' id=\"" + printerID + controlsDisplayTag + "\"></div>";
        selectorHTML += "</div>";
        selectorHTML += "<div class='no-margin progress-row'>";
        selectorHTML += "<div class='progress'>";
        selectorHTML += "<div id=\"" + printerID + progressDisplayTag + "\" class='progress-bar' role='progressbar'";
        selectorHTML += "aria-valuemin='0' aria-valuemax='100' style='width:0%'>";
        selectorHTML += "</div>";
        selectorHTML += "</div>";
        selectorHTML += "</div>";
    }

    $("#status-area").html(selectorHTML);

    for (var connPrinterIndex = 0; connPrinterIndex < connectedPrinterIDs.length; connPrinterIndex++)
    {
        var printerID = connectedPrinterIDs[connPrinterIndex];
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
        localStorage.setItem(serverNameVar, "");
    } else
    {
        $('#serverVersion').text(serverData.serverVersion);
        $(".serverStatusLine").text(serverData.name);
        $(".server-name-title").text(serverData.name);
        $("#server-name-input").val(serverData.name);
        $(".server-ip-address").text(serverData.serverIP);
        localStorage.setItem(serverNameVar, serverData.name);
    }
}

function serverOffline()
{
    removeAllPrinterTabs();
}

function getStatus()
{
    getServerStatus();
    getPrinters();
}

//$(document).on("pageinit", "#server-status-page", function () {
//    $('div[data-role="tabs"] [data-role="navbar"] a').click(function (e) {
//        e.preventDefault();
//        $('div[data-role="tabs"] [data-role="navbar"] .ui-btn-active').removeClass('ui-btn-active ui-state-persist');
//        $(this).addClass('ui-btn-active ui-state-persist');
//    });
//});

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

    $("#pin-update-value").val(localStorage.getItem(applicationPINVar));

    getServerStatus();
    getPrinters();
    setInterval(getStatus, 2000);
}