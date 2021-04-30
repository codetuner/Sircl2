using Microsoft.AspNetCore.Builder;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Logging
{
    public static class RequestLoggerExtensions
    {
        public static IApplicationBuilder UseRequestLog(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<RequestLogMiddleware>();
        }

        public static IApplicationBuilder UseRequestLogDuration(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<RequestLogDurationFilter>();
        }

        public static IApplicationBuilder UseRequestLogException(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<RequestLogExceptionFilter>();
        }
    }
}
