package celtech.roboxremote.rootDataStructures;

import celtech.roboxbase.configuration.Filament;
import celtech.roboxbase.configuration.datafileaccessors.FilamentContainer;
import celtech.roboxbase.printerControl.model.Printer;
import celtech.roboxbase.utils.ColourStringConverter;
import celtech.roboxremote.PrinterRegistry;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 *
 * @author taldhous
 */
public class MaterialStatusData
{
    private String printerID;

    //Material
    private String[] attachedFilamentNames = null;
    private String[] attachedFilamentMaterials = null;
    private String[] attachedFilamentWebColours = null;
    private boolean[] attachedFilamentCustomFlags = null;
    private boolean[] canEjectFilament = null;
    private boolean[] materialLoaded = null;

    public MaterialStatusData()
    {
        // Jackson deserialization
    }

    public void updateFromPrinterData(String printerID)
    {
        this.printerID = printerID;
        Printer printer = PrinterRegistry.getInstance().getRemotePrinters().get(printerID);
 
        int numberOfExtruders = 1;
        if (printer.extrudersProperty().size() == 2
                && printer.extrudersProperty().get(1) != null
                && printer.extrudersProperty().get(1).isFittedProperty().get())
        {
            numberOfExtruders = 2;
        }
        
        canEjectFilament = new boolean[numberOfExtruders];
        attachedFilamentNames = new String[numberOfExtruders];
        attachedFilamentMaterials = new String[numberOfExtruders];
        attachedFilamentWebColours = new String[numberOfExtruders];
        attachedFilamentCustomFlags = new boolean[numberOfExtruders];
        materialLoaded = new boolean[numberOfExtruders];
        for (int extruderNumber = 0; extruderNumber < numberOfExtruders; extruderNumber++)
        {
            canEjectFilament[extruderNumber] = (printer.extrudersProperty().get(extruderNumber) != null &&
                                                printer.extrudersProperty().get(extruderNumber).isFittedProperty().get() &&
                                                printer.extrudersProperty().get(extruderNumber).canEjectProperty().get());
            if (printer.effectiveFilamentsProperty().get(extruderNumber) != FilamentContainer.UNKNOWN_FILAMENT)
            {
                Filament filament = printer.effectiveFilamentsProperty().get(extruderNumber);
                attachedFilamentNames[extruderNumber] = filament.getFriendlyFilamentName();
                attachedFilamentMaterials[extruderNumber] = filament.getMaterial().toString();
                attachedFilamentWebColours[extruderNumber] = "#" + ColourStringConverter.colourToString(filament.getDisplayColourProperty().get());
                attachedFilamentCustomFlags[extruderNumber] = filament.isMutable();
            }

            materialLoaded[extruderNumber] = printer.extrudersProperty().get(extruderNumber).filamentLoadedProperty().get();
        }
    }

    @JsonProperty
    public String getPrinterID()
    {
        return printerID;
    }

    @JsonProperty
    public void setPrinterID(String printerID)
    {
        this.printerID = printerID;
    }

    @JsonProperty
    public void setCanEjectFilament(boolean[] canEjectFilament)
    {
        this.canEjectFilament = canEjectFilament;
    }

    @JsonProperty
    public boolean[] getCanEjectFilament()
    {
        return canEjectFilament;
    }

    public String[] getAttachedFilamentNames()
    {
        return attachedFilamentNames;
    }

    public void setAttachedFilamentNames(String[] attachedFilamentNames)
    {
        this.attachedFilamentNames = attachedFilamentNames;
    }

    public String[] getAttachedFilamentMaterials()
    {
        return attachedFilamentMaterials;
    }

    public void setAttachedFilamentMaterials(String[] attachedFilamentMaterials)
    {
        this.attachedFilamentMaterials = attachedFilamentMaterials;
    }

    public String[] getAttachedFilamentWebColours()
    {
        return attachedFilamentWebColours;
    }

    public void setAttachedFilamentWebColours(String[] attachedFilamentWebColours)
    {
        this.attachedFilamentWebColours = attachedFilamentWebColours;
    }

     public boolean[] getAttachedFilamentCustomFlags()
    {
        return attachedFilamentCustomFlags;
    }

    public void setAttachedFilamentCustomFlags(boolean[] attachedFilamentCustomFlags)
    {
        this.attachedFilamentCustomFlags = attachedFilamentCustomFlags;
    }

    public boolean[] getMaterialLoaded()
    {
        return materialLoaded;
    }

    public void setMaterialLoaded(boolean[] materialLoaded)
    {
        this.materialLoaded = materialLoaded;
    }
}
