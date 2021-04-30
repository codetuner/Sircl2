using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Sircl.Website.Data.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sircl.Website.Logging
{
    public class RequestLogger
    {
        private RequestLog record = new();
        private Stopwatch stopwatch;
        private StringBuilder detailsBuilder = new();
        private bool doNotLog = false;

        public RequestLogger(IConfiguration configuration, LoggingDbContext context)
        {
            this.Context = context;
            this.Configuration = configuration;
        }

        public LoggingDbContext Context { get; private set; }

        public IConfiguration Configuration { get; private set; }

        public bool? StoreLog { get; set; }

        public long DurationMs => this.stopwatch.ElapsedMilliseconds;

        public void RequestStarted()
        {
            this.record.Timestamp = DateTime.UtcNow;
            this.stopwatch = Stopwatch.StartNew();
        }

        public void RequestEnded(HttpContext httpContext)
        {
            if (this.doNotLog == false && this.StoreLog == true)
            {
                // type, message

                // Add information:
                this.record.Details = this.detailsBuilder.ToString();
                this.record.DurationMs = this.stopwatch.ElapsedMilliseconds;
                this.record.Host = Environment.MachineName;
                this.record.TraceIdentifier = httpContext.TraceIdentifier;

                // Add request information:
                this.record.Method = httpContext.Request.Method;
                this.record.Url = httpContext.Request.Path;
                this.record.User = httpContext.User?.Identity?.Name;
                this.record.Request["QueryString"] = httpContext.Request.QueryString.Value;
                this.record.Request["Scheme"] = httpContext.Request.Scheme;
                foreach (var pair in httpContext.Request.Headers)
                {
                    this.record.Request["Header: " + pair.Key] = pair.Value;
                }
                foreach (var pair in httpContext.Request.Form)
                {
                    this.record.Request["Form: " + pair.Key] = pair.Value;
                }

                // Add response information:
                this.record.StatusCode = httpContext.Response.StatusCode;

                // Store the record:
                this.Context.RequestLogs.Add(this.record);
                this.Context.SaveChanges();
            }
        }

        public void DoNotLog()
        {
            this.doNotLog = true;
        }

        public string GetAspectName()
        {
            return this.record.AspectName;
        }

        public RequestLogger SetAspectName(string aspectName, bool @override)
        {
            if (!doNotLog) if (this.record.AspectName == null || @override) this.record.AspectName = aspectName;
            return this;
        }

        public RequestLogger SetAspectNameOverriding(string aspectName, string aspectNameToOverride)
        {
            if (!doNotLog) if (this.record.AspectName == null || this.record.AspectName == aspectNameToOverride) this.record.AspectName = aspectName;
            return this;
        }

        public RequestLogger WriteLine(string line)
        {
            if (!doNotLog) this.detailsBuilder.AppendLine(line);
            return this;
        }

        public RequestLogger WithData(string key, string value)
        {
            if (!doNotLog) this.record.Data[key] = value;
            return this;
        }
    }
}
