using System;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
using System.Linq;
using System.Web;

namespace Stibo.Timesheet
{
    public static class Configuration
    {
        //public enum Company
        //{
        //    SGT,
        //    CPV
        //}

        private static bool isCreated = false;
        private static object synclock = new object();

        #region Web.config

        //public static string CompanyCode { get; private set; } // 20150211 cfi/columbus
        //public static Company Company { get; private set; }
        //public static string ConnectionString { get; private set; }
        public static int WeeksBeforeCurrent { get; private set; }
        public static int WeeksAfterCurrent { get; private set; }

        // 20150212 cfi/columbus
        public static Dictionary<string, string> ConnectionStrings = new Dictionary<string, string>(2);

        #endregion

        //public static ClientSettings ClientSettings { get; private set; }

        internal static void Create()
        {
            if (!isCreated)
            {
                lock (synclock)
                {
                    if (!isCreated)
                    {
                        Initialize();
                        isCreated = true;
                    }
                }
            }
        }

        static void Initialize()
        {
            // Web.config settings

            //>> 20150222 cfi 
            //CompanyCode = ConfigurationManager.AppSettings["CompanyCode"];
            //string connectionStringName = ConfigurationManager.AppSettings["CurrentConnectionStringPrefix"] + ":" + CompanyCode;
            //ConnectionString = ConfigurationManager.ConnectionStrings[connectionStringName].ConnectionString;

            string prefix = ConfigurationManager.AppSettings["CurrentConnectionStringPrefix"];
            ConnectionStrings["SGT"] = ConfigurationManager.ConnectionStrings[prefix + ":SGT"].ConnectionString;
            ConnectionStrings["CPV"] = ConfigurationManager.ConnectionStrings[prefix + ":CPV"].ConnectionString;

            //ConnectionString = ConfigurationManager.ConnectionStrings[ConfigurationManager.AppSettings["currentConnectionStringName"]].ConnectionString;
            //<< 20150222 cfi 

            WeeksBeforeCurrent = int.Parse(ConfigurationManager.AppSettings["numWeeksBeforeCurrent"]);
            WeeksAfterCurrent = int.Parse(ConfigurationManager.AppSettings["numWeeksAfterCurrent"]);
        }
    }

    //public class ClientSettings
    //{
    //    Calendar calendar = DateTimeFormatInfo.CurrentInfo.Calendar;

    //    public ClientSettings()
    //        : this(DateTime.Now)
    //    {
    //    }

    //    public ClientSettings(DateTime date)
    //        : this(date, Configuration.WeeksBeforeCurrent, Configuration.WeeksAfterCurrent)
    //    {
    //    }

    //    public ClientSettings(DateTime date, int weeksBefore, int weeksAfter)
    //    {
    //        //var currentWeek = calendar.GetWeekOfYear(date, System.Globalization.CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Sunday);

    //        CurrentDate = date;
    //        //StartDate = calendar.AddWeeks(now, -Configuration.WeeksBeforeCurrent );
    //        //var endDate = calendar.AddWeeks(now, Configuration.WeeksAfterCurrent);

    //        WeekRange range = new WeekRange(date, weeksBefore, weeksAfter);
    //        CurrentWeek = range.CurrentWeek;
    //        VisibleWeeks = range.WeeksAsStrings;
    //    }

    //    public DateTime CurrentDate { get; private set; }
    //    public DateTime StartDate { get; private set; }
    //    public DateTime EndDate { get; private set; }
    //    public string CurrentWeek { get; private set; }
    //    public string[] VisibleWeeks { get; private set; }
    //}


    public interface IWeekRange
    {
        string StartWeek { get; }
        string EndWeek { get; }
        string CurrentWeek { get; }
        string[] Sequence { get; }
    }

    /// <summary>
    /// STIBO vil gerne have at søndag er start på ugen.
    /// I den danske kalender begynder uger om mandagen.
    /// 
    /// Hvis jeg laver en dato til ugenummer konvertering, hvor jeg har sat startdag til at være søndag, 
    /// får jeg en sekvens, omkring årsskiftet, på ...51,52,53,02,03...
    /// Dvs at uge 1 er blevet til uge 53! 
    /// 
    /// TODO: Der skal gøres noget for at håndtere hvis dagsdato er en søndag...
    /// </summary>
    public class WeekRange : IWeekRange
    {
        string[] _weeksAsStrings = null;

        /// <summary>
        /// Builds an array of week identifiers centered on a passed date.
        /// </summary>
        /// <param name="calendar"></param>
        /// <param name="now"></param>
        /// <param name="weeksBefore"></param>
        /// <param name="weeksAfter"></param>
        public WeekRange(DateTime now, int weeksBefore, int weeksAfter, string companyCode)
        {
            Calendar calendar = DateTimeFormatInfo.CurrentInfo.Calendar;

            // Total number of weeks from start to end + current week.
            _weeksAsStrings = new string[weeksBefore + weeksAfter + 1];

            for (int weekOffset = -weeksBefore; weekOffset <= weeksAfter; weekOffset++)
            {
                var date = calendar.AddWeeks(now, weekOffset);

                //>> 20150211 cfi
                //if (Configuration.CompanyCode == "SGT")
                if (companyCode == "SGT")
                {
                    _weeksAsStrings[weeksBefore + weekOffset] = string.Format(
                        "{0}{1:d2}",
                        GetStiboYear(date),
                        GetStiboWeekOfYear(date)
                    );
                }
                else
                {
                    _weeksAsStrings[weeksBefore + weekOffset] = string.Format(
                        "{0}{1:d2}",
                        GetIso8601Year(date),
                        GetIso8601WeekOfYear(date)
                    );
                }

                //_weeksAsStrings[weeksBefore + weekOffset] = string.Format(
                //    "{0}{1:d2}",
                //    GetStiboYear(date),
                //    GetStiboWeekOfYear(date)
                //);
                
                //<< 20150211 cfi

                if (weekOffset == 0)
                {
                    CurrentWeek = _weeksAsStrings[weeksBefore];
                }
            }
        }

        public string[] WeeksAsStrings { get { return _weeksAsStrings; } }

        public string StartWeek
        {
            get
            {
                if (_weeksAsStrings != null && _weeksAsStrings.Length > 0)
                    return _weeksAsStrings[0];

                return string.Empty;
            }
        }

        public string EndWeek
        {
            get
            {
                if (_weeksAsStrings != null && _weeksAsStrings.Length > 0)
                    return _weeksAsStrings[_weeksAsStrings.Length - 1];

                return string.Empty;
            }
        }

        public string CurrentWeek { get; set; }

        public string[] Sequence { get { return _weeksAsStrings; } }

        #region Static

        //
        // http://blogs.msdn.com/b/shawnste/archive/2006/01/24/iso-8601-week-of-year-format-in-microsoft-net.aspx
        //

        private static Calendar calendar = CultureInfo.InvariantCulture.Calendar;

        public static int GetIso8601WeekOfYear(DateTime time)
        {
            // Seriously cheat.  If its Monday, Tuesday or Wednesday, then it'll 
            // be the same week# as whatever Thursday, Friday or Saturday are,
            // and we always get those right
            DayOfWeek day = calendar.GetDayOfWeek(time);
            if (day >= DayOfWeek.Monday && day <= DayOfWeek.Wednesday)
            {
                time = time.AddDays(3);
            }

            // Return the week of our adjusted day
            return calendar.GetWeekOfYear(time, CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);
        }

        /// <summary>
        /// 20150211 cfi/columbus
        /// </summary>
        /// <param name="time"></param>
        /// <returns></returns>
        public static int GetIso8601Year(DateTime time)
        {
            DayOfWeek day = calendar.GetDayOfWeek(time);

            if (day >= DayOfWeek.Monday && day <= DayOfWeek.Wednesday)
            {
                time = time.AddDays(3);
            }

            // Return the year of the adjusted day.
            return time.Year;
        }

        /// <summary>
        /// Stibo uses Sunday as the start of the week, so this is a modified ISO8601 week number.
        /// </summary>
        /// <param name="time"></param>
        /// <returns></returns>
        public static int GetStiboWeekOfYear(DateTime time)
        {
            DayOfWeek day = calendar.GetDayOfWeek(time);

            if (day == DayOfWeek.Sunday)
            {
                time = time.AddDays(4);
            }
            else if (day >= DayOfWeek.Monday && day <= DayOfWeek.Wednesday)
            {
                time = time.AddDays(3);
            }

            // Return the week of our adjusted day
            return calendar.GetWeekOfYear(time, CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);
        }

        public static int GetStiboYear(DateTime time)
        {
            int year = 0;
            int weekOfYear = 0;
            DayOfWeek day = calendar.GetDayOfWeek(time);

            if (day == DayOfWeek.Sunday)
            {
                time = time.AddDays(4);
            }
            else if (day >= DayOfWeek.Monday && day <= DayOfWeek.Wednesday)
            {
                time = time.AddDays(3);
            }

            year = time.Year;
            weekOfYear = calendar.GetWeekOfYear(time, CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);

            if ((weekOfYear >= 52) && (time.Month < 12))
            {
                year--;
            }

            return year;
        }

        #endregion


    }

    /// <summary>
    /// Not in use, but could be an option for future improvement...
    /// </summary>
    public class StiboDateTime
    {
        public DateTime Base { get; private set; }
        public int Year { get; private set; }
        public int Week { get; private set; }

        public StiboDateTime(DateTime time)
        {
            Base = time;
        }


    }

}