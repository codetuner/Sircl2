using Sircl.Website.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardContent.Models.DocumentType
{
    public class EditModel : BaseEditModel<Data.Content.DocumentType>
    {
        public Data.Content.DocumentType[] DocumentTypes { get; internal set; }
        
        public Data.Content.DataType[] DataTypes { get; internal set; }
        
        public Dictionary<int, Data.Content.DataType> DataTypesDict { get; internal set; }

        public List<int> PropertyTypesToDelete { get; set; } = new();
    }
}
