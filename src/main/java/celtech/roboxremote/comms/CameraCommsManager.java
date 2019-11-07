package celtech.roboxremote.comms;

import celtech.roboxbase.camera.CameraInfo;
import celtech.roboxbase.comms.DetectedDevice;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
    
    private Map<DetectedDevice, CameraInfo> activeCameras;
    
    private boolean keepRunning = true;
    
    private String serverIP = "Unknown";
    
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
            Map<DetectedDevice, CameraInfo> newActiveCameras = new HashMap<>();
            Set<DetectedDevice> currentActiveCameras = activeCameras.keySet();
            
            attachedCameras.forEach(connectedCam ->
            {
                if (!currentActiveCameras.contains(connectedCam))
                {
                    if (connectedCam instanceof DetectedCamera)
                    {
                        // Add new Cameras
                        STENO.debug("We have found a new camera " + connectedCam);
                        CameraInfo cameraInfo = assessCamera((DetectedCamera) connectedCam);
                        newActiveCameras.put(connectedCam, cameraInfo);
                    } else
                    {
                        STENO.debug("We have found a device that is not a camera with handle " + connectedCam);
                    }
                } else
                {
                    // Retain cameras that are not new
                    newActiveCameras.put(connectedCam, activeCameras.get(connectedCam));
                }
            });

            activeCameras = newActiveCameras;
            
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
        CameraInfo cameraInfo = cameraDeviceDetector.findCameraInformation(detectedCamera.getConnectionHandle(), serverIP);
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
    
    public void setServerIP(String serverIP)
    {
        this.serverIP = serverIP;
    }
}
