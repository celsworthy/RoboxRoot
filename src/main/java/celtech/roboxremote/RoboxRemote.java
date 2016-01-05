package celtech.roboxremote;

import celtech.comms.DiscoveryAgentRemoteEnd;
import io.dropwizard.Application;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;

/**
 *
 * @author Ian
 */
public class RoboxRemote extends Application<RoboxRemoteConfiguration>
{

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
       DiscoveryAgentRemoteEnd discoveryAgent = new DiscoveryAgentRemoteEnd();
       
       Thread discoveryThread = new Thread(discoveryAgent);
       discoveryThread.setDaemon(true);
       discoveryThread.start();
    }

    @Override
    public void run(RoboxRemoteConfiguration configuration,
            Environment environment)
    {
        final RoboxRemoteResource resource = new RoboxRemoteResource(
                configuration.getTemplate(),
                configuration.getDefaultName()
        );
        final TemplateHealthCheck healthCheck
                = new TemplateHealthCheck(configuration.getTemplate());
        environment.healthChecks().register("template", healthCheck);
        environment.jersey().register(resource);
    }
}
