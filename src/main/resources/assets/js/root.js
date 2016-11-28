var connectedToServer = false;
var isMobile = false; //initiate as false
var connectedPrinterIDs = new Array();
var connectedPrinters = new Array();

var statusDisplayTag = "_statusDisplay";
var etcRowTag = "_etcRow";
var etcDisplayTag = "_etcDisplay";
var headNameDisplayTag = "_headNameDisplay";
var bedTemperatureDisplayTag = "_bedTemperatureDisplay";
var materialRowTag = "_materialRow";
var materialDisplayTag = "_materialDisplay";
var materialEjectButtonTag = "_materialEjectButton";
var nozzleTemperatureRowTag = "_nozzleTemperatureRow";
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
}

function addPrinter(printerID)
{
    connectedPrinterIDs.push(printerID);

    getPrinterStatus(printerID, function (data) {
        connectedPrinters.push(null);
        addCollapsible(printerID);
    });
}

function deletePrinter(printerID)
{
    var indexToDelete = connectedPrinterIDs.indexOf(printerID);

    connectedPrinterIDs.splice(indexToDelete, 1);
    connectedPrinters.splice(indexToDelete, 1);
    removeCollapsible(printerID);
}

function createPrinterDataTable(printerID)
{
    var printerStatusTable = "<table data-role=\"table\" data-mode=\"reflow\" class=\"status-table ui-responsive\"> \
    <thead> \
  <tr> \
    <th data-priority=\"1\"></th>\
    <th data-priority=\"2\"></th>\
  </tr> \
  </thead> \
  <tbody> \
  <tr id='" + printerID
            + etcRowTag + "'>\
    <td class=\"title\">Estimated Time to Complete Print</td>\
    <td id='" + printerID
            + etcDisplayTag + "'>?</td>\
  </tr>\
  <tr>\
    <td class=\"title\">Head</td>\
    <td id='"
            + printerID
            + headNameDisplayTag + "'>?</td>\
  </tr>\
    <tr id='" + printerID + nozzleTemperatureRowTag + "1'>\
    <td class=\"title\">Nozzle 1 Temperature</td>\
    <td id='" + printerID + nozzleTemperatureDisplayTag + "1'></td>\
  </tr>\
    <tr id='" + printerID + nozzleTemperatureRowTag + "2'>\
    <td class=\"title\">Nozzle 2 Temperature</td>\
    <td id='" + printerID + nozzleTemperatureDisplayTag + "2'></td>\
  </tr>\
    <tr>\
    <td class=\"title\">Bed Temperature</td>\
    <td id='" + printerID + bedTemperatureDisplayTag + "'></td>\
  </tr>\
    <tr id='" + printerID + materialRowTag + "1'>\
    <td class=\"title\">Material 1</td>\
    <td style=\"vertical-align:middle\">\
    <div style=\"display: inline\">\
    <button id='" + printerID
            + materialEjectButtonTag
            + "1'\
       class=\"align-right ui-shadow ui-btn ui-corner-all ui-mini ui-btn-inline\" \
       onClick=\"eject(\'" + printerID + "\', \'1\')\">Eject</button>\
    <span id='" + printerID
            + materialDisplayTag
            + "1'></span> \
    </div>\
</td>\
  </tr>\
    <tr id='" + printerID + materialRowTag + "2'>\
    <td class=\"title\">Material 2</td>\
    <td style=\"vertical-align:middle\">\
    <div style=\"display: inline\">\
    <button id='" + printerID
            + materialEjectButtonTag
            + "2'\
       class=\"align-right ui-shadow ui-btn ui-corner-all ui-mini ui-btn-inline\" \
       onClick=\"eject(\'" + printerID + "\', \'2\')\">Eject</button>\
    <span id='" + printerID
            + materialDisplayTag
            + "2'></span> \
    </div>\
</td>\
  </tr>\
  <tr id='" + printerID
            + errorRowTag
            + "'>\
    <td class=\"title\">Errors</td>\
    <td id='" + printerID
            + errorDisplayTag
            + "'></td>\
  </tr>";

    printerStatusTable += "</tbody></table>";

    return printerStatusTable;
}

function addCollapsible(tab_name)
{
    var newCollapsible = "<div id=\"printerCollapsible_" + tab_name + "\" data-role=\"collapsible\">"
            + "<h4 id=\"printerTabTop_" + tab_name + "\">" + tab_name + "</h4>"
            + "<div id='printerTab_" + tab_name + "'>"
            + createPrinterDataTable(tab_name)
            + "<hr>"
            + "<p>Printer Controls</p>"
            + "<div id='printerTabButtons_" + tab_name + "'/>"
            + "</div></div></div>";

    $("#printerTabs").append(newCollapsible).collapsibleset('refresh');
}

function removeCollapsible(tab_name)
{
    $('#printerCollapsible_' + tab_name).remove();
    $("#printerTabs").append(content).collapsibleset('refresh');
}

function removeAllPrinterTabs()
{
    connectedPrinterIDs.forEach(function (connectedPrinter) {
        console.log("Deleting printer  " + connectedPrinter);
        deletePrinter(connectedPrinter);
    });
}

function conditionallyCreateButton(createButton, divToAddButtonTo, buttonText, onClickFunction, printerID)
{
    if (createButton)
    {
        divToAddButtonTo.append('<button class="ui-shadow ui-btn ui-corner-all ui-mini ui-btn-inline" onClick="'
                + onClickFunction.name + '(\'' + printerID + '\')">'
                + buttonText
                + '</button>');
    }
}

function printGCodeFile(printerID)
{
    var data = new FormData($('#fileInput_' + printerID).val());
    var base64EncodedCredentials = $.base64.encode(defaultUser + ":" + localStorage.getItem(applicationPINVar));
    jQuery.ajax({
        url: 'http://' + hostname + ':' + port + '/api/' + printerID + '/remoteControl/upload/',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + base64EncodedCredentials);
        },
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        success: function (data) {
            alert(data);
        }
    });
}

function openDoor(printerID)
{
    postCommandToPrinter(printerID, "openDoor", null, safetiesOn().toString());
}

function pausePrint(printerID)
{
    postCommandToPrinter(printerID, "pause", null, null);
}

function resumePrint(printerID)
{
    postCommandToPrinter(printerID, "resume", null, null);
}

function cancelPrint(printerID)
{
    postCommandToPrinter(printerID, "cancel", null, null);
}

function removeHead(printerID)
{
    postCommandToPrinter(printerID, "removeHead", null, null);
}

function purgeHead(printerID)
{
    postCommandToPrinter(printerID, "purge", null, safetiesOn().toString());
}

function eject(printerID, materialNumber)
{
    postCommandToPrinter(printerID, "ejectFilament", null, materialNumber);
}

function configurePrinterButtons(printerID, printerData)
{
    var lastPrinterData = connectedPrinters[connectedPrinterIDs.indexOf(printerID)];

    if (lastPrinterData === null
            || printerData.canPause !== lastPrinterData.canPause
            || printerData.canResume !== lastPrinterData.canResume
            || printerData.canRemoveHead !== lastPrinterData.canRemoveHead
            || printerData.canOpenDoor !== lastPrinterData.canOpenDoor
            || printerData.canCancel !== lastPrinterData.canCancel
            || printerData.canCalibrateHead !== lastPrinterData.canCalibrateHead
            || printerData.canPurgeHead !== lastPrinterData.canPurgeHead)
    {
        $("div#printerTabButtons_" + printerID).empty();

        conditionallyCreateButton(printerData.canPause, $("div#printerTabButtons_" + printerID), "Pause", pausePrint, printerID);
        conditionallyCreateButton(printerData.canResume, $("div#printerTabButtons_" + printerID), "Resume", resumePrint, printerID);
        conditionallyCreateButton(printerData.canCancel, $("div#printerTabButtons_" + printerID), "Cancel", cancelPrint, printerID);
        conditionallyCreateButton(printerData.canOpenDoor, $("div#printerTabButtons_" + printerID), "Open Door", openDoor, printerID);
        conditionallyCreateButton(printerData.canRemoveHead, $("div#printerTabButtons_" + printerID), "Remove Head", removeHead, printerID);
        conditionallyCreateButton(printerData.canPurgeHead, $("div#printerTabButtons_" + printerID), "Purge Head", purgeHead, printerID);

        if (!isMobile && printerData.canPrint)
        {
            $("div#printerTabButtons_" + printerID).append('<form id="fileUpload_' + printerID + '" enctype="multipart/form-data">'
                    + '<input type="submit" value="Send GCode to printer">'
                    + '<input id="fileInput_' + printerID + '" type="file" name="file" required/></form>');

            $('#fileUpload_' + printerID).submit(function (event) {
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

                return false;
            });
        }
    }
}

function updatePIN()
{
    var printerURL = "http://" + hostname + ":" + port + "/api/admin/updatePIN/";
    var base64EncodedCredentials = $.base64.encode(defaultUser + ":" + localStorage.getItem(applicationPINVar));

    $.ajax({
        url: printerURL,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + base64EncodedCredentials);
        },
        cache: false,
        processData: false,
        contentType: "application/json", // send as JSON
        type: 'POST',
        data: $("#pin-update-value").val()
    }).done(function () {
        logout();
    });
}
function rootRename()
{
    var printerURL = "http://" + hostname + ":" + port + "/api/admin/setServerName/";
    var base64EncodedCredentials = $.base64.encode(defaultUser + ":" + localStorage.getItem(applicationPINVar));

    $.ajax({
        url: printerURL,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + base64EncodedCredentials);
        },
        cache: false,
        processData: false,
        contentType: "application/json", // send as JSON
        type: 'POST',
        data: $("#server-name-input").val()
    }).done(function () {
        getServerStatus();
    });
}

function rootUpgrade()
{
    event.preventDefault();
    var formData = new FormData($('#rootUpgrade')[0]);
    var base64EncodedCredentials = $.base64.encode(defaultUser + ":" + localStorage.getItem(applicationPINVar));

    $.ajax({
        url: 'http://' + hostname + ':' + port + '/api/updateSystem/',
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
    }
    else if (minutes > 0)
    {
        return minutes + ":" + seconds;
    }
    else
    {
        return seconds + " seconds";
    }
}

function updateAndDisplayPrinterStatus(printerID)
{
    getPrinterStatus(printerID, function (printerData) {
        var statusText = printerData.printerStatusString;

        if (printerData.printerStatusString.match("^Printing"))
        {
            statusText += " " + printerData.printJobName;
            $('#printerTab_' + printerID).find('#' + printerID + etcRowTag).show();
            $('#printerTab_' + printerID).find('#' + printerID + etcDisplayTag).text(secondsToHMS(printerData.etcSeconds));
        }
        else
        {
            $('#printerTab_' + printerID).find('#' + printerID + etcRowTag).hide();
        }

        $('#printerTabTop_' + printerID + " a").text(printerData.printerName + " - " + statusText);
        $('#printerTabTop_' + printerID + " a").css("background-color", printerData.printerWebColourString);

        $('#printerTab_' + printerID).find('#' + printerID + headNameDisplayTag).text(printerData.headName);

        $('#printerTab_' + printerID).find('#' + printerID + bedTemperatureDisplayTag).text(printerData.bedTemperature + '\xB0' + "C");

        for (var nozzleNum = 1; nozzleNum <= printerData.nozzleTemperature.length; nozzleNum++)
        {
            $('#printerTab_' + printerID).find('#' + printerID + nozzleTemperatureDisplayTag + nozzleNum).text(printerData.nozzleTemperature[nozzleNum - 1] + '\xB0' + "C");
        }

        var numberOfNozzleHeaters = 0;
        if (printerData.nozzleTemperature !== null)
        {
            numberOfNozzleHeaters = printerData.nozzleTemperature.length;
        }

        switch (numberOfNozzleHeaters)
        {
            case 0:
                $('#printerTab_' + printerID).find('#' + printerID + nozzleTemperatureRowTag + '1').hide();
                $('#printerTab_' + printerID).find('#' + printerID + nozzleTemperatureRowTag + '2').hide();
                break;
            case 1:
                $('#printerTab_' + printerID).find('#' + printerID + nozzleTemperatureRowTag + '1').show();
                $('#printerTab_' + printerID).find('#' + printerID + nozzleTemperatureRowTag + '2').hide();
                break;
            case 2:
                $('#printerTab_' + printerID).find('#' + printerID + nozzleTemperatureRowTag + '1').show();
                $('#printerTab_' + printerID).find('#' + printerID + nozzleTemperatureRowTag + '2').show();
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
                }
                else
                {
                    filamentNameOutput += " - loaded";
                }
            }
            else
            {
                if (printerData.materialLoaded[materialNum - 1])
                {
                    filamentNameOutput = "Unknown - loaded";
                }
                else
                {
                    showEjectButton = false;
                }
            }

            if (showEjectButton)
            {
                $('#printerTab_' + printerID).find('#' + printerID + materialEjectButtonTag + materialNum).show();
            }
            else
            {
                $('#printerTab_' + printerID).find('#' + printerID + materialEjectButtonTag + materialNum).hide();
            }
            $('#printerTab_' + printerID).find('#' + printerID + materialDisplayTag + materialNum).text(filamentNameOutput);
        }

        var numberOfMaterials = 0;
        if (printerData.attachedFilamentNames !== null)
        {
            numberOfMaterials = printerData.attachedFilamentNames.length;
        }

        switch (numberOfMaterials)
        {
            case 0:
                $('#printerTab_' + printerID).find('#' + printerID + materialRowTag + '1').hide();
                $('#printerTab_' + printerID).find('#' + printerID + materialRowTag + '2').hide();
                break;
            case 1:
                $('#printerTab_' + printerID).find('#' + printerID + materialRowTag + '1').show();
                $('#printerTab_' + printerID).find('#' + printerID + materialRowTag + '2').hide();
                break;
            case 2:
                $('#printerTab_' + printerID).find('#' + printerID + materialRowTag + '1').show();
                $('#printerTab_' + printerID).find('#' + printerID + materialRowTag + '2').show();
                break;
        }

        if (printerData.activeErrors !== null)
        {
            var allErrors;
            for (var errorNum = 0; errorNum < printerData.activeErrors.length; errorNum++)
            {
                allErrors += errorString + '\n';
            }
            $('#printerTab_' + printerID).find('#' + printerID + errorDisplayTag).text(allErrors);
            $('#printerTab_' + printerID).find('#' + printerID + errorRowTag).show();
        }
        else
        {
            $('#printerTab_' + printerID).find('#' + printerID + errorRowTag).hide();
        }

        configurePrinterButtons(printerID, printerData);

        connectedPrinters.splice(connectedPrinterIDs.indexOf(printerID), 1, printerData);
    });
}

function postCommandToPrinter(printerID, service, successCallback, dataToSend)
{
    var printerURL = "http://" + hostname + ":" + port + "/api/" + printerID + "/remoteControl/" + service;
    var base64EncodedCredentials = $.base64.encode(defaultUser + ":" + localStorage.getItem(applicationPINVar));

    $.ajax({
        url: printerURL,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + base64EncodedCredentials);
        },
        dataType: "xml/html/script/json", // expected format for response
        contentType: "application/json", // send as JSON
        type: 'POST',
        data: JSON.stringify(dataToSend)
    }).done(function (data)
    {
        if (successCallback !== null)
        {
            successCallback(data);
        }
    }).complete();
}

function postCommandToRoot(service, successCallback, dataToSend)
{
    var printerURL = "http://" + hostname + ":" + port + "/api/" + service + "/";
    var base64EncodedCredentials = $.base64.encode(defaultUser + ":" + localStorage.getItem(applicationPINVar));

    $.ajax({
        url: printerURL,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + base64EncodedCredentials);
        },
        dataType: "xml/html/script/json", // expected format for response
        contentType: "application/json", // send as JSON
        type: 'POST',
        data: JSON.stringify(dataToSend)
    }).done(function (data)
    {
        if (successCallback !== null)
        {
            successCallback(data);
        }
    }).complete();
}

function getPrinterStatus(printerID, callback)
{
    var printerURL = "http://" + hostname + ":" + port + "/api/" + printerID + "/remoteControl";
    var base64EncodedCredentials = $.base64.encode(defaultUser + ":" + localStorage.getItem(applicationPINVar));

    $.ajax({
        url: printerURL,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + base64EncodedCredentials);
        },
        dataType: 'json',
        type: 'GET',
    }).done(function (data)
    {
        callback(data);
    }).complete();
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
    }
    else
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
    }
    else
    {
        $('#serverVersion').text('Server version: ' + serverData.serverVersion);
        $(".serverStatusLine").text(serverData.name);
        $(".server-name-title").text(serverData.name);
        $("#server-name-input").val(serverData.name);
        $(".server-ip-address").text(hostname);
    }
}

function getServerStatus()
{
    var base64EncodedCredentials = $.base64.encode(defaultUser + ":" + localStorage.getItem(applicationPINVar));

    $.ajax({
        url: 'http://' + hostname + ':' + port + '/api/discovery/whoareyou',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + base64EncodedCredentials);
        },
        dataType: 'json',
        type: 'GET',
        success: function (data, textStatus, jqXHR) {
            $('#serverOnline').text('Server ONLINE');
            updateServerStatus(data);
            connectedToServer = true;
        },
        error: function (xhr, ajaxOptions, thrownError) {
            connectedToServer = false;
            $('#serverOnline').text('Server OFFLINE');
            removeAllPrinterTabs();
            updateServerStatus(null);
        }
    });
}

function getPrinters()
{
    var base64EncodedCredentials = $.base64.encode(defaultUser + ":" + localStorage.getItem(applicationPINVar));

    $.ajax({
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + base64EncodedCredentials);
        },
        url: 'http://' + hostname + ':' + port + '/api/discovery/listPrinters',
        dataType: 'json',
        type: 'GET',
        success: function (data, textStatus, jqXHR) {
            processAddedAndRemovedPrinters(data.printerIDs);
            updatePrinterStatuses();
            connectedToServer = true;
        },
        error: function (xhr, ajaxOptions, thrownError) {
            connectedToServer = false;
            $('#serverOnline').text('Server OFFLINE');
            removeAllPrinterTabs();
            logout();
        }
    });
}

function getStatus()
{
    if (!connectedToServer)
    {
        getServerStatus();
    }
    else
    {
        getPrinters();
    }
}

function safetiesOn()
{
    var safetyStatus = $("#safeties-switch").prop("checked") ? true : false;

    return safetyStatus;
}

function testWiFiConnection()
{
    postCommandToRoot("admin/testWiFiConnection", null, null);
}

function setWiFiCredentials()
{
    postCommandToRoot("admin/setWiFiCredentials", null, $("#wifi-ssid").val() + ":" + $("#wifi-password").val());
}

$(document).ready(function ()
{
    checkForMobileBrowser();

    $("#pin-update-value").val(localStorage.getItem(applicationPINVar));
    
    getServerStatus()
    getPrinters();

    setInterval(getStatus, 2000);
    $('#printerTabs').tabs({
        active: 1
    });
});