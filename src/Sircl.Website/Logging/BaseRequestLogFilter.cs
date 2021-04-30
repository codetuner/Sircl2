using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Logging
{
    public abstract class BaseRequestLogFilter
    {
        private readonly RequestDelegate _next;

        public BaseRequestLogFilter(RequestDelegate next)
        {
            _next = next;
        }
        
        public async Task InvokeAsync(HttpContext context, RequestLogger requestLogger)
        {
            PreInvoke(context, requestLogger);
            await _next(context);
            PostInvoke(context, requestLogger);
        }

        public abstract void PreInvoke(HttpContext context, RequestLogger requestLogger);

        public abstract void PostInvoke(HttpContext context, RequestLogger requestLogger);
    }
}
