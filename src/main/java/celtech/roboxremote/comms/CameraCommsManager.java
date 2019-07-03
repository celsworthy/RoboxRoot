package celtech.roboxremote.comms;

import celtech.roboxbase.camera.CameraInfo;
import celtech.roboxbase.comms.DetectedDevice;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import libertysystems.stenographer.Stenographer;
import libertysystems.stenographer.StenographerFactory;

/**
 *
 * @author George Salter
 */
public class CameraCommsManager extends Thread 
{
    private static final Stenographer STENO = StenographerFactory.getStenographer(CameraCommsManager.class.getName());
    
    private final CameraDeviceDetector cameraDeviceDetector;
    
    private final Map<DetectedDevice, CameraInfo> activeCameras;
    
    private boolean keepRunning = true;
    
    public CameraCommsManager()
    {
        cameraDeviceDetector = new CameraDeviceDetector();
        activeCameras = new HashMap<>();
    }
    
    @Override
    public void run()
    {
        STENO.info("Camera comms manager started");
        
        while(keepRunning)
        {
            long startOfRunTime = System.currentTimeMillis();

            //Search
            List<DetectedDevice> attachedCameras = cameraDeviceDetector.searchForDevices();

            //Now new connections
            List<DetectedDevice> camerasToConnect = new ArrayList<>();
            attachedCameras.forEach(connectedCam ->
            {
                if (!activeCameras.keySet().contains(connectedCam))
                {
                    camerasToConnect.add(connectedCam);
                }
            });

            camerasToConnect.forEach((detectedCameraToConnect) -> {
                if (detectedCameraToConnect instanceof DetectedCamera)
                {
                    STENO.debug("We have found a new camera " + detectedCameraToConnect);
                    CameraInfo cameraInfo = assessCamera((DetectedCamera) detectedCameraToConnect);
                    activeCameras.put(detectedCameraToConnect, cameraInfo);
                } else
                {
                    STENO.debug("We have found a device that is not a camera with handle " + detectedCameraToConnect);
                }
            });

            long endOfRunTime = System.currentTimeMillis();
            long runTime = endOfRunTime - startOfRunTime;
            long sleepTime = 500 - runTime;

            if (sleepTime > 0)
            {
                try
                {
                    Thread.sleep(sleepTime);
                } catch (InterruptedException ex)
                {
                    STENO.info("Camera comms manager was interrupted during sleep");
                }
            }
        }
    }
    
    private CameraInfo assessCamera(DetectedCamera detectedCamera)
    {
        CameraInfo cameraInfo = cameraDeviceDetector.findCameraInformation(detectedCamera.getConnectionHandle());
        STENO.info(cameraInfo.toString());
        return cameraInfo;
    }
    
    public void shutdown()
    {
        keepRunning = false;
        STENO.info("Camera comms manager shutdown");
    }
    
    public List<CameraInfo> getAllCameraInfo()
    {
        return new ArrayList<>(activeCameras.values());
    }
}
