using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Nancy;
using Nancy.Authentication.Forms;
using Nancy.Security;

namespace Stibo.Timesheet.Nancy
{
    public class UserMapper : IUserMapper
    {

        static UserMapper()
        {
        }

        /// <summary>
        /// Get user from database based on guid.
        /// </summary>
        /// <param name="identifier"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        public IUserIdentity GetUserFromIdentifier(Guid identifier, NancyContext context)
        {
            //>> 20150212 cfi/columbus
            var companyCode = context.Request.Session["CompanyCode"].ToString();
            var data = new Stibo.Timesheet.Data.DataContext(companyCode);
            //var data = new Stibo.Timesheet.Data.DataContext();
            //<< 20150212 cfi/columbus

            var user = data.GetUserByUid(identifier);
            user.CompanyCode = companyCode; // 20150212 cfi/columbus

            return user;

            //return user == null
            //    ? null
            //    : new UserIdentity { UserName = user.Name };
        }

        /// <summary>
        /// Get user Guid from database based on username/password. If null, then the user does not exist.
        /// In this case we only use the Username (employee number) as credential.
        /// </summary>
        /// <param name="username"></param>
        /// <param name="password"></param>
        /// <returns></returns>
        public static Guid? ValidateUser(string username, string password, string companyCode)
        {
            //var data = new Stibo.Timesheet.Data.DataContext();
            var data = new Stibo.Timesheet.Data.DataContext(companyCode);
            var passwordHash = hashPassword(password);
            var user = data.GetUserByLogin(username, passwordHash).FirstOrDefault();

            if (user == null)
            {
                return null;
            }

            //TODO: Possibility? Generate new GUID and save it on the user? Not so critical here, since there isn't (supposed to be) any 'remember me' functionality.

            return user.LoginId;
        }

        public static string hashPassword(string password)
        {
            byte[] asciiBytes = Encoding.ASCII.GetBytes(password);
            int value = 0;

            for (var i = 1; i <= asciiBytes.Length; i++)
            {
                value += asciiBytes[i-1] * i + 10;
            }

            return value.ToString();

            //Function makePassword (s)
            // For i = 1 To Len(s)
            //     pswValue = pswValue + 7 + Asc(Mid(s, i, 1)) * i + 3
            // Next
            // makePassword = pswValue
            //End Function
        }

    }


    public class DemoUserMapper : IUserMapper
    {
        private static List<Tuple<string, string, Guid>> users = new List<Tuple<string, string, Guid>>();


        static DemoUserMapper()
        {
            users.Add(new Tuple<string, string, Guid>("admin", "password", new Guid("55E1E49E-B7E8-4EEA-8459-7A906AC4D4C0")));
            users.Add(new Tuple<string, string, Guid>("user", "password", new Guid("56E1E49E-B7E8-4EEA-8459-7A906AC4D4C0")));
        }


        public IUserIdentity GetUserFromIdentifier(Guid identifier, NancyContext context)
        {
            var userRecord = users.Where(u => u.Item3 == identifier).FirstOrDefault();


            return userRecord == null
                        ? null
                        : new UserIdentity { UserName = userRecord.Item1 };
        }


        public static Guid? ValidateUser(string username, string password)
        {
            var userRecord = users.Where(u => u.Item1 == username && u.Item2 == password).FirstOrDefault();


            if (userRecord == null)
            {
                return null;
            }


            return userRecord.Item3;
        }
    }
}