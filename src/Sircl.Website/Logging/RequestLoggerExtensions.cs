using Microsoft.AspNetCore.Builder;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Logging
{
    public static class RequestLoggerExtensions
    {
        public static LoggingBuilder UseArebisRequestLog(this IApplicationBuilder builder)
        {
            return new LoggingBuilder(builder.UseMiddleware<RequestLogMiddleware>());
        }

        public static LoggingBuilder LogSlowRequests(this LoggingBuilder builder)
        {
            builder.Application.UseMiddleware<RequestLogDurationFilter>();
            return builder;
        }

        public static LoggingBuilder LogExceptions(this LoggingBuilder builder)
        {
            builder.Application.UseMiddleware<RequestLogExceptionFilter>();
            return builder;
        }

        public static LoggingBuilder LogNotFounds(this LoggingBuilder builder)
        {
            builder.Application.UseMiddleware<RequestLogNotFoundFilter>();
            return builder;
        }
    }
}
