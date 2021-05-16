using Microsoft.AspNetCore.Mvc.Rendering;
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

        /// <summary>
        /// Returns all instantiable document types in hierarchy of the current one (all parent types and all child types).
        /// </summary>
        public List<SelectListItem> DocumentTypesInHierarchy
        {
            get
            {
                var list = new List<Data.Content.DocumentType>();
                var doct = this.DocumentType;
                while (doct != null)
                {
                    list.Add(doct);
                    doct = doct.BaseId.HasValue ? AllDocumentTypesDict[doct.BaseId.Value] : null;
                }
                var doctq = new Queue<Data.Content.DocumentType>();
                if (this.DocumentType != null) doctq.Enqueue(this.DocumentType);
                while (doctq.Count > 0)
                {
                    doct = doctq.Dequeue();
                    foreach (var subdoct in AllDocumentTypes.Where(t => t.BaseId == doct.Id))
                    {
                        list.Add(subdoct);
                        doctq.Enqueue(subdoct);
                    }
                }

                return list
                    .Where(dt => dt.IsInstantiable)
                    //.OrderBy(dt => dt.Name)
                    .Select(dt => new SelectListItem() { Value = dt.Id.ToString(), Text = dt.Name, Selected = (this.DocumentType.Id == dt.Id) })
                    .ToList();
            }
        }
    }
}
