using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Stibo.Timesheet.Models
{

    /// <summary>
    /// Summary description for TimesheetLine
    /// </summary>
    public class TimesheetLine
    {
        public Guid? Id { get; set; }
        public Guid? TimesheetId { get; set; }
        public string EmployeeId { get; set; }
        public string Type { get; set; }
        public float Sunday { get; set; }
        public float Monday { get; set; }
        public float Tuesday { get; set; }
        public float Wednesday { get; set; }
        public float Thursday { get; set; }
        public float Friday { get; set; }
        public float Saturday { get; set; }
    }

}