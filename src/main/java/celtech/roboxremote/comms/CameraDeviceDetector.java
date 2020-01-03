package celtech.roboxremote.comms;

import celtech.roboxbase.camera.CameraInfo;
import celtech.roboxbase.comms.DetectedDevice;
import celtech.roboxbase.comms.DeviceDetector;
import celtech.roboxremote.utils.NetworkUtils;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.SocketException;
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
    
    private static final String MOTION_CONTROL_HANDLE_PORT = ":8101/";
    private static final String MOTION_STREAM_HANDLE_PORT = ":8102/";
    
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
        
        String serverIP = "Unknown";
        try
        {
            serverIP = NetworkUtils.determineIPAddress();
        } catch (SocketException e)
        {
            STENO.error("Error when determining our IP address. " + e.getMessage());
        }
        
        String motionControlHandle = "http://" + serverIP + MOTION_CONTROL_HANDLE_PORT;
        String motionStreamHandle = "http://" + serverIP + MOTION_STREAM_HANDLE_PORT;
        
        CameraInfo cameraInfo = new CameraInfo();
        cameraInfo.setUdevName(detectedCameraHandle);
        cameraInfo.setCameraName(cameraName);
        cameraInfo.setCameraNumber(Integer.parseInt(cameraNumber));
        cameraInfo.setMotionControlHandle(motionControlHandle + cameraNumber + "/");
        cameraInfo.setMotionStreamHandle(motionStreamHandle + cameraNumber + "/");
        return cameraInfo;
    }
}
