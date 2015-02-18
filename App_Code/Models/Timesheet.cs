using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Stibo.Timesheet.Models
{
    /// <summary>
    /// Summary description for Timesheet
    /// </summary>
    public class Timesheet : IValidatableObject
    {
        public Guid? Id { get; set; }
        public string EmployeeId { get; set; }
        public string Week { get; set; }
        /// <summary>
        /// Produktionssted. Hvilken type ugeseddel der er tale om.
        /// </summary>
        public string Location { get; set; }
        public string Machine { get; set; }
        public string Shift { get; set; }
        public string Comment { get; set; }
        public bool HasLeadPressSupplement { get; set; }
        public float Supplement1Hours { get; set; }
        public float Supplement2Hours { get; set; }
        public string State { get; set; }
        public string Version { get; set; }
        public DateTime ModifiedDate { get; set; }
        public string ModifiedBy { get; set; }
        public UserRole ModifiedRole { get; set; }
        public string ModifiedByName { get; set; }
        public bool IsHistory { get; set; }

        // 20150217
        public string Forlaegning { get; set; } 
        ////>> 20150211 cfi
        //public bool TreForlaegning { get; set; }
        //public bool FireForlaegning { get; set; }
        //public bool FemForlaegning { get; set; }
        //public bool Raadighedsvagt { get; set; }
        ////<< 20150211 cfi

        public List<TimesheetLine> Lines { get; set; }

        /// <summary>
        /// Used by Dapper. Do not delete.
        /// </summary>
        public Timesheet()
        {

        }

        public Timesheet(Employee employee, string week)
        {
            EmployeeId = employee.Id;
            Week = week;
            Location = employee.Location;
            State = "BLANK";
        }

        /// <summary>
        /// This is not working! Is not being called by Nancy!!
        /// </summary>
        /// <param name="validationContext"></param>
        /// <returns></returns>
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            //if (EmployeeId == 0)
            //{
            //    yield return new ValidationResult("EmployeeId must be defined", new[] { "EmployeeId" });
            //}

            if (string.IsNullOrEmpty(Week) || Week.Length != 6)
            {
                yield return new ValidationResult("Week must be defined and have the format YYYYWW", new[] { "Week" });
            }

            if (string.IsNullOrEmpty(Location))
            {
                yield return new ValidationResult("Location must be defined", new[] { "Location" });
            }
        }

        public bool Write()
        {
            return false;
        }
    }
}