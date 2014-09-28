using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using Nancy.Security;

namespace Stibo.Timesheet.Models
{

    public interface IUser : IUserIdentity
    {
        long Id { get; set; }
        Guid? LoginId { get; set; }
        string Name { get; set; }
        UserRole Role { get; set; }
        //long? EmployeeId { get; set; }
        Employee Employee { get; set; }

        bool HasEmployeeAccess(long employeeId);
    }


    public enum UserRole : byte
    {
        Blank = 0,
        Employee = 1,
        Approver = 2,
        Payroll = 3
    }


    [Serializable]
    public class User : IUser
    {
        public User()
        {
            UserName = "default";
        }

        public long Id { get; set; }

        public string UserName { get; set; }
        public IEnumerable<string> Claims { get; set; }

        public string Name { get; set; }
        public UserRole Role { get; set; }
        //public long? EmployeeId { get; set; }
        public Employee Employee { get; set; }
        public Guid? LoginId { get; set; }

        public bool HasEmployeeAccess(long employeeId)
        {
            //if (this.Role == UserRole.Employee && this.EmployeeId == employeeId ||
            if (this.Role == UserRole.Employee && Employee.UserId == this.Id ||
                this.Role == UserRole.Approver ||
                this.Role == UserRole.Payroll)
            {
                return true;
            }

            return false;
        }

        //private static string sessionName = "STIBO:User";
        //public static User Current()
        //{
        //    HttpContext context = HttpContext.Current;
        //    User user = null;

        //    object obj = context.Session[sessionName];
        //    if (obj == null)
        //    {
        //        user = new User();
        //        //context.Session[sessionName] = user; // Do we really want to create session state when there is no concrete user?
        //    }
        //    else
        //    {
        //        user = (User)obj;
        //    }

        //    return user;
        //}

        /// <summary>
        /// 
        /// </summary>
        /// <param name="user"></param>
        //public static void Set(User user)
        //{
        //    HttpContext.Current.Session[sessionName] = user;
        //}

    }
}