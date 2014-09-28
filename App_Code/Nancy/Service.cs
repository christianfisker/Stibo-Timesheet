using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using Nancy;
using Nancy.ModelBinding;
using Nancy.Validation;

using Nancy.Authentication.Forms;
using Nancy.Extensions;
using Nancy.Security;

using Stibo.Timesheet.Models;
using Stibo.Timesheet.Business;
using Stibo.Timesheet.Data;

namespace Stibo.Timesheet.Nancy
{
    /// <summary>
    /// Summary description for Service
    /// </summary>
    public class Service : NancyModule
    {
        public Service()
            : base("service")
        {

            Get["/config"] = x =>
            {
                return new ClientSettings(DateTime.Now);
                //return Configuration.ClientSettings;
            };

            Post["/login"] = x =>
            {
                var login = this.Bind<LoginCredentials>();
                var userGuid = UserMapper.ValidateUser(login.Username, login.Password);

                if (userGuid == null)
                {
                    return ErrorResponse.FromMessage("Brugeren kunne ikke findes!");
                    //return Negotiate
                    //    .WithStatusCode(HttpStatusCode.BadRequest)
                    //    .WithModel(new {message = "User not found"});
                }

                return this.Login(userGuid.Value);
            };

            Get["/logout"] = x =>
            {
                this.LogoutWithoutRedirect();
                return true;
                //return this.LogoutWithoutRedirect();
            };

            Get["/user"] = x =>
            {
                this.RequiresAuthentication();

                var user = (IUser)this.Context.CurrentUser;

                return new { Name = user.Name, Role = user.Role };
            };

            Get["timesheetoverview"] = x =>
                {
                    this.RequiresAuthentication();

                    var timesheetOverview = new TimesheetOverview((IUser)this.Context.CurrentUser, DateTime.Now, 6, 10);
                    
                    timesheetOverview.Run();

                    return timesheetOverview.Result;
                };

            Get["employee/{id}"] = parameters =>
                {
                    this.RequiresAuthentication();
                    IUser user = (IUser)this.Context.CurrentUser;

                    if (user.HasEmployeeAccess(parameters.id))
                    {
                        using (var dc = new DataContext())
                        {
                            return dc.GetEmployee(parameters.id);
                        }
                    }

                    return null;
                };

            Get["timesheet/{id}"] = parameters =>
                {
                    this.RequiresAuthentication();
                    IUser user = (IUser)this.Context.CurrentUser;

                    var timesheetDetail = new TimesheetDetail(user);

                    return timesheetDetail.GetTimesheet(parameters.id);
                };

            Get["timesheetversion/{employeeid}/{week}/{role}"] = parameters =>
            {
                this.RequiresAuthentication();
                IUser user = (IUser)this.Context.CurrentUser;

                UserRole role;

                // Parse {role} into a UserRole.
                if (Enum.TryParse<UserRole>(parameters.role, out role))
                {
                    var timesheetDetail = new TimesheetDetail(user);
                    return timesheetDetail.GetTimesheet(parameters.employeeid, parameters.week, role);
                }

                //TODO: return usefull error to caller
                return null;
            };


            Post["timesheet"] = x =>
                {
                    this.RequiresAuthentication();
                    IUser user = (IUser)this.Context.CurrentUser;

                    Models.Timesheet timesheet = this.Bind();

                    var timesheetDetail = new TimesheetDetail(user);
                    return timesheetDetail.WriteTimesheet(timesheet);

                };

            Get["exception"] = parameters => {

                return ErrorResponse.FromMessage("testing");

                //throw new Exception("CFI - exception on server");
                //return "Hello world";
            };

        }
    }

}