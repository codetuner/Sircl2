using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Security;
using System.Threading.Tasks;

namespace Sircl.Website.Logging
{
    public class RequestLogExceptionFilter : BaseRequestLogFilter
    {
        public RequestLogExceptionFilter(RequestDelegate next) : base(next)
        { }

        public override void PreInvoke(HttpContext context, RequestLogger requestLogger)
        { }

        public override void PostInvoke(HttpContext context, RequestLogger requestLogger)
        {
            // Try and retrieve the error from the ExceptionHandler middleware
            var exceptionDetails = context.Features.Get<IExceptionHandlerFeature>();
            var ex = exceptionDetails?.Error;

            if (ex != null)
            {
                var aspect = (ex is SecurityException) ? LogAspect.Security : LogAspect.Error;
                requestLogger.SetAspectName(aspect.Name, true);
                requestLogger.WriteLine(ex.ToString());
                WriteExceptionData(requestLogger, "Ex", ex);
            }
        }

        protected void WriteExceptionData(RequestLogger logger, string path, Exception ex)
        {
            if (ex.Data != null)
            {
                foreach (DictionaryEntry entry in ex.Data)
                {
                    try
                    {
                        logger.WithData(path + "." + Convert.ToString(entry.Key), Convert.ToString(entry.Value));
                    }
                    catch (Exception) { }
                }
            }
            if (ex.InnerException != null)
            {
                WriteExceptionData(logger, path + ".Inner", ex.InnerException);
            }
            if (ex is AggregateException agex)
            {
                var i = 0;
                foreach (var subex in agex.InnerExceptions)
                {
                    WriteExceptionData(logger, path + ".Inner[" + i + "]", subex);
                    i++;
                }
            }
        }
    }
}
