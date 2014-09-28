using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

//using Nancy.Security;
using Stibo.Timesheet.Models;
using Stibo.Timesheet.Data;
using Stibo.Timesheet.Nancy;

namespace Stibo.Timesheet.Business
{
    public class TimesheetOverviewEmployeeDTO
    {
        public TimesheetOverviewEmployeeDTO(Employee employee)
        {
            Id = employee.Id;
            Name = employee.Name;
        }

        public long Id { get; set; }
        public string Name { get; set; }
    }

    public class TimesheetOverviewWeekDTO
    {
        public TimesheetOverviewWeekDTO(Models.Timesheet timesheetHeader)
        {
            Id = timesheetHeader.Id;
            Week = timesheetHeader.Week;
            Status = timesheetHeader.State == null ? string.Empty : timesheetHeader.State.ToUpperInvariant();
        }

        public Guid? Id { get; set; }
        public string Week { get; set; }
        public string Status { get; set; }
    }

    public class TimesheetOverviewLineDTO
    {
        //public TimesheetOverviewEmployeeDTO Employee { get; set; }
        public Employee Employee { get; set; }
        public List<TimesheetOverviewWeekDTO> Weeks { get; set; }
    }

    public class TimesheetOverviewDTO
    {
        /// <summary>
        /// Information about the weeks visible in the overview.
        /// </summary>
        public IWeekRange WeekRange { get; set; }

        /// <summary>
        /// List of employees visible in the overview.
        /// </summary>
        public IEnumerable<TimesheetOverviewLineDTO> Employees { get; set; }
    }


    /// <summary>
    /// Hovedklasse for visning af ugesseddel oversigt (TimesheetOverview).
    ///  - En bruger skal være logget på.
    ///  - Validering af input parametre(dato). Muligvis andre filtre senere.
    ///  - Find liste over medarbejdere som brugeren må se.
    ///  - Find ugeseddel data for hver synlig medarbejder.
    ///  - Kombinere data til resultat som kan sendes retur til klienten.
    ///  
    /// Forudsætninger:
    ///  - Der må ikke mangle ugesedler for en medarbejder i det brugte datointerval. Der er ingen validering for dette!
    /// </summary>
    public class TimesheetOverview
    {
        IUser _user;

        IWeekRange _weekRange;
        //ClientSettings _settings; // TEMPORARY SOLUTION!

        List<TimesheetOverviewLineDTO> _result = new List<TimesheetOverviewLineDTO>();

        #region Constructors

        public TimesheetOverview(IUser user, DateTime date, int weeksBefore, int weeksAfter)
        {
            _user = user;
            _weekRange = new WeekRange(date, weeksBefore, weeksAfter);
            //_settings = new ClientSettings(date, weeksBefore, weeksAfter);
        }

        public TimesheetOverview(IUser user, IWeekRange weekRange)
        {
            _user = user;
            _weekRange = weekRange;
        }

        #endregion

        public void Run()
        {
            IEnumerable<Employee> employees = null;

            // Get visible employees and timesheet data for the week range.

            using (var dc = new DataContext())
            {
                employees = GetEmployees(dc, _user);

                foreach (var employee in employees)
                {
                    employee.Timesheets = GetTimesheetsForEmployee(dc, employee, _weekRange);
                }
            }

            // Combine timesheet data into result to return to client.

            if (employees != null)
            {
                foreach (var employee in employees)
                {
                    var line = new TimesheetOverviewLineDTO();
                    //line.Employee = new TimesheetOverviewEmployeeDTO(employee);
                    line.Employee = employee;
                    line.Weeks = new List<TimesheetOverviewWeekDTO>();

                    foreach (var timesheet in employee.Timesheets)
                    {
                        line.Weeks.Add(new TimesheetOverviewWeekDTO(timesheet));
                    }

                    employee.Timesheets = null; // Slet overflødig ugeseddel info.

                    _result.Add(line);
                }
            }

        }

        /// <summary>
        /// Get a list of employees that the passed user is allowed to see.
        /// </summary>
        /// <param name="dc"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        public IEnumerable<Employee> GetEmployees(DataContext dc, IUser user)
        {
            IEnumerable<Employee> employees = null;

            if (user.Role == UserRole.Employee)
            {
                // get only current employee
                var employee = dc.GetEmployeeForUser(user.Id);
                if (employee != null)
                    employees = new List<Employee> { employee };
            }
            else if (user.Role == UserRole.Approver || user.Role == UserRole.Payroll)
            {
                // get all employees
                employees = dc.GetEmployees();
            }

            return employees;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="dc"></param>
        /// <param name="employee"></param>
        /// <param name="startWeek"></param>
        /// <param name="endWeek"></param>
        /// <returns></returns>
        protected IEnumerable<Models.Timesheet> GetTimesheetsForEmployee(DataContext dc, Employee employee, IWeekRange weekRange)
        {
            IEnumerable<Models.Timesheet> timesheets = null;

            // Find ugesedler for medarbejderen i en given periode.
            timesheets = dc.GetTimesheetsForEmployee(employee.Id, weekRange.StartWeek, weekRange.EndWeek);

            // Udfyld eventuelle huller i ugeseddel perioden.
            timesheets = ValidateTimesheets(employee, weekRange, timesheets);

            return timesheets;
        }

        /// <summary>
        /// Hvis der mangler ugesedler i uge-sekvensen, så tilføjes der en blank ugeseddel der hvor den mangler.
        /// </summary>
        /// <param name="employee"></param>
        /// <param name="weekRange"></param>
        /// <param name="timesheets"></param>
        /// <returns></returns>
        protected IEnumerable<Models.Timesheet> ValidateTimesheets(Employee employee, IWeekRange weekRange, IEnumerable<Models.Timesheet> timesheets)
        {
            List<Models.Timesheet> result = new List<Models.Timesheet>(timesheets.Count());

            foreach (var week in weekRange.Sequence)
            {
                var found = timesheets.Where(i => i.Week == week).FirstOrDefault();
                if (found == null)
                {
                    //result.Add(new TimesheetHeader());
                    result.Add(new Models.Timesheet(employee, week));
                }
                else
                {
                    result.Add(found);
                }
            }

            return result;
        }

        //public string StartWeek { get { return _weekRange.StartWeek; } }
        //public string EndWeek { get { return _weekRange.EndWeek; } }

        public dynamic Result { 
            get 
            {
                return new TimesheetOverviewDTO
                {
                    //Settings = _settings,    // TEMPORARY SOLUTION!!
                    WeekRange = _weekRange,
                    Employees = _result
                };

            } 
        }

    }


}