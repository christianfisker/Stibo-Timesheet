using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Stibo.Timesheet
{
    /// <summary>
    /// Summary description for Application
    /// </summary>
    public class Application : HttpApplication
    {
        void Application_Start(object sender, EventArgs e)
        {
            Configuration.Create();
            //Database.ProcessStatusRepository.Create();
            //Core.JobPlanService.Create();
        }

        void Application_End(object sender, EventArgs e)
        {
            //  Code that runs on application shutdown

        }

        void Application_Error(object sender, EventArgs e)
        {
            // Code that runs when an unhandled error occurs

        }

        void Application_BeginRequest(object sender, EventArgs e)
        {
            System.Diagnostics.Stopwatch timer = new System.Diagnostics.Stopwatch();
            Context.Items["Timer"] = timer;
            timer.Start();
        }

        void Application_EndRequest(object sender, EventArgs e)
        {
            System.Diagnostics.Stopwatch timer = (System.Diagnostics.Stopwatch)Context.Items["Timer"];
            timer.Stop();

            //if (Context.Response.ContentType.ToLowerInvariant().Contains("text/html"))
            //{
            //    Context.Response.Write(string.Format("Elapsed time: {0} ms", timer.ElapsedMilliseconds));
            //}
            //else
            //{
            //}
        }

        void Session_Start(object sender, EventArgs e)
        {
            // Code that runs when a new session is started
        }

        void Session_End(object sender, EventArgs e)
        {
            // Code that runs when a session ends. 
            // Note: The Session_End event is raised only when the sessionstate mode
            // is set to InProc in the Web.config file. If session mode is set to StateServer 
            // or SQLServer, the event is not raised.
        }


    }
}