using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Logging
{
    public class RequestLogMiddleware : BaseRequestLogFilter
    {
        public RequestLogMiddleware(RequestDelegate next) : base(next)
        { }

        public override void PreInvoke(HttpContext context, RequestLogger requestLogger)
        {
            requestLogger.RequestStarted();
        }

        public override void PostInvoke(HttpContext context, RequestLogger requestLogger)
        {
            requestLogger.RequestEnded(context);
        }
    }
}
