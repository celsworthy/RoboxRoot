package celtech.roboxremote.rootDataStructures;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 *
 * @author taldhous
 */
public class TargetValue
{
    private String name = "";
    private String tag = "";
    private float value = 0.0F;
    
    public TargetValue()
    {
        // Jackson deserialization
    }

    @JsonProperty
    public String getName()
    {
        return name;
    }

   @JsonProperty
    public void setName(String name)
    {
        this.name = name;
    }
 
    @JsonProperty
    public String getTag()
    {
        return tag;
    }

   @JsonProperty
    public void setTag(String tag)
    {
        this.tag = tag;
    }

   @JsonProperty
    public float getValue()
    {
        return value;
    }

    @JsonProperty
    public void setValue(float value)
    {
        this.value = value;
    }
}
