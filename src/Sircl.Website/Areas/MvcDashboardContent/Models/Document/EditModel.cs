using Sircl.Website.Data;
using Sircl.Website.Data.Content;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardContent.Models.Document
{
    public class EditModel : BaseEditModel<Data.Content.Document>
    {
        public Data.Content.DocumentType[] AllDocumentTypes { get; internal set; }
        
        public Dictionary<int, Data.Content.DocumentType> AllDocumentTypesDict { get; internal set; }
        
        public Data.Content.DocumentType DocumentType { get; internal set; }
        
        public List<string> PathsList { get; internal set; }
        
        public IList<CultureInfo> SupportedUICultures { get; internal set; }
    }
}
