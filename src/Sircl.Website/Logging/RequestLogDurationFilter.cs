using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Logging
{
    public class RequestLogDurationFilter : BaseRequestLogFilter
    {
        public RequestLogDurationFilter(RequestDelegate next) : base(next)
        { }

        public override void PreInvoke(HttpContext context, RequestLogger requestLogger)
        { }

        public override void PostInvoke(HttpContext context, RequestLogger requestLogger)
        {
            if (requestLogger.DurationMs > 5000)
            {
                requestLogger.SetAspectName(LogAspect.Timing.Name, false);
            }
        }
    }
}
