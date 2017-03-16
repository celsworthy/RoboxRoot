package celtech.roboxremote.rootDataStructures;

import celtech.roboxbase.BaseLookup;
import celtech.roboxbase.PrinterColourMap;
import celtech.roboxbase.comms.rx.PrinterIDResponse;
import celtech.roboxbase.configuration.datafileaccessors.FilamentContainer;
import celtech.roboxbase.postprocessor.PrintJobStatistics;
import celtech.roboxbase.printerControl.PrinterStatus;
import celtech.roboxbase.printerControl.model.Printer;
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
    private String printerWebColourString;
    private String printerStatusString;

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
    private int[] nozzleTemperature;

    //Bed
    private int bedTemperature;

    //Print info
    private String printJobName;
    private String printJobSettings;
    private int etcSeconds;

    //Material
    private String[] attachedFilamentNames = null;
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
        PrinterIDResponse printerIDResponse = printer.getLastIdentityResponse();
        printerName = printerIDResponse.getPrinterFriendlyName();
        PrinterColourMap colourMap = PrinterColourMap.getInstance();
        Color displayColour = colourMap.printerToDisplayColour(Color.web(printerIDResponse.getPrinterColour()));

        printerWebColourString = "#" + ColourStringConverter.colourToString(displayColour);

        boolean statusProcessed = false;

        switch (printer.busyStatusProperty().get())
        {
            case LOADING_FILAMENT_D:
            case LOADING_FILAMENT_E:
            case UNLOADING_FILAMENT_D:
            case UNLOADING_FILAMENT_E:
                printerStatusString = BaseLookup.i18n(printer.busyStatusProperty().get().getI18nString());
                statusProcessed = true;
                break;
            default:
                break;
        }

        if (!statusProcessed)
        {
            switch (printer.pauseStatusProperty().get())
            {
                case PAUSED:
                case PAUSE_PENDING:
                case RESUME_PENDING:
                    printerStatusString = BaseLookup.i18n(printer.pauseStatusProperty().get().getI18nString());
                    statusProcessed = true;
                    break;
                default:
                    break;
            }
        }

        if (!statusProcessed)
        {
            printerStatusString = printer.printerStatusProperty().get().getI18nString();
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
        for (int extruderNumber = 0; extruderNumber < numberOfExtruders; extruderNumber++)
        {
            canEjectFilament[extruderNumber] = printer.extrudersProperty().get(extruderNumber) != null && printer.extrudersProperty().get(extruderNumber).isFittedProperty().get() && printer.extrudersProperty().get(extruderNumber).canEjectProperty().get();
        }

        canPause = printer.canPauseProperty().get();
        canPurgeHead = printer.canPurgeHeadProperty().get();
        canRemoveHead = printer.canRemoveHeadProperty().get();
        canResume = printer.canResumeProperty().get();

        //Head
        if (printer.headProperty().get() != null)
        {
            headName = printer.headProperty().get().nameProperty().get();

            nozzleTemperature = new int[printer.headProperty().get().getNozzleHeaters().size()];
            for (int heaterNumber = 0; heaterNumber < printer.headProperty().get().getNozzleHeaters().size(); heaterNumber++)
            {
                nozzleTemperature[heaterNumber] = printer.headProperty().get().getNozzleHeaters().get(heaterNumber).nozzleTemperatureProperty().get();
            }
        } else
        {
            headName = "";
        }

        //Bed
        bedTemperature = printer.getPrinterAncillarySystems().bedTemperatureProperty().get();

        //Print info
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
                } catch (IOException ex)
                {
                }
            }

            etcSeconds = printer.getPrintEngine().progressETCProperty().get();
        } else
        {
            lastPrintJobID = null;
        }

        if (printer.extrudersProperty().get(1).isFittedProperty().get())
        {
            if (attachedFilamentNames == null)
            {
                attachedFilamentNames = new String[2];
                materialLoaded = new boolean[2];
            }

            if (printer.effectiveFilamentsProperty().get(1) != FilamentContainer.UNKNOWN_FILAMENT)
            {
                attachedFilamentNames[1] = printer.effectiveFilamentsProperty()
                        .get(1).getFriendlyFilamentName();
            }

            materialLoaded[1] = printer.extrudersProperty().get(1).filamentLoadedProperty().get();
        } else
        {
            if (attachedFilamentNames == null)
            {
                attachedFilamentNames = new String[1];
            }

            materialLoaded = new boolean[1];
        }

        if (printer.effectiveFilamentsProperty().get(0) != FilamentContainer.UNKNOWN_FILAMENT)
        {
            attachedFilamentNames[0] = printer.effectiveFilamentsProperty()
                    .get(0).getFriendlyFilamentName();
        }

        materialLoaded[0] = printer.extrudersProperty().get(0).filamentLoadedProperty().get();

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

    public int getBedTemperature()
    {
        return bedTemperature;
    }

    public void setBedTemperature(int bedTemperature)
    {
        this.bedTemperature = bedTemperature;
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

    public String getPrintJobSettings()
    {
        return printJobSettings;
    }

    public void setPrintJobSettings(String printJobSettings)
    {
        this.printJobSettings = printJobSettings;
    }

    public String[] getAttachedFilamentNames()
    {
        return attachedFilamentNames;
    }

    public void setAttachedFilamentNames(String[] attachedFilamentNames)
    {
        this.attachedFilamentNames = attachedFilamentNames;
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
