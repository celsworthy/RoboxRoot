//var cameraprofilejson = {"profile":{"profileName":"Default","captureHeight":720,"captureWidth":1080,"headLightOff":true,"ambientLightOff":false,"moveBeforeCapture":true,"moveToX":50,"moveToY":50,"cameraName":"","controlSettings":{}},"camera":{"udevName":"/dev/video0","cameraName":"camera0","cameraNumber":0,"serverIP":""}};
var cameraprofilejson;
function cameraInit()
{
    $('#left-button').on('click', goToPreviousPage);
    
    GetCameraProfile();
    
    setHomeButton();
}

function GetCameraProfile(){
    promiseGetCommandToRoot('discovery/listCameras', null)
        .then(function(result) 
              {
                if(result.cameras.length){
                    // only supporting one for now
                    var camera = result.cameras[0];
                    cameraprofilejson = {"profile":{},"camera":{"udevName":camera.udevName,"cameraName":camera.cameraName,"cameraNumber":camera.cameraNumber,"serverIP":""}}
                    setInterval(loadFrame, 1000);                    
                }
                else{
                    $("#no-cameras").removeClass("hidden");
                }
              });   
}

function loadFrame(){
    if(cameraprofilejson){
        promisePostCommandToRoot('cameraControl/0/snapshot', cameraprofilejson, true)
        .then(function(result) 
              {
                var reader = new FileReader();
                reader.onload = function() {                         
                    var b64 = reader.result
                    document.getElementById("camerapreview").src = b64
                }
                reader.readAsDataURL(result)
              });    
    }
}
