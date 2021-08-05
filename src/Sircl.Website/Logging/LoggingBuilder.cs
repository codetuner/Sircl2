using Microsoft.AspNetCore.Builder;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Logging
{
    public class LoggingBuilder
    {
        public LoggingBuilder(IApplicationBuilder application)
        {
            this.Application = application;
        }

        public IApplicationBuilder Application { get; set; }
    }
}
