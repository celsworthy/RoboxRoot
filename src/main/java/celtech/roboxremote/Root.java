package celtech.roboxremote;

import celtech.roboxbase.configuration.BaseConfiguration;
import celtech.roboxbase.configuration.MachineType;
import celtech.roboxbase.utils.ApplicationUtils;
import celtech.roboxremote.custom_dropwizard.AuthenticatedAssetsBundle;
import celtech.roboxremote.custom_dropwizard.ExternalAuthenticatedAssetsBundle;
import celtech.roboxremote.security.RootAPIAuthFilter;
import celtech.roboxremote.security.RootAPIAuthenticator;
import celtech.roboxremote.security.User;
import io.dropwizard.Application;
import io.dropwizard.auth.AuthDynamicFeature;
import io.dropwizard.forms.MultiPartBundle;
import io.dropwizard.jersey.jackson.JsonProcessingExceptionMapper;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import java.io.IOException;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.EnumSet;
import java.util.Enumeration;
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
        BaseConfiguration.initialise(Root.class);
        coreManager = new CoreManager();

        bootstrap.addBundle(new MultiPartBundle());
		
        String externalStaticDir = BaseConfiguration.getExternalStaticDirectory();
        AuthenticatedAssetsBundle webControlAssetsBundle;

        if (externalStaticDir != null)
        {
            webControlAssetsBundle = new ExternalAuthenticatedAssetsBundle(externalStaticDir,
                    "/assets", "/", new RootAPIAuthenticator());
        } else
        {
            webControlAssetsBundle = new AuthenticatedAssetsBundle(
                    "/assets", "/", new RootAPIAuthenticator());
        }
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

        final AdminAPI adminAPI = new AdminAPI();
        final LowLevelAPI lowLevelAPI = new LowLevelAPI();
        final PublicPrinterControlAPI highLevelAPI = new PublicPrinterControlAPI();
        final DiscoveryAPI discoveryAPI = new DiscoveryAPI();

        final AppSetupHealthCheck healthCheck
                = new AppSetupHealthCheck(configuration.getDefaultPIN());
        environment.healthChecks().register("template", healthCheck);
        environment.jersey().register(adminAPI);
        environment.jersey().register(lowLevelAPI);
        environment.jersey().register(highLevelAPI);
        environment.jersey().register(discoveryAPI);
        environment.jersey().register(CORSFilter.class);

        environment.jersey().register(new AuthDynamicFeature(new RootAPIAuthFilter.Builder<User>()
                .setAuthenticator(new RootAPIAuthenticator())
                .setRealm("Robox Root API")
                .buildAuthFilter()));
        environment.admin().addTask(new AdminUpdateTask());

        String hostAddress = "";
        try
        {
            Enumeration<NetworkInterface> networkInterfaces = NetworkInterface
                    .getNetworkInterfaces();
            while (networkInterfaces.hasMoreElements())
            {
                NetworkInterface ni = (NetworkInterface) networkInterfaces
                        .nextElement();
                Enumeration<InetAddress> nias = ni.getInetAddresses();
                while (nias.hasMoreElements())
                {
                    InetAddress ia = (InetAddress) nias.nextElement();
                    if (!ia.isLinkLocalAddress()
                            && !ia.isLoopbackAddress()
                            && ia instanceof Inet4Address)
                    {
                        hostAddress = ia.getHostAddress();
                        break;
                    }
                }
            }
        } catch (SocketException e)
        {
            steno.error("unable to get current IP " + e.getMessage());
        }

        ApplicationUtils.outputApplicationStartupBanner(this.getClass());
        steno.info("Root started up with IP " + hostAddress);
    }

    public void stop()
    {
        BaseConfiguration.shutdown();
        System.exit(0);
    }

    public void restart()
    {
        //Rely on the system process manager to restart us...
        //Kill the browser to make sure that the cache is zapped
        if (BaseConfiguration.getMachineType() == MachineType.LINUX_X64
                || BaseConfiguration.getMachineType() == MachineType.LINUX_X86)
        {
            try
            {
                Runtime.getRuntime().exec("killall chromium-browser");
            } catch (IOException ex)
            {
                steno.exception("Failed to shut down browser", ex);
            }
        }
        stop();
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
