
import celtech.roboxbase.configuration.BaseConfiguration;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import libertysystems.stenographer.Stenographer;
import libertysystems.stenographer.StenographerFactory;

/**
 *
 * @author Ian
 */
public class WifiControl
{

    private static Stenographer steno = StenographerFactory.getStenographer(WifiControl.class.getName());

    public static void setupWiFiCredentials(String ssidAndPassword)
    {
        StringBuilder outputBuffer = new StringBuilder();
        List<String> command = new ArrayList<>();
        String wifiSetupCommand = BaseConfiguration.getBinariesDirectory() + "setupWifi.sh" + " " + ssidAndPassword;
        for (String subcommand : wifiSetupCommand.split(" "))
        {
            command.add(subcommand);
        }
        
        ProcessBuilder builder = new ProcessBuilder(command);
        Map<String, String> environ = builder.environment();
        
        Process process = null;
        
        try
        {
            process = builder.start();
            InputStream is = process.getInputStream();
            InputStreamReader isr = new InputStreamReader(is);
            BufferedReader br = new BufferedReader(isr);
            String line;
//            while ((line = br.readLine()) != null)
//            {
//                if (line.equalsIgnoreCase(notConnectedString) == false)
//                {
//                    outputBuffer.append(line);
//                }
//            }
        } catch (IOException ex)
        {
            steno.error("Error " + ex);
        }
        
//        List<DetectedDevice> detectedPrinters = new ArrayList<>();
//        
//        if (outputBuffer.length() > 0)
//        {
//            for (String handle : outputBuffer.toString().split(" "))
//            {
//                detectedPrinters.add(new DetectedDevice(PrinterConnectionType.SERIAL, handle));
//            }
//        }
//        
//        return detectedPrinters;
    }
}
