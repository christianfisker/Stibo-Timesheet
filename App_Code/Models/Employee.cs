using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Stibo.Timesheet.Models
{
    /// <summary>
    /// Summary description for Employee
    /// </summary>
    public class Employee
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public long UserId { get; set; }
        public bool IsActive { get; set; }
        public string Location { get; set; }
        public float SaldoFerie { get; set; }
        public float SaldoFerieFri { get; set; }
        public float SaldoAfspadsering { get; set; }
        public float SaldoGene { get; set; }
        public DateTime ModifiedDate { get; set; }
        public IEnumerable<Timesheet> Timesheets { get; set; }
    }
}