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
    private String defaultPIN;

    @JsonProperty
    public String getDefaultPIN()
    {
        return defaultPIN;
    }

    @JsonProperty
    public void setDefaultPIN(String defaultPIN)
    {
        this.defaultPIN = defaultPIN;
    }
}
