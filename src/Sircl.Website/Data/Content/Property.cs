using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Sircl.Website.Data.Content
{
    /// <summary>
    /// Instance of a property type on a document.
    /// </summary>
    [Table(nameof(Property), Schema = "content")]
    public class Property
    {
        /// <summary>
        /// Identifier of the property instance.
        /// </summary>
        [Key]
        public virtual int Id { get; set; }

        /// <summary>
        /// Document the property instance belongs to.
        /// </summary>
        public virtual int DocumentId { get; set; }

        /// <summary>
        /// Document the property instance belongs to.
        /// </summary>
        [ForeignKey(nameof(DocumentId))]
        public virtual Document Document { get; set; }

        /// <summary>
        /// Type of the property instance.
        /// </summary>
        public virtual int? TypeId { get; set; }

        /// <summary>
        /// Type of the property instance.
        /// </summary>
        [ForeignKey(nameof(TypeId))]
        public virtual PropertyType Type { get; set; }

        ///// <summary>
        ///// Name of the property type.
        ///// </summary>
        //[NotMapped]
        //public virtual string Name { get => this.Type.Name; }

        ///// <summary>
        ///// Data type of the property.
        ///// </summary>
        //[NotMapped]
        //public virtual DataType DataType { get => this.Type.DataType; }

        /// <summary>
        /// Value of this property instance.
        /// </summary>
        public virtual string Value { get; set; }

        /// <summary>
        /// Json settings for this data type.
        /// The settings are passed to the ViewData of the EditorTemplates and DisplayTemplates.
        /// </summary>
        public virtual Dictionary<string, string> Settings { get; set; }

        /// <summary>
        /// Settings of this property combined with the settings of its type and datatype.
        /// </summary>
        [NotMapped]
        public Dictionary<string, object> CombinedSettings
        {
            get
            {
                var settings = this.Type?.CombinedSettings ?? new Dictionary<string, object>();
                if (this.Settings != null)
                {
                    foreach (var pair in this.Settings)
                    {
                        settings[pair.Key] = pair.Value;
                    }
                }
                return settings;
            }
        }
    }
}
