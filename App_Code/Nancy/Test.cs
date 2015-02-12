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

/// <summary>
/// Summary description for Test
/// </summary>
public class Test : NancyModule
{
    public Test() : base("service")
    {
        Get["/"] = _ => "Root";
        Get["/test"] = _ => "Testing";
        Get["/test/{id}"] = parameters =>
        {
            string id = parameters.id;
            return id;
        };

        Get["/test/{start}/{end}"] = parameters =>
        {
            return string.Format("From: {0}, To: {1}", parameters.start, parameters.end);
        };

        Get["/test/getemployees/{id}"] = _ =>
        {
            var data = new DataContext("SGT");
            return data.GetEmployee(_.id);
        };

        //Get["/login/{id}/{password}"] = _ =>
        //    {
        //        return LoginModule.Login(_.id, _.password);
        //    };

        //Post["/login"] = _ =>
        //    {
        //        var login = this.Bind<LoginCredentials>();
        //        return LoginModule.Logon(login);
        //    };

        //Get["/timesheetoverview"] = _ =>
        //    {
        //        // get employees (one if employee, all if approver/payroll).
        //        // get timesheetheaders for current period
        //        // merge into result collection

        //        var data = new DataContext();

        //        var users = data.GetEmployees();
        //        //var timesheets = data.GetTimesheetsForEmployees(users, "201410", "201420");

        //        return null;
        //        //return timesheets;
        //    };

        Get["/secure"] = x =>
        {
            this.RequiresAuthentication();
            //this.RequiresAnyClaim(new string[]{"employee","approver","payroll"});

            return "secure";
        };

        Get["/unsecure"] = x =>
        {
            return "unsecure";
        };

    }
}