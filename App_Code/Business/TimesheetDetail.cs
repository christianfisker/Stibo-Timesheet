using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using Stibo.Timesheet.Data;
using Stibo.Timesheet.Models;

namespace Stibo.Timesheet.Business
{
    public class TimesheetHeaderDTO
    {

    }

    public class TimesheetDetailLineDTO
    {

    }



    public class TimesheetDetailDTO
    {
        public TimesheetHeaderDTO Header { get; set; }
        public IEnumerable<TimesheetDetailLineDTO> Lines { get; set; }
    }


    /// <summary>
    /// Summary description for TimesheetDetail
    /// 
    /// Hent ugeseddel detaljer. 
    /// Skal kunne håndtere forskellige ugeseddel versioner.
    /// Så længe en ugeseddel ikker er overført til AX, kan medarbejder, godkender og løn stadig foretage rettelser.
    /// Hvordan håndterer vi dette? Skal der være forskellige versioner? En automatisk tæller og stempel for hvem og hvornår senest rettet?
    /// </summary>
    public class TimesheetDetail
    {
        IUser _user;

        //Guid? _timesheetId;
        //Models.Timesheet timesheet = null;

        //public TimesheetDetail(Guid? timesheetId)
        //{
        //    _timesheetId = timesheetId;
        //}

        public TimesheetDetail(IUser user)
        {
            _user = user;
        }

        //public void Run()
        //{
        //    // TODO: Må den aktuelle bruger godt se denne ugeseddel??

        //    // Hent ugeseddel data.
        //    using (var dc = new DataContext())
        //    {
        //        timesheet = dc.GetTimesheetHeader(_timesheetId);
        //        if (timesheet != null)
        //        {
        //            timesheet.Lines = dc.GetTimesheetLines(timesheet.Id);
        //        }
        //    }
        //}

        //public dynamic Result
        //{
        //    get
        //    {
        //        if (timesheet != null)
        //            return timesheet;

        //        return new { message = "No timesheet details found!" };
        //    }
        //}

        public object GetTimesheet(Guid? id)
        {
            Models.Timesheet timesheet = null;

            using (var dc = new DataContext(_user.CompanyCode))
            {
                timesheet = dc.GetTimesheetHeader(id);
                if (timesheet != null)
                {
                    if (_user.HasEmployeeAccess(timesheet.EmployeeId))
                    {
                        timesheet.Lines = dc.GetTimesheetLines(timesheet.Id).ToList();
                    }
                    else
                    {
                        return new { 
                            Error = true,
                            ErrorCode = "", 
                            ErrorMessage = "Bruger har ikke adgang til ugeseddel."
                        };
                    }
                }

            }

            if (timesheet != null)
                return timesheet;

            return new
            {
                Error = true,
                ErrorCode = "",
                ErrorMessage = "Ingen ugeseddel fundet."
            };
        }

        /// <summary>
        /// Get a specific history version of the timesheet, based on user role.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="version"></param>
        /// <returns></returns>
        public object GetTimesheet(string employeeId, string weekNum, UserRole role)
        {
            Models.Timesheet timesheet = null;

            if (!_user.HasEmployeeAccess(employeeId))
            {
                throw new Exception("Brugeren har ikke adgang til ugeseddelen.");
                //return new
                //{
                //    Error = true,
                //    ErrorCode = "",
                //    ErrorMessage = "Bruger har ikke adgang til ugeseddel."
                //};
            }

            using (var dc = new DataContext(_user.CompanyCode))
            {
                timesheet = dc.GetTimesheetHeader(employeeId, weekNum, role);
                if (timesheet != null)
                {
                    timesheet.State = "CLOSED"; // Just to make sure the timesheet is not editable on the client. 
                    timesheet.Lines = dc.GetTimesheetLines(timesheet.Id).ToList();
                }
            }

            if (timesheet != null)
                return timesheet;

            throw new Exception("Ingen ugeseddel blev fundet.");
            //return new
            //{
            //    Error = true,
            //    ErrorCode = "",
            //    ErrorMessage = "Ingen ugeseddel fundet."
            //};
        }

        public object WriteTimesheet(Models.Timesheet timesheet)
        {
            // Validating our model.
            var result = ModelValidator.Validate(timesheet);
            if (!result.IsValid)
            {
                return result.Errors;
            }

            //TODO: Validate the individual lines?

            if (timesheet.Id == null)
            {
                // INSERT RECORD

                using (var dc = new DataContext(_user.CompanyCode, true))
                {
                    // Has a record for this employee/week been inserted already?
                    var existingTimesheet = dc.GetTimesheet(timesheet.EmployeeId, timesheet.Week);
                    if (existingTimesheet == null)
                    {
                        timesheet.ModifiedBy = _user.Id;
                        timesheet.ModifiedDate = DateTime.Now;
                        timesheet.ModifiedRole = _user.Role;

                        dc.CreateTimesheet(timesheet);
                        foreach (var line in timesheet.Lines)
                        {
                            line.TimesheetId = timesheet.Id;
                            dc.CreateTimesheetLine(line);
                        }

                        dc.Commit();

                        return true; // TEST
                    }
                    else
                    {
                        // Error
                        return new { Error = true, ErrorCode = 0, Message = "Der er allerede en post i databasen." }; // TEST
                    }
                }
            }
            else
            {
                // UPDATE RECORD

                using (var dc = new DataContext(_user.CompanyCode, true))
                {
                    //Get database version of timesheet for comparison.
                    var existingTimesheet = dc.GetTimesheet(timesheet.EmployeeId, timesheet.Week);

                    if (existingTimesheet.ModifiedDate > timesheet.ModifiedDate)
                        return new { Error = true, ErrorCode = 0, Message = "Posten i databasen er nyere." };

                    //TODO: Do we care about lack of changes to record?? No not currently.

                    #region Update history

                    if (_user.Role == UserRole.Employee && existingTimesheet.ModifiedRole > UserRole.Employee)
                    {   
                        // The current user is an employee, so we delete all existing history.
                        dc.DeleteTimesheetHistory(timesheet.EmployeeId, timesheet.Week, UserRole.Employee);
                    }
                    else if (_user.Role == UserRole.Approver)
                    {
                        if (existingTimesheet.ModifiedRole > UserRole.Approver)
                        {
                            // The current user is an approver, so we only delete history for approvers and above. 
                            dc.DeleteTimesheetHistory(timesheet.EmployeeId, timesheet.Week, UserRole.Approver);
                        }
                        else if (existingTimesheet.ModifiedRole == UserRole.Employee)
                        {
                            // The existing timesheet was edited by an employee, so it is marked as history.
                            existingTimesheet.IsHistory = true;
                            dc.UpdateTimesheet(existingTimesheet);

                            // The existing timesheet is marked as history, so we must make sure this timesheet is inserted into database as new.
                            timesheet.Id = null;
                        }

                    }
                    else if (_user.Role == UserRole.Payroll)
                    {
                        // If the existing timesheet was edited by another role, it must be marked as history.
                        if (existingTimesheet.ModifiedRole < UserRole.Payroll)
                        {
                            existingTimesheet.IsHistory = true;
                            dc.UpdateTimesheet(existingTimesheet);

                            // The existing timesheet is marked as history, so we must make sure this timesheet is inserted into database as new.
                            timesheet.Id = null;
                        }

                    }

                    #endregion // Update history

                    if (timesheet.Id == null)
                    {
                        timesheet.ModifiedBy = _user.Id;
                        timesheet.ModifiedDate = DateTime.Now;
                        timesheet.ModifiedRole = _user.Role;

                        dc.CreateTimesheet(timesheet);
                        foreach (var line in timesheet.Lines)
                        {
                            line.TimesheetId = timesheet.Id;
                            dc.CreateTimesheetLine(line);
                        }
                    }
                    else
                    {
                        timesheet.ModifiedBy = _user.Id;
                        timesheet.ModifiedDate = DateTime.Now;
                        timesheet.ModifiedRole = _user.Role;

                        dc.UpdateTimesheet(timesheet);
                        foreach (var line in timesheet.Lines)
                        {
                            line.TimesheetId = timesheet.Id;
                            dc.UpdateTimesheetLine(line);
                        }

                        if (_user.Role == UserRole.Payroll && timesheet.State == "CLOSED")
                        {
                            dc.CloseTimesheet(timesheet.Id.Value);
                        }

                    }

                    dc.Commit();

                } // end using
            } // end else

            return true;
        }

        public object GetTimesheetHistory(string employeeId, string week)
        {
            if (_user.HasEmployeeAccess(employeeId))
            {

            }

            return null;
        }

    }


}