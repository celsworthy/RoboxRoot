package celtech.roboxremote;

import celtech.roboxbase.comms.remote.clear.WifiStatusResponse;
import celtech.roboxbase.configuration.BaseConfiguration;
import celtech.roboxbase.configuration.MachineType;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import libertysystems.stenographer.Stenographer;
import libertysystems.stenographer.StenographerFactory;

/**
 *
 * @author Ian
 */
public class WifiControl
{

    private static Stenographer steno = StenographerFactory.getStenographer(WifiControl.class.getName());

    private static String runScript(String scriptName, String... parameters)
    {
        List<String> command = new ArrayList<>();
        String commandLine = BaseConfiguration.getBinariesDirectory() + scriptName;
        command.add(commandLine);

        for (String param : parameters)
        {
            command.add(param);
        }

        ProcessBuilder builder = new ProcessBuilder(command);

        String scriptOutput = null;

        try
        {
            Process wifiSetupProcess = builder.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(wifiSetupProcess.getInputStream()));
            StringBuilder stringBuilder = new StringBuilder();
            String line = null;
            while ((line = reader.readLine()) != null)
            {
                if (stringBuilder.length() > 0)
                {
                    stringBuilder.append(System.getProperty("line.separator"));
                }
                stringBuilder.append(line);
            }

            scriptOutput = stringBuilder.toString();
        } catch (IOException ex)
        {
            steno.error("Error " + ex);
        }

        return scriptOutput;
    }

    public static void enableWifi(boolean enableWifi)
    {
        String wifiControl = (enableWifi == true) ? "on" : "off";
        String output = runScript("enableDisableWifi.sh", wifiControl);
    }

    public static WifiStatusResponse getCurrentWifiState()
    {
        final String SCRIPT_BASE = "getCurrentWifiState";
        String scriptOutput;
        if (BaseConfiguration.getMachineType() == MachineType.WINDOWS)
        {
            scriptOutput = runScript(SCRIPT_BASE + ".bat");
        } else
        {
            scriptOutput = runScript(SCRIPT_BASE + ".sh");
        }

        WifiStatusResponse response = null;

        //Expects <on|off> <yes|no> [ssid]
        String[] outputParts = scriptOutput.split(" ");
        boolean powered = false;
        boolean associated = false;
        String ssid = "";

        if (outputParts.length >= 2)
        {
            powered = outputParts[0].equalsIgnoreCase("on");
            associated = outputParts[1].equalsIgnoreCase("yes");
        }

        if (outputParts.length == 3)
        {
            ssid = outputParts[2];
        }
        response = new WifiStatusResponse(powered, associated, ssid);
        return response;
    }

    public static void setupWiFiCredentials(String ssidAndPassword)
    {
        String output = runScript("setupWifi.sh", ssidAndPassword);
        steno.info(output);
    }
}
