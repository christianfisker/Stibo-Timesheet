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
        public string Id { get; set; }
        public string Name { get; set; }
        public string UserId { get; set; }
        public bool IsActive { get; set; }
        public string Location { get; set; }
        public float SaldoFerie { get; set; }
        public float SaldoFerieFri { get; set; }
        public float SaldoAfspadsering { get; set; }
        public float SaldoAfspadseringEgne { get; set; }    // 20150312 cfi/columbus - Bruges af CPV
        public float SaldoAfspadseringTillaeg { get; set; } // 20150312 cfi/columbus - Bruges af CPV
        public float SaldoGene { get; set; }
        public DateTime ModifiedDate { get; set; }
        public IEnumerable<Timesheet> Timesheets { get; set; }

        /// <summary>
        /// Field from User table.
        /// </summary>
        public string Username { get; set; }
    }
}