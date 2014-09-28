using System.Collections.Generic;
using Nancy.Security;

namespace Stibo.Timesheet.Nancy
{
    //public interface ITimesheetUserIdentity : IUserIdentity
    //{
    //    string Role { get; set; }
    //    string Id { get; set; }
    //}

    public class UserIdentity : IUserIdentity
    {
        public string UserName { get; set; }
        public IEnumerable<string> Claims { get; set; }
    }

}