package celtech.roboxremote.rootDataStructures;

import celtech.roboxbase.BaseLookup;
import celtech.roboxbase.configuration.BaseConfiguration;
import celtech.roboxbase.postprocessor.PrintJobStatistics;
import celtech.roboxbase.printerControl.PrinterStatus;
import celtech.roboxbase.printerControl.model.Printer;
import celtech.roboxremote.PrinterRegistry;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.IOException;

/**
 *
 * @author taldhous
 */
public class PrintJobStatusData
{

    private String printerID;
    private String printerStatusString;
    private String printerStatusEnumValue;

    private boolean canPrint;
    private boolean canPause;
    private boolean canResume;
    private boolean canOpenDoor;
    private boolean canCancel;

    //Print job info
    private String printJobName;
    private String printJobSettings;
    private String printJobProfile;
    private int totalDurationSeconds;
    private int etcSeconds;
    private int currentLayer;
    private int numberOfLayers;

    //Errors
    private String[] activeErrors;

    @JsonIgnore
    private String lastPrintJobID = null;


    public PrintJobStatusData()
    {
        // Jackson deserialization
    }

    public void updateFromPrinterData(String printerID)
    {
        this.printerID = printerID;
        Printer printer = PrinterRegistry.getInstance().getRemotePrinters().get(printerID);

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
        
        if (!statusProcessed)
        {
            printerStatusString = printer.printerStatusProperty().get().getI18nString();
            printerStatusEnumValue = printer.printerStatusProperty().get().name();
        }

        canPrint = printer.canPrintProperty().get();
        canCancel = printer.canCancelProperty().get();
        canOpenDoor = printer.canOpenDoorProperty().get();

        canPause = printer.canPauseProperty().get();
        canResume = printer.canResumeProperty().get();

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

    public boolean isCanPause()
    {
        return canPause;
    }

    public void setCanPause(boolean canPause)
    {
        this.canPause = canPause;
    }

    public boolean isCanResume()
    {
        return canResume;
    }

    public void setCanResume(boolean canResume)
    {
        this.canResume = canResume;
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
    
    public String[] getActiveErrors()
    {
        return activeErrors;
    }

    public void setActiveErrors(String[] activeErrors)
    {
        this.activeErrors = activeErrors;
    }
}
