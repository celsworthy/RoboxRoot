package celtech.roboxremote;

import celtech.roboxbase.comms.remote.clear.WifiStatusResponse;
import celtech.roboxbase.configuration.BaseConfiguration;
import celtech.roboxbase.configuration.MachineType;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import libertysystems.stenographer.Stenographer;
import libertysystems.stenographer.StenographerFactory;

/**
 *
 * @author Ian
 */
public class WifiControl
{
    private static final Stenographer STENO = StenographerFactory.getStenographer(WifiControl.class.getName());

    public static boolean enableWifi(boolean enableWifi)
    {
        String wifiControl = (enableWifi == true) ? "on" : "off";
        boolean result = false;
        if (BaseConfiguration.getMachineType() == MachineType.WINDOWS)
        {
        } else
        {
            String output = ScriptUtils.runScript("enableDisableWifi.sh", wifiControl);
            STENO.info(output);
            result = (output != null);
        }
        return result;
    }

    public static WifiStatusResponse getCurrentWifiState()
    {
        final String SCRIPT_BASE = "getCurrentWifiState";
        String scriptOutput;
        if (BaseConfiguration.getMachineType() == MachineType.WINDOWS)
        {
            scriptOutput = ScriptUtils.runScript(SCRIPT_BASE + ".bat");
        } else
        {
            scriptOutput = ScriptUtils.runScript(SCRIPT_BASE + ".sh");
        }

        WifiStatusResponse response = null;

        ObjectMapper mapper = new ObjectMapper();
        try
        {
            response = mapper.readValue(scriptOutput, WifiStatusResponse.class);
        } catch (IOException ex)
        {
            STENO.exception("Unable to decipher wifi status response", ex);
        }

        return response;
    }

    public static boolean setupWiFiCredentials(String ssidAndPassword)
    {
        boolean result = false;
        if (BaseConfiguration.getMachineType() == MachineType.WINDOWS)
        {
        } else
        {
            String output = ScriptUtils.runScript("setupWifi.sh", ssidAndPassword);
            STENO.info(output);
            result = (output != null);
        }
        return result;
    }
}
