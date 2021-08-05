using Sircl.Website.Logging;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Data.Logging
{
    /// <summary>
    /// A request logging record.
    /// </summary>
    [Table(nameof(RequestLog), Schema = "logging")]
    public class RequestLog
    {
        /// <summary>
        /// Id of the log.
        /// </summary>
        [Key]
        public virtual int Id { get; set; }

        /// <summary>
        /// DateTime the request was initiated.
        /// </summary>
        public virtual DateTime Timestamp { get; set; }

        /// <summary>
        /// Trace identifier.
        /// </summary>
        public virtual string TraceIdentifier { get; set; }

        /// <summary>
        /// Duration of the request in milliseconds.
        /// </summary>
        public virtual long DurationMs { get; set; }

        /// <summary>
        /// Name of the log aspect.
        /// </summary>
        public virtual string AspectName { get; set; }

        /// <summary>
        /// [NotMapped] Log aspect.
        /// </summary>
        [NotMapped]
        public LogAspect Aspect
        {
            get
            { 
                return LogAspect.ByName(this.AspectName);
            }
            set
            {
                this.AspectName = value?.Name;
            }
        }

        /// <summary>
        /// Type information of the log. I.e. exception type.
        /// </summary>
        [MaxLength(2000)]
        public virtual string Type { get; set; }

        /// <summary>
        /// Host on which the log event was created.
        /// </summary>
        [Required, MaxLength(2000)]
        public virtual string Host { get; set; }

        /// <summary>
        /// Short message about the log.
        /// </summary>
        [MaxLength(2000)]
        public virtual string Message { get; set; }

        /// <summary>
        /// HTTP request method.
        /// </summary>
        [Required, MaxLength(20)]
        public virtual string Method { get; set; }

        /// <summary>
        /// URL of the logged request.
        /// </summary>
        [Required, MaxLength(2000)]
        public virtual string Url { get; set; }

        /// <summary>
        /// HTTP status code of the request response.
        /// </summary>
        public virtual int StatusCode { get; set; }

        /// <summary>
        /// User issuing the request.
        /// </summary>
        [Required, MaxLength(2000)]
        public virtual string User { get; set; }

        /// <summary>
        /// Details of the log. Exception information, stack trace, etc.
        /// </summary>
        public virtual string Details { get; set; }

        /// <summary>
        /// Data about this log record.
        /// </summary>
        public virtual Dictionary<string, string> Data { get; set; } = new();

        /// <summary>
        /// Data about the request (server variables, etc).
        /// </summary>
        public virtual Dictionary<string, string> Request { get; set; } = new();

        /// <summary>
        /// Whether this log is bookmarked.
        /// </summary>
        public virtual bool IsBookmarked { get; set; }
    }
}
