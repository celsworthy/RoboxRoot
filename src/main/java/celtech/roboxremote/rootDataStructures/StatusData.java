package celtech.roboxremote.rootDataStructures;

import celtech.roboxbase.BaseLookup;
import celtech.roboxbase.PrinterColourMap;
import celtech.roboxbase.configuration.BaseConfiguration;
import celtech.roboxbase.configuration.Filament;
import celtech.roboxbase.configuration.datafileaccessors.FilamentContainer;
import celtech.roboxbase.postprocessor.PrintJobStatistics;
import celtech.roboxbase.printerControl.PrinterStatus;
import celtech.roboxbase.printerControl.model.Head;
import celtech.roboxbase.printerControl.model.HeaterMode;
import celtech.roboxbase.printerControl.model.Printer;
import celtech.roboxbase.printerControl.model.PrinterAncillarySystems;
import celtech.roboxbase.utils.ColourStringConverter;
import celtech.roboxremote.PrinterRegistry;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.IOException;
import javafx.scene.paint.Color;

/**
 *
 * @author ianhudson
 */
public class StatusData
{

    private String printerID;
    private String printerName;
    private String printerTypeCode;
    private String printerWebColourString;
    private String printerStatusString;
    private String printerStatusEnumValue;

    private boolean canPrint;
    private boolean canPause;
    private boolean canResume;
    private boolean canPurgeHead;
    private boolean canRemoveHead;
    private boolean canOpenDoor;
    private boolean[] canEjectFilament;
    private boolean canCancel;
    private boolean canCalibrateHead;

    //Head
    private String headName;
    private String headTypeCode;
            
    private boolean dualMaterialHead;
    private int[] nozzleTemperature;

    //Bed
    private int bedTemperature;

    // Ambient
    private int ambientTemperature;

    //Print info
    private String printJobName;
    private String printJobSettings;
    private String printJobProfile;
    private int totalDurationSeconds;
    private int etcSeconds;
    private int currentLayer;
    private int numberOfLayers;

    //Material
    private String[] attachedFilamentNames = null;
    private String[] attachedFilamentMaterials = null;
    private String[] attachedFilamentWebColours = null;
    private boolean[] attachedFilamentCustomFlags = null;
    private boolean[] materialLoaded = null;

    //Errors
    private String[] activeErrors;

    @JsonIgnore
    private String lastPrintJobID = null;

    public StatusData()
    {
        // Jackson deserialization
    }

    public void updateFromPrinterData(String printerID)
    {
        this.printerID = printerID;
        Printer printer = PrinterRegistry.getInstance().getRemotePrinters().get(printerID);
      
        printerName = printer.getPrinterIdentity().printerFriendlyNameProperty().get();
        printerTypeCode = printer.printerConfigurationProperty().get().getTypeCode();
        PrinterColourMap colourMap = PrinterColourMap.getInstance();
        Color displayColour = colourMap.printerToDisplayColour(printer.getPrinterIdentity().printerColourProperty().get());

        printerWebColourString = "#" + ColourStringConverter.colourToString(displayColour);

        boolean statusProcessed = false;

        // Has to be in this order, as the printer status is printing even when aused status is paused.
        //if (!statusProcessed)
        //{
            switch (printer.busyStatusProperty().get())
            {
                case LOADING_FILAMENT_D:
                case LOADING_FILAMENT_E:
                case UNLOADING_FILAMENT_D:
                case UNLOADING_FILAMENT_E:
                    printerStatusString = BaseLookup.i18n(printer.busyStatusProperty().get().getI18nString());
                    printerStatusEnumValue = printer.busyStatusProperty().get().name();
                    statusProcessed = true;
                    break;
                default:
                    break;
            }
        //}

        if (!statusProcessed)
        {
            switch (printer.pauseStatusProperty().get())
            {
                case PAUSED:
                case PAUSE_PENDING:
                case RESUME_PENDING:
                    printerStatusString = BaseLookup.i18n(printer.pauseStatusProperty().get().getI18nString());
                    printerStatusEnumValue = printer.pauseStatusProperty().get().name();
                    statusProcessed = true;
                    break;
                default:
                    break;
            }
        }

        if (!statusProcessed)
        {
            switch (printer.printerStatusProperty().get())
            {
                case CALIBRATING_NOZZLE_ALIGNMENT:
                case CALIBRATING_NOZZLE_HEIGHT:
                case CALIBRATING_NOZZLE_OPENING:
                case OPENING_DOOR:
                case PRINTING_PROJECT:
                case PURGING_HEAD:
                case REMOVING_HEAD:
                    printerStatusString = printer.printerStatusProperty().get().getI18nString();
                    printerStatusEnumValue = printer.printerStatusProperty().get().name();
                    statusProcessed = true;
                    break;
                case RUNNING_MACRO_FILE:
                    printerStatusString = printer.getPrintEngine().macroBeingRun.get().getFriendlyName();
                    printerStatusEnumValue = printer.printerStatusProperty().get().name();
                    statusProcessed = true;
                    break;
            }
        }

        if (!statusProcessed && printer.getPrinterAncillarySystems().bedHeaterModeProperty().get() != HeaterMode.OFF)
        {
            printerStatusString = "Heating";
            printerStatusEnumValue = "HEATING";
            statusProcessed = true;
        }
                
        if (!statusProcessed)
        {
            printerStatusString = printer.printerStatusProperty().get().getI18nString();
            printerStatusEnumValue = printer.printerStatusProperty().get().name();
        }

        canPrint = printer.canPrintProperty().get();
        canCalibrateHead = printer.canCalibrateHeadProperty().get();
        canCancel = printer.canCancelProperty().get();
        canOpenDoor = printer.canOpenDoorProperty().get();

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

        canPause = printer.canPauseProperty().get();
        canPurgeHead = false;
        canRemoveHead = printer.canRemoveHeadProperty().get();
        canResume = printer.canResumeProperty().get();

        //Head
        Head printerHead = printer.headProperty().get();
        if (printerHead != null)
        {
            headName = printerHead.nameProperty().get();
            headTypeCode = printerHead.typeCodeProperty().get().trim();

            dualMaterialHead = printerHead.headTypeProperty().get() == Head.HeadType.DUAL_MATERIAL_HEAD;

            if (dualMaterialHead)
            {
                canPurgeHead = printer.reelsProperty().containsKey(0) && printer.reelsProperty().containsKey(1) && printer.canPurgeHeadProperty().get();
            } else
            {
                canPurgeHead = printer.reelsProperty().containsKey(0) && printer.canPurgeHeadProperty().get();
            }

            nozzleTemperature = new int[printerHead.getNozzleHeaters().size()];
            for (int heaterNumber = 0; heaterNumber < printerHead.getNozzleHeaters().size(); heaterNumber++)
            {
                nozzleTemperature[heaterNumber] = printerHead.getNozzleHeaters().get(heaterNumber).nozzleTemperatureProperty().get();
            }
        }
        else
        {
            headName = "";
        }

        bedTemperature = printer.getPrinterAncillarySystems().bedTemperatureProperty().get();

        ambientTemperature = printer.getPrinterAncillarySystems().ambientTemperatureProperty().get();

        //Print info
        totalDurationSeconds = printer.getPrintEngine().totalDurationSecondsProperty().get();

        if (printer.printerStatusProperty().get() == PrinterStatus.PRINTING_PROJECT)
        {
            if (lastPrintJobID == null
                    || lastPrintJobID.equals(printer.getPrintEngine().printJobProperty().get()))
            {
                lastPrintJobID = printer.getPrintEngine().printJobProperty().get().getJobUUID();
                try
                {
                    PrintJobStatistics printJobStatistics = printer.getPrintEngine().printJobProperty().get().getStatistics();
                    printJobName = printJobStatistics.getProjectName();
                    printJobSettings = printJobStatistics.getProfileName();
                    if (printJobSettings.equalsIgnoreCase(BaseConfiguration.draftSettingsProfileName))
                        printJobProfile = "DRAFT";
                    else if (printJobSettings.equalsIgnoreCase(BaseConfiguration.normalSettingsProfileName))
                        printJobProfile = "NORMAL";
                    else if (printJobSettings.equalsIgnoreCase(BaseConfiguration.fineSettingsProfileName))
                        printJobProfile = "FINE";
                    else
                        printJobProfile = "CUSTOM";
                } catch (IOException ex)
                {
                }
            }

            etcSeconds = printer.getPrintEngine().progressETCProperty().get();
            currentLayer = printer.getPrintEngine().progressCurrentLayerProperty().get();
            numberOfLayers = printer.getPrintEngine().progressNumLayersProperty().get();
        } else
        {
            lastPrintJobID = null;
        }

        if (!printer.getActiveErrors().isEmpty())
        {
            activeErrors = new String[printer.getActiveErrors().size()];
            for (int errorCounter = 0; errorCounter < printer.getActiveErrors().size(); errorCounter++)
            {
                activeErrors[errorCounter] = BaseLookup.i18n(printer.getActiveErrors().get(errorCounter).getErrorTitleKey());
            }
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
    public String getPrinterName()
    {
        return printerName;
    }

    @JsonProperty
    public void setPrinterName(String printerName)
    {
        this.printerName = printerName;
    }

    @JsonProperty
    public String getPrinterTypeCode()
    {
        return printerTypeCode;
    }

    @JsonProperty
    public void setPrinterTypeCode(String printerTypeCode)
    {
        this.printerTypeCode = printerTypeCode;
    }

    @JsonProperty
    public String getPrinterWebColourString()
    {
        return printerWebColourString;
    }

    @JsonProperty
    public void setPrinterWebColourString(String printerWebColourString)
    {
        this.printerWebColourString = printerWebColourString;
    }

    @JsonProperty
    public String getPrinterStatusString()
    {
        return printerStatusString;
    }

    @JsonProperty
    public void setPrinterStatusString(String printerStatusString)
    {
        this.printerStatusString = printerStatusString;
    }

    public String getPrinterStatusEnumValue()
    {
        return printerStatusEnumValue;
    }

    public void setPrinterStatusEnumValue(String printerStatusEnumValue)
    {
        this.printerStatusEnumValue = printerStatusEnumValue;
    }

    public boolean isCanPrint()
    {
        return canPrint;
    }

    public void setCanPrint(boolean canPrint)
    {
        this.canPrint = canPrint;
    }

    public boolean isCanCalibrateHead()
    {
        return canCalibrateHead;
    }

    public void setCanCalibrateHead(boolean canCalibrateHead)
    {
        this.canCalibrateHead = canCalibrateHead;
    }

    public boolean isCanCancel()
    {
        return canCancel;
    }

    public void setCanCancel(boolean canCancel)
    {
        this.canCancel = canCancel;
    }

    public boolean isCanOpenDoor()
    {
        return canOpenDoor;
    }

    public void setCanOpenDoor(boolean canOpenDoor)
    {
        this.canOpenDoor = canOpenDoor;
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

    public boolean isCanPause()
    {
        return canPause;
    }

    public void setCanPause(boolean canPause)
    {
        this.canPause = canPause;
    }

    public boolean isCanPurgeHead()
    {
        return canPurgeHead;
    }

    public void setCanPurgeHead(boolean canPurgeHead)
    {
        this.canPurgeHead = canPurgeHead;
    }

    public boolean isCanRemoveHead()
    {
        return canRemoveHead;
    }

    public void setCanRemoveHead(boolean canRemoveHead)
    {
        this.canRemoveHead = canRemoveHead;
    }

    public boolean isCanResume()
    {
        return canResume;
    }

    public void setCanResume(boolean canResume)
    {
        this.canResume = canResume;
    }

    public String getHeadName()
    {
        return headName;
    }

    public void setHeadName(String headName)
    {
        this.headName = headName;
    }

    public String getHeadTypeCode()
    {
        return headTypeCode;
    }

    public void setHeadTypeCode(String headTypeCode)
    {
        this.headTypeCode = headTypeCode;
    }

    public boolean isDualMaterialHead()
    {
        return dualMaterialHead;
    }

    public void setDualMaterialHead(boolean dualMaterialHead)
    {
        this.dualMaterialHead = dualMaterialHead;
    }

    public int getBedTemperature()
    {
        return bedTemperature;
    }

    public void setBedTemperature(int bedTemperature)
    {
        this.bedTemperature = bedTemperature;
    }

    public int getAmbientTemperature()
    {
        return ambientTemperature;
    }

    public void setAmbientTemperature(int ambientTemperature)
    {
        this.ambientTemperature = ambientTemperature;
    }

    @JsonProperty
    public int[] getNozzleTemperature()
    {
        return nozzleTemperature;
    }

    @JsonProperty
    public void setNozzleTemperature(int[] nozzleTemperature)
    {
        this.nozzleTemperature = nozzleTemperature;
    }

    @JsonIgnore
    public void setNozzleTemperature(int nozzleIndex, int newNozzleTemperature)
    {
        if (nozzleIndex >= 0
                && nozzleIndex < nozzleTemperature.length)
        {
            nozzleTemperature[nozzleIndex] = newNozzleTemperature;
        }
    }

    public String getPrintJobName()
    {
        return printJobName;
    }

    public void setPrintJobName(String printJobName)
    {
        this.printJobName = printJobName;
    }

    public int getEtcSeconds()
    {
        return etcSeconds;
    }

    public void setEtcSeconds(int etcSeconds)
    {
        this.etcSeconds = etcSeconds;
    }

    public int getTotalDurationSeconds()
    {
        return totalDurationSeconds;
    }

    public void setTotalDurationSeconds(int totalDurationSeconds)
    {
        this.totalDurationSeconds = totalDurationSeconds;
    }

    public int getCurrentLayer()
    {
        return currentLayer;
    }

    public void setCurrentLayer(int currentLayer)
    {
        this.currentLayer = currentLayer;
    }
    

    public int getNumberOfLayers()
    {
        return numberOfLayers;
    }

    public void setNumberOfLayers(int numberOfLayers)
    {
        this.totalDurationSeconds = numberOfLayers;
    }

    public String getPrintJobSettings()
    {
        return printJobSettings;
    }

    public void setPrintJobSettings(String printJobSettings)
    {
        this.printJobSettings = printJobSettings;
    }

    public String getPrintJobProfile()
    {
        return printJobProfile;
    }

    public void setPrintJobProfile(String printJobProfile)
    {
        this.printJobProfile = printJobProfile;
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

    public String[] getActiveErrors()
    {
        return activeErrors;
    }

    public void setActiveErrors(String[] activeErrors)
    {
        this.activeErrors = activeErrors;
    }
}
