using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Data.Content
{
    /// <summary>
    /// Type of a document.
    /// </summary>
    [Table(nameof(DocumentType), Schema = "content")]
    public class DocumentType
    {
        /// <summary>
        /// Identifier of the document type.
        /// </summary>
        [Key]
        public virtual int Id { get; set; }

        /// <summary>
        /// Name of the document type.
        /// </summary>
        [Required, MaxLength(200)]
        public virtual string Name { get; set; }

        /// <summary>
        /// (Razor) view to use to render documents of this type.
        /// </summary>
        [MaxLength(200)]
        public virtual string ViewName { get; set; }

        /// <summary>
        /// Base document type of which this document type inherits property types.
        /// </summary>
        public virtual int? BaseId { get; set; }

        /// <summary>
        /// Base document type of which this document type inherits property types.
        /// </summary>
        public virtual DocumentType Base { get; set; }

        /// <summary>
        /// Whether documents can be instantiated from this document type.
        /// </summary>
        public virtual bool IsInstantiable { get; set; }

        /// <summary>
        /// Property types of this document type excluding the inheritted property types.
        /// </summary>
        [InverseProperty(nameof(PropertyType.DocumentType))]
        public virtual List<PropertyType> OwnPropertyTypes { get; set; } = new List<PropertyType>();

        /// <summary>
        /// Returns property types inheritted by base document type.
        /// </summary>
        public IList<PropertyType> GetInheritedPropertyTypes(ContentDbContext context)
        {
            context.Entry(this).Reference(dt => dt.Base).Load();
            if (this.Base == null)
            {
                return new List<PropertyType>();
            }
            else
            {
                return this.Base.AllPropertyTypes(context);
            }
        }

        /// <summary>
        /// Returns property types of this document type including the inheritted property types.
        /// Items are ordered according to the hierarchy (property types of root first), then by DisplayOrder.
        /// </summary>
        public IList<PropertyType> AllPropertyTypes(ContentDbContext context)
        {
            // Collect all inherited properties:
            var allPropertyTypes = this.GetInheritedPropertyTypes(context).ToList();
            // Then add owned properties one by one:
            context.Entry(this).Collection(dt => dt.OwnPropertyTypes).Load();
            foreach (var item in this.OwnPropertyTypes.OrderBy(pt => pt.DisplayOrder).ThenBy(pt => pt.Name))
            {
                // Remove overriden properties:
                allPropertyTypes.RemoveAll(pt => pt.Name == item.Name);
                // Add the property:
                allPropertyTypes.Add(item);
            }
            // Return result:
            return allPropertyTypes;
        }
    }
}
