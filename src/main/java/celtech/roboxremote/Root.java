package celtech.roboxremote;

import celtech.roboxbase.configuration.BaseConfiguration;
import celtech.roboxremote.custom_dropwizard.AuthenticatedAssetsBundle;
import celtech.roboxremote.security.RootAPIAuthFilter;
import celtech.roboxremote.security.User;
import celtech.roboxremote.security.RootAPIAuthenticator;
import io.dropwizard.Application;
import io.dropwizard.auth.AuthDynamicFeature;
import io.dropwizard.auth.basic.BasicCredentialAuthFilter;
import io.dropwizard.forms.MultiPartBundle;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import libertysystems.stenographer.Stenographer;
import libertysystems.stenographer.StenographerFactory;
import org.eclipse.jetty.server.Server;

/**
 *
 * @author Ian
 */
public class Root extends Application<RoboxRemoteConfiguration>
{

    private final Stenographer steno = StenographerFactory.getStenographer(Root.class.getName());

    private static Root instance = null;
    private CoreManager coreManager = null;
    private String defaultApplicationPIN = "";
    private static final String accessPINKey = "AccessPIN";

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
        coreManager = new CoreManager();

        bootstrap.addBundle(new MultiPartBundle());
        AuthenticatedAssetsBundle webControlAssetsBundle = new AuthenticatedAssetsBundle("/assets", "/", "index.html",
                new RootAPIAuthenticator());
        bootstrap.addBundle(webControlAssetsBundle);
    }

    @Override
    public void run(RoboxRemoteConfiguration configuration,
            Environment environment)
    {
        defaultApplicationPIN = configuration.getDefaultPIN();

        environment.lifecycle().manage(coreManager);

        environment.lifecycle().addServerLifecycleListener((Server server) ->
        {
            server.setStopAtShutdown(true);
            server.setStopTimeout(500);
        });

        environment.jersey().setUrlPattern("/api/*");

//        environment.jersey().register(MultiPartFeature.class);
//        // Enable CORS headers
//        final FilterRegistration.Dynamic cors
//                = environment.servlets().addFilter("CORS", CrossOriginFilter.class);
//
//        // Configure CORS parameters
//        cors.setInitParameter("allowedOrigins", "*");
//        cors.setInitParameter("allowedHeaders", "X-Requested-With,Content-Type,Accept,Origin");
//        cors.setInitParameter("allowedMethods", "OPTIONS,GET,PUT,POST,DELETE,HEAD");
//
//        // Add URL mapping
//        cors.addMappingForUrlPatterns(EnumSet.allOf(DispatcherType.class), true, "/*");
        final AdminAPI adminAPI = new AdminAPI();
        final LowLevelAPI lowLevelAPI = new LowLevelAPI();
        final HighLevelAPI highLevelAPI = new HighLevelAPI();
        final DiscoveryAPI discoveryAPI = new DiscoveryAPI();

        final AppSetupHealthCheck healthCheck
                = new AppSetupHealthCheck(configuration.getDefaultPIN());
        environment.healthChecks().register("template", healthCheck);

        environment.jersey().register(adminAPI);
        environment.jersey().register(lowLevelAPI);
        environment.jersey().register(highLevelAPI);
        environment.jersey().register(discoveryAPI);

        environment.jersey().register(new AuthDynamicFeature(new RootAPIAuthFilter.Builder<User>()
                .setAuthenticator(new RootAPIAuthenticator())
                .setRealm("Robox Root API")
                .buildAuthFilter()));

        environment.admin().addTask(new AdminUpdateTask());
    }

    public void stop()
    {
        BaseConfiguration.shutdown();
        System.exit(0);
    }

    public void setApplicationPIN(String applicationPIN)
    {
        BaseConfiguration.setApplicationMemory(accessPINKey, applicationPIN);
    }

    public String getApplicationPIN()
    {
        String pin = BaseConfiguration.getApplicationMemory(accessPINKey);
        if (pin == null)
        {
            resetApplicationPINToDefault();
            pin = getApplicationPIN();
        }
        return pin;
    }

    public void resetApplicationPINToDefault()
    {
        setApplicationPIN(defaultApplicationPIN);
    }
}
