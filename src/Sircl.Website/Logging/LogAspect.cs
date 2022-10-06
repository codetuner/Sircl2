using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Logging
{
    /// <summary>
    /// Log aspects.
    /// </summary>
    public class LogAspect
    {
        #region Class definition

        private static Dictionary<string, LogAspect> aspects = new();

        /// <summary>
        /// Get the LogAspect instance by name. Null if not defined.
        /// </summary>
        public static LogAspect ByName(string name)
        {
            if (aspects.TryGetValue(name, out LogAspect result))
            {
                return result;
            }
            else
            {
                return null;
            }
        }

        private LogAspect(string name, string htmlClass, string htmlStyle, string htmlIcon, string htmlColor)
        {
            this.Name = name;
            this.HtmlClass = htmlClass;
            this.HtmlStyle = htmlStyle;
            this.HtmlIcon = htmlIcon;
            this.HtmlColor = htmlColor;
            aspects[name] = this;
        }

        /// <summary>
        /// Aspect name.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// HTML class name.
        /// </summary>
        public string HtmlClass { get; set; }

        /// <summary>
        /// HTML styling information.
        /// </summary>
        public string HtmlStyle { get; set; }

        /// <summary>
        /// HTML icon source code.
        /// </summary>
        public string HtmlIcon { get; set; }

        /// <summary>
        /// HTML color code.
        /// </summary>
        public string HtmlColor { get; set; }

        #endregion

        /// <summary>
        /// Log aspect to mark requests informational logging.
        /// </summary>
        public static readonly LogAspect Information = new LogAspect("Information", "aspect-information", "", "<i class=\"fas fa-info\"></i>", "#9AC8EB");

        /// <summary>
        /// Log aspect to mark requests demanding attention.
        /// </summary>
        public static readonly LogAspect Attention = new LogAspect("Attention", "aspect-attention", "", "<i class=\"fas fa-exclamation-triangle\"></i>", "#E5DB9C");

        /// <summary>
        /// Log aspect to mark requests with possible timing issue.
        /// </summary>
        public static readonly LogAspect Timing = new LogAspect("Timing", "aspect-timing", "", "<i class=\"fas fa-stopwatch\"></i>", "#F7F6CF");

        /// <summary>
        /// Log aspect to mark requests with possible security issue.
        /// </summary>
        public static readonly LogAspect Security = new LogAspect("Security", "aspect-security", "", "<i class=\"fas fa-shield-alt\"></i>", "#26474E");

        /// <summary>
        /// Log aspect to mark requests resulting in a 404 Not Found error.
        /// </summary>
        public static readonly LogAspect NotFound = new LogAspect("NotFound", "aspect-notfound", "", "<i class=\"fas fa-search\"></i>", "#F4CFDF");

        /// <summary>
        /// Log aspect to mark requests resulting in an error.
        /// </summary>
        public static readonly LogAspect Error = new LogAspect("Error", "aspect-error", "", "<i class=\"fas fa-bug\"></i>", "#744622");
    }
}
