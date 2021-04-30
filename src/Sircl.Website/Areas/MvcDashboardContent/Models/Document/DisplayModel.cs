using Sircl.Website.Data;
using Sircl.Website.Data.Content;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardContent.Models.Document
{
    public class DisplayModel
    {
        public Data.Content.Document Item { get; internal set; }
        
        public Data.Content.DocumentType[] AllDocumentTypes { get; internal set; }
        
        public Dictionary<int, Data.Content.DocumentType> AllDocumentTypesDict { get; internal set; }
    }
}
