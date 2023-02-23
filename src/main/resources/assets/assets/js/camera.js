var cameraprofilejson;
var cameras;
function cameraInit()
{
    $('#left-button').on('click', goToPreviousPage);
    $("#selectcamera").on('change', changeCamera);
    GetCameraProfile();
}

function GetCameraProfile(){
    promiseGetCommandToRoot('discovery/listCameras', null)
        .then(function(result) 
              {
                if(result.cameras.length){
                    cameras = result.cameras;

                    if(cameras.length > 1){
                        var select = $("#selectcamera");
                        $("#camera-select-panel").removeClass("hidden");
                        cameras.forEach(element => {
                            var opt = document.createElement('option');
                            opt.value = element.cameraNumber;
                            opt.innerHTML = `${element.cameraNumber} : ${element.cameraName}`;
                            select[0].appendChild(opt);
                        });
                    }
                    loadCamera(cameras[0].cameraNumber);
                }
                else{
                    $("#no-cameras").removeClass("hidden");
                }
              });   
}

function loadCamera(cameranumber){
    var camera = cameras.find(camera => camera.cameraNumber === Number(cameranumber));;
    cameraprofilejson = {"profile":{},"camera":{"udevName":camera.udevName,"cameraName":camera.cameraName,"cameraNumber":camera.cameraNumber,"serverIP":""}}
    loadFrame();     
}

function loadFrame(){
    if(cameraprofilejson){
        promisePostCommandToRoot(`cameraControl/${cameraprofilejson.camera.cameraNumber}/snapshot`, cameraprofilejson, true)
        .then(function(result) 
              {
                var reader = new FileReader();
                reader.onload = function() {                         
                    var b64 = reader.result
                    document.getElementById("camerapreview").src = b64
                    loadFrame();
                }
                reader.readAsDataURL(result)
              });    
    }
}

function changeCamera(){
    loadCamera($("#selectcamera").find(":selected").val());
}
