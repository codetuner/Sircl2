using System;
using System.Collections.Generic;
using System.Text;

namespace Arebis.Core.AspNet.Localization
{
    /// <summary>
    /// Options of the Arebis Core Asp.NET localization component.
    /// </summary>
    public class LocalizationOptions
    {
        /// <summary>
        /// If set, path to which compiled localization data is stored and fetched.
        /// </summary>
        public string CompiledDataFileName { get; set; }
        
        /// <summary>
        /// Whether to allow setting the "__LocalizeFormat" query string parameter to overwrite default localization rendering.
        /// Meant for development only.
        /// </summary>
        public bool AllowLocalizeFormat { get; set; }

        /// <summary>
        /// Domains of localization.
        /// </summary>
        public string[] Domains { get; set; }
    }
}
