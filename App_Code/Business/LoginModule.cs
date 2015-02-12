using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using Stibo.Timesheet.Data;

namespace Stibo.Timesheet.Business
{
    public class LoginCredentials
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string CompanyCode { get; set; } // 20150212 cfi/columbus
    }

    /// <summary>
    /// Summary description for Class1
    /// </summary>
    public class LoginModule
    {
        //public LoginModule()
        //{
        //    //
        //    // TODO: Add constructor logic here
        //    //
        //}

        //public static User Logon(LoginCredentials login)
        //{
        //    //TODO: Get datacontext from some service...
        //    //TODO: Handle the login procedure.... set session variables, set role etc...

        //    // if we are logged in already, then logoff first
        //    // get user
        //    // set logged in user
        //    // return result

        //    var user = User.Current();

        //    if (user.Role != UserRole.Anonymous)
        //    {
        //        var data = new DataContext();
        //        var newUser = data.GetUserByLogin(login.Username, login.Password).FirstOrDefault();
        //        if (newUser != null)
        //        {
        //            User.Set(newUser);
        //            user = newUser;
        //        }
        //    }

        //    return user;
        //}

        //public static dynamic Logoff()
        //{
        //    return null;
        //}

    }
}