package celtech.roboxremote;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.dropwizard.Configuration;
import org.hibernate.validator.constraints.NotEmpty;

/**
 *
 * @author Ian
 */
public class RoboxRemoteConfiguration extends Configuration
{
    @NotEmpty
    private String applicationPIN;

    @JsonProperty
    public String getApplicationPIN()
    {
        return applicationPIN;
    }

    @JsonProperty
    public void setApplicationPIN(String applicationPIN)
    {
        this.applicationPIN = applicationPIN;
    }
}
