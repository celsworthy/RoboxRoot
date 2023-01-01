var cameraprofilejson = {"profile":{"profileName":"Default","captureHeight":720,"captureWidth":1080,"headLightOff":true,"ambientLightOff":false,"moveBeforeCapture":true,"moveToX":50,"moveToY":50,"cameraName":"","controlSettings":{}},"camera":{"udevName":"/dev/video0","cameraName":"camera0","cameraNumber":0,"serverIP":""}};

function cameraInit()
{
    //$('#left-button').on('click', goToPreviousPage);

    
    promisePostCommandToRoot('cameraControl/0/snapshot', cameraprofilejson, true)
        .then(function(result) 
              {
                var reader = new FileReader();
                reader.onload = function() {                         
                    var b64 = reader.result
                    console.log("This is base64", b64)
                    document.getElementById("camerapreview").src = b64
                }
                reader.readAsDataURL(result)
              });    

    setHomeButton();
}
