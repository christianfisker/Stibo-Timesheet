﻿using System;
using System.Collections.Generic;
using System.Linq;

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
            var data = new Stibo.Timesheet.Data.DataContext();
            var user = data.GetUserByUid(identifier);

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
        public static Guid? ValidateUser(string username, string password)
        {
            var data = new Stibo.Timesheet.Data.DataContext();
            //var user = data.GetUserByLogin(username);
            var user = data.GetUserByLogin(username, password).FirstOrDefault();

            if (user == null)
            {
                return null;
            }

            //TODO: Possibility? Generate new GUID and save it on the user? Not so critical here, since there isn't (supposed to be) any 'remember me' functionality.

            return user.LoginId;
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