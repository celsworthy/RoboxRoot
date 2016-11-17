package celtech.roboxremote.security;

import celtech.roboxbase.configuration.BaseConfiguration;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import io.dropwizard.auth.AuthenticationException;
import io.dropwizard.auth.Authenticator;
import io.dropwizard.auth.basic.BasicCredentials;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 *
 * @author Ian
 */
public class WebPageAuthenticator implements Authenticator<BasicCredentials, User>
{
    private static final String webAccessPWKey = "WebAccessPW";
    private static final String defaultPW = "rootAdmin";
    private static final Map<String, Set<String>> VALID_USERS = ImmutableMap.of(
            "root", ImmutableSet.of()
    );

    @Override
    public Optional<User> authenticate(BasicCredentials credentials) throws AuthenticationException
    {
        String webAccessPW = BaseConfiguration.getApplicationMemory(webAccessPWKey);
        if (webAccessPW == null)
        {
            BaseConfiguration.setApplicationMemory(webAccessPWKey, defaultPW);
            webAccessPW = defaultPW;
        }
        if (VALID_USERS.containsKey(credentials.getUsername()) && webAccessPW.equals(credentials.getPassword()))
        {
            return Optional.of(new User(credentials.getUsername(), VALID_USERS.get(credentials.getUsername())));
        }
        return Optional.empty();
    }
}
