using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Stibo.Timesheet.Models
{
    /// <summary>
    /// Summary description for ModelValidator
    /// </summary>
    public class ModelValidator
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="objectToValidate"></param>
        /// <returns></returns>
        public static ModelValidatorResult Validate(IValidatableObject objectToValidate)
        {
            var context = new ValidationContext(objectToValidate, serviceProvider: null, items: null);
            var results = new List<ValidationResult>();

            if (Validator.TryValidateObject(
                objectToValidate,
                context,
                results,
                validateAllProperties: true))
            {
                return new ModelValidatorResult { IsValid = true };
            }

            return new ModelValidatorResult { IsValid = false, Errors = results };
        }

        /// <summary>
        /// Alternative validation. Not in use.
        /// </summary>
        /// <param name="objectToValidate"></param>
        /// <param name="results"></param>
        /// <returns></returns>
        public static bool TryValidate(IValidatableObject objectToValidate, out ICollection<ValidationResult> results)
        {
            var context = new ValidationContext(objectToValidate, serviceProvider: null, items: null);
            results = new List<ValidationResult>();

            return Validator.TryValidateObject(
                objectToValidate,
                context,
                results,
                validateAllProperties: true
            );
        }
    }

    public class ModelValidatorResult
    {
        public bool IsValid { get; set; }
        public IEnumerable<ValidationResult> Errors { get; set; }
    }
}