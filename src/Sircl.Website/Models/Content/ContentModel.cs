using Sircl.Website.Data.Content;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Models.Content
{
    /// <summary>
    /// Model of a content document to render.
    /// </summary>
    public class ContentModel
    {
        /// <summary>
        /// The document to render content for.
        /// </summary>
        public Document Document { get; set; }
        
        /// <summary>
        /// Direct children (according to path) of the document rendering content for.
        /// </summary>
        public List<Document> Children { get; internal set; }

        /// <summary>
        /// All ancesters (according to path) up to the root of the document rendering content for.
        /// </summary>
        public List<Document> Ancestors { get; internal set; }

        /// <summary>
        /// Direct parents (according to path) of the document rendering content for.
        /// </summary>
        public IEnumerable<Document> Parents
        {
            get
            {
                return this.Ancestors.Where(a => a.PathSegmentsCount == this.Document.PathSegmentsCount - 1);
            }
        }
    }
}
