package celtech.roboxremote;

import celtech.Lookup;
import celtech.appManager.ConsoleSystemNotificationManager;
import celtech.comms.DiscoveryAgentRemoteEnd;
import celtech.configuration.ApplicationConfiguration;
import celtech.printerControl.comms.RoboxCommsManager;
import celtech.utils.tasks.HeadlessTaskExecutor;
import io.dropwizard.Application;
import io.dropwizard.assets.AssetsBundle;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import libertysystems.stenographer.Stenographer;
import libertysystems.stenographer.StenographerFactory;

/**
 *
 * @author Ian
 */
public class RoboxRemote extends Application<RoboxRemoteConfiguration>
{

    private final Stenographer steno = StenographerFactory.getStenographer(RoboxRemote.class.getName());
    private RoboxCommsManager commsManager = null;
    private DiscoveryAgentRemoteEnd discoveryAgent = null;

    public static void main(String[] args) throws Exception
    {
        new RoboxRemote().run(args);
    }

    @Override
    public String getName()
    {
        return "printerControl";
    }

    @Override
    public void initialize(Bootstrap<RoboxRemoteConfiguration> bootstrap)
    {
        Runtime.getRuntime().addShutdownHook(new Thread()
        {
            @Override
            public void run()
            {
                steno.info("Shutting Robox Remote down");
                if (discoveryAgent != null)
                {
                    discoveryAgent.shutdown();
                }
                if (commsManager != null)
                {
                    commsManager.shutdown();
                }
            }
        });

        String installDir = ApplicationConfiguration.getApplicationInstallDirectory(RoboxRemote.class);
        Lookup.setupDefaultValues();
        Lookup.setSystemNotificationHandler(new ConsoleSystemNotificationManager());
        Lookup.setTaskExecutor(new HeadlessTaskExecutor());

        discoveryAgent = new DiscoveryAgentRemoteEnd();
        Thread discoveryThread = new Thread(discoveryAgent);
        discoveryThread.setDaemon(true);
        discoveryThread.start();

        commsManager = RoboxCommsManager.getInstance(ApplicationConfiguration.getBinariesDirectory(), false, false);
        commsManager.start();

        bootstrap.addBundle(new AssetsBundle("/assets", "/"));
    }

    @Override
    public void run(RoboxRemoteConfiguration configuration,
            Environment environment)
    {
        final LowLevelAPI lowLevelAPI = new LowLevelAPI(
                configuration.getTemplate(),
                configuration.getDefaultName()
        );

        final HighLevelAPI highLevelAPI = new HighLevelAPI();
        final DiscoveryAPI discoveryAPI = new DiscoveryAPI();

        final TemplateHealthCheck healthCheck
                = new TemplateHealthCheck(configuration.getTemplate());
        environment.healthChecks().register("template", healthCheck);

        environment.jersey().register(lowLevelAPI);
        environment.jersey().register(highLevelAPI);
        environment.jersey().register(discoveryAPI);

        environment.admin().addTask(new AdminUpdateTask());
    }
}
