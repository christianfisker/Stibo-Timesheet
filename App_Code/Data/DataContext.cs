using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;

using Stibo.Timesheet.Models;

using Dapper;

namespace Stibo.Timesheet.Data
{
    /// <summary>
    /// Summary description for Context
    /// </summary>
    public class DataContext : IDisposable
    {
        IDbConnection _connection = null;
        IDbTransaction _transaction = null;
        bool _useTransaction = false;

        public DataContext()
        {
        }

        public DataContext(bool useTransaction)
        {
            _useTransaction = useTransaction;
        }

        public User GetUserByUid(Guid loginId)
        {
            string sql = @"select * from Users u 
                left join Employees e on e.UserId = u.Id 
                where u.LoginId = @loginId";

            return Connection.Query<User, Employee, User>(sql, (user, employee) => { user.Employee = employee; return user; }, new { loginId = loginId }).SingleOrDefault();
        }

        public IEnumerable<User> GetUserByLogin(string username, string password)
        {
            string sql = @"select * from Users u 
                left join Employees e on e.UserId = u.Id 
                where u.Username = @username and u.Password = @password";

            return Connection.Query<User, Employee, User>(sql, (user, employee) => { user.Employee = employee; return user; }, new { username = username, password = password });
        }


        ///// <summary>
        ///// Administrator function??
        ///// </summary>
        ///// <returns></returns>
        //public IEnumerable<User> GetUsers()
        //{
        //    return Connection.Query<User>("select * from Users");
        //}

        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public Employee GetEmployee(long? id)
        {
            return Connection.Query<Employee>("select * from Employees where Id = @id", new { id = id }).FirstOrDefault();
        }

        /// <summary>
        /// Get employee for the passed user. Employees has a reference to Users. Users know nothing of Employees.
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public Employee GetEmployeeForUser(string userId)
        {
            return Connection.Query<Employee>("select * from Employees where UserId = @userId", new { userId = userId }).FirstOrDefault();
        }

        public IEnumerable<Employee> GetEmployees()
        {
            string sql = @"select em.*,us.Username from Employees em
                join Users as us on us.Id = em.UserId
                order by us.username";

            return Connection.Query<Employee>(sql);
            //return Connection.Query<Employee>("select * from Employees");
        }

        public IEnumerable<Models.Timesheet> GetTimesheetsForEmployee(string emplId, string startWeek, string endWeek)
        {
            return Connection.Query<Models.Timesheet>("SELECT * FROM Timesheets WHERE EmployeeId = @emplId AND Week between @startWeek AND @endWeek AND IsHistory = 0 ORDER BY Week", new { emplId = emplId, startWeek = startWeek, endWeek = endWeek });
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public Models.Timesheet GetTimesheet(Guid id)
        {
            string sql = @"select * from Timesheets t 
                left join TimesheetLines tl on tl.TimesheetId = t.Id 
                where t.id = @id";

            return Connection.Query<Models.Timesheet, TimesheetLine, Models.Timesheet>
            (
                sql,
                (timesheet, timesheetLine) => {
                    timesheet.Lines.Add(timesheetLine);
                    return timesheet; 
                }, 
                new { id = id })
            .SingleOrDefault();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="employeeId"></param>
        /// <param name="week"></param>
        /// <returns></returns>
        public Models.Timesheet GetTimesheet(string employeeId, string week)
        {
            Models.Timesheet ret = null;

            string sql = @"select * from Timesheets t 
                left join TimesheetLines tl on tl.TimesheetId = t.Id 
                where t.EmployeeId = @employeeId and t.Week = @week and IsHistory = 0";

            var result = Connection.Query<Models.Timesheet, TimesheetLine, Models.Timesheet>
            (
                sql,
                (timesheet, timesheetLine) => {
                    if (ret == null)
                    {
                        ret = timesheet;
                    };

                    if (ret.Lines == null)
                        ret.Lines = new List<TimesheetLine>(); // Hm.... lazy initialization...
                    ret.Lines.Add(timesheetLine);
                    return null;// ret;
                },
                new { employeeId = employeeId, week = week }, 
                Transaction
            );

            //var result = Connection.Query<Models.Timesheet, TimesheetLine, Models.Timesheet>
            //(
            //    sql,
            //    (timesheet, timesheetLine) =>
            //    {
            //        if (timesheet.Lines == null)
            //            timesheet.Lines = new List<TimesheetLine>(); // Hm.... lazy initialization...
            //        timesheet.Lines.Add(timesheetLine);
            //        return timesheet;
            //    },
            //    new { employeeId = employeeId, week = week },
            //    Transaction
            //);


            // NOPE.. der kommer 11 objekter retur!
            return ret;
            //return result.SingleOrDefault();
        }

        public Models.Timesheet GetTimesheetHeader(Guid? id)
        {
            return Connection.Query<Models.Timesheet>("select top 1 * from Timesheets where Id = @id and isHistory = 0", new { id = id }).FirstOrDefault();
        }

        public Models.Timesheet GetTimesheetHeader(string employeeId, string weekNum, UserRole role)
        {
            return Connection.Query<Models.Timesheet>("SELECT TOP 1 * FROM Timesheets WHERE EmployeeId = @employeeId AND [Week] = @weekNum AND ModifiedRole = @role AND ([State] = 'CLOSED' OR IsHistory = 1)",
                new { employeeId = employeeId, weekNum = weekNum, role = role })
                .FirstOrDefault();
        }

        public IEnumerable<TimesheetLine> GetTimesheetLines(Guid? timesheetId)
        {
            return Connection.Query<TimesheetLine>("select * from TimesheetLines where TimesheetId = @timesheetId order by [Type]", new { timesheetId = timesheetId });
        }

        public bool CreateTimesheet(Models.Timesheet timesheet)
        {
            string sql = @"
                INSERT INTO Timesheets(
                    EmployeeId,
                    Week,
                    Location,
                    Machine,
                    Shift,
                    Comment,
                    HasLeadPressSupplement,
                    State,
                    ModifiedDate,
                    ModifiedBy,
                    ModifiedRole
                )
                OUTPUT Inserted.Id
                VALUES(
                    @EmployeeId,
                    @Week,
                    @Location,
                    @Machine,
                    @Shift,
                    @Comment,
                    @HasLeadPressSupplement,
                    @State,
                    @ModifiedDate,
                    @ModifiedBy,
                    @ModifiedRole
                )";

            var row = Connection.Query(
                sql,
                timesheet,
                Transaction
            ).Single();

            timesheet.Id = (Guid)row.Id;

            return true;
        }

        public bool CreateTimesheetLine(TimesheetLine line)
        {
            string sql = @"
                INSERT INTO TimesheetLines(
                    TimesheetId,
                    EmployeeId,
                    [Type],
                    Sunday,
                    Monday,
                    Tuesday,
                    Wednesday,
                    Thursday,
                    Friday,
                    Saturday
                )
                OUTPUT Inserted.Id
                VALUES(
                    @TimesheetId,
                    @EmployeeId,
                    @Type,
                    @Sunday,
                    @Monday,
                    @Tuesday,
                    @Wednesday,
                    @Thursday,
                    @Friday,
                    @Saturday
                )";

            var row = Connection.Query(
                sql,
                line,
                Transaction
            ).Single();

            line.Id = (Guid)row.Id;

            return true;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="timesheet"></param>
        /// <returns></returns>
        public bool UpdateTimesheet(Models.Timesheet timesheet)
        {
            string sql = @"
                UPDATE Timesheets SET
                    Machine = @Machine,
                    Shift = @Shift,
                    Comment = @Comment,
                    HasLeadPressSupplement = @HasLeadPressSupplement,
                    State = @State,
                    ModifiedDate = @ModifiedDate,
                    ModifiedBy = @ModifiedBy,
                    ModifiedRole = @ModifiedRole,
                    IsHistory = @IsHistory
                WHERE
                    Id = @Id
                ";

            var count = Connection.Execute(
                sql,
                timesheet,
                Transaction
            );

            return count == 1;
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="line"></param>
        /// <returns></returns>
        public bool UpdateTimesheetLine(TimesheetLine line)
        {
            string sql = @"
                UPDATE TimesheetLines SET
                    [Type] = @Type,
                    Sunday = @Sunday,
                    Monday = @Monday,
                    Tuesday = @Tuesday,
                    Wednesday = @Wednesday,
                    Thursday = @Thursday,
                    Friday = @Friday,
                    Saturday = @Saturday
                WHERE
                    Id = @Id
                ";

            var count = Connection.Execute(
                sql,
                line,
                Transaction
            );

            return count == 1;
        }

        public bool DeleteTimesheetHistory(string employeeId, string week, UserRole role)
        {
            string sql = @"DELETE FROM Timesheets WHERE EmployeeId = @employeeId AND [Week] = @week AND IsHistory = 1 AND ModifiedRole >= @role";

            var count = Connection.Execute(sql, new { employeeId = employeeId, week = week, role = role }, Transaction);

            return true;
        }

        /// <summary>
        /// Mark a timesheet ready for transfer to Axapta.
        /// Timesheet must have state == 'CLOSED' and IsRead == -1.
        /// </summary>
        /// <param name="timesheetId"></param>
        /// <returns></returns>
        public bool CloseTimesheet(Guid timesheetId)
        {
            string sql = @"UPDATE Timesheet SET IsRead = 0 WHERE Id = @timesheetId AND State = 'CLOSED' AND IsRead = -1";
            var count = Connection.Execute(sql, new { timesheetId = timesheetId }, Transaction);
            return count == 1;
        }

        /// <summary>
        /// mark a timesheet as no longer ready for transfer to Axapta.
        /// Timesheet must not yet have been transfered, therefore IsRead == 0.
        /// </summary>
        /// <param name="timesheetId"></param>
        /// <returns></returns>
        public bool OpenTimesheet(Guid timesheetId)
        {
            string sql = @"UPDATE Timesheet SET IsRead = -1 WHERE Id = @timesheetId AND State = 'CLOSED' AND IsRead = 0";
            var count = Connection.Execute(sql, new { timesheetId = timesheetId }, Transaction);
            return count == 1;

        }

        //protected IDbCommand CreateCommand()
        //{
        //    var command = Connection.CreateCommand();

        //    command.Transaction = _transaction;

        //    return command;
        //}

        protected IDbConnection Connection
        {
            get
            {
                if (_connection == null)
                {
                    _connection = new SqlConnection(Configuration.ConnectionString);
                    _connection.Open();

                    if (_useTransaction)
                    {
                        _transaction = _connection.BeginTransaction();
                    }
                }

                return _connection;
            }
        }

        protected IDbTransaction Transaction
        {
            get
            {
                return _transaction;
            }
        }

        /// <summary>
        /// Commit a pending transaction.
        /// </summary>
        /// <returns></returns>
        public bool Commit()
        {
            if (_transaction != null)
            {
                _transaction.Commit();
                return true;
            }

            return false;
        }

        public void Dispose()
        {
            _connection.Dispose();
        }

        //public T SetIdentity<T>()
        //{
        //    //dynamic identity = Connection.Query("SELECT @@IDENTITY AS Id", null, Transaction).Single();
        //    dynamic identity = Connection.Query("SELECT SCOPE_IDENTITY() AS Id", null, Transaction).Single();
        //    T newId = (T)identity.Id;
        //    return newId;
        //}

        //public static void SetIdentity<T>(IDbConnection connection, Action<T> setId)
        //{
        //    dynamic identity = connection.Query("SELECT @@IDENTITY AS Id").Single();
        //    T newId = (T)identity.Id;
        //    setId(newId);
        //}

        //public static T SetIdentity<T>(IDbConnection connection)
        //{
        //    dynamic identity = connection.Query("SELECT @@IDENTITY AS Id").Single();
        //    T newId = (T)identity.Id;
        //    return newId;
        //}
    }
}