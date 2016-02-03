package celtech.roboxremote;

import com.google.common.collect.ImmutableMultimap;
import io.dropwizard.servlets.tasks.Task;
import java.io.PrintWriter;
import java.util.Map.Entry;

/**
 *
 * @author ianhudson
 */
public class AdminUpdateTask extends Task
{

    public AdminUpdateTask()
    {
        super("update");
        System.out.println("created");
    }

    @Override
    public void execute(ImmutableMultimap<String, String> parameters, PrintWriter output) throws Exception
    {
        System.out.println("Asked to execute update");
        for (Entry<String, String> entry : parameters.entries())
        {
            System.out.println(entry.getKey() + ":" + entry.getValue());
        }
    }
}
