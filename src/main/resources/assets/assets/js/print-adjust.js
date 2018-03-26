function setSpinnerData(spinner, value, delta)
{
    var minValue = value - delta;
    var maxValue = value + delta;
    $(spinner).val(value.toFixed(0))
              .attr({'min':minValue.toFixed(0), 'max':maxValue.toFixed(0)});
}

function reportPAError(data)
{
    alert("Failed to set print adjust data");
    setupPrintAdjustPage();
}

function setPrintAdjustData(n, t, v)
{
    var data = {'name': n,
                'tag': t,
                'value': v};
    var selectedPrinter = localStorage.getItem(selectedPrinterVar);
    promisePostCommandToRoot(selectedPrinter + "/remoteControl/setParamTarget", data)
        .then(setupPrintAdjustPage)
        .catch(reportPAError);
}

function printSpeedChanged(id, value)
{
    setPrintAdjustData("printSpeed",
                       $('#' + id).attr("nozzle"),
                       value);
}

function flowRateChanged(id, value)
{
    setPrintAdjustData("flowRate", $("#" + id).attr("nozzle"), value);
}

function nozzleTempChanged(id, value)
{
    setPrintAdjustData("temp", $("#" + id).attr("nozzle"), value);
}

function bedTempChanged(id, value)
{
    setPrintAdjustData("temp", "bed", value);
}

function updatePrintAdjustData(paData)
{
    setSpinnerData('#pa-bed-temp', paData.bedTargetTemp, 15.0);
    
    if (paData.usingMaterial0)
    //if (true)
    {
        $('#pa-material-1').removeClass("hidden");
        $('#pa-material-1-name').html(paData.material0Name);
        setSpinnerData('#pa-print-speed-1', paData.extrusionRate0Multiplier, 100.0);
        setSpinnerData('#pa-flow-rate-1', paData.flowRate0Multiplier, 100.0);
        setSpinnerData('#pa-temp-1', paData.nozzle0TargetTemp, 15.0);
    }
    else
    {
        $('#pa-material-1').addClass("hidden");
    }
    
    if (paData.usingMaterial1)
    //if (true)
    {
        $('#pa-material-2').removeClass("hidden");
        $('#pa-material-2-name').html(paData.material0Name);
        setSpinnerData('#pa-print-speed-2', paData.extrusionRate1Multiplier, 100.0);
        setSpinnerData('#pa-flow-rate-2', paData.flowRate1Multiplier, 100.0);
        setSpinnerData('#pa-temp-2', paData.nozzle1TargetTemp, 15.0);
    }
    else
    {
        $('#pa-material-2').addClass("hidden");
    }
}

function printAdjustInit()
{
    var selectedPrinter = localStorage.getItem(selectedPrinterVar);
	if (selectedPrinter !== null)
	{
        promiseGetCommandToRoot(selectedPrinter + '/remoteControl/printAdjust', null)
            .then(updatePrintAdjustData)
            .catch(goToPrinterStatusPage);
	}
	else
		goToPrinterStatusPage();
}
