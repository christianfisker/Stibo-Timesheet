using System;
using Nancy;
using Nancy.Authentication.Forms;
using Nancy.Bootstrapper;
using Nancy.Responses;
using Nancy.Responses.Negotiation;
using Nancy.TinyIoc;
using Nancy.Json;

namespace Stibo.Timesheet.Nancy
{
    public class FormsAuthBootstrapper : DefaultNancyBootstrapper
    {
        protected override void ConfigureApplicationContainer(TinyIoCContainer container)
        {
            // We don't call "base" here to prevent auto-discovery of
            // types/dependencies
        }

        protected override void ApplicationStartup(TinyIoCContainer container, IPipelines pipelines)
        {
            base.ApplicationStartup(container, pipelines);

            pipelines.OnError += HandleExceptions;

            JsonSettings.MaxJsonLength = int.MaxValue; // Because of max payload exception occured in LIVE
        }

        protected override void ConfigureRequestContainer(TinyIoCContainer container, NancyContext context)
        {
            base.ConfigureRequestContainer(container, context);


            // Here we register our user mapper as a per-request singleton.
            // As this is now per-request we could inject a request scoped
            // database "context" or other request scoped services.
            container.Register<IUserMapper, UserMapper>();
        }

        protected override void RequestStartup(TinyIoCContainer requestContainer, IPipelines pipelines, NancyContext context)
        {
            // At request startup we modify the request pipelines to
            // include forms authentication - passing in our now request
            // scoped user name mapper.
            //
            // The pipelines passed in here are specific to this request,
            // so we can add/remove/update items in them as we please.
            var formsAuthConfiguration =
                new FormsAuthenticationConfiguration()
                {
                    RedirectUrl = "~/login",
                    UserMapper = requestContainer.Resolve<IUserMapper>(),
                };

            FormsAuthentication.Enable(pipelines, formsAuthConfiguration);
        }

        private static Response HandleExceptions(NancyContext ctx, Exception ex)
        {
            return ErrorResponse.FromException(ex);

            //var result = new Response();

            //result.ReasonPhrase = ex.Message;

            //if (ex is NotImplementedException)
            //{
            //    result.StatusCode = HttpStatusCode.NotImplemented;
            //}
            //else if (ex is UnauthorizedAccessException)
            //{
            //    result.StatusCode = HttpStatusCode.Unauthorized;
            //}
            //else if (ex is ArgumentException)
            //{
            //    result.StatusCode = HttpStatusCode.BadRequest;
            //}
            //else
            //{
            //    // An unexpected exception occurred!
            //    return ErrorResponse.FromException(ex);
            //    //result.StatusCode = HttpStatusCode.InternalServerError;
            //}

            //return result;
        }

    }

    public class ErrorTest
    {
        public string Message { get; set; }
    }

    /// <summary>
    /// I want errors returned as JSON objects. This helps with that.
    /// http://paulstovell.com/blog/consistent-error-handling-with-nancy
    /// </summary>
    public class ErrorResponse : JsonResponse
    {
        readonly Error error;

        private ErrorResponse(Error error)
            : base(error, new DefaultJsonSerializer())
        {
            //Guard.ArgumentNotNull(error, "error");
            this.error = error;
        }

        public string ErrorMessage { get { return error.ErrorMessage; } }
        public string FullException { get { return error.FullException; } }
        public string[] Errors { get { return error.Errors; } }

        public static ErrorResponse FromMessage(string message)
        {
            var response = new ErrorResponse(new Error { ErrorMessage = message });
            response.StatusCode = HttpStatusCode.BadRequest;
            return response;
        }

        public static ErrorResponse FromException(Exception ex)
        {
            var exception = ex; //ex.GetRootError();

            var summary = exception.Message;

            //if (exception is WebException || exception is SocketException)
            //{
            //    // Commonly returned when connections to RavenDB fail
            //    summary = "The Octopus windows service may not be running: " + summary;
            //}

            var statusCode = HttpStatusCode.InternalServerError;
            var error = new Error { ErrorMessage = summary, FullException = exception.ToString() };

            // Special cases
            //if (exception is ResourceNotFoundException)
            //{
            //    statusCode = HttpStatusCode.NotFound;
            //    error.FullException = null;
            //}

            //if (exception is OctopusSecurityException)
            //{
            //    statusCode = HttpStatusCode.Forbidden;
            //    error.FullException = null;
            //}

            var response = new ErrorResponse(error);
            response.StatusCode = statusCode;
            return response;
        }

        class Error
        {
            public string ErrorMessage { get; set; }

            //[JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
            public string FullException { get; set; }

            //[JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
            public string[] Errors { get; set; }
        }
    }
}