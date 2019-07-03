package celtech.roboxremote.comms;

import celtech.roboxbase.camera.CameraInfo;
import celtech.roboxbase.comms.DetectedDevice;
import celtech.roboxbase.comms.DeviceDetector;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import libertysystems.stenographer.Stenographer;
import libertysystems.stenographer.StenographerFactory;

/**
 *
 * @author George Salter
 */
public class CameraDeviceDetector extends DeviceDetector
{
    private static final Stenographer STENO = StenographerFactory.getStenographer(CameraDeviceDetector.class.getName());
    
    private static final String CAM_DETECTOR_COMMAND = "/home/pi/ARM-32bit/Root/cameraDetector.sh";
    private static final String CAM_FIND_INFO_COMMAND = "/home/pi/ARM-32bit/Root/findCameraInfo.sh";
    
    private static final String BASE_MOTION_CONTROL_HANDLE = "http://localhost:8101/";
    private static final String BASE_MOTION_STREAM_HANDLE = "http://localhost:8102/";
    
    @Override
    public List<DetectedDevice> searchForDevices()
    {
        StringBuilder outputBuffer = new StringBuilder();

        ProcessBuilder builder = new ProcessBuilder(CAM_DETECTOR_COMMAND);
        Process process;

        try
        {
            process = builder.start();
            InputStream is = process.getInputStream();
            InputStreamReader isr = new InputStreamReader(is);
            BufferedReader br = new BufferedReader(isr);
            String line;
            while ((line = br.readLine()) != null)
            {
                if (line.equalsIgnoreCase(NOT_CONNECTED_STRING) == false)
                {
                    outputBuffer.append(line);
                }
            }
        } catch (IOException ex)
        {
            STENO.error("Error " + ex);
        }

        List<DetectedDevice> detectedCameras = new ArrayList<>();

        if (outputBuffer.length() > 0)
        {
            for (String handle : outputBuffer.toString().split(" "))
            {
                detectedCameras.add(new DetectedCamera(DeviceConnectionType.USB, handle));
            }
        }

        return detectedCameras;
    }
    
    public CameraInfo findCameraInformation(String detectedCameraHandle)
    {
        List<String> cameraInformation = new ArrayList<>();

        ProcessBuilder builder = new ProcessBuilder(CAM_FIND_INFO_COMMAND, detectedCameraHandle);
        Process process;
        try
        {
            process = builder.start();
            InputStream is = process.getInputStream();
            InputStreamReader isr = new InputStreamReader(is);
            BufferedReader br = new BufferedReader(isr);
            String line;
            while ((line = br.readLine()) != null)
            {
                cameraInformation.add(line);
            }
        } catch (IOException ex)
        {
            STENO.error("Error " + ex);
        }
        
        String cameraName = cameraInformation.get(0);
        String cameraNumber = cameraInformation.get(1);
        
        CameraInfo cameraInfo = new CameraInfo();
        cameraInfo.setUdevName(detectedCameraHandle);
        cameraInfo.setCameraName(cameraName);
        cameraInfo.setCameraNumber(Integer.parseInt(cameraNumber));
        cameraInfo.setMotionControlHandle(BASE_MOTION_CONTROL_HANDLE + cameraNumber + "/");
        cameraInfo.setMotionStreamHandle(BASE_MOTION_STREAM_HANDLE + cameraNumber + "/");
        return cameraInfo;
    }
}
