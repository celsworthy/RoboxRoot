var hostname = window.location.hostname;
var port = 8080;
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
    jQuery.ajax({
        url: 'http://' + hostname + ':' + port + '/api/' + printerID + '/remoteControl/upload/',
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
    postCommandToRoot(printerID, "openDoor", null, safetiesOn().toString());
}

function pausePrint(printerID)
{
    postCommandToRoot(printerID, "pause", null, null);
}

function resumePrint(printerID)
{
    postCommandToRoot(printerID, "resume", null, null);
}

function cancelPrint(printerID)
{
    postCommandToRoot(printerID, "cancel", null, null);
}

function removeHead(printerID)
{
    postCommandToRoot(printerID, "removeHead", null, null);
}

function purgeHead(printerID)
{
    postCommandToRoot(printerID, "purge", null, safetiesOn().toString());
}

function eject(printerID, materialNumber)
{
    postCommandToRoot(printerID, "ejectFilament", null, materialNumber);
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

                $.ajax({
                    url: 'http://' + hostname + ':' + port + '/api/' + printerID + '/remoteControl/printGCodeFile/',
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

function rootUpgrade()
{
    event.preventDefault();
    var formData = new FormData($('#rootUpgrade')[0]);

    $.ajax({
        url: 'http://' + hostname + ':' + port + '/api/updateSystem/',
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

function postCommandToRoot(printerID, service, successCallback, dataToSend)
{
    var printerURL = "http://" + hostname + ":" + port + "/api/" + printerID + "/remoteControl/" + service;
    $.ajax({
        url: printerURL,
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
    $.ajax({
        url: printerURL,
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
    }
    else
    {
        $('#serverVersion').text('Server version: ' + serverData.serverVersion);
        $(".serverStatusLine").text(serverData.name);
        $(".server-name-title").text(serverData.name);
    }
}

function getServerStatus()
{
    $.ajax({
        url: 'http://' + hostname + ':' + port + '/api/discovery/whoareyou',
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
    $.ajax({
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

$(document).ready(function () {
    // device detection
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4)))
    {
        isMobile = true;
    }

    getServerStatus();
    setInterval(getStatus, 2000);
    $('#printerTabs').tabs({
        active: 1
    });
});