package celtech.roboxremote.rootDataStructures;

import celtech.roboxbase.printerControl.model.Head;
import celtech.roboxbase.printerControl.model.Printer;
import celtech.roboxbase.utils.PrinterUtils;
import celtech.roboxremote.PrinterRegistry;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 *
 * @author taldhous
 */
public class HeadEEPROMData
{
    private String printerID;

    private String name;
    private String typeCode;
    private String serialNumber;
    private String week;
    private String year;
    private String PONumber;
    private String checksum;
    private String uniqueID;
    private int heaterCount;
    private int nozzleCount;
    private boolean valveFitted;
    private boolean dualMaterialHead;
    private float maxTemp = -1.0F;
    private float beta = -1.0F;
    private float tCal = -1.0F;
    private float hourCount = -1.0F;
    private float nozzle0XOffset = -1.0F;
    private float nozzle0YOffset = -1.0F;
    private float nozzle0ZOverrun = -1.0F;
    private float nozzle0BOffset = -1.0F;
    private float nozzle0LastFTemp = -1.0F;
    private float nozzle1XOffset = -1.0F;
    private float nozzle1YOffset = -1.0F;
    private float nozzle1ZOverrun = -1.0F;
    private float nozzle1BOffset = -1.0F;
    private float nozzle1LastFTemp = -1.0F;

    public HeadEEPROMData()
    {
        // Jackson deserialization
    }

    public void updateFromPrinterData(String printerID)
    {
        this.printerID = printerID;
        Printer printer = PrinterRegistry.getInstance().getRemotePrinters().get(printerID);
        Head printerHead = printer.headProperty().get();
            
        //Head
        if (printerHead != null)
        {
            name = printerHead.nameProperty().get().trim();
            dualMaterialHead = printerHead.headTypeProperty().get() == Head.HeadType.DUAL_MATERIAL_HEAD;
            typeCode = printerHead.typeCodeProperty().get().trim();
            valveFitted = (printerHead.valveTypeProperty().get() == Head.ValveType.FITTED);
            week= printerHead.getWeekNumber();
            year = printerHead.getYearNumber();
            PONumber = printerHead.getPONumber();
            serialNumber = printerHead.getSerialNumber();
            checksum = printerHead.getChecksum();
            uniqueID = printerHead.uniqueIDProperty().get().trim();

            heaterCount = printerHead.getNozzleHeaters().size();
            if (heaterCount > 0)
            {
                nozzle0LastFTemp = printerHead.getNozzleHeaters().get(0).lastFilamentTemperatureProperty().get();
                maxTemp = printerHead.getNozzleHeaters().get(0).maximumTemperatureProperty().get();
                beta = printerHead.getNozzleHeaters().get(0).betaProperty().get();
                tCal = printerHead.getNozzleHeaters().get(0).tCalProperty().get();
            }

            if (heaterCount > 1)
            {
                nozzle0LastFTemp = printerHead.getNozzleHeaters().get(1).lastFilamentTemperatureProperty().get();
            }

            hourCount = printerHead.headHoursProperty().get();

            if (valveFitted)
            {
                nozzle0BOffset = printerHead.getNozzles().get(0).bOffsetProperty().get();
            }

            nozzleCount = printerHead.getNozzles().size();
            nozzle0XOffset = printerHead.getNozzles().get(0).xOffsetProperty().get();
            nozzle0YOffset = printerHead.getNozzles().get(0).yOffsetProperty().get();
            if (nozzleCount > 1)
            {
                if (valveFitted)
                {
                    nozzle1BOffset = printerHead.getNozzles().get(1).bOffsetProperty().get();
                }

                nozzle1XOffset = printerHead.getNozzles().get(1).xOffsetProperty().get();
                nozzle1YOffset = printerHead.getNozzles().get(1).yOffsetProperty().get();
            }
            
            float nozzle0Offset = printerHead.getNozzles().get(0).zOffsetProperty().get();
            float nozzle1Offset = nozzle0Offset;

            if (nozzleCount > 1)
            {
                nozzle1Offset = printerHead.getNozzles().get(1).zOffsetProperty().get();
            }
            nozzle0ZOverrun = PrinterUtils.deriveNozzle1OverrunFromOffsets(nozzle0Offset, nozzle1Offset);
            if (nozzleCount > 1)
            {
                nozzle1ZOverrun = PrinterUtils.deriveNozzle2OverrunFromOffsets(nozzle0Offset, nozzle1Offset);
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
    public String getTypeCode()
    {
        return typeCode;
    }

    @JsonProperty
    public void setTypeCode(String typeCode)
    {
        this.typeCode = typeCode;
    }
    
    @JsonProperty
    public boolean getValveFitted()
    {
        return valveFitted;
    }

    @JsonProperty
    public void setValveFitted(boolean valveFitted)
    {
        this.valveFitted = valveFitted;
    }

    @JsonProperty
    public String getSerialNumber()
    {
        return serialNumber;
    }

    @JsonProperty
    public void setSerialNumber(String serialNumber)
    {
        this.serialNumber = serialNumber;
    }

    @JsonProperty
    public String getWeek()
    {
        return week;
    }

    @JsonProperty
    public void setWeek(String week)
    {
        this.week = week;
    }

    @JsonProperty
    public String getYear()
    {
        return year;
    }

    @JsonProperty
    public void setYear(String year)
    {
        this.year = year;
    }

    @JsonProperty
    public String getPONumber()
    {
        return PONumber;
    }

    @JsonProperty
    public void setPONumber(String PONumber)
    {
        this.PONumber = PONumber;
    }

    @JsonProperty
    public String getChecksum()
    {
        return checksum;
    }

    @JsonProperty
    public void setChecksum(String checksum)
    {
        this.checksum = checksum;
    }

    @JsonProperty
    public String getUniqueID()
    {
        return uniqueID;
    }

    @JsonProperty
    public void setUniqueID(String uniqueID)
    {
        this.uniqueID = uniqueID;
    }
 
    @JsonProperty
    public boolean getDualMaterialHead()
    {
        return dualMaterialHead;
    }

    @JsonProperty
    public void setDualMaterialHead(boolean dualMaterialHead)
    {
        this.dualMaterialHead = dualMaterialHead;
    }

    @JsonProperty
    public int getHeaterCount()
    {
        return heaterCount;
    }

    @JsonProperty
    public void setHeaterCount(int heaterCount)
    {
        this.heaterCount = heaterCount;
    }

    @JsonProperty
    public int getNozzleCount()
    {
        return nozzleCount;
    }

    @JsonProperty
    public void setNozzleCount(int nozzleCount)
    {
        this.nozzleCount = nozzleCount;
    }

    @JsonProperty
    public float getMaxTemp()
    {
        return maxTemp;
    }

    @JsonProperty
    public void setMaxTemp(float maxTemp)
    {
        this.maxTemp = maxTemp;
    }

    @JsonProperty
    public float getBeta()
    {
        return beta;
    }

    @JsonProperty
    public void setBeta(float beta)
    {
        this.beta = beta;
    }

    @JsonProperty
    public float getTCal()
    {
        return tCal;
    }

    @JsonProperty
    public void setTCal(float tCal)
    {
        this.tCal = tCal;
    }

    @JsonProperty
    public float getHourCount()
    {
        return hourCount;
    }

    @JsonProperty
    public void setHourCount(float hourCount)
    {
        this.hourCount = hourCount;
    }

    @JsonProperty
    public float getNozzle0XOffset()
    {
        return nozzle0XOffset;
    }

    @JsonProperty
    public void setNozzle0XOffset(float nozzle0XOffset)
    {
        this.nozzle0XOffset = nozzle0XOffset;
    }

    @JsonProperty
    public float getNozzle0YOffset()
    {
        return nozzle0YOffset;
    }

    @JsonProperty
    public void setNozzle0YOffset(float nozzle0YOffset)
    {
        this.nozzle0YOffset = nozzle0YOffset;
    }

    @JsonProperty
    public float getNozzle0ZOverrun()
    {
        return nozzle0ZOverrun;
    }

    @JsonProperty
    public void setNozzle0ZOverrun(float nozzle0ZOverrun)
    {
        this.nozzle0ZOverrun = nozzle0ZOverrun;
    }
    @JsonProperty
    public float getNozzle0BOffset()
    {
        return nozzle0BOffset;
    }

    @JsonProperty
    public void setNozzle0BOffset(float nozzle0BOffset)
    {
        this.nozzle0BOffset = nozzle0BOffset;
    }
    
    @JsonProperty
    public float getNozzle0LastFTemp()
    {
        return nozzle0LastFTemp;
    }

    @JsonProperty
    public void setNozzle0LastFTemp(float nozzle0LastFTemp)
    {
        this.nozzle0LastFTemp = nozzle0LastFTemp;
    }

    @JsonProperty
    public float getNozzle1XOffset()
    {
        return nozzle1XOffset;
    }

    @JsonProperty
    public void setNozzle1XOffset(float nozzle1XOffset)
    {
        this.nozzle1XOffset = nozzle1XOffset;
    }

    @JsonProperty
    public float getNozzle1YOffset()
    {
        return nozzle1YOffset;
    }

    @JsonProperty
    public void setNozzle1YOffset(float nozzle1YOffset)
    {
        this.nozzle1YOffset = nozzle1YOffset;
    }
    
    @JsonProperty
    public float getNozzle1ZOverrun()
    {
        return nozzle1ZOverrun;
    }

    @JsonProperty
    public void setNozzle1ZOverrun(float nozzle1ZOverrun)
    {
        this.nozzle1ZOverrun = nozzle1ZOverrun;
    }

    @JsonProperty
    public float getNozzle1BOffset()
    {
        return nozzle1BOffset;
    }

    @JsonProperty
    public void setNozzle1BOffset(float nozzle1BOffset)
    {
        this.nozzle1BOffset = nozzle1BOffset;
    }

    @JsonProperty
    public float getNozzle1LastFTemp()
    {
        return nozzle1LastFTemp;
    }

    @JsonProperty
    public void setNozzle1LastFTempp(float nozzle1LastFTemp)
    {
        this.nozzle1LastFTemp = nozzle1LastFTemp;
    }
}
