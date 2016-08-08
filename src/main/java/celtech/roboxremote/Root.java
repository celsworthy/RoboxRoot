package celtech.roboxremote;

import celtech.roboxbase.ApplicationFeature;
import celtech.roboxbase.BaseLookup;
import celtech.roboxbase.appManager.ConsoleSystemNotificationManager;
import celtech.roboxbase.comms.DiscoveryAgentRemoteEnd;
import celtech.roboxbase.comms.RoboxCommsManager;
import celtech.roboxbase.configuration.BaseConfiguration;
import celtech.roboxbase.utils.tasks.HeadlessTaskExecutor;
import io.dropwizard.Application;
import io.dropwizard.assets.AssetsBundle;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import java.util.EnumSet;
import javafx.embed.swing.JFXPanel;
import javax.servlet.DispatcherType;
import javax.servlet.FilterRegistration;
import libertysystems.stenographer.Stenographer;
import libertysystems.stenographer.StenographerFactory;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlets.CrossOriginFilter;

/**
 *
 * @author Ian
 */
public class Root extends Application<RoboxRemoteConfiguration>
{

    private final Stenographer steno = StenographerFactory.getStenographer(Root.class.getName());
    private RoboxCommsManager commsManager = null;
    private DiscoveryAgentRemoteEnd discoveryAgent = null;

    private JFXPanel dummyJFXPanel_startsRuntime;

    private static Root instance = null;

    private boolean isStopping = false;

    public static void main(String[] args) throws Exception
    {
        instance = new Root();
        instance.run(args);
    }

    public static Root getInstance()
    {
        return instance;
    }

    @Override
    public String getName()
    {
        return "printerControl";
    }

    @Override
    public void initialize(Bootstrap<RoboxRemoteConfiguration> bootstrap)
    {
        //This horrible monstrosity is to get JavaFX to start
        //Solution - remove all references to JavaFX in RoboxBase
        dummyJFXPanel_startsRuntime = new JFXPanel();

        Runtime.getRuntime().addShutdownHook(new Thread()
        {
            @Override
            public void run()
            {
                if (!isStopping)
                {
                    steno.info("Running stop hook");
                    instance.stop();
                }
            }
        });

        BaseConfiguration.initialise(Root.class);
        BaseConfiguration.disableApplicationFeature(ApplicationFeature.AUTO_UPDATE_FIRMWARE);
        BaseLookup.setupDefaultValues();
        BaseLookup.setSystemNotificationHandler(new ConsoleSystemNotificationManager());
        BaseLookup.setTaskExecutor(new HeadlessTaskExecutor());

        discoveryAgent = new DiscoveryAgentRemoteEnd();
        Thread discoveryThread = new Thread(discoveryAgent);
        discoveryThread.setDaemon(true);
        discoveryThread.start();

        commsManager = RoboxCommsManager.getInstance(BaseConfiguration.getBinariesDirectory(), false, true, false);

        bootstrap.addBundle(new AssetsBundle("/assets", "/"));
    }

    @Override
    public void run(RoboxRemoteConfiguration configuration,
            Environment environment)
    {
        environment.lifecycle().addServerLifecycleListener((Server server) ->
        {
            server.setStopAtShutdown(true);
            server.setStopTimeout(500);
        });

        // Enable CORS headers
        final FilterRegistration.Dynamic cors
                = environment.servlets().addFilter("CORS", CrossOriginFilter.class);

        // Configure CORS parameters
        cors.setInitParameter("allowedOrigins", "*");
        cors.setInitParameter("allowedHeaders", "X-Requested-With,Content-Type,Accept,Origin");
        cors.setInitParameter("allowedMethods", "OPTIONS,GET,PUT,POST,DELETE,HEAD");

        // Add URL mapping
        cors.addMappingForUrlPatterns(EnumSet.allOf(DispatcherType.class), true, "/*");

        final AdminAPI adminAPI = new AdminAPI();
        final LowLevelAPI lowLevelAPI = new LowLevelAPI();
        final HighLevelAPI highLevelAPI = new HighLevelAPI();
        final DiscoveryAPI discoveryAPI = new DiscoveryAPI();

        final TemplateHealthCheck healthCheck
                = new TemplateHealthCheck(configuration.getTemplate());
        environment.healthChecks().register("template", healthCheck);

        environment.jersey().register(adminAPI);
        environment.jersey().register(lowLevelAPI);
        environment.jersey().register(highLevelAPI);
        environment.jersey().register(discoveryAPI);

        environment.admin().addTask(new AdminUpdateTask());

        commsManager.start();
    }

    public void stop()
    {
        isStopping = true;

        steno.info("Asked to shutdown Root");

        if (discoveryAgent != null)
        {
            discoveryAgent.shutdown();
        }
        if (commsManager != null)
        {
            commsManager.shutdown();
        }

        System.exit(0);
    }
}
