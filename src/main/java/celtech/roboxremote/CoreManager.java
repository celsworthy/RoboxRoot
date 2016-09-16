package celtech.roboxremote;

import celtech.roboxbase.ApplicationFeature;
import celtech.roboxbase.BaseLookup;
import celtech.roboxbase.appManager.ConsoleSystemNotificationManager;
import celtech.roboxbase.comms.DiscoveryAgentRemoteEnd;
import celtech.roboxbase.comms.RoboxCommsManager;
import celtech.roboxbase.configuration.BaseConfiguration;
import celtech.roboxbase.utils.tasks.HeadlessTaskExecutor;
import io.dropwizard.lifecycle.Managed;
import javafx.application.Platform;
import javafx.embed.swing.JFXPanel;
import libertysystems.stenographer.Stenographer;
import libertysystems.stenographer.StenographerFactory;

/**
 *
 * @author ianhudson
 */
public class CoreManager implements Managed
{

    private final Stenographer steno = StenographerFactory.getStenographer(CoreManager.class.getName());

    private RoboxCommsManager commsManager = null;
    private DiscoveryAgentRemoteEnd discoveryAgent = null;

    private JFXPanel dummyJFXPanel_startsRuntime;
    private boolean isStopping = false;

    @Override
    public void start() throws Exception
    {
        //This horrible monstrosity is to get JavaFX to start
        //Solution - remove all references to JavaFX in RoboxBase
        dummyJFXPanel_startsRuntime = new JFXPanel();

//        Runtime.getRuntime().addShutdownHook(new Thread()
//        {
//            @Override
//            public void run()
//            {
//        if (discoveryAgent != null)
//        {
//            discoveryAgent.shutdown();
//        }
//        if (commsManager != null)
//        {
//            commsManager.shutdown();
//        }
//        if (!isStopping)
//                {
//                    steno.info("Running stop hook");
//                }
//            }
//        });
        BaseConfiguration.initialise(Root.class);
        BaseConfiguration.disableApplicationFeature(ApplicationFeature.AUTO_UPDATE_FIRMWARE);
        BaseLookup.setupDefaultValues();
        BaseLookup.setSystemNotificationHandler(new ConsoleSystemNotificationManager());
        BaseLookup.setTaskExecutor(new HeadlessTaskExecutor());

        discoveryAgent = new DiscoveryAgentRemoteEnd(BaseConfiguration.getApplicationVersion());
        Thread discoveryThread = new Thread(discoveryAgent);
        discoveryThread.setDaemon(true);
        discoveryThread.start();

        commsManager = RoboxCommsManager.getInstance(BaseConfiguration.getBinariesDirectory(), false, true, false);
        PrinterRegistry.getInstance();
        commsManager.start();
    }

    @Override
    public void stop() throws Exception
    {
//        isStopping = true;
//
        steno.info("Asked to shutdown Root");
//
//        if (discoveryAgent != null)
//        {
//            discoveryAgent.shutdown();
//        }
//        if (commsManager != null)
//        {
//            commsManager.shutdown();
//        }
    }

}
