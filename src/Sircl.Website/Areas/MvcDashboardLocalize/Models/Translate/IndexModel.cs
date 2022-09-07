using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardLocalize.Models.Translate
{
    public class IndexModel
    {
        public List<string> TranslationResponse { get; internal set; }
        public Exception Exception { get; internal set; }
    }
}
