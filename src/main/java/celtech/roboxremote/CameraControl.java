package celtech.roboxremote;

import libertysystems.stenographer.Stenographer;
import libertysystems.stenographer.StenographerFactory;

/**
 *
 * @author George Salter
 */
public class CameraControl 
{
    public static final Stenographer STENO = StenographerFactory.getStenographer(CameraControl.class.getName());
    
    public static boolean takeTimelapsePicture()
    {
        String output = ScriptUtils.runScript("takeTimelapsePhoto.sh");
        STENO.info(output);
        
        // output is returned from script, what do we do at this point
        
        return result;
    }
}
